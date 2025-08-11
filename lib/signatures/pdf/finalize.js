import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import crypto from 'crypto';

export async function finalizePDF({ draftBuffer, signer, signaturePngBuffer, meta }) {
  const pdfDoc = await PDFDocument.load(draftBuffer);
  const page = pdfDoc.getPages()[0];
  const { width } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Stamp signer details near placeholders
  const draw = (text, x, y, size = 12) => page.drawText(String(text || ''), { x, y, size, font, color: rgb(0,0,0) });
  // Align to the right-side placeholders created in draft
  // These y positions correspond to the lines rendered in renderDraft.js
  const rightMargin = 40;
  const textBoxWidth = 220;
  const rightTextX = width - rightMargin - textBoxWidth;
  draw(signer.legalName, rightTextX, 200);
  draw(signer.idNumber, rightTextX, 185);
  draw(signer.address, rightTextX, 170);
  draw(signer.date, rightTextX, 155);

  // Stamp signature image
  if (signaturePngBuffer) {
    const sigImg = await pdfDoc.embedPng(signaturePngBuffer);
    // 1) Place over the "חתימה: ________" line (right side)
    // Use a fixed band where the underscores reside (~220pt wide starting ~40pt from right margin)
    const sigW = 180;
    const sigH = 36;
    const sigX = width - rightMargin - 220; // start deeper from the right so it sits on the line underscores
    const sigY = 136; // baseline in draft ~140 → place slightly below so the stroke rides the line
    page.drawImage(sigImg, { x: sigX, y: sigY, width: sigW, height: sigH });

    // 2) Also place a small signature in the first row's "חתימה" table cell
    const margin = 40;
    const tableTop = 410;
    const rowHeight = 28;
    const tableWidth = width - margin * 2;
    const cols = [0.16, 0.22, 0.26, 0.22, 0.14]; // from right → last is חתימה (left-most)
    const colWidths = cols.map(c => c * tableWidth);
    const signatureCellLeftX = margin; // left-most cell
    const signatureCellWidth = colWidths[4];
    const rowTopY = tableTop - rowHeight; // first data row (below header)
    const rowBottomY = rowTopY - rowHeight;
    const cellSigW = Math.min(signatureCellWidth - 10, 90);
    const cellSigH = 18;
    const cellSigX = signatureCellLeftX + 5;
    const cellSigY = rowBottomY + (rowHeight - cellSigH) / 2;
    page.drawImage(sigImg, { x: cellSigX, y: cellSigY, width: cellSigW, height: cellSigH });
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

