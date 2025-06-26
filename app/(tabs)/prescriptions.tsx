import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Header from '@/components/ui/Header';
import Input from '@/components/ui/Input';
import { useAuth } from '@/contexts/AuthContext';
import { Prescription } from '@/utils/storage';
import {
  Calendar,
  Clock,
  Eye,
  FileText,
  Pill,
  Plus,
  User
} from 'lucide-react-native';
import { useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const mockPrescriptions: Prescription[] = [
  {
    id: '1',
    patientName: 'Rakesh ',
    doctorName: 'Dr. Manish',
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
    patientName: 'Ritesh Jawale',
    doctorName: 'Dr. Manish',
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
  {
    id: '3',
    patientName: 'Rahul Shinde',
    doctorName: 'Dr. Manish',
    date: '2024-01-08',
    medications: [
      {
        name: 'Amoxicillin',
        dosage: '500mg',
        frequency: 'Three times daily',
        duration: '7 days'
      }
    ],
    notes: 'Complete full course even if feeling better.',
    status: 'Completed'
  },
];

export default function PrescriptionsScreen() {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(mockPrescriptions);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newPrescription, setNewPrescription] = useState({
    patientName: '',
    medications: [{ name: '', dosage: '', frequency: '', duration: '' }],
    notes: '',
  });

  const filteredPrescriptions = user?.role === 'patient' 
    ? prescriptions.filter(p => p.patientName === user.name)
    : prescriptions;

  const handleAddMedication = () => {
    setNewPrescription({
      ...newPrescription,
      medications: [...newPrescription.medications, { name: '', dosage: '', frequency: '', duration: '' }]
    });
  };

  const handleRemoveMedication = (index: number) => {
    const updatedMedications = newPrescription.medications.filter((_, i) => i !== index);
    setNewPrescription({ ...newPrescription, medications: updatedMedications });
  };

  const handleMedicationChange = (index: number, field: string, value: string) => {
    const updatedMedications = [...newPrescription.medications];
    updatedMedications[index] = { ...updatedMedications[index], [field]: value };
    setNewPrescription({ ...newPrescription, medications: updatedMedications });
  };

  const handleCreatePrescription = () => {
    if (!newPrescription.patientName || newPrescription.medications.some(m => !m.name)) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const prescription: Prescription = {
      id: Date.now().toString(),
      patientName: newPrescription.patientName,
      doctorName: user?.name || 'Dr. Unknown',
      date: new Date().toISOString().split('T')[0],
      medications: newPrescription.medications,
      notes: newPrescription.notes,
      status: 'Active'
    };

    setPrescriptions([prescription, ...prescriptions]);
    setNewPrescription({
      patientName: '',
      medications: [{ name: '', dosage: '', frequency: '', duration: '' }],
      notes: '',
    });
    setShowNewModal(false);
    Alert.alert('Success', 'Prescription created successfully');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return '#2E7D32';
      case 'Completed': return '#1976D2';
      case 'Expired': return '#D32F2F';
      default: return '#666';
    }
  };

  const canCreatePrescription = user?.role === 'doctor';

  return (
    <View style={styles.container}>
      <Header 
        title="Prescriptions" 
        subtitle={`${filteredPrescriptions.length} prescriptions`}
        rightComponent={
          canCreatePrescription ? (
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setShowNewModal(true)}
            >
              <Plus size={20} color="#fff" />
            </TouchableOpacity>
          ) : null
        }
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filteredPrescriptions.map((prescription) => (
          <Card key={prescription.id} style={styles.prescriptionCard}>
            <View style={styles.prescriptionHeader}>
              <View style={styles.prescriptionInfo}>
                <Text style={styles.patientName}>
                  {user?.role === 'patient' ? prescription.doctorName : prescription.patientName}
                </Text>
                <View style={styles.prescriptionMeta}>
                  <Calendar size={14} color="#666" />
                  <Text style={styles.metaText}>{prescription.date}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(prescription.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(prescription.status) }]}>
                      {prescription.status}
                    </Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.viewButton}
                onPress={() => setSelectedPrescription(prescription)}
              >
                <Eye size={18} color="#1976D2" />
              </TouchableOpacity>
            </View>

            <View style={styles.medicationsPreview}>
              <Text style={styles.medicationsTitle}>Medications ({prescription.medications.length})</Text>
              {prescription.medications.slice(0, 2).map((med, index) => (
                <View key={index} style={styles.medicationItem}>
                  <Pill size={16} color="#1976D2" />
                  <Text style={styles.medicationName}>{med.name}</Text>
                  <Text style={styles.medicationDosage}>{med.dosage}</Text>
                </View>
              ))}
              {prescription.medications.length > 2 && (
                <Text style={styles.moreText}>+{prescription.medications.length - 2} more</Text>
              )}
            </View>
          </Card>
        ))}
      </ScrollView>

      {/* New Prescription Modal */}
      <Modal
        visible={showNewModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>New Prescription</Text>
            <TouchableOpacity onPress={() => setShowNewModal(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <Input
              placeholder="Patient Name *"
              value={newPrescription.patientName}
              onChangeText={(text) => setNewPrescription({...newPrescription, patientName: text})}
            />

            <Text style={styles.sectionTitle}>Medications</Text>
            {newPrescription.medications.map((medication, index) => (
              <Card key={index} style={styles.medicationCard}>
                <View style={styles.medicationHeader}>
                  <Text style={styles.medicationIndex}>Medication {index + 1}</Text>
                  {newPrescription.medications.length > 1 && (
                    <TouchableOpacity onPress={() => handleRemoveMedication(index)}>
                      <Text style={styles.removeButton}>Remove</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <Input
                  placeholder="Medication Name *"
                  value={medication.name}
                  onChangeText={(text) => handleMedicationChange(index, 'name', text)}
                />
                <Input
                  placeholder="Dosage (e.g., 10mg)"
                  value={medication.dosage}
                  onChangeText={(text) => handleMedicationChange(index, 'dosage', text)}
                />
                <Input
                  placeholder="Frequency (e.g., Twice daily)"
                  value={medication.frequency}
                  onChangeText={(text) => handleMedicationChange(index, 'frequency', text)}
                />
                <Input
                  placeholder="Duration (e.g., 30 days)"
                  value={medication.duration}
                  onChangeText={(text) => handleMedicationChange(index, 'duration', text)}
                />
              </Card>
            ))}

            <TouchableOpacity style={styles.addMedicationButton} onPress={handleAddMedication}>
              <Plus size={20} color="#1976D2" />
              <Text style={styles.addMedicationText}>Add Another Medication</Text>
            </TouchableOpacity>

            <Input
              placeholder="Notes (optional)"
              value={newPrescription.notes}
              onChangeText={(text) => setNewPrescription({...newPrescription, notes: text})}
              multiline
              numberOfLines={3}
            />
            
            <Button
              title="Create Prescription"
              onPress={handleCreatePrescription}
              style={styles.createButton}
            />
          </ScrollView>
        </View>
      </Modal>

      {/* Prescription Details Modal */}
      <Modal
        visible={!!selectedPrescription}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        {selectedPrescription && (
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Prescription Details</Text>
              <TouchableOpacity onPress={() => setSelectedPrescription(null)}>
                <Text style={styles.cancelButton}>Close</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent}>
              <Card style={styles.detailsCard}>
                <View style={styles.detailRow}>
                  <User size={20} color="#666" />
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>
                      {user?.role === 'patient' ? 'Doctor' : 'Patient'}
                    </Text>
                    <Text style={styles.detailValue}>
                      {user?.role === 'patient' ? selectedPrescription.doctorName : selectedPrescription.patientName}
                    </Text>
                  </View>
                </View>
                <View style={styles.detailRow}>
                  <Calendar size={20} color="#666" />
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Date Prescribed</Text>
                    <Text style={styles.detailValue}>{selectedPrescription.date}</Text>
                  </View>
                </View>
                <View style={styles.detailRow}>
                  <Clock size={20} color="#666" />
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Status</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedPrescription.status) + '20' }]}>
                      <Text style={[styles.statusText, { color: getStatusColor(selectedPrescription.status) }]}>
                        {selectedPrescription.status}
                      </Text>
                    </View>
                  </View>
                </View>
              </Card>

              <Text style={styles.sectionTitle}>Medications</Text>
              {selectedPrescription.medications.map((medication, index) => (
                <Card key={index} style={styles.medicationDetailCard}>
                  <View style={styles.medicationDetailHeader}>
                    <Pill size={20} color="#1976D2" />
                    <Text style={styles.medicationDetailName}>{medication.name}</Text>
                  </View>
                  <View style={styles.medicationDetails}>
                    <View style={styles.medicationDetailRow}>
                      <Text style={styles.medicationDetailLabel}>Dosage:</Text>
                      <Text style={styles.medicationDetailValue}>{medication.dosage}</Text>
                    </View>
                    <View style={styles.medicationDetailRow}>
                      <Text style={styles.medicationDetailLabel}>Frequency:</Text>
                      <Text style={styles.medicationDetailValue}>{medication.frequency}</Text>
                    </View>
                    <View style={styles.medicationDetailRow}>
                      <Text style={styles.medicationDetailLabel}>Duration:</Text>
                      <Text style={styles.medicationDetailValue}>{medication.duration}</Text>
                    </View>
                  </View>
                </Card>
              ))}

              {selectedPrescription.notes && (
                <Card style={styles.notesCard}>
                  <View style={styles.notesHeader}>
                    <FileText size={20} color="#666" />
                    <Text style={styles.notesTitle}>Notes</Text>
                  </View>
                  <Text style={styles.notesText}>{selectedPrescription.notes}</Text>
                </Card>
              )}
            </ScrollView>
          </View>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  addButton: {
    backgroundColor: '#1976D2',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  prescriptionCard: {
    marginBottom: 12,
    padding: 16,
  },
  prescriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  prescriptionInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  prescriptionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    fontFamily: 'Roboto-Regular',
    color: '#666',
    marginLeft: 6,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontFamily: 'Roboto-Medium',
  },
  viewButton: {
    padding: 8,
  },
  medicationsPreview: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  medicationsTitle: {
    fontSize: 14,
    fontFamily: 'Roboto-Medium',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  medicationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  medicationName: {
    fontSize: 12,
    fontFamily: 'Roboto-Regular',
    color: '#1a1a1a',
    marginLeft: 8,
    flex: 1,
  },
  medicationDosage: {
    fontSize: 12,
    fontFamily: 'Roboto-Regular',
    color: '#666',
  },
  moreText: {
    fontSize: 12,
    fontFamily: 'Roboto-Regular',
    color: '#1976D2',
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Roboto-Bold',
    color: '#1a1a1a',
  },
  cancelButton: {
    fontSize: 16,
    fontFamily: 'Roboto-Medium',
    color: '#1976D2',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
    color: '#1a1a1a',
    marginBottom: 12,
    marginTop: 8,
  },
  medicationCard: {
    marginBottom: 16,
    backgroundColor: '#f8f9fa',
  },
  medicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  medicationIndex: {
    fontSize: 14,
    fontFamily: 'Roboto-Medium',
    color: '#1976D2',
  },
  removeButton: {
    fontSize: 14,
    fontFamily: 'Roboto-Medium',
    color: '#D32F2F',
  },
  addMedicationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: '#1976D2',
    borderStyle: 'dashed',
    borderRadius: 12,
    marginBottom: 16,
  },
  addMedicationText: {
    fontSize: 14,
    fontFamily: 'Roboto-Medium',
    color: '#1976D2',
    marginLeft: 8,
  },
  createButton: {
    marginTop: 24,
    marginBottom: 32,
  },
  detailsCard: {
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailContent: {
    marginLeft: 16,
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    fontFamily: 'Roboto-Regular',
    color: '#666',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontFamily: 'Roboto-Medium',
    color: '#1a1a1a',
  },
  medicationDetailCard: {
    marginBottom: 12,
    backgroundColor: '#f8f9fa',
  },
  medicationDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  medicationDetailName: {
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
    color: '#1a1a1a',
    marginLeft: 12,
  },
  medicationDetails: {
    paddingLeft: 32,
  },
  medicationDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  medicationDetailLabel: {
    fontSize: 12,
    fontFamily: 'Roboto-Regular',
    color: '#666',
  },
  medicationDetailValue: {
    fontSize: 12,
    fontFamily: 'Roboto-Medium',
    color: '#1a1a1a',
  },
  notesCard: {
    marginBottom: 32,
    backgroundColor: '#E3F2FD',
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  notesTitle: {
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
    color: '#1976D2',
    marginLeft: 12,
  },
  notesText: {
    fontSize: 14,
    fontFamily: 'Roboto-Regular',
    color: '#1a1a1a',
    lineHeight: 20,
  },
});