"use client";

import { useState } from "react";
import PersonalInfoSection from "./form-sections/PersonalInfoSection";
import MedicalInfoSection from "./form-sections/MedicalInfoSection";
import type { UploadedFileWithType } from "./form-sections/MedicalInfoSection";

type DocumentType = "Bills" | "Reports" | "Doctor Certificate" | "Discharge Note";

interface PatientData {
  name: string;
  age: number | string;
  gender: string;
  phone: string;
  email: string;
  emergencyName: string;
  emergencyEmail: string;
  emergencyContact: string;
  condition: string;
  doctor: string;
  doctorNotes: string;
  admissionDate: string;
  dischargeDate: string;
}

interface AddPatientFormProps {
  onClose: () => void;
  onSubmit: (patientData: PatientData, documents: UploadedFileWithType[]) => void;
  loading?: boolean;
}

export default function AddPatientForm({ onClose, onSubmit, loading = false }: AddPatientFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [selectedDocType, setSelectedDocType] = useState<DocumentType>("Bills");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileWithType[]>([]);
  
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "Male",
    phone: "",
    email: "",
    emergencyName: "",
    emergencyEmail: "",
    emergencyContact: "",
    condition: "",
    doctor: "",
    doctorNotes: "",
    admissionDate: "",
    dischargeDate: "",
  });

  const totalSteps = 2;
  const progress = (currentStep / totalSteps) * 100;

  const steps = [
    { number: 1, title: "Personal & Dates", icon: "user" },
    { number: 2, title: "Medical & Documents", icon: "medical" },
  ];

  const handleFieldChange = (field: string, value: string | number) => {
    setFormData({ ...formData, [field]: value });
  };

  const clearError = (field: string) => {
    const newErrors = { ...formErrors };
    delete newErrors[field];
    setFormErrors(newErrors);
  };

  const validateStep = (step: number) => {
    const errors: Record<string, string> = {};

    if (step === 1) {
      // Personal Information
      if (!formData.name || formData.name.trim() === "") {
        errors.name = "Name is required";
      }
      if (!formData.age || (typeof formData.age === 'number' && formData.age <= 0)) {
        errors.age = "Valid age is required";
      }
      
      // Phone validation (exactly 10 digits)
      if (!formData.phone || formData.phone.trim() === "") {
        errors.phone = "Phone number is required";
      } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
        errors.phone = "Phone must be exactly 10 digits";
      }
      
      // Email validation
      if (!formData.email || formData.email.trim() === "") {
        errors.email = "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.email = "Please enter a valid email";
      } else if (/\.\./.test(formData.email)) {
        errors.email = "Email cannot have two periods in a row";
      }
      
      // Emergency contact validation (at least 10 digits)
      if (formData.emergencyContact && formData.emergencyContact.trim() !== "") {
        const digits = formData.emergencyContact.replace(/\D/g, '');
        if (digits.length < 10) {
          errors.emergencyContact = "Emergency contact must be at least 10 digits";
        } else if (digits.length > 10) {
          errors.emergencyContact = "Emergency contact must be at most 10 digits";
        }
      }
      
      // Emergency email validation
      if (formData.emergencyEmail && formData.emergencyEmail.trim() !== "") {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emergencyEmail)) {
          errors.emergencyEmail = "Please enter a valid email";
        } else if (/\.\./.test(formData.emergencyEmail)) {
          errors.emergencyEmail = "Email cannot have two periods in a row";
        }
      }
      
      // Dates
      if (!formData.admissionDate) {
        errors.admissionDate = "Admission date is required";
      }
      if (!formData.dischargeDate) {
        errors.dischargeDate = "Discharge date is required";
      } else if (formData.admissionDate && formData.dischargeDate < formData.admissionDate) {
        errors.dischargeDate = "Discharge date must be after admission date";
      }
    } else if (step === 2) {
      // Medical Information
      if (!formData.condition || formData.condition.trim() === "") {
        errors.condition = "Medical condition is required";
      }
      if (!formData.doctor || formData.doctor.trim() === "") {
        errors.doctor = "Doctor name is required";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
    setFormErrors({});
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      console.error("❌ Please upload only PDF files");
      // Show error in form instead of alert
      setFormErrors({ ...formErrors, fileUpload: "Please upload only PDF files" });
      return;
    }

    // Store file with its document type
    setUploadedFiles([...uploadedFiles, { file, type: selectedDocType }]);
    event.target.value = "";
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    onSubmit(formData, uploadedFiles);
  };

  return (
    <div 
      className="fixed inset-0 bg-black/70 dark:bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50"
      onClick={loading ? undefined : onClose}
    >
      <div 
        className="bg-white dark:bg-gradient-to-br dark:from-gray-800 dark:via-gray-850 dark:to-gray-900 rounded-2xl shadow-2xl dark:shadow-blue-900/30 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden transition-all duration-300 border border-gray-200 dark:border-gray-700/50"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Sticky */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 dark:from-blue-600 dark:via-purple-600 dark:to-purple-700 px-5 py-5 rounded-t-2xl relative overflow-hidden flex-shrink-0 shadow-xl">

          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 dark:bg-white/30 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg ring-4 ring-white/20">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white drop-shadow-lg">Add New Patient</h2>
                <p className="text-blue-100 dark:text-purple-200 text-sm mt-1 font-medium">{steps[currentStep - 1].title}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="text-white hover:bg-white/20 dark:hover:bg-white/30 p-2.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110 hover:rotate-90 duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Progress Bar - Sticky */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/80 dark:to-gray-700/60 px-6 py-4 border-b border-gray-200 dark:border-gray-600/50 flex-shrink-0 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-gray-700 dark:text-white">Step {currentStep} of {totalSteps}</span>
            <span className="text-sm font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">{progress.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-600/50 rounded-full h-3 shadow-inner">
            <div
              className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 dark:from-blue-500 dark:via-purple-500 dark:to-blue-500 h-3 rounded-full transition-all duration-500 shadow-lg"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Form Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-gray-800">
          {currentStep === 1 && (
            <PersonalInfoSection
              formData={formData}
              formErrors={formErrors}
              onChange={handleFieldChange}
              clearError={clearError}
            />
          )}

          {currentStep === 2 && (
            <MedicalInfoSection
              formData={formData}
              formErrors={formErrors}
              onChange={handleFieldChange}
              clearError={clearError}
              selectedDocType={selectedDocType}
              uploadedFiles={uploadedFiles}
              onDocTypeChange={setSelectedDocType}
              onFileUpload={handleFileUpload}
              onRemoveFile={handleRemoveFile}
            />
          )}
        </div>

        {/* Navigation Buttons - Sticky at Bottom */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/80 px-6 py-5 border-t border-gray-200 dark:border-gray-700/50 flex-shrink-0 shadow-lg">
          <div className="flex gap-4">
            {currentStep > 1 && (
              <button
                onClick={handlePrevious}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 border-2 border-gray-300 dark:border-gray-600/50 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-500 text-gray-700 dark:text-white px-6 py-4 rounded-xl font-bold transition-all text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>
            )}
            {currentStep < totalSteps ? (
              <button
                onClick={handleNext}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-600 dark:from-blue-600 dark:via-purple-600 dark:to-blue-600 hover:from-blue-700 hover:via-blue-800 hover:to-blue-700 dark:hover:from-blue-500 dark:hover:via-purple-500 dark:hover:to-blue-500 text-white px-6 py-4 rounded-xl font-bold transition-all text-sm flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl dark:shadow-blue-900/50 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
              >
                Continue to Medical Info
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 dark:from-green-600 dark:via-emerald-600 dark:to-green-600 hover:from-green-700 hover:via-emerald-700 hover:to-green-700 dark:hover:from-green-500 dark:hover:via-emerald-500 dark:hover:to-green-500 text-white px-6 py-4 rounded-xl font-bold transition-all text-sm flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl dark:shadow-green-900/50 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Save Patient
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
