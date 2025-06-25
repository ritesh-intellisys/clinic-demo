import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  email: string;
  address: string;
  lastVisit: string;
  condition: string;
  avatar: string;
  emergencyContact?: string;
  bloodGroup?: string;
  allergies?: string[];
  createdAt?: string; // Add creation timestamp
}

export interface Prescription {
  id: string;
  patientName: string;
  doctorName: string;
  date: string;
  medications: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }[];
  notes: string;
  status: 'Active' | 'Completed' | 'Expired';
}

export interface Report {
  id: string;
  patientName: string;
  reportType: string;
  fileName: string;
  uploadDate: string;
  uploadedBy: string;
  fileSize: string;
  status: 'Pending' | 'Reviewed' | 'Archived';
  fileUri?: string;
}

export interface MedicineBill {
  id: string;
  patientName: string;
  medicines: {
    name: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  totalAmount: number;
  date: string;
  status: 'Paid' | 'Pending' | 'Overdue';
  pharmacyName: string;
}

export interface HospitalBill {
  id: string;
  patientName: string;
  services: {
    type: 'Consultation' | 'Radiology' | 'Laboratory' | 'Surgery' | 'Room Charges' | 'Other';
    description: string;
    amount: number;
  }[];
  doctorFees: number;
  totalAmount: number;
  date: string;
  status: 'Paid' | 'Pending' | 'Overdue';
  admissionDate?: string;
  dischargeDate?: string;
}

// Storage keys
const STORAGE_KEYS = {
  PATIENTS: 'patients',
  PRESCRIPTIONS: 'prescriptions',
  REPORTS: 'reports',
  MEDICINE_BILLS: 'medicine_bills',
  HOSPITAL_BILLS: 'hospital_bills',
};

// Generic storage functions
export const saveToStorage = async <T>(key: string, data: T[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key}:`, error);
    throw error;
  }
};

export const loadFromStorage = async <T>(key: string): Promise<T[]> => {
  try {
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Error loading ${key}:`, error);
    return [];
  }
};

// Patient storage functions
export const savePatients = (patients: Patient[]) => saveToStorage(STORAGE_KEYS.PATIENTS, patients);
export const loadPatients = () => loadFromStorage<Patient>(STORAGE_KEYS.PATIENTS);

// Prescription storage functions
export const savePrescriptions = (prescriptions: Prescription[]) => saveToStorage(STORAGE_KEYS.PRESCRIPTIONS, prescriptions);
export const loadPrescriptions = () => loadFromStorage<Prescription>(STORAGE_KEYS.PRESCRIPTIONS);

// Report storage functions
export const saveReports = (reports: Report[]) => saveToStorage(STORAGE_KEYS.REPORTS, reports);
export const loadReports = () => loadFromStorage<Report>(STORAGE_KEYS.REPORTS);

// Medicine bill storage functions
export const saveMedicineBills = (bills: MedicineBill[]) => saveToStorage(STORAGE_KEYS.MEDICINE_BILLS, bills);
export const loadMedicineBills = () => loadFromStorage<MedicineBill>(STORAGE_KEYS.MEDICINE_BILLS);

// Hospital bill storage functions
export const saveHospitalBills = (bills: HospitalBill[]) => saveToStorage(STORAGE_KEYS.HOSPITAL_BILLS, bills);
export const loadHospitalBills = () => loadFromStorage<HospitalBill>(STORAGE_KEYS.HOSPITAL_BILLS);

