import React, { useRef, useState, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';

// Manual canvas trimming to avoid trim-canvas ESM/CJS issue with Vite
function trimCanvas(canvas) {
  const ctx = canvas.getContext('2d');
  const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const { data, width, height } = pixels;
  let top = height, left = width, right = 0, bottom = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const alpha = data[(y * width + x) * 4 + 3];
      if (alpha > 0) {
        if (y < top) top = y;
        if (x < left) left = x;
        if (x > right) right = x;
        if (y > bottom) bottom = y;
      }
    }
  }

  // Add a small padding
  const pad = 10;
  top = Math.max(0, top - pad);
  left = Math.max(0, left - pad);
  right = Math.min(width - 1, right + pad);
  bottom = Math.min(height - 1, bottom + pad);

  const trimmedWidth = right - left + 1;
  const trimmedHeight = bottom - top + 1;

  if (trimmedWidth <= 0 || trimmedHeight <= 0) return canvas;

  const trimmedData = ctx.getImageData(left, top, trimmedWidth, trimmedHeight);
  const trimmedCanvas = document.createElement('canvas');
  trimmedCanvas.width = trimmedWidth;
  trimmedCanvas.height = trimmedHeight;
  trimmedCanvas.getContext('2d').putImageData(trimmedData, 0, 0);   

  return trimmedCanvas;
}

const SignaturePad = ({ onSave, existingSignature = null, onClear }) => {
  const sigCanvas = useRef(null);
  const fileInputRef = useRef(null);
  const [mode, setMode] = useState('draw'); // 'draw' or 'upload'
  const [uploadPreview, setUploadPreview] = useState(null);
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    // If there's an existing signature, we don't mark it as empty
    if (existingSignature) {
      setIsEmpty(false);
    }
  }, [existingSignature]);

  const handleClear = () => {
    if (mode === 'draw' && sigCanvas.current) {
      sigCanvas.current.clear();
      setIsEmpty(true);
    }
    if (mode === 'upload') {
      setUploadPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
    onClear?.();
  };

  const handleEnd = () => {
    if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
      setIsEmpty(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, etc.)');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('File size must be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadPreview(event.target.result);
      setIsEmpty(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    let dataUrl = null;

    if (mode === 'draw' && sigCanvas.current && !sigCanvas.current.isEmpty()) {
      // Use getCanvas() + manual trim instead of getTrimmedCanvas() 
      // to avoid trim-canvas ESM/CJS compatibility issue with Vite
      const canvas = sigCanvas.current.getCanvas();
      const trimmed = trimCanvas(canvas);
      dataUrl = trimmed.toDataURL('image/png');
    } else if (mode === 'upload' && uploadPreview) {
      dataUrl = uploadPreview;
    }

    if (dataUrl) {
      onSave?.(dataUrl);
    }
  };

  const hasContent = mode === 'draw' ? !isEmpty : !!uploadPreview;

  return (
    <div className="space-y-4">
      {/* Mode Toggle */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode('draw')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            mode === 'draw'
              ? 'bg-[#b01c34] text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <i className="fa-solid fa-pen-nib"></i>
          Draw
        </button>
        <button
          type="button"
          onClick={() => setMode('upload')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            mode === 'upload'
              ? 'bg-[#b01c34] text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <i className="fa-solid fa-upload"></i>
          Upload
        </button>
      </div>

      {/* Draw Mode */}
      {mode === 'draw' && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-white">
          <SignatureCanvas
            ref={sigCanvas}
            penColor="black"
            canvasProps={{
              className: 'w-full',
              style: { width: '100%', height: '200px' },
            }}
            onEnd={handleEnd}
          />
          <div className="bg-gray-50 px-3 py-1.5 text-xs text-gray-400 text-center border-t">
            Draw your signature above
          </div>
        </div>
      )}

      {/* Upload Mode */}
      {mode === 'upload' && (
        <div className="space-y-3">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-[#b01c34]/50 hover:bg-red-50/30 transition-colors"
          >
            {uploadPreview ? (
              <div className="flex flex-col items-center gap-2">
                <img
                  src={uploadPreview}
                  alt="Signature preview"
                  className="max-h-[160px] max-w-full object-contain"
                />
                <p className="text-xs text-gray-400">Click to replace</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-gray-400">
                <i className="fa-solid fa-cloud-arrow-up text-3xl"></i>
                <p className="text-sm font-medium">Click to upload signature image</p>
                <p className="text-xs">PNG, JPG — Max 2MB</p>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      )}

      {/* Existing Signature Preview */}
      {existingSignature && !hasContent && (
        <div className="rounded-lg border border-gray-200 p-4 bg-gray-50">
          <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wider">Current Signature</p>
          <img
            src={existingSignature}
            alt="Current signature"
            className="max-h-[120px] max-w-full object-contain"
          />
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handleClear}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <i className="fa-solid fa-eraser text-xs"></i>
          Clear
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={!hasContent}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-[#b01c34] hover:bg-[#8f1629] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <i className="fa-solid fa-check text-xs"></i>
          Save Signature
        </button>
      </div>
    </div>
  );
};

export default SignaturePad;
