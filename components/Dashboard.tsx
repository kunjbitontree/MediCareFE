"use client";

import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import AddPatientForm from "./AddPatientForm";
import { patientAPI } from "@/lib/api";
import { useTheme } from "@/contexts/ThemeContext";

type DocumentType = "Bills" | "Reports" | "Doctor Certificate" | "Discharge Note";

type Patient = {
  id: number | string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  email: string;
  condition: string;
  room: string;
  status: "Critical" | "Stable" | "Recovering";
  admissionDate: string;
  dischargeDate?: string;
  doctor: string;
  documents?: Array<{
    id: number;
    fileName: string;
    fileSize: string;
    uploadDate: string;
    type: DocumentType;
  }>;
};

interface DashboardProps {
  userEmail?: string;
  onLogout: () => void;
}

export default function Dashboard({ userEmail, onLogout }: DashboardProps) {
  const { theme, toggleTheme } = useTheme();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const patientsPerPage = 4;

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await patientAPI.getAll();
      
      // Transform backend data to frontend Patient format
      const transformedPatients: Patient[] = (data as Array<Record<string, unknown>>).map((patient: Record<string, unknown>, index: number) => ({
        id: (patient._id as string) || (patient.id as number) || index + 1,
        name: (patient.patient_name as string) || "Unknown",
        age: (patient.age as number) || 0,
        gender: (patient.gender as string) || "Unknown",
        phone: (patient.patient_contact as string) || "N/A",
        email: (patient.patient_email as string) || "N/A",
        condition: (patient.medical_condition as string) || "N/A",
        room: `R-${index + 1}`,
        status: "Stable" as const,
        admissionDate: (patient.admission_date as string) || "",
        dischargeDate: (patient.discharge_date as string) || "",
        doctor: (patient.assigned_doctor as string) || "N/A",
      }));
      
      setPatients(transformedPatients);
    } catch (err) {
      console.error("Error fetching patients:", err);
      setError("Failed to load patients from server. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.condition.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.doctor.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesFilter = true;
    if (filterStatus === "Admitted") {
      matchesFilter = !!(patient.admissionDate && !patient.dischargeDate);
    } else if (filterStatus === "Discharged") {
      matchesFilter = !!patient.dischargeDate;
    } else if (filterStatus === "Today") {
      const today = new Date().toISOString().split('T')[0];
      matchesFilter = patient.admissionDate === today;
    }
    
    return matchesSearch && matchesFilter;
  });

  // Pagination
  const totalPages = Math.ceil(filteredPatients.length / patientsPerPage);
  const indexOfLastPatient = currentPage * patientsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
  const currentPatients = filteredPatients.slice(indexOfFirstPatient, indexOfLastPatient);

  // Reset to page 1 when search/filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  const stats = {
    total: patients.length,
    admitted: patients.filter((p) => p.admissionDate && !p.dischargeDate).length,
    discharged: patients.filter((p) => p.dischargeDate).length,
    newToday: patients.filter((p) => {
      const today = new Date().toISOString().split('T')[0];
      return p.admissionDate === today;
    }).length,
  };

  const handleAddPatient = async (
    patientData: {
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
    },
    documents: Array<{ file: File; type: DocumentType }>
  ) => {
    try {
      setLoading(true);
      setError(null);

      // Prepare patient data matching backend API format
      const backendPatientData = {
        // Patient Information
        patient_name: patientData.name,
        patient_contact: patientData.phone,
        patient_email: patientData.email,
        age: typeof patientData.age === 'string' ? parseInt(patientData.age) || 0 : patientData.age,
        gender: patientData.gender,
        
        // Emergency Contact
        emergency_name: patientData.emergencyName || "Not Provided",
        emergency_email: patientData.emergencyEmail || patientData.email,
        emergency_contact: patientData.emergencyContact || patientData.phone,
        
        // Medical Information
        medical_condition: patientData.condition,
        assigned_doctor: patientData.doctor,
        doctor_notes: patientData.doctorNotes || `Patient admitted for ${patientData.condition}`,
        
        // Dates
        admission_date: patientData.admissionDate,
        discharge_date: patientData.dischargeDate,
      };

      console.log("Sending to backend with files:", { data: backendPatientData, filesCount: documents.length });

      // Send to backend API with files
      const response = await patientAPI.create(backendPatientData, documents);
      console.log("Patient created successfully:", response);

      // Refresh patient list from backend
      await fetchPatients();

      // Close modal
      setShowAddModal(false);

      // Show success message (no popup)
      console.log("✅ Patient added successfully!");
    } catch (err) {
      console.error("Error adding patient:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to add patient. Please try again.";
      setError(errorMessage);
      console.error("❌ Error:", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Critical":
        return "bg-red-100 text-red-800 border border-red-200";
      case "Stable":
        return "bg-green-100 text-green-800 border border-green-200";
      case "Recovering":
        return "bg-blue-100 text-blue-800 border border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex overflow-x-hidden transition-colors duration-200">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onAddPatient={() => setShowAddModal(true)}
      />

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 w-full min-w-0">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30 transition-colors duration-200">
          <div className="px-4 sm:px-6 lg:px-8 py-4 w-full">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden text-gray-600 hover:text-gray-900"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">Patient Dashboard</h1>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5 hidden sm:block">
                    Manage and monitor patient information
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-4">
                <button
                  onClick={() => {
                    console.log("Current theme before toggle:", theme);
                    toggleTheme();
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all border border-gray-300 dark:border-gray-600"
                  title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
                >
                  {theme === "light" ? (
                    <>
                      {/* Light mode - show moon icon (to switch to dark) */}
                      <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      </svg>
                      <span className="hidden sm:inline text-sm font-medium text-gray-700">Dark</span>
                    </>
                  ) : (
                    <>
                      {/* Dark mode - show sun icon (to switch to light) */}
                      <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <span className="hidden sm:inline text-sm font-medium text-gray-200">Light</span>
                    </>
                  )}
                </button>
                <div className="hidden md:flex items-center gap-3 px-3 sm:px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {userEmail?.charAt(0).toUpperCase() || "A"}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{userEmail || "Admin"}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Administrator</p>
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-3 sm:px-4 py-2 rounded-lg font-medium transition-all shadow-sm hover:shadow-md"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 w-full max-w-full">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-6 w-full">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border-l-4 border-blue-500 p-6 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total Patients</div>
                <div className="text-4xl font-bold text-gray-800 dark:text-gray-100 mt-2">{stats.total}</div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-xl">
                <svg className="w-8 h-8 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border-l-4 border-green-500 p-6 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Currently Admitted</div>
                <div className="text-4xl font-bold text-gray-800 dark:text-gray-100 mt-2">{stats.admitted}</div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-xl">
                <svg className="w-8 h-8 text-green-500 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border-l-4 border-purple-500 p-6 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Discharged</div>
                <div className="text-4xl font-bold text-gray-800 dark:text-gray-100 mt-2">{stats.discharged}</div>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/30 p-3 rounded-xl">
                <svg className="w-8 h-8 text-purple-500 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border-l-4 border-orange-500 p-6 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">New Today</div>
                <div className="text-4xl font-bold text-gray-800 dark:text-gray-100 mt-2">{stats.newToday}</div>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/30 p-3 rounded-xl">
                <svg className="w-8 h-8 text-orange-500 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-700">{error}</p>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-500 hover:text-red-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="bg-blue-50 border border-blue-200 p-4 mb-6 rounded-lg">
            <div className="flex items-center gap-3">
              <svg className="animate-spin h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-sm text-blue-700 font-medium">Loading patients...</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-5 mb-6 w-full transition-colors duration-200">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full">
            <div className="flex-1 min-w-0">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search patients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white dark:bg-gray-700 dark:text-gray-100"
                />
                <svg className="absolute left-3.5 top-3 w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <div className="w-full sm:w-48 flex-shrink-0">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium bg-white dark:bg-gray-700 dark:text-gray-100"
              >
                <option value="All">All Patients</option>
                <option value="Admitted">Currently Admitted</option>
                <option value="Discharged">Discharged</option>
                <option value="Today">New Today</option>
              </select>
            </div>
          </div>
        </div>

        {/* Patient Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700 w-full transition-colors duration-200">
          {/* Mobile Card View */}
          <div className="block lg:hidden w-full">
            {currentPatients.map((patient) => (
              <div
                key={patient.id}
                onClick={() => (window.location.href = "/patients")}
                className="border-b border-gray-200 dark:border-gray-700 p-4 hover:bg-gray-50 dark:hover:bg-gray-700 w-full transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-3 mb-3 w-full">
                  <div className="flex-shrink-0 h-12 w-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                    {patient.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate">{patient.name}</h3>
                  </div>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full flex-shrink-0 ${getStatusColor(patient.status)}`}>
                    {patient.status}
                  </span>
                </div>
                <div className="space-y-2 text-sm w-full">
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 overflow-hidden">
                    <svg className="w-4 h-4 text-blue-500 dark:text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="truncate">{patient.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 overflow-hidden">
                    <svg className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="truncate">{patient.email}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 dark:border-gray-700 w-full">
                    <div className="min-w-0">
                      <span className="text-gray-500 dark:text-gray-400 text-xs">Age/Gender:</span>
                      <p className="font-medium text-gray-900 dark:text-gray-200 truncate">{patient.age} / {patient.gender}</p>
                    </div>
                    <div className="min-w-0">
                      <span className="text-gray-500 dark:text-gray-400 text-xs">Condition:</span>
                      <p className="font-medium text-gray-900 dark:text-gray-200 truncate">{patient.condition}</p>
                    </div>
                    <div className="min-w-0">
                      <span className="text-gray-500 dark:text-gray-400 text-xs">Admitted:</span>
                      <p className="font-medium text-gray-900 dark:text-gray-200 truncate">{patient.admissionDate}</p>
                    </div>
                    <div className="min-w-0">
                      <span className="text-gray-500 dark:text-gray-400 text-xs">Discharge:</span>
                      <p className="font-medium text-gray-900 dark:text-gray-200 truncate">{patient.dischargeDate || "-"}</p>
                    </div>
                    <div className="col-span-2 min-w-0">
                      <span className="text-gray-500 dark:text-gray-400 text-xs">Doctor:</span>
                      <p className="font-medium text-gray-900 dark:text-gray-200 truncate">{patient.doctor}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {filteredPatients.length === 0 && !loading && (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="mt-4 text-gray-500 font-medium">
                  {patients.length === 0 ? "No patients yet" : "No patients found"}
                </p>
                {patients.length === 0 && (
                  <p className="mt-2 text-sm text-gray-400">Click &quot;Add Patient&quot; to get started</p>
                )}
              </div>
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Patient Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Age/Gender
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Condition
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Admission Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Discharge Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Doctor
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {currentPatients.map((patient) => (
                  <tr
                    key={patient.id}
                    onClick={() => (window.location.href = "/patients")}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {patient.name.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">{patient.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-200 flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {patient.phone}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1.5 mt-1">
                        <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {patient.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-200">
                      {patient.age} / {patient.gender}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{patient.condition}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {patient.admissionDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {patient.dischargeDate || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-200">{patient.doctor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredPatients.length > patientsPerPage && (
            <div className="mt-6 flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 rounded-b-xl">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Showing <span className="font-medium">{indexOfFirstPatient + 1}</span> to{" "}
                    <span className="font-medium">{Math.min(indexOfLastPatient, filteredPatients.length)}</span> of{" "}
                    <span className="font-medium">{filteredPatients.length}</span> patients
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === page
                            ? "z-10 bg-blue-50 dark:bg-blue-900 border-blue-500 text-blue-600 dark:text-blue-400"
                            : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}

          {filteredPatients.length === 0 && !loading && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="mt-4 text-gray-500 font-medium">
                {patients.length === 0 ? "No patients yet" : "No patients found matching your criteria"}
              </p>
              {patients.length === 0 && (
                <p className="mt-2 text-sm text-gray-400">Click &quot;Add Patient&quot; to get started</p>
              )}
            </div>
          )}
        </div>
        </main>
      </div>

      {/* Mobile Add Button */}
      <button
        onClick={() => setShowAddModal(true)}
        className="lg:hidden fixed bottom-6 right-6 bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full shadow-xl hover:shadow-2xl hover:scale-110 transition-all z-30"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* Add Patient Modal */}
      {showAddModal && (
        <AddPatientForm
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddPatient}
        />
      )}
    </div>
  );
}
