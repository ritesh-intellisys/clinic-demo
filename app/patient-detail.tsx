import Header from '@/components/ui/Header';
import { generatePatientPDF, sharePDF } from '@/utils/pdfGenerator';
import {
  HospitalBill,
  loadHospitalBills,
  loadMedicineBills,
  loadPatients,
  loadPrescriptions,
  loadReports,
  MedicineBill,
  Patient,
  Prescription,
  Report,
} from '@/utils/storage';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface PatientDetailData {
  patient: Patient;
  prescriptions: Prescription[];
  reports: Report[];
  medicineBills: MedicineBill[];
  hospitalBills: HospitalBill[];
}

export default function PatientDetailScreen() {
  const { patientId } = useLocalSearchParams<{ patientId: string }>();
  const router = useRouter();
  const [data, setData] = useState<PatientDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  useEffect(() => {
    if (patientId) {
      loadPatientDetail();
    }
  }, [patientId]);

  const loadPatientDetail = async () => {
    try {
      setLoading(true);
      const [patients, prescriptions, reports, medicineBills, hospitalBills] = await Promise.all([
        loadPatients(),
        loadPrescriptions(),
        loadReports(),
        loadMedicineBills(),
        loadHospitalBills(),
      ]);

      const patient = patients.find(p => p.id === patientId);
      if (!patient) {
        Alert.alert('Error', 'Patient not found');
        router.back();
        return;
      }

      const patientPrescriptions = prescriptions.filter(p => p.patientName === patient.name);
      const patientReports = reports.filter(r => r.patientName === patient.name);
      const patientMedicineBills = medicineBills.filter(b => b.patientName === patient.name);
      const patientHospitalBills = hospitalBills.filter(b => b.patientName === patient.name);

      setData({
        patient,
        prescriptions: patientPrescriptions,
        reports: patientReports,
        medicineBills: patientMedicineBills,
        hospitalBills: patientHospitalBills,
      });
    } catch (error) {
      console.error('Error loading patient detail:', error);
      Alert.alert('Error', 'Failed to load patient details');
    } finally {
      setLoading(false);
    }
  };

  const handleCall = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleEmail = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  const handleExportPDF = async (type: 'full' | 'current' | 'visit') => {
    if (!data) return;

    try {
      setExporting(true);
      setShowExportModal(false);

      const pdfUri = await generatePatientPDF(data, type);
      await sharePDF(pdfUri);

      Alert.alert(
        'Success',
        `Patient ${type} report has been generated and shared successfully!`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error exporting PDF:', error);
      Alert.alert('Error', 'Failed to generate PDF. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const ExportModal = () => (
    <Modal
      visible={showExportModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowExportModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Export Patient Report</Text>
            <TouchableOpacity onPress={() => setShowExportModal(false)}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.exportOptions}>
            <TouchableOpacity
              style={styles.exportOption}
              onPress={() => handleExportPDF('full')}
              disabled={exporting}
            >
              <Ionicons name="document-text" size={24} color="#3B82F6" />
              <View style={styles.exportOptionContent}>
                <Text style={styles.exportOptionTitle}>Full Medical Report</Text>
                <Text style={styles.exportOptionDescription}>
                  Complete patient history including all prescriptions, reports, and billing
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.exportOption}
              onPress={() => handleExportPDF('current')}
              disabled={exporting}
            >
              <Ionicons name="medical" size={24} color="#10B981" />
              <View style={styles.exportOptionContent}>
                <Text style={styles.exportOptionTitle}>Current Treatment</Text>
                <Text style={styles.exportOptionDescription}>
                  Active prescriptions and recent medical reports
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.exportOption}
              onPress={() => handleExportPDF('visit')}
              disabled={exporting}
            >
              <Ionicons name="calendar" size={24} color="#F59E0B" />
              <View style={styles.exportOptionContent}>
                <Text style={styles.exportOptionTitle}>Visit Summary</Text>
                <Text style={styles.exportOptionDescription}>
                  Current visit details and billing information
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {exporting && (
            <View style={styles.exportingContainer}>
              <ActivityIndicator size="small" color="#3B82F6" />
              <Text style={styles.exportingText}>Generating PDF...</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading patient details...</Text>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Patient not found</Text>
      </View>
    );
  }

  const { patient, prescriptions, reports, medicineBills, hospitalBills } = data;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Header 
          title={patient.name} 
          subtitle="Patient Details" 
        />
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.overviewContainer}>
          <View style={styles.patientCard}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>
                {patient.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </Text>
            </View>
            <View style={styles.patientInfo}>
              <Text style={styles.patientName}>{patient.name}</Text>
              <Text style={styles.patientDetails}>
                {patient.age} years • {patient.gender} • {patient.bloodGroup || 'N/A'}
              </Text>
              <Text style={styles.patientCondition}>{patient.condition}</Text>
            </View>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Contact Information</Text>
            <TouchableOpacity style={styles.infoRow} onPress={() => handleCall(patient.phone)}>
              <Ionicons name="call" size={20} color="#3B82F6" />
              <Text style={styles.infoText}>{patient.phone}</Text>
              <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.infoRow} onPress={() => handleEmail(patient.email)}>
              <Ionicons name="mail" size={20} color="#3B82F6" />
              <Text style={styles.infoText}>{patient.email}</Text>
              <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
            </TouchableOpacity>
            <View style={styles.infoRow}>
              <Ionicons name="location" size={20} color="#6B7280" />
              <Text style={styles.infoText}>{patient.address}</Text>
            </View>
            {patient.emergencyContact && (
              <TouchableOpacity style={styles.infoRow} onPress={() => handleCall(patient.emergencyContact!)}>
                <Ionicons name="warning" size={20} color="#EF4444" />
                <Text style={styles.infoText}>Emergency: {patient.emergencyContact}</Text>
                <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Medical Information</Text>
            <View style={styles.infoRow}>
              <Ionicons name="medical" size={20} color="#6B7280" />
              <Text style={styles.infoText}>Blood Group: {patient.bloodGroup || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="alert-circle" size={20} color="#6B7280" />
              <Text style={styles.infoText}>
                Allergies: {patient.allergies?.length ? patient.allergies.join(', ') : 'None'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="calendar" size={20} color="#6B7280" />
              <Text style={styles.infoText}>
                Last Visit: {new Date(patient.lastVisit).toLocaleDateString()}
              </Text>
            </View>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Ionicons name="medical" size={24} color="#3B82F6" />
              <Text style={styles.statNumber}>{prescriptions.length}</Text>
              <Text style={styles.statLabel}>Prescriptions</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="document-text" size={24} color="#10B981" />
              <Text style={styles.statNumber}>{reports.length}</Text>
              <Text style={styles.statLabel}>Reports</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="card" size={24} color="#F59E0B" />
              <Text style={styles.statNumber}>{medicineBills.length + hospitalBills.length}</Text>
              <Text style={styles.statLabel}>Bills</Text>
            </View>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Recent Prescriptions</Text>
            {prescriptions.length > 0 ? (
              prescriptions.slice(0, 3).map((prescription, index) => (
                <View key={index} style={styles.prescriptionCard}>
                  <View style={styles.prescriptionHeader}>
                    <Text style={styles.prescriptionDate}>
                      {new Date(prescription.date).toLocaleDateString()}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: prescription.status === 'Active' ? '#10B981' : '#6B7280' }]}>
                      <Text style={styles.statusText}>{prescription.status}</Text>
                    </View>
                  </View>
                  <Text style={styles.doctorName}>{prescription.doctorName}</Text>
                  <Text style={styles.notes}>{prescription.notes}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No prescriptions found</Text>
            )}
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Recent Bills</Text>
            {medicineBills.length > 0 || hospitalBills.length > 0 ? (
              <View>
                {medicineBills.slice(0, 2).map((bill, index) => (
                  <View key={index} style={styles.billCard}>
                    <Text style={styles.billDate}>{new Date(bill.date).toLocaleDateString()}</Text>
                    <Text style={styles.billAmount}>₹{bill.totalAmount}</Text>
                    <Text style={styles.billStatus}>{bill.status}</Text>
                  </View>
                ))}
                {hospitalBills.slice(0, 2).map((bill, index) => (
                  <View key={index} style={styles.billCard}>
                    <Text style={styles.billDate}>{new Date(bill.date).toLocaleDateString()}</Text>
                    <Text style={styles.billAmount}>₹{bill.totalAmount}</Text>
                    <Text style={styles.billStatus}>{bill.status}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.emptyText}>No bills found</Text>
            )}
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowExportModal(true)}
        disabled={exporting}
      >
        <Ionicons name="download" size={24} color="white" />
      </TouchableOpacity>

      <ExportModal />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    fontFamily: 'Roboto-Regular',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    fontFamily: 'Roboto-Regular',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  overviewContainer: {
    gap: 20,
  },
  patientCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    fontFamily: 'Roboto-Bold',
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
    fontFamily: 'Roboto-Bold',
  },
  patientDetails: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
    fontFamily: 'Roboto-Regular',
  },
  patientCondition: {
    fontSize: 14,
    color: '#3B82F6',
    fontFamily: 'Roboto-Medium',
  },
  infoSection: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
    fontFamily: 'Roboto-Bold',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoText: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    marginLeft: 12,
    fontFamily: 'Roboto-Regular',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 8,
    fontFamily: 'Roboto-Bold',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    fontFamily: 'Roboto-Regular',
  },
  prescriptionCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  prescriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  prescriptionDate: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
    fontFamily: 'Roboto-Bold',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: 'white',
    fontWeight: 'bold',
    fontFamily: 'Roboto-Bold',
  },
  doctorName: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    fontFamily: 'Roboto-Medium',
  },
  notes: {
    fontSize: 14,
    color: '#374151',
    fontFamily: 'Roboto-Regular',
  },
  billCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  billDate: {
    fontSize: 14,
    color: '#1F2937',
    fontFamily: 'Roboto-Medium',
  },
  billAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    fontFamily: 'Roboto-Bold',
  },
  billStatus: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Roboto-Regular',
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
    fontFamily: 'Roboto-Regular',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    margin: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    fontFamily: 'Roboto-Bold',
  },
  exportOptions: {
    gap: 16,
  },
  exportOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  exportOptionContent: {
    flex: 1,
    marginLeft: 12,
  },
  exportOptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
    fontFamily: 'Roboto-Bold',
  },
  exportOptionDescription: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Roboto-Regular',
  },
  exportingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    padding: 16,
    backgroundColor: '#F0F9FF',
    borderRadius: 8,
  },
  exportingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#3B82F6',
    fontFamily: 'Roboto-Medium',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 12,
    paddingRight: 0,
  },
}); 