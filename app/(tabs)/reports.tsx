import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Header from '@/components/ui/Header';
import Input from '@/components/ui/Input';
import { useAuth } from '@/contexts/AuthContext';
import { Report, initializeStorage, loadReports, saveReports } from '@/utils/storage';
import * as DocumentPicker from 'expo-document-picker';
import {
    Calendar,
    Edit,
    Eye,
    FileText,
    Trash2,
    Upload,
    User
} from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function ReportsScreen() {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const [uploadData, setUploadData] = useState({
    patientName: '',
    reportType: '',
    selectedFile: null as any,
  });

  useEffect(() => {
    loadReportsData();
  }, []);

  const loadReportsData = async () => {
    await initializeStorage();
    const reportsData = await loadReports();
    setReports(reportsData);
  };

  const filteredReports = user?.role === 'patient' 
    ? reports.filter(r => r.patientName === user.name)
    : reports;

  const handleFilePicker = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        setUploadData({
          ...uploadData,
          selectedFile: result.assets[0]
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick file');
    }
  };

  const handleUploadReport = async () => {
    if (!uploadData.patientName || !uploadData.reportType || !uploadData.selectedFile) {
      Alert.alert('Error', 'Please fill in all fields and select a file');
      return;
    }

    const newReport: Report = {
      id: Date.now().toString(),
      patientName: uploadData.patientName,
      reportType: uploadData.reportType,
      fileName: uploadData.selectedFile.name,
      uploadDate: new Date().toISOString().split('T')[0],
      uploadedBy: user?.name || 'Unknown',
      fileSize: `${(uploadData.selectedFile.size / (1024 * 1024)).toFixed(1)} MB`,
      status: 'Pending',
      fileUri: uploadData.selectedFile.uri
    };

    const updatedReports = [newReport, ...reports];
    setReports(updatedReports);
    await saveReports(updatedReports);
    
    setUploadData({
      patientName: '',
      reportType: '',
      selectedFile: null,
    });
    setShowUploadModal(false);
    Alert.alert('Success', 'Report uploaded successfully');
  };

  const handleEditReport = async () => {
    if (!editingReport || !editingReport.patientName || !editingReport.reportType) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const updatedReports = reports.map(r => 
      r.id === editingReport.id ? editingReport : r
    );
    
    setReports(updatedReports);
    await saveReports(updatedReports);
    setShowEditModal(false);
    setEditingReport(null);
    Alert.alert('Success', 'Report updated successfully');
  };

  const handleDeleteReport = async (reportId: string) => {
    Alert.alert(
      'Delete Report',
      'Are you sure you want to delete this report?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updatedReports = reports.filter(r => r.id !== reportId);
            setReports(updatedReports);
            await saveReports(updatedReports);
            Alert.alert('Success', 'Report deleted successfully');
          }
        }
      ]
    );
  };

  const handleStatusChange = async (reportId: string, newStatus: 'Pending' | 'Reviewed' | 'Archived') => {
    const updatedReports = reports.map(r => 
      r.id === reportId ? { ...r, status: newStatus } : r
    );
    setReports(updatedReports);
    await saveReports(updatedReports);
    Alert.alert('Success', `Report status updated to ${newStatus}`);
  };

  const openEditModal = (report: Report) => {
    setEditingReport({ ...report });
    setShowEditModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return '#F57C00';
      case 'Reviewed': return '#2E7D32';
      case 'Archived': return '#666';
      default: return '#666';
    }
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    return extension === 'pdf' ? FileText : FileText;
  };

  const canUpload = user?.role === 'receptionist';
  const canEdit = user?.role === 'receptionist' || user?.role === 'doctor';

  return (
    <View style={styles.container}>
      <Header 
        title="Lab Reports" 
        subtitle={`${filteredReports.length} reports`}
        rightComponent={
          canUpload ? (
            <TouchableOpacity 
              style={styles.uploadButton}
              onPress={() => setShowUploadModal(true)}
            >
              <Upload size={20} color="#fff" />
            </TouchableOpacity>
          ) : null
        }
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filteredReports.map((report) => {
          const FileIcon = getFileIcon(report.fileName);
          return (
            <Card key={report.id} style={styles.reportCard}>
              <View style={styles.reportHeader}>
                <View style={styles.reportInfo}>
                  <View style={styles.fileIcon}>
                    <FileIcon size={24} color="#1976D2" />
                  </View>
                  <View style={styles.reportDetails}>
                    <Text style={styles.reportType}>{report.reportType}</Text>
                    <Text style={styles.patientName}>
                      {user?.role === 'patient' ? `Uploaded by ${report.uploadedBy}` : report.patientName}
                    </Text>
                    <View style={styles.reportMeta}>
                      <Calendar size={12} color="#666" />
                      <Text style={styles.metaText}>{report.uploadDate}</Text>
                      <Text style={styles.metaText}>• {report.fileSize}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.reportActions}>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(report.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(report.status) }]}>
                      {report.status}
                    </Text>
                  </View>
                  <View style={styles.actionButtons}>
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => setSelectedReport(report)}
                    >
                      <Eye size={16} color="#1976D2" />
                    </TouchableOpacity>
                    {canEdit && (
                      <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => openEditModal(report)}
                      >
                        <Edit size={16} color="#666" />
                      </TouchableOpacity>
                    )}
                    {canUpload && (
                      <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => handleDeleteReport(report.id)}
                      >
                        <Trash2 size={16} color="#D32F2F" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
              
              <View style={styles.fileName}>
                <Text style={styles.fileNameText}>{report.fileName}</Text>
              </View>
            </Card>
          );
        })}

        {filteredReports.length === 0 && (
          <View style={styles.emptyState}>
            <FileText size={48} color="#ccc" />
            <Text style={styles.emptyTitle}>No Reports Found</Text>
            <Text style={styles.emptySubtitle}>
              {canUpload ? 'Upload your first lab report to get started' : 'No lab reports available yet'}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Upload Report Modal */}
      <Modal
        visible={showUploadModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Upload Lab Report</Text>
            <TouchableOpacity onPress={() => setShowUploadModal(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <Input
              placeholder="Patient Name *"
              value={uploadData.patientName}
              onChangeText={(text) => setUploadData({...uploadData, patientName: text})}
            />
            
            <Input
              placeholder="Report Type (e.g., Blood Test, X-Ray) *"
              value={uploadData.reportType}
              onChangeText={(text) => setUploadData({...uploadData, reportType: text})}
            />

            <TouchableOpacity style={styles.filePicker} onPress={handleFilePicker}>
              <Upload size={24} color="#1976D2" />
              <View style={styles.filePickerContent}>
                <Text style={styles.filePickerTitle}>
                  {uploadData.selectedFile ? 'File Selected' : 'Select File'}
                </Text>
                <Text style={styles.filePickerSubtitle}>
                  {uploadData.selectedFile 
                    ? uploadData.selectedFile.name 
                    : 'PDF, JPG, PNG files supported'
                  }
                </Text>
              </View>
            </TouchableOpacity>

            <Button
              title="Upload Report"
              onPress={handleUploadReport}
              style={styles.uploadReportButton}
            />
          </ScrollView>
        </View>
      </Modal>

      {/* Edit Report Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        {editingReport && (
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Report</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Text style={styles.cancelButton}>Cancel</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent}>
              <Input
                placeholder="Patient Name *"
                value={editingReport.patientName}
                onChangeText={(text) => setEditingReport({...editingReport, patientName: text})}
              />
              
              <Input
                placeholder="Report Type *"
                value={editingReport.reportType}
                onChangeText={(text) => setEditingReport({...editingReport, reportType: text})}
              />

              <Text style={styles.sectionTitle}>Status</Text>
              <View style={styles.statusButtons}>
                {['Pending', 'Reviewed', 'Archived'].map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.statusButton,
                      editingReport.status === status && styles.activeStatusButton
                    ]}
                    onPress={() => setEditingReport({...editingReport, status: status as any})}
                  >
                    <Text style={[
                      styles.statusButtonText,
                      editingReport.status === status && styles.activeStatusButtonText
                    ]}>
                      {status}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Button
                title="Update Report"
                onPress={handleEditReport}
                style={styles.uploadReportButton}
              />
            </ScrollView>
          </View>
        )}
      </Modal>

      {/* Report Details Modal */}
      <Modal
        visible={!!selectedReport}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        {selectedReport && (
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Report Details</Text>
              <TouchableOpacity onPress={() => setSelectedReport(null)}>
                <Text style={styles.cancelButton}>Close</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent}>
              <Card style={styles.detailsCard}>
                <View style={styles.detailsHeader}>
                  <View style={styles.detailsIcon}>
                    <FileText size={32} color="#1976D2" />
                  </View>
                  <View style={styles.detailsInfo}>
                    <Text style={styles.detailsTitle}>{selectedReport.reportType}</Text>
                    <Text style={styles.detailsSubtitle}>{selectedReport.fileName}</Text>
                  </View>
                </View>

                <View style={styles.detailsGrid}>
                  <View style={styles.detailItem}>
                    <User size={20} color="#666" />
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Patient</Text>
                      <Text style={styles.detailValue}>{selectedReport.patientName}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.detailItem}>
                    <Calendar size={20} color="#666" />
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Upload Date</Text>
                      <Text style={styles.detailValue}>{selectedReport.uploadDate}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.detailItem}>
                    <User size={20} color="#666" />
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Uploaded By</Text>
                      <Text style={styles.detailValue}>{selectedReport.uploadedBy}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.detailItem}>
                    <FileText size={20} color="#666" />
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>File Size</Text>
                      <Text style={styles.detailValue}>{selectedReport.fileSize}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.statusContainer}>
                  <Text style={styles.statusLabel}>Status</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedReport.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(selectedReport.status) }]}>
                      {selectedReport.status}
                    </Text>
                  </View>
                </View>
              </Card>

              {canEdit && (
                <View style={styles.statusUpdateSection}>
                  <Text style={styles.sectionTitle}>Update Status</Text>
                  <View style={styles.statusButtons}>
                    {['Pending', 'Reviewed', 'Archived'].map((status) => (
                      <TouchableOpacity
                        key={status}
                        style={[
                          styles.statusButton,
                          selectedReport.status === status && styles.activeStatusButton
                        ]}
                        onPress={() => handleStatusChange(selectedReport.id, status as any)}
                      >
                        <Text style={[
                          styles.statusButtonText,
                          selectedReport.status === status && styles.activeStatusButtonText
                        ]}>
                          {status}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              <Button
                title="Download Report"
                onPress={() => Alert.alert('Download', 'Download functionality would open the file or save it to device')}
                style={styles.downloadButton}
              />
            </ScrollView>
          </View>
        )}
      </Modal>
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
  uploadButton: {
    backgroundColor: '#1976D2',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reportCard: {
    marginBottom: 12,
    padding: 16,
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
    backgroundColor: '#E3F2FD',
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
    marginBottom: 4,
  },
  patientName: {
    fontSize: 14,
    fontFamily: 'Roboto-Regular',
    color: '#666',
    marginBottom: 6,
  },
  reportMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    fontFamily: 'Roboto-Regular',
    color: '#666',
    marginLeft: 6,
  },
  reportActions: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 10,
    fontFamily: 'Roboto-Medium',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 6,
    marginLeft: 4,
  },
  fileName: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginTop: 8,
  },
  fileNameText: {
    fontSize: 12,
    fontFamily: 'Roboto-Regular',
    color: '#666',
  },
  emptyState: {
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
    paddingHorizontal: 32,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Roboto-Bold',
    color: '#1a1a1a',
  },
  cancelButton: {
    fontSize: 16,
    fontFamily: 'Roboto-Medium',
    color: '#1976D2',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  filePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1976D2',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  filePickerContent: {
    marginLeft: 16,
    flex: 1,
  },
  filePickerTitle: {
    fontSize: 16,
    fontFamily: 'Roboto-Medium',
    color: '#1976D2',
    marginBottom: 4,
  },
  filePickerSubtitle: {
    fontSize: 12,
    fontFamily: 'Roboto-Regular',
    color: '#666',
  },
  uploadReportButton: {
    marginTop: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
    color: '#1a1a1a',
    marginBottom: 12,
    marginTop: 8,
  },
  statusButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statusButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginHorizontal: 4,
    alignItems: 'center',
  },
  activeStatusButton: {
    backgroundColor: '#1976D2',
    borderColor: '#1976D2',
  },
  statusButtonText: {
    fontSize: 14,
    fontFamily: 'Roboto-Medium',
    color: '#666',
  },
  activeStatusButtonText: {
    color: '#fff',
  },
  detailsCard: {
    marginBottom: 24,
  },
  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  detailsIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  detailsInfo: {
    flex: 1,
  },
  detailsTitle: {
    fontSize: 20,
    fontFamily: 'Roboto-Bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  detailsSubtitle: {
    fontSize: 14,
    fontFamily: 'Roboto-Regular',
    color: '#666',
  },
  detailsGrid: {
    marginBottom: 24,
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
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 14,
    fontFamily: 'Roboto-Medium',
    color: '#1a1a1a',
  },
  statusUpdateSection: {
    marginBottom: 24,
  },
  downloadButton: {
    marginBottom: 32,
  },
});