// ============================================================================
// DRSOLV — Enrollment autocomplete source lists  (EXPANDED)
// ----------------------------------------------------------------------------
// ⚠️ DRAFT — REQUIRES DR. RASHI'S CLINICAL SIGN-OFF BEFORE USE.
//
// AI-drafted starter set of common items for a young-adult student cohort,
// to populate the search-as-you-type fields on the enrollment form. NOT
// authoritative, NOT clinically reviewed. ~150–200 per category.
//
// How it is used: nurse types a keyword → field filters these items → nurse
// picks a match. Anything NOT here is still captured via FREE-TEXT fallback,
// so this list does not need to be exhaustive — it only needs to cover the
// common cases so frequent entries are one keyword away.
//
// Names are GENERIC (not brand names) on purpose. Grouped by clinical class
// only to make review easier — the form flattens and searches across all of
// them. Dr. Rashi: add / remove / rename freely; this is data-only, no code
// change needed.
//
// ⚑ SENSITIVITY FLAG for review: mental-health conditions & psychiatric meds,
//   HIV/Hepatitis, and genetic/haematological status are included because a
//   doctor may want them — but whether such sensitive data belongs on an
//   emergency-scan profile is a clinical/privacy call that is YOURS to make.
//   Please give each a conscious keep/remove, not a silent pass.
// ============================================================================

// ------------------------------- ALLERGIES ----------------------------------
export const COMMON_ALLERGIES: string[] = [
  // --- Antibiotics ---
  'Penicillin', 'Amoxicillin', 'Ampicillin', 'Cephalosporins', 'Ceftriaxone',
  'Cefixime', 'Sulfa drugs (Sulfonamides)', 'Cotrimoxazole', 'Ciprofloxacin',
  'Levofloxacin', 'Ofloxacin', 'Azithromycin', 'Erythromycin', 'Clarithromycin',
  'Tetracycline', 'Doxycycline', 'Metronidazole', 'Gentamicin', 'Vancomycin',
  'Clindamycin', 'Nitrofurantoin',
  // --- Painkillers / NSAIDs ---
  'Aspirin', 'Ibuprofen', 'Diclofenac', 'Naproxen', 'Ketorolac', 'Nimesulide',
  'Paracetamol', 'Mefenamic acid', 'Aceclofenac', 'Codeine', 'Tramadol',
  'Morphine',
  // --- Anaesthetics / procedural ---
  'Local anaesthetics (e.g. Lignocaine)', 'Lidocaine', 'Iodine / Contrast dye',
  'Chlorhexidine', 'Adhesive tape / plaster',
  // --- Other drug classes ---
  'Insulin', 'Heparin', 'Carbamazepine', 'Phenytoin', 'Lamotrigine',
  'Allopurinol', 'Proton pump inhibitors', 'ACE inhibitors', 'Statins',
  'Vaccines (specify)', 'Egg-based vaccines',
  // --- Food: nuts & seeds ---
  'Peanuts', 'Tree nuts', 'Almonds', 'Cashews', 'Walnuts', 'Pistachios',
  'Sesame', 'Mustard', 'Sunflower seeds',
  // --- Food: animal proteins ---
  'Milk / Dairy', 'Eggs', 'Fish', 'Shellfish / Prawns', 'Crab', 'Squid',
  'Chicken', 'Mutton', 'Beef', 'Pork',
  // --- Food: plant / grain / other ---
  'Soy', 'Wheat / Gluten', 'Gram / Chickpea', 'Kidney beans', 'Peas',
  'Brinjal / Eggplant', 'Tomato', 'Banana', 'Mango', 'Strawberry', 'Kiwi',
  'Coconut', 'Chocolate / Cocoa', 'Food colouring / Additives', 'MSG',
  'Preservatives (Sulphites)',
  // --- Environmental / contact / insect ---
  'Dust / Dust mites', 'Pollen', 'Grass', 'Mould', 'Pet dander', 'Cat',
  'Dog', 'Latex', 'Nickel / Metal', 'Cosmetics / Fragrance', 'Hair dye',
  'Henna', 'Bee / Wasp stings', 'Cockroach', 'Mosquito bites',
  // --- Drug-reaction history (specify) ---
  'Anaphylaxis (previous, specify cause)', 'Drug rash (previous, specify)',
];

// ------------------------------ MEDICATIONS ---------------------------------
export const COMMON_MEDICATIONS: string[] = [
  // --- Respiratory / allergy ---
  'Salbutamol inhaler', 'Levosalbutamol inhaler', 'Budesonide inhaler',
  'Fluticasone inhaler', 'Formoterol', 'Ipratropium', 'Montelukast',
  'Theophylline', 'Cetirizine', 'Levocetirizine', 'Fexofenadine',
  'Loratadine', 'Chlorpheniramine', 'Hydroxyzine',
  // --- Diabetes ---
  'Metformin', 'Insulin', 'Glimepiride', 'Gliclazide', 'Sitagliptin',
  'Vildagliptin', 'Dapagliflozin', 'Empagliflozin', 'Pioglitazone',
  // --- Thyroid / endocrine ---
  'Levothyroxine (Thyroxine)', 'Carbimazole', 'Methimazole',
  // --- Lipid / cholesterol (the flagged gap) ---
  'Atorvastatin', 'Rosuvastatin', 'Simvastatin', 'Fenofibrate', 'Ezetimibe',
  // --- Cardiac / blood pressure ---
  'Amlodipine', 'Telmisartan', 'Losartan', 'Ramipril', 'Enalapril',
  'Atenolol', 'Metoprolol', 'Bisoprolol', 'Nebivolol', 'Hydrochlorothiazide',
  'Furosemide', 'Spironolactone', 'Clonidine', 'Nitroglycerin',
  'Digoxin', 'Ivabradine',
  // --- Anticoagulant / antiplatelet ---
  'Aspirin (cardiac)', 'Clopidogrel', 'Warfarin', 'Acenocoumarol',
  'Apixaban', 'Rivaroxaban', 'Dabigatran', 'Heparin', 'Enoxaparin',
  // --- Mental health / neuro  ⚑ sensitive ---
  'Sertraline', 'Escitalopram', 'Fluoxetine', 'Paroxetine', 'Venlafaxine',
  'Duloxetine', 'Amitriptyline', 'Mirtazapine', 'Bupropion', 'Olanzapine',
  'Risperidone', 'Quetiapine', 'Aripiprazole', 'Lithium', 'Clonazepam',
  'Alprazolam', 'Lorazepam', 'Diazepam', 'Propranolol (anxiety/migraine)',
  'Methylphenidate', 'Atomoxetine',
  // --- Anti-epileptic ---
  'Sodium valproate', 'Carbamazepine', 'Levetiracetam', 'Phenytoin',
  'Lamotrigine', 'Oxcarbazepine', 'Topiramate', 'Clobazam',
  // --- Gastro ---
  'Pantoprazole', 'Omeprazole', 'Rabeprazole', 'Esomeprazole', 'Ranitidine',
  'Famotidine', 'Domperidone', 'Ondansetron', 'Metoclopramide',
  'Dicyclomine', 'Mesalazine', 'Loperamide', 'Lactulose', 'Sucralfate',
  // --- Pain / anti-inflammatory ---
  'Paracetamol', 'Ibuprofen', 'Diclofenac', 'Aceclofenac', 'Naproxen',
  'Etoricoxib', 'Tramadol', 'Mefenamic acid', 'Serratiopeptidase',
  // --- Antibiotics (common courses) ---
  'Amoxicillin', 'Amoxicillin-Clavulanate', 'Azithromycin', 'Cefixime',
  'Ciprofloxacin', 'Levofloxacin', 'Doxycycline', 'Metronidazole',
  'Cotrimoxazole', 'Nitrofurantoin',
  // --- Skin / derm ---
  'Isotretinoin', 'Doxycycline (acne)', 'Adapalene', 'Benzoyl peroxide',
  'Clindamycin gel', 'Tretinoin', 'Ketoconazole', 'Terbinafine',
  'Hydrocortisone cream', 'Mometasone cream',
  // --- Steroids / immune  ⚑ sensitive if immunosuppressed ---
  'Prednisolone', 'Deflazacort', 'Methylprednisolone', 'Hydrocortisone',
  'Methotrexate', 'Azathioprine', 'Hydroxychloroquine', 'Cyclosporine',
  // --- Women's health ---
  'Oral contraceptive pill', 'Norethisterone', 'Tranexamic acid',
  'Ethinylestradiol', 'Medroxyprogesterone',
  // --- Migraine-specific ---
  'Sumatriptan', 'Rizatriptan', 'Flunarizine', 'Topiramate (migraine)',
  // --- Supplements / other common ---
  'Iron / Folic acid supplements', 'Vitamin D', 'Vitamin B12', 'Calcium',
  'Vitamin C', 'Multivitamin', 'ORS', 'Melatonin',
];

// ------------------------------ CONDITIONS ----------------------------------
export const COMMON_CONDITIONS: string[] = [
  // --- Respiratory ---
  'Asthma', 'Allergic rhinitis', 'Chronic bronchitis', 'Sinusitis (chronic)',
  'Sleep apnoea', 'Recurrent pneumonia',
  // --- Endocrine / metabolic ---
  'Type 1 Diabetes', 'Type 2 Diabetes', 'Prediabetes', 'Hypothyroidism',
  'Hyperthyroidism', 'PCOS / PCOD', "Cushing's syndrome",
  "Addison's disease", 'Obesity', 'High cholesterol / Dyslipidaemia',
  // --- Cardiac ---
  'Hypertension', 'Congenital heart disease', 'Arrhythmia',
  'Mitral valve prolapse', 'Rheumatic heart disease', 'Heart murmur',
  'Cardiomyopathy',
  // --- Neuro / mental health  ⚑ sensitive ---
  'Epilepsy / Seizure disorder', 'Migraine', 'Anxiety disorder', 'Depression',
  'Bipolar disorder', 'ADHD', 'Autism spectrum', 'Panic disorder',
  'OCD', 'PTSD', 'Eating disorder', 'Chronic headache',
  // --- Blood / haematology  ⚑ genetic status is sensitive ---
  'Anaemia', 'Iron-deficiency anaemia', 'Sickle cell disease',
  'Sickle cell trait', 'Thalassemia (major)', 'Thalassemia (minor/trait)',
  'G6PD deficiency', 'Haemophilia / Bleeding disorder',
  'Von Willebrand disease', 'Thrombocytopenia', 'Blood clotting disorder',
  // --- Gastro / hepatic ---
  'Acid reflux / GERD', 'Peptic ulcer', 'Irritable bowel syndrome (IBS)',
  'Inflammatory bowel disease', "Crohn's disease", 'Ulcerative colitis',
  'Coeliac disease', 'Lactose intolerance', 'Gallstones',
  'Hepatitis B  ⚑', 'Hepatitis C  ⚑', 'Fatty liver',
  // --- Renal / urinary ---
  'Chronic kidney disease', 'Kidney stones', 'Recurrent UTI',
  'Nephrotic syndrome',
  // --- Skin ---
  'Eczema', 'Psoriasis', 'Severe acne', 'Urticaria (chronic hives)',
  'Vitiligo', 'Fungal skin infection (recurrent)',
  // --- Autoimmune / musculoskeletal ---
  'Rheumatoid arthritis', 'Lupus (SLE)', 'Ankylosing spondylitis',
  'Juvenile arthritis', 'Scoliosis', 'Fibromyalgia', 'Gout',
  // --- Infectious diseases: India-endemic set ---
  // Sourced from ICMR notifiable/priority-pathogen data and NVBDCP-targeted
  // diseases. Curated to India-relevant + student-relevant; NOT the full
  // surveillance catalogue (free-text fallback covers rare ones). ⚑ = sensitive.
  // Tuberculosis — sub-classified as requested:
  'Tuberculosis — Pulmonary', 'Tuberculosis — Extrapulmonary',
  'Tuberculosis — Latent/past (treated)', 'Multidrug-resistant TB (MDR-TB)',
  // Leprosy (Hansen's disease) — still endemic in India:
  'Leprosy (Hansen\u2019s disease)',
  // Vector-borne / NTDs (NVBDCP-targeted):
  'Malaria', 'Dengue (recurrent/severe history)', 'Chikungunya',
  'Japanese encephalitis', 'Kala-azar (Visceral leishmaniasis)',
  'Post-kala-azar dermal leishmaniasis (PKDL)', 'Cutaneous leishmaniasis',
  'Lymphatic filariasis (Elephantiasis)', 'Scrub typhus',
  // Other endemic notifiable infections:
  'Typhoid / Enteric fever (recurrent)', 'Cholera', 'Amoebiasis',
  'Intestinal worms (Helminthiasis)', 'Viral encephalitis',
  'Hepatitis A', 'Hepatitis E', 'Chickenpox (Varicella)',
  'Chronic HIV  ⚑', 'Rheumatic fever (past)',
  // --- Vision / ENT ---
  'Colour blindness', 'High myopia', 'Glaucoma', 'Hearing impairment',
  // --- Neuromuscular / other ---
  'Muscular dystrophy', 'Cerebral palsy', 'Chronic fatigue syndrome',
  // --- Reproductive / other ---
  'Endometriosis', 'Fainting / Syncope episodes', 'Recurrent fractures',
];