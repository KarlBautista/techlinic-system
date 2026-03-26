import React, { useState, useEffect, useRef } from 'react'
import emailjs from '@emailjs/browser'
import supabase from '../config/supabaseClient'
import useAuth from '../store/useAuthStore'
import tupLogo from '../assets/image/TUP.png'

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY
const PRESC_TMPL = import.meta.env.VITE_EMAILJS_PRESCRIPTION_TEMPLATE_ID
const CERT_TMPL = import.meta.env.VITE_EMAILJS_CERTIFICATE_TEMPLATE_ID

const DiagnosisModal = ({ open = false, onClose = () => { }, patient = {}, record = {}, diagnoses = [] }) => {
  const { userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('record');
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [physicianData, setPhysicianData] = useState(null);
  const prevTabRef = useRef(activeTab);

  // Email compose state
  const [showCompose, setShowCompose] = useState(false);
  const [emailTo, setEmailTo] = useState('');
  const [sending, setSending] = useState(false);
  const [emailStatus, setEmailStatus] = useState(null); // 'success' | 'error' | null

  // Handle open/close transitions
  useEffect(() => {
    if (open) {
      setIsVisible(true);
      setIsClosing(false);
      setActiveTab('record');
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
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsClosing(false);
      onClose();
    }, 150);
  };

  // Track tab changes for animation
  useEffect(() => {
    prevTabRef.current = activeTab;
  }, [activeTab]);

  if (!isVisible) return null;

  const handlePrint = () => window.print();

  const openCompose = () => {
    setEmailTo(patient?.email ?? '');
    setEmailStatus(null);
    setShowCompose(true);
  };

  const sendEmail = async () => {
    if (!emailTo.trim()) return;
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
      physician_name: physicianName,
      physician_role: effectivePhysician?.role === 'DOCTOR' ? 'Attending Physician' : 'Attending Personnel',
      physician_signature: effectivePhysician?.signature_url ?? '',
      ...(activeTab === 'prescription' ? {
        medication: primaryDiagnosis?.medication ?? '—',
        dosage: primaryDiagnosis?.dosage ?? '—',
        quantity: primaryDiagnosis?.quantity ?? '—',
        notes: primaryDiagnosis?.notes ?? primaryDiagnosis?.additional_notes ?? '—',
      } : {}),
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

  const tabs = [
    { key: 'record', label: 'Record Details', icon: 'fa-solid fa-file-medical' },
    { key: 'prescription', label: 'Prescription', icon: 'fa-solid fa-prescription' },
    { key: 'certificate', label: 'Certificate', icon: 'fa-solid fa-certificate' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className={`absolute inset-0 bg-black/50 ${isClosing ? 'modal-backdrop-exit' : 'modal-backdrop-enter'}`} onClick={handleClose} />

      <div className={`relative z-10 w-[min(900px,95%)] max-h-[90vh] overflow-auto bg-white rounded-lg shadow-lg flex flex-col ${isClosing ? 'modal-content-exit' : 'modal-content-enter'}`}>
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b print:hidden">
          <h3 className="text-lg font-semibold text-gray-800">
            Visit — {visitDate}
          </h3>
          <div className="flex items-center gap-3">
            {(activeTab === 'prescription' || activeTab === 'certificate') && (
              <>
                <button onClick={handlePrint} className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded text-sm flex items-center gap-1.5 transition-colors">
                  <i className="fa-solid fa-print"></i>
                  <span>Print</span>
                </button>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm flex items-center gap-1.5 transition-colors" onClick={openCompose}>
                  <i className="fa-solid fa-envelope"></i>
                  <span>Email</span>
                </button>
              </>
            )}
            <button onClick={handleClose} className="bg-gray-200 hover:bg-gray-300 px-3 py-1.5 rounded text-sm transition-colors">
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b px-6 print:hidden">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              <i className={tab.icon}></i>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-auto flex-1">
          <div key={activeTab} className="tab-content-enter">
            {activeTab === 'record' && (
              <RecordTab patient={patient} record={record} diagnoses={diagnoses} visitDate={visitDate} />
            )}
            {activeTab === 'prescription' && (
              <PrescriptionTab patient={patient} diagnosis={primaryDiagnosis} visitDate={visitDate} visitTime={visitTime} physicianData={effectivePhysician} attendingPhysician={record?.attending_physician} />
            )}
            {activeTab === 'certificate' && (
              <CertificateTab patient={patient} diagnosis={primaryDiagnosis} visitDate={visitDate} physicianData={effectivePhysician} attendingPhysician={record?.attending_physician} />
            )}
          </div>
        </div>
      </div>

      {/* Email compose sub-modal */}
      {showCompose && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center"
          onClick={(e) => { if (e.target === e.currentTarget && !sending) setShowCompose(false); }}
        >
          <div className="absolute inset-0 bg-black/50 -z-10" />
          <div className="relative z-10 w-[min(480px,95%)] bg-white rounded-xl shadow-xl p-6">

            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-gray-800">
                {activeTab === 'prescription' ? 'Send Prescription via Email' : 'Send Certificate via Email'}
              </h3>
              <button
                onClick={() => setShowCompose(false)}
                disabled={sending}
                className="text-gray-400 hover:text-gray-600 transition disabled:opacity-40"
              >
                <i className="fa-solid fa-xmark text-sm" />
              </button>
            </div>

            {/* Summary */}
            <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm space-y-1 text-gray-600 border border-gray-200">
              <p><span className="font-medium text-gray-800">Patient:</span> {patient?.first_name} {patient?.last_name}</p>
              <p><span className="font-medium text-gray-800">ID:</span> {patient?.student_id ?? patient?.id ?? '—'}</p>
              <p><span className="font-medium text-gray-800">Date:</span> {visitDate}</p>
              {activeTab === 'prescription' && primaryDiagnosis?.medication && (
                <p><span className="font-medium text-gray-800">Medication:</span> {primaryDiagnosis.medication}</p>
              )}
            </div>

            <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Email</label>
            <input
              type="email"
              value={emailTo}
              onChange={(e) => setEmailTo(e.target.value)}
              placeholder="patient@email.com"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 mb-4"
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
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition disabled:opacity-40"
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
    </div>
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
        <div className="bg-white rounded-xl ring-1 ring-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <i className="fa-solid fa-user text-blue-600 text-sm"></i>
            </div>
            <h4 className="text-sm font-semibold text-gray-800">Student Information</h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
            <div>
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Name</span>
              <p className="font-medium text-gray-800 mt-0.5">{patient?.first_name ?? ''} {patient?.last_name ?? ''}</p>
            </div>
            <div>
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Patient ID</span>
              <p className="font-medium text-gray-800 mt-0.5">{patient?.student_id ?? record?.student_id ?? '—'}</p>
            </div>
          </div>
          <div className="h-px bg-gray-100 my-3" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
            <div>
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Department</span>
              <p className="font-medium text-gray-800 mt-0.5">{patient?.department ?? record?.department ?? '—'}</p>
            </div>
            <div>
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Year Level</span>
              <p className="font-medium text-gray-800 mt-0.5">{patient?.year_level ?? record?.year_level ?? '—'}</p>
            </div>
          </div>
          <div className="h-px bg-gray-100 my-3" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
            <div>
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Sex</span>
              <p className="font-medium text-gray-800 mt-0.5">{patient?.sex ?? '—'}</p>
            </div>
            <div>
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Contact</span>
              <p className="font-medium text-gray-800 mt-0.5">{patient?.contact_number ?? '—'}</p>
            </div>
          </div>
          <div className="h-px bg-gray-100 my-3" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
            <div>
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Date of Visit</span>
              <p className="font-medium text-gray-800 mt-0.5">{visitDate}</p>
            </div>
            <div>
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Status</span>
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
        <div className="bg-white rounded-xl ring-1 ring-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
              <i className="fa-solid fa-stethoscope text-red-600 text-sm"></i>
            </div>
            <h4 className="text-sm font-semibold text-gray-800">Medical Details</h4>
          </div>

          {diagnoses.length > 0 ? (
            <div className="space-y-3">
              {diagnoses.map((d, idx) => (
                <div key={d?.id ?? idx} className={`text-sm ${idx > 0 ? 'pt-3 border-t border-gray-100' : ''}`}>
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-semibold text-gray-800">{d?.diagnosis || 'Untitled Diagnosis'}</span>
                    <span className="text-xs text-gray-400">
                      {d?.created_at ? new Date(d.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : ''}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                    <div>
                      <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Medication</span>
                      <p className="font-medium text-gray-800 mt-0.5">{d?.medication ?? '—'}</p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Quantity</span>
                      <p className="font-medium text-gray-800 mt-0.5">{d?.quantity ?? '—'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No diagnoses recorded for this visit.</p>
          )}
        </div>
      </div>

      {/* ═══ Right Column — Treatment & Notes ═══ */}
      <div className="w-full lg:w-[40%] bg-white rounded-xl ring-1 ring-gray-100 shadow-sm p-5 flex flex-col">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
            <i className="fa-solid fa-file-medical text-emerald-600 text-sm"></i>
          </div>
          <h4 className="text-sm font-semibold text-gray-800">Treatment & Notes</h4>
        </div>

        <div className="flex flex-col gap-4 flex-1 text-sm">
          <div>
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Attending Physician</span>
            <p className="font-medium text-gray-800 mt-0.5">{record?.attending_physician ?? '—'}</p>
          </div>

          <div className="h-px bg-gray-100" />

          <div className="flex-1">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Treatment</span>
            <div className="mt-1.5 bg-gray-50 rounded-xl border border-gray-100 p-3 min-h-[80px]">
              <p className="text-gray-800 whitespace-pre-wrap">{primaryDiag?.treatment ?? '—'}</p>
            </div>
          </div>

          <div className="h-px bg-gray-100" />

          <div className="flex-1">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Additional Notes</span>
            <div className="mt-1.5 bg-gray-50 rounded-xl border border-gray-100 p-3 min-h-[80px]">
              <p className="text-gray-800 whitespace-pre-wrap">{primaryDiag?.notes ?? '—'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ────────────────────────── Prescription Tab ────────────────────────── */
const PrescriptionTab = ({ patient, diagnosis, visitDate, visitTime, physicianData, attendingPhysician }) => {
  const physicianName = physicianData
    ? `${physicianData.first_name || ''} ${physicianData.last_name || ''}`.trim()
    : attendingPhysician || '';

  return (
    <div className="bg-white max-w-2xl w-full mx-auto rounded-lg border border-gray-300">
      {/* Prescription Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <img src={tupLogo} alt="TUP Logo" className="w-12 h-12 object-contain" />
            <span className="text-5xl font-serif font-bold text-gray-800 leading-none">R<sub className="text-3xl">x</sub></span>
          </div>
          <div className="text-right text-sm text-gray-600 space-y-0.5">
            <p className="font-semibold text-gray-800">{physicianName || 'N/A'}</p>
            <p>TechClinic Health Services</p>
            <p>Technological University of the Philippines</p>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 mx-6" />

      {/* Patient Info */}
      <div className="px-6 py-4 space-y-2">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <span className="text-xs text-gray-400 uppercase tracking-wider">Name of Patient</span>
            <p className="text-sm font-medium text-gray-800 border-b border-dotted border-gray-300 pb-1">
              {patient?.first_name ?? ''} {patient?.last_name ?? ''}
            </p>
          </div>
          <div className="w-28">
            <span className="text-xs text-gray-400 uppercase tracking-wider">Age/Sex</span>
            <p className="text-sm font-medium text-gray-800 border-b border-dotted border-gray-300 pb-1">
              {patient?.sex || 'N/A'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <span className="text-xs text-gray-400 uppercase tracking-wider">Address</span>
            <p className="text-sm font-medium text-gray-800 border-b border-dotted border-gray-300 pb-1">
              {patient?.address || 'N/A'}
            </p>
          </div>
          <div className="w-28">
            <span className="text-xs text-gray-400 uppercase tracking-wider">Date</span>
            <p className="text-sm font-medium text-gray-800 border-b border-dotted border-gray-300 pb-1">
              {visitDate}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <span className="text-xs text-gray-400 uppercase tracking-wider">Patient ID</span>
            <p className="text-sm font-medium text-gray-800 border-b border-dotted border-gray-300 pb-1">
              {patient?.student_id || 'N/A'}
            </p>
          </div>
          <div className="w-28">
            <span className="text-xs text-gray-400 uppercase tracking-wider">Department</span>
            <p className="text-sm font-medium text-gray-800 border-b border-dotted border-gray-300 pb-1 truncate" title={patient?.department}>
              {patient?.department || 'N/A'}
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 mx-6" />

      {/* Diagnosis & Treatment */}
      <div className="px-6 py-4 space-y-3">
        <div>
          <span className="text-xs text-gray-400 uppercase tracking-wider">Diagnosis</span>
          <p className="text-sm font-medium text-gray-800">
            {diagnosis?.diagnosis || <span className="italic text-gray-400">N/A</span>}
          </p>
        </div>
        <div>
          <span className="text-xs text-gray-400 uppercase tracking-wider">Treatment</span>
          <p className="text-sm text-gray-800 whitespace-pre-wrap">{diagnosis?.treatment || 'N/A'}</p>
        </div>
      </div>

      <div className="border-t border-gray-200 mx-6" />

      {/* Drug Prescription Table */}
      <div className="px-6 py-4">
        <h3 className="text-sm font-bold text-gray-800 mb-3">Drug Prescription</h3>
        {diagnosis?.medication ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Medicine Name</th>
                <th className="text-left py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Dosage</th>
                <th className="text-left py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Qty</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-2 text-gray-800 font-medium">{diagnosis.medication}</td>
                <td className="py-2 text-gray-600">{diagnosis.dosage || 'N/A'}</td>
                <td className="py-2 text-gray-600">{diagnosis.quantity || 'N/A'}</td>
              </tr>
            </tbody>
          </table>
        ) : (
          <p className="text-sm text-gray-400 italic">No medication prescribed</p>
        )}
      </div>

      {/* Notes */}
      {diagnosis?.notes && (
        <>
          <div className="border-t border-gray-200 mx-6" />
          <div className="px-6 py-4">
            <span className="text-xs text-gray-400 uppercase tracking-wider">Additional Notes</span>
            <p className="text-sm text-gray-800 whitespace-pre-wrap mt-1">{diagnosis.notes}</p>
          </div>
        </>
      )}

      {/* Signature Area */}
      <div className="border-t border-gray-200 mx-6" />
      <div className="px-6 py-5 flex justify-end">
        <div className="text-center">
          {(diagnosis?.physician_signature_url || physicianData?.signature_url) ? (
            <img
              src={diagnosis?.physician_signature_url || physicianData?.signature_url}
              alt="Physician signature"
              className="max-h-20 max-w-[200px] object-contain mx-auto mb-1"
            />
          ) : (
            <div className="w-48 border-b border-gray-300 mb-1" />
          )}
          <div className="border-t border-gray-300 pt-1 px-4">
            <p className="text-xs font-medium text-gray-700">{physicianName || 'N/A'}</p>
            <p className="text-xs text-gray-500">
              {physicianData?.role === 'DOCTOR' ? 'Attending Physician' : 'Attending Personnel'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ────────────────────────── Certificate Tab ────────────────────────── */
const CertificateTab = ({ patient, diagnosis, visitDate, physicianData, attendingPhysician }) => {
  return (
    <div className="border border-gray-900 print:border-black">
      {/* TUP Header */}
      <div className="grid grid-cols-[140px_1fr] grid-rows-[84px_46px] border-b border-gray-900">
        <div className="row-span-2 border-r border-gray-900 flex items-center justify-center p-2">
          <img src={tupLogo} alt="TUP Logo" className="w-[100px] h-[100px] object-contain" />
        </div>
        <div className="border-b border-gray-900 flex flex-col items-center justify-center p-2">
          <div className="font-extrabold text-sm tracking-wide text-center">
            TECHNOLOGICAL UNIVERSITY OF THE PHILIPPINES
          </div>
          <div className="text-[11px] text-center mt-1 text-gray-700">
            Ayala Blvd, Ermita, Manila, 1000, Philippines | Tel No. +632-5301-3001 local 607
            <br />
            Flex No. +632-8521-4063 | Email: clinic@tup.edu.ph
          </div>
        </div>
        <div className="flex items-center justify-center p-2">
          <div className="font-extrabold tracking-wide">MEDICAL CERTIFICATE</div>
        </div>
      </div>

      {/* Certificate body */}
      <div className="px-6 py-8 text-sm leading-relaxed text-gray-800 space-y-5">
        <div>Date: <span className="font-medium">{visitDate}</span></div>

        <p className="font-semibold">TO WHOM IT MAY CONCERN:</p>

        <p>
          This is to certify that{' '}
          <span className="font-medium underline">{patient?.first_name ?? ''} {patient?.last_name ?? ''}</span>{' '}
          (ID: <span className="font-medium underline">{patient?.student_id ?? '—'}</span>){' '}
          was examined at the Medical-Dental Clinic on{' '}
          <span className="font-medium underline">{visitDate}</span>.
        </p>

        <div>
          <p className="mb-1">Findings:</p>
          <p className="font-medium min-h-6 border-b border-gray-400 pb-1">
            {diagnosis?.diagnosis ?? ''}
            {diagnosis?.treatment ? ` — Treatment: ${diagnosis.treatment}` : ''}
          </p>
        </div>

        <div>
          <p className="mb-1">Medication Prescribed:</p>
          <p className="font-medium min-h-6 border-b border-gray-400 pb-1">
            {diagnosis?.medication ? `${diagnosis.medication}${diagnosis?.quantity ? ` (Qty: ${diagnosis.quantity})` : ''}` : '—'}
          </p>
        </div>

        <div>
          <p className="mb-1">Recommendation:</p>
          <p className="font-medium min-h-6 border-b border-gray-400 pb-1">
            {diagnosis?.notes ?? ''}
          </p>
        </div>

        <p>
          It is recommended that the above-named patient be excused from their duties/activities for{' '}
          <span className="font-medium">______</span> day(s) starting from{' '}
          <span className="font-medium">{visitDate}</span>.
        </p>

        <div className="mt-12 text-right">
          <div className="inline-block text-center">
            {(diagnosis?.physician_signature_url || physicianData?.signature_url) ? (
              <img
                src={diagnosis?.physician_signature_url || physicianData?.signature_url}
                alt="Physician signature"
                className="max-h-[80px] max-w-[200px] object-contain mx-auto mb-1"
              />
            ) : (
              <div className="h-[60px]"></div>
            )}
            <div className="border-t border-gray-900 pt-1 px-4">
              <div className="font-medium">
                {physicianData
                  ? `${physicianData.first_name || ''} ${physicianData.last_name || ''}`.trim()
                  : attendingPhysician || ''}
              </div>
              <div className="text-gray-600">
                {physicianData?.role === 'DOCTOR' ? 'Attending Physician' : 'Attending Personnel'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiagnosisModal
