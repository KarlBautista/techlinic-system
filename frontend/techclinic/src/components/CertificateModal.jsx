import React, { useState } from 'react'
import emailjs from '@emailjs/browser'

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_CERTIFICATE_TEMPLATE_ID
const PUBLIC_KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

const CertificateModal = ({ open = false, onClose = () => {}, patient = {} }) => {
  const [showCompose, setShowCompose] = useState(false);
  const [emailTo, setEmailTo] = useState('');
  const [sending, setSending] = useState(false);
  const [emailStatus, setEmailStatus] = useState(null); // 'success' | 'error' | null

  if (!open) return null;

  const handlePrint = () => window.print();
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US');

  const openCompose = () => {
    setEmailTo(patient?.email ?? '');
    setEmailStatus(null);
    setShowCompose(true);
  };

  const sendEmail = async () => {
    if (!emailTo.trim()) return;
    setSending(true);
    setEmailStatus(null);

    const templateParams = {
      to_email:   emailTo.trim(),
      to_name:    `${patient?.first_name ?? ''} ${patient?.last_name ?? ''}`.trim(),
      patient_id: patient?.student_id ?? patient?.id ?? '—',
      date:       dateStr,
    };

    try {
      await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
      setEmailStatus('success');
      setTimeout(() => setShowCompose(false), 2000);
    } catch (err) {
      console.error('EmailJS error:', err);
      setEmailStatus('error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="absolute inset-0 bg-black/50 -z-10" />

      <div className="relative z-10 w-[min(900px,95%)] max-h-[90vh] overflow-auto bg-white rounded-lg shadow-lg p-6 print:w-[900px] print:max-h-auto">
        <div className="flex items-center justify-between mb-4 print:hidden">
          <h3 className="text-lg font-semibold">Medical Certificate</h3>

          <div className="flex items-center justify-between gap-4">
            <button onClick={handlePrint} className="bg-emerald-600 text-white px-3 py-1 rounded text-sm">
              <span className="sr-only">Print</span>
              <i className="fa-solid fa-print"></i>
            </button>
            <button onClick={openCompose} className="bg-blue-600 text-white px-3 py-1 rounded text-sm">
              <span className="sr-only">Email</span>
              <i className="fa-solid fa-envelope"></i>
            </button>
            <button onClick={onClose} className="bg-gray-200 px-3 py-1 rounded text-sm"><i className="fa-solid fa-xmark"></i></button>
          </div>
        </div>
        

        <div className="grid grid-cols-[140px_1fr] grid-rows-[84px_46px] border border-gray-900">
          <div className="row-span-2 border-r border-gray-900 flex items-center justify-center p-2">
            <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">Logo</div>
          </div>

          <div className="border-b border-gray-900 flex flex-col items-center justify-center p-2">
            <div className="font-extrabold text-sm tracking-wide text-center">TECHNOLOGICAL UNIVERSITY OF THE PHILIPPINES</div>
            <div className="text-[11px] text-center mt-1 text-gray-700">Ayala Blvd, Ermita, Manila, 1000, Philippines | Tel No. +632-5301-3001 local 607<br/>Flex No. +632-8521-4063 | Email: clinic@tup.edu.ph</div>
          </div>

          <div className="flex items-center justify-center p-2">
            <div className="font-extrabold tracking-wide">CLINIC PASS</div>
          </div>
        </div>

        <div className="mt-6 px-4 text-sm leading-relaxed text-gray-800">
          <div className="mb-4">Date: <span className="font-medium">{dateStr}</span></div>

          <p className="mb-4">TO WHOM IT MAY CONCERN:</p>

          <p className="mb-4">This is to certify that <span className="font-medium">{patient?.first_name ?? ''} {patient?.last_name ?? ''}</span> (ID: <span className="font-medium">{patient?.student_id ?? patient?.id ?? '—'}</span>) was examined at the Medical-Dental Clinic on <span className="font-medium">{dateStr}</span>.</p>

          <p className="mb-4">Findings: ___________________________________________________________________________</p>

          <p className="mb-4">Recommendation: _____________________________________________________________________</p>

          <p className="mb-4">It is recommended that the above-named patient be excused from their duties/activities for <span className="font-medium">______</span> day(s) starting from <span className="font-medium">{dateStr}</span>.</p>

          <div className="mt-8">
            <div className="mt-20 text-right text-sm text-gray-900 overline decoration-1">
          Physician/Nurse On Duty
        </div>
          </div>
        </div>
      </div>


      {showCompose && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center" onClick={(e) => { if (e.target === e.currentTarget && !sending) setShowCompose(false); }}>
          <div className="absolute inset-0 bg-black/50 -z-10" />
          <div className="relative z-10 w-[min(480px,95%)] bg-white rounded-xl shadow-xl p-6">

            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-gray-800">Send Certificate via Email</h3>
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
              <p><span className="font-medium text-gray-800">Date:</span> {dateStr}</p>
            </div>

            <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Email</label>
            <input
              type="email"
              value={emailTo}
              onChange={(e) => setEmailTo(e.target.value)}
              placeholder="patient@email.com"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 mb-4"
            />

            {/* Status messages */}
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
  )
}

export default CertificateModal
