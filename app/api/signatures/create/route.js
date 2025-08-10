import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import { renderDraftPDF } from '../../../../lib/signatures/pdf/renderDraft';
import { uploadBufferToBucket } from '../../../../lib/signatures/storage/supabase';
import SignatureContract from '../../../../models/SignatureContract';
import { getUser } from '../../../lib/auth';
import User from '../../../models/User';
import Client from '../../../models/Client';
import Property from '../../../models/Property';

export async function POST(request) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await connectDB();

    const body = await request.json();
    const { transactionType, clientId, propertyIds = [], commissionText } = body;

    const agent = await User.findById(user.userId).lean();
    const client = clientId ? await Client.findOne({ _id: clientId, userId: user.userId }).lean() : null;
    const props = await Property.find({ _id: { $in: propertyIds }, user: user.userId }).lean();

    const buffer = await renderDraftPDF({ agent, client, properties: props, transactionType, commissionText });
    const path = `drafts/${user.userId}-${Date.now()}.pdf`;
    const draftUrl = await uploadBufferToBucket(path, buffer, 'application/pdf');

    const createDoc = {
      agentId: user.userId,
      propertyIds,
      transactionType,
      commissionText,
      files: { draftUrl }
    };
    if (clientId) createDoc.clientId = clientId;
    const contract = await SignatureContract.create(createDoc);

    return NextResponse.json({ contractId: contract._id, draftUrl });
  } catch (e) {
    console.error('create signature error', e);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

