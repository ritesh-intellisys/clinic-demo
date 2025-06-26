import { Activity, BarChart3, Calendar, Users } from 'lucide-react-native';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function ExploreScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Explore</Text>
        <Text style={styles.subtitle}>Discover the features of your clinic management system</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Features</Text>
          
          <View style={styles.featureCard}>
            <BarChart3 size={24} color="#1976D2" />
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Dashboard</Text>
              <Text style={styles.featureDescription}>
                View key metrics and statistics about your clinic operations
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <Users size={24} color="#2E7D32" />
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Patient Management</Text>
              <Text style={styles.featureDescription}>
                Manage patient records, appointments, and medical history
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <Calendar size={24} color="#F57C00" />
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Appointments</Text>
              <Text style={styles.featureDescription}>
                Schedule and manage patient appointments efficiently
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <Activity size={24} color="#7B1FA2" />
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Analytics</Text>
              <Text style={styles.featureDescription}>
                Detailed analytics and reporting features coming soon
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Getting Started</Text>
          <Text style={styles.description}>
            This clinic management system is designed to help healthcare professionals 
            manage their practice efficiently. Navigate through the tabs to access 
            different features based on your role.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Roboto-Bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
    color: '#666',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Roboto-Bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  featureContent: {
    marginLeft: 16,
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    fontFamily: 'Roboto-Regular',
    color: '#666',
  },
  description: {
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
    color: '#666',
    lineHeight: 24,
  },
});