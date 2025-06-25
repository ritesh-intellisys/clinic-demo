import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Appointment, loadAppointments } from '@/utils/dashboardUtils';
import { Patient, loadPatients } from '@/utils/storage';
import Card from '@/components/ui/Card';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Stethoscope,
  Phone,
  AlertCircle
} from 'lucide-react-native';

export default function TodayAppointmentsScreen() {
  const router = useRouter();
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTodayAppointmentsData();
  }, []);

  const loadTodayAppointmentsData = async () => {
    try {
      const [allAppointments, allPatients] = await Promise.all([
        loadAppointments(),
        loadPatients()
      ]);
      
      const today = new Date().toISOString().split('T')[0];
      const todayAppts = allAppointments.filter(appointment => 
        appointment.date === today && appointment.status !== 'Cancelled'
      );
      
      // Sort by time
      todayAppts.sort((a, b) => {
        const timeA = convertTo24Hour(a.time);
        const timeB = convertTo24Hour(b.time);
        return timeA.localeCompare(timeB);
      });
      
      setTodayAppointments(todayAppts);
      setPatients(allPatients);
    } catch (error) {
      console.error('Error loading today appointments:', error);
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

  const formatDate = () => {
    const today = new Date();
    return today.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#1976D2" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Today's Appointments</Text>
          <Text style={styles.headerSubtitle}>
            {todayAppointments.length} appointment{todayAppointments.length !== 1 ? 's' : ''} scheduled
          </Text>
        </View>
        <View style={styles.headerIcon}>
          <Calendar size={24} color="#2E7D32" />
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading today's appointments...</Text>
          </View>
        ) : todayAppointments.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Calendar size={48} color="#ccc" />
            <Text style={styles.emptyTitle}>No Appointments Today</Text>
            <Text style={styles.emptySubtitle}>
              No appointments are scheduled for today
            </Text>
          </View>
        ) : (
          <>
            {/* Date Header */}
            <Card style={styles.dateCard}>
              <View style={styles.dateHeader}>
                <Calendar size={24} color="#2E7D32" />
                <View style={styles.dateContent}>
                  <Text style={styles.dateTitle}>Today</Text>
                  <Text style={styles.dateSubtitle}>{formatDate()}</Text>
                </View>
                <View style={styles.appointmentCount}>
                  <Text style={styles.countNumber}>{todayAppointments.length}</Text>
                  <Text style={styles.countLabel}>Appointments</Text>
                </View>
              </View>
            </Card>

            {/* Appointments List */}
            <Text style={styles.sectionTitle}>Schedule</Text>
            {todayAppointments.map((appointment) => {
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
                        {patient && (
                          <View style={styles.patientMeta}>
                            <Text style={styles.metaText}>
                              {patient.age} years • {patient.gender}
                            </Text>
                            <Text style={styles.conditionText}>{patient.condition}</Text>
                          </View>
                        )}
                      </View>
                    </View>

                    <View style={styles.doctorInfo}>
                      <Stethoscope size={16} color="#2E7D32" />
                      <Text style={styles.doctorName}>{appointment.doctorName}</Text>
                    </View>

                    {patient && (
                      <View style={styles.contactInfo}>
                        <Phone size={14} color="#666" />
                        <Text style={styles.contactText}>{patient.phone}</Text>
                      </View>
                    )}
                  </View>

                  {appointment.type === 'Emergency' && (
                    <View style={styles.emergencyAlert}>
                      <AlertCircle size={16} color="#D32F2F" />
                      <Text style={styles.emergencyText}>Emergency Appointment</Text>
                    </View>
                  )}
                </Card>
              );
            })}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingTop: 60,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Roboto-Bold',
    color: '#1a1a1a',
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'Roboto-Regular',
    color: '#666',
    marginTop: 2,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Roboto-Bold',
    color: '#1a1a1a',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'Roboto-Regular',
    color: '#666',
    textAlign: 'center',
  },
  dateCard: {
    backgroundColor: '#E8F5E8',
    marginBottom: 24,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateContent: {
    flex: 1,
    marginLeft: 16,
  },
  dateTitle: {
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
    color: '#2E7D32',
    marginBottom: 2,
  },
  dateSubtitle: {
    fontSize: 14,
    fontFamily: 'Roboto-Regular',
    color: '#666',
  },
  appointmentCount: {
    alignItems: 'center',
  },
  countNumber: {
    fontSize: 24,
    fontFamily: 'Roboto-Bold',
    color: '#2E7D32',
  },
  countLabel: {
    fontSize: 12,
    fontFamily: 'Roboto-Regular',
    color: '#666',
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  appointmentCard: {
    marginBottom: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#2E7D32',
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
  appointmentTime: {
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
    color: '#1a1a1a',
    marginLeft: 6,
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
    fontSize: 10,
    fontFamily: 'Roboto-Medium',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontFamily: 'Roboto-Medium',
  },
  appointmentBody: {
    gap: 8,
  },
  patientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
    marginBottom: 2,
  },
  patientMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    fontSize: 12,
    fontFamily: 'Roboto-Regular',
    color: '#666',
  },
  conditionText: {
    fontSize: 12,
    fontFamily: 'Roboto-Medium',
    color: '#1976D2',
  },
  doctorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 48,
  },
  doctorName: {
    fontSize: 14,
    fontFamily: 'Roboto-Medium',
    color: '#2E7D32',
    marginLeft: 6,
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 48,
  },
  contactText: {
    fontSize: 12,
    fontFamily: 'Roboto-Regular',
    color: '#666',
    marginLeft: 6,
  },
  emergencyAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  emergencyText: {
    fontSize: 12,
    fontFamily: 'Roboto-Medium',
    color: '#D32F2F',
    marginLeft: 6,
  },
});