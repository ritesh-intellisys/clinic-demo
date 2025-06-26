import ScheduleAppointmentModal from '@/components/modals/ScheduleAppointmentModal';
import Card from '@/components/ui/Card';
import Header from '@/components/ui/Header';
import { useAuth } from '@/contexts/AuthContext';
import { Appointment, loadAppointments } from '@/utils/dashboardUtils';
import { loadPatients, Patient } from '@/utils/storage';
import { useRouter } from 'expo-router';
import {
    Calendar,
    Clock,
    Phone,
    Plus,
    Stethoscope,
    User
} from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function AppointmentsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  useEffect(() => {
    loadAppointmentsData();
  }, []);

  const loadAppointmentsData = async () => {
    try {
      const [allAppointments, allPatients] = await Promise.all([
        loadAppointments(),
        loadPatients()
      ]);
      
      const today = new Date().toISOString().split('T')[0];
      const todayAppts = allAppointments.filter(appointment => 
        appointment.date === today && appointment.status !== 'Cancelled'
      );
      
      const upcomingAppts = allAppointments.filter(appointment => 
        appointment.date > today && appointment.status !== 'Cancelled'
      ).slice(0, 5); // Show only next 5 appointments
      
      // Sort by time
      todayAppts.sort((a, b) => {
        const timeA = convertTo24Hour(a.time);
        const timeB = convertTo24Hour(b.time);
        return timeA.localeCompare(timeB);
      });
      
      setTodayAppointments(todayAppts);
      setUpcomingAppointments(upcomingAppts);
      setPatients(allPatients);
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const convertTo24Hour = (time12h: string) => {
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');
    if (hours === '12') {
      hours = '00';
    }
    if (modifier === 'PM') {
      hours = (parseInt(hours, 10) + 12).toString();
    }
    return `${hours.padStart(2, '0')}:${minutes}`;
  };

  const getPatientDetails = (patientId: string) => {
    return patients.find(p => p.id === patientId);
  };

  const getAppointmentTypeColor = (type: string) => {
    switch (type) {
      case 'Emergency': return '#D32F2F';
      case 'Follow-up': return '#F57C00';
      case 'Consultation': return '#1976D2';
      default: return '#666';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled': return '#1976D2';
      case 'Completed': return '#2E7D32';
      case 'Cancelled': return '#D32F2F';
      default: return '#666';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleAppointmentScheduled = () => {
    setShowScheduleModal(false);
    loadAppointmentsData();
  };

  const canSchedule = user?.role === 'receptionist';

  return (
    <View style={styles.container}>
      <Header 
        title="Appointments" 
        subtitle={`${todayAppointments.length} today`}
        rightComponent={
          canSchedule ? (
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setShowScheduleModal(true)}
            >
              <Plus size={20} color="#fff" />
            </TouchableOpacity>
          ) : null
        }
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Today's Appointments */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Appointments</Text>
          {isLoading ? (
            <Card style={styles.loadingCard}>
              <Text style={styles.loadingText}>Loading appointments...</Text>
            </Card>
          ) : todayAppointments.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Calendar size={32} color="#ccc" />
              <Text style={styles.emptyTitle}>No Appointments Today</Text>
              <Text style={styles.emptySubtitle}>
                No appointments are scheduled for today
              </Text>
            </Card>
          ) : (
            todayAppointments.map((appointment) => {
              const patient = getPatientDetails(appointment.patientId);
              return (
                <Card key={appointment.id} style={styles.appointmentCard}>
                  <View style={styles.appointmentHeader}>
                    <View style={styles.timeContainer}>
                      <Clock size={16} color="#666" />
                      <Text style={styles.appointmentTime}>{appointment.time}</Text>
                    </View>
                    <View style={styles.statusContainer}>
                      <View style={[
                        styles.typeBadge, 
                        { backgroundColor: getAppointmentTypeColor(appointment.type) + '20' }
                      ]}>
                        <Text style={[
                          styles.typeText, 
                          { color: getAppointmentTypeColor(appointment.type) }
                        ]}>
                          {appointment.type}
                        </Text>
                      </View>
                      <View style={[
                        styles.statusBadge, 
                        { backgroundColor: getStatusColor(appointment.status) + '20' }
                      ]}>
                        <Text style={[
                          styles.statusText, 
                          { color: getStatusColor(appointment.status) }
                        ]}>
                          {appointment.status}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.appointmentBody}>
                    <View style={styles.patientInfo}>
                      <View style={styles.avatar}>
                        <User size={20} color="#1976D2" />
                      </View>
                      <View style={styles.patientDetails}>
                        <Text style={styles.patientName}>{appointment.patientName}</Text>
                        <Text style={styles.patientMeta}>
                          {patient?.age} years • {patient?.gender}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.appointmentMeta}>
                      <View style={styles.metaItem}>
                        <Stethoscope size={14} color="#666" />
                        <Text style={styles.metaText}>{appointment.doctorName}</Text>
                      </View>
                      {patient?.phone && (
                        <View style={styles.metaItem}>
                          <Phone size={14} color="#666" />
                          <Text style={styles.metaText}>{patient.phone}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </Card>
              );
            })
          )}
        </View>

        {/* Upcoming Appointments */}
        {upcomingAppointments.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
            {upcomingAppointments.map((appointment) => {
              const patient = getPatientDetails(appointment.patientId);
              return (
                <Card key={appointment.id} style={styles.appointmentCard}>
                  <View style={styles.appointmentHeader}>
                    <View style={styles.dateContainer}>
                      <Calendar size={16} color="#666" />
                      <Text style={styles.appointmentDate}>{formatDate(appointment.date)}</Text>
                      <Text style={styles.appointmentTime}>{appointment.time}</Text>
                    </View>
                    <View style={styles.statusContainer}>
                      <View style={[
                        styles.typeBadge, 
                        { backgroundColor: getAppointmentTypeColor(appointment.type) + '20' }
                      ]}>
                        <Text style={[
                          styles.typeText, 
                          { color: getAppointmentTypeColor(appointment.type) }
                        ]}>
                          {appointment.type}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.appointmentBody}>
                    <View style={styles.patientInfo}>
                      <View style={styles.avatar}>
                        <User size={20} color="#1976D2" />
                      </View>
                      <View style={styles.patientDetails}>
                        <Text style={styles.patientName}>{appointment.patientName}</Text>
                        <Text style={styles.patientMeta}>
                          {patient?.age} years • {patient?.gender}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.appointmentMeta}>
                      <View style={styles.metaItem}>
                        <Stethoscope size={14} color="#666" />
                        <Text style={styles.metaText}>{appointment.doctorName}</Text>
                      </View>
                    </View>
                  </View>
                </Card>
              );
            })}
          </View>
        )}
      </ScrollView>

      <ScheduleAppointmentModal
        visible={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        onAppointmentScheduled={handleAppointmentScheduled}
      />
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
  addButton: {
    backgroundColor: '#1976D2',
    padding: 8,
    borderRadius: 8,
  },
  loadingCard: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'Roboto-Regular',
    color: '#666',
  },
  emptyCard: {
    padding: 32,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
    color: '#1a1a1a',
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'Roboto-Regular',
    color: '#666',
    textAlign: 'center',
  },
  appointmentCard: {
    marginBottom: 12,
    padding: 16,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appointmentTime: {
    fontSize: 14,
    fontFamily: 'Roboto-Medium',
    color: '#1a1a1a',
    marginLeft: 4,
  },
  appointmentDate: {
    fontSize: 14,
    fontFamily: 'Roboto-Medium',
    color: '#1a1a1a',
    marginLeft: 4,
    marginRight: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    fontSize: 12,
    fontFamily: 'Roboto-Medium',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Roboto-Medium',
  },
  appointmentBody: {
    gap: 12,
  },
  patientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  patientDetails: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
    color: '#1a1a1a',
  },
  patientMeta: {
    fontSize: 14,
    fontFamily: 'Roboto-Regular',
    color: '#666',
    marginTop: 2,
  },
  appointmentMeta: {
    gap: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 14,
    fontFamily: 'Roboto-Regular',
    color: '#666',
    marginLeft: 6,
  },
}); 