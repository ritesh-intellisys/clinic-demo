import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Home, 
  Users, 
  FileText, 
  Calendar, 
  User,
  Stethoscope,
  Upload,
  Bell,
  CreditCard,
  BarChart3
} from 'lucide-react-native';

export default function TabLayout() {
  const { user } = useAuth();

  if (!user) return null;

  const getTabsForRole = () => {
    switch (user.role) {
      case 'receptionist':
        return [
          {
            name: 'dashboard',
            title: 'Dashboard',
            icon: BarChart3,
          },
          {
            name: 'patients',
            title: 'Patients',
            icon: Users,
          },
          {
            name: 'billing',
            title: 'Billing',
            icon: CreditCard,
          },
          {
            name: 'reports',
            title: 'Reports',
            icon: Upload,
          },
          {
            name: 'profile',
            title: 'Profile',
            icon: User,
          },
        ];
      case 'doctor':
        return [
          {
            name: 'index',
            title: 'Dashboard',
            icon: Home,
          },
          {
            name: 'patients',
            title: 'Patients',
            icon: Users,
          },
          {
            name: 'prescriptions',
            title: 'Prescriptions',
            icon: FileText,
          },
          {
            name: 'billing',
            title: 'Billing',
            icon: CreditCard,
          },
          {
            name: 'profile',
            title: 'Profile',
            icon: User,
          },
        ];
      case 'patient':
        return [
          {
            name: 'index',
            title: 'Dashboard',
            icon: Home,
          },
          {
            name: 'prescriptions',
            title: 'Prescriptions',
            icon: FileText,
          },
          {
            name: 'reports',
            title: 'Reports',
            icon: FileText,
          },
          {
            name: 'billing',
            title: 'Billing',
            icon: CreditCard,
          },
          {
            name: 'profile',
            title: 'Profile',
            icon: User,
          },
        ];
      default:
        return [];
    }
  };

  const tabs = getTabsForRole();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#1976D2',
        tabBarInactiveTintColor: '#666',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          paddingBottom: Platform.OS === 'ios' ? 20 : 5,
          height: Platform.OS === 'ios' ? 85 : 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: 'Roboto-Medium',
        },
      }}
    >
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ color, size }) => (
              <tab.icon size={size} color={color} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}