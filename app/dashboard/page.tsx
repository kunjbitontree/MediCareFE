"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Dashboard from "@/components/Dashboard";

export default function DashboardPage() {
  const router = useRouter();
  
  // Initialize state from localStorage to avoid effect setState
  const [authState] = useState<{
    isAuthenticated: boolean;
    userEmail: string;
    isLoading: boolean;
  }>(() => {
    if (typeof window !== "undefined") {
      const authStatus = localStorage.getItem("isAuthenticated");
      const email = localStorage.getItem("userEmail");
      
      if (authStatus === "true" && email) {
        return {
          isAuthenticated: true,
          userEmail: email,
          isLoading: false,
        };
      }
    }
    return {
      isAuthenticated: false,
      userEmail: "",
      isLoading: false,
    };
  });

  useEffect(() => {
    // Redirect if not authenticated
    if (!authState.isAuthenticated) {
      router.push("/login");
    }
  }, [authState.isAuthenticated, router]);

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userEmail");
    router.push("/login");
  };

  if (authState.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!authState.isAuthenticated) {
    return null;
  }

  return <Dashboard userEmail={authState.userEmail} onLogout={handleLogout} />;
}
