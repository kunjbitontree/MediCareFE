"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
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

  const filteredPatients = patients.filter((patient) =>
    patient.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.medical_condition.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.assigned_doctor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex overflow-x-hidden">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)}></div>
      )}

      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onAddPatient={() => router.push("/dashboard")} />

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 w-full min-w-0">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">All Patients</h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">View and manage patient records</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-4 py-2 rounded-lg font-semibold">
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
                className="w-full pl-11 pr-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 dark:text-gray-100"
              />
              <svg
                className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-400 dark:text-gray-500"
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
              <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-lg">
              <p className="text-red-700 dark:text-red-400">{error}</p>
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
                    className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 p-3 hover:scale-[1.01]"
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
                        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1.5 truncate">
                          {patient.patient_name}
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                          <div className="flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span className="text-gray-600 dark:text-gray-400">{patient.age} yrs • {patient.gender}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <span className="text-gray-600 dark:text-gray-400 truncate">{patient.patient_contact}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <span className="text-gray-600 dark:text-gray-400 truncate">{patient.medical_condition}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-gray-600 dark:text-gray-400 truncate">{patient.assigned_doctor}</span>
                          </div>
                        </div>
                      </div>

                      {/* View Details Button */}
                      <button
                        onClick={() => setSelectedPatient(patient)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg text-xs font-semibold transition-all duration-300 shadow-sm hover:shadow-md flex-shrink-0"
                      >
                        <span className="hidden sm:inline">View</span>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
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
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">No patients found</h3>
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm ? "Try adjusting your search" : "No patients have been added yet"}
              </p>
            </div>
          )}
        </main>
      </div>

      {/* Patient Details Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 px-6 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  {selectedPatient.patient_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedPatient.patient_name}</h2>
                  <p className="text-blue-100 text-sm">Patient Details</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPatient(null)}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Personal Info */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Personal Information
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Age:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">{selectedPatient.age} years</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Gender:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">{selectedPatient.gender}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Phone:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">{selectedPatient.patient_contact}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Email:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-gray-100 break-all">{selectedPatient.patient_email}</span>
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              {selectedPatient.emergency_name && (
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Emergency Contact
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Name:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">{selectedPatient.emergency_name}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Phone:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">{selectedPatient.emergency_contact}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Medical Info */}
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Medical Information
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Condition:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">{selectedPatient.medical_condition}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Doctor:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">{selectedPatient.assigned_doctor}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Admission:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">{selectedPatient.admission_date}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Discharge:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">{selectedPatient.discharge_date}</span>
                  </div>
                </div>
              </div>

              {/* Medications */}
              {selectedPatient.medication_details?.medications && selectedPatient.medication_details.medications.length > 0 && (
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-3">Medications</h3>
                  <div className="space-y-2">
                    {selectedPatient.medication_details.medications.map((med, idx) => (
                      <div key={idx} className="bg-white dark:bg-gray-700 p-3 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-gray-900 dark:text-gray-100">{med.name}</span>
                          <span className={`px-2 py-1 text-xs rounded-full ${med.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {med.status}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {med.dosage} • {med.frequency}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
