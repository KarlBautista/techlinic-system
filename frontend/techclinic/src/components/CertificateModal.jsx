import React from 'react'

const CertificateModal = ({ open = false, onClose = () => {}, patient = {} }) => {
  if (!open) return null;

  const handlePrint = () => window.print();
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative z-10 w-[min(900px,95%)] max-h-[90vh] overflow-auto bg-white rounded-lg shadow-lg p-6 print:w-[900px] print:max-h-auto">
        <div className="flex items-center justify-between mb-4 print:hidden">
          <h3 className="text-lg font-semibold">Medical Certificate</h3>

          <div className="flex items-center justify-between gap-4">
            <button onClick={handlePrint} className="bg-emerald-600 text-white px-3 py-1 rounded text-sm">
              <span className="sr-only">Print</span>
              <i class="fa-solid fa-print"></i>
            </button>
            <button onClick={handlePrint} className="bg-blue-600 text-white px-3 py-1 rounded text-sm">
              <span className="sr-only">Email</span>
              <i class="fa-solid fa-envelope"></i>
            </button>
            <button onClick={onClose} className="bg-gray-200 px-3 py-1 rounded text-sm"><i class="fa-solid fa-xmark"></i></button>
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
    </div>
  )
}

export default CertificateModal
