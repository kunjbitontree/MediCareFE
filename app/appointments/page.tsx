"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import AddPatientForm from "@/components/AddPatientForm";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { patientAPI } from "@/lib/api";

interface Patient {
  _id: string;
  patient_name: string;
  admission_date: string;
  discharge_date: string;
  medical_condition: string;
  assigned_doctor: string;
}

export default function AppointmentsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState("");

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
      const data = await patientAPI.getAll();
      setPatients(data as Patient[]);
    } catch (err) {
      console.error("Error fetching patients:", err);
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

  // Get calendar data
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNamesShort = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  // Filter patients who have admission/discharge in current month
  const currentMonthPatients = patients.filter((patient) => {
    const admission = new Date(patient.admission_date);
    const discharge = new Date(patient.discharge_date);
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0);
    
    // Check if patient's stay overlaps with current month
    return (
      (admission <= monthEnd && discharge >= monthStart)
    );
  });

  // Check if a date is between admission and discharge
  const isDateInRange = (date: Date, admissionDate: string, dischargeDate: string) => {
    const checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const admission = new Date(admissionDate);
    const discharge = new Date(dischargeDate);
    return checkDate >= admission && checkDate <= discharge;
  };

  // Get patients for a specific date
  const getPatientsForDate = (day: number) => {
    const date = new Date(year, month, day);
    return patients.filter((patient) => isDateInRange(date, patient.admission_date, patient.discharge_date));
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Get unique colors for patients
  const getPatientColor = (index: number) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-yellow-500",
      "bg-indigo-500",
      "bg-red-500",
      "bg-orange-500",
      "bg-teal-500",
      "bg-cyan-500",
    ];
    return colors[index % colors.length];
  };

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
          title="Patient Timeline" 
          subtitle="View patient admission and discharge schedule"
          setSidebarOpen={setSidebarOpen}
          userEmail={userEmail}
        />

        <main className="px-0 sm:px-6 lg:px-8 py-6">
          <div className="w-full max-w-full px-4 sm:px-0">
            {/* Calendar */}
            <div className="bg-white dark:bg-gradient-to-br dark:from-gray-800 dark:to-gray-800/80 rounded-2xl shadow-lg dark:shadow-xl border border-gray-200 dark:border-gray-700/50 p-4 sm:p-6 overflow-hidden">
              {/* Calendar Header */}
              <div className="flex items-center justify-center mb-6 gap-4">
                <button
                  onClick={handlePrevMonth}
                  className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all hover:scale-110 shadow-sm"
                >
                  <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent min-w-[280px] text-center">
                  {monthNames[month]} {year}
                </h2>
                <button
                  onClick={handleNextMonth}
                  className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all hover:scale-110 shadow-sm"
                >
                  <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 dark:border-red-400 p-4 rounded-xl shadow-lg dark:shadow-red-900/20">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-red-700 dark:text-red-300 font-medium text-sm">{error}</p>
                    <button
                      onClick={() => setError(null)}
                      className="ml-auto text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {/* Scroll Hint for Mobile */}
              <div className="sm:hidden mb-3 flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 py-2 px-4 rounded-lg border border-blue-200 dark:border-blue-800/50">
                <svg className="w-4 h-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                </svg>
                <span className="font-medium">Swipe left to view all days</span>
                <svg className="w-4 h-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>

              {loading ? (
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
              ) : (
                <div className="w-full overflow-x-auto overflow-y-visible -mx-4 sm:mx-0 px-4 sm:px-0 pb-2 scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-200 dark:scrollbar-track-gray-700">
                  <style jsx>{`
                    div::-webkit-scrollbar {
                      height: 8px;
                    }
                    div::-webkit-scrollbar-track {
                      background: rgb(229 231 235);
                      border-radius: 10px;
                    }
                    .dark div::-webkit-scrollbar-track {
                      background: rgb(55 65 81);
                    }
                    div::-webkit-scrollbar-thumb {
                      background: linear-gradient(to right, rgb(59 130 246), rgb(147 51 234));
                      border-radius: 10px;
                    }
                    div::-webkit-scrollbar-thumb:hover {
                      background: linear-gradient(to right, rgb(37 99 235), rgb(126 34 206));
                    }
                  `}</style>
                  <div className="min-w-max inline-block">
                    {/* Day Names Header (Su, Mo, Tu, We, Th, Fr, Sa) */}
                    <div className="grid gap-0.5 mb-2" style={{ gridTemplateColumns: `minmax(180px, 200px) repeat(${daysInMonth}, minmax(40px, 1fr))` }}>
                      <div className="text-xs font-bold text-gray-700 dark:text-white p-2 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 rounded-lg min-[600px]:sticky left-0 z-10 shadow-md border border-blue-200 dark:border-blue-800/50">
                        Patient Name
                      </div>
                      {Array.from({ length: daysInMonth }).map((_, index) => {
                        const day = index + 1;
                        const date = new Date(year, month, day);
                        const dayName = dayNamesShort[date.getDay()];
                        return (
                          <div key={day} className="text-center p-1 rounded-lg bg-gray-50 dark:bg-gray-700/50 min-w-[40px] border border-gray-200 dark:border-gray-600/30">
                            <div className="text-[10px] font-semibold text-gray-600 dark:text-gray-300">{dayName}</div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Patient Rows with Date Numbers */}
                    <div className="space-y-1">
                      {currentMonthPatients.map((patient, patientIndex) => (
                        <div
                          key={patient._id}
                          className="grid gap-0.5 hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-lg transition-colors"
                          style={{ gridTemplateColumns: `minmax(180px, 200px) repeat(${daysInMonth}, minmax(40px, 1fr))` }}
                        >
                          {/* Patient Name & Dates */}
                          <div
                            className="flex items-center gap-2 cursor-pointer p-2 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/80 dark:to-gray-700/60 rounded-lg hover:from-blue-50 hover:to-purple-50 dark:hover:from-gray-600 dark:hover:to-gray-600 transition-all min-[600px]:sticky left-0 z-10 shadow-md border border-gray-200 dark:border-gray-600/50 hover:scale-[1.02]"
                            onClick={() => window.location.href = "/patients"}
                          >
                            <div
                              className={`w-8 h-8 ${getPatientColor(patientIndex)} rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-lg`}
                            >
                              {patient.patient_name.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                                {patient.patient_name}
                              </div>
                              <div className="text-[10px] text-gray-500 dark:text-gray-300 truncate">
                                {new Date(patient.admission_date).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })}{" "}
                                -{" "}
                                {new Date(patient.discharge_date).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })}
                              </div>
                            </div>
                          </div>

                          {/* Days with Date Numbers and Circles */}
                          {Array.from({ length: daysInMonth }).map((_, index) => {
                            const day = index + 1;
                            const patientsForDay = getPatientsForDate(day);
                            const isPatientInDay = patientsForDay.some((p) => p._id === patient._id);

                            return (
                              <div key={day} className="flex flex-col items-center justify-center p-1 min-w-[40px]">
                                <div className="text-[10px] font-bold text-gray-700 dark:text-gray-300 mb-1">{day}</div>
                                <div className="h-7 flex items-center justify-center w-full">
                                  {isPatientInDay && (
                                    <div
                                      className={`w-6 h-6 ${getPatientColor(patientIndex)} rounded-full shadow-md hover:scale-110 transition-transform cursor-pointer`}
                                      title={`${patient.patient_name} - ${patient.medical_condition}`}
                                    ></div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>

                    {currentMonthPatients.length === 0 && (
                      <div className="text-center py-12 bg-gray-50 dark:bg-gray-700/30 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
                        <div className="relative inline-block">
                          <svg className="w-20 h-20 text-gray-400 dark:text-gray-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <div className="absolute inset-0 blur-2xl bg-gray-400/10 dark:bg-gray-500/5"></div>
                        </div>
                        <p className="text-gray-500 dark:text-gray-300 font-semibold">No patients in this month</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

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
