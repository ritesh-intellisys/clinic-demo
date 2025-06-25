import AddPatientModal from '@/components/modals/AddPatientModal';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';

export default function AddPatientScreen() {
  const router = useRouter();
  const [visible, setVisible] = useState(true);

  const handleClose = () => {
    setVisible(false);
    router.back();
  };

  const handlePatientAdded = () => {
    setVisible(false);
    router.back();
  };

  return (
    <View style={{ flex: 1 }}>
      <AddPatientModal
        visible={visible}
        onClose={handleClose}
        onPatientAdded={handlePatientAdded}
      />
    </View>
  );
}