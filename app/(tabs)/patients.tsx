import Header from '@/components/ui/Header';
import { useAuth } from '@/contexts/AuthContext';
import {
  loadHospitalBills,
  loadMedicineBills,
  loadPatients,
  loadPrescriptions,
  loadReports,
  Patient
} from '@/utils/storage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

interface PatientWithStats extends Patient {
  prescriptionCount: number;
  reportCount: number;
  totalBills: number;
  lastPrescription?: string;
}

export default function PatientsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [patients, setPatients] = useState<PatientWithStats[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<PatientWithStats[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'recent' | 'active'>('all');

  useEffect(() => {
    loadPatientData();
  }, []);

  useEffect(() => {
    filterPatients();
  }, [searchQuery, filter, patients]);

  const loadPatientData = async () => {
    try {
      setLoading(true);
      const [patientsData, prescriptions, reports, medicineBills, hospitalBills] = await Promise.all([
        loadPatients(),
        loadPrescriptions(),
        loadReports(),
        loadMedicineBills(),
        loadHospitalBills(),
      ]);

      const patientsWithStats: PatientWithStats[] = patientsData.map(patient => {
        const patientPrescriptions = prescriptions.filter(p => p.patientName === patient.name);
        const patientReports = reports.filter(r => r.patientName === patient.name);
        const patientMedicineBills = medicineBills.filter(b => b.patientName === patient.name);
        const patientHospitalBills = hospitalBills.filter(b => b.patientName === patient.name);

        return {
          ...patient,
          prescriptionCount: patientPrescriptions.length,
          reportCount: patientReports.length,
          totalBills: patientMedicineBills.length + patientHospitalBills.length,
          lastPrescription: patientPrescriptions.length > 0 
            ? patientPrescriptions[patientPrescriptions.length - 1].date 
            : undefined,
        };
      });

      setPatients(patientsWithStats);
    } catch (error) {
      console.error('Error loading patient data:', error);
      Alert.alert('Error', 'Failed to load patient data');
    } finally {
      setLoading(false);
    }
  };

  const filterPatients = () => {
    let filtered = patients;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(patient =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.phone.includes(searchQuery) ||
        patient.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    switch (filter) {
      case 'recent':
        const today = new Date();
        const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(patient => {
          const lastVisit = new Date(patient.lastVisit);
          return lastVisit >= sevenDaysAgo;
        });
        break;
      case 'active':
        filtered = filtered.filter(patient => patient.prescriptionCount > 0);
        break;
    }

    setFilteredPatients(filtered);
  };

  const navigateToPatientDetail = (patient: PatientWithStats) => {
    router.push({
      pathname: '/patient-detail',
      params: { patientId: patient.id }
    });
  };

  const getStatusColor = (patient: PatientWithStats) => {
    if (patient.prescriptionCount > 0) return '#10B981'; // Green for active
    if (new Date(patient.lastVisit) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) {
      return '#F59E0B'; // Yellow for recent
    }
    return '#6B7280'; // Gray for inactive
  };

  const renderPatientCard = ({ item }: { item: PatientWithStats }) => (
    <TouchableOpacity
      style={styles.patientCard}
      onPress={() => navigateToPatientDetail(item)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {item.name.split(' ').map(n => n[0]).join('').toUpperCase()}
          </Text>
        </View>
        <View style={styles.patientInfo}>
          <Text style={styles.patientName}>{item.name}</Text>
          <Text style={styles.patientDetails}>
            {item.age} years • {item.gender} • {item.bloodGroup || 'N/A'}
          </Text>
          <Text style={styles.patientContact}>{item.phone}</Text>
        </View>
        <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(item) }]} />
      </View>

      <View style={styles.cardStats}>
        <View style={styles.statItem}>
          <Ionicons name="medical" size={16} color="#6B7280" />
          <Text style={styles.statText}>{item.prescriptionCount} Rx</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="document-text" size={16} color="#6B7280" />
          <Text style={styles.statText}>{item.reportCount} Reports</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="card" size={16} color="#6B7280" />
          <Text style={styles.statText}>{item.totalBills} Bills</Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.lastVisit}>
          Last visit: {new Date(item.lastVisit).toLocaleDateString()}
        </Text>
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      </View>
    </TouchableOpacity>
  );

  const renderFilterButton = (filterType: 'all' | 'recent' | 'active', label: string) => (
    <TouchableOpacity
      style={[styles.filterButton, filter === filterType && styles.filterButtonActive]}
      onPress={() => setFilter(filterType)}
    >
      <Text style={[styles.filterButtonText, filter === filterType && styles.filterButtonTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading patients...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Patients" subtitle="Manage patient records" />
      
        <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search patients by name, phone, or email..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
              
      <View style={styles.filterContainer}>
        {renderFilterButton('all', 'All Patients')}
        {renderFilterButton('recent', 'Recent')}
        {renderFilterButton('active', 'Active')}
                </View>

      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          {filteredPatients.length} patient{filteredPatients.length !== 1 ? 's' : ''} found
        </Text>
      </View>

      <FlatList
        data={filteredPatients}
        renderItem={renderPatientCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>No patients found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery ? 'Try adjusting your search terms' : 'Add your first patient to get started'}
            </Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/add-patient')}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={24} color="white" />
              </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    fontFamily: 'Roboto-Regular',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1F2937',
    fontFamily: 'Roboto-Regular',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Roboto-Medium',
  },
  filterButtonTextActive: {
    color: 'white',
  },
  statsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  statsText: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Roboto-Regular',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  patientCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    fontFamily: 'Roboto-Bold',
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
    fontFamily: 'Roboto-Bold',
  },
  patientDetails: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
    fontFamily: 'Roboto-Regular',
  },
  patientContact: {
    fontSize: 14,
    color: '#3B82F6',
    fontFamily: 'Roboto-Medium',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  cardStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Roboto-Medium',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
  },
  lastVisit: {
    fontSize: 14,
    color: '#9CA3AF',
    fontFamily: 'Roboto-Regular',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 8,
    fontFamily: 'Roboto-Bold',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    fontFamily: 'Roboto-Regular',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});