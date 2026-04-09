const { db } = require('../data/db');

const DOSAGE_KEYWORDS = ['once', 'twice', 'thrice', 'daily', 'morning', 'night', 'evening', 'bd', 'tds', 'od', 'sos', 'after food', 'before food'];

function simulateOCR(imageBase64) {
  const prescriptionTexts = [
    `Dr. A. Sharma | MBBS, MD\nPatient: [REDACTED] | Date: ${new Date().toLocaleDateString()}\nRx:\n1. Tab. Paracetamol 500mg - Twice daily x 5 days\n2. Cap. Amoxicillin 250mg - Thrice daily x 7 days\n3. Tab. Cetirizine 10mg - Once daily at night x 5 days\n4. Vitamin D3 60K - Once weekly x 4 weeks\nAdvice: Take after food.`,
    `Dr. R. Verma | MD\nRx:\n1. Tab. Metformin 500mg - Twice daily\n2. Tab. Atorvastatin 10mg - Once at night\n3. Tab. Aspirin 75mg - Once daily after breakfast\nFollow up after 1 month.`,
    `Dr. S. Patel | Pediatrician\nRx:\n1. Syp. Paracetamol 250mg - 5ml thrice daily x 3 days\n2. Tab. Azithromycin 500mg - Once daily x 3 days\n3. Syp. Cetirizine 5mg - 2.5ml once daily`,
  ];
  return prescriptionTexts[Math.floor(Math.random() * prescriptionTexts.length)];
}

function extractMedicines(ocrText) {
  const lines = ocrText.split('\n').filter(l => l.trim());
  const medicines = [];

  for (const line of lines) {
    if (/^(Dr\.|Patient|Date:|Advice|Follow)/i.test(line.trim())) continue;

    const rxMatch = line.match(/^\d+\.\s*(?:Tab\.|Cap\.|Syp\.|Inj\.)?\s*([A-Za-z][A-Za-z\s]+?)\s+(\d+(?:\.\d+)?(?:mg|mcg|ml|g|IU|K)(?:\/\d+ml)?)\s*[-–]\s*(.+)/i);
    if (rxMatch) {
      const [, name, dosage, instruction] = rxMatch;
      const qtyMatch = instruction.match(/x\s*(\d+)\s*(day|week|month)/i);
      const quantity = qtyMatch ? `${qtyMatch[1]} ${qtyMatch[2]}s` : '1 strip';
      const freq = DOSAGE_KEYWORDS.find(k => instruction.toLowerCase().includes(k)) || 'As directed';
      medicines.push({ name: name.trim(), dosage: dosage.trim(), quantity, frequency: freq });
    }
  }

  return medicines.length > 0 ? medicines : [
    { name: 'Paracetamol 500mg', dosage: '500mg', quantity: '10 tablets', frequency: 'Twice daily' },
    { name: 'Cetirizine 10mg', dosage: '10mg', quantity: '5 tablets', frequency: 'Once daily' },
    { name: 'Vitamin D3 60K', dosage: '60K IU', quantity: '4 capsules', frequency: 'Weekly' },
  ];
}

function findAlternatives(medicineName) {
  const name = medicineName.toLowerCase();
  for (const [key, alts] of Object.entries(db.alternatives)) {
    if (name.includes(key)) return alts;
  }
  return [];
}

function redactSensitiveData(text) {
  return text
    .replace(/Patient:\s*[^\n|]+/gi, 'Patient: [REDACTED]')
    .replace(/\b\d{10}\b/g, '[PHONE REDACTED]')
    .replace(/Age:\s*\d+/gi, 'Age: [REDACTED]')
    .replace(/D\.O\.B[:\s]+[\d\/\-]+/gi, 'DOB: [REDACTED]');
}

module.exports = { simulateOCR, extractMedicines, findAlternatives, redactSensitiveData };
