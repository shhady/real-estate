import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

const DEFAULT_HEB_FONT = 'https://github.com/googlefonts/noto-fonts/raw/main/hinted/ttf/NotoSansHebrew/NotoSansHebrew-Regular.ttf';

export async function renderDraftPDF({ agent, client, properties, transactionType, commissionText, locale = 'he' }) {
  const pdfDoc = await PDFDocument.create();
  if (typeof pdfDoc.registerFontkit === 'function') {
    pdfDoc.registerFontkit(fontkit);
  } else if (typeof PDFDocument.registerFontkit === 'function') {
    PDFDocument.registerFontkit(fontkit);
  }
  const page = pdfDoc.addPage([595.28, 841.89]); // A4
  const { width } = page.getSize();
  // Load a Hebrew-capable font (TTF)
  const fontUrl = process.env.PDF_HEBREW_FONT_URL || DEFAULT_HEB_FONT;
  const fontBytes = await fetch(fontUrl).then(r => r.arrayBuffer());
  const font = await pdfDoc.embedFont(new Uint8Array(fontBytes), { subset: true });

  const margin = 40;
  const isHebrew = (s) => /[\u0590-\u05FF]/.test(s);
  const reverseHebrewSegments = (word) => {
    return String(word || '')
      .split(/([\u0590-\u05FF]+)/)
      .map(seg => (/^[\u0590-\u05FF]+$/.test(seg) ? seg.split('').reverse().join('') : seg))
      .join('');
  };
  const processRTL = (text) => String(text || '').split(' ').map(p => reverseHebrewSegments(p)).join(' ');
  const drawRTL = (text, y, size = 12, mRight = margin) => {
    const parts = String(text || '').split(' ');
    const processed = parts.map(p => reverseHebrewSegments(p));
    const spaceW = font.widthOfTextAtSize(' ', size);
    let totalW = 0;
    processed.forEach((t, i) => {
      totalW += font.widthOfTextAtSize(t, size);
      if (i < processed.length - 1) totalW += spaceW;
    });
    let x = width - mRight - totalW;
    processed.forEach((t, i) => {
      page.drawText(t, { x, y, size, font, color: rgb(0, 0, 0) });
      x += font.widthOfTextAtSize(t, size);
      if (i < processed.length - 1) x += spaceW;
    });
  };
  const drawRTLPlain = (text, y, size = 12, mRight = margin) => {
    const content = processRTL(text);
    const textWidth = font.widthOfTextAtSize(content, size);
    const x = width - mRight - textWidth;
    page.drawText(content, { x, y, size, font, color: rgb(0, 0, 0) });
  };
  const drawRTLCentered = (text, y, size = 14) => {
    const parts = String(text || '').split(' ');
    const processed = parts.map(p => reverseHebrewSegments(p));
    const spaceW = font.widthOfTextAtSize(' ', size);
    let totalW = 0;
    processed.forEach((t, i) => {
      totalW += font.widthOfTextAtSize(t, size);
      if (i < processed.length - 1) totalW += spaceW;
    });
    let x = (width - totalW) / 2;
    processed.forEach((t, i) => {
      page.drawText(t, { x, y, size, font, color: rgb(0, 0, 0) });
      x += font.widthOfTextAtSize(t, size);
      if (i < processed.length - 1) x += spaceW;
    });
  };
  const drawCheckbox = (xRight, y, size = 10) => {
    page.drawRectangle({ x: xRight - size, y, width: size, height: size, borderColor: rgb(0,0,0), borderWidth: 1 });
  };

  // Header block (agent details)
  drawRTL(agent?.agencyName || 'סוכנות', 800, 16);
  drawRTL(agent?.fullName || 'שם הסוכן', 780, 12);
  drawRTL(`מס׳ רישיון: ${agent?.licenseNumber || ''}`, 765, 10);
  drawRTL(`טלפון: ${agent?.phone || ''}`, 750, 10);

  // Title & subtitle
  drawRTLCentered('הזמנת שירותי תיווך בבלעדיות', 720, 18);
  drawRTLCentered('(על פי חוק המתווכים במקרקעין)', 702, 11);

  // Intro lines
  drawRTL('אנו פונים ל"_________________" / או באמצעות נציגם, שם: ________________________', 675, 12);
  drawRTL('ת.ז. _______________________   מס׳ רישיון ________________________________', 657, 12);
  drawRTL('(להלן ביחד ולחוד: "המתווך") ו/או עובדיו ו/או מי מטעמו.', 639, 11);
  drawRTL('לקבלת שירותי תיווך עבור הנכס/ים הרשומים להלן ונדווח לכם על כל מו"מ או הצעה בקשר לעסקה לגביהן', 621, 11);

  // Section 1: client details
  drawRTL('1) פרטי הלקוח:', 596, 12);
  drawRTL('שם: _________________________   ת.ז.: _________________________', 578, 12);
  drawRTL('שם: _________________________   ת.ז.: _________________________', 560, 12);
  drawRTL('כתובת: _____________________________   טלפון: ____________________________', 542, 12);
  drawRTL('נייד: ___________________', 524, 12);

  // Section 2: transaction type + property description
  drawRTL('2) סוג העסקה:', 499, 12);
  const cbY = 481;
  drawCheckbox(width - margin - 40, cbY, 10); // מכירה
  drawRTL('מכירה', cbY + 1, 12, margin + 60);
  drawCheckbox(width - margin - 130, cbY, 10); // השכרה
  drawRTL('השכרה', cbY + 1, 12, margin + 150);
  drawRTL('ותיאור הנכס: גוש ________ חלקה ________ תת חלקה ________', 460, 12);

  // Section 3: declaration
  drawRTL('3) הצהרה: אני הח"מ מצהיר בזה כי אני בעל הזכויות בנכס ו/או מוסמך מטעמו של בעל הזכויות בנכס למכור/להשכיר את הנכס.', 435, 11);

  // Table: headers and rows
  const tableTop = 410;
  const tableLeft = margin;
  const tableWidth = width - margin * 2;
  const rowHeight = 28;
  const rows = 4; // header + 3 rows
  const cols = [0.16, 0.22, 0.26, 0.22, 0.14]; // from right: סוג הנכס | כתובת | שם הבעלים | מחיר בקירוב | חתימה
  const colWidths = cols.map(c => c * tableWidth);
  // Outer border
  page.drawRectangle({ x: tableLeft, y: tableTop - rowHeight * rows, width: tableWidth, height: rowHeight * rows, borderColor: rgb(0,0,0), borderWidth: 1 });
  // Horizontal lines
  for (let i = 1; i < rows; i++) {
    page.drawRectangle({ x: tableLeft, y: tableTop - rowHeight * i, width: tableWidth, height: 0.8, color: rgb(0,0,0) });
  }
  // Vertical lines (left to right)
  let vx = tableLeft;
  for (let i = 0; i < colWidths.length - 1; i++) {
    vx += colWidths[i];
    page.drawRectangle({ x: vx, y: tableTop - rowHeight * rows, width: 0.8, height: rowHeight * rows, color: rgb(0,0,0) });
  }
  // Header labels (RTL, right-aligned per cell)
  const headerLabels = ['סוג הנכס', 'כתובת', 'שם הבעלים', 'מחיר מבוקש בקירוב', 'חתימה'];
  let cellRight = tableLeft + tableWidth;
  for (let i = 0; i < colWidths.length; i++) {
    const cellWidth = colWidths[i];
    const label = headerLabels[i];
    const content = processRTL(label);
    const size = 11;
    const tW = font.widthOfTextAtSize(content, size);
    const x = cellRight - 6 - tW;
    page.drawText(content, { x, y: tableTop - 18, size, font, color: rgb(0,0,0) });
    cellRight -= cellWidth;
  }

  // Fill up to 3 rows with selected properties
  const propsToShow = Array.isArray(properties) ? properties.slice(0, 3) : [];
  for (let r = 0; r < propsToShow.length; r++) {
    const py = tableTop - rowHeight * (r + 1) - 18;
    const prop = propsToShow[r] || {};
    const values = [
      String(prop.type || prop.category || ''),
      String(prop.location || prop.address || ''),
      String(prop.ownerName || ''),
      `₪${Number(prop.price || 0).toLocaleString('he-IL')}`,
      ''
    ];
    let right = tableLeft + tableWidth;
    for (let i = 0; i < colWidths.length; i++) {
      const cellWidth = colWidths[i];
      const value = values[i] || '';
      const content = processRTL(value);
      const size = 10;
      const tW = font.widthOfTextAtSize(content, size);
      const x = right - 6 - tW;
      page.drawText(content, { x, y: py, size, font, color: rgb(0,0,0) });
      right -= cellWidth;
    }
  }

  // Section 4: brokerage fees
  drawRTL('4) דמי התיווך: ישולמו מיד לאחר התקשרות הצדדים שבאמצעותכם בהסכם מחייב כלשהו:', 360, 12);
  drawRTL('א. מכירה/קניה: 2% ממחיר העסקה.', 340, 12);
  drawRTL('ב. השכרה: שווי של חודש שכירות שנתית. (לסכומים כאמור יתווסף מע"מ לפי שיעורו כחוק) אם אמכור את המושכר תוך תקופת השכירות או אחריה הנני מתחייב/ת לשלם לכם שכר נוסף בשיעור 2% מהסכום הכולל של העסקה.', 322, 11);

  // Section 5: exclusivity
  drawRTL('5) בלעדיות: תחול בתאריך _____________ עד תאריך: ______________ (להלן תקופת הבלעדיות).', 295, 12);

  // Signature placeholders
  drawRTL('שם מלא: ____________________________', 200, 12);
  drawRTL('ת.ז.: ____________________________', 185, 12);
  drawRTL('כתובת: ____________________________', 170, 12);
  drawRTL('תאריך: ____________________________', 155, 12);
  drawRTL('חתימה: ____________________________', 140, 12);

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

