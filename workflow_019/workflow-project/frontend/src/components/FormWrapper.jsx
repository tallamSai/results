import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function FormWrapper({ children, formType, apiEndpoint, mode = 'submit', taskId = null, initialData = null }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isFilled, setIsFilled] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const api = axios.create({
        baseURL: '/api',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      await api.post('/WorkflowEngine/submit', {
        formType: formType,
        formData: formData
      });
      
      setSuccess('Form submitted successfully!');
      setIsFilled(true);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit form. Please try again.');
      console.error('Form submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRestart = () => {
    setIsFilled(false);
    setSuccess('');
    setError('');
    window.location.reload();
  };

  const handleApprove = async (formData, comments) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const api = axios.create({
        baseURL: '/api',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      await api.post(`/WorkflowEngine/task/${taskId}/approve`, {
        taskData: formData,
        comments: comments
      });
      
      setSuccess('Form approved successfully!');
      setIsFilled(true);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve form. Please try again.');
      console.error('Form approval error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeny = async (formData, comments) => {
    if (!comments || comments.trim() === '') {
      setError('Please provide a reason for denial');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const api = axios.create({
        baseURL: '/api',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      await api.post(`/WorkflowEngine/task/${taskId}/deny`, {
        taskData: formData,
        comments: comments
      });
      
      setSuccess('Form denied.');
      setIsFilled(true);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to deny form. Please try again.');
      console.error('Form denial error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full">
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          padding: '20px 32px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <button
            onClick={handleBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 14px rgba(59, 130, 246, 0.3)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.4)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(59, 130, 246, 0.3)';
            }}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </button>
          <h1 style={{
            fontSize: '1.875rem',
            fontWeight: '700',
            color: '#1f2937',
            letterSpacing: '-0.025em',
            margin: 0
          }}>{formType}</h1>
          <div style={{width: '140px'}}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{formType}</h2>

        {error && (
          <div className="mx-6 mb-4 rounded-lg bg-red-50 p-4 border border-red-200">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {isFilled && (
          <div style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '24px',
            marginLeft: '24px',
            marginRight: '24px',
            boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)',
            border: '2px solid rgba(255, 255, 255, 0.3)'
          }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <svg style={{height: '28px', width: '28px', color: 'white'}} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div style={{marginLeft: '16px'}}>
                  <p style={{
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    color: 'white',
                    margin: 0,
                    marginBottom: '4px'
                  }}>Form Submitted Successfully! ✓</p>
                  <p style={{
                    fontSize: '14px',
                    color: 'rgba(255, 255, 255, 0.9)',
                    margin: 0
                  }}>Your submission has been recorded</p>
                </div>
              </div>
              <button
                onClick={handleRestart}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '12px 24px',
                  border: '2px solid white',
                  fontSize: '14px',
                  fontWeight: '600',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'white';
                  e.currentTarget.style.color = '#059669';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 255, 255, 0.3)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <svg style={{marginRight: '8px', height: '16px', width: '16px'}} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Restart Form
              </button>
            </div>
          </div>
        )}

            {children({ 
              onSubmit: handleSubmit,
              onApprove: handleApprove,
              onDeny: handleDeny,
              loading, 
              error, 
              success,
              mode,
              initialData,
              isFilled
            })}
          </div>
        </div>

        {loading && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              <p className="mt-4 text-gray-700 font-medium">Submitting form...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
