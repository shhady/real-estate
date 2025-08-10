import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import SignatureContract from '../../../../models/SignatureContract';
import { finalizePDF } from '../../../../lib/signatures/pdf/finalize';
import { uploadBufferToBucket } from '../../../../lib/signatures/storage/supabase';

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { contractId, legalName, idNumber, address, date, signaturePng } = body;
    const contract = await SignatureContract.findById(contractId);
    if (!contract) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Fetch draft PDF
    const draftRes = await fetch(contract.files.draftUrl);
    const draftBuffer = Buffer.from(await draftRes.arrayBuffer());
    const signaturePngBuffer = signaturePng ? Buffer.from(signaturePng.split(',')[1], 'base64') : null;
    const meta = { ip: request.headers.get('x-forwarded-for') || '', ua: request.headers.get('user-agent') || '' };
    const { buffer: finalBuffer, sha256 } = await finalizePDF({ draftBuffer, signer: { legalName, idNumber, address, date }, signaturePngBuffer, meta });
    const path = `final/${contract.agentId}-${contract._id}-${Date.now()}.pdf`;
    const finalUrl = await uploadBufferToBucket(path, finalBuffer, 'application/pdf');

    contract.files.finalUrl = finalUrl;
    contract.files.sha256 = sha256;
    contract.status = 'completed';
    contract.audit.push({ ev: 'signed', by: 'client', ip: meta.ip, ua: meta.ua, ts: new Date() });
    await contract.save();

    return NextResponse.json({ finalUrl, sha256 });
  } catch (e) {
    console.error('sign error', e);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

