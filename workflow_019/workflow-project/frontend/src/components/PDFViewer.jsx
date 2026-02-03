import React, { useState } from 'react';

/**
 * Dynamic PDF Viewer Component
 * Automatically detects and displays PDF files from form data
 * Works with base64-encoded PDFs stored in any field
 */
const PDFViewer = ({ formData, sectionTitle = "Attached Documents" }) => {
  const [expandedPdf, setExpandedPdf] = useState(null);

  const extractPdfFields = (data) => {
    if (!data || typeof data !== 'object') return [];
    
    const pdfFields = [];
    
    const traverse = (obj, prefix = '') => {
      for (const [key, value] of Object.entries(obj)) {
        const fieldPath = prefix ? `${prefix}.${key}` : key;
        
        if (typeof value === 'string' && value.startsWith('data:application/pdf')) {
          pdfFields.push({
            fieldName: key,
            fieldPath: fieldPath,
            displayName: key.replace(/_/g, ' ').replace(/question\s*\d+/gi, 'Document'),
            data: value
          });
        }
        else if (value && typeof value === 'object' && value.data && typeof value.data === 'string' && value.data.startsWith('data:application/pdf')) {
          pdfFields.push({
            fieldName: key,
            fieldPath: fieldPath,
            displayName: value.name || key.replace(/_/g, ' ').replace(/question\s*\d+/gi, 'Document'),
            data: value.data,
            fileName: value.name,
            size: value.size
          });
        }
        else if (value && typeof value === 'object' && !Array.isArray(value)) {
          traverse(value, fieldPath);
        }
      };
    };
    
    traverse(data);
    return pdfFields;
  };

  const pdfFields = extractPdfFields(formData);

  if (pdfFields.length === 0) {
    return null;
  }

  const handleDownload = (pdf) => {
    const link = document.createElement('a');
    link.href = pdf.data;
    link.download = pdf.fileName || `${pdf.displayName}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileSize = (bytes) => {
    if (!bytes || isNaN(bytes) || bytes <= 0) return '';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  return (
    <div className="mt-6 border-t border-gray-200 pt-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <svg className="w-5 h-5 mr-2 text-red-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
        </svg>
        {sectionTitle}
      </h3>
      
      <div className="space-y-3">
        {pdfFields.map((pdf, index) => (
          <div key={index} className="bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border border-red-200 overflow-hidden">
            <div className="px-4 py-3 flex items-center justify-between">
              <div className="flex items-center flex-1 min-w-0">
                <div className="flex-shrink-0 w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-4 flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {pdf.fileName || pdf.displayName}
                  </p>
                  <p className="text-xs text-gray-500">
                    PDF Document{formatFileSize(pdf.size) && ` • ${formatFileSize(pdf.size)}`}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => setExpandedPdf(expandedPdf === index ? null : index)}
                  className="px-3 py-2 text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors flex items-center"
                  title="Preview PDF"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  {expandedPdf === index ? 'Hide' : 'View'}
                </button>
                <button
                  onClick={() => handleDownload(pdf)}
                  className="px-3 py-2 text-sm font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded-lg transition-colors flex items-center"
                  title="Download PDF"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download
                </button>
              </div>
            </div>
            {expandedPdf === index && (
              <div className="border-t border-red-200 bg-white">
                <div className="p-4">
                  <iframe
                    src={pdf.data}
                    className="w-full border border-gray-300 rounded"
                    style={{ height: '600px' }}
                    title={pdf.fileName || pdf.displayName}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PDFViewer;
