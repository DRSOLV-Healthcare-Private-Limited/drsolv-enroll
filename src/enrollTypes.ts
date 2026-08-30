export interface EmergencyContact {
  name: string;
  relation: string;
  phone: string;
}

export interface Vitals {
  weight: string;      // kg
  height: string;      // cm
}

export interface MedicalHistory {
  chiefComplaint: string;        // at enrollment (point-in-time) — optional
  noKnownAllergies: boolean;
  allergies: string;
  noKnownConditions: boolean;
  conditions: string;
  noKnownMedications: boolean;
  medications: string;
  surgeries: string;             // optional
  drugTreatment: string;         // optional
  smoking: string;               // 'yes' | 'no' | ''
  alcohol: string;               // 'yes' | 'no' | ''
  diet: string;                  // 'veg' | 'nonveg' | 'egg' | ''
  sleep: string;                 // 'adequate' | 'disturbed' | 'insomnia' | ''
  menstrual: string;
  cycleDays: string;             // 'regular' | 'irregular' | '' (female only)
}

export interface EnrollmentForm {
  fullName: string;
  dob: string;
  gender: string;
  bloodGroup: string;
  phone: string;
  languages: string;             // spoken language(s), free text — optional
  emergencyContact: EmergencyContact;
  vitals: Vitals;
  medicalHistory: MedicalHistory;
  termsAccepted: boolean;
}

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;
export const GENDERS = ['male', 'female', 'other'] as const;