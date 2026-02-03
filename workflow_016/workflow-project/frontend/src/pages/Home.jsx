import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import NotificationBell from '../components/NotificationBell';
import styles from './Home.module.css';

export default function Home() {
  const [user, setUser] = useState(null);
  const [allowedForms, setAllowedForms] = useState([]);
  const [submittedForms, setSubmittedForms] = useState([]);
  const navigate = useNavigate();

  const allForms = [
    { route: 'contract-manager---drafts-contract-with-vendor-name,-contract-type,-v...', name: 'Contract Manager   Drafts Contract With Vendor Name, Contract Type, V...', description: 'Form for creating and managing draft contracts with vendors, specifying contract type and other deta...', role: 'Contract_Manager' }
  ];

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchAllowedForms(parsedUser.role);
      fetchMySubmissions();
    }
  }, []);

  useEffect(() => {
    const handleFocus = () => {
      console.log('🔄 Window focused - refreshing submissions');
      fetchMySubmissions();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const fetchAllowedForms = async (role) => {
    try {
      const token = localStorage.getItem('token');
      const api = axios.create({
        baseURL: '/api',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      api.interceptors.request.use((config) => {
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      });

      const response = await api.get('/notification/forms-by-role');
      console.log('Allowed forms for role:', role, response.data);
      setAllowedForms(response.data);
    } catch (error) {
      console.error('Error fetching allowed forms:', error);
      console.log('Using client-side filtering for role:', role);
    }
  };

  const fetchMySubmissions = async () => {
    try {
      const token = localStorage.getItem('token');
      const api = axios.create({
        baseURL: '/api',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const response = await api.get('/WorkflowEngine/my-submissions');
      console.log('✅ Fetched my submissions:', response.data);
      console.log('📊 Total submissions:', response.data?.length || 0);
      setSubmittedForms(response.data || []);
    } catch (error) {
      console.error('❌ Error fetching my submissions:', error);
      setSubmittedForms([]);
    }
  };

  const isFormFilled = (formName) => {
    if (!formName || submittedForms.length === 0) return false;
    
    console.log('🔍 Checking if filled:', formName);
    console.log('📋 Available submissions:', submittedForms);
    
    const filled = submittedForms.some(submission => {
      const submissionName = submission.formType || submission.formName || '';
      if (!submissionName) return false;
      
      if (submissionName === formName) return true;
      
      const submissionLower = submissionName.toLowerCase().trim();
      const formLower = formName.toLowerCase().trim();
      if (submissionLower === formLower) return true;
      
      const cleanSubmissionName = submissionName.replace(/\s+(Form|Request|Application|Submission)$/i, '').trim();
      const cleanFormName = formName.replace(/\s+(Form|Request|Application|Submission)$/i, '').trim();
      if (cleanSubmissionName.toLowerCase() === cleanFormName.toLowerCase()) return true;
      
      return false;
    });
    
    console.log(filled ? '✅ Form is filled!' : '❌ Form not filled');
    return filled;
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) {
    return null;
  }

  const filteredForms = allForms.filter((form) => {
    if (user.role === 'Admin') {
      return true;
    }
    return form.role === user.role;
  });

  console.log('[Dashboard] User role:', user?.role);
  console.log('[Dashboard] Filtered forms (strict role match):', filteredForms);

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.logoContainer}>
            <div className={styles.logo}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          <h1 className={styles.title}>Workflow Management System</h1>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginTop: '16px' }}>
            {user.profilePicture ? (
              <img 
                src={user.profilePicture} 
                alt="Profile" 
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '3px solid #3b82f6',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
              />
            ) : (
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '24px',
                fontWeight: 'bold',
                border: '3px solid #3b82f6',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}>
                {user.firstName?.[0]}{user.lastName?.[0]}
              </div>
            )}
            <div>
              <p className={styles.subtitle} style={{ marginBottom: '4px' }}>
                Welcome, {user.firstName} {user.lastName}
              </p>
              <p className={styles.subtitle} style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                Gen ID: {user.genId} | Role: {user.role}
              </p>
            </div>
          </div>
        </div>

        <div className={styles.userActions}>
          <NotificationBell />
          <button onClick={handleLogout} className={styles.logoutButton}>
            Logout
          </button>
        </div>

        <div className={styles.quickActions}>
          <Link to="/submitted-forms" className={styles.actionCard}>
            <div className={styles.actionIcon} style={{background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6'}}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className={styles.actionContent}>
              <h3 className={styles.actionTitle}>
                My Submissions 
                {submittedForms.length > 0 && (
                  <span style={{ 
                    marginLeft: '8px', 
                    background: '#3b82f6', 
                    color: 'white', 
                    fontSize: '12px', 
                    padding: '2px 8px', 
                    borderRadius: '12px',
                    fontWeight: '600'
                  }}>
                    {submittedForms.length}
                  </span>
                )}
              </h3>
              <p className={styles.actionDescription}>View your submitted forms</p>
            </div>
          </Link>

          <Link to="/pending-tasks" className={styles.actionCard}>
            <div className={styles.actionIcon} style={{background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b'}}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className={styles.actionContent}>
              <h3 className={styles.actionTitle}>Pending Forms</h3>
              <p className={styles.actionDescription}>Forms awaiting review</p>
            </div>
          </Link>

          <Link to="/workflow/dashboard" className={styles.actionCard}>
            <div className={styles.actionIcon} style={{background: 'rgba(16, 185, 129, 0.1)', color: '#10b981'}}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className={styles.actionContent}>
              <h3 className={styles.actionTitle}>My Tasks</h3>
              <p className={styles.actionDescription}>Workflow tasks assigned to you</p>
            </div>
          </Link>

          {user.role === 'Admin' && (
            <Link to="/admin/workflow-logs" className={styles.actionCard}>
              <div className={styles.actionIcon} style={{background: 'rgba(124, 58, 237, 0.1)', color: '#7c3aed'}}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <div className={styles.actionContent}>
                <h3 className={styles.actionTitle}>System Logs</h3>
                <p className={styles.actionDescription}>View all workflow history</p>
              </div>
            </Link>
          )}
        </div>

        <div className={styles.formsSection}>
          <h2 className={styles.sectionTitle}>Available Forms</h2>
          <div className={styles.formsGrid}>
            {filteredForms.length > 0 ? (
              filteredForms.map((form, index) => {
                const isFilled = isFormFilled(form.name);
                return (
                  <Link
                    key={index}
                    to={`/forms/${form.route}`}
                    className={styles.formCard}
                    style={{ opacity: isFilled ? 0.8 : 1 }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                      <h3 className={styles.formCardTitle} style={{ margin: 0 }}>{form.name}</h3>
                      {isFilled && (
                        <span style={{
                          background: '#10b981',
                          color: 'white',
                          fontSize: '10px',
                          fontWeight: '600',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                          ✓ Filled
                        </span>
                      )}
                    </div>
                    <p className={styles.formCardDescription}>{form.description}</p>
                    <div className={styles.formCardAction}>
                      <span className={styles.formCardActionText}>{isFilled ? 'View/Edit Form' : 'Fill Form'}</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className={styles.emptyState}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className={styles.emptyStateTitle}>No forms available</h3>
                <p className={styles.emptyStateDescription}>
                  No forms are currently assigned to your role.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
