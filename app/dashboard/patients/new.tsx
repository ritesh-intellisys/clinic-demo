import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Patient, loadPatients } from '@/utils/storage';
import Card from '@/components/ui/Card';
import {
  ArrowLeft,
  User,
  Phone,
  Calendar,
  Heart,
  TrendingUp
} from 'lucide-react-native';

export default function NewPatientsScreen() {
  const router = useRouter();
  const [newPatients, setNewPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadNewPatientsData();
  }, []);

  const loadNewPatientsData = async () => {
    try {
      const allPatients = await loadPatients();
      const today = new Date().toISOString().split('T')[0];
      
      // Filter patients registered today
      const todayPatients = allPatients.filter(patient => {
        const registrationDate = patient.createdAt || patient.lastVisit;
        return registrationDate === today;
      });
      
      setNewPatients(todayPatients);
    } catch (error) {
      console.error('Error loading new patients:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
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
          <Text style={styles.headerTitle}>New Registrations</Text>
          <Text style={styles.headerSubtitle}>
            {newPatients.length} patient{newPatients.length !== 1 ? 's' : ''} registered today
          </Text>
        </View>
        <View style={styles.headerIcon}>
          <TrendingUp size={24} color="#7B1FA2" />
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading new registrations...</Text>
          </View>
        ) : newPatients.length === 0 ? (
          <View style={styles.emptyContainer}>
            <TrendingUp size={48} color="#ccc" />
            <Text style={styles.emptyTitle}>No New Registrations</Text>
            <Text style={styles.emptySubtitle}>
              No patients have registered today yet
            </Text>
          </View>
        ) : (
          <>
            {/* Summary Card */}
            <Card style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <View style={styles.summaryIcon}>
                  <TrendingUp size={24} color="#7B1FA2" />
                </View>
                <View style={styles.summaryContent}>
                  <Text style={styles.summaryTitle}>Today's Registrations</Text>
                  <Text style={styles.summaryCount}>{newPatients.length}</Text>
                  <Text style={styles.summarySubtitle}>
                    {newPatients.length === 1 ? 'New patient' : 'New patients'} joined today
                  </Text>
                </View>
              </View>
            </Card>

            {/* Patients List */}
            <Text style={styles.sectionTitle}>Recent Registrations</Text>
            {newPatients.map((patient, index) => (
              <Card key={patient.id} style={styles.patientCard}>
                <View style={styles.patientHeader}>
                  <View style={styles.registrationBadge}>
                    <Text style={styles.registrationNumber}>#{index + 1}</Text>
                  </View>
                  <View style={styles.patientInfo}>
                    <View style={styles.avatar}>
                      <User size={24} color="#1976D2" />
                    </View>
                    <View style={styles.patientDetails}>
                      <Text style={styles.patientName}>{patient.name}</Text>
                      <View style={styles.patientMeta}>
                        <Text style={styles.metaText}>
                          {patient.age} years • {patient.gender}
                        </Text>
                        {patient.bloodGroup && (
                          <View style={styles.bloodGroup}>
                            <Heart size={12} color="#D32F2F" />
                            <Text style={styles.bloodGroupText}>{patient.bloodGroup}</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.condition}>{patient.condition}</Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.patientFooter}>
                  <View style={styles.contactInfo}>
                    <Phone size={14} color="#666" />
                    <Text style={styles.contactText}>{patient.phone}</Text>
                  </View>
                  <View style={styles.contactInfo}>
                    <Calendar size={14} color="#666" />
                    <Text style={styles.contactText}>
                      Registered: {formatTime(patient.createdAt || patient.lastVisit)}
                    </Text>
                  </View>
                </View>

                {patient.emergencyContact && (
                  <View style={styles.emergencyContact}>
                    <Text style={styles.emergencyLabel}>Emergency Contact:</Text>
                    <Text style={styles.emergencyNumber}>{patient.emergencyContact}</Text>
                  </View>
                )}
              </Card>
            ))}
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
    backgroundColor: '#F3E5F5',
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
  summaryCard: {
    backgroundColor: '#F3E5F5',
    marginBottom: 24,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  summaryContent: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
    color: '#7B1FA2',
    marginBottom: 4,
  },
  summaryCount: {
    fontSize: 24,
    fontFamily: 'Roboto-Bold',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  summarySubtitle: {
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
  patientCard: {
    marginBottom: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#7B1FA2',
  },
  patientHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  registrationBadge: {
    backgroundColor: '#7B1FA2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 12,
    marginTop: 4,
  },
  registrationNumber: {
    fontSize: 12,
    fontFamily: 'Roboto-Bold',
    color: '#fff',
  },
  patientInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
    marginBottom: 4,
  },
  patientMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  metaText: {
    fontSize: 12,
    fontFamily: 'Roboto-Regular',
    color: '#666',
    marginRight: 12,
  },
  bloodGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bloodGroupText: {
    fontSize: 12,
    fontFamily: 'Roboto-Medium',
    color: '#D32F2F',
    marginLeft: 4,
  },
  condition: {
    fontSize: 12,
    fontFamily: 'Roboto-Medium',
    color: '#1976D2',
  },
  patientFooter: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
    marginBottom: 8,
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  contactText: {
    fontSize: 12,
    fontFamily: 'Roboto-Regular',
    color: '#666',
    marginLeft: 6,
  },
  emergencyContact: {
    backgroundColor: '#FFF3E0',
    padding: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  emergencyLabel: {
    fontSize: 12,
    fontFamily: 'Roboto-Medium',
    color: '#F57C00',
    marginRight: 8,
  },
  emergencyNumber: {
    fontSize: 12,
    fontFamily: 'Roboto-Regular',
    color: '#E65100',
  },
});