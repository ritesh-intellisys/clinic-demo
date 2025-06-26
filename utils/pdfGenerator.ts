import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import {
    HospitalBill,
    MedicineBill,
    Patient,
    Prescription,
    Report,
} from './storage';

interface PatientPDFData {
  patient: Patient;
  prescriptions: Prescription[];
  reports: Report[];
  medicineBills: MedicineBill[];
  hospitalBills: HospitalBill[];
}

export const generatePatientPDF = async (data: PatientPDFData, type: 'full' | 'current' | 'visit' = 'full') => {
  try {
    const htmlContent = generateHTMLContent(data, type);
    
    const { uri } = await Print.printToFileAsync({
      html: htmlContent,
      base64: false,
    });

    const fileName = `patient_${data.patient.name.replace(/\s+/g, '_')}_${type}_${new Date().toISOString().split('T')[0]}.pdf`;
    const newUri = FileSystem.documentDirectory + fileName;
    
    await FileSystem.moveAsync({
      from: uri,
      to: newUri,
    });

    return newUri;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

export const sharePDF = async (fileUri: string) => {
  try {
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Share Patient Report',
      });
    }
  } catch (error) {
    console.error('Error sharing PDF:', error);
    throw error;
  }
};

const generateHTMLContent = (data: PatientPDFData, type: 'full' | 'current' | 'visit'): string => {
  const { patient, prescriptions, reports, medicineBills, hospitalBills } = data;
  
  const currentDate = new Date().toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Patient Report - ${patient.name}</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          margin: 0;
          padding: 20px;
          background-color: #f8f9fa;
          color: #333;
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          border-bottom: 3px solid #3B82F6;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .clinic-name {
          font-size: 28px;
          font-weight: bold;
          color: #3B82F6;
          margin-bottom: 5px;
        }
        .report-title {
          font-size: 20px;
          color: #666;
          margin-bottom: 10px;
        }
        .report-date {
          font-size: 14px;
          color: #999;
        }
        .patient-info {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 30px;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 8px;
        }
        .info-group {
          margin-bottom: 15px;
        }
        .info-label {
          font-weight: bold;
          color: #3B82F6;
          font-size: 14px;
          margin-bottom: 5px;
        }
        .info-value {
          font-size: 16px;
          color: #333;
        }
        .section {
          margin-bottom: 30px;
        }
        .section-title {
          font-size: 20px;
          font-weight: bold;
          color: #333;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 10px;
          margin-bottom: 20px;
        }
        .prescription-item {
          background: #f9fafb;
          padding: 15px;
          margin-bottom: 15px;
          border-radius: 8px;
          border-left: 4px solid #3B82F6;
        }
        .prescription-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }
        .prescription-date {
          font-weight: bold;
          color: #333;
        }
        .prescription-status {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
          color: white;
        }
        .status-active { background-color: #10B981; }
        .status-completed { background-color: #6B7280; }
        .status-expired { background-color: #EF4444; }
        .medication-list {
          margin: 10px 0;
        }
        .medication-item {
          background: white;
          padding: 10px;
          margin: 5px 0;
          border-radius: 5px;
          border: 1px solid #e5e7eb;
        }
        .medication-name {
          font-weight: bold;
          color: #333;
        }
        .medication-details {
          color: #666;
          font-size: 14px;
          margin-top: 5px;
        }
        .report-item {
          background: #f9fafb;
          padding: 15px;
          margin-bottom: 10px;
          border-radius: 8px;
          border-left: 4px solid #10B981;
        }
        .report-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }
        .report-type {
          font-weight: bold;
          color: #333;
        }
        .report-status {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
          color: white;
        }
        .status-pending { background-color: #F59E0B; }
        .status-reviewed { background-color: #10B981; }
        .status-archived { background-color: #6B7280; }
        .bill-item {
          background: #f9fafb;
          padding: 15px;
          margin-bottom: 10px;
          border-radius: 8px;
          border-left: 4px solid #F59E0B;
        }
        .bill-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }
        .bill-date {
          font-weight: bold;
          color: #333;
        }
        .bill-amount {
          font-weight: bold;
          color: #3B82F6;
          font-size: 18px;
        }
        .bill-status {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
          color: white;
        }
        .status-paid { background-color: #10B981; }
        .status-pending { background-color: #F59E0B; }
        .status-overdue { background-color: #EF4444; }
        .service-list {
          margin: 10px 0;
        }
        .service-item {
          display: flex;
          justify-content: space-between;
          padding: 5px 0;
          border-bottom: 1px solid #e5e7eb;
        }
        .service-name {
          color: #333;
        }
        .service-amount {
          color: #666;
          font-weight: bold;
        }
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          color: #666;
          font-size: 12px;
        }
        .emergency-contact {
          background: #fef2f2;
          border: 1px solid #fecaca;
          padding: 10px;
          border-radius: 5px;
          margin-top: 10px;
        }
        .emergency-label {
          color: #dc2626;
          font-weight: bold;
          font-size: 12px;
        }
        .emergency-value {
          color: #dc2626;
          font-size: 14px;
        }
        .allergies {
          background: #fffbeb;
          border: 1px solid #fed7aa;
          padding: 10px;
          border-radius: 5px;
          margin-top: 10px;
        }
        .allergies-label {
          color: #d97706;
          font-weight: bold;
          font-size: 12px;
        }
        .allergies-value {
          color: #d97706;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="clinic-name">City Clinic & Hospital</div>
          <div class="report-title">Patient Medical Report</div>
          <div class="report-date">Generated on: ${currentDate}</div>
        </div>

        <div class="patient-info">
          <div class="info-group">
            <div class="info-label">Patient Name</div>
            <div class="info-value">${patient.name}</div>
          </div>
          <div class="info-group">
            <div class="info-label">Age & Gender</div>
            <div class="info-value">${patient.age} years, ${patient.gender}</div>
          </div>
          <div class="info-group">
            <div class="info-label">Phone Number</div>
            <div class="info-value">${patient.phone}</div>
          </div>
          <div class="info-group">
            <div class="info-label">Email Address</div>
            <div class="info-value">${patient.email}</div>
          </div>
          <div class="info-group">
            <div class="info-label">Blood Group</div>
            <div class="info-value">${patient.bloodGroup || 'Not specified'}</div>
          </div>
          <div class="info-group">
            <div class="info-label">Last Visit</div>
            <div class="info-value">${formatDate(patient.lastVisit)}</div>
          </div>
          <div class="info-group" style="grid-column: 1 / -1;">
            <div class="info-label">Address</div>
            <div class="info-value">${patient.address}</div>
          </div>
          ${patient.emergencyContact ? `
            <div class="info-group" style="grid-column: 1 / -1;">
              <div class="emergency-contact">
                <div class="emergency-label">Emergency Contact</div>
                <div class="emergency-value">${patient.emergencyContact}</div>
              </div>
            </div>
          ` : ''}
          ${patient.allergies && patient.allergies.length > 0 ? `
            <div class="info-group" style="grid-column: 1 / -1;">
              <div class="allergies">
                <div class="allergies-label">Allergies</div>
                <div class="allergies-value">${patient.allergies.join(', ')}</div>
              </div>
            </div>
          ` : ''}
        </div>

        ${type !== 'visit' ? `
          <div class="section">
            <div class="section-title">Medical History</div>
            ${prescriptions.length > 0 ? prescriptions.map(prescription => `
              <div class="prescription-item">
                <div class="prescription-header">
                  <div class="prescription-date">${formatDate(prescription.date)}</div>
                  <div class="prescription-status status-${prescription.status.toLowerCase()}">${prescription.status}</div>
                </div>
                <div style="margin-bottom: 10px;">
                  <strong>Doctor:</strong> ${prescription.doctorName}
                </div>
                <div class="medication-list">
                  ${prescription.medications.map(med => `
                    <div class="medication-item">
                      <div class="medication-name">${med.name}</div>
                      <div class="medication-details">
                        Dosage: ${med.dosage} | Frequency: ${med.frequency} | Duration: ${med.duration}
                      </div>
                    </div>
                  `).join('')}
                </div>
                ${prescription.notes ? `
                  <div style="margin-top: 10px; padding: 10px; background: white; border-radius: 5px;">
                    <strong>Notes:</strong> ${prescription.notes}
                  </div>
                ` : ''}
              </div>
            `).join('') : '<p style="color: #666; font-style: italic;">No prescriptions found</p>'}
          </div>
        ` : ''}

        ${type !== 'visit' ? `
          <div class="section">
            <div class="section-title">Medical Reports</div>
            ${reports.length > 0 ? reports.map(report => `
              <div class="report-item">
                <div class="report-header">
                  <div class="report-type">${report.reportType}</div>
                  <div class="report-status status-${report.status.toLowerCase()}">${report.status}</div>
                </div>
                <div style="margin-bottom: 5px;">
                  <strong>File:</strong> ${report.fileName}
                </div>
                <div style="margin-bottom: 5px;">
                  <strong>Uploaded:</strong> ${formatDate(report.uploadDate)} by ${report.uploadedBy}
                </div>
                <div>
                  <strong>Size:</strong> ${report.fileSize}
                </div>
              </div>
            `).join('') : '<p style="color: #666; font-style: italic;">No reports found</p>'}
          </div>
        ` : ''}

        <div class="section">
          <div class="section-title">Billing History</div>
          ${medicineBills.length > 0 || hospitalBills.length > 0 ? `
            ${medicineBills.map(bill => `
              <div class="bill-item">
                <div class="bill-header">
                  <div class="bill-date">${formatDate(bill.date)} - Medicine Bill</div>
                  <div class="bill-amount">${formatCurrency(bill.totalAmount)}</div>
                </div>
                <div class="bill-status status-${bill.status.toLowerCase()}">${bill.status}</div>
                <div style="margin-top: 10px;">
                  <strong>Pharmacy:</strong> ${bill.pharmacyName}
                </div>
                <div class="service-list">
                  ${bill.medicines.map(med => `
                    <div class="service-item">
                      <div class="service-name">${med.name} (${med.quantity} units)</div>
                      <div class="service-amount">${formatCurrency(med.total)}</div>
                    </div>
                  `).join('')}
                </div>
              </div>
            `).join('')}
            ${hospitalBills.map(bill => `
              <div class="bill-item">
                <div class="bill-header">
                  <div class="bill-date">${formatDate(bill.date)} - Hospital Bill</div>
                  <div class="bill-amount">${formatCurrency(bill.totalAmount)}</div>
                </div>
                <div class="bill-status status-${bill.status.toLowerCase()}">${bill.status}</div>
                ${bill.admissionDate ? `
                  <div style="margin-top: 10px;">
                    <strong>Admission:</strong> ${formatDate(bill.admissionDate)}
                    ${bill.dischargeDate ? ` | <strong>Discharge:</strong> ${formatDate(bill.dischargeDate)}` : ''}
                  </div>
                ` : ''}
                <div class="service-list">
                  ${bill.services.map(service => `
                    <div class="service-item">
                      <div class="service-name">${service.type}: ${service.description}</div>
                      <div class="service-amount">${formatCurrency(service.amount)}</div>
                    </div>
                  `).join('')}
                  <div class="service-item" style="border-top: 2px solid #e5e7eb; margin-top: 10px; padding-top: 10px;">
                    <div class="service-name"><strong>Doctor Fees</strong></div>
                    <div class="service-amount"><strong>${formatCurrency(bill.doctorFees)}</strong></div>
                  </div>
                </div>
              </div>
            `).join('')}
          ` : '<p style="color: #666; font-style: italic;">No bills found</p>'}
        </div>

        <div class="footer">
          <p>This report was generated electronically by City Clinic & Hospital</p>
          <p>For any queries, please contact: +91 98765 43210 | info@cityclinic.com</p>
          <p>Report Type: ${type.charAt(0).toUpperCase() + type.slice(1)} Report</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export interface PatientReportData {
  patient: Patient;
  prescriptions: Prescription[];
  reports: Report[];
  medicineBills: MedicineBill[];
  hospitalBills: HospitalBill[];
}

export const generatePatientReportHTML = (data: PatientReportData, reportType: 'full' | 'current' | 'visit' = 'full'): string => {
  const { patient, prescriptions, reports, medicineBills, hospitalBills } = data;
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const generatePrescriptionsHTML = () => {
    if (prescriptions.length === 0) return '<p><em>No prescriptions found</em></p>';
    
    return prescriptions.map(prescription => `
      <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
        <h4 style="margin: 0 0 8px 0; color: #1f2937;">Date: ${formatDate(prescription.date)}</h4>
        <p style="margin: 0 0 8px 0; color: #6b7280;">Doctor: ${prescription.doctorName}</p>
        <p style="margin: 0 0 8px 0; color: #6b7280;">Status: <span style="color: ${prescription.status === 'Active' ? '#10b981' : '#6b7280'}">${prescription.status}</span></p>
        <div style="margin: 8px 0;">
          <strong>Medications:</strong>
          <ul style="margin: 8px 0; padding-left: 20px;">
            ${prescription.medications.map(med => `
              <li>${med.name} - ${med.dosage} (${med.frequency}) for ${med.duration}</li>
            `).join('')}
          </ul>
        </div>
        <p style="margin: 8px 0; color: #374151;"><strong>Notes:</strong> ${prescription.notes}</p>
      </div>
    `).join('');
  };

  const generateReportsHTML = () => {
    if (reports.length === 0) return '<p><em>No reports found</em></p>';
    
    return reports.map(report => `
      <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
        <h4 style="margin: 0 0 8px 0; color: #1f2937;">${report.reportType}</h4>
        <p style="margin: 0 0 4px 0; color: #6b7280;">File: ${report.fileName}</p>
        <p style="margin: 0 0 4px 0; color: #6b7280;">Upload Date: ${formatDate(report.uploadDate)}</p>
        <p style="margin: 0 0 4px 0; color: #6b7280;">Status: <span style="color: ${report.status === 'Reviewed' ? '#10b981' : '#f59e0b'}">${report.status}</span></p>
      </div>
    `).join('');
  };

  const generateBillsHTML = () => {
    const allBills = [...medicineBills, ...hospitalBills];
    if (allBills.length === 0) return '<p><em>No bills found</em></p>';
    
    return allBills.map(bill => `
      <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
        <h4 style="margin: 0 0 8px 0; color: #1f2937;">${'pharmacyName' in bill ? 'Medicine Bill' : 'Hospital Bill'}</h4>
        <p style="margin: 0 0 4px 0; color: #6b7280;">Date: ${formatDate(bill.date)}</p>
        <p style="margin: 0 0 4px 0; color: #6b7280;">Total Amount: <strong>${formatCurrency(bill.totalAmount)}</strong></p>
        <p style="margin: 0 0 4px 0; color: #6b7280;">Status: <span style="color: ${bill.status === 'Paid' ? '#10b981' : bill.status === 'Pending' ? '#f59e0b' : '#ef4444'}">${bill.status}</span></p>
        ${'pharmacyName' in bill ? `<p style="margin: 0 0 4px 0; color: #6b7280;">Pharmacy: ${bill.pharmacyName}</p>` : ''}
      </div>
    `).join('');
  };

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Patient Report - ${patient.name}</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #1f2937;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          background-color: #ffffff;
        }
        .header {
          text-align: center;
          border-bottom: 3px solid #3b82f6;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .clinic-name {
          font-size: 24px;
          font-weight: bold;
          color: #3b82f6;
          margin-bottom: 8px;
        }
        .report-title {
          font-size: 20px;
          color: #1f2937;
          margin-bottom: 8px;
        }
        .report-date {
          color: #6b7280;
          font-size: 14px;
        }
        .patient-info {
          background-color: #f8fafc;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 30px;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .info-item {
          margin-bottom: 8px;
        }
        .info-label {
          font-weight: bold;
          color: #374151;
        }
        .info-value {
          color: #1f2937;
        }
        .section {
          margin-bottom: 30px;
        }
        .section-title {
          font-size: 18px;
          font-weight: bold;
          color: #1f2937;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 8px;
          margin-bottom: 16px;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 20px;
        }
        .stat-card {
          background-color: #f8fafc;
          border-radius: 8px;
          padding: 16px;
          text-align: center;
        }
        .stat-number {
          font-size: 24px;
          font-weight: bold;
          color: #3b82f6;
        }
        .stat-label {
          font-size: 12px;
          color: #6b7280;
          margin-top: 4px;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          color: #6b7280;
          font-size: 12px;
        }
        @media print {
          body { margin: 0; }
          .header { border-bottom-color: #000; }
          .section-title { border-bottom-color: #000; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="clinic-name">City Clinic & Hospital</div>
        <div class="report-title">Patient Medical Report</div>
        <div class="report-date">Generated on ${formatDate(new Date().toISOString())}</div>
      </div>

      <div class="patient-info">
        <h3 style="margin: 0 0 16px 0; color: #1f2937;">Patient Information</h3>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">Name:</span>
            <span class="info-value">${patient.name}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Age:</span>
            <span class="info-value">${patient.age} years</span>
          </div>
          <div class="info-item">
            <span class="info-label">Gender:</span>
            <span class="info-value">${patient.gender}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Blood Group:</span>
            <span class="info-value">${patient.bloodGroup || 'N/A'}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Phone:</span>
            <span class="info-value">${patient.phone}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Email:</span>
            <span class="info-value">${patient.email}</span>
          </div>
          <div class="info-item" style="grid-column: 1 / -1;">
            <span class="info-label">Address:</span>
            <span class="info-value">${patient.address}</span>
          </div>
          ${patient.emergencyContact ? `
            <div class="info-item">
              <span class="info-label">Emergency Contact:</span>
              <span class="info-value">${patient.emergencyContact}</span>
            </div>
          ` : ''}
          ${patient.allergies && patient.allergies.length > 0 ? `
            <div class="info-item">
              <span class="info-label">Allergies:</span>
              <span class="info-value">${patient.allergies.join(', ')}</span>
            </div>
          ` : ''}
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-number">${prescriptions.length}</div>
          <div class="stat-label">Prescriptions</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${reports.length}</div>
          <div class="stat-label">Reports</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${medicineBills.length + hospitalBills.length}</div>
          <div class="stat-label">Bills</div>
        </div>
      </div>

      <div class="section">
        <h3 class="section-title">Medical History</h3>
        <p><strong>Current Condition:</strong> ${patient.condition}</p>
        <p><strong>Last Visit:</strong> ${formatDate(patient.lastVisit)}</p>
        <p><strong>Registration Date:</strong> ${patient.createdAt ? formatDate(patient.createdAt) : 'N/A'}</p>
      </div>

      <div class="section">
        <h3 class="section-title">Prescriptions</h3>
        ${generatePrescriptionsHTML()}
      </div>

      <div class="section">
        <h3 class="section-title">Medical Reports</h3>
        ${generateReportsHTML()}
      </div>

      <div class="section">
        <h3 class="section-title">Billing History</h3>
        ${generateBillsHTML()}
      </div>

      <div class="footer">
        <p>This report was generated electronically by City Clinic & Hospital</p>
        <p>For any queries, please contact: +91 98765 43210 | info@cityclinic.com</p>
        <p>Report Type: ${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report</p>
      </div>
    </body>
    </html>
  `;

  return html;
};

export const generateAndSharePDF = async (data: PatientReportData, reportType: 'full' | 'current' | 'visit' = 'full'): Promise<void> => {
  try {
    const html = generatePatientReportHTML(data, reportType);
    
    const { uri } = await Print.printToFileAsync({
      html,
      base64: false
    });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: `Patient Report - ${data.patient.name}`,
        UTI: 'com.adobe.pdf'
      });
    }
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF report');
  }
}; 