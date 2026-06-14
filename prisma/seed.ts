import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DRUGS: { name: string; generic: string; category: string }[] = [
  { name: "Paracetamol", generic: "Acetaminophen", category: "Analgesic" },
  { name: "Ibuprofen", generic: "Ibuprofen", category: "Analgesic" },
  { name: "Aspirin", generic: "Acetylsalicylic Acid", category: "Antiplatelet" },
  { name: "Amoxicillin", generic: "Amoxicillin Trihydrate", category: "Antibiotic" },
  { name: "Azithromycin", generic: "Azithromycin", category: "Antibiotic" },
  { name: "Ciprofloxacin", generic: "Ciprofloxacin Hydrochloride", category: "Antibiotic" },
  { name: "Metformin", generic: "Metformin Hydrochloride", category: "Antidiabetic" },
  { name: "Glimepiride", generic: "Glimepiride", category: "Antidiabetic" },
  { name: "Omeprazole", generic: "Omeprazole", category: "Antacid" },
  { name: "Pantoprazole", generic: "Pantoprazole Sodium", category: "Antacid" },
  { name: "Amlodipine", generic: "Amlodipine Besylate", category: "Antihypertensive" },
  { name: "Atenolol", generic: "Atenolol", category: "Antihypertensive" },
  { name: "Losartan", generic: "Losartan Potassium", category: "Antihypertensive" },
  { name: "Cetirizine", generic: "Cetirizine Hydrochloride", category: "Antihistamine" },
  { name: "Loratadine", generic: "Loratadine", category: "Antihistamine" },
  { name: "Salbutamol", generic: "Albuterol Sulfate", category: "Bronchodilator" },
  { name: "Montelukast", generic: "Montelukast Sodium", category: "Antiasthmatic" },
  { name: "Atorvastatin", generic: "Atorvastatin Calcium", category: "Antilipidemic" },
  { name: "Simvastatin", generic: "Simvastatin", category: "Antilipidemic" },
  { name: "Levothyroxine", generic: "Levothyroxine Sodium", category: "Thyroid" },
  { name: "Prednisolone", generic: "Prednisolone", category: "Corticosteroid" },
  { name: "Dexamethasone", generic: "Dexamethasone", category: "Corticosteroid" },
  { name: "Diclofenac", generic: "Diclofenac Sodium", category: "NSAID" },
  { name: "Naproxen", generic: "Naproxen Sodium", category: "NSAID" },
  { name: "Tramadol", generic: "Tramadol Hydrochloride", category: "Analgesic" },
  { name: "Codeine", generic: "Codeine Phosphate", category: "Analgesic" },
  { name: "Cephalexin", generic: "Cephalexin Monohydrate", category: "Antibiotic" },
  { name: "Doxycycline", generic: "Doxycycline Hyclate", category: "Antibiotic" },
  { name: "Metronidazole", generic: "Metronidazole", category: "Antibiotic" },
  { name: "Clarithromycin", generic: "Clarithromycin", category: "Antibiotic" },
  { name: "Fluconazole", generic: "Fluconazole", category: "Antifungal" },
  { name: "Clotrimazole", generic: "Clotrimazole", category: "Antifungal" },
  { name: "Acyclovir", generic: "Acyclovir", category: "Antiviral" },
  { name: "Ondansetron", generic: "Ondansetron Hydrochloride", category: "Antiemetic" },
  { name: "Domperidone", generic: "Domperidone", category: "Antiemetic" },
  { name: "Ranitidine", generic: "Ranitidine Hydrochloride", category: "Antacid" },
  { name: "Furosemide", generic: "Furosemide", category: "Diuretic" },
  { name: "Hydrochlorothiazide", generic: "Hydrochlorothiazide", category: "Diuretic" },
  { name: "Spironolactone", generic: "Spironolactone", category: "Diuretic" },
  { name: "Warfarin", generic: "Warfarin Sodium", category: "Anticoagulant" },
  { name: "Clopidogrel", generic: "Clopidogrel Bisulfate", category: "Antiplatelet" },
  { name: "Insulin Glargine", generic: "Insulin Glargine", category: "Antidiabetic" },
  { name: "Sitagliptin", generic: "Sitagliptin Phosphate", category: "Antidiabetic" },
  { name: "Gabapentin", generic: "Gabapentin", category: "Anticonvulsant" },
  { name: "Carbamazepine", generic: "Carbamazepine", category: "Anticonvulsant" },
  { name: "Sertraline", generic: "Sertraline Hydrochloride", category: "Antidepressant" },
  { name: "Fluoxetine", generic: "Fluoxetine Hydrochloride", category: "Antidepressant" },
  { name: "Amitriptyline", generic: "Amitriptyline Hydrochloride", category: "Antidepressant" },
  { name: "Diazepam", generic: "Diazepam", category: "Anxiolytic" },
  { name: "Alprazolam", generic: "Alprazolam", category: "Anxiolytic" },
];

const STRENGTHS = [
  "250mg", "500mg", "5mg", "10mg", "20mg", "25mg", "40mg", "50mg",
  "75mg", "100mg", "200mg", "400mg", "650mg", "1g", "2.5mg", "12.5mg",
];

const FORMS = ["Tablet", "Capsule", "Syrup", "Injection", "Cream"];

const MANUFACTURERS = [
  "PharmaCorp", "MediLife", "HealthPlus", "BioCure", "ZenithMed",
  "CareWell", "NovaPharm", "GlobalRx", "PureMed", "TrustPharma",
];

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomExpiryDate() {
  const start = new Date("2026-06-01");
  const end = new Date("2029-12-31");
  const time = start.getTime() + Math.random() * (end.getTime() - start.getTime());
  return new Date(time);
}

function generateMedicines(count: number) {
  const medicines = [];
  const usedNames = new Set<string>();

  for (let i = 0; i < count; i++) {
    const drug = DRUGS[i % DRUGS.length];
    const strength = STRENGTHS[Math.floor(i / DRUGS.length) % STRENGTHS.length];
    const form = FORMS[Math.floor(i / (DRUGS.length * STRENGTHS.length)) % FORMS.length];
    const manufacturer = MANUFACTURERS[i % MANUFACTURERS.length];

    let name = `${drug.name} ${strength} ${form}`;
    let suffix = 1;
    while (usedNames.has(name)) {
      name = `${drug.name} ${strength} ${form} (${manufacturer} ${suffix})`;
      suffix++;
    }
    usedNames.add(name);

    const stockRoll = randomInt(1, 100);
    let stockQty: number;
    if (stockRoll <= 8) stockQty = 0;
    else if (stockRoll <= 25) stockQty = randomInt(1, 49);
    else stockQty = randomInt(50, 800);

    const lowStockThreshold = randomInt(30, 80);

    medicines.push({
      name,
      genericName: `${drug.generic} ${strength}`,
      category: drug.category,
      stockQty,
      lowStockThreshold,
      expiryDate: randomExpiryDate(),
    });
  }

  return medicines;
}

async function main() {
  console.log("Clearing existing medicines...");
  await prisma.medicine.deleteMany();

  const medicines = generateMedicines(2000);
  const batchSize = 500;

  console.log("Seeding 2000 medicines...");
  for (let i = 0; i < medicines.length; i += batchSize) {
    const batch = medicines.slice(i, i + batchSize);
    await prisma.medicine.createMany({ data: batch });
    console.log(`  Inserted ${Math.min(i + batchSize, medicines.length)} / 2000`);
  }

  const total = await prisma.medicine.count();
  console.log(`Done! ${total} medicines in database.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
