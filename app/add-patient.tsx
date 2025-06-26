import Button from '@/components/ui/Button';
import Header from '@/components/ui/Header';
import Input from '@/components/ui/Input';
import { loadPatients, Patient, savePatients } from '@/utils/storage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

// Form data type
const initialFormData = {
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
};

type PatientFormData = typeof initialFormData;

export default function AddPatientScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState<PatientFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => setFormData(initialFormData);

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
        gender: formData.gender as 'Male' | 'Female' | 'Other',
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
          : [],
      };
      const updatedPatients = [...patients, newPatient];
      await savePatients(updatedPatients);
      Alert.alert('Success', 'Patient added successfully', [
        { text: 'OK', onPress: () => router.replace('/(tabs)/patients') },
      ]);
      resetForm();
    } catch (error) {
      Alert.alert('Error', 'Failed to add patient. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Header title="Add Patient" subtitle="Enter patient details" />
      </View>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Input
          placeholder="Full Name *"
          value={formData.name}
          onChangeText={text => setFormData({ ...formData, name: text })}
        />
        <Input
          placeholder="Age *"
          value={formData.age}
          onChangeText={text => setFormData({ ...formData, age: text })}
          keyboardType="numeric"
        />
        <View style={styles.genderContainer}>
          <Text style={styles.label}>Gender</Text>
          <View style={styles.genderOptions}>
            {(['Male', 'Female', 'Other'] as const).map(gender => (
              <TouchableOpacity
                key={gender}
                style={[
                  styles.genderOption,
                  formData.gender === gender && styles.selectedGender,
                ]}
                onPress={() => setFormData({ ...formData, gender })}
              >
                <Text
                  style={[
                    styles.genderText,
                    formData.gender === gender && styles.selectedGenderText,
                  ]}
                >
                  {gender}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <Input
          placeholder="Phone Number *"
          value={formData.phone}
          onChangeText={text => setFormData({ ...formData, phone: text })}
          keyboardType="phone-pad"
        />
        <Input
          placeholder="Email Address"
          value={formData.email}
          onChangeText={text => setFormData({ ...formData, email: text })}
          keyboardType="email-address"
        />
        <Input
          placeholder="Address"
          value={formData.address}
          onChangeText={text => setFormData({ ...formData, address: text })}
          multiline
          numberOfLines={3}
        />
        <Input
          placeholder="Medical Condition"
          value={formData.condition}
          onChangeText={text => setFormData({ ...formData, condition: text })}
        />
        <Input
          placeholder="Blood Group (e.g., A+, B-, O+)"
          value={formData.bloodGroup}
          onChangeText={text => setFormData({ ...formData, bloodGroup: text })}
        />
        <Input
          placeholder="Emergency Contact"
          value={formData.emergencyContact}
          onChangeText={text => setFormData({ ...formData, emergencyContact: text })}
          keyboardType="phone-pad"
        />
        <Input
          placeholder="Allergies (comma separated)"
          value={formData.allergies}
          onChangeText={text => setFormData({ ...formData, allergies: text })}
          multiline
          numberOfLines={2}
        />
        <Button
          title={isSubmitting ? 'Adding Patient...' : 'Add Patient'}
          onPress={handleSubmit}
          disabled={isSubmitting}
          style={styles.submitButton}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
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
  content: {
    flex: 1,
    backgroundColor: '#fff',
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