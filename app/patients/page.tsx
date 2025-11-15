"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import AddPatientForm from "@/components/AddPatientForm";
import { ThemeProvider } from "@/contexts/ThemeContext";
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
    discharge_summary_url?: string;
    action_plan_pdf_url?: string;
  };
  insurer_justification_pdf_url?: string;
  bill_details?: string | string[] | Array<{
    url: string;
    name: string;
    total: string;
    details?: Array<{
      name: string;
      cost: string;
    }>;
  }>;
  reports?: string | string[] | Array<{
    url: string;
    name: string;
    reason: string;
    biomarkers?: Array<{
      name: string;
      value: string;
      range: string;
    }>;
  }>;
  doctor_medical_certificate?: string | string[] | Array<{
    url: string;
    name?: string;
  }>;
};

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [viewingPdf, setViewingPdf] = useState<{ url: string; title: string } | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [activeDocTab, setActiveDocTab] = useState<'bills' | 'reports' | 'certificate' | 'discharge' | 'action' | 'insurer'>('bills');

  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    if (email) setUserEmail(email);
  }, []);

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
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-900 dark:to-slate-900 flex overflow-x-hidden transition-colors duration-300">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)}></div>
      )}

      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onAddPatient={() => setShowAddModal(true)} />

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 w-full min-w-0">
        {/* Navbar */}
        <Navbar 
          title="All Patients" 
          subtitle="View and manage patient records"
          setSidebarOpen={setSidebarOpen}
          userEmail={userEmail}
        />

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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredPatients.map((patient, index) => {
                const colors = [
                  { gradient: "from-blue-500 via-blue-600 to-indigo-600", ring: "ring-blue-500/20", glow: "shadow-blue-500/20" },
                  { gradient: "from-emerald-500 via-green-600 to-teal-600", ring: "ring-emerald-500/20", glow: "shadow-emerald-500/20" },
                  { gradient: "from-purple-500 via-violet-600 to-purple-700", ring: "ring-purple-500/20", glow: "shadow-purple-500/20" },
                  { gradient: "from-pink-500 via-rose-600 to-red-600", ring: "ring-pink-500/20", glow: "shadow-pink-500/20" },
                  { gradient: "from-amber-500 via-orange-600 to-yellow-600", ring: "ring-amber-500/20", glow: "shadow-amber-500/20" },
                  { gradient: "from-cyan-500 via-sky-600 to-blue-600", ring: "ring-cyan-500/20", glow: "shadow-cyan-500/20" },
                ];
                const colorScheme = colors[index % colors.length];

                return (
                  <div
                    key={patient._id || patient.id}
                    className="group relative bg-white dark:bg-gradient-to-br dark:from-gray-800 dark:via-gray-800 dark:to-gray-900 rounded-2xl shadow-lg hover:shadow-2xl dark:shadow-xl dark:hover:shadow-2xl transition-all duration-500 border border-gray-200/50 dark:border-gray-700/50 hover:border-transparent dark:hover:border-transparent overflow-hidden"
                  >
                    {/* Animated Background Gradient on Hover */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${colorScheme.gradient} opacity-0 group-hover:opacity-5 dark:group-hover:opacity-10 transition-opacity duration-500`}></div>
                    
                    {/* Top Accent Bar */}
                    <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${colorScheme.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}></div>

                    <div className="relative p-5">
                      <div className="flex items-start gap-4">
                        {/* Enhanced Patient Avatar */}
                        <div className="relative flex-shrink-0">
                          <div className={`absolute inset-0 bg-gradient-to-br ${colorScheme.gradient} rounded-2xl blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-500 ${colorScheme.glow}`}></div>
                          <div
                            className={`relative w-16 h-16 bg-gradient-to-br ${colorScheme.gradient} rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg ring-4 ring-white dark:ring-gray-800 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}
                          >
                            {patient.patient_name.charAt(0).toUpperCase()}
                          </div>
                          {/* Status Indicator */}
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-3 border-white dark:border-gray-800 shadow-lg">
                            <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></div>
                          </div>
                        </div>

                        {/* Patient Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 truncate group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 dark:group-hover:from-blue-400 dark:group-hover:to-purple-400 transition-all duration-300">
                                {patient.patient_name}
                              </h3>
                              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                ID: #{patient._id?.slice(-8).toUpperCase() || 'N/A'}
                              </p>
                            </div>
                            
                            {/* View Details Button */}
                            <button
                              onClick={() => setSelectedPatient(patient)}
                              className={`relative px-4 py-2.5 bg-gradient-to-r ${colorScheme.gradient} text-white rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-2 overflow-hidden group/btn`}
                            >
                              <span className="absolute inset-0 bg-white opacity-0 group-hover/btn:opacity-20 transition-opacity duration-300"></span>
                              <span className="relative">View</span>
                              <svg className="relative w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                              </svg>
                            </button>
                          </div>

                          {/* Info Grid */}
                          <div className="grid grid-cols-2 gap-3">
                            {/* Age & Gender */}
                            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg px-3 py-2 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors duration-300">
                              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
                                <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Age & Gender</p>
                                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{patient.age} • {patient.gender}</p>
                              </div>
                            </div>

                            {/* Contact */}
                            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg px-3 py-2 group-hover:bg-green-50 dark:group-hover:bg-green-900/20 transition-colors duration-300">
                              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
                                <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Contact</p>
                                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{patient.patient_contact}</p>
                              </div>
                            </div>

                            {/* Condition */}
                            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg px-3 py-2 group-hover:bg-red-50 dark:group-hover:bg-red-900/20 transition-colors duration-300">
                              <div className="w-8 h-8 bg-red-100 dark:bg-red-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
                                <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Condition</p>
                                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{patient.medical_condition}</p>
                              </div>
                            </div>

                            {/* Doctor */}
                            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg px-3 py-2 group-hover:bg-purple-50 dark:group-hover:bg-purple-900/20 transition-colors duration-300">
                              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
                                <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Doctor</p>
                                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{patient.assigned_doctor}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Shine Effect */}
                    <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
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
        <div 
          className="fixed inset-0 bg-black/70 dark:bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setSelectedPatient(null)}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-y-auto animate-in fade-in zoom-in duration-200 [&::-webkit-scrollbar]:hidden"
            onClick={(e) => e.stopPropagation()}
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 dark:from-blue-600 dark:via-purple-600 dark:to-purple-700 px-4 py-3 flex items-center justify-between z-10 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 dark:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-lg font-bold shadow-xl">
                  {selectedPatient.patient_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white drop-shadow-lg">{selectedPatient.patient_name}</h2>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-100 dark:text-purple-200 text-xs font-medium">ID: #{selectedPatient._id?.slice(-6) || 'N/A'}</span>
                    <span className="w-1 h-1 bg-white/50 rounded-full"></span>
                    <span className="text-blue-100 dark:text-purple-200 text-xs">{selectedPatient.age} yrs • {selectedPatient.gender}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedPatient(null)}
                className="text-white hover:bg-white/20 dark:hover:bg-white/30 p-2 rounded-xl transition-all hover:scale-110 hover:rotate-90 duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              {(selectedPatient.bill_details || selectedPatient.reports || selectedPatient.doctor_medical_certificate || selectedPatient.medication_details?.discharge_summary_url || selectedPatient.medication_details?.action_plan_pdf_url || selectedPatient.insurer_justification_pdf_url) && (
                <div className="bg-gradient-to-br from-indigo-50 via-indigo-50 to-purple-50 dark:from-indigo-900/40 dark:via-indigo-900/30 dark:to-indigo-900/20 rounded-2xl p-6 shadow-md dark:shadow-xl border border-indigo-200 dark:border-indigo-800/50 hover:shadow-lg transition-shadow duration-300">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-5 flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-700 rounded-xl shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <span className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">Medical Documents</span>
                  </h3>

                  {/* Tabs for Bills, Reports, and Certificate */}
                  <>
                    <div className="flex gap-2 mb-4 border-b border-gray-200 dark:border-gray-700">
                      {selectedPatient.bill_details && (
                        <button
                          onClick={() => setActiveDocTab('bills')}
                          className={`px-4 py-2 font-semibold text-sm transition-all ${
                            activeDocTab === 'bills'
                              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                          }`}
                        >
                          Bills ({(() => {
                            const bills = typeof selectedPatient.bill_details === 'string' ? [selectedPatient.bill_details] : Array.isArray(selectedPatient.bill_details) ? selectedPatient.bill_details : [];
                            return bills.length;
                          })()})
                        </button>
                      )}
                      {selectedPatient.reports && (
                        <button
                          onClick={() => setActiveDocTab('reports')}
                          className={`px-4 py-2 font-semibold text-sm transition-all ${
                            activeDocTab === 'reports'
                              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                          }`}
                        >
                          Reports ({(() => {
                            const reports = typeof selectedPatient.reports === 'string' ? [selectedPatient.reports] : Array.isArray(selectedPatient.reports) ? selectedPatient.reports : [];
                            return reports.length;
                          })()})
                        </button>
                      )}
                      {selectedPatient.doctor_medical_certificate && (
                        <button
                          onClick={() => setActiveDocTab('certificate')}
                          className={`px-4 py-2 font-semibold text-sm transition-all ${
                            activeDocTab === 'certificate'
                              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                          }`}
                        >
                          Certificate
                        </button>
                      )}
                      {selectedPatient.medication_details?.discharge_summary_url && (
                        <button
                          onClick={() => setActiveDocTab('discharge')}
                          className={`px-4 py-2 font-semibold text-sm transition-all ${
                            activeDocTab === 'discharge'
                              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                          }`}
                        >
                          Discharge Summary
                        </button>
                      )}
                      {selectedPatient.medication_details?.action_plan_pdf_url && (
                        <button
                          onClick={() => setActiveDocTab('action')}
                          className={`px-4 py-2 font-semibold text-sm transition-all ${
                            activeDocTab === 'action'
                              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                          }`}
                        >
                          Action Plan
                        </button>
                      )}
                      {selectedPatient.insurer_justification_pdf_url && (
                        <button
                          onClick={() => setActiveDocTab('insurer')}
                          className={`px-4 py-2 font-semibold text-sm transition-all ${
                            activeDocTab === 'insurer'
                              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                          }`}
                        >
                          Insurer Justification
                        </button>
                      )}
                    </div>

                    {/* Tab Content */}
                    <div className="space-y-3">
                      {/* Bills Tab */}
                      {activeDocTab === 'bills' && selectedPatient.bill_details && (() => {
                        const bills = typeof selectedPatient.bill_details === 'string' 
                          ? [{ url: selectedPatient.bill_details, name: 'Bill', total: '' }]
                          : Array.isArray(selectedPatient.bill_details) 
                            ? selectedPatient.bill_details 
                            : [];
                        
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        return bills.map((bill: any, idx: number) => (
                          <div key={idx} className="bg-white dark:bg-gray-700/50 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-600/50 hover:shadow-md dark:hover:shadow-lg transition-all">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 flex-1">
                                <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/50 dark:to-red-800/50 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                                  <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-gray-900 dark:text-white truncate">
                                    {bill.name || `Bill ${idx + 1}`}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {bill.total ? `Total: ${bill.total}` : 'Medical bill'}
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() => {
                                  const url = typeof bill === 'string' ? bill : bill.url;
                                  if (url) setViewingPdf({ url, title: bill.name || 'Bill' });
                                }}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-all flex-shrink-0"
                              >
                                View
                              </button>
                            </div>
                          </div>
                        ));
                      })()}

                      {/* Reports Tab */}
                      {activeDocTab === 'reports' && selectedPatient.reports && (() => {
                        const reports = typeof selectedPatient.reports === 'string' 
                          ? [{ url: selectedPatient.reports, name: 'Report', reason: '' }]
                          : Array.isArray(selectedPatient.reports) 
                            ? selectedPatient.reports 
                            : [];
                        
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        return reports.map((report: any, idx: number) => (
                          <div key={idx} className="bg-white dark:bg-gray-700/50 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-600/50 hover:shadow-md dark:hover:shadow-lg transition-all">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 flex-1">
                                <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/50 dark:to-green-800/50 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-gray-900 dark:text-white truncate">
                                    {report.name || `Report ${idx + 1}`}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                                    {report.reason || 'Medical test report'}
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() => {
                                  const url = typeof report === 'string' ? report : report.url;
                                  if (url) setViewingPdf({ url, title: report.name || 'Report' });
                                }}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-all flex-shrink-0"
                              >
                                View
                              </button>
                            </div>
                          </div>
                        ));
                      })()}

                      {/* Certificate Tab */}
                      {activeDocTab === 'certificate' && selectedPatient.doctor_medical_certificate && (
                        <div className="bg-white dark:bg-gray-700/50 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-600/50 hover:shadow-md dark:hover:shadow-lg transition-all">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/50 dark:to-purple-800/50 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 dark:text-white truncate">
                                  Doctor Medical Certificate
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Medical certificate</p>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                const url = typeof selectedPatient.doctor_medical_certificate === 'string' 
                                  ? selectedPatient.doctor_medical_certificate 
                                  : '';
                                if (url) setViewingPdf({ url, title: 'Doctor Medical Certificate' });
                              }}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-all flex-shrink-0"
                            >
                              View
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Discharge Summary Tab */}
                      {activeDocTab === 'discharge' && selectedPatient.medication_details?.discharge_summary_url && (
                        <div className="bg-white dark:bg-gray-700/50 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-600/50 hover:shadow-md dark:hover:shadow-lg transition-all">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/50 dark:to-orange-800/50 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                                <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 dark:text-white truncate">
                                  Discharge Summary
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Patient discharge summary document</p>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                const url = selectedPatient.medication_details?.discharge_summary_url;
                                if (url) setViewingPdf({ url, title: 'Discharge Summary' });
                              }}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-all flex-shrink-0"
                            >
                              View
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Action Plan Tab */}
                      {activeDocTab === 'action' && selectedPatient.medication_details?.action_plan_pdf_url && (
                        <div className="bg-white dark:bg-gray-700/50 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-600/50 hover:shadow-md dark:hover:shadow-lg transition-all">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              <div className="w-12 h-12 bg-gradient-to-br from-teal-100 to-teal-200 dark:from-teal-900/50 dark:to-teal-800/50 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                                <svg className="w-6 h-6 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                </svg>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 dark:text-white truncate">
                                  Action Plan
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Treatment action plan document</p>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                const url = selectedPatient.medication_details?.action_plan_pdf_url;
                                if (url) setViewingPdf({ url, title: 'Action Plan' });
                              }}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-all flex-shrink-0"
                            >
                              View
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Insurer Justification Tab */}
                      {activeDocTab === 'insurer' && selectedPatient.insurer_justification_pdf_url && (
                        <div className="bg-white dark:bg-gray-700/50 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-600/50 hover:shadow-md dark:hover:shadow-lg transition-all">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900/50 dark:to-yellow-800/50 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                                <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 dark:text-white truncate">
                                  Insurer Justification
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Insurance justification document</p>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                const url = selectedPatient.insurer_justification_pdf_url;
                                if (url) setViewingPdf({ url, title: 'Insurer Justification' });
                              }}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-all flex-shrink-0"
                            >
                              View
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                </div>
              )}
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
            <div className="flex-1 overflow-hidden bg-gray-100 dark:bg-gray-950 rounded-b-2xl relative">
              {viewingPdf.url ? (
                <iframe
                  src={`${viewingPdf.url}#view=FitH`}
                  className="w-full h-full border-0"
                  title={viewingPdf.title}
                  allow="fullscreen"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-gray-600 dark:text-gray-400">PDF not available</p>
                  </div>
                </div>
              )}
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
    </ThemeProvider>
  );
}
