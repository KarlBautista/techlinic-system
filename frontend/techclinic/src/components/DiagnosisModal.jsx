import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import emailjs from '@emailjs/browser'
import supabase from '../config/supabaseClient'
import useAuth from '../store/useAuthStore'
import tupLogo from '../assets/image/TUP.png'
import { validateEmail, validateExcusedDays, LIMITS } from '../lib/validation'

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY
const PRESC_TMPL = import.meta.env.VITE_EMAILJS_PRESCRIPTION_TEMPLATE_ID
const CERT_TMPL = import.meta.env.VITE_EMAILJS_CERTIFICATE_TEMPLATE_ID

const DiagnosisModal = ({ open = false, onClose = () => { }, patient = {}, record = {}, diagnoses = [] }) => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('prescription');
  const [physicianData, setPhysicianData] = useState(null);
  const prevTabRef = useRef(activeTab);

  // Email compose state
  const [showCompose, setShowCompose] = useState(false);
  const [emailTo, setEmailTo] = useState('');
  const [sending, setSending] = useState(false);
  const [emailStatus, setEmailStatus] = useState(null); // 'success' | 'error' | null
  const [showSignature, setShowSignature] = useState(true);
  const [timeDischarged, setTimeDischarged] = useState('');
  const [excusedDays, setExcusedDays] = useState('');

  // Reset tab on open
  useEffect(() => {
    if (open) {
      setActiveTab('prescription');
      setTimeDischarged('');
      setExcusedDays('');
    }
  }, [open]);

  // Fetch attending physician's signature and info when modal opens
  useEffect(() => {
    const fetchPhysicianSignature = async () => {
      if (!open || !record) return;

      // Try to fetch by attending_physician_id first
      if (record.attending_physician_id) {
        try {
          const { data, error } = await supabase
            .from('users')
            .select('signature_url, first_name, last_name, role')
            .eq('id', record.attending_physician_id)
            .single();

          if (!error && data) {
            setPhysicianData(data);
            return;
          }
        } catch (err) {
          console.error('Error fetching physician by ID:', err);
        }
      }

      // Fallback: try matching by attending_physician name
      if (record.attending_physician) {
        try {
          const nameParts = record.attending_physician.trim().split(' ');
          let query = supabase.from('users').select('signature_url, first_name, last_name, role');

          if (nameParts.length >= 2) {
            query = query.eq('first_name', nameParts[0]).eq('last_name', nameParts.slice(1).join(' '));
          } else {
            query = query.or(`first_name.eq.${nameParts[0]},last_name.eq.${nameParts[0]}`);
          }

          const { data, error } = await query.limit(1).single();

          if (!error && data) {
            setPhysicianData(data);
            return;
          }
        } catch (err) {
          console.error('Error fetching physician by name:', err);
        }
      }

      setPhysicianData(null);
    };

    fetchPhysicianSignature();
  }, [open, record]);

  // Fallback: use logged-in user's profile when record has no attending physician
  const effectivePhysician = physicianData || (userProfile ? {
    signature_url: userProfile.signature_url,
    first_name: userProfile.first_name,
    last_name: userProfile.last_name,
    role: userProfile.role,
  } : null);

  const handleClose = () => {
    onClose();
  };

  // Track tab changes for animation
  useEffect(() => {
    prevTabRef.current = activeTab;
  }, [activeTab]);

  const handlePrint = () => window.print();

  const openCompose = () => {
    setEmailTo(patient?.email ?? '');
    setEmailStatus(null);
    setShowCompose(true);
  };

  const sendEmail = async () => {
    const emailErr = validateEmail(emailTo);
    if (emailErr) {
      setEmailStatus('error');
      return;
    }
    setSending(true);
    setEmailStatus(null);

    const templateId = activeTab === 'prescription' ? PRESC_TMPL : CERT_TMPL;
    const physicianName = effectivePhysician
      ? `${effectivePhysician.first_name ?? ''} ${effectivePhysician.last_name ?? ''}`.trim()
      : record?.attending_physician ?? '';
    const templateParams = {
      to_email: emailTo.trim(),
      to_name: `${patient?.first_name ?? ''} ${patient?.last_name ?? ''}`.trim(),
      patient_id: patient?.student_id ?? patient?.id ?? '—',
      date: visitDate,
      time_entered: visitTime || '—',
      diagnosis: primaryDiagnosis?.diagnosis ?? '—',
      treatment: primaryDiagnosis?.treatment ?? '—',
      physician_name: physicianName,
      physician_role: effectivePhysician?.role === 'DOCTOR' ? 'Attending Physician' : 'Attending Personnel',
      physician_signature: effectivePhysician?.signature_url ?? '',
      ...(activeTab === 'prescription' ? {
        medication: primaryDiagnosis?.medication ?? '—',
        dosage: primaryDiagnosis?.dosage ?? '—',
        quantity: primaryDiagnosis?.quantity ?? '—',
        notes: primaryDiagnosis?.notes ?? primaryDiagnosis?.additional_notes ?? '—',
        time_discharged: timeDischarged.trim() || '__________',
      } : {
        medication: primaryDiagnosis?.medication ?? '—',
        quantity: primaryDiagnosis?.quantity ?? '—',
        notes: primaryDiagnosis?.notes ?? primaryDiagnosis?.additional_notes ?? '—',
        excused_days: excusedDays || '—',
      }),
    };

    console.log('[EmailJS] Sending with params:', { SERVICE_ID, templateId, PUBLIC_KEY: PUBLIC_KEY?.slice(0, 6) + '...', templateParams });

    try {
      await emailjs.send(SERVICE_ID, templateId, templateParams, PUBLIC_KEY);
      setEmailStatus('success');
      setTimeout(() => setShowCompose(false), 2000);
    } catch (err) {
      console.error('EmailJS error:', err);
      setEmailStatus('error');
    } finally {
      setSending(false);
    }
  };

  // Get the first diagnosis for prescription/certificate (usually one per visit)
  const primaryDiagnosis = diagnoses[0] || {};

  const visitDate = primaryDiagnosis?.created_at
    ? new Date(primaryDiagnosis.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const visitTime = primaryDiagnosis?.created_at
    ? new Date(primaryDiagnosis.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={handleClose}
        >
          <div className="absolute inset-0 bg-black/60" />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-3xl max-h-[90vh] bg-white dark:bg-[#161B26] rounded-2xl shadow-2xl flex flex-col overflow-hidden mx-4"
          >
            {/* Header */}
            <div className="px-6 pt-5 pb-3 print:hidden">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Record Details</h2>
                <div className="flex items-center gap-1">
                  {record?.status === 'COMPLETE' && (
                    <>
                      <button
                        onClick={handlePrint}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 dark:text-[#94969C] hover:text-emerald-600 hover:bg-gray-100 dark:hover:bg-[#1F242F] transition-colors"
                        title="Print"
                      >
                        <i className="fa-solid fa-print text-sm"></i>
                      </button>
                      <button
                        onClick={openCompose}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 dark:text-[#94969C] hover:text-blue-600 hover:bg-gray-100 dark:hover:bg-[#1F242F] transition-colors"
                        title="Email"
                      >
                        <i className="fa-solid fa-envelope text-sm"></i>
                      </button>
                    </>
                  )}
                  <button
                    onClick={handleClose}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 dark:text-[#94969C] hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1F242F] transition-colors"
                  >
                    <i className="fa-solid fa-xmark text-sm"></i>
                  </button>
                </div>
              </div>
            </div>

        {record?.status === 'COMPLETE' ? (
          <>
            {/* Tab Toggle */}
            <div className="flex items-center justify-center px-6 py-3 border-b print:hidden">
              <div className="relative inline-flex items-center bg-gray-100 dark:bg-[#1F242F] rounded-full p-1">
                {/* Sliding pill */}
                <div
                  className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white dark:bg-[#333741] rounded-full shadow-sm transition-transform duration-300 ease-in-out"
                  style={{ transform: activeTab === 'certificate' ? 'translateX(calc(100% + 8px))' : 'translateX(0)' }}
                />
                <button
                  onClick={() => setActiveTab('prescription')}
                  className={`relative z-10 px-5 py-1.5 text-sm font-medium rounded-full transition-colors duration-300 ${activeTab === 'prescription' ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}
                >
                  Prescription
                </button>
                <button
                  onClick={() => setActiveTab('certificate')}
                  className={`relative z-10 px-5 py-1.5 text-sm font-medium rounded-full transition-colors duration-300 ${activeTab === 'certificate' ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}
                >
                  Certificate
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-6 overflow-auto flex-1 scrollbar-notifications">
              <div key={activeTab} className="tab-content-enter">
                {activeTab === 'prescription' && (
                  <PrescriptionTab patient={patient} diagnosis={primaryDiagnosis} visitDate={visitDate} visitTime={visitTime} timeDischarged={timeDischarged} onTimeDischargedChange={setTimeDischarged} physicianData={effectivePhysician} attendingPhysician={record?.attending_physician} showSignature={showSignature} />
                )}
                {activeTab === 'certificate' && (
                  <CertificateTab patient={patient} diagnosis={primaryDiagnosis} visitDate={visitDate} excusedDays={excusedDays} onExcusedDaysChange={setExcusedDays} physicianData={effectivePhysician} attendingPhysician={record?.attending_physician} showSignature={showSignature} />
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-12">
            <div className="text-center">
              <i className="fa-solid fa-clock text-4xl text-yellow-400 mb-3"></i>
              <p className="text-gray-500 dark:text-[#94969C] font-medium">This record is still pending.</p>
              <p className="text-sm text-gray-400 mt-1">Prescription and certificate will be available once the visit is complete.</p>
              {userProfile?.role === 'DOCTOR' && record?.id && (
                <button
                  onClick={() => { onClose(); navigate(`/add-diagnosis/${record.id}`); }}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-crimson-600 hover:bg-crimson-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <i className="fa-solid fa-stethoscope"></i>
                  Proceed to Diagnose
                </button>
              )}
            </div>
          </div>
        )}
          </motion.div>

          {/* Email compose sub-modal */}
          {showCompose && (
            <div
              className="fixed inset-0 z-[60] flex items-center justify-center"
              onClick={(e) => {
                e.stopPropagation();
                if (e.target === e.currentTarget && !sending) setShowCompose(false);
              }}
            >
          <div className="absolute inset-0 bg-black/50 -z-10" />
          <div
            className="relative z-10 w-[min(480px,95%)] bg-white dark:bg-[#161B26] rounded-xl shadow-xl p-6"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-gray-800 dark:text-white">
                {activeTab === 'prescription' ? 'Send Prescription via Email' : 'Send Certificate via Email'}
              </h3>
              <button
                onClick={() => setShowCompose(false)}
                disabled={sending}
                className="text-gray-400 dark:text-[#94969C] hover:text-gray-600 dark:hover:text-gray-300  transition disabled:opacity-40"
              >
                <i className="fa-solid fa-xmark text-sm" />
              </button>
            </div>

            {/* Summary */}
            <div className="bg-gray-50 dark:bg-[#1F242F] rounded-lg p-3 mb-4 text-sm space-y-1 text-gray-600 dark:text-[#94969C] border border-gray-200 dark:border-[#1F2A37]">
              <p><span className="font-medium text-gray-800 dark:text-white">Patient:</span> {patient?.first_name} {patient?.last_name}</p>
              <p><span className="font-medium text-gray-800 dark:text-white">ID:</span> {patient?.student_id ?? patient?.id ?? '—'}</p>
              <p><span className="font-medium text-gray-800 dark:text-white">Date:</span> {visitDate}</p>
              {activeTab === 'prescription' && primaryDiagnosis?.medication && (
                <p><span className="font-medium text-gray-800 dark:text-white">Medication:</span> {primaryDiagnosis.medication}</p>
              )}
            </div>

            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Recipient Email</label>
            <input
              type="email"
              value={emailTo}
              onChange={(e) => setEmailTo(e.target.value)}
              maxLength={LIMITS.EMAIL_MAX}
              placeholder="patient@email.com"
              className="w-full border border-gray-300 dark:border-[#333741] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 mb-4"
            />

            {emailStatus === 'success' && (
              <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-lg px-3 py-2 flex items-center gap-2">
                <i className="fa-solid fa-circle-check" /> Email sent successfully!
              </div>
            )}
            {emailStatus === 'error' && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2 flex items-center gap-2">
                <i className="fa-solid fa-circle-exclamation" /> Failed to send. Check your EmailJS configuration.
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowCompose(false)}
                disabled={sending}
                className="px-4 py-2 text-sm bg-gray-100 dark:bg-[#1F242F] text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200  transition disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                onClick={sendEmail}
                disabled={sending || !emailTo.trim()}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
              >
                {sending ? (
                  <><i className="fa-solid fa-spinner animate-spin" /> Sending...</>
                ) : (
                  <><i className="fa-solid fa-paper-plane" /> Send Email</>
                )}
              </button>
            </div>

          </div>
        </div>
      )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* ────────────────────────── Record Details Tab ────────────────────────── */
const RecordTab = ({ patient, record, diagnoses, visitDate }) => {
  const primaryDiag = diagnoses[0] || {};

  return (
    <div className="flex flex-col lg:flex-row gap-5">
      {/* ═══ Left Column ═══ */}
      <div className="w-full lg:w-[60%] flex flex-col gap-5">
        {/* ─── Student Information ─── */}
        <div className="bg-white dark:bg-[#161B26] rounded-xl ring-1 ring-gray-100 dark:ring-[#1F2A37] shadow-sm p-5">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <i className="fa-solid fa-user text-blue-600 text-sm"></i>
            </div>
            <h4 className="text-sm font-semibold text-gray-800 dark:text-white">Student Information</h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
            <div>
              <span className="text-xs font-medium text-gray-400 dark:text-[#94969C] uppercase tracking-wider">Name</span>
              <p className="font-medium text-gray-800 dark:text-white mt-0.5">{patient?.first_name ?? ''} {patient?.last_name ?? ''}</p>
            </div>
            <div>
              <span className="text-xs font-medium text-gray-400 dark:text-[#94969C] uppercase tracking-wider">Patient ID</span>
              <p className="font-medium text-gray-800 dark:text-white mt-0.5">{patient?.student_id ?? record?.student_id ?? '—'}</p>
            </div>
          </div>
          <div className="h-px bg-gray-100 dark:bg-[#1F242F] my-3" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
            <div>
              <span className="text-xs font-medium text-gray-400 dark:text-[#94969C] uppercase tracking-wider">Department</span>
              <p className="font-medium text-gray-800 dark:text-white mt-0.5">{patient?.department ?? record?.department ?? '—'}</p>
            </div>
            <div>
              <span className="text-xs font-medium text-gray-400 dark:text-[#94969C] uppercase tracking-wider">Year Level</span>
              <p className="font-medium text-gray-800 dark:text-white mt-0.5">{patient?.year_level ?? record?.year_level ?? '—'}</p>
            </div>
          </div>
          <div className="h-px bg-gray-100 dark:bg-[#1F242F] my-3" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
            <div>
              <span className="text-xs font-medium text-gray-400 dark:text-[#94969C] uppercase tracking-wider">Sex</span>
              <p className="font-medium text-gray-800 dark:text-white mt-0.5">{patient?.sex ?? '—'}</p>
            </div>
            <div>
              <span className="text-xs font-medium text-gray-400 dark:text-[#94969C] uppercase tracking-wider">Contact</span>
              <p className="font-medium text-gray-800 dark:text-white mt-0.5">{patient?.contact_number ?? '—'}</p>
            </div>
          </div>
          <div className="h-px bg-gray-100 dark:bg-[#1F242F] my-3" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
            <div>
              <span className="text-xs font-medium text-gray-400 dark:text-[#94969C] uppercase tracking-wider">Date of Visit</span>
              <p className="font-medium text-gray-800 dark:text-white mt-0.5">{visitDate}</p>
            </div>
            <div>
              <span className="text-xs font-medium text-gray-400 dark:text-[#94969C] uppercase tracking-wider">Status</span>
              <div className="mt-0.5">
                <span className={`inline-block px-2.5 py-0.5 rounded-lg text-xs font-semibold ${record?.status === 'COMPLETE' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                  {record?.status ?? '—'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Medical Details ─── */}
        <div className="bg-white dark:bg-[#161B26] rounded-xl ring-1 ring-gray-100 dark:ring-[#1F2A37] shadow-sm p-5">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
              <i className="fa-solid fa-stethoscope text-red-600 text-sm"></i>
            </div>
            <h4 className="text-sm font-semibold text-gray-800 dark:text-white">Medical Details</h4>
          </div>

          {diagnoses.length > 0 ? (
            <div className="space-y-3">
              {diagnoses.map((d, idx) => (
                <div key={d?.id ?? idx} className={`text-sm ${idx > 0 ? 'pt-3 border-t border-gray-100 dark:border-[#1F2A37]' : ''}`}>
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-semibold text-gray-800 dark:text-white">{d?.diagnosis || 'Untitled Diagnosis'}</span>
                    <span className="text-xs text-gray-400 dark:text-[#94969C]">
                      {d?.created_at ? new Date(d.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : ''}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                    <div>
                      <span className="text-xs font-medium text-gray-400 dark:text-[#94969C] uppercase tracking-wider">Medication</span>
                      <p className="font-medium text-gray-800 dark:text-white mt-0.5">{d?.medication ?? '—'}</p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-gray-400 dark:text-[#94969C] uppercase tracking-wider">Quantity</span>
                      <p className="font-medium text-gray-800 dark:text-white mt-0.5">{d?.quantity ?? '—'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 dark:text-[#94969C] text-sm">No diagnoses recorded for this visit.</p>
          )}
        </div>
      </div>

      {/* ═══ Right Column — Treatment & Notes ═══ */}
      <div className="w-full lg:w-[40%] bg-white dark:bg-[#161B26] rounded-xl ring-1 ring-gray-100 dark:ring-[#1F2A37] shadow-sm p-5 flex flex-col">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
            <i className="fa-solid fa-file-medical text-emerald-600 text-sm"></i>
          </div>
          <h4 className="text-sm font-semibold text-gray-800 dark:text-white">Treatment & Notes</h4>
        </div>

        <div className="flex flex-col gap-4 flex-1 text-sm">
          <div>
            <span className="text-xs font-medium text-gray-400 dark:text-[#94969C] uppercase tracking-wider">Attending Physician</span>
            <p className="font-medium text-gray-800 dark:text-white mt-0.5">{record?.attending_physician ?? '—'}</p>
          </div>

          <div className="h-px bg-gray-100 dark:bg-[#1F242F]" />

          <div className="flex-1">
            <span className="text-xs font-medium text-gray-400 dark:text-[#94969C] uppercase tracking-wider">Treatment</span>
            <div className="mt-1.5 bg-gray-50 dark:bg-[#1F242F] rounded-xl border border-gray-100 dark:border-[#1F2A37] p-3 min-h-[80px]">
              <p className="text-gray-800 dark:text-white whitespace-pre-wrap">{primaryDiag?.treatment ?? '—'}</p>
            </div>
          </div>

          <div className="h-px bg-gray-100 dark:bg-[#1F242F]" />

          <div className="flex-1">
            <span className="text-xs font-medium text-gray-400 dark:text-[#94969C] uppercase tracking-wider">Additional Notes</span>
            <div className="mt-1.5 bg-gray-50 dark:bg-[#1F242F] rounded-xl border border-gray-100 dark:border-[#1F2A37] p-3 min-h-[80px]">
              <p className="text-gray-800 dark:text-white whitespace-pre-wrap">{primaryDiag?.notes ?? '—'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ────────────────────────── Prescription Tab ────────────────────────── */
const PrescriptionTab = ({ patient, diagnosis, visitDate, visitTime, timeDischarged, onTimeDischargedChange, physicianData, attendingPhysician, showSignature }) => {
  const physicianName = physicianData
    ? `${physicianData.first_name || ''} ${physicianData.last_name || ''}`.trim()
    : attendingPhysician || '';

  return (
    <div className="bg-white dark:bg-white text-gray-800 dark:text-gray-800 max-w-2xl w-full mx-auto rounded-lg border border-gray-300 dark:border-gray-300">
      {/* Prescription Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <img src={tupLogo} alt="TUP Logo" className="w-12 h-12 object-contain" />
            <span className="text-5xl font-serif font-bold text-gray-800 dark:text-gray-800 leading-none">R<sub className="text-3xl">x</sub></span>
          </div>
          <div className="text-[11px] text-center mt-1 text-gray-700 dark:text-gray-700">
            Ayala Blvd, Ermita, Manila, 1000, Philippines | Tel No. +632-5301-3001 local 607
            <br />
            Flex No. +632-8521-4063 | Email: clinic@tup.edu.ph | Website: www.tup.edu.ph
          </div>
        </div>
      </div>

      {/* Date / time row */}
      <div className="px-4 py-3 text-sm border-b border-gray-300 dark:border-[#333741]">
        <div className="flex gap-8">
          <span>Date: <span className="font-medium underline">{visitDate}</span></span>
          <span>Time Entered: <span className="font-medium underline">{visitTime || '__________'}</span></span>
          <span>
            Time Discharged:{' '}
            <input
              type="text"
              inputMode="numeric"
              value={timeDischarged}
              onChange={(e) => onTimeDischargedChange(e.target.value.replace(/[^0-9]/g, ''))}
              maxLength={4}
              placeholder="__________"
              className="w-24 text-center font-medium underline outline-none bg-transparent"
            />
          </span>
        </div>
      </div>

      {/* Patient info */}
      <div className="px-4 py-4 text-sm space-y-2 border-b border-gray-300 dark:border-[#333741]">
        <div>
          <span className="text-xs text-gray-400 dark:text-[#94969C] uppercase tracking-wider">Diagnosis</span>
          <p className="text-sm font-medium text-gray-800">
            {diagnosis?.diagnosis || <span className="italic text-gray-400 dark:text-[#94969C]">N/A</span>}
          </p>
        </div>
        <div>
          <span className="text-xs text-gray-400 dark:text-[#94969C] uppercase tracking-wider">Treatment</span>
          <p className="text-sm text-gray-800 dark:text-gray-800 whitespace-pre-wrap">{diagnosis?.treatment || 'N/A'}</p>
        </div>
      </div>

      {/* Rx Symbol */}
      <div className="px-4 pt-4 pb-1">
        <span className="text-3xl font-bold italic text-gray-800 dark:text-gray-800" style={{ fontFamily: 'serif' }}>&#8478;</span>
      </div>

      {/* Diagnosis / reason */}
      <div className="px-4 py-4 text-sm space-y-1 border-b border-gray-300 dark:border-[#333741]">
        <p>This is to inform you that the above came to the clinic due to:</p>
        <p className="font-medium mt-1 min-h-6 underline text-gray-800 dark:text-gray-800">{diagnosis?.diagnosis ?? ''}</p>
      </div>

      {/* Medication & treatment */}
      <div className="px-4 py-4 text-sm space-y-2 border-b border-gray-300 dark:border-[#333741]">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-gray-500 dark:text-[#94969C]">Medication:</span>{' '}
            <span className="font-medium">{diagnosis?.medication ?? '—'}</span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-[#94969C]">Quantity:</span>{' '}
            <span className="font-medium">{diagnosis?.quantity ?? '—'}</span>
          </div>
        </div>
        <div>
          <span className="text-gray-500 dark:text-[#94969C]">Treatment:</span>{' '}
          <span className="font-medium">{diagnosis?.treatment ?? '—'}</span>
        </div>
      </div>

      {/* Remarks */}
      <div className="px-4 py-4 text-sm space-y-1 border-b border-gray-300 dark:border-[#333741]">
        <p>Remarks:</p>
        <p className="font-medium min-h-6 text-gray-800 dark:text-gray-800">{diagnosis?.notes ?? ''}</p>
      </div>

      {/* Checkboxes */}
      <div className="flex justify-between items-center px-4 py-3 text-sm border-b border-gray-300 dark:border-[#333741]">
        <label className="flex items-center gap-2 text-gray-800 dark:text-gray-800">
          <input type="checkbox" /> Medical Certificate / Clinic Pass
        </label>
        <label className="flex items-center gap-2 text-gray-800 dark:text-gray-800">
          <input type="checkbox" /> Referral for Counselling
        </label>
        <label className="flex items-center gap-2 text-gray-800 dark:text-gray-800">
          <input type="checkbox" /> For Quarantine
        </label>
      </div>

      {/* Footer */}
      <div className="px-4 py-6 text-center text-sm text-gray-600 dark:text-[#94969C]">
        If you have any questions; please feel free to call us at Medical-Dental Clinic.
      </div>

      <div className="px-4 pb-6 text-right text-sm text-gray-900 dark:text-gray-900">
        <div className="inline-block text-center">
          {showSignature && physicianData?.signature_url ? (
            <img
              src={diagnosis?.physician_signature_url || physicianData?.signature_url}
              alt="Physician signature"
              className="max-h-20 max-w-[200px] object-contain mx-auto mb-1"
            />
          ) : (
            <div className="w-48 border-b border-gray-300 mb-1" />
          )}
          <div className="border-t border-gray-900 dark:border-gray-900 pt-1 px-4">
            <div className="font-medium">
              {physicianData
                ? `${physicianData.first_name || ''} ${physicianData.last_name || ''}`.trim()
                : attendingPhysician || ''}
            </div>
            <div className="text-gray-600 dark:text-[#94969C]">
              {physicianData?.role === 'DOCTOR' ? 'Attending Physician' : 'Attending Personnel'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ────────────────────────── Certificate Tab ────────────────────────── */
const CertificateTab = ({ patient, diagnosis, visitDate, excusedDays, onExcusedDaysChange, physicianData, attendingPhysician, showSignature }) => {
  return (
    <div className="bg-white dark:bg-white text-gray-800 dark:text-gray-800 max-w-2xl w-full mx-auto rounded-lg border border-gray-300 dark:border-gray-300">
      {/* Certificate Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-shrink-0">
            <img src={tupLogo} alt="TUP Logo" className="w-12 h-12 object-contain" />
            <span className="text-lg font-bold text-gray-800 dark:text-gray-800 tracking-wide">MEDICAL CERTIFICATE</span>
          </div>
          <div className="text-[11px] text-right mt-1 text-gray-700 dark:text-gray-700">
            Ayala Blvd, Ermita, Manila, 1000, Philippines
            <br />
            Tel No. +632-5301-3001 local 607
            <br />
            Flex No. +632-8521-4063 | Email: clinic@tup.edu.ph
          </div>
        </div>
      </div>

      {/* Date row */}
      <div className="px-4 py-3 text-sm border-b border-gray-300 dark:border-[#333741]">
        <span>Date: <span className="font-medium underline">{visitDate}</span></span>
      </div>

      {/* To whom it may concern */}
      <div className="px-4 py-4 text-sm border-b border-gray-300 dark:border-[#333741]">
        <p className="font-semibold mb-2 text-gray-800 dark:text-gray-800">TO WHOM IT MAY CONCERN:</p>
        <p>
          This is to certify that{' '}
          <span className="font-medium underline">{patient?.first_name ?? ''} {patient?.last_name ?? ''}</span>{' '}
          (ID: <span className="font-medium underline">{patient?.student_id ?? '—'}</span>){' '}
          was examined at the Medical-Dental Clinic on{' '}
          <span className="font-medium underline">{visitDate}</span>.
        </p>
      </div>

      {/* Findings */}
      <div className="px-4 py-4 text-sm space-y-1 border-b border-gray-300 dark:border-[#333741]">
        <span className="text-xs text-gray-400 dark:text-[#94969C] uppercase tracking-wider">Findings</span>
        <p className="font-medium min-h-6 text-gray-800 dark:text-gray-800">
          {diagnosis?.diagnosis ?? ''}
          {diagnosis?.treatment ? ` — Treatment: ${diagnosis.treatment}` : ''}
        </p>
      </div>

      {/* Medication */}
      <div className="px-4 py-4 text-sm border-b border-gray-300 dark:border-[#333741]">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-xs text-gray-400 dark:text-[#94969C] uppercase tracking-wider">Medication Prescribed</span>
            <p className="font-medium mt-1 text-gray-800 dark:text-gray-800">{diagnosis?.medication ?? '—'}</p>
          </div>
          <div>
            <span className="text-xs text-gray-400 dark:text-[#94969C] uppercase tracking-wider">Quantity</span>
            <p className="font-medium mt-1 text-gray-800 dark:text-gray-800">{diagnosis?.quantity ?? '—'}</p>
          </div>
        </div>
      </div>

      {/* Recommendation */}
      <div className="px-4 py-4 text-sm space-y-1 border-b border-gray-300 dark:border-[#333741]">
        <span className="text-xs text-gray-400 dark:text-[#94969C] uppercase tracking-wider">Recommendation</span>
        <p className="font-medium min-h-6 text-gray-800 dark:text-gray-800">{diagnosis?.notes ?? ''}</p>
      </div>

      {/* Excuse note */}
      <div className="px-4 py-4 text-sm border-b border-gray-300 dark:border-[#333741]">
        <p>
          It is recommended that the above-named patient be excused from their duties/activities for{' '}
          <input
            type="text"
            inputMode="numeric"
            value={excusedDays}
            onChange={(e) => onExcusedDaysChange(e.target.value.replace(/[^0-9]/g, ''))}
            maxLength={2}
            min="0"
            max="30"
            placeholder="__"
            className="w-12 text-center font-medium border-b border-gray-400 dark:border-[#94969C] outline-none bg-transparent print:border-none"
          />{' '}
          day(s) starting from{' '}
          <span className="font-medium">{visitDate}</span>.
        </p>
      </div>

      {/* Footer */}
      <div className="px-4 py-6 text-center text-sm text-gray-600 dark:text-[#94969C]">
        If you have any questions; please feel free to call us at Medical-Dental Clinic.
      </div>

      <div className="px-4 pb-6 text-right text-sm text-gray-900 dark:text-gray-900">
        <div className="inline-block text-center">
          {showSignature && physicianData?.signature_url ? (
            <img
              src={diagnosis?.physician_signature_url || physicianData?.signature_url}
              alt="Physician signature"
              className="max-h-20 max-w-[200px] object-contain mx-auto mb-1"
            />
          ) : (
            <div className="w-48 border-b border-gray-300 mb-1" />
          )}
          <div className="border-t border-gray-900 dark:border-gray-900 pt-1 px-4">
            <div className="font-medium">
              {physicianData
                ? `${physicianData.first_name || ''} ${physicianData.last_name || ''}`.trim()
                : attendingPhysician || ''}
            </div>
            <div className="text-gray-600 dark:text-[#94969C]">
              {physicianData?.role === 'DOCTOR' ? 'Attending Physician' : 'Attending Personnel'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiagnosisModal
