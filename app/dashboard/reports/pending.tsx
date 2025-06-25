import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Report, loadReports } from '@/utils/storage';
import Card from '@/components/ui/Card';
import {
  ArrowLeft,
  FileText,
  User,
  Calendar,
  Clock,
  AlertCircle,
  Upload
} from 'lucide-react-native';

export default function PendingReportsScreen() {
  const router = useRouter();
  const [pendingReports, setPendingReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPendingReportsData();
  }, []);

  const loadPendingReportsData = async () => {
    try {
      const allReports = await loadReports();
      const pending = allReports.filter(report => 
        report.status.toLowerCase() === 'pending'
      );
      
      // Sort by upload date (newest first)
      pending.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
      
      setPendingReports(pending);
    } catch (error) {
      console.error('Error loading pending reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getDaysAgo = (dateString: string) => {
    const uploadDate = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - uploadDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    return `${diffDays - 1} days ago`;
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    return extension === 'pdf' ? FileText : FileText;
  };

  const getUrgencyLevel = (dateString: string) => {
    const uploadDate = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - uploadDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 3) return 'high';
    if (diffDays > 1) return 'medium';
    return 'low';
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return '#D32F2F';
      case 'medium': return '#F57C00';
      case 'low': return '#2E7D32';
      default: return '#666';
    }
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
          <Text style={styles.headerTitle}>Pending Reports</Text>
          <Text style={styles.headerSubtitle}>
            {pendingReports.length} report{pendingReports.length !== 1 ? 's' : ''} awaiting review
          </Text>
        </View>
        <View style={styles.headerIcon}>
          <FileText size={24} color="#F57C00" />
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading pending reports...</Text>
          </View>
        ) : pendingReports.length === 0 ? (
          <View style={styles.emptyContainer}>
            <FileText size={48} color="#ccc" />
            <Text style={styles.emptyTitle}>No Pending Reports</Text>
            <Text style={styles.emptySubtitle}>
              All reports have been reviewed
            </Text>
          </View>
        ) : (
          <>
            {/* Summary Card */}
            <Card style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <View style={styles.summaryIcon}>
                  <AlertCircle size={24} color="#F57C00" />
                </View>
                <View style={styles.summaryContent}>
                  <Text style={styles.summaryTitle}>Reports Pending Review</Text>
                  <Text style={styles.summaryCount}>{pendingReports.length}</Text>
                  <Text style={styles.summarySubtitle}>
                    {pendingReports.filter(r => getUrgencyLevel(r.uploadDate) === 'high').length} urgent
                  </Text>
                </View>
              </View>
            </Card>

            {/* Reports List */}
            <Text style={styles.sectionTitle}>Pending Reports</Text>
            {pendingReports.map((report) => {
              const FileIcon = getFileIcon(report.fileName);
              const urgency = getUrgencyLevel(report.uploadDate);
              const urgencyColor = getUrgencyColor(urgency);
              
              return (
                <Card key={report.id} style={[
                  styles.reportCard,
                  { borderLeftColor: urgencyColor }
                ]}>
                  <View style={styles.reportHeader}>
                    <View style={styles.reportInfo}>
                      <View style={[styles.fileIcon, { backgroundColor: urgencyColor + '20' }]}>
                        <FileIcon size={24} color={urgencyColor} />
                      </View>
                      <View style={styles.reportDetails}>
                        <Text style={styles.reportType}>{report.reportType}</Text>
                        <Text style={styles.fileName}>{report.fileName}</Text>
                        <View style={styles.urgencyContainer}>
                          <View style={[styles.urgencyBadge, { backgroundColor: urgencyColor + '20' }]}>
                            <Text style={[styles.urgencyText, { color: urgencyColor }]}>
                              {urgency.toUpperCase()} PRIORITY
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                    <View style={styles.reportMeta}>
                      <Text style={styles.fileSize}>{report.fileSize}</Text>
                      <Text style={styles.daysAgo}>{getDaysAgo(report.uploadDate)}</Text>
                    </View>
                  </View>

                  <View style={styles.reportBody}>
                    <View style={styles.patientInfo}>
                      <User size={16} color="#666" />
                      <Text style={styles.patientName}>{report.patientName}</Text>
                    </View>
                    
                    <View style={styles.uploadInfo}>
                      <View style={styles.uploadDetail}>
                        <Calendar size={14} color="#666" />
                        <Text style={styles.uploadText}>
                          Uploaded: {formatDate(report.uploadDate)}
                        </Text>
                      </View>
                      <View style={styles.uploadDetail}>
                        <Upload size={14} color="#666" />
                        <Text style={styles.uploadText}>
                          By: {report.uploadedBy}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {urgency === 'high' && (
                    <View style={styles.urgentAlert}>
                      <AlertCircle size={16} color="#D32F2F" />
                      <Text style={styles.urgentText}>
                        Urgent: Uploaded more than 3 days ago
                      </Text>
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
    backgroundColor: '#FFF3E0',
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
    backgroundColor: '#FFF3E0',
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
    color: '#F57C00',
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
  reportCard: {
    marginBottom: 12,
    padding: 16,
    borderLeftWidth: 4,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reportInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  fileIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reportDetails: {
    flex: 1,
  },
  reportType: {
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  fileName: {
    fontSize: 12,
    fontFamily: 'Roboto-Regular',
    color: '#666',
    marginBottom: 6,
  },
  urgencyContainer: {
    flexDirection: 'row',
  },
  urgencyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  urgencyText: {
    fontSize: 10,
    fontFamily: 'Roboto-Bold',
  },
  reportMeta: {
    alignItems: 'flex-end',
  },
  fileSize: {
    fontSize: 12,
    fontFamily: 'Roboto-Medium',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  daysAgo: {
    fontSize: 11,
    fontFamily: 'Roboto-Regular',
    color: '#666',
  },
  reportBody: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  patientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  patientName: {
    fontSize: 14,
    fontFamily: 'Roboto-Medium',
    color: '#1a1a1a',
    marginLeft: 8,
  },
  uploadInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  uploadDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  uploadText: {
    fontSize: 12,
    fontFamily: 'Roboto-Regular',
    color: '#666',
    marginLeft: 6,
  },
  urgentAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  urgentText: {
    fontSize: 12,
    fontFamily: 'Roboto-Medium',
    color: '#D32F2F',
    marginLeft: 6,
  },
});