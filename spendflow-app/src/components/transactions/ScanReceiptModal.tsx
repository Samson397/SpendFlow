'use client';

import { useState, useRef } from 'react';
import { X, Upload, Loader2, CheckCircle } from 'lucide-react';
import { receiptScannerService } from '@/lib/services/receiptScanner';

interface ScanReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataExtracted: (data: {
    amount: number;
    merchant: string;
    date?: string;
    category?: string;
  }) => void;
}

export function ScanReceiptModal({ isOpen, onClose, onDataExtracted }: ScanReceiptModalProps) {
  const [scanning, setScanning] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<{
    amount?: number;
    merchant?: string;
    date?: string;
    category?: string;
  } | null>(null);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    console.log('handleFileSelect called with file:', file.name, file.type, 'size:', file.size);
    
    // Check file size (mobile browsers have limits)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setError('File size too large. Please select a file smaller than 10MB.');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPG, PNG, etc.)');
      return;
    }

    try {
      setScanning(true);
      setError('');
      console.log('Starting scan...');

      // Show preview
      const reader = new FileReader();
      reader.onload = (e) => {
        console.log('Preview loaded successfully');
        setPreview(e.target?.result as string);
      };
      reader.onerror = (error) => {
        console.error('FileReader error:', error);
        setError('Failed to read file. Please try again.');
        setScanning(false);
      };
      reader.readAsDataURL(file);

      // Scan receipt with timeout for mobile
      const scanPromise = receiptScannerService.scanReceipt(file);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Scan timeout')), 30000)
      );

      const data = await Promise.race([scanPromise, timeoutPromise]);
      console.log('Scan complete, data:', data);
      
      // Set default date to today if not found
      if (!data.date) {
        data.date = new Date().toISOString().split('T')[0];
      }
      
      setExtractedData(data);
      console.log('Extracted data set:', data);
      
    } catch (err) {
      console.error('Receipt scan error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to scan receipt: ${errorMessage}. Please try again or enter manually.`);
    } finally {
      setScanning(false);
      console.log('Scanning finished');
    }
  };

  const handleUploadClick = () => {
    // Reset the input value so the same file can trigger onChange
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleConfirm = () => {
    if (extractedData) {
      onDataExtracted({
        amount: extractedData.amount || 0,
        merchant: extractedData.merchant || '',
        date: extractedData.date,
        category: extractedData.category || 'Other',
      });
      handleClose();
    }
  };

  const handleClose = () => {
    setPreview(null);
    setExtractedData(null);
    setError('');
    setScanning(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-60"
      onClick={handleClose}
    >
      <div
        className="bg-slate-950 border border-amber-700/30 rounded-lg shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden z-60"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            console.log('onChange triggered');
            if (e.target.files?.[0]) {
              console.log('File from onChange:', e.target.files[0].name);
              handleFileSelect(e.target.files[0]);
            }
          }}
          onInput={(e) => {
            console.log('onInput triggered');
            const target = e.target as HTMLInputElement;
            if (target.files?.[0]) {
              console.log('File from onInput:', target.files[0].name);
              handleFileSelect(target.files[0]);
            }
          }}
        />
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div>
            <h2 className="text-2xl font-serif text-slate-100 tracking-wide mb-1">
              SCAN RECEIPT
            </h2>
            <p className="text-slate-500 text-sm tracking-wider">
              Take a photo or upload an image
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(90vh-200px)]">

          {!preview && !scanning && (
            <div className="space-y-4">
              {/* Upload Button */}
              <button
                onClick={handleUploadClick}
                className="w-full p-12 border-2 border-dashed border-slate-700 hover:border-amber-600 rounded-lg transition-colors group"
              >
                <Upload className="h-20 w-20 mx-auto mb-4 text-slate-600 group-hover:text-amber-400 transition-colors" />
                <p className="text-slate-300 font-serif tracking-wider text-lg">Upload Receipt</p>
                <p className="text-slate-500 text-sm mt-2">Take photo or choose from gallery</p>
                <p className="text-amber-400/60 text-xs mt-2">📱 On mobile: Camera option available</p>
              </button>
            </div>
          )}

          {scanning && (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-16 w-16 text-amber-400 animate-spin mb-4" />
              <p className="text-slate-300 font-serif tracking-wider text-lg">Scanning receipt...</p>
              <p className="text-amber-400 text-sm mt-2">Reading text with OCR</p>
              <p className="text-slate-500 text-xs mt-2">This usually takes 5-10 seconds</p>
              <div className="mt-4 w-64 bg-slate-800 rounded-full h-1">
                <div className="bg-amber-400 h-1 rounded-full animate-pulse" style={{width: '60%'}}></div>
              </div>
            </div>
          )}

          {preview && !scanning && (
            <div className="space-y-6">
              {/* Preview Image */}
              <div className="relative">
                <img
                  src={preview}
                  alt="Receipt preview"
                  className="w-full rounded-lg border border-slate-700"
                />
              </div>

              {/* Extracted Data */}
              {extractedData && (
                <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 space-y-4">
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      <h3 className="text-lg font-serif text-slate-100 tracking-wide">
                        Extracted Data
                      </h3>
                    </div>
                    <p className="text-slate-500 text-xs">
                      Review and edit the automatically extracted information
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-slate-500 text-xs uppercase tracking-wider mb-1">
                        Amount
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={extractedData.amount || ''}
                        onChange={(e) => setExtractedData({ ...extractedData, amount: parseFloat(e.target.value) })}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-slate-100 rounded focus:border-amber-600 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-500 text-xs uppercase tracking-wider mb-1">
                        Company Name
                      </label>
                      <input
                        type="text"
                        value={extractedData.merchant || ''}
                        onChange={(e) => setExtractedData({ ...extractedData, merchant: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-slate-100 rounded focus:border-amber-600 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-500 text-xs uppercase tracking-wider mb-1">
                        Category
                      </label>
                      <select
                        value={extractedData.category || 'Other'}
                        onChange={(e) => setExtractedData({ ...extractedData, category: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-slate-100 rounded focus:border-amber-600 focus:outline-none"
                      >
                        <option value="Transport">Transport</option>
                        <option value="Groceries">Groceries</option>
                        <option value="Dining">Dining</option>
                        <option value="Shopping">Shopping</option>
                        <option value="Entertainment">Entertainment</option>
                        <option value="Healthcare">Healthcare</option>
                        <option value="Utilities">Utilities</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-500 text-xs uppercase tracking-wider mb-1">
                        Date
                      </label>
                      <input
                        type="date"
                        value={extractedData.date || ''}
                        onChange={(e) => setExtractedData({ ...extractedData, date: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-slate-100 rounded focus:border-amber-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  <p className="text-slate-500 text-xs mt-4">
                    💡 Tip: OCR may not be 100% accurate - please verify the extracted data
                  </p>
                </div>
              )}

              {error && (
                <div className="bg-red-900/20 border border-red-700/30 rounded-lg p-4">
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {preview && !scanning && (
          <div className="flex gap-4 p-4 border-t border-slate-800">
            <button
              onClick={handleClose}
              className="flex-1 px-6 py-3 border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors font-serif tracking-wider uppercase"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!extractedData?.amount || !extractedData?.merchant}
              className="flex-1 px-6 py-3 border border-amber-600 text-amber-400 bg-amber-900/10 hover:bg-amber-600/20 transition-colors font-serif tracking-wider uppercase disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Use This Data
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
