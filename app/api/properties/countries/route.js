import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Property from '../../../models/Property';

export async function GET() {
  try {
    await connectDB();
    const countries = await Property.distinct('country', { approved: true });
    const clean = (countries || []).filter(Boolean).map(String).sort((a, b) => a.localeCompare(b, 'he-IL'));
    return NextResponse.json({ countries: clean });
  } catch (err) {
    console.error('Error fetching property countries:', err);
    return NextResponse.json({ countries: [] }, { status: 500 });
  }
}

