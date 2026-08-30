import { useState } from 'react';
import * as React from 'react';
import { staffLogin, staffEnroll, staffSendOtp, uploadEnrollPhoto } from './api';
import { BLOOD_GROUPS, GENDERS } from './enrollTypes';
import type { EnrollmentForm } from './enrollTypes';
import { COMMON_ALLERGIES, COMMON_MEDICATIONS, COMMON_CONDITIONS } from './commonLists';
import { QRCodeCanvas } from 'qrcode.react';

const NAVY = '#0a2540';

// Composes QR + caption into one PNG, then saves via the mobile share sheet
// when available (iOS/Android), falling back to a download link on desktop.
async function downloadBrandedQR(token: string) {
  const srcEl = document.getElementById('enroll-qr') as HTMLCanvasElement | null;
  if (!srcEl) return;
  const pad = 40;
  const captionH = 56;
  const out = document.createElement('canvas');
  out.width = srcEl.width + pad * 2;
  out.height = srcEl.height + pad * 2 + captionH;
  const ctx = out.getContext('2d');
  if (!ctx) return;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, out.width, out.height);
  ctx.drawImage(srcEl, pad, pad);
  ctx.fillStyle = NAVY;
  ctx.font = '700 22px -apple-system, Segoe UI, Roboto, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('SCAN IN CASE OF EMERGENCY', out.width / 2, srcEl.height + pad + 38);

  const fileName = `drsolv-qr-${token}.png`;
  const blob: Blob | null = await new Promise((resolve) => out.toBlob((b) => resolve(b), 'image/png'));
  if (!blob) return;

  // Mobile: hand the image to the native share/save sheet
  const file = new File([blob], fileName, { type: 'image/png' });
  const nav = navigator as any;
  if (nav.canShare && nav.canShare({ files: [file] })) {
    try {
      await nav.share({ files: [file], title: 'DRSOLV Emergency QR' });
      return;
    } catch {
      // cancelled or failed — fall through to download
    }
  }

  // Desktop / fallback: object-URL download
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = fileName;
  link.href = url;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

// Common quick-pick options (DRAFT — pending Dr. Rashi's review, like the medical lists).
const COMMON_LANGUAGES = ['Hindi', 'English', 'Bengali', 'Marathi', 'Tamil', 'Telugu', 'Gujarati', 'Kannada', 'Malayalam', 'Punjabi', 'Odia', 'Urdu', 'Assamese'];
const COMMON_COMPLAINTS = ['None', 'Fever', 'Cough / cold', 'Headache', 'Body ache', 'Injury / trauma', 'Abdominal pain', 'Breathing difficulty', 'Dizziness / weakness'];
const COMMON_SURGERIES = ['None', 'Appendectomy', 'Tonsillectomy', 'Cesarean section', 'Fracture fixation', 'Gallbladder removal', 'Hernia repair', 'Cataract surgery'];
const COMMON_TREATMENTS = ['None', 'Ongoing antibiotics', 'Physiotherapy', 'Inhaler therapy', 'Insulin therapy', 'Thyroid medication', 'Blood pressure medication', 'Dialysis'];

const emptyForm: EnrollmentForm = {
  fullName: '', dob: '', gender: '', bloodGroup: '', phone: '', languages: '',
  emergencyContact: { name: '', relation: '', phone: '' },
  vitals: { weight: '', height: '' },
  medicalHistory: {
    chiefComplaint: '',
    noKnownAllergies: false, allergies: '',
    noKnownConditions: false, conditions: '',
    noKnownMedications: false, medications: '',
    surgeries: '', drugTreatment: '',
    smoking: '', alcohol: '', diet: '', sleep: '', menstrual: '',
    lastMenstrualPeriod: '', cycleDays: '',
  },
  termsAccepted: false,
};

const PAGE_BG = 'min-h-screen bg-gradient-to-br from-[#eaf1fb] via-[#f4f7fc] to-[#dfeafc]';

export default function App() {
  const [token, setToken] = useState<string | null>(null);
  const [stationId, setStationId] = useState('station-1');
  if (!token) return <Login stationId={stationId} setStationId={setStationId} onToken={setToken} />;
  return <EnrollForm stationId={stationId} token={token} onLogout={() => setToken(null)} />;
}

function Login({ stationId, setStationId, onToken }: {
  stationId: string; setStationId: (s: string) => void; onToken: (t: string) => void;
}) {
  const [passphrase, setPassphrase] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  async function handleLogin() {
    setError(''); setLoading(true);
    try { onToken(await staffLogin(stationId.trim(), passphrase)); }
    catch (e: any) { setError(e.message || 'Sign-in failed'); }
    finally { setLoading(false); }
  }
  return (
    <div className={PAGE_BG + ' flex items-center justify-center p-4 relative overflow-hidden'}>
      <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-[#6991d6]/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-[#0a2540]/20 blur-3xl" />
      <div className={glassCard + ' w-full max-w-md p-8 drsolv-rise relative'}>
        <img src="/drsolv-logo.png" alt="DRSOLV" className="h-10 w-auto" />
        <p className="mt-5 text-sm text-slate-500">Sign in to your enrollment station</p>
        <div className="mt-6 space-y-4">
          <div>
            <span className="mb-1.5 block text-sm font-medium text-slate-600">Station</span>
            <input value={stationId} onChange={(e) => setStationId(e.target.value)} className={inputCls} placeholder="station-1" />
          </div>
          <div>
            <span className="mb-1.5 block text-sm font-medium text-slate-600">Passphrase</span>
            <input type="password" value={passphrase} onChange={(e) => setPassphrase(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()} className={inputCls} placeholder="Station passphrase" />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button onClick={handleLogin} disabled={loading || !passphrase} className={primaryBtn}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}

function EnrollForm({ stationId, token, onLogout }: { stationId: string; token: string; onLogout: () => void }) {
  const [f, setF] = useState<EnrollmentForm>(emptyForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [savedToken, setSavedToken] = useState<string>('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpBusy, setOtpBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [photoBlob, setPhotoBlob] = useState<Blob | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string>('');

  function set<K extends keyof EnrollmentForm>(k: K, v: EnrollmentForm[K]) { setF((p) => ({ ...p, [k]: v })); }
  function setEC(k: keyof EnrollmentForm['emergencyContact'], v: string) { setF((p) => ({ ...p, emergencyContact: { ...p.emergencyContact, [k]: v } })); }
  function setV(k: keyof EnrollmentForm['vitals'], v: string) { setF((p) => ({ ...p, vitals: { ...p.vitals, [k]: v } })); }
  function setMH(k: keyof EnrollmentForm['medicalHistory'], v: any) { setF((p) => ({ ...p, medicalHistory: { ...p.medicalHistory, [k]: v } })); }

  const mh = f.medicalHistory;
  const detailsDone = !!(f.fullName.trim() && f.dob && f.gender && f.bloodGroup && f.phone.trim());
  const contactDone = !!(f.emergencyContact.name.trim() && f.emergencyContact.relation.trim() && f.emergencyContact.phone.trim());
  const measureDone = !!(f.vitals.weight && f.vitals.height);
  const historyDone = !!((mh.noKnownAllergies || mh.allergies.trim()) && (mh.noKnownConditions || mh.conditions.trim()) && (mh.noKnownMedications || mh.medications.trim()));
  const canSubmit = detailsDone && contactDone && measureDone && historyDone && f.termsAccepted;

  async function handleSendOtp() {
    setError(''); setOtpBusy(true);
    try {
      await staffSendOtp(token, f.phone.trim());
      setOtpSent(true);
      setCooldown(60);
      const t = setInterval(() => setCooldown((c) => { if (c <= 1) { clearInterval(t); return 0; } return c - 1; }), 1000);
    } catch (e: any) { setError(e.message || 'Could not send OTP'); }
    finally { setOtpBusy(false); }
  }

  async function handleEnroll() {
    setError(''); setSaving(true);
    try {
      let photoKey: string | null = null;
      if (photoBlob) { photoKey = await uploadEnrollPhoto(token, photoBlob); }
      const { userId, profileToken } = await staffEnroll(token, f, otp.trim(), photoKey);
      setSavedId(userId);
      setSavedToken(profileToken);
    } catch (e: any) { setError(e.message || 'Could not save'); }
    finally { setSaving(false); }
  }

  if (savedId) {
    return (
      <Shell stationId={stationId} onLogout={onLogout}>
        <div className={glassCard + ' mx-auto max-w-md p-10 text-center drsolv-rise'}>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full text-white text-3xl drsolv-pop shadow-lg" style={{ background: NAVY }}>&#10003;</div>
          <h2 className="mt-5 text-xl font-bold" style={{ color: NAVY }}>Student enrolled</h2>
          <p className="mt-1 text-sm text-slate-500">Profile ID</p>
          <p className="mt-1 break-all rounded-xl bg-white/50 border border-white/60 p-3 text-xs text-slate-600">{savedId}</p>
          {savedToken && (
            <div className="mt-5 flex flex-col items-center">
              <div className="rounded-2xl bg-white p-4 shadow border border-slate-100 flex flex-col items-center">
                <QRCodeCanvas
                  id="enroll-qr"
                  value={`https://drsolv.in/p/${savedToken}`}
                  size={200}
                  level="H"
                  marginSize={2}
                  imageSettings={{ src: '/drsolv-mark.png', height: 40, width: 40, excavate: true }}
                />
                <p className="mt-2 text-xs font-bold tracking-wide" style={{ color: NAVY }}>SCAN IN CASE OF EMERGENCY</p>
              </div>
              <button
                type="button"
                onClick={() => downloadBrandedQR(savedToken)}
                className="mt-3 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:border-[#6991d6]"
              >
                Save / Share QR
              </button>
            </div>
          )}
          <button onClick={() => { setF(emptyForm); setSavedId(null); setSavedToken(''); setOtpSent(false); setOtp(''); setPhotoBlob(null); setPhotoUrl(''); }} className={primaryBtn + ' mt-6'}>Enroll next student</button>
        </div>
      </Shell>
    );
  }

  return (
    <Shell stationId={stationId} onLogout={onLogout}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <Section title="Student details" icon="&#128100;" done={detailsDone} delay={0}>
          <div className="col-span-12">
            <PhotoCapture
              photoUrl={photoUrl}
              onCapture={(blob) => { setPhotoBlob(blob); setPhotoUrl(URL.createObjectURL(blob)); }}
              onClear={() => { setPhotoBlob(null); setPhotoUrl(''); }}
            />
          </div>
          <Field label="Full name" span={12}><input className={inputCls} value={f.fullName} onChange={(e) => set('fullName', e.target.value)} /></Field>
          <Field label="Date of birth" span={6}><input type="date" className={inputCls} value={f.dob} onChange={(e) => set('dob', e.target.value)} /></Field>
          <Field label="Gender" span={6}>
            <select className={inputCls} value={f.gender} onChange={(e) => set('gender', e.target.value)}>
              <option value="">Select</option>
              {GENDERS.map((g) => <option key={g} value={g}>{g[0].toUpperCase() + g.slice(1)}</option>)}
            </select>
          </Field>
          <Field label="Blood group" span={12}>
            <div className="grid grid-cols-4 gap-2">
              {BLOOD_GROUPS.map((bg) => <button key={bg} type="button" onClick={() => set('bloodGroup', bg)} className={pickBtn(f.bloodGroup === bg)}>{bg}</button>)}
            </div>
          </Field>
          <Field label="Student phone" span={6}><input inputMode="numeric" className={inputCls} value={f.phone} onChange={(e) => set('phone', e.target.value)} placeholder="9876543210" /></Field>
          <ComboField label="Language(s) spoken" span={6} suggestions={COMMON_LANGUAGES} value={f.languages} onChange={(v) => set('languages', v)} placeholder="Type or pick a language" />
        </Section>

        <Section title="Emergency contact" icon="&#128680;" done={contactDone} delay={60}>
          <Field label="Name" span={12}><input className={inputCls} value={f.emergencyContact.name} onChange={(e) => setEC('name', e.target.value)} /></Field>
          <Field label="Relation" span={6}><input className={inputCls} value={f.emergencyContact.relation} onChange={(e) => setEC('relation', e.target.value)} placeholder="parent" /></Field>
          <Field label="Phone" span={6}><input inputMode="numeric" className={inputCls} value={f.emergencyContact.phone} onChange={(e) => setEC('phone', e.target.value)} /></Field>
        </Section>

        <Section title="Measurements" icon="&#128207;" done={measureDone} delay={120}>
          <Field label="Weight (kg)" span={6}><input inputMode="decimal" className={inputCls} value={f.vitals.weight} onChange={(e) => setV('weight', e.target.value)} placeholder="60" /></Field>
          <Field label="Height (cm)" span={6}><input inputMode="numeric" className={inputCls} value={f.vitals.height} onChange={(e) => setV('height', e.target.value)} placeholder="170" /></Field>
        </Section>

        <Section title="Medical history" icon="&#128203;" done={historyDone} delay={180}>
          <ComboField label="Chief complaint (at enrollment, optional)" span={12} suggestions={COMMON_COMPLAINTS} value={mh.chiefComplaint} onChange={(v) => setMH('chiefComplaint', v)} placeholder="Type or pick" />
          <ComboField label="Allergies" span={12} suggestions={COMMON_ALLERGIES} value={mh.allergies} onChange={(v) => setMH('allergies', v)} placeholder="Type to search allergies" noneLabel="None known" none={mh.noKnownAllergies} onNone={(v) => setMH('noKnownAllergies', v)} />
          <ComboField label="Conditions" span={12} suggestions={COMMON_CONDITIONS} value={mh.conditions} onChange={(v) => setMH('conditions', v)} placeholder="Type to search conditions" noneLabel="None known" none={mh.noKnownConditions} onNone={(v) => setMH('noKnownConditions', v)} />
          <ComboField label="Medications" span={12} suggestions={COMMON_MEDICATIONS} value={mh.medications} onChange={(v) => setMH('medications', v)} placeholder="Type to search medications" noneLabel="None current" none={mh.noKnownMedications} onNone={(v) => setMH('noKnownMedications', v)} />
          <ComboField label="Past surgeries (optional)" span={12} suggestions={COMMON_SURGERIES} value={mh.surgeries} onChange={(v) => setMH('surgeries', v)} placeholder="Type or pick" />
          <ComboField label="Ongoing drug / treatment (optional)" span={12} suggestions={COMMON_TREATMENTS} value={mh.drugTreatment} onChange={(v) => setMH('drugTreatment', v)} placeholder="Type or pick" />
          <Field label="Smoking" span={6}><Choice value={mh.smoking} onChange={(v) => setMH('smoking', v)} options={[['no', 'No'], ['yes', 'Yes']]} /></Field>
          <Field label="Alcohol" span={6}><Choice value={mh.alcohol} onChange={(v) => setMH('alcohol', v)} options={[['no', 'No'], ['yes', 'Yes']]} /></Field>
          <Field label="Diet" span={12}><Choice value={mh.diet} onChange={(v) => setMH('diet', v)} options={[['veg', 'Veg'], ['nonveg', 'Non-veg'], ['egg', 'Egg']]} /></Field>
          <Field label="Sleep habits" span={12}><Choice value={mh.sleep} onChange={(v) => setMH('sleep', v)} options={[['adequate', 'Adequate'], ['disturbed', 'Disturbed'], ['insomnia', 'Insomnia']]} /></Field>
          {f.gender === 'female' && (
            <>
              <Field label="Last menstrual period" span={6}><input type="date" className={inputCls} value={mh.lastMenstrualPeriod} onChange={(e) => setMH('lastMenstrualPeriod', e.target.value)} /></Field>
              <Field label="Cycle length (days)" span={6}><input inputMode="numeric" className={inputCls} value={mh.cycleDays} onChange={(e) => setMH('cycleDays', e.target.value)} placeholder="28" /></Field>
              <Field label="Menstrual cycle" span={12}><Choice value={mh.menstrual} onChange={(v) => setMH('menstrual', v)} options={[['regular', 'Regular'], ['irregular', 'Irregular']]} /></Field>
            </>
          )}
        </Section>

        <div className="lg:col-span-2 space-y-4 drsolv-rise" style={{ animationDelay: '240ms' }}>
          <label className={glassCard + ' flex items-start gap-3 p-5 text-sm text-slate-700'}>
            <input type="checkbox" checked={f.termsAccepted} onChange={(e) => set('termsAccepted', e.target.checked)} className="mt-0.5 h-5 w-5 accent-[#0a2540]" />
            <span>Student has given consent for this data (including a photo) to be collected and shown on their emergency profile.</span>
          </label>

          {!otpSent ? (
            <>
              <button onClick={handleSendOtp} disabled={!canSubmit || otpBusy} className={primaryBtn + ' py-4 text-base'}>
                {otpBusy ? 'Sending code...' : 'Send verification code to student'}
              </button>
              <p className="text-center text-xs text-slate-400">A one-time code is sent to the student's phone to verify their number.</p>
            </>
          ) : (
            <div className={glassCard + ' p-5 space-y-4'}>
              <div>
                <p className="text-sm font-medium text-slate-700">Enter the code sent to {f.phone}</p>
                <p className="text-xs text-slate-400 mt-0.5">Ask the student to read out the 6-digit code from their SMS.</p>
              </div>
              <input inputMode="numeric" maxLength={6} value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className={inputCls + ' text-center text-2xl tracking-[0.5em] font-semibold'} placeholder="------" />
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button onClick={handleEnroll} disabled={otp.length < 4 || saving} className={primaryBtn + ' py-4 text-base'}>
                {saving ? 'Enrolling...' : 'Verify & enroll student'}
              </button>
              <div className="flex items-center justify-between text-xs">
                <button onClick={() => { setOtpSent(false); setOtp(''); setError(''); }} className="text-slate-500 hover:text-slate-800">Back to form</button>
                <button onClick={handleSendOtp} disabled={cooldown > 0 || otpBusy} className="text-[#0a2540] font-medium disabled:text-slate-300">
                  {cooldown > 0 ? 'Resend in ' + cooldown + 's' : 'Resend code'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Shell>
  );
}

function Shell({ stationId, onLogout, children }: { stationId: string; onLogout: () => void; children: React.ReactNode }) {
  return (
    <div className={PAGE_BG + ' relative'}>
      <div className="pointer-events-none fixed -top-32 left-1/4 h-96 w-96 rounded-full bg-[#6991d6]/20 blur-3xl" />
      <div className="pointer-events-none fixed bottom-0 right-1/4 h-96 w-96 rounded-full bg-[#0a2540]/10 blur-3xl" />
      <header className="sticky top-0 z-20 flex items-center justify-between px-6 py-3 text-white shadow-lg backdrop-blur-xl" style={{ background: 'rgba(10,37,64,0.85)' }}>
        <div className="flex items-center gap-3">
          <img src="/drsolv-mark.png" alt="" className="h-8 w-8 object-contain bg-white rounded-lg p-1" />
          <span className="text-base font-semibold tracking-tight">Enrollment</span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="rounded-lg bg-white/10 px-3 py-1.5 font-medium">{stationId}</span>
          <button onClick={onLogout} className="text-white/70 hover:text-white transition">Log out</button>
        </div>
      </header>
      <main className="relative mx-auto max-w-5xl p-6">{children}</main>
    </div>
  );
}

function Section({ title, icon, done, delay, children }: {
  title: string; icon: string; done: boolean; delay: number; children: React.ReactNode;
}) {
  return (
    <section className={glassCard + ' overflow-hidden drsolv-rise'} style={{ animationDelay: delay + 'ms' }}>
      <div className="flex items-center gap-3 px-6 pt-5 pb-4 border-b border-white/40">
        <span className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white shadow" style={{ background: done ? '#1f8a4c' : NAVY }}>
          {done ? <span>&#10003;</span> : <span dangerouslySetInnerHTML={{ __html: icon }} />}
        </span>
        <h3 className="text-sm font-semibold tracking-wide" style={{ color: NAVY }}>{title}</h3>
      </div>
      <div className="grid grid-cols-12 gap-4 p-6">{children}</div>
    </section>
  );
}

function Field({ label, span = 12, children }: { label: string; span?: number; children: React.ReactNode }) {
  const col: Record<number, string> = { 4: 'col-span-4', 6: 'col-span-6', 12: 'col-span-12' };
  return (
    <label className={'block ' + (col[span] || 'col-span-12')}>
      <span className="mb-1.5 block text-sm font-medium text-slate-600">{label}</span>
      {children}
    </label>
  );
}

function Choice({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return (
    <div className="flex gap-2">
      {options.map(([val, label]) => (
        <button key={val} type="button" onClick={() => onChange(value === val ? '' : val)} className={pickBtn(value === val)}>{label}</button>
      ))}
    </div>
  );
}

// Searchable multi-select with free-text fallback. Stores selections as a
// comma-joined string (matches the existing string fields — no backend change).
function ComboField({ label, span = 12, suggestions, value, onChange, placeholder, noneLabel, none, onNone }: {
  label: string; span?: number; suggestions: string[]; value: string; onChange: (v: string) => void;
  placeholder?: string; noneLabel?: string; none?: boolean; onNone?: (v: boolean) => void;
}) {
  const col: Record<number, string> = { 4: 'col-span-4', 6: 'col-span-6', 12: 'col-span-12' };
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const chips = value ? value.split(',').map((s) => s.trim()).filter(Boolean) : [];
  const lower = chips.map((c) => c.toLowerCase());
  const filtered = query.trim()
    ? suggestions.filter((s) => s.toLowerCase().includes(query.toLowerCase()) && !lower.includes(s.toLowerCase())).slice(0, 8)
    : [];
  const disabled = !!none;

  function addChip(item: string) {
    const t = item.trim();
    if (!t) return;
    if (lower.includes(t.toLowerCase())) { setQuery(''); return; }
    onChange([...chips, t].filter(Boolean).join(', '));
    setQuery(''); setOpen(false);
  }
  function removeChip(item: string) {
    onChange(chips.filter((c) => c !== item).join(', '));
  }
  const canAddFree = query.trim() && !suggestions.some((s) => s.toLowerCase() === query.trim().toLowerCase()) && !lower.includes(query.trim().toLowerCase());

  return (
    <div className={'block ' + (col[span] || 'col-span-12')}>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-600">{label}</span>
        {noneLabel && onNone && (
          <label className="flex items-center gap-1.5 text-xs text-slate-500 cursor-pointer">
            <input type="checkbox" checked={!!none} onChange={(e) => { onNone(e.target.checked); if (e.target.checked) onChange(''); }} className="accent-[#0a2540]" /> {noneLabel}
          </label>
        )}
      </div>
      {!disabled && chips.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {chips.map((c) => (
            <span key={c} className="inline-flex items-center gap-1 rounded-full bg-[#d1e1ff]/70 border border-[#6991d6]/40 px-2.5 py-1 text-xs text-[#0a2540]">
              {c}
              <button type="button" onClick={() => removeChip(c)} className="text-[#0a2540]/60 hover:text-[#0a2540]">&#215;</button>
            </span>
          ))}
        </div>
      )}
      <div className="relative">
        <input
          className={inputCls + (disabled ? ' opacity-40' : '')}
          value={query}
          disabled={disabled}
          placeholder={placeholder}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (query.trim()) addChip(query); } }}
        />
        {open && !disabled && (filtered.length > 0 || canAddFree) && (
          <div className="absolute z-30 mt-1 w-full rounded-xl border border-white/60 bg-white/95 backdrop-blur shadow-lg overflow-hidden">
            {filtered.map((s) => (
              <button key={s} type="button" onClick={() => addChip(s)} className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-[#d1e1ff]/50">{s}</button>
            ))}
            {canAddFree && (
              <button type="button" onClick={() => addChip(query)} className="block w-full text-left px-4 py-2 text-sm text-[#0a2540] font-medium hover:bg-[#d1e1ff]/50 border-t border-slate-100">
                + Add &ldquo;{query.trim()}&rdquo;
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function PhotoCapture({ photoUrl, onCapture, onClear }: {
  photoUrl: string; onCapture: (b: Blob) => void; onClear: () => void;
}) {
  const [cameraOn, setCameraOn] = useState(false);
  const [camError, setCamError] = useState('');
  const [facing, setFacing] = useState<'user' | 'environment'>('environment');
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const fileRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    if (cameraOn && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [cameraOn]);

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraOn(false);
  }

  async function openCamera(mode: 'user' | 'environment') {
    setCamError('');
    // stop any existing stream before switching
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: mode } });
      streamRef.current = stream;
      setFacing(mode);
      setCameraOn(true);
      // if already showing, rebind immediately
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
    } catch {
      setCamError('Camera unavailable. Use Upload photo instead.');
    }
  }

  function flipCamera() {
    openCamera(facing === 'user' ? 'environment' : 'user');
  }

  function capture() {
    const v = videoRef.current;
    if (!v || !v.videoWidth) return;
    const canvas = document.createElement('canvas');
    canvas.width = v.videoWidth; canvas.height = v.videoHeight;
    canvas.getContext('2d')?.drawImage(v, 0, 0);
    canvas.toBlob((blob) => { if (blob) { onCapture(blob); stopCamera(); } }, 'image/jpeg', 0.85);
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onCapture(file);
    e.target.value = '';
  }

  return (
    <div>
      <span className="mb-1.5 block text-sm font-medium text-slate-600">Student photo (optional)</span>
      {photoUrl ? (
        <div className="flex items-center gap-4">
          <img src={photoUrl} alt="Student" className="h-24 w-24 rounded-2xl object-cover border border-white/60 shadow" />
          <button type="button" onClick={onClear} className={glassBtn}>Retake</button>
        </div>
      ) : cameraOn ? (
        <div className="space-y-2">
          <video ref={videoRef} autoPlay playsInline muted className="w-full max-w-xs rounded-2xl bg-black aspect-video object-cover shadow-lg" />
          <div className="flex gap-2">
            <button type="button" onClick={capture} className="rounded-xl bg-[#0a2540] px-4 py-2 text-sm font-medium text-white shadow">Capture</button>
            <button type="button" onClick={flipCamera} className={glassBtn}>Flip camera ({facing === 'user' ? 'front' : 'back'})</button>
            <button type="button" onClick={stopCamera} className={glassBtn}>Cancel</button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => openCamera('environment')} className={glassBtn}><span dangerouslySetInnerHTML={{ __html: '&#128247; ' }} />Use camera</button>
          <button type="button" onClick={() => fileRef.current?.click()} className={glassBtn}>Upload photo</button>
          <input ref={fileRef} type="file" accept="image/*" onChange={onFile} className="hidden" />
          {camError && <p className="w-full text-xs text-amber-600">{camError}</p>}
        </div>
      )}
    </div>
  );
}

const glassCard = 'rounded-3xl border border-white/50 bg-white/40 backdrop-blur-2xl shadow-[0_8px_32px_rgba(10,37,64,0.10)]';
const glassBtn = 'rounded-xl border border-white/60 bg-white/50 backdrop-blur px-4 py-2 text-sm text-slate-700 transition hover:bg-white/80';
const inputCls = 'w-full rounded-xl border border-white/60 bg-white/50 backdrop-blur px-4 py-3 text-base text-slate-900 transition focus:bg-white/90 focus:outline-none focus:ring-2 focus:ring-[#6991d6] focus:border-transparent';
const primaryBtn = 'w-full rounded-xl py-3 text-sm font-semibold text-white shadow-lg transition hover:opacity-90 active:scale-[0.99] disabled:opacity-40 bg-[#0a2540]';
function pickBtn(active: boolean) {
  return 'flex-1 rounded-xl border py-3 text-sm font-medium transition active:scale-95 backdrop-blur ' + (active ? 'border-[#0a2540] bg-[#d1e1ff]/80 text-[#0a2540] shadow' : 'border-white/60 bg-white/40 text-slate-600 hover:bg-white/70');
}