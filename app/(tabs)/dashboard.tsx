import Card from '@/components/ui/Card';
import Header from '@/components/ui/Header';
import { useAuth } from '@/contexts/AuthContext';
import { calculateDashboardStats, DashboardStats, initializeAppointments } from '@/utils/dashboardUtils';
import { initializeStorage } from '@/utils/storage';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import {
    Activity,
    ArrowRight,
    Calendar,
    FileText,
    TrendingUp,
    Users
} from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function DashboardScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    todayAppointments: 0,
    pendingReports: 0,
    newRegistrations: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  if (!user) return null;

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      await initializeStorage();
      await initializeAppointments();
      const dashboardStats = await calculateDashboardStats();
      setStats(dashboardStats);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [])
  );

  const dashboardCards = [
    {
      title: 'Total Patients',
      value: isLoading ? '...' : stats.totalPatients,
      icon: Users,
      color: '#1976D2',
      backgroundColor: '#E3F2FD',
      route: '/patients',
      description: 'All registered patients'
    },
    {
      title: "Today's Appointments",
      value: isLoading ? '...' : stats.todayAppointments,
      icon: Calendar,
      color: '#2E7D32',
      backgroundColor: '#E8F5E8',
      route: '/appointments',
      description: 'Scheduled for today'
    },
    {
      title: 'Pending Reports',
      value: isLoading ? '...' : stats.pendingReports,
      icon: FileText,
      color: '#F57C00',
      backgroundColor: '#FFF3E0',
      route: '/reports',
      description: 'Awaiting review'
    },
    {
      title: 'New Registrations',
      value: isLoading ? '...' : stats.newRegistrations,
      icon: TrendingUp,
      color: '#7B1FA2',
      backgroundColor: '#F3E5F5',
      route: '/patients',
      description: 'Registered today'
    },
  ];

  const handleCardPress = (route: string) => {
    router.push(route as any);
  };

  return (
    <View style={styles.container}>
      <Header 
        title={`Welcome, ${user.name.split(' ')[0]}`}
        subtitle="Receptionist Dashboard"
        showNotification
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.statsGrid}>
            {dashboardCards.map((card, index) => {
              const IconComponent = card.icon;
              return (
                <TouchableOpacity
                  key={index}
                  style={styles.statCardTouchable}
                  onPress={() => handleCardPress(card.route)}
                  activeOpacity={0.7}
                >
                  <Card style={[styles.statCard, { backgroundColor: card.backgroundColor }]}>
                    <View style={styles.statCardHeader}>
                      <View style={styles.statCardIcon}>
                        <IconComponent size={24} color={card.color} />
                      </View>
                      <ArrowRight size={16} color="#666" />
                    </View>
                    <Text style={styles.statNumber}>{card.value}</Text>
                    <Text style={styles.statLabel}>{card.title}</Text>
                    <Text style={styles.statDescription}>{card.description}</Text>
                  </Card>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => router.push('/patients')}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#E3F2FD' }]}>
                <Users size={20} color="#1976D2" />
              </View>
              <Text style={styles.actionText}>Add Patient</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => router.push('/appointments')}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#E8F5E8' }]}>
                <Calendar size={20} color="#2E7D32" />
              </View>
              <Text style={styles.actionText}>Schedule Appointment</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => router.push('/reports')}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#FFF3E0' }]}>
                <FileText size={20} color="#F57C00" />
              </View>
              <Text style={styles.actionText}>Upload Report</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => router.push('/analytics')}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#F3E5F5' }]}>
                <Activity size={20} color="#7B1FA2" />
              </View>
              <Text style={styles.actionText}>View Analytics</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <Card style={styles.activityCard}>
            <View style={styles.activityItem}>
              <View style={[styles.activityDot, { backgroundColor: '#1976D2' }]} />
              <View style={styles.activityContent}>
                <Text style={styles.activityAction}>New patient registered</Text>
                <Text style={styles.activityDetail}>Rahul Verma</Text>
                <Text style={styles.activityTime}>10 min ago</Text>
              </View>
            </View>
            <View style={styles.activityItem}>
              <View style={[styles.activityDot, { backgroundColor: '#2E7D32' }]} />
              <View style={styles.activityContent}>
                <Text style={styles.activityAction}>Appointment scheduled</Text>
                <Text style={styles.activityDetail}>Priya Sharma - Dr. Kumar</Text>
                <Text style={styles.activityTime}>25 min ago</Text>
              </View>
            </View>
            <View style={styles.activityItem}>
              <View style={[styles.activityDot, { backgroundColor: '#F57C00' }]} />
              <View style={styles.activityContent}>
                <Text style={styles.activityAction}>Lab report uploaded</Text>
                <Text style={styles.activityDetail}>Amit Patel - Blood Test</Text>
                <Text style={styles.activityTime}>1 hour ago</Text>
              </View>
            </View>
          </Card>
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Roboto-Bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCardTouchable: {
    width: '48%',
    marginBottom: 12,
  },
  statCard: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  statCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontFamily: 'Roboto-Bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    fontFamily: 'Roboto-Medium',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  statDescription: {
    fontSize: 12,
    fontFamily: 'Roboto-Regular',
    color: '#666',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAction: {
    width: '48%',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionText: {
    fontSize: 12,
    fontFamily: 'Roboto-Medium',
    color: '#1a1a1a',
    textAlign: 'center',
  },
  activityCard: {
    padding: 0,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityAction: {
    fontSize: 14,
    fontFamily: 'Roboto-Medium',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  activityDetail: {
    fontSize: 12,
    fontFamily: 'Roboto-Regular',
    color: '#666',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 11,
    fontFamily: 'Roboto-Regular',
    color: '#999',
  },
});