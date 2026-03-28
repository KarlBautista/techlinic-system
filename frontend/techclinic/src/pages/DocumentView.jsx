import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import supabase from '../config/supabaseClient'

const TUP_LOGO = 'https://hvnfijudokbvnydzpvko.supabase.co/storage/v1/object/public/public-assets/tup-logo.png'

export default function DocumentView() {
  const { id } = useParams()
  const [doc, setDoc] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchDocument() {
      const { data, error: fetchErr } = await supabase
        .from('shared_documents')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchErr || !data) {
        setError('Document not found or has expired.')
      } else if (new Date(data.expires_at) < new Date()) {
        setError('This document link has expired.')
      } else {
        setDoc(data)
      }
      setLoading(false)
    }
    fetchDocument()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-red-600 border-t-transparent" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">📄</div>
          <h1 className="text-xl font-semibold text-gray-800 mb-2">Unavailable</h1>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    )
  }

  const d = doc.data

  return (
    <>
      {/* Print-optimized styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print-container { box-shadow: none !important; margin: 0 !important; border-radius: 0 !important; }
        }
      `}</style>

      <div className="min-h-screen bg-gray-50 print:bg-white">
        {/* Top bar — hidden when printing */}
        <div className="no-print bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              TUP Medical-Dental Clinic — {doc.type === 'prescription' ? 'Prescription' : 'Medical Certificate'}
            </span>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
            >
              Save as PDF
            </button>
          </div>
        </div>

        {/* Document */}
        <div className="max-w-2xl mx-auto p-4 print:p-0">
          <div className="print-container bg-white rounded-lg border border-gray-300 shadow-sm">
            {doc.type === 'prescription' ? (
              <PrescriptionView d={d} />
            ) : (
              <CertificateView d={d} />
            )}
          </div>
        </div>

        {/* Instructions — hidden when printing */}
        <div className="no-print max-w-2xl mx-auto px-4 pb-8 pt-2">
          <p className="text-xs text-gray-400 text-center">
            Click "Save as PDF" or press <kbd className="px-1 py-0.5 bg-gray-100 rounded text-gray-500 text-[10px]">Ctrl+P</kbd> and choose "Save as PDF" as the destination.
          </p>
        </div>
      </div>
    </>
  )
}

/* ── Prescription ── */
function PrescriptionView({ d }) {
  return (
    <>
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <img src={TUP_LOGO} alt="TUP Logo" className="w-12 h-12 object-contain" />
            <span className="text-5xl font-serif font-bold text-gray-800 leading-none">R<sub className="text-3xl">x</sub></span>
          </div>
          <div className="text-[11px] text-center mt-1 text-gray-700">
            Ayala Blvd, Ermita, Manila, 1000, Philippines | Tel No. +632-5301-3001 local 607
            <br />
            Flex No. +632-8521-4063 | Email: clinic@tup.edu.ph | Website: www.tup.edu.ph
          </div>
        </div>
      </div>

      {/* Date / time */}
      <div className="px-4 py-3 text-sm border-b border-gray-300">
        <div className="flex gap-8">
          <span>Date: <span className="font-medium underline">{d.date}</span></span>
          <span>Time Entered: <span className="font-medium underline">{d.time_entered || '—'}</span></span>
          <span>Time Discharged: <span className="font-medium underline">{d.time_discharged || '—'}</span></span>
        </div>
      </div>

      {/* Diagnosis / Treatment */}
      <div className="px-4 py-4 text-sm space-y-2 border-b border-gray-300">
        <div>
          <span className="text-xs text-gray-400 uppercase tracking-wider">Diagnosis</span>
          <p className="text-sm font-medium text-gray-800">{d.diagnosis || 'N/A'}</p>
        </div>
        <div>
          <span className="text-xs text-gray-400 uppercase tracking-wider">Treatment</span>
          <p className="text-sm text-gray-800 whitespace-pre-wrap">{d.treatment || 'N/A'}</p>
        </div>
      </div>

      {/* Rx Symbol */}
      <div className="px-4 pt-4 pb-1">
        <span className="text-3xl font-bold italic text-gray-800" style={{ fontFamily: 'serif' }}>&#8478;</span>
      </div>

      {/* Reason */}
      <div className="px-4 py-4 text-sm space-y-1 border-b border-gray-300">
        <p>This is to inform you that the above came to the clinic due to:</p>
        <p className="font-medium mt-1 min-h-6 underline text-gray-800">{d.diagnosis || ''}</p>
      </div>

      {/* Medication */}
      <div className="px-4 py-4 text-sm space-y-2 border-b border-gray-300">
        <div className="grid grid-cols-2 gap-4">
          <div><span className="text-gray-500">Medication:</span> <span className="font-medium">{d.medication || '—'}</span></div>
          <div><span className="text-gray-500">Quantity:</span> <span className="font-medium">{d.quantity || '—'}</span></div>
        </div>
        <div><span className="text-gray-500">Treatment:</span> <span className="font-medium">{d.treatment || '—'}</span></div>
      </div>

      {/* Remarks */}
      <div className="px-4 py-4 text-sm space-y-1 border-b border-gray-300">
        <p>Remarks:</p>
        <p className="font-medium min-h-6 text-gray-800">{d.notes || ''}</p>
      </div>

      {/* Footer */}
      <div className="px-4 py-6 text-center text-sm text-gray-600">
        If you have any questions; please feel free to call us at Medical-Dental Clinic.
      </div>

      {/* Signature */}
      <div className="px-4 pb-6 text-right text-sm text-gray-900">
        <div className="inline-block text-center">
          {d.physician_signature ? (
            <img src={d.physician_signature} alt="Physician signature" className="max-h-20 max-w-[200px] object-contain mx-auto mb-1" />
          ) : (
            <div className="w-48 border-b border-gray-300 mb-1" />
          )}
          <div className="border-t border-gray-900 pt-1 px-4">
            <div className="font-medium">{d.physician_name || ''}</div>
            <div className="text-gray-600">{d.physician_role || ''}</div>
          </div>
        </div>
      </div>
    </>
  )
}

