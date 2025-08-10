import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import crypto from 'crypto';

export async function finalizePDF({ draftBuffer, signer, signaturePngBuffer, meta }) {
  const pdfDoc = await PDFDocument.load(draftBuffer);
  const page = pdfDoc.getPages()[0];
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Stamp signer details near placeholders
  const draw = (text, x, y, size = 12) => page.drawText(String(text || ''), { x, y, size, font, color: rgb(0,0,0) });
  draw(signer.legalName, 300, 200);
  draw(signer.idNumber, 300, 185);
  draw(signer.address, 300, 170);
  draw(signer.date, 300, 155);

  // Stamp signature image
  if (signaturePngBuffer) {
    const sigImg = await pdfDoc.embedPng(signaturePngBuffer);
    page.drawImage(sigImg, { x: 300, y: 125, width: 120, height: 40 });
  }

  // Append audit page
  const audit = pdfDoc.addPage([595.28, 841.89]);
  const write = (t, x, y, s=12)=>audit.drawText(String(t||''),{x,y,s,font,color:rgb(0,0,0)});
  write('Audit Summary', 40, 800, 16);
  write(`Signer: ${signer.legalName}`, 40, 780);
  write(`ID: ${signer.idNumber}`, 40, 765);
  write(`Address: ${signer.address}`, 40, 750);
  write(`IP: ${meta?.ip || ''}`, 40, 730);
  write(`UA: ${meta?.ua || ''}`, 40, 715);
  write(`Timestamp: ${new Date().toISOString()}`, 40, 700);

  const finalBytes = await pdfDoc.save();
  const sha256 = crypto.createHash('sha256').update(finalBytes).digest('hex');
  return { buffer: Buffer.from(finalBytes), sha256 };
}

