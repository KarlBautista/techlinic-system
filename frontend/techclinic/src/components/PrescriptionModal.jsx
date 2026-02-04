import React, { useState } from 'react'

const PrescriptionModal = ({ open = false, onClose = () => {}, patient = {}, prescription = {} }) => {
  if (!open) return null;

  const printPrescription = () => {
    window.print();
  }

  const [showCompose, setShowCompose] = useState(false);
  const [emailTo, setEmailTo] = useState(patient?.email ?? '');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');

  const openCompose = () => {
    const subject = `Prescription for ${patient?.first_name ?? ''} ${patient?.last_name ?? ''}`;
    const lines = [];
    lines.push(`Date: ${dateStr}`);
    lines.push(`Patient: ${patient?.first_name ?? ''} ${patient?.last_name ?? ''}`);
    lines.push(`ID: ${patient?.student_id ?? patient?.id ?? '—'}`);
    if (med?.medication) lines.push(`Medication: ${med.medication}`);
    if (med?.dosage) lines.push(`Dosage: ${med.dosage}`);
    if (med?.quantity) lines.push(`Quantity: ${med.quantity}`);
    if (med?.notes || med?.additional_notes) lines.push(`Notes: ${med.notes ?? med.additional_notes}`);
    lines.push('\n--\nThis message contains the prescription from the clinic.');

    setEmailTo(patient?.email ?? '');
    setEmailSubject(subject);
    setEmailBody(lines.join('\n'));
    setShowCompose(true);
  }

  const sendEmail = () => {
    const mailto = `mailto:${encodeURIComponent(emailTo)}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    window.location.href = mailto;
    setShowCompose(false);
  }

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US');

  const med = prescription || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative z-10 w-[min(900px,95%)] max-h-[90vh] overflow-auto bg-white rounded-lg shadow-lg p-6 print:w-[900px] print:max-h-auto">
        <div className="flex items-start justify-between mb-4 print:hidden">
           <h3 className="text-lg font-semibold">Medical Prescription</h3>
           
          <div className="flex items-center justify-between gap-4">
            <button onClick={printPrescription} className="bg-emerald-600 text-white px-3 py-1 rounded text-sm">
              <span className="sr-only">Print</span>
              <i class="fa-solid fa-print"></i>
            </button>
            <button onClick={openCompose} className="bg-blue-600 text-white px-3 py-1 rounded text-sm">
              <span className="sr-only">Email</span>
              <i class="fa-solid fa-envelope"></i>
            </button>
            <button onClick={onClose} className="bg-gray-200 px-3 py-1 rounded text-sm"><i class="fa-solid fa-xmark"></i></button>
          </div>
        </div>
        

        {/* Header layout */}
        <div className="grid grid-cols-[140px_1fr] grid-rows-[84px_46px] border border-gray-900">
          {/* Logo */}
          <div className="row-span-2 border-r border-gray-900 flex items-center justify-center p-2">
            <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
              Logo
            </div>
          </div>

          {/* Top header */}
          <div className="border-b border-gray-900 flex flex-col items-center justify-center p-2">
            <div className="font-extrabold text-sm tracking-wide text-center">
              TECHNOLOGICAL UNIVERSITY OF THE PHILIPPINES
            </div>
            <div className="text-[11px] text-center mt-1 text-gray-700">
              Ayala Blvd, Ermita, Manila, 1000, Philippines | Tel No. +632-5301-3001
              local 607
              <br />
              Flex No. +632-8521-4063 | Email: clinic@tup.edu.ph | Website:
              www.tup.edu.ph
            </div>
          </div>

          {/* Bottom header */}
          <div className="flex items-center justify-center p-2">
            <div className="font-extrabold tracking-wide">CLINIC PASS</div>
          </div>
        </div>

        <div className="mt-10 px-2 text-sm">
          Date: __________ Time Entered: __________ Time Discharged: __________
        </div>

        {/* Patient info */}
        <div className="mt-6 px-2 text-sm">
          <div>
            Name of Patient: _________________________________ Age/Sex: ______
          </div>
          <div className="mt-1">
            Course, Year, Section/Department/Office:
            _____________________________________________
          </div>

          <p className="mt-5">
            This is to inform you that the above came to the clinic due to:
          </p>
          <div className="border-b mt-2 h-6" />
          <div className="border-b mt-2 h-6" />

          <p className="mt-5">Remarks:</p>
          <div className="border-b mt-2 h-6" />
          <div className="border-b mt-2 h-6" />
          <div className="border-b mt-2 h-6" />
        </div>

        {/* Checkboxes */}
        <div className="flex justify-between items-center mt-6 px-2 text-sm">
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
        <div className="mt-10 text-center text-sm text-gray-600">
          If you have any questions; please feel free to call us at
          Medical-Dental Clinic.
        </div>

        <div className="mt-8 text-right text-sm text-gray-900 overline decoration-1">
          Physician/Nurse On Duty
        </div>
      </div>
      {/* Email compose sub-modal */}
      {showCompose && (
        <div className="fixed inset-0 z-60 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowCompose(false)} />
          <div className="relative z-10 w-[min(720px,95%)] bg-white rounded-lg shadow-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Send Prescription via Email</h3>
              <button onClick={() => setShowCompose(false)} className="text-sm px-2 py-1 bg-gray-200 rounded">Close</button>
            </div>

            <div className="grid gap-2">
              <label className="text-sm">To</label>
              <input type="email" value={emailTo} onChange={(e) => setEmailTo(e.target.value)} className="border p-2 rounded" />

              <label className="text-sm">Subject</label>
              <input value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} className="border p-2 rounded" />

              <label className="text-sm">Body</label>
              <textarea value={emailBody} onChange={(e) => setEmailBody(e.target.value)} rows={8} className="border p-2 rounded" />

              <div className="flex justify-end gap-2 mt-2">
                <button onClick={() => setShowCompose(false)} className="px-3 py-1 bg-gray-200 rounded">Cancel</button>
                <button onClick={sendEmail} className="px-3 py-1 bg-blue-600 text-white rounded">Send (opens mail client)</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PrescriptionModal
