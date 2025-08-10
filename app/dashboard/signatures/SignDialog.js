'use client';
import { useEffect, useRef, useState } from 'react';

export default function SignDialog({ open, onClose, onSubmit }) {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const drawingRef = useRef(false);
  const lastRef = useRef({ x: 0, y: 0 });
  const [form, setForm] = useState({ legalName: '', idNumber: '', address: '', date: '' , consent: false});

  useEffect(() => {
    if (!open) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#111';
    ctxRef.current = ctx;
  }, [open]);

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    if (e.touches && e.touches[0]) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const start = (e) => {
    drawingRef.current = true;
    lastRef.current = getPos(e);
  };
  const move = (e) => {
    if (!drawingRef.current) return;
    const pos = getPos(e);
    const ctx = ctxRef.current;
    ctx.beginPath();
    ctx.moveTo(lastRef.current.x, lastRef.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastRef.current = pos;
    e.preventDefault();
  };
  const end = () => { drawingRef.current = false; };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6" dir="rtl" onClick={e=>e.stopPropagation()}>
        <h3 className="text-xl font-semibold mb-4">חתימה דיגיטלית</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <input className="border p-2 rounded text-black" placeholder="שם מלא" value={form.legalName} onChange={e=>setForm({...form, legalName:e.target.value})} />
          <input className="border p-2 rounded text-black" placeholder="ת.ז" value={form.idNumber} onChange={e=>setForm({...form, idNumber:e.target.value})} />
          <input className="border p-2 rounded text-black sm:col-span-2" placeholder="כתובת" value={form.address} onChange={e=>setForm({...form, address:e.target.value})} />
          <input className="border p-2 rounded text-black" type="date" value={form.date} onChange={e=>setForm({...form, date:e.target.value})} />
        </div>
        <label className="flex items-start gap-2 mb-3 text-sm">
          <input type="checkbox" checked={form.consent} onChange={e=>setForm({...form, consent:e.target.checked})} />
          <span>אני מאשר/ת כי הפרטים נכונים וכי אני חותם/ת אלקטרונית בהתאם לחוק החתימה האלקטרונית.</span>
        </label>
        <div className="border rounded p-2 mb-4">
          <canvas
            ref={canvasRef}
            className="w-full h-40 bg-gray-50 touch-none"
            onMouseDown={start}
            onMouseMove={move}
            onMouseUp={end}
            onMouseLeave={end}
            onTouchStart={start}
            onTouchMove={move}
            onTouchEnd={end}
          />
          <div className="mt-2 flex gap-2">
            <button className="px-3 py-1 text-sm bg-gray-100 rounded" onClick={()=>{ const c=canvasRef.current; const ctx=ctxRef.current; if(c&&ctx){ ctx.clearRect(0,0,c.width,c.height);} }}>נקה</button>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button className="px-4 py-2 rounded bg-gray-100" onClick={onClose}>סגור</button>
          <button className="px-4 py-2 rounded bg-blue-600 text-white" onClick={() => {
            if (!form.consent) return alert('חובה לאשר את ההצהרה');
            const dataUrl = canvasRef.current?.toDataURL('image/png');
            onSubmit({ ...form, signaturePng: dataUrl });
          }}>שלח</button>
        </div>
      </div>
    </div>
  );
}

