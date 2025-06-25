import ScheduleAppointmentModal from '@/components/modals/ScheduleAppointmentModal';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';

export default function ScheduleAppointmentScreen() {
  const router = useRouter();
  const [visible, setVisible] = useState(true);

  const handleClose = () => {
    setVisible(false);
    router.back();
  };

  const handleAppointmentScheduled = () => {
    setVisible(false);
    router.back();
  };

  return (
    <View style={{ flex: 1 }}>
      <ScheduleAppointmentModal
        visible={visible}
        onClose={handleClose}
        onAppointmentScheduled={handleAppointmentScheduled}
      />
    </View>
  );
}