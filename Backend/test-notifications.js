/**
 * Notification System Test Script
 * 
 * Usage:
 *   node test-notifications.js seed      — Seed test data to trigger alerts
 *   node test-notifications.js check     — Trigger the alert check manually
 *   node test-notifications.js cleanup   — Remove all seeded test data
 *   node test-notifications.js full      — Seed → Check → verify (no cleanup)
 * 
 * The alert system requires:
 *   - At least 10 patients (MIN_POPULATION)
 *   - At least 5 cases of one disease (MIN_CASES)
 *   - That disease must be >= 10% of population (ALERT_THRESHOLD)
 *   - Medicine stock_level <= 10 for low stock alerts
 */

const supabase = require('./config/supabaseClient');
const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';
const TEST_TAG = 'TEST_SEED'; // Used to identify test data for cleanup

// ─── Test Patients (to reach population >= 10) ──────────────────────
const testPatients = [
  { student_id: 'TEST-001', first_name: 'Test', last_name: 'Patient A', email: 'testa@test.com', sex: 'Male', department: 'TEST', year_level: '1st Year' },
  { student_id: 'TEST-002', first_name: 'Test', last_name: 'Patient B', email: 'testb@test.com', sex: 'Female', department: 'TEST', year_level: '1st Year' },
  { student_id: 'TEST-003', first_name: 'Test', last_name: 'Patient C', email: 'testc@test.com', sex: 'Male', department: 'TEST', year_level: '2nd Year' },
  { student_id: 'TEST-004', first_name: 'Test', last_name: 'Patient D', email: 'testd@test.com', sex: 'Female', department: 'TEST', year_level: '2nd Year' },
  { student_id: 'TEST-005', first_name: 'Test', last_name: 'Patient E', email: 'teste@test.com', sex: 'Male', department: 'TEST', year_level: '3rd Year' },
  { student_id: 'TEST-006', first_name: 'Test', last_name: 'Patient F', email: 'testf@test.com', sex: 'Female', department: 'TEST', year_level: '3rd Year' },
];

// ─── Test Medicines (to trigger low stock alerts) ───────────────────
const testMedicines = [
  { medicine_name: 'TEST - Amoxicillin 500mg',  generic_name: 'Amoxicillin',  brand: 'TEST', type: 'Capsule',  dosage: '500mg', unit_of_measure: 'pcs', stock_level: 3,  batch_number: 'TEST-BATCH-001' },
  { medicine_name: 'TEST - Ibuprofen 200mg',    generic_name: 'Ibuprofen',    brand: 'TEST', type: 'Tablet',   dosage: '200mg', unit_of_measure: 'pcs', stock_level: 0,  batch_number: 'TEST-BATCH-002' },
  { medicine_name: 'TEST - Cetirizine 10mg',    generic_name: 'Cetirizine',   brand: 'TEST', type: 'Tablet',   dosage: '10mg',  unit_of_measure: 'pcs', stock_level: 8,  batch_number: 'TEST-BATCH-003' },
];

async function seed() {
  console.log('\n=== SEEDING TEST DATA ===\n');

  // 1. Get current counts
  const { count: currentPatients } = await supabase.from('patients').select('*', { count: 'exact', head: true });
  console.log(`Current patients: ${currentPatients}`);

  // 2. Insert test patients
  const { data: patients, error: patientError } = await supabase
    .from('patients')
    .upsert(testPatients, { onConflict: 'student_id' })
    .select();

  if (patientError) {
    console.error('Error inserting patients:', patientError.message);
    return false;
  }
  console.log(`Inserted/updated ${patients.length} test patients`);

  // 3. Get disease IDs
  const { data: diseases } = await supabase.from('diseases').select('id, name').order('name');
  if (!diseases?.length) {
    console.error('No diseases found in database!');
    return false;
  }

  console.log('\nAvailable diseases:');
  diseases.forEach(d => console.log(`  - ${d.name}`));

  // Pick "Dengue Fever" for our test — will add enough diagnoses to trigger alert
  const targetDisease = diseases.find(d => d.name.toLowerCase().includes('dengue'));
  if (!targetDisease) {
    console.error('Could not find Dengue Fever disease');
    return false;
  }

  // 4. Create test records for each test patient
  const testRecords = testPatients.map(p => ({
    first_name: p.first_name,
    last_name: p.last_name,
    student_id: p.student_id,
    department: p.department,
    year_level: p.year_level,
    sex: p.sex,
    email: p.email,
    attending_physician: TEST_TAG,
    status: 'COMPLETE'
  }));

  const { data: records, error: recordError } = await supabase
    .from('records')
    .insert(testRecords)
    .select('id, student_id');

  if (recordError) {
    console.error('Error inserting records:', recordError.message);
    return false;
  }
  console.log(`\nInserted ${records.length} test records`);

  // 5. Create diagnoses for those records — all with Dengue Fever
  const testDiagnoses = records.map(r => ({
    record_id: r.id,
    disease_id: targetDisease.id,
    diagnosis: `${targetDisease.name} — test case`,
    medication: 'Paracetamol',
    quantity: 1,
    treatment: 'Rest and hydration',
    notes: TEST_TAG
  }));

  const { data: diagnoses, error: diagError } = await supabase
    .from('diagnoses')
    .insert(testDiagnoses)
    .select();

  if (diagError) {
    console.error('Error inserting diagnoses:', diagError.message);
    return false;
  }
  console.log(`Inserted ${diagnoses.length} test diagnoses (all ${targetDisease.name})`);

  // 6. Show updated counts
  const { count: newPatients } = await supabase.from('patients').select('*', { count: 'exact', head: true });
  const { count: newDiagnoses } = await supabase.from('diagnoses').select('*', { count: 'exact', head: true });
  
  // Count Dengue cases specifically
  const { count: dengueCases } = await supabase.from('diagnoses').select('*', { count: 'exact', head: true }).eq('disease_id', targetDisease.id);

  console.log(`\n--- Updated Counts ---`);
  console.log(`Total patients:   ${newPatients} (threshold: 10)`);
  console.log(`Total diagnoses:  ${newDiagnoses}`);
  console.log(`Dengue cases:     ${dengueCases} (threshold: 5)`);
  console.log(`Dengue %:         ${((dengueCases / newPatients) * 100).toFixed(1)}% (threshold: 10%)`);

  const willAlert = newPatients >= 10 && dengueCases >= 5 && (dengueCases / newPatients) * 100 >= 10;
  console.log(`\nDisease alert will trigger: ${willAlert ? 'YES' : 'NO'}`);

  // 7. Insert test medicines with low stock
  console.log('\n--- Low Stock Medicines ---');

  const { data: meds, error: medError } = await supabase
    .from('medicines')
    .insert(testMedicines)
    .select();

  if (medError) {
    console.error('Error inserting medicines:', medError.message);
  } else {
    console.log(`Inserted ${meds.length} test medicines:`);
    meds.forEach(m => {
      const status = m.stock_level === 0 ? 'OUT OF STOCK' : `${m.stock_level} units (LOW)`;
      console.log(`  - ${m.medicine_name}: ${status}`);
    });
    console.log(`\nLow stock alert will trigger: YES (threshold: ≤ 10 units)`);
  }
  
  return true;
}