/* ── Certificate ── */
function CertificateView({ d }) {
  return (
    <>
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-shrink-0">
            <img src={TUP_LOGO} alt="TUP Logo" className="w-12 h-12 object-contain" />
            <span className="text-lg font-bold text-gray-800 tracking-wide">MEDICAL CERTIFICATE</span>
          </div>
          <div className="text-[11px] text-right mt-1 text-gray-700">
            Ayala Blvd, Ermita, Manila, 1000, Philippines
            <br />
            Tel No. +632-5301-3001 local 607
            <br />
            Flex No. +632-8521-4063 | Email: clinic@tup.edu.ph
          </div>
        </div>
      </div>

      {/* Date */}
      <div className="px-4 py-3 text-sm border-b border-gray-300">
        <span>Date: <span className="font-medium underline">{d.date}</span></span>
      </div>

      {/* To whom it may concern */}
      <div className="px-4 py-4 text-sm border-b border-gray-300">
        <p className="font-semibold mb-2 text-gray-800">TO WHOM IT MAY CONCERN:</p>
        <p>
          This is to certify that{' '}
          <span className="font-medium underline">{d.to_name}</span>{' '}
          (ID: <span className="font-medium underline">{d.patient_id || '—'}</span>){' '}
          was examined at the Medical-Dental Clinic on{' '}
          <span className="font-medium underline">{d.date}</span>.
        </p>
      </div>

      {/* Findings */}
      <div className="px-4 py-4 text-sm space-y-1 border-b border-gray-300">
        <span className="text-xs text-gray-400 uppercase tracking-wider">Findings</span>
        <p className="font-medium min-h-6 text-gray-800">
          {d.diagnosis || ''}
          {d.treatment ? ` — Treatment: ${d.treatment}` : ''}
        </p>
      </div>

      {/* Medication */}
      <div className="px-4 py-4 text-sm border-b border-gray-300">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-xs text-gray-400 uppercase tracking-wider">Medication Prescribed</span>
            <p className="font-medium mt-1 text-gray-800">{d.medication || '—'}</p>
          </div>
          <div>
            <span className="text-xs text-gray-400 uppercase tracking-wider">Quantity</span>
            <p className="font-medium mt-1 text-gray-800">{d.quantity || '—'}</p>
          </div>
        </div>
      </div>

      {/* Recommendation */}
      <div className="px-4 py-4 text-sm space-y-1 border-b border-gray-300">
        <span className="text-xs text-gray-400 uppercase tracking-wider">Recommendation</span>
        <p className="font-medium min-h-6 text-gray-800">{d.notes || ''}</p>
      </div>

      {/* Excuse note */}
      <div className="px-4 py-4 text-sm border-b border-gray-300">
        <p>
          It is recommended that the above-named patient be excused from their duties/activities for{' '}
          <span className="font-medium underline">{d.excused_days || '—'}</span>{' '}
          day(s) starting from <span className="font-medium">{d.date}</span>.
        </p>
      </div>

      {/* Footer */}
      <div className="px-4 py-6 text-center text-sm text-gray-600">
        If you have any questions; please feel free to call us at Medical-Dental Clinic.
      </div>

      {/* Signature */}
      <div className="px-4 pb-6 text-right text-sm text-gray-900">
        <div className="inline-block text-center">
          {d.physician_signature ? (
            <img src={d.physician_signature} alt="Physician signature" className="max-h-20 max-w-[200px] object-contain mx-auto mb-1" />
          ) : (
            <div className="w-48 border-b border-gray-300 mb-1" />
          )}
          <div className="border-t border-gray-900 pt-1 px-4">
            <div className="font-medium">{d.physician_name || ''}</div>
            <div className="text-gray-600">{d.physician_role || ''}</div>
          </div>
        </div>
      </div>
    </>
  )
}
