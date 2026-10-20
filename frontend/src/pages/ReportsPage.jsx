import React, { useState, useEffect } from 'react';
import { hostelService } from '../services/hostelService';
import { Printer, FileSpreadsheet } from 'lucide-react';

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('occupancy');
  const [summaryData, setSummaryData] = useState(null);

  useEffect(() => {
    hostelService.getDashboardSummary()
      .then(setSummaryData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleExportCSV = (reportType) => {
    window.open(hostelService.getReportExportUrl(reportType), '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  const metrics = summaryData?.metrics || {};

  return (
    <div className="page-wrapper">
      <div className="page-header-row no-print">
        <div>
          <h1 className="page-title">Reports, Analytics & Auditing</h1>
          <p className="page-subtitle">Generate official hostel management reports, export CSV data, and analyze campus operations</p>
        </div>
        <div className="report-header-actions">
          <button onClick={handlePrint} className="btn-secondary-action">
            <Printer size={16} />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* CSV Export Quick Action Cards */}
      <div className="csv-export-strip no-print">
        <span className="strip-title">One-Click CSV Data Exports:</span>
        <button onClick={() => handleExportCSV('students')} className="btn-csv-export">
          <FileSpreadsheet size={15} />
          <span>Student Roster (.csv)</span>
        </button>
        <button onClick={() => handleExportCSV('rooms')} className="btn-csv-export">
          <FileSpreadsheet size={15} />
          <span>Room Occupancy (.csv)</span>
        </button>
        <button onClick={() => handleExportCSV('fees')} className="btn-csv-export">
          <FileSpreadsheet size={15} />
          <span>Fee Collections (.csv)</span>
        </button>
        <button onClick={() => handleExportCSV('complaints')} className="btn-csv-export">
          <FileSpreadsheet size={15} />
          <span>Complaints Ledger (.csv)</span>
        </button>
        <button onClick={() => handleExportCSV('employees')} className="btn-csv-export">
          <FileSpreadsheet size={15} />
          <span>Staff Payroll (.csv)</span>
        </button>
      </div>

      {/* Report Categories Tabs */}
      <div className="table-controls-bar no-print">
        <div className="segment-filter-tabs">
          <button
            className={`filter-tab ${activeTab === 'occupancy' ? 'active' : ''}`}
            onClick={() => setActiveTab('occupancy')}
          >
            Room & Bed Occupancy
          </button>
          <button
            className={`filter-tab ${activeTab === 'financial' ? 'active' : ''}`}
            onClick={() => setActiveTab('financial')}
          >
            Financial & Fee Audit
          </button>
          <button
            className={`filter-tab ${activeTab === 'attendance' ? 'active' : ''}`}
            onClick={() => setActiveTab('attendance')}
          >
            Daily Attendance Summary
          </button>
          <button
            className={`filter-tab ${activeTab === 'maintenance' ? 'active' : ''}`}
            onClick={() => setActiveTab('maintenance')}
          >
            Facility Maintenance Log
          </button>
        </div>
      </div>

      {/* Printable Report Document Body */}
      <div className="report-printable-sheet">
        <div className="report-doc-header">
          <h2>HOSTEL MANAGEMENT SYSTEM — OFFICIAL AUDIT REPORT</h2>
          <p>Generated on {new Date().toLocaleString()} | Campus Housing Directorate</p>
        </div>

        {activeTab === 'occupancy' && (
          <div className="report-content-section">
            <h3>1. Hostel Room & Bed Occupancy Summary</h3>
            <div className="report-stats-grid">
              <div className="r-stat-box">
                <span>Total Capacity</span>
                <strong>{metrics.total_beds || 22} Beds</strong>
              </div>
              <div className="r-stat-box">
                <span>Occupied Beds</span>
                <strong className="text-blue-600">{metrics.occupied_beds || 7} Beds</strong>
              </div>
              <div className="r-stat-box">
                <span>Available Beds</span>
                <strong className="text-green-600">{metrics.vacant_beds || 15} Beds</strong>
              </div>
              <div className="r-stat-box">
                <span>Occupancy Rate</span>
                <strong>{metrics.occupancy_rate || 31.8}%</strong>
              </div>
            </div>

            <h4 className="mt-6 mb-2">Block-wise Bed Distribution</h4>
            <table className="glass-table report-table">
              <thead>
                <tr>
                  <th>Hostel Block</th>
                  <th>Total Beds</th>
                  <th>Occupied Beds</th>
                  <th>Vacant Beds</th>
                  <th>Occupancy Rate</th>
                </tr>
              </thead>
              <tbody>
                {summaryData?.blocks_occupancy?.map((b, idx) => {
                  const pct = b.total_beds > 0 ? Math.round((b.occupied_beds / b.total_beds) * 100) : 0;
                  return (
                    <tr key={idx}>
                      <td><strong>{b.block}</strong></td>
                      <td>{b.total_beds}</td>
                      <td>{b.occupied_beds}</td>
                      <td>{b.vacant_beds}</td>
                      <td>{pct}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'financial' && (
          <div className="report-content-section">
            <h3>2. Financial & Fee Collection Audit</h3>
            <div className="report-stats-grid">
              <div className="r-stat-box">
                <span>Total Invoiced</span>
                <strong>₹ {Number(metrics.total_billed || 432000).toLocaleString('en-IN')}</strong>
              </div>
              <div className="r-stat-box">
                <span>Total Collected</span>
                <strong className="text-green-600">₹ {Number(metrics.total_collected || 146000).toLocaleString('en-IN')}</strong>
              </div>
              <div className="r-stat-box">
                <span>Outstanding Dues</span>
                <strong className="text-red-500">₹ {Number(metrics.total_pending || 286000).toLocaleString('en-IN')}</strong>
              </div>
              <div className="r-stat-box">
                <span>Recovery Ratio</span>
                <strong>
                  {metrics.total_billed > 0
                    ? Math.round((metrics.total_collected / metrics.total_billed) * 100)
                    : 33.8}%
                </strong>
              </div>
            </div>

            <h4 className="mt-6 mb-2">Recent Payment Audits</h4>
            <table className="glass-table report-table">
              <thead>
                <tr>
                  <th>Receipt No</th>
                  <th>Student Name</th>
                  <th>Student ID</th>
                  <th>Amount Paid</th>
                  <th>Payment Date</th>
                  <th>Payment Method</th>
                  <th>Recorded By</th>
                </tr>
              </thead>
              <tbody>
                {summaryData?.recent_payments?.map((p) => (
                  <tr key={p.id}>
                    <td><code>{p.receipt_number}</code></td>
                    <td>{p.student_name}</td>
                    <td>{p.student_code}</td>
                    <td>₹ {Number(p.amount_paid).toLocaleString('en-IN')}</td>
                    <td>{p.payment_date}</td>
                    <td className="capitalize">{p.payment_method?.replace('_', ' ')}</td>
                    <td>{p.recorded_by}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'attendance' && (
          <div className="report-content-section">
            <h3>3. Attendance Summary & Resident Roll Call</h3>
            <div className="report-stats-grid">
              <div className="r-stat-box">
                <span>Date</span>
                <strong>{metrics.attendance_today?.date || 'Today'}</strong>
              </div>
              <div className="r-stat-box">
                <span>Present</span>
                <strong className="text-green-600">{metrics.attendance_today?.present || 7} Residents</strong>
              </div>
              <div className="r-stat-box">
                <span>Absent</span>
                <strong className="text-red-500">{metrics.attendance_today?.absent || 1} Residents</strong>
              </div>
              <div className="r-stat-box">
                <span>On Approved Leave</span>
                <strong className="text-amber-500">{metrics.attendance_today?.leave || 1} Residents</strong>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'maintenance' && (
          <div className="report-content-section">
            <h3>4. Maintenance Tickets & Facilities Resolution Log</h3>
            <div className="report-stats-grid">
              <div className="r-stat-box">
                <span>Open Complaints</span>
                <strong className="text-amber-500">{metrics.open_complaints || 4} Tickets</strong>
              </div>
              <div className="r-stat-box">
                <span>Resolution Target</span>
                <strong className="text-green-600">&lt; 24 Hours</strong>
              </div>
            </div>

            <h4 className="mt-6 mb-2">Pending Facility Issues</h4>
            <table className="glass-table report-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Room</th>
                  <th>Resident</th>
                  <th>Priority</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {summaryData?.pending_complaints?.map((c) => (
                  <tr key={c.id}>
                    <td>{c.title}</td>
                    <td className="capitalize">{c.category}</td>
                    <td>Room {c.room_number || 'N/A'}</td>
                    <td>{c.student_name}</td>
                    <td><span className={`badge-priority ${c.priority}`}>{c.priority}</span></td>
                    <td>{c.submission_date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
