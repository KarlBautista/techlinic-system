import React, { useState, useEffect, useRef } from 'react'
import emailjs from '@emailjs/browser'
import supabase from '../config/supabaseClient'
import useAuth from '../store/useAuthStore'
import tupLogo from '../assets/image/TUP.png'

const SERVICE_ID   = import.meta.env.VITE_EMAILJS_SERVICE_ID
const PUBLIC_KEY   = import.meta.env.VITE_EMAILJS_PUBLIC_KEY
const PRESC_TMPL   = import.meta.env.VITE_EMAILJS_PRESCRIPTION_TEMPLATE_ID
const CERT_TMPL    = import.meta.env.VITE_EMAILJS_CERTIFICATE_TEMPLATE_ID

const DiagnosisModal = ({ open = false, onClose = () => {}, patient = {}, record = {}, diagnoses = [] }) => {
  const { userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('record');
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [physicianData, setPhysicianData] = useState(null);
  const [showSignature, setShowSignature] = useState(true);
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
      to_email:          emailTo.trim(),
      to_name:           `${patient?.first_name ?? ''} ${patient?.last_name ?? ''}`.trim(),
      patient_id:        patient?.student_id ?? patient?.id ?? '—',
      date:              visitDate,
      physician_name:    physicianName,
      physician_role:    effectivePhysician?.role === 'DOCTOR' ? 'Attending Physician' : 'Attending Personnel',
      physician_signature: effectivePhysician?.signature_url ?? '',
      ...(activeTab === 'prescription' ? {
        medication: primaryDiagnosis?.medication ?? '—',
        dosage:     primaryDiagnosis?.dosage ?? '—',
        quantity:   primaryDiagnosis?.quantity ?? '—',
        notes:      primaryDiagnosis?.notes ?? primaryDiagnosis?.additional_notes ?? '—',
      } : {}),
    };

    console.log('[EmailJS] Sending with params:', { SERVICE_ID, templateId, PUBLIC_KEY: PUBLIC_KEY?.slice(0,6)+'...', templateParams });

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
                {/* Signature Toggle */}
                {effectivePhysician?.signature_url && (
                  <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                    <span className="text-xs text-gray-500 font-medium">Signature</span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={showSignature}
                      onClick={() => setShowSignature(prev => !prev)}
                      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 ${showSignature ? 'bg-[#b01c34]' : 'bg-gray-300'}`}
                    >
                      <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transform transition-transform duration-200 ${showSignature ? 'translate-x-4' : 'translate-x-0.5'}`} />
                    </button>
                  </label>
                )}
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
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
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
              <PrescriptionTab patient={patient} diagnosis={primaryDiagnosis} visitDate={visitDate} visitTime={visitTime} physicianData={effectivePhysician} attendingPhysician={record?.attending_physician} showSignature={showSignature} />
            )}
            {activeTab === 'certificate' && (
              <CertificateTab patient={patient} diagnosis={primaryDiagnosis} visitDate={visitDate} physicianData={effectivePhysician} attendingPhysician={record?.attending_physician} showSignature={showSignature} />
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
  return (
    <div className="space-y-6">
      {/* Patient Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Patient</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-400">Name:</span>{' '}
            <span className="font-medium text-gray-800">{patient?.first_name ?? ''} {patient?.last_name ?? ''}</span>
          </div>
          <div>
            <span className="text-gray-400">Student ID:</span>{' '}
            <span className="font-medium text-gray-800">{patient?.student_id ?? record?.student_id ?? '—'}</span>
          </div>
          <div>
            <span className="text-gray-400">Department:</span>{' '}
            <span className="font-medium text-gray-800">{patient?.department ?? record?.department ?? '—'}</span>
          </div>
          <div>
            <span className="text-gray-400">Year Level:</span>{' '}
            <span className="font-medium text-gray-800">{patient?.year_level ?? record?.year_level ?? '—'}</span>
          </div>
          <div>
            <span className="text-gray-400">Date of Visit:</span>{' '}
            <span className="font-medium text-gray-800">{visitDate}</span>
          </div>
          <div>
            <span className="text-gray-400">Status:</span>{' '}
            <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
              record?.status === 'COMPLETE' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
            }`}>
              {record?.status ?? '—'}
            </span>
          </div>
        </div>
      </div>

      {/* Diagnoses */}
      <div>
        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Diagnosis / Diagnoses ({diagnoses.length})
        </h4>
        <div className="space-y-3">
          {diagnoses.map((d, idx) => (
            <div key={d?.id ?? idx} className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <h5 className="font-semibold text-gray-800">{d?.diagnosis || 'Untitled Diagnosis'}</h5>
                <span className="text-xs text-gray-400">
                  {d?.created_at ? new Date(d.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : ''}
                </span>
              </div>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-gray-400">Treatment</dt>
                  <dd className="text-gray-800 font-medium">{d?.treatment ?? '—'}</dd>
                </div>
                <div>
                  <dt className="text-gray-400">Medication</dt>
                  <dd className="text-gray-800 font-medium">{d?.medication ?? '—'}</dd>
                </div>
                <div>
                  <dt className="text-gray-400">Quantity</dt>
                  <dd className="text-gray-800 font-medium">{d?.quantity ?? '—'}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-gray-400">Notes</dt>
                  <dd className="text-gray-800 font-medium">{d?.notes ?? '—'}</dd>
                </div>
              </dl>
            </div>
          ))}
          {diagnoses.length === 0 && (
            <p className="text-gray-400 text-sm">No diagnoses recorded for this visit.</p>
          )}
        </div>
      </div>
    </div>
  );
};

/* ────────────────────────── Prescription Tab ────────────────────────── */
const PrescriptionTab = ({ patient, diagnosis, visitDate, visitTime, physicianData, attendingPhysician, showSignature }) => {
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
            Flex No. +632-8521-4063 | Email: clinic@tup.edu.ph | Website: www.tup.edu.ph
          </div>
        </div>
        <div className="flex items-center justify-center p-2">
          <div className="font-extrabold tracking-wide">CLINIC PASS</div>
        </div>
      </div>

      {/* Date / time row */}
      <div className="px-4 py-3 text-sm border-b border-gray-300">
        <div className="flex gap-8">
          <span>Date: <span className="font-medium underline">{visitDate}</span></span>
          <span>Time Entered: <span className="font-medium underline">{visitTime || '__________'}</span></span>
          <span>Time Discharged: __________</span>
        </div>
      </div>

      {/* Patient info */}
      <div className="px-4 py-4 text-sm space-y-2 border-b border-gray-300">
        <div>
          Name of Patient: <span className="font-medium underline">{patient?.first_name ?? ''} {patient?.last_name ?? ''}</span>
          &nbsp;&nbsp;&nbsp;&nbsp;Age/Sex: <span className="font-medium underline">{patient?.sex ?? '______'}</span>
        </div>
        <div>
          Course, Year, Section/Department/Office:{' '}
          <span className="font-medium underline">
            {patient?.department ?? ''}{patient?.year_level ? ` — ${patient.year_level}` : ''}
          </span>
        </div>
      </div>

      {/* Rx Symbol */}
      <div className="px-4 pt-4 pb-1">
        <span className="text-3xl font-bold italic text-gray-800" style={{ fontFamily: 'serif' }}>&#8478;</span>
      </div>

      {/* Diagnosis / reason */}
      <div className="px-4 py-4 text-sm space-y-1 border-b border-gray-300">
        <p>This is to inform you that the above came to the clinic due to:</p>
        <p className="font-medium mt-1 min-h-6 underline">{diagnosis?.diagnosis ?? ''}</p>
      </div>

      {/* Medication & treatment */}
      <div className="px-4 py-4 text-sm space-y-2 border-b border-gray-300">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-gray-500">Medication:</span>{' '}
            <span className="font-medium">{diagnosis?.medication ?? '—'}</span>
          </div>
          <div>
            <span className="text-gray-500">Quantity:</span>{' '}
            <span className="font-medium">{diagnosis?.quantity ?? '—'}</span>
          </div>
        </div>
        <div>
          <span className="text-gray-500">Treatment:</span>{' '}
          <span className="font-medium">{diagnosis?.treatment ?? '—'}</span>
        </div>
      </div>

      {/* Remarks */}
      <div className="px-4 py-4 text-sm space-y-1 border-b border-gray-300">
        <p>Remarks:</p>
        <p className="font-medium min-h-6">{diagnosis?.notes ?? ''}</p>
      </div>

      {/* Checkboxes */}
      <div className="flex justify-between items-center px-4 py-3 text-sm border-b border-gray-300">
        <label className="flex items-center gap-2">
          <input type="checkbox" /> Medical Certificate / Clinic Pass
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" /> Referral for Counselling
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" /> For Quarantine
        </label>
      </div>

      {/* Footer */}
      <div className="px-4 py-6 text-center text-sm text-gray-600">
        If you have any questions; please feel free to call us at Medical-Dental Clinic.
      </div>

      <div className="px-4 pb-6 text-right text-sm text-gray-900">
        <div className="inline-block text-center">
          {showSignature && physicianData?.signature_url ? (
            <img
              src={physicianData.signature_url}
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
  );
};

/* ────────────────────────── Certificate Tab ────────────────────────── */
const CertificateTab = ({ patient, diagnosis, visitDate, physicianData, attendingPhysician, showSignature }) => {
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
            {showSignature && physicianData?.signature_url ? (
              <img
                src={physicianData.signature_url}
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
