import type { EnrollmentForm } from './enrollTypes';

const API_BASE = import.meta.env.VITE_API_BASE as string;

function url(path: string) {
  const base = API_BASE.endsWith('/') ? API_BASE : API_BASE + '/';
  return base + path.replace(/^\//, '');
}

export async function staffLogin(stationId: string, passphrase: string): Promise<string> {
  const res = await fetch(url('auth/staff-login'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stationId, passphrase }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Login failed (${res.status})`);
  }
  if (!data.token) {
    throw new Error('No token returned');
  }
  return data.token as string;
}

export interface EnrollResult {
  userId: string;
  profileToken: string;
}

// Builds the backend body from the form. `otp` is passed separately —
// the live OTP step (piece 2d) supplies it; until then pass '' and the
// backend will reject, which is correct (no unverified enrollment).
export async function staffEnroll(
  token: string,
  form: EnrollmentForm,
  otp: string,
  photoKey: string | null,
): Promise<EnrollResult> {
  const mh = form.medicalHistory;
  const body = {
    fullName: form.fullName.trim(),
    dob: form.dob,
    gender: form.gender,
    bloodGroup: form.bloodGroup,
    phone: form.phone.trim(),
    otp,
    languages: form.languages.trim(),
    emergencyContact: {
      name: form.emergencyContact.name.trim(),
      relation: form.emergencyContact.relation.trim(),
      phone: form.emergencyContact.phone.trim(),
    },
    vitals: {
      weight: form.vitals.weight,
      height: form.vitals.height,
    },
    medicalHistory: {
      chiefComplaint: mh.chiefComplaint.trim(),
      allergies: mh.noKnownAllergies ? 'None known' : mh.allergies.trim(),
      conditions: mh.noKnownConditions ? 'None known' : mh.conditions.trim(),
      medications: mh.noKnownMedications ? 'None known' : mh.medications.trim(),
      surgeries: mh.surgeries.trim(),
      drugTreatment: mh.drugTreatment.trim(),
      smoking: mh.smoking,
      alcohol: mh.alcohol,
      diet: mh.diet,
      sleep: mh.sleep,
      menstrual: form.gender === 'female' ? mh.menstrual : '',
      lastMenstrualPeriod: form.gender === 'female' ? mh.lastMenstrualPeriod : '',
      cycleDays: form.gender === 'female' ? mh.cycleDays : '',
    },
    ...(photoKey ? { photoKey } : {}),
    termsAccepted: form.termsAccepted,
  };

  const res = await fetch(url('staff/enroll'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Enrollment failed (${res.status})`);
    return { userId: data.userId, profileToken: data.profileToken };
}
export async function staffSendOtp(token: string, phoneNumber: string): Promise<void> {
  const res = await fetch(url('staff/send-otp'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ phoneNumber }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Could not send OTP (${res.status})`);
}
// Upload a photo via presigned URL. Returns the S3 key to attach to the profile.
export async function uploadEnrollPhoto(token: string, file: Blob): Promise<string> {
  const photoId = crypto.randomUUID();
  const fileType = file.type || 'image/jpeg';
  const res = await fetch(url(`staff/upload-url?photoId=${photoId}&fileType=${encodeURIComponent(fileType)}`), {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Could not get upload URL');

  const put = await fetch(data.uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': fileType },
    body: file,
  });
  if (!put.ok) throw new Error('Photo upload failed');
  return data.key as string;
}