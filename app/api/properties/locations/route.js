export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Property from '../../../models/Property';

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const country = (searchParams.get('country') || '').trim();

    const match = { approved: true };
    if (country) {
      match.country = country;
    }

    const locations = await Property.distinct('location', match);
    const clean = (locations || [])
      .filter(Boolean)
      .map(String)
      .sort((a, b) => a.localeCompare(b, 'he-IL'));

    return NextResponse.json({ locations: clean });
  } catch (err) {
    console.error('Error fetching property locations:', err);
    return NextResponse.json({ locations: [] }, { status: 500 });
  }
}

