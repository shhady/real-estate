'use client';
import { useEffect, useState } from 'react';
import SignDialog from './SignDialog';

export default function SignaturesPage() {
  const [agent, setAgent] = useState(null);
  const [clients, setClients] = useState([]);
  const [properties, setProperties] = useState([]);
  const [form, setForm] = useState({ transactionType: 'sale', clientId: '', propertyIds: [], commissionText: '' });
  const [draft, setDraft] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [extra, setExtra] = useState({
    officialClientName: '',
    address: '',
    phone: '',
    mobile: '',
    tableType: '',
    gush: '',
    helka: '',
    tatHelka: '',
    tableAddress: '',
    tableOwnerName: '',
    tableAskingPrice: '',
    exclusivityStart: '',
    exclusivityEnd: '',
    agentSignatureDataUrl: ''
  });

  useEffect(() => {
    (async () => {
      try {
        const u = await fetch('/api/users/profile', { cache: 'no-store' }).then(r=>r.json());
        setAgent(u);
      } catch {}
      try {
        const c = await fetch('/api/clients', { cache: 'no-store' }).then(r=>r.json());
        setClients(Array.isArray(c) ? c : []);
      } catch {}
      try {
        const p = await fetch('/api/properties/my-properties', { cache: 'no-store' }).then(r=>r.json());
        setProperties(Array.isArray(p) ? p : []);
      } catch {}
    })();
  }, []);

  const generateDraft = async () => {
    const res = await fetch('/api/signatures/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    if (!res.ok) return alert('יצירת טיוטה נכשלה');
    const data = await res.json();
    setDraft(data);
    setPreviewUrl(data.draftUrl || '');
    setShowPreview(true);
  };

  const openSign = () => setDialogOpen(true);

  const submitSign = async (payload) => {
    setDialogOpen(false);
    const res = await fetch('/api/signatures/sign', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contractId: draft?.contractId, ...payload }) });
    if (!res.ok) return alert('חתימה נכשלה');
    const data = await res.json();
    if (data.finalUrl) window.open(data.finalUrl, '_blank');
  };

  return (
    <div className="max-w-6xl mx-auto p-6" dir="rtl">
      <h1 className="text-2xl font-bold mb-4">חתימות דיגיטליות</h1>
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">סוג עסקה</label>
            <select className="w-full border rounded p-2 text-black" value={form.transactionType} onChange={e=>setForm({...form, transactionType:e.target.value})}>
              <option value="sale">מכירה</option>
              <option value="purchase">קניה</option>
              <option value="rent_tenant">שכירות - שוכר</option>
              <option value="rent_landlord">שכירות - משכיר</option>
            </select>
          </div>
          {(form.transactionType !== 'sale' && form.transactionType !== 'rent_landlord') && (
            <div>
              <label className="block text-sm text-gray-600 mb-1">לקוח</label>
              <select className="w-full border rounded p-2 text-black" value={form.clientId} onChange={e=>setForm({...form, clientId:e.target.value})}>
                <option value="">בחר לקוח</option>
                {clients.map(c=> (<option key={c._id} value={c._id}>{c.clientName}</option>))}
              </select>
            </div>
          )}
          <div className="md:col-span-2">
            <label className="block text-sm text-gray-600 mb-1">נכסים</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {properties.map(p=> (
                <label key={p._id} className="flex items-center gap-2 border rounded p-2">
                  <input type="checkbox" checked={form.propertyIds.includes(p._id)} onChange={e=>{
                    setForm(prev=> ({...prev, propertyIds: e.target.checked ? [...prev.propertyIds, p._id] : prev.propertyIds.filter(id=>id!==p._id)}));
                  }} />
                  <span className="text-sm text-gray-800">{p.title} • {p.location}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm text-gray-600 mb-1">עמלה</label>
            <input className="w-full border rounded p-2 text-black" placeholder='2% + מע״מ' value={form.commissionText} onChange={e=>setForm({...form, commissionText:e.target.value})} />
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <button className="px-4 py-2 rounded bg-blue-600 text-white" onClick={generateDraft}>צור טיוטה</button>
          {draft?.draftUrl && <button className="px-4 py-2 rounded bg-green-600 text-white" onClick={openSign}>פתח חלון חתימה</button>}
        </div>
      </div>

      {showPreview && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-black">
          <div className="bg-white rounded shadow p-4 space-y-3 lg:col-span-1" dir="rtl">
            <h3 className="font-semibold">שדות חסרים (טיוטה למוכר)</h3>
            <label className="block text-sm">שם לקוח (רשמי)
              <input className="w-full border rounded p-2 text-black" value={extra.officialClientName} onChange={e=>setExtra({...extra, officialClientName:e.target.value})} />
            </label>
            <label className="block text-sm">כתובת
              <input className="w-full border rounded p-2 text-black" value={extra.address} onChange={e=>setExtra({...extra, address:e.target.value})} />
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label className="block text-sm">טלפון
                <input className="w-full border rounded p-2 text-black" value={extra.phone} onChange={e=>setExtra({...extra, phone:e.target.value})} />
              </label>
              <label className="block text-sm">נייד
                <input className="w-full border rounded p-2 text-black" value={extra.mobile} onChange={e=>setExtra({...extra, mobile:e.target.value})} />
              </label>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <label className="block text-sm">גוש
                <input className="w-full border rounded p-2 text-black" value={extra.gush} onChange={e=>setExtra({...extra, gush:e.target.value})} />
              </label>
              <label className="block text-sm">חלקה
                <input className="w-full border rounded p-2 text-black" value={extra.helka} onChange={e=>setExtra({...extra, helka:e.target.value})} />
              </label>
              <label className="block text-sm">תת חלקה
                <input className="w-full border rounded p-2 text-black" value={extra.tatHelka} onChange={e=>setExtra({...extra, tatHelka:e.target.value})} />
              </label>
            </div>
            <label className="block text-sm">כתובת (לטבלה)
              <input className="w-full border rounded p-2 text-black" value={extra.tableAddress} onChange={e=>setExtra({...extra, tableAddress:e.target.value})} />
            </label>
            <label className="block text-sm">סוג נכס (לטבלה)
              <input className="w-full border rounded p-2 text-black" value={extra.tableType} onChange={e=>setExtra({...extra, tableType:e.target.value})} />
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label className="block text-sm">שם הבעלים
                <input className="w-full border rounded p-2 text-black" value={extra.tableOwnerName} onChange={e=>setExtra({...extra, tableOwnerName:e.target.value})} />
              </label>
              <label className="block text-sm">מחיר מבוקש (בקירוב)
                <input className="w-full border rounded p-2 text-black" value={extra.tableAskingPrice} onChange={e=>setExtra({...extra, tableAskingPrice:e.target.value})} />
              </label>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <label className="block text-sm">בלעדיות - מתחיל
                <input type="date" className="w-full border rounded p-2 text-black" value={extra.exclusivityStart} onChange={e=>setExtra({...extra, exclusivityStart:e.target.value})} />
              </label>
              <label className="block text-sm">בלעדיות - עד
                <input type="date" className="w-full border rounded p-2 text-black" value={extra.exclusivityEnd} onChange={e=>setExtra({...extra, exclusivityEnd:e.target.value})} />
              </label>
            </div>
            <div>
              <span className="block text-sm mb-1">חתימת המתווך</span>
              <AgentSignaturePad value={extra.agentSignatureDataUrl} onChange={(data)=>setExtra({...extra, agentSignatureDataUrl:data})} />
            </div>
          </div>
          <div className="lg:col-span-2">
            <AgreementPreview agent={agent} client={clients.find(c=>c._id===form.clientId)} selectedProps={properties.filter(p=>form.propertyIds.includes(p._id))} form={form} extra={extra} />
          </div>
        </div>
      )}

      <SignDialog open={dialogOpen} onClose={()=>setDialogOpen(false)} onSubmit={submitSign} />
    </div>
  );
}

function AgreementPreview({ agent, client, selectedProps, form, extra }) {
  return (
    <div className="bg-white rounded shadow p-6 space-y-4 text-black" dir="rtl">
      <div className="flex items-start justify-between">
        <img src={agent?.logo?.secure_url || '/logo-original.JPEG'} alt="logo" className="w-20 h-20 object-contain" />
        <div className="text-center flex-1">
          <h2 className="text-xl font-bold">הזמנת שירותי תיווך בבלעדיות</h2>
          <p className="text-sm text-gray-600">(על פי חוק המתווכים במקרקעין)</p>
        </div>
        <div className="text-sm text-right min-w-56">
          <div className="font-semibold">{agent?.agencyName || 'סוכנות'}</div>
          <div>{agent?.fullName || 'שם הסוכן'}</div>
          <div>מס׳ רישיון: {agent?.licenseNumber || '__________'}</div>
          <div>טלפון: {agent?.phone || '__________'}</div>
        </div>
      </div>

      <p className="text-sm">
        אנו פונים ל"_________________" / או באמצעות נציגם, שם: ________________________
      </p>
      <p className="text-sm">ת.ז. _______________________   מס׳ רישיון ________________________________</p>
      <p className="text-sm">(להלן ביחד ולחוד: "המתווך") ו/או עובדיו ו/או מי מטעמו.</p>
      <p className="text-sm">לקבלת שירותי תיווך עבור הנכס/ים הרשומים להלן ונדווח לכם על כל מו"מ או הצעה בקשר לעסקה לגביהן</p>

      <div className="space-y-1 text-sm">
        <div className="font-medium">1) פרטי הלקוח</div>
        <div className="flex justify-between">
          <span>שם: <span className="inline-block min-w-40 border-b border-gray-400">{extra?.officialClientName || client?.clientName || ''}</span></span>
          <span>ת.ז.: <span className="inline-block min-w-40 border-b border-gray-400"></span></span>
        </div>
        <div className="flex justify-between">
          <span>שם: <span className="inline-block min-w-40 border-b border-gray-400">{client?.clientName2 || ''}</span></span>
          <span>ת.ז.: <span className="inline-block min-w-40 border-b border-gray-400"></span></span>
        </div>
        <div className="flex justify-between">
          <span>כתובת: <span className="inline-block grow border-b border-gray-400">{extra?.address}</span></span>
          <span className="ml-4">טלפון: <span className="inline-block min-w-32 border-b border-gray-400">{extra?.phone}</span></span>
        </div>
        <div>נייד: <span className="inline-block min-w-32 border-b border-gray-400">{extra?.mobile}</span></div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="font-medium">2) סוג העסקה</div>
        <div className="flex gap-6">
          <label className="flex items-center gap-2"><input type="checkbox" readOnly checked={form.transactionType==='sale' || form.transactionType==='purchase'} /> מכירה</label>
          <label className="flex items-center gap-2"><input type="checkbox" readOnly checked={form.transactionType==='rent_tenant' || form.transactionType==='rent_landlord'} /> השכרה</label>
        </div>
        <div>ותיאור הנכס: גוש <span className="inline-block min-w-20 border-b border-gray-400">{extra?.gush}</span> חלקה <span className="inline-block min-w-20 border-b border-gray-400">{extra?.helka}</span> תת חלקה <span className="inline-block min-w-20 border-b border-gray-400">{extra?.tatHelka}</span></div>
      </div>

      <div className="text-sm">
        <div className="font-medium mb-1">3) הצהרה</div>
        <p>אני הח"מ מצהיר בזה כי אני בעל הזכויות בנכס ו/או מוסמך מטעמו של בעל הזכויות בנכס למכור/להשכיר את הנכס.</p>
      </div>

      <div className="text-sm text-black">
        <div className="grid grid-cols-12 border border-gray-700">
          <div className="col-span-2 border-b border-gray-700 p-2 text-center">סוג הנכס</div>
          <div className="col-span-3 border-b border-l border-gray-700 p-2 text-center">כתובת</div>
          <div className="col-span-3 border-b border-l border-gray-700 p-2 text-center">שם הבעלים</div>
          <div className="col-span-3 border-b border-l border-gray-700 p-2 text-center">מחיר מבוקש בקירוב</div>
          <div className="col-span-1 border-b border-l border-gray-700 p-2 text-center">חתימה</div>

          {(selectedProps.length ? selectedProps : [null]).map((p, r)=>{
            const type = (r===0 && extra.tableType) ? extra.tableType : (p?.type || p?.category || '');
            const addr = (r===0 && extra.tableAddress) ? extra.tableAddress : (p?.location || p?.address || '');
            const owner = (r===0 && extra.tableOwnerName) ? extra.tableOwnerName : (p?.ownerName || '');
            const price = (r===0 && extra.tableAskingPrice) ? extra.tableAskingPrice : (p? `₪${Number(p.price||0).toLocaleString('he-IL')}` : '');
            return (
              <div key={`row-${r}`} className="contents text-center">
                <div className="col-span-2 p-2 border-t border-gray-200">{type}</div>
                <div className="col-span-3 p-2 border-t border-l border-gray-200">{addr}</div>
                <div className="col-span-3 p-2 border-t border-l border-gray-200">{owner}</div>
                <div className="col-span-3 p-2 border-t border-l border-gray-200">{price}</div>
                <div className="col-span-1 p-2 border-t border-l border-gray-200 flex items-center justify-center">
                  {r===0 && extra?.agentSignatureDataUrl ? (
                    <img src={extra.agentSignatureDataUrl} alt="agent signature" className="h-8 object-contain" />
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="text-sm space-y-1">
        <div className="font-medium">4) דמי התיווך</div>
        <p>ישולמו מיד לאחר התקשרות הצדדים שבאמצעותכם בהסכם מחייב כלשהו:</p>
        <p>א. מכירה/קניה: 2% ממחיר העסקה.</p>
        <p>ב. השכרה: שווי של חודש שכירות שנתית. (לסכומים כאמור יתווסף מע"מ לפי שיעורו כחוק) אם אמכור את המושכר תוך תקופת השכירות או אחריה הנני מתחייב/ת לשלם לכם שכר נוסף בשיעור 2% מהסכום הכולל של העסקה.</p>
      </div>

      <div className="text-sm">
        <div className="font-medium">5) בלעדיות</div>
        <p>תחול בתאריך <span className="inline-block min-w-24 border-b border-gray-400">{extra?.exclusivityStart}</span> עד תאריך: <span className="inline-block min-w-24 border-b border-gray-400">{extra?.exclusivityEnd}</span> (להלן תקופת הבלעדיות).</p>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>שם מלא: <span className="inline-block min-w-40 border-b border-gray-400">{extra?.officialClientName || client?.clientName || ''}</span></div>
        <div>ת.ז.: <span className="inline-block min-w-40 border-b border-gray-400"></span></div>
        <div>כתובת: <span className="inline-block min-w-64 border-b border-gray-400"></span></div>
        <div>תאריך: <span className="inline-block min-w-40 border-b border-gray-400"></span></div>
        <div className="flex items-end gap-2">חתימה: <span className="inline-block min-w-64 border-b border-gray-400"></span>
          {extra?.agentSignatureDataUrl && (<img src={extra.agentSignatureDataUrl} alt="agent signature" className="h-10 object-contain" />)}
        </div>
      </div>
    </div>
  );
}

function AgentSignaturePad({ value, onChange }) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [canvasRef, setCanvasRef] = useState(null);
  const begin = (x, y) => {
    const ctx = canvasRef.getContext('2d');
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000';
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };
  const move = (x, y) => {
    if (!isDrawing) return;
    const ctx = canvasRef.getContext('2d');
    ctx.lineTo(x, y);
    ctx.stroke();
  };
  const end = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    onChange?.(canvasRef.toDataURL('image/png'));
  };
  const handlePointerDown = (e) => {
    const rect = canvasRef.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
    begin(x, y);
  };
  const handlePointerMove = (e) => {
    if (!isDrawing) return;
    const rect = canvasRef.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
    move(x, y);
  };
  const handlePointerUp = () => end();
  const clear = () => {
    const ctx = canvasRef.getContext('2d');
    ctx.clearRect(0, 0, canvasRef.width, canvasRef.height);
    onChange?.('');
  };
  return (
    <div>
      <canvas
        ref={setCanvasRef}
        width={400}
        height={120}
        className="border rounded bg-white"
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
      />
      <div className="mt-2 flex gap-2">
        <button type="button" className="px-3 py-1 text-sm bg-gray-100 rounded" onClick={clear}>נקה</button>
        {value && <span className="text-xs text-gray-500">נשמרה חתימה</span>}
      </div>
    </div>
  );
}

