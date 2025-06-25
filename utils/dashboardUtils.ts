import AsyncStorage from '@react-native-async-storage/async-storage';
import { Patient, Report } from './storage';

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorName: string;
  date: string;
  time: string;
  type: 'Consultation' | 'Follow-up' | 'Emergency';
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  createdAt: string;
}

export interface DashboardStats {
  totalPatients: number;
  todayAppointments: number;
  pendingReports: number;
  newRegistrations: number;
}

// Storage keys
const APPOINTMENTS_KEY = 'appointments';

// Appointment storage functions
export const saveAppointments = async (appointments: Appointment[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appointments));
  } catch (error) {
    console.error('Error saving appointments:', error);
    throw error;
  }
};

export const loadAppointments = async (): Promise<Appointment[]> => {
  try {
    const data = await AsyncStorage.getItem(APPOINTMENTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading appointments:', error);
    return [];
  }
};

// Utility functions for dashboard calculations
export const getTodayDate = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const getTodayAppointments = (appointments: Appointment[]): number => {
  const today = getTodayDate();
  return appointments.filter(appointment => 
    appointment.date === today && appointment.status !== 'Cancelled'
  ).length;
};

export const getPendingReports = (reports: Report[]): number => {
  return reports.filter(report => 
    report.status.toLowerCase() === 'pending'
  ).length;
};

export const getNewRegistrations = (patients: Patient[]): number => {
  const today = getTodayDate();
  return patients.filter(patient => {
    // Check if patient was created today
    const patientDate = patient.lastVisit; // Using lastVisit as creation date for existing data
    return patientDate === today;
  }).length;
};

export const calculateDashboardStats = async (): Promise<DashboardStats> => {
  try {
    // Import storage functions
    const { loadPatients, loadReports } = await import('./storage');
    
    const [patients, reports, appointments] = await Promise.all([
      loadPatients(),
      loadReports(),
      loadAppointments()
    ]);

    return {
      totalPatients: patients.length,
      todayAppointments: getTodayAppointments(appointments),
      pendingReports: getPendingReports(reports),
      newRegistrations: getNewRegistrations(patients)
    };
  } catch (error) {
    console.error('Error calculating dashboard stats:', error);
    return {
      totalPatients: 0,
      todayAppointments: 0,
      pendingReports: 0,
      newRegistrations: 0
    };
  }
};

// Initialize appointments with mock data
export const initializeAppointments = async (): Promise<void> => {
  const appointments = await loadAppointments();
  if (appointments.length === 0) {
    const today = getTodayDate();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDate = tomorrow.toISOString().split('T')[0];

    const mockAppointments: Appointment[] = [
      {
        id: '1',
        patientId: '1',
        patientName: 'Rajesh Kumar',
        doctorName: 'Dr. Rajesh Kumar',
        date: today,
        time: '10:00 AM',
        type: 'Consultation',
        status: 'Scheduled',
        createdAt: today
      },
      {
        id: '2',
        patientId: '2',
        patientName: 'Priya Sharma',
        doctorName: 'Dr. Rajesh Kumar',
        date: today,
        time: '11:30 AM',
        type: 'Follow-up',
        status: 'Scheduled',
        createdAt: today
      },
      {
        id: '3',
        patientId: '3',
        patientName: 'Amit Patel',
        doctorName: 'Dr. Rajesh Kumar',
        date: tomorrowDate,
        time: '09:00 AM',
        type: 'Consultation',
        status: 'Scheduled',
        createdAt: today
      }
    ];
    
    await saveAppointments(mockAppointments);
  }
};