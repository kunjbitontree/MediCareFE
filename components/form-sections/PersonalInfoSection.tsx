"use client";

interface PersonalInfoSectionProps {
  formData: {
    name: string;
    age: number | string;
    gender: string;
    phone: string;
    email: string;
    emergencyName: string;
    emergencyEmail: string;
    emergencyContact: string;
    admissionDate: string;
    dischargeDate: string;
  };
  formErrors: Record<string, string>;
  onChange: (field: string, value: string | number) => void;
  clearError: (field: string) => void;
}

export default function PersonalInfoSection({
  formData,
  formErrors,
  onChange,
  clearError,
}: PersonalInfoSectionProps) {
  return (
    <div className="space-y-6">
      {/* Personal Details */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-blue-500 dark:bg-blue-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Personal Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => {
              onChange("name", e.target.value);
              if (formErrors.name) clearError("name");
            }}
            placeholder="John Doe"
            className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm transition-all bg-white dark:bg-gray-700 dark:text-gray-100 hover:border-gray-300 dark:hover:border-gray-500 ${
              formErrors.name ? "border-red-500" : "border-gray-200 dark:border-gray-600"
            }`}
          />
          {formErrors.name && <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {formErrors.name}
          </p>}
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Age <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={formData.age}
            onChange={(e) => {
              onChange("age", e.target.value ? parseInt(e.target.value) : "");
              if (formErrors.age) clearError("age");
            }}
            placeholder="25"
            className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm transition-all bg-white hover:border-gray-300 ${
              formErrors.age ? "border-red-500" : "border-gray-200"
            }`}
          />
          {formErrors.age && <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {formErrors.age}
          </p>}
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Gender</label>
          <select
            value={formData.gender}
            onChange={(e) => onChange("gender", e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm transition-all bg-white dark:bg-gray-700 dark:text-gray-100 hover:border-gray-300 dark:hover:border-gray-500"
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Phone <span className="text-red-500">*</span>
            <span className="text-xs text-gray-500 font-normal ml-2">(10 digits required)</span>
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => {
              // Only allow digits and limit to 10
              const value = e.target.value.replace(/\D/g, '').slice(0, 10);
              onChange("phone", value);
              if (formErrors.phone) clearError("phone");
            }}
            placeholder="1234567890"
            maxLength={10}
            className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm transition-all bg-white hover:border-gray-300 ${
              formErrors.phone ? "border-red-500" : "border-gray-200"
            }`}
          />
          <p className="mt-1 text-xs text-gray-500">{formData.phone.length}/10 digits</p>
          {formErrors.phone && <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {formErrors.phone}
          </p>}
        </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => {
                onChange("email", e.target.value);
                if (formErrors.email) clearError("email");
              }}
              placeholder="patient@email.com"
              className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm transition-all bg-white hover:border-gray-300 ${
                formErrors.email ? "border-red-500" : "border-gray-200"
              }`}
            />
            {formErrors.email && <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {formErrors.email}
            </p>}
          </div>
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="pt-6 border-t border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-red-500 dark:bg-red-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Emergency Contact</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Emergency Contact Name
            </label>
            <input
              type="text"
              value={formData.emergencyName}
              onChange={(e) => {
                onChange("emergencyName", e.target.value);
                if (formErrors.emergencyName) clearError("emergencyName");
              }}
              placeholder="Jane Doe"
              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-slate-500 text-sm transition-all bg-white hover:border-gray-300 ${
                formErrors.emergencyName ? "border-red-500" : "border-gray-200"
              }`}
            />
            {formErrors.emergencyName && <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {formErrors.emergencyName}
            </p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Emergency Contact Phone
              <span className="text-xs text-gray-500 font-normal ml-2">(10 digits required)</span>
            </label>
            <input
              type="tel"
              value={formData.emergencyContact}
              onChange={(e) => {
                // Only allow digits and limit to 10
                const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                onChange("emergencyContact", value);
                if (formErrors.emergencyContact) clearError("emergencyContact");
              }}
              placeholder="1234567890"
              maxLength={10}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-slate-500 text-sm transition-all bg-white hover:border-gray-300 ${
                formErrors.emergencyContact ? "border-red-500" : "border-gray-200"
              }`}
            />
            <p className="mt-1 text-xs text-gray-500">{formData.emergencyContact.length}/10 digits</p>
            {formErrors.emergencyContact && <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {formErrors.emergencyContact}
            </p>}
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Emergency Contact Email
            </label>
            <input
              type="email"
              value={formData.emergencyEmail}
              onChange={(e) => {
                onChange("emergencyEmail", e.target.value);
                if (formErrors.emergencyEmail) clearError("emergencyEmail");
              }}
              placeholder="emergency@email.com"
              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-slate-500 text-sm transition-all bg-white hover:border-gray-300 ${
                formErrors.emergencyEmail ? "border-red-500" : "border-gray-200"
              }`}
            />
            {formErrors.emergencyEmail && <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {formErrors.emergencyEmail}
            </p>}
          </div>
        </div>
      </div>

      {/* Admission & Discharge Dates */}
      <div className="pt-6 border-t border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-purple-500 dark:bg-purple-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Admission & Discharge</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Admission Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.admissionDate}
              onChange={(e) => {
                onChange("admissionDate", e.target.value);
                if (formErrors.admissionDate) clearError("admissionDate");
              }}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-slate-500 text-sm transition-all bg-white hover:border-gray-300 ${
                formErrors.admissionDate ? "border-red-500" : "border-gray-200"
              }`}
            />
            {formErrors.admissionDate && <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {formErrors.admissionDate}
            </p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Discharge Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.dischargeDate}
              onChange={(e) => {
                onChange("dischargeDate", e.target.value);
                if (formErrors.dischargeDate) clearError("dischargeDate");
              }}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-slate-500 text-sm transition-all bg-white hover:border-gray-300 ${
                formErrors.dischargeDate ? "border-red-500" : "border-gray-200"
              }`}
            />
            {formErrors.dischargeDate && <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {formErrors.dischargeDate}
            </p>}
          </div>
        </div>
      </div>
    </div>
  );
}