async function checkAlerts() {
  console.log('\n=== TRIGGERING ALERT CHECK ===\n');

  try {
    const response = await axios.post(`${API_BASE}/check-alerts`);
    const data = response.data;

    console.log(`Status: ${data.success ? 'SUCCESS' : 'FAILED'}`);
    console.log(`Message: ${data.message}`);

    if (data.notifications?.length > 0) {
      console.log(`\nCreated ${data.notifications.length} notifications:`);
      data.notifications.forEach(n => {
        console.log(`  [${n.user_id.slice(0, 8)}...] ${n.title}`);
      });
    } else if (data.alerts?.length === 0) {
      console.log('\nNo diseases crossed the alert threshold.');
    }

    return data;
  } catch (err) {
    console.error('Error calling check-alerts:', err.response?.data || err.message);
    console.log('\nMake sure the backend server is running on port 3000!');
    return null;
  }
}

async function cleanup() {
  console.log('\n=== CLEANING UP TEST DATA ===\n');

  // 1. Delete test diagnoses (tagged with TEST_SEED in notes)
  const { data: deletedDiag, error: diagError } = await supabase
    .from('diagnoses')
    .delete()
    .eq('notes', TEST_TAG)
    .select('id');

  if (diagError) console.error('Error deleting diagnoses:', diagError.message);
  else console.log(`Deleted ${deletedDiag?.length || 0} test diagnoses`);

  // 2. Delete test records (tagged with TEST_SEED in attending_physician)
  const { data: deletedRecords, error: recError } = await supabase
    .from('records')
    .delete()
    .eq('attending_physician', TEST_TAG)
    .select('id');

  if (recError) console.error('Error deleting records:', recError.message);
  else console.log(`Deleted ${deletedRecords?.length || 0} test records`);

  // 3. Delete test patients (department = TEST)
  const { data: deletedPatients, error: patError } = await supabase
    .from('patients')
    .delete()
    .eq('department', TEST_TAG)
    .select('id');

  // If the TEST department didn't work, try by student_id prefix
  if (!deletedPatients?.length) {
    const { data: dp2 } = await supabase
      .from('patients')
      .delete()
      .like('student_id', 'TEST-%')
      .select('id');
    console.log(`Deleted ${dp2?.length || 0} test patients`);
  } else {
    console.log(`Deleted ${deletedPatients?.length || 0} test patients`);
  }

  // 4. Delete test notifications (disease alerts + low stock alerts)
  const { data: deletedNotifs } = await supabase
    .from('notifications')
    .delete()
    .or('title.like.%Disease Alert:%,title.like.%Low Stock Alert: TEST%')
    .select('id');

  console.log(`Deleted ${deletedNotifs?.length || 0} alert notifications`);

  // 5. Delete test medicines (brand = TEST)
  const { data: deletedMeds } = await supabase
    .from('medicines')
    .delete()
    .eq('brand', 'TEST')
    .select('id');

  console.log(`Deleted ${deletedMeds?.length || 0} test medicines`);

  console.log('\nCleanup complete!');
}

async function full() {
  const seeded = await seed();
  if (!seeded) {
    console.log('\nSeed failed, aborting.');
    return;
  }

  // Small delay to let DB settle
  await new Promise(r => setTimeout(r, 1000));
  
  await checkAlerts();

  console.log('\n=== TEST COMPLETE ===');
  console.log('Open the app in browser and check:');
  console.log('  1. Red notification badge on sidebar');
  console.log('  2. Notifications page for:');
  console.log('     - Disease alerts (amber warning icon)');
  console.log('     - Low stock medicine alerts (rose pills icon)');
  console.log('\nWhen done, run: node test-notifications.js cleanup');
}

// ─── CLI ────────────────────────────────────────────────────────────
const command = process.argv[2] || 'full';

switch (command) {
  case 'seed':
    seed().then(() => process.exit());
    break;
  case 'check':
    checkAlerts().then(() => process.exit());
    break;
  case 'cleanup':
    cleanup().then(() => process.exit());
    break;
  case 'full':
    full().then(() => process.exit());
    break;
  default:
    console.log('Usage: node test-notifications.js [seed|check|cleanup|full]');
    process.exit(1);
}
