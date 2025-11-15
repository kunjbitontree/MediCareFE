"use client";

type DocumentType = "Bills" | "Reports" | "Doctor Certificate" | "Discharge Note";

export interface UploadedFileWithType {
  file: File;
  type: DocumentType;
}

interface MedicalInfoSectionProps {
  formData: {
    condition: string;
    doctor: string;
    doctorNotes: string;
  };
  formErrors: Record<string, string>;
  onChange: (field: string, value: string) => void;
  clearError: (field: string) => void;
  selectedDocType: DocumentType;
  uploadedFiles: UploadedFileWithType[];
  onDocTypeChange: (type: DocumentType) => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: (index: number) => void;
}

export default function MedicalInfoSection({
  formData,
  formErrors,
  onChange,
  clearError,
  selectedDocType,
  uploadedFiles,
  onDocTypeChange,
  onFileUpload,
  onRemoveFile,
}: MedicalInfoSectionProps) {
  return (
    <div className="space-y-6">
      {/* Medical Information */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-800">Medical Information</h3>
        </div>
        <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Medical Condition <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.condition}
            onChange={(e) => {
              onChange("condition", e.target.value);
              if (formErrors.condition) clearError("condition");
            }}
            placeholder="e.g., Diabetes"
            className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-slate-500 text-sm transition-all bg-white hover:border-gray-300 ${
              formErrors.condition ? "border-red-500" : "border-gray-200"
            }`}
          />
          {formErrors.condition && <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {formErrors.condition}
          </p>}
        </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Assigned Doctor <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.doctor}
              onChange={(e) => {
                onChange("doctor", e.target.value);
                if (formErrors.doctor) clearError("doctor");
              }}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-slate-500 text-sm transition-all bg-white hover:border-gray-300 ${
                formErrors.doctor ? "border-red-500" : "border-gray-200"
              }`}
            >
              <option value="">Select a doctor</option>
              <option value="Dr. Sarah Johnson">Dr. Sarah Johnson</option>
              <option value="Dr. Michael Chen">Dr. Michael Chen</option>
              <option value="Dr. James Lee">Dr. James Lee</option>
              <option value="Dr. Emily Rodriguez">Dr. Emily Rodriguez</option>
              <option value="Dr. David Kim">Dr. David Kim</option>
              <option value="Dr. Lisa Anderson">Dr. Lisa Anderson</option>
            </select>
            {formErrors.doctor && <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {formErrors.doctor}
            </p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Doctor Notes
            </label>
            <textarea
              value={formData.doctorNotes}
              onChange={(e) => {
                onChange("doctorNotes", e.target.value);
                if (formErrors.doctorNotes) clearError("doctorNotes");
              }}
              placeholder="Enter any additional notes or observations..."
              rows={4}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-slate-500 text-sm transition-all bg-white hover:border-gray-300 resize-none ${
                formErrors.doctorNotes ? "border-red-500" : "border-gray-200"
              }`}
            />
            {formErrors.doctorNotes && <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {formErrors.doctorNotes}
            </p>}
          </div>
        </div>
      </div>

      {/* Upload Documents */}
      <div className="pt-6 border-t border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-800">Upload Documents</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Select Document Type</label>
            <select
              value={selectedDocType}
              onChange={(e) => onDocTypeChange(e.target.value as DocumentType)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-500 text-sm transition-all bg-white hover:border-gray-300 font-medium"
            >
              <option value="Bills">Bills and Receipts</option>
              <option value="Reports">Medical Reports</option>
              <option value="Doctor Certificate">Doctor Certificate</option>
              <option value="Discharge Note">Discharge Note</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Upload PDF</label>
            <label className="w-full px-4 py-3 border-2 border-dashed border-orange-300 bg-orange-50 hover:bg-orange-100 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-all text-orange-700 text-sm font-medium shadow-sm hover:shadow-md">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Choose PDF
              <input type="file" accept=".pdf" onChange={onFileUpload} className="hidden" />
            </label>
          </div>
        </div>

        {/* Filter and display files by selected type */}
        {(() => {
          const filteredFiles = uploadedFiles.filter(f => f.type === selectedDocType);
          const allFilesCount = uploadedFiles.length;
          
          return (
            <div className="mt-4">
              {/* Summary of all files */}
              {allFilesCount > 0 && (
                <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-semibold text-blue-700 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Total Files: {allFilesCount} | Showing: {selectedDocType} ({filteredFiles.length})
                  </p>
                </div>
              )}

              {/* Display filtered files */}
              {filteredFiles.length > 0 ? (
                <div>
                  <p className="text-sm font-semibold text-orange-700 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {selectedDocType} Files ({filteredFiles.length})
                  </p>
                  <div className="space-y-2">
                    {filteredFiles.map((uploadedFile) => {
                      // Find the original index in the full array
                      const fullIndex = uploadedFiles.findIndex(f => f === uploadedFile);
                      return (
                        <div key={fullIndex} className="flex items-center justify-between bg-white p-3 rounded-lg border-2 border-gray-200 hover:border-orange-300 hover:shadow-md transition-all">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">{uploadedFile.file.name}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs text-gray-500">{(uploadedFile.file.size / 1024).toFixed(2)} KB</span>
                                <span className="text-xs text-gray-400">•</span>
                                <span className="text-xs font-medium text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full">{uploadedFile.type}</span>
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => onRemoveFile(fullIndex)}
                            className="text-red-500 hover:text-white hover:bg-red-600 p-2 rounded-lg transition-all flex-shrink-0 ml-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : allFilesCount > 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-sm font-medium text-gray-600">No {selectedDocType} files uploaded yet</p>
                  <p className="text-xs text-gray-500 mt-1">Upload a PDF to add it to this category</p>
                </div>
              ) : null}
            </div>
          );
        })()}
      </div>
    </div>
  );
}

