const supabase = require("./config/supabaseAdmin");

const diseases = [
  { name: "Headache" },
  { name: "Migraine" },
  { name: "Common Cold" },
  { name: "Influenza" },
  { name: "Fever" },
  { name: "Cough" },
  { name: "Sore Throat" },
  { name: "Tonsillitis" },
  { name: "Pharyngitis" },
  { name: "Bronchitis" },
  { name: "Asthma" },
  { name: "Pneumonia" },
  { name: "Allergic Rhinitis" },
  { name: "Sinusitis" },
  { name: "Ear Infection" },
  { name: "Conjunctivitis" },
  { name: "Gastritis" },
  { name: "Gastroenteritis" },
  { name: "Diarrhea" },
  { name: "Constipation" },
  { name: "Acid Reflux" },
  { name: "Urinary Tract Infection" },
  { name: "Dysmenorrhea" },
  { name: "Hypertension" },
  { name: "Diabetes Mellitus" },
  { name: "Anemia" },
  { name: "Dengue Fever" },
  { name: "Typhoid Fever" },
  { name: "Chickenpox" },
  { name: "Measles" },
  { name: "Mumps" },
  { name: "Skin Allergy" },
  { name: "Contact Dermatitis" },
  { name: "Fungal Infection" },
  { name: "Scabies" },
  { name: "Sprain" },
  { name: "Muscle Strain" },
  { name: "Back Pain" },
  { name: "Toothache" },
  { name: "Anxiety Disorder" },
  { name: "Insomnia" },
  { name: "Vertigo" },
  { name: "Food Poisoning" },
  { name: "Heat Stroke" },
  { name: "Dehydration" },
];

async function seedDiseases() {
  console.log(`Seeding ${diseases.length} diseases...`);

  const { data, error } = await supabase
    .from("diseases")
    .insert(diseases)
    .select();

  if (error) {
    console.error("Error seeding diseases:", error.message);
    process.exit(1);
  }

  console.log(`Successfully seeded ${data.length} diseases.`);
  process.exit(0);
}

seedDiseases();
