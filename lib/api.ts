import { API_CONFIG } from './config';

// Helper function to map document type to backend field name
function getFieldNameForDocType(docType: string): string {
  switch (docType) {
    case 'Bills':
      return 'bill_details';
    case 'Reports':
      return 'reports';
    case 'Doctor Certificate':
      return 'doctor_medical_certificate';
    case 'Discharge Note':
      return 'discharge_summary_pdf';
    default:
      return 'bill_details';
  }
}

// Generic API call function
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = API_CONFIG.getUrl(endpoint);
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true', // Skip ngrok warning page
  };

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    console.log('API Call to:', url);
    const response = await fetch(url, config);
    
    console.log('Response status:', response.status);
    const contentType = response.headers.get('content-type');
    console.log('Content-Type:', contentType);
    
    // Check if response is JSON
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Non-JSON response:', text.substring(0, 200));
      throw new Error(`Server returned HTML instead of JSON. Check if backend is running at ${url}`);
    }
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Call Error:', error);
    throw error;
  }
}

// Patient API functions
export const patientAPI = {
  // Get all patients
  getAll: async () => {
    return apiCall(API_CONFIG.ENDPOINTS.PATIENTS, {
      method: 'GET',
    });
  },

  // Get single patient
  getById: async (id: number | string) => {
    return apiCall(`${API_CONFIG.ENDPOINTS.PATIENTS}/${id}`, {
      method: 'GET',
    });
  },

  // Create new patient with FormData (supports file uploads)
  create: async (patientData: Record<string, unknown>, files?: Array<{ file: File; type: string }>) => {
    const url = API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.PATIENTS);
    
    // Create FormData
    const formData = new FormData();
    
    // Add patient data fields
    formData.append('patient_name', String(patientData.patient_name || ''));
    formData.append('patient_contact', String(patientData.patient_contact || ''));
    formData.append('patient_email', String(patientData.patient_email || ''));
    formData.append('emergency_name', String(patientData.emergency_name || ''));
    formData.append('emergency_email', String(patientData.emergency_email || ''));
    formData.append('emergency_contact', String(patientData.emergency_contact || ''));
    formData.append('admission_date', String(patientData.admission_date || ''));
    formData.append('discharge_date', String(patientData.discharge_date || ''));
    formData.append('medical_condition', String(patientData.medical_condition || ''));
    formData.append('assigned_doctor', String(patientData.assigned_doctor || ''));
    formData.append('age', String(patientData.age || ''));
    formData.append('gender', String(patientData.gender || ''));
    formData.append('doctor_notes', String(patientData.doctor_notes || ''));
    
    // Add files if provided
    if (files && files.length > 0) {
      files.forEach((fileObj) => {
        const fieldName = getFieldNameForDocType(fileObj.type);
        formData.append(fieldName, fileObj.file);
      });
    }
    
    // Send FormData (don't set Content-Type, browser will set it with boundary)
    try {
      console.log('Sending request to:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        headers: {
          'ngrok-skip-browser-warning': 'true', // Skip ngrok warning page
        },
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers.get('content-type'));
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text.substring(0, 200));
        throw new Error(`Server returned HTML instead of JSON. Check if backend is running at ${url}`);
      }
      
      if (!response.ok) {
        // Try to parse validation errors from backend
        const errorData = await response.json().catch(() => null);
        
        if (errorData?.detail && Array.isArray(errorData.detail)) {
          // Format validation errors
          const errors = errorData.detail.map((err: { loc: string[]; msg: string }) => {
            const field = err.loc[err.loc.length - 1];
            return `${field}: ${err.msg}`;
          }).join('\n');
          throw new Error(`Validation Error:\n${errors}`);
        }
        
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        console.error('API Error:', error.message);
        throw error;
      }
      throw new Error('Unknown error occurred');
    }
  },

  // Update patient
  update: async (id: number, patientData: Record<string, unknown>) => {
    return apiCall(`${API_CONFIG.ENDPOINTS.PATIENTS}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(patientData),
    });
  },

  // Delete patient
  delete: async (id: number) => {
    return apiCall(`${API_CONFIG.ENDPOINTS.PATIENTS}/${id}`, {
      method: 'DELETE',
    });
  },
};


