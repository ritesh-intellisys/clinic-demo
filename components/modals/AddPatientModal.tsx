import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { loadPatients, Patient, savePatients } from '@/utils/storage';
import { X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface AddPatientModalProps {
  visible: boolean;
  onClose: () => void;
  onPatientAdded: () => void;
}

type PatientFormData = {
  name: string;
  age: string;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  email: string;
  address: string;
  condition: string;
  bloodGroup: string;
  emergencyContact: string;
  allergies: string;
};

export default function AddPatientModal({ visible, onClose, onPatientAdded }: AddPatientModalProps) {
  const [formData, setFormData] = useState<PatientFormData>({
    name: '',
    age: '',
    gender: 'Male',
    phone: '',
    email: '',
    address: '',
    condition: '',
    bloodGroup: '',
    emergencyContact: '',
    allergies: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setFormData({
      name: '',
      age: '',
      gender: 'Male',
      phone: '',
      email: '',
      address: '',
      condition: '',
      bloodGroup: '',
      emergencyContact: '',
      allergies: '',
    });
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Patient name is required');
      return false;
    }
    if (!formData.age || parseInt(formData.age) <= 0) {
      Alert.alert('Error', 'Please enter a valid age');
      return false;
    }
    if (!formData.phone.trim()) {
      Alert.alert('Error', 'Phone number is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const patients = await loadPatients();
      
      const newPatient: Patient = {
        id: Date.now().toString(),
        name: formData.name.trim(),
        age: parseInt(formData.age),
        gender: formData.gender,
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        address: formData.address.trim(),
        condition: formData.condition.trim() || 'General',
        lastVisit: new Date().toISOString().split('T')[0],
        avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
        bloodGroup: formData.bloodGroup.trim(),
        emergencyContact: formData.emergencyContact.trim(),
        allergies: formData.allergies.trim() 
          ? formData.allergies.split(',').map(a => a.trim()).filter(a => a !== '')
          : []
      };

      const updatedPatients = [...patients, newPatient];
      await savePatients(updatedPatients);
      
      Alert.alert('Success', 'Patient added successfully');
      resetForm();
      onPatientAdded();
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to add patient. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Add New Patient</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <X size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Input
            placeholder="Full Name *"
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
          />

          <Input
            placeholder="Age *"
            value={formData.age}
            onChangeText={(text) => setFormData({ ...formData, age: text })}
            keyboardType="numeric"
          />

          <View style={styles.genderContainer}>
            <Text style={styles.label}>Gender</Text>
            <View style={styles.genderOptions}>
              {(['Male', 'Female', 'Other'] as const).map((gender) => (
                <TouchableOpacity
                  key={gender}
                  style={[
                    styles.genderOption,
                    formData.gender === gender && styles.selectedGender
                  ]}
                  onPress={() => setFormData({ ...formData, gender })}
                >
                  <Text style={[
                    styles.genderText,
                    formData.gender === gender && styles.selectedGenderText
                  ]}>
                    {gender}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Input
            placeholder="Phone Number *"
            value={formData.phone}
            onChangeText={(text) => setFormData({ ...formData, phone: text })}
            keyboardType="phone-pad"
          />

          <Input
            placeholder="Email Address"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            keyboardType="email-address"
          />

          <Input
            placeholder="Address"
            value={formData.address}
            onChangeText={(text) => setFormData({ ...formData, address: text })}
            multiline
            numberOfLines={3}
          />

          <Input
            placeholder="Medical Condition"
            value={formData.condition}
            onChangeText={(text) => setFormData({ ...formData, condition: text })}
          />

          <Input
            placeholder="Blood Group (e.g., A+, B-, O+)"
            value={formData.bloodGroup}
            onChangeText={(text) => setFormData({ ...formData, bloodGroup: text })}
          />

          <Input
            placeholder="Emergency Contact"
            value={formData.emergencyContact}
            onChangeText={(text) => setFormData({ ...formData, emergencyContact: text })}
            keyboardType="phone-pad"
          />

          <Input
            placeholder="Allergies (comma separated)"
            value={formData.allergies}
            onChangeText={(text) => setFormData({ ...formData, allergies: text })}
            multiline
            numberOfLines={2}
          />

          <Button
            title={isSubmitting ? "Adding Patient..." : "Add Patient"}
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
  label: {
    fontSize: 16,
    fontFamily: 'Roboto-Medium',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  genderContainer: {
    marginBottom: 16,
  },
  genderOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  genderOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  selectedGender: {
    backgroundColor: '#1976D2',
    borderColor: '#1976D2',
  },
  genderText: {
    fontSize: 14,
    fontFamily: 'Roboto-Medium',
    color: '#666',
  },
  selectedGenderText: {
    color: '#fff',
  },
  submitButton: {
    marginTop: 20,
    marginBottom: 40,
  },
});