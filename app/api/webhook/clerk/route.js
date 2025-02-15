import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import Agent from '@/app/models/Agent';

export async function POST(request) {
  try {
    const headerPayload = headers();
    const svix_id = headerPayload.get("svix-id");
    const svix_timestamp = headerPayload.get("svix-timestamp");
    const svix_signature = headerPayload.get("svix-signature");

    if (!svix_id || !svix_timestamp || !svix_signature) {
      return NextResponse.json({ error: 'Missing Svix headers' }, { status: 400 });
    }

    const payload = await request.json();
    const body = JSON.stringify(payload);

    const webhookSecret = process.env.WEBHOOK_SECRET;
    if (!webhookSecret) {
      return NextResponse.json({ error: 'Missing webhook secret' }, { status: 400 });
    }

    const event = new WebhookEvent({
      id: svix_id,
      timestamp: svix_timestamp,
      signature: svix_signature,
      body,
      secret: webhookSecret,
    });

    const { id, email_addresses, ...attributes } = event.data;

    await connectDB();

    // Handle user creation
    if (event.type === 'user.created') {
      const agent = await Agent.create({
        clerkId: id,
        email: email_addresses[0]?.email_address,
        fullName: `${attributes.first_name || ''} ${attributes.last_name || ''}`.trim(),
        isApproved: false,
      });
      return NextResponse.json({ message: 'Agent created', agent });
    }

    // Handle user update
    if (event.type === 'user.updated') {
      const agent = await Agent.findOneAndUpdate(
        { clerkId: id },
        {
          email: email_addresses[0]?.email_address,
          fullName: `${attributes.first_name || ''} ${attributes.last_name || ''}`.trim(),
        },
        { new: true }
      );
      return NextResponse.json({ message: 'Agent updated', agent });
    }

    // Handle user deletion
    if (event.type === 'user.deleted') {
      const agent = await Agent.findOneAndDelete({ clerkId: id });
      return NextResponse.json({ message: 'Agent deleted', agent });
    }

    return NextResponse.json({ message: 'Webhook received' });
  } catch (error) {
    console.error('Error in webhook:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 