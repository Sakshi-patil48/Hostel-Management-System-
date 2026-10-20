import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { hostelService } from '../services/hostelService';
import {
  UserPlus, CheckCircle2, AlertCircle, KeyRound, Users
} from 'lucide-react';

export default function NewStudent() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    student_id: `HST-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
    full_name: '',
    email: '',
    phone: '',
    guardian_name: '',
    guardian_phone: '',
    address: '',
    course: 'B.Tech Computer Science',
    year_of_study: '1st Year',
    admission_date: new Date().toISOString().split('T')[0],
    status: 'active',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdStudent, setCreatedStudent] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Frontend validation
    if (!formData.student_id.trim()) {
      setError('Student ID is required.');
      return;
    }
    if (!formData.full_name.trim()) {
      setError('Student full name is required.');
      return;
    }
    if (!formData.email.trim()) {
      setError('Student email address is required.');
      return;
    }
    if (!formData.phone.trim()) {
      setError('Student contact phone number is required.');
      return;
    }

    setLoading(true);
    try {
      const student = await hostelService.createStudent(formData);
      setCreatedStudent(student);
    } catch (err) {
      setError(err.message || 'Failed to register student. Please ensure Student ID and Email are unique.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCreatedStudent(null);
    setFormData({
      student_id: `HST-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      full_name: '',
      email: '',
      phone: '',
      guardian_name: '',
      guardian_phone: '',
      address: '',
      course: 'B.Tech Computer Science',
      year_of_study: '1st Year',
      admission_date: new Date().toISOString().split('T')[0],
      status: 'active',
    });
  };

  return (
    <div className="page-wrapper form-page-container">
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Register New Student</h1>
          <p className="page-subtitle">Add a new resident student profile into the hostel database</p>
        </div>
        <button onClick={() => navigate('/dashboard/students')} className="btn-secondary-action">
          <Users size={16} />
          <span>Manage Students</span>
        </button>
      </div>

      {createdStudent ? (
        <div className="success-glass-card animate-mount">
          <div className="success-icon-badge">
            <CheckCircle2 size={36} className="text-green-500" />
          </div>
          <h2>Student Successfully Registered!</h2>
          <p className="success-details-txt">
            <strong>{createdStudent.full_name}</strong> (ID: <code>{createdStudent.student_id}</code>) has been added to the database.
          </p>

          <div className="success-actions-row">
            <button
              onClick={() => navigate('/dashboard/allocation')}
              className="btn-primary-action"
            >
              <KeyRound size={16} />
              <span>Allocate Bed Now</span>
            </button>
            <button
              onClick={resetForm}
              className="btn-secondary-action"
            >
              <UserPlus size={16} />
              <span>Register Another Student</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="glass-form-card">
          {error && (
            <div className="form-error-banner">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="student-registration-form">
            <h3 className="form-section-title">1. Personal & Academic Credentials</h3>
            
            <div className="form-row-3">
              <div className="form-group-field">
                <label>Student ID (Unique) *</label>
                <input
                  type="text"
                  required
                  value={formData.student_id}
                  onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                  placeholder="e.g. HST-2026-101"
                />
              </div>

              <div className="form-group-field">
                <label>Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="e.g. Aarav Sharma"
                />
              </div>

              <div className="form-group-field">
                <label>Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="student@college.edu"
                />
              </div>
            </div>

            <div className="form-row-3">
              <div className="form-group-field">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. 9876543210"
                />
              </div>

              <div className="form-group-field">
                <label>Course / Program</label>
                <select
                  value={formData.course}
                  onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                >
                  <option value="B.Tech Computer Science">B.Tech Computer Science</option>
                  <option value="B.Tech Information Tech">B.Tech Information Tech</option>
                  <option value="B.Tech AI & Data Science">B.Tech AI & Data Science</option>
                  <option value="B.Tech Mechanical Engg">B.Tech Mechanical Engg</option>
                  <option value="B.Tech Civil Engg">B.Tech Civil Engg</option>
                  <option value="B.Tech Electrical">B.Tech Electrical</option>
                  <option value="MCA Software Engg">MCA Software Engg</option>
                  <option value="Ph.D. Research">Ph.D. Research</option>
                </select>
              </div>

              <div className="form-group-field">
                <label>Year of Study</label>
                <select
                  value={formData.year_of_study}
                  onChange={(e) => setFormData({ ...formData, year_of_study: e.target.value })}
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                  <option value="Research Scholar">Research Scholar</option>
                </select>
              </div>
            </div>

            <h3 className="form-section-title mt-6">2. Guardian & Contact Details</h3>

            <div className="form-row-2">
              <div className="form-group-field">
                <label>Parent / Guardian Name *</label>
                <input
                  type="text"
                  required
                  value={formData.guardian_name}
                  onChange={(e) => setFormData({ ...formData, guardian_name: e.target.value })}
                  placeholder="Guardian's Name"
                />
              </div>

              <div className="form-group-field">
                <label>Guardian Emergency Phone *</label>
                <input
                  type="tel"
                  required
                  value={formData.guardian_phone}
                  onChange={(e) => setFormData({ ...formData, guardian_phone: e.target.value })}
                  placeholder="Guardian Contact"
                />
              </div>
            </div>

            <div className="form-group-field">
              <label>Permanent Home Address</label>
              <textarea
                rows="2"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Residential address..."
              />
            </div>

            <div className="form-row-2">
              <div className="form-group-field">
                <label>Admission Date</label>
                <input
                  type="date"
                  value={formData.admission_date}
                  onChange={(e) => setFormData({ ...formData, admission_date: e.target.value })}
                />
              </div>

              <div className="form-group-field">
                <label>Initial Resident Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="active">Living in Hostel</option>
                  <option value="leaved">Leaved / Inactive</option>
                </select>
              </div>
            </div>

            <div className="form-submit-row">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary-action btn-lg"
              >
                {loading ? 'Registering Student...' : 'Register Student'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
