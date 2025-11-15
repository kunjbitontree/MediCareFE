"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import AddPatientForm from "@/components/AddPatientForm";
import { patientAPI } from "@/lib/api";

type Patient = {
  _id?: string;
  id?: number | string;
  patient_name: string;
  age: number;
  gender: string;
  patient_contact: string;
  patient_email: string;
  emergency_name?: string;
  emergency_email?: string;
  emergency_contact?: string;
  medical_condition: string;
  assigned_doctor: string;
  doctor_notes?: string;
  admission_date: string;
  discharge_date: string;
  medication_details?: {
    diagnosis?: string;
    medications?: Array<{
      name: string;
      dosage: string;
      status: string;
      frequency: string;
    }>;
    additional_notes?: string;
  };
  bill_details?: string | string[];
  reports?: string | string[];
  doctor_medical_certificate?: string | string[];
};

export default function PatientsPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [viewingPdf, setViewingPdf] = useState<{ url: string; title: string } | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await patientAPI.getAll();
      setPatients(data as Patient[]);
    } catch (err) {
      console.error("Error fetching patients:", err);
      setError("Failed to load patients. Please try again.");
    } finally {
      setLoading(false);
    }
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
    documents: Array<{ file: File; type: string }>
  ) => {
    try {
      setSaving(true);
      setError(null);

      const backendPatientData = {
        patient_name: patientData.name,
        patient_contact: patientData.phone,
        patient_email: patientData.email,
        age: typeof patientData.age === 'string' ? parseInt(patientData.age) || 0 : patientData.age,
        gender: patientData.gender,
        emergency_name: patientData.emergencyName || "Not Provided",
        emergency_email: patientData.emergencyEmail || patientData.email,
        emergency_contact: patientData.emergencyContact || patientData.phone,
        medical_condition: patientData.condition,
        assigned_doctor: patientData.doctor,
        doctor_notes: patientData.doctorNotes || `Patient admitted for ${patientData.condition}`,
        admission_date: patientData.admissionDate,
        discharge_date: patientData.dischargeDate,
      };

      await patientAPI.create(backendPatientData, documents);
      await fetchPatients();
      setShowAddModal(false);
    } catch (err) {
      console.error("Error adding patient:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to add patient. Please try again.";
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const filteredPatients = patients.filter((patient) =>
    patient.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.medical_condition.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.assigned_doctor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-900 dark:to-slate-900 flex overflow-x-hidden transition-colors duration-300">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)}></div>
      )}

      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onAddPatient={() => setShowAddModal(true)} />

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 w-full min-w-0">
        {/* Header */}
        <header className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-lg shadow-lg border-b border-gray-200 dark:border-gray-700/50 sticky top-0 z-30 transition-all duration-300">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">All Patients</h1>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-0.5">View and manage patient records</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white px-4 py-2 rounded-lg font-semibold shadow-lg">
                  {filteredPatients.length} Patients
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="px-4 sm:px-6 lg:px-8 py-6">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <input
                type="text"
                placeholder="Search by name, condition, or doctor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border-2 border-gray-300 dark:border-gray-600/50 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-800/80 dark:text-gray-100 shadow-sm dark:shadow-lg transition-all duration-200 placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
              <svg
                className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-400 dark:text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="relative">
                <svg className="animate-spin h-12 w-12 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <div className="absolute inset-0 blur-xl bg-blue-500/30 dark:bg-blue-400/20 animate-pulse"></div>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 dark:border-red-400 p-4 rounded-xl shadow-lg dark:shadow-red-900/20">
              <p className="text-red-700 dark:text-red-300 font-medium">{error}</p>
            </div>
          )}

          {/* Patients Grid */}
          {!loading && !error && (
            <div className="space-y-3">
              {filteredPatients.map((patient, index) => {
                const colors = [
                  "from-blue-500 to-blue-600",
                  "from-green-500 to-green-600",
                  "from-purple-500 to-purple-600",
                  "from-pink-500 to-pink-600",
                  "from-yellow-500 to-yellow-600",
                  "from-indigo-500 to-indigo-600",
                ];
                const colorClass = colors[index % colors.length];

                return (
                  <div
                    key={patient._id || patient.id}
                    className="group bg-white dark:bg-gradient-to-br dark:from-gray-800 dark:to-gray-800/80 rounded-xl shadow-md hover:shadow-2xl dark:shadow-lg dark:hover:shadow-blue-900/30 transition-all duration-300 border border-gray-200 dark:border-gray-700/50 hover:border-blue-400 dark:hover:border-blue-500/50 p-3 hover:scale-[1.02] backdrop-blur-sm"
                  >
                    <div className="flex items-center gap-3">
                      {/* Patient Avatar */}
                      <div
                        className={`w-14 h-14 bg-gradient-to-br ${colorClass} rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-md flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}
                      >
                        {patient.patient_name.charAt(0).toUpperCase()}
                      </div>

                      {/* Patient Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1.5 truncate">
                          {patient.patient_name}
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                          <div className="flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span className="text-gray-600 dark:text-gray-300">{patient.age} yrs • {patient.gender}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <span className="text-gray-600 dark:text-gray-300 truncate">{patient.patient_contact}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 text-red-500 dark:text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <span className="text-gray-600 dark:text-gray-300 truncate">{patient.medical_condition}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 text-green-500 dark:text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-gray-600 dark:text-gray-300 truncate">{patient.assigned_doctor}</span>
                          </div>
                        </div>
                      </div>

                      {/* View Details Button */}
                      <button
                        onClick={() => setSelectedPatient(patient)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 dark:from-blue-600 dark:via-purple-600 dark:to-blue-600 hover:from-blue-700 hover:via-purple-700 hover:to-blue-700 dark:hover:from-blue-500 dark:hover:via-purple-500 dark:hover:to-blue-500 text-white rounded-xl text-sm font-bold transition-all duration-300 shadow-xl hover:shadow-2xl dark:shadow-blue-900/50 flex-shrink-0 hover:scale-110"
                      >
                        <span className="hidden sm:inline">View</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredPatients.length === 0 && (
            <div className="text-center py-12 bg-white dark:bg-gray-800/50 rounded-xl shadow-lg dark:shadow-xl border border-gray-200 dark:border-gray-700/50">
              <div className="relative inline-block">
                <svg className="w-20 h-20 text-gray-400 dark:text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <div className="absolute inset-0 blur-2xl bg-blue-500/10 dark:bg-blue-400/5"></div>
              </div>
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">No patients found</h3>
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm ? "Try adjusting your search" : "No patients have been added yet"}
              </p>
            </div>
          )}
        </main>
      </div>

      {/* Patient Details Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 bg-black/70 dark:bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gradient-to-br dark:from-gray-800 dark:via-gray-850 dark:to-gray-900 rounded-2xl shadow-2xl dark:shadow-blue-900/30 w-full max-w-5xl max-h-[92vh] overflow-y-auto border border-gray-200 dark:border-gray-700/50 animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 dark:from-blue-600 dark:via-purple-600 dark:to-purple-700 px-6 py-5 flex items-center justify-between z-10 shadow-xl">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 dark:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-xl ring-4 ring-white/20">
                  {selectedPatient.patient_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white drop-shadow-lg">{selectedPatient.patient_name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-blue-100 dark:text-purple-200 text-sm font-medium">Patient ID: #{selectedPatient._id?.slice(-6) || 'N/A'}</span>
                    <span className="w-1.5 h-1.5 bg-white/50 rounded-full"></span>
                    <span className="text-blue-100 dark:text-purple-200 text-sm">{selectedPatient.age} years • {selectedPatient.gender}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedPatient(null)}
                className="text-white hover:bg-white/20 dark:hover:bg-white/30 p-2.5 rounded-xl transition-all hover:scale-110 hover:rotate-90 duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 sm:p-8 space-y-6 bg-gradient-to-b from-gray-50/50 to-transparent dark:from-transparent">
              {/* Personal Info */}
              <div className="bg-gradient-to-br from-blue-50 via-blue-50 to-indigo-50 dark:from-gray-700/60 dark:via-gray-700/40 dark:to-gray-700/30 rounded-2xl p-6 shadow-md dark:shadow-xl border border-blue-200 dark:border-gray-600/50 hover:shadow-lg transition-shadow duration-300">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-5 flex items-center gap-3">
                  <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-xl shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">Personal Information</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="bg-white dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-600/30">
                    <div className="flex items-center gap-2 mb-1">
                      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Age</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{selectedPatient.age} years</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-600/30">
                    <div className="flex items-center gap-2 mb-1">
                      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Gender</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{selectedPatient.gender}</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-600/30">
                    <div className="flex items-center gap-2 mb-1">
                      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Phone</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{selectedPatient.patient_contact}</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-600/30">
                    <div className="flex items-center gap-2 mb-1">
                      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Email</span>
                    </div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white break-all">{selectedPatient.patient_email}</p>
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              {selectedPatient.emergency_name && (
                <div className="bg-gradient-to-br from-red-50 via-red-50 to-orange-50 dark:from-red-900/40 dark:via-red-900/30 dark:to-red-900/20 rounded-2xl p-6 shadow-md dark:shadow-xl border border-red-200 dark:border-red-800/50 hover:shadow-lg transition-shadow duration-300">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-5 flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 rounded-xl shadow-lg animate-pulse">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <span className="bg-gradient-to-r from-red-600 to-orange-600 dark:from-red-400 dark:to-orange-400 bg-clip-text text-transparent">Emergency Contact</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="bg-white dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-600/30">
                      <div className="flex items-center gap-2 mb-1">
                        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Contact Name</span>
                      </div>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{selectedPatient.emergency_name}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-600/30">
                      <div className="flex items-center gap-2 mb-1">
                        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Phone Number</span>
                      </div>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{selectedPatient.emergency_contact}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Medical Info */}
              <div className="bg-gradient-to-br from-green-50 via-green-50 to-emerald-50 dark:from-green-900/40 dark:via-green-900/30 dark:to-green-900/20 rounded-2xl p-6 shadow-md dark:shadow-xl border border-green-200 dark:border-green-800/50 hover:shadow-lg transition-shadow duration-300">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-5 flex items-center gap-3">
                  <div className="p-2.5 bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 rounded-xl shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <span className="bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">Medical Information</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="bg-white dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-600/30">
                    <div className="flex items-center gap-2 mb-1">
                      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Condition</span>
                    </div>
                    <p className="text-base font-bold text-gray-900 dark:text-white">{selectedPatient.medical_condition}</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-600/30">
                    <div className="flex items-center gap-2 mb-1">
                      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Assigned Doctor</span>
                    </div>
                    <p className="text-base font-bold text-gray-900 dark:text-white">{selectedPatient.assigned_doctor}</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-600/30">
                    <div className="flex items-center gap-2 mb-1">
                      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Admission Date</span>
                    </div>
                    <p className="text-base font-bold text-gray-900 dark:text-white">{new Date(selectedPatient.admission_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-600/30">
                    <div className="flex items-center gap-2 mb-1">
                      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Discharge Date</span>
                    </div>
                    <p className="text-base font-bold text-gray-900 dark:text-white">{new Date(selectedPatient.discharge_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                </div>
              </div>

              {/* Medications */}
              {selectedPatient.medication_details?.medications && selectedPatient.medication_details.medications.length > 0 && (
                <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/30 dark:to-purple-900/20 rounded-xl p-5 shadow-sm dark:shadow-lg border border-purple-100 dark:border-purple-800/50">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                    <div className="p-2 bg-purple-500 dark:bg-purple-600 rounded-lg shadow-md">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                      </svg>
                    </div>
                    Medications
                  </h3>
                  <div className="space-y-3">
                    {selectedPatient.medication_details.medications.map((med, idx) => (
                      <div key={idx} className="bg-white dark:bg-gray-700/50 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-600/50">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-gray-900 dark:text-white">{med.name}</span>
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${med.status === 'active' ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300'}`}>
                            {med.status}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                          {med.dosage} • {med.frequency}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Documents Section */}
              <div className="bg-gradient-to-br from-indigo-50 via-indigo-50 to-purple-50 dark:from-indigo-900/40 dark:via-indigo-900/30 dark:to-indigo-900/20 rounded-2xl p-6 shadow-md dark:shadow-xl border border-indigo-200 dark:border-indigo-800/50 hover:shadow-lg transition-shadow duration-300">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-5 flex items-center gap-3">
                  <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-700 rounded-xl shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <span className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">Medical Documents</span>
                </h3>
                <div className="space-y-3">
                  {/* Bills */}
                  {selectedPatient.bill_details && (
                    <div className="bg-white dark:bg-gray-700/50 p-4 rounded-xl flex items-center justify-between shadow-sm border border-gray-100 dark:border-gray-600/50 hover:shadow-md dark:hover:shadow-lg transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/50 dark:to-red-800/50 rounded-xl flex items-center justify-center shadow-md">
                          <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">Bills</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Medical bills and invoices</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const url = Array.isArray(selectedPatient.bill_details) 
                            ? selectedPatient.bill_details[0] 
                            : selectedPatient.bill_details;
                          if (url) setViewingPdf({ url, title: 'Bills' });
                        }}
                        className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 hover:from-blue-600 hover:to-blue-700 dark:hover:from-blue-500 dark:hover:to-blue-600 text-white rounded-lg text-sm font-semibold transition-all shadow-md hover:shadow-lg hover:scale-105"
                      >
                        View
                      </button>
                    </div>
                  )}

                  {/* Reports */}
                  {selectedPatient.reports && (
                    <div className="bg-white dark:bg-gray-700/50 p-4 rounded-xl flex items-center justify-between shadow-sm border border-gray-100 dark:border-gray-600/50 hover:shadow-md dark:hover:shadow-lg transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/50 dark:to-green-800/50 rounded-xl flex items-center justify-center shadow-md">
                          <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">Reports</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Medical test reports</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const url = Array.isArray(selectedPatient.reports) 
                            ? selectedPatient.reports[0] 
                            : selectedPatient.reports;
                          if (url) setViewingPdf({ url, title: 'Reports' });
                        }}
                        className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 hover:from-blue-600 hover:to-blue-700 dark:hover:from-blue-500 dark:hover:to-blue-600 text-white rounded-lg text-sm font-semibold transition-all shadow-md hover:shadow-lg hover:scale-105"
                      >
                        View
                      </button>
                    </div>
                  )}

                  {/* Doctor Certificate */}
                  {selectedPatient.doctor_medical_certificate && (
                    <div className="bg-white dark:bg-gray-700/50 p-4 rounded-xl flex items-center justify-between shadow-sm border border-gray-100 dark:border-gray-600/50 hover:shadow-md dark:hover:shadow-lg transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/50 dark:to-purple-800/50 rounded-xl flex items-center justify-center shadow-md">
                          <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">Doctor Certificate</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Medical certificate</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const url = Array.isArray(selectedPatient.doctor_medical_certificate) 
                            ? selectedPatient.doctor_medical_certificate[0] 
                            : selectedPatient.doctor_medical_certificate;
                          if (url) setViewingPdf({ url, title: 'Doctor Certificate' });
                        }}
                        className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 hover:from-blue-600 hover:to-blue-700 dark:hover:from-blue-500 dark:hover:to-blue-600 text-white rounded-lg text-sm font-semibold transition-all shadow-md hover:shadow-lg hover:scale-105"
                      >
                        View
                      </button>
                    </div>
                  )}

                  {/* No Documents */}
                  {!selectedPatient.bill_details && !selectedPatient.reports && !selectedPatient.doctor_medical_certificate && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-700/30 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
                      <div className="relative inline-block">
                        <svg className="w-16 h-16 mx-auto mb-3 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div className="absolute inset-0 blur-2xl bg-gray-400/10 dark:bg-gray-500/5"></div>
                      </div>
                      <p className="text-sm font-medium">No documents available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PDF Viewer Modal */}
      {viewingPdf && (
        <div className="fixed inset-0 bg-black/85 dark:bg-black/90 backdrop-blur-md z-[60] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gradient-to-br dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-2xl dark:shadow-blue-900/30 w-full max-w-6xl h-[90vh] flex flex-col border border-gray-200 dark:border-gray-700/50">
            {/* PDF Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-600 dark:to-purple-700 px-6 py-4 flex items-center justify-between rounded-t-2xl shadow-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 dark:bg-white/30 backdrop-blur-sm rounded-lg shadow-md">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-white drop-shadow-lg">{viewingPdf.title}</h2>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={viewingPdf.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-white/20 dark:bg-white/30 hover:bg-white/30 dark:hover:bg-white/40 backdrop-blur-sm text-white rounded-lg text-sm font-semibold transition-all flex items-center gap-2 shadow-md hover:shadow-lg hover:scale-105"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Open in New Tab
                </a>
                <button
                  onClick={() => setViewingPdf(null)}
                  className="text-white hover:bg-white/20 dark:hover:bg-white/30 p-2 rounded-lg transition-all hover:scale-110"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* PDF Viewer */}
            <div className="flex-1 overflow-hidden bg-gray-100 dark:bg-gray-950 rounded-b-2xl">
              <iframe
                src={viewingPdf.url}
                className="w-full h-full border-0"
                title={viewingPdf.title}
              />
            </div>
          </div>
        </div>
      )}

      {/* Add Patient Modal */}
      {showAddModal && (
        <AddPatientForm
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddPatient}
          loading={saving}
        />
      )}
    </div>
  );
}