// Initialize with mock data if storage is empty
export const initializeStorage = async () => {
  const patients = await loadPatients();
  if (patients.length === 0) {
    const today = new Date().toISOString().split('T')[0];
    const mockPatients: Patient[] = [
      {
        id: '1',
        name: 'Rajesh Kumar',
        age: 45,
        gender: 'Male',
        phone: '+91 98765 43210',
        email: 'rajesh.kumar@email.com',
        address: '123 MG Road, Mumbai, Maharashtra',
        lastVisit: today, // Set to today to count as new registration
        condition: 'Hypertension',
        avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
        bloodGroup: 'B+',
        emergencyContact: '+91 87654 32109',
        allergies: ['Penicillin'],
        createdAt: today
      },
      {
        id: '2',
        name: 'Priya Sharma',
        age: 32,
        gender: 'Female',
        phone: '+91 87654 32109',
        email: 'priya.sharma@email.com',
        address: '456 Park Street, Delhi, India',
        lastVisit: '2024-01-12',
        condition: 'Diabetes',
        avatar: 'https://images.pexels.com/photos/3823488/pexels-photo-3823488.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
        bloodGroup: 'A+',
        emergencyContact: '+91 76543 21098',
        createdAt: '2024-01-12'
      },
      {
        id: '3',
        name: 'Amit Patel',
        age: 28,
        gender: 'Male',
        phone: '+91 76543 21098',
        email: 'amit.patel@email.com',
        address: '789 FC Road, Pune, Maharashtra',
        lastVisit: '2024-01-10',
        condition: 'Asthma',
        avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
        bloodGroup: 'O+',
        emergencyContact: '+91 98765 43210',
        allergies: ['Dust', 'Pollen'],
        createdAt: '2024-01-10'
      },
    ];
    await savePatients(mockPatients);
  }

  const prescriptions = await loadPrescriptions();
  if (prescriptions.length === 0) {
    const mockPrescriptions: Prescription[] = [
      {
        id: '1',
        patientName: 'Rajesh Kumar',
        doctorName: 'Dr. Rajesh Kumar',
        date: '2024-01-15',
        medications: [
          {
            name: 'Lisinopril',
            dosage: '10mg',
            frequency: 'Once daily',
            duration: '30 days'
          },
          {
            name: 'Metformin',
            dosage: '500mg',
            frequency: 'Twice daily',
            duration: '30 days'
          }
        ],
        notes: 'Take with food. Monitor blood pressure regularly.',
        status: 'Active'
      },
      {
        id: '2',
        patientName: 'Priya Sharma',
        doctorName: 'Dr. Rajesh Kumar',
        date: '2024-01-12',
        medications: [
          {
            name: 'Albuterol Inhaler',
            dosage: '90mcg',
            frequency: 'As needed',
            duration: '90 days'
          }
        ],
        notes: 'Use before exercise or when experiencing shortness of breath.',
        status: 'Active'
      },
    ];
    await savePrescriptions(mockPrescriptions);
  }

  const reports = await loadReports();
  if (reports.length === 0) {
    const mockReports: Report[] = [
      {
        id: '1',
        patientName: 'Rajesh Kumar',
        reportType: 'Blood Test',
        fileName: 'blood_test_rajesh_kumar.pdf',
        uploadDate: '2024-01-15',
        uploadedBy: 'Priya Sharma',
        fileSize: '2.3 MB',
        status: 'Pending' // Set to pending to count in dashboard
      },
      {
        id: '2',
        patientName: 'Priya Sharma',
        reportType: 'X-Ray',
        fileName: 'chest_xray_priya.jpg',
        uploadDate: '2024-01-12',
        uploadedBy: 'Priya Sharma',
        fileSize: '4.1 MB',
        status: 'Pending' // Set to pending to count in dashboard
      },
    ];
    await saveReports(mockReports);
  }

  const medicineBills = await loadMedicineBills();
  if (medicineBills.length === 0) {
    const mockMedicineBills: MedicineBill[] = [
      {
        id: '1',
        patientName: 'Rajesh Kumar',
        medicines: [
          { name: 'Lisinopril 10mg', quantity: 30, unitPrice: 125.50, total: 3765.00 },
          { name: 'Metformin 500mg', quantity: 60, unitPrice: 62.25, total: 3735.00 },
        ],
        totalAmount: 7500.00,
        date: '2024-01-15',
        status: 'Paid',
        pharmacyName: 'Apollo Pharmacy'
      },
    ];
    await saveMedicineBills(mockMedicineBills);
  }

  const hospitalBills = await loadHospitalBills();
  if (hospitalBills.length === 0) {
    const mockHospitalBills: HospitalBill[] = [
      {
        id: '1',
        patientName: 'Amit Patel',
        services: [
          { type: 'Consultation', description: 'General Consultation', amount: 750.00 },
          { type: 'Laboratory', description: 'Blood Test Panel', amount: 1000.00 },
          { type: 'Radiology', description: 'Chest X-Ray', amount: 600.00 },
        ],
        doctorFees: 750.00,
        totalAmount: 3100.00,
        date: '2024-01-10',
        status: 'Paid',
        admissionDate: '2024-01-10',
        dischargeDate: '2024-01-10'
      },
    ];
    await saveHospitalBills(mockHospitalBills);
  }
};