"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
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
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

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
                  <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Patient Timeline</h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">View patient admission and discharge schedule</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="w-full max-w-full">
            {/* Calendar */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 sm:p-6">
              {/* Calendar Header */}
              <div className="flex items-center justify-center mb-6 gap-4">
                <button
                  onClick={handlePrevMonth}
                  className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 min-w-[280px] text-center">
                  {monthNames[month]} {year}
                </h2>
                <button
                  onClick={handleNextMonth}
                  className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {loading ? (
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
              ) : (
                <div className="w-full overflow-hidden">
                  <div className="w-full">
                    {/* Day Names Header (Su, Mo, Tu, We, Th, Fr, Sa) */}
                    <div className="grid gap-0.5 mb-2" style={{ gridTemplateColumns: `minmax(180px, 200px) repeat(${daysInMonth}, minmax(0, 1fr))` }}>
                      <div className="text-xs font-bold text-gray-700 dark:text-gray-300 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg sticky left-0 z-10">
                        Patient Name
                      </div>
                      {Array.from({ length: daysInMonth }).map((_, index) => {
                        const day = index + 1;
                        const date = new Date(year, month, day);
                        const dayName = dayNamesShort[date.getDay()];
                        return (
                          <div key={day} className="text-center p-1 rounded bg-gray-50 dark:bg-gray-700 min-w-0">
                            <div className="text-[9px] sm:text-[10px] font-semibold text-gray-600 dark:text-gray-400 truncate">{dayName}</div>
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
                          style={{ gridTemplateColumns: `minmax(180px, 200px) repeat(${daysInMonth}, minmax(0, 1fr))` }}
                        >
                          {/* Patient Name & Dates */}
                          <div
                            className="flex items-center gap-2 cursor-pointer p-2 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors sticky left-0 z-10"
                            onClick={() => router.push("/patients")}
                          >
                            <div
                              className={`w-7 h-7 sm:w-8 sm:h-8 ${getPatientColor(patientIndex)} rounded-full flex items-center justify-center text-white text-[10px] sm:text-xs font-bold flex-shrink-0 shadow-md`}
                            >
                              {patient.patient_name.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-[11px] sm:text-xs font-semibold text-gray-900 dark:text-gray-100 truncate">
                                {patient.patient_name}
                              </div>
                              <div className="text-[9px] sm:text-[10px] text-gray-500 dark:text-gray-400 truncate">
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
                              <div key={day} className="flex flex-col items-center justify-center p-0.5 sm:p-1 min-w-0">
                                <div className="text-[8px] sm:text-[10px] font-bold text-gray-700 dark:text-gray-300 mb-0.5 sm:mb-1">{day}</div>
                                <div className="h-5 sm:h-7 flex items-center justify-center w-full">
                                  {isPatientInDay && (
                                    <div
                                      className={`w-5 h-5 sm:w-6 sm:h-6 ${getPatientColor(patientIndex)} rounded-full shadow-sm hover:scale-110 transition-transform`}
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
                      <div className="text-center py-12">
                        <svg className="w-16 h-16 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">No patients in this month</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
