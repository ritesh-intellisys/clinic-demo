import { Stack } from 'expo-router';
import React from 'react';

export default function DashboardLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="patients" />
      <Stack.Screen name="appointments" />
      <Stack.Screen name="reports" />
      <Stack.Screen name="analytics" />
    </Stack>
  );
}