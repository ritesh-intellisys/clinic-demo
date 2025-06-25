import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Appointment, loadAppointments, saveAppointments } from '@/utils/dashboardUtils';
import { Patient, loadPatients } from '@/utils/storage';
import { Calendar, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface ScheduleAppointmentModalProps {
  visible: boolean;
  onClose: () => void;
  onAppointmentScheduled: () => void;
}

type AppointmentFormData = {
  patientId: string;
  patientName: string;
  doctorName: string;
  date: string;
  time: string;
  type: 'Consultation' | 'Follow-up' | 'Emergency';
};

export default function ScheduleAppointmentModal({ 
  visible, 
  onClose, 
  onAppointmentScheduled 
}: ScheduleAppointmentModalProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [formData, setFormData] = useState<AppointmentFormData>({
    patientId: '',
    patientName: '',
    doctorName: 'Dr. Rajesh Kumar',
    date: '',
    time: '',
    type: 'Consultation',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);

  useEffect(() => {
    if (visible) {
      loadPatientsData();
      // Set default date to today
      const today = new Date().toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, date: today }));
    }
  }, [visible]);

  const loadPatientsData = async () => {
    try {
      const patientsData = await loadPatients();
      setPatients(patientsData);
    } catch (error) {
      console.error('Error loading patients:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      patientId: '',
      patientName: '',
      doctorName: 'Dr. Rajesh Kumar',
      date: '',
      time: '',
      type: 'Consultation',
    });
    setShowPatientDropdown(false);
  };

  const validateForm = (): boolean => {
    if (!formData.patientId) {
      Alert.alert('Error', 'Please select a patient');
      return false;
    }
    if (!formData.date) {
      Alert.alert('Error', 'Please select a date');
      return false;
    }
    if (!formData.time) {
      Alert.alert('Error', 'Please select a time');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const appointments = await loadAppointments();
      
      const newAppointment: Appointment = {
        id: Date.now().toString(),
        patientId: formData.patientId,
        patientName: formData.patientName,
        doctorName: formData.doctorName,
        date: formData.date,
        time: formData.time,
        type: formData.type,
        status: 'Scheduled',
        createdAt: new Date().toISOString().split('T')[0]
      };

      const updatedAppointments = [...appointments, newAppointment];
      await saveAppointments(updatedAppointments);
      
      Alert.alert('Success', 'Appointment scheduled successfully');
      resetForm();
      onAppointmentScheduled();
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to schedule appointment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePatientSelect = (patient: Patient) => {
    setFormData({
      ...formData,
      patientId: patient.id,
      patientName: patient.name
    });
    setShowPatientDropdown(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const timeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '12:00 PM', '12:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
    '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM'
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Schedule Appointment</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <X size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Patient Selection */}
<View style={styles.fieldContainer}>
    <Text style={styles.label}>Patient *</Text>
    <TouchableOpacity
        style={styles.dropdown}
        onPress={() => setShowPatientDropdown(!showPatientDropdown)}
    >
        <Text style={[styles.dropdownText, !formData.patientName && styles.placeholder]}>
            {formData.patientName || 'Select a patient'}
        </Text>
    </TouchableOpacity>
    
    {showPatientDropdown && (
        <View style={styles.dropdownList}>
            <ScrollView style={styles.patientList} nestedScrollEnabled>
                {patients.map((patient) => (
                    <TouchableOpacity
                        key={patient.id}
                        style={styles.patientItem}
                        onPress={() => handlePatientSelect(patient)}
                    >
                        <Text style={styles.patientName}>{patient.name}</Text>
                        <Text style={styles.patientInfo}>{patient.phone} • {patient.condition}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    )}
</View>

          {/* Doctor Selection */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Doctor</Text>
            <Input
              placeholder="Doctor Name"
              value={formData.doctorName}
              onChangeText={(text) => setFormData({ ...formData, doctorName: text })}
            />
          </View>

          {/* Appointment Type */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Appointment Type</Text>
            <View style={styles.typeOptions}>
              {(['Consultation', 'Follow-up', 'Emergency'] as const).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeOption,
                    formData.type === type && styles.selectedType
                  ]}
                  onPress={() => setFormData({ ...formData, type })}
                >
                  <Text style={[
                    styles.typeText,
                    formData.type === type && styles.selectedTypeText
                  ]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Date Selection */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Date *</Text>
            <View style={styles.dateInput}>
              <Calendar size={20} color="#666" />
              <Input
                placeholder="YYYY-MM-DD"
                value={formData.date}
                onChangeText={(text) => setFormData({ ...formData, date: text })}
                style={styles.dateInputField}
              />
            </View>
          </View>

          {/* Time Selection */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Time *</Text>
            <View style={styles.timeGrid}>
              {timeSlots.map((time) => (
                <TouchableOpacity
                  key={time}
                  style={[
                    styles.timeSlot,
                    formData.time === time && styles.selectedTime
                  ]}
                  onPress={() => setFormData({ ...formData, time })}
                >
                  <Text style={[
                    styles.timeText,
                    formData.time === time && styles.selectedTimeText
                  ]}>
                    {time}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Button
            title={isSubmitting ? "Scheduling..." : "Schedule Appointment"}
            onPress={handleSubmit}
            disabled={isSubmitting}
            style={styles.submitButton}
          />
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontFamily: 'Roboto-Bold',
    color: '#1a1a1a',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Roboto-Medium',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    minHeight: 52,
    justifyContent: 'center',
  },
  dropdownText: {
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
    color: '#1a1a1a',
  },
  placeholder: {
    color: '#999',
  },
  dropdownList: {
    position: 'relative', // Changed from 'absolute'
    marginTop: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    maxHeight: 200,
    zIndex: 1000,
    elevation: 5, // For Android
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
},
  patientList: {
    maxHeight: 180,
  },
  patientItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  patientName: {
    fontSize: 16,
    fontFamily: 'Roboto-Medium',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  patientInfo: {
    fontSize: 12,
    fontFamily: 'Roboto-Regular',
    color: '#666',
  },
  typeOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  typeOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  selectedType: {
    backgroundColor: '#1976D2',
    borderColor: '#1976D2',
  },
  typeText: {
    fontSize: 14,
    fontFamily: 'Roboto-Medium',
    color: '#666',
  },
  selectedTypeText: {
    color: '#fff',
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  dateInputField: {
    flex: 1,
    marginLeft: 12,
    marginBottom: 0,
    borderWidth: 0,
    padding: 0,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  timeSlot: {
    width: '30%',
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  selectedTime: {
    backgroundColor: '#1976D2',
    borderColor: '#1976D2',
  },
  timeText: {
    fontSize: 12,
    fontFamily: 'Roboto-Medium',
    color: '#666',
  },
  selectedTimeText: {
    color: '#fff',
  },
  submitButton: {
    marginTop: 20,
    marginBottom: 40,
  },
});