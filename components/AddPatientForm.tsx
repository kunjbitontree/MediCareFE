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
}

export default function AddPatientForm({ onClose, onSubmit }: AddPatientFormProps) {
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden transition-colors duration-200">
        {/* Header - Sticky */}
        <div className="bg-blue-600 dark:bg-blue-700 px-5 py-4 rounded-t-xl relative overflow-hidden flex-shrink-0">

          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Add New Patient</h2>
                <p className="text-gray-300 text-sm mt-0.5">{steps[currentStep - 1].title}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-slate-700 p-2.5 rounded-xl transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Progress Bar - Sticky */}
        <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-600 flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Step {currentStep} of {totalSteps}</span>
            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{progress.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
            <div
              className="bg-blue-600 dark:bg-blue-500 h-2.5 rounded-full transition-all duration-300"
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
        <div className="bg-white dark:bg-gray-800 px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex gap-3">
            {currentStep > 1 && (
              <button
                onClick={handlePrevious}
                className="flex-1 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-6 py-3.5 rounded-lg font-semibold transition-all text-sm flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
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
                className="flex-1 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white px-6 py-3.5 rounded-lg font-semibold transition-all text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              >
                Continue to Medical Info
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="flex-1 bg-green-600 dark:bg-green-500 hover:bg-green-700 dark:hover:bg-green-600 text-white px-6 py-3.5 rounded-lg font-semibold transition-all text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Save Patient
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
