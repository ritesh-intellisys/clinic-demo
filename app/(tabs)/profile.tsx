import Card from '@/components/ui/Card';
import Header from '@/components/ui/Header';
import { useAuth } from '@/contexts/AuthContext';
import {
  Bell,
  Calendar,
  Edit,
  HelpCircle,
  LogOut,
  Mail,
  MapPin,
  Phone,
  Settings,
  Shield,
  User
} from 'lucide-react-native';
import { useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const profileSections = [
  {
    title: 'Account',
    items: [
      { icon: Edit, label: 'Edit Profile', action: 'edit' },
      { icon: Bell, label: 'Notifications', action: 'notifications' },
      { icon: Shield, label: 'Privacy & Security', action: 'privacy' },
    ]
  },
  {
    title: 'Support',
    items: [
      { icon: HelpCircle, label: 'Help & Support', action: 'help' },
      { icon: Settings, label: 'Settings', action: 'settings' },
    ]
  }
];

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  if (!user) return null;

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            setIsLoggingOut(true);
            await logout();
            setIsLoggingOut(false);
          }
        }
      ]
    );
  };

  const handleSectionAction = (action: string) => {
    switch (action) {
      case 'edit':
        Alert.alert('Edit Profile', 'Profile editing functionality would be implemented here');
        break;
      case 'notifications':
        Alert.alert('Notifications', 'Notification settings would be implemented here');
        break;
      case 'privacy':
        Alert.alert('Privacy & Security', 'Privacy settings would be implemented here');
        break;
      case 'help':
        Alert.alert('Help & Support', 'Help documentation would be implemented here');
        break;
      case 'settings':
        Alert.alert('Settings', 'App settings would be implemented here');
        break;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'receptionist': return '#1976D2';
      case 'doctor': return '#2E7D32';
      case 'patient': return '#F57C00';
      default: return '#666';
    }
  };

  const getRoleDisplayName = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  return (
    <View style={styles.container}>
      <Header title="Profile" />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              {user.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <User size={40} color="#1976D2" />
                </View>
              )}
              <View style={[styles.roleBadge, { backgroundColor: getRoleColor(user.role) }]}>
                <Text style={styles.roleText}>{getRoleDisplayName(user.role)}</Text>
              </View>
            </View>
            
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
            </View>
          </View>

          <View style={styles.profileDetails}>
            <View style={styles.detailItem}>
              <Mail size={20} color="#666" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Email</Text>
                <Text style={styles.detailValue}>{user.email}</Text>
              </View>
            </View>
            
            <View style={styles.detailItem}>
              <Phone size={20} color="#666" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Phone</Text>
                <Text style={styles.detailValue}>+91 8421596545</Text>
              </View>
            </View>
            
            <View style={styles.detailItem}>
              <MapPin size={20} color="#666" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Location</Text>
                <Text style={styles.detailValue}>Hinjawadi, Pune</Text>
              </View>
            </View>
            
            <View style={styles.detailItem}>
              <Calendar size={20} color="#666" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Member Since</Text>
                <Text style={styles.detailValue}>January 2024</Text>
              </View>
            </View>
          </View>
        </Card>

        {profileSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Card style={styles.sectionCard}>
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  style={[
                    styles.sectionItem,
                    itemIndex < section.items.length - 1 && styles.sectionItemBorder
                  ]}
                  onPress={() => handleSectionAction(item.action)}
                >
                  <View style={styles.sectionItemLeft}>
                    <View style={styles.sectionItemIcon}>
                      <item.icon size={20} color="#1976D2" />
                    </View>
                    <Text style={styles.sectionItemLabel}>{item.label}</Text>
                  </View>
                  <Text style={styles.sectionItemArrow}>›</Text>
                </TouchableOpacity>
              ))}
            </Card>
          </View>
        ))}

        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={handleLogout}
          disabled={isLoggingOut}
        >
          <LogOut size={20} color="#D32F2F" />
          <Text style={styles.logoutText}>
            {isLoggingOut ? 'Signing Out...' : 'Sign Out'}
          </Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>MediCare Hospital Management</Text>
          <Text style={styles.footerVersion}>Version 1.0.0</Text>
        </View>
      </ScrollView>
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
  profileCard: {
    marginBottom: 24,
    padding: 0,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    backgroundColor: '#1976D2',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#fff',
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#fff',
  },
  roleText: {
    fontSize: 10,
    fontFamily: 'Roboto-Bold',
    color: '#fff',
  },
  profileInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontFamily: 'Roboto-Bold',
    color: '#fff',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
    color: '#fff',
    opacity: 0.9,
  },
  profileDetails: {
    padding: 24,
  },
  detailItem: {
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  sectionCard: {
    padding: 0,
  },
  sectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sectionItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionItemLabel: {
    fontSize: 16,
    fontFamily: 'Roboto-Medium',
    color: '#1a1a1a',
  },
  sectionItemArrow: {
    fontSize: 20,
    color: '#ccc',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 32,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  logoutText: {
    fontSize: 16,
    fontFamily: 'Roboto-Medium',
    color: '#D32F2F',
    marginLeft: 12,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 14,
    fontFamily: 'Roboto-Medium',
    color: '#666',
    marginBottom: 4,
  },
  footerVersion: {
    fontSize: 12,
    fontFamily: 'Roboto-Regular',
    color: '#999',
  },
});