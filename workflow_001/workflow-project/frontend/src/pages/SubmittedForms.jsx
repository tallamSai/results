import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PDFViewer from '../components/PDFViewer';

import Finance_Officer___Sets_up_payroll from '../components/forms/Finance_Officer___Sets_up_payroll';
import HR_Representative___Collects_new_hire_information__Sends_welcome_packa___ from '../components/forms/HR_Representative___Collects_new_hire_information,_Sends_welcome_packa...';
import Hiring_Manager___Reviews_the_submission from '../components/forms/Hiring_Manager___Reviews_the_submission';
import IT_Administrator___Provisions_system_access from '../components/forms/IT_Administrator___Provisions_system_access';

const FORM_TYPE_MAP = {
  'Finance Officer   Sets Up Payroll': Finance_Officer___Sets_up_payroll,
  'Finance_Officer___Sets_up_payroll': Finance_Officer___Sets_up_payroll,
  'HR Representative - Collects New Hire Information, Sends Welcome Packa...': HR_Representative___Collects_new_hire_information__Sends_welcome_packa___,
  'HR_Representative___Collects_new_hire_information,_Sends_welcome_packa...': HR_Representative___Collects_new_hire_information__Sends_welcome_packa___,
  'Hiring Manager Reviews The Submission': Hiring_Manager___Reviews_the_submission,
  'Hiring_Manager___Reviews_the_submission': Hiring_Manager___Reviews_the_submission,
  'IT Administrator   Provisions System Access': IT_Administrator___Provisions_system_access,
  'IT_Administrator___Provisions_system_access': IT_Administrator___Provisions_system_access,
};

export default function SubmittedForms() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedForm, setSelectedForm] = useState(null);
  const [userRole, setUserRole] = useState('');
  const navigate = useNavigate();

  const api = axios.create({
    baseURL: '/api',
    headers: { 'Content-Type': 'application/json' }
  });

  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserRole(user.role || '');
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      setLoading(true);
      console.log('📥 Fetching my submissions...');
      const response = await api.get('/WorkflowEngine/my-submissions');
      console.log('✅ Received submissions:', response.data);
      console.log('📊 Total count:', response.data?.length || 0);
      
      const sortedForms = (response.data || []).sort((a, b) => {
        const dateA = new Date(a.createdAt || a.submittedAt || 0);
        const dateB = new Date(b.createdAt || b.submittedAt || 0);
        return dateB - dateA;
      });
      
      console.log('📋 Sorted submissions (newest first):', sortedForms);
      setForms(sortedForms);
      
      if (sortedForms.length > 0) {
        console.log(`✅ Found ${sortedForms.length} submission(s)`);
        console.log(`🆕 Latest submission:`, sortedForms[0]?.formType, 'at', sortedForms[0]?.createdAt || sortedForms[0]?.submittedAt);
        
        console.log('🎯 Auto-selecting latest submission for preview...');
        viewFormDetails(sortedForms[0]).catch(err => {
          console.error('Failed to auto-load latest form:', err);
        });
      } else {
        console.log('ℹ️ No submissions found');
      }
    } catch (error) {
      console.error('❌ Error fetching forms:', error);
      console.error('Error details:', error.response?.data || error.message);
      setForms([]);
    } finally {
      setLoading(false);
    }
  };

  const viewFormDetails = async (form) => {
    if (!form) {
      console.warn('⚠️ viewFormDetails called with null/undefined form');
      return;
    }
    
    const formId = form.workflowInstanceId || form.id;
    if (!formId) {
      console.error('❌ Form has no ID:', form);
      setSelectedForm(null);
      return;
    }
    
    try {
      console.log('📥 Fetching details for form ID:', formId);
      const response = await api.get(`/WorkflowEngine/workflow-instance/${formId}`);
      console.log('✅ Form details loaded:', response.data);
      setSelectedForm(response.data);
    } catch (error) {
      console.error('❌ Error fetching form details:', error);
      console.error('Failed to load form ID:', formId, error.response?.data || error.message);
      setSelectedForm(null);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Approved': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800',
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Active': 'bg-blue-100 text-blue-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatFullTimestamp = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-700">Loading forms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => navigate('/home')}
          className="mb-4 flex items-center text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </button>
        
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                My Submitted Forms
                {forms.length > 0 && (
                  <span className="ml-3 inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-indigo-100 text-indigo-800">
                    {forms.length} {forms.length === 1 ? 'Submission' : 'Submissions'}
                  </span>
                )}
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                View and track all your submitted forms with full details and timestamps
              </p>
            </div>
          </div>
        </div>

        {forms.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow">
            <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">No Submissions Yet</h3>
            <p className="mt-2 text-sm text-gray-600 max-w-md mx-auto">
              You haven't submitted any forms yet. Go to the home page to fill out and submit your first form.
            </p>
            <button 
              onClick={() => navigate('/home')}
              className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Go to Home
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600 font-medium">
                  <svg className="inline w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                  </svg>
                  Sorted by: Newest First
                </p>
              </div>
              {forms.map((form, index) => (
                <div 
                  key={form.id} 
                  className={`bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer ${index === 0 ? 'ring-2 ring-indigo-400' : ''}`}
                  onClick={() => viewFormDetails(form)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900">{form.formType || `Form #${form.id}`}</h3>
                        {index === 0 && (
                          <span className="px-2 py-0.5 text-xs font-bold bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full animate-pulse">
                            LATEST
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">Submitted by: {form.submitterName}</p>
                      <p className="text-sm text-gray-500 mt-1 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {new Date(form.submittedAt || form.createdAt).toLocaleString()}
                      </p>
                      {form.approvalStatus && (
                        <p className="text-sm text-gray-600 mt-2">
                          Status: <span className={`px-2 py-1 rounded text-xs ${getStatusColor(form.approvalStatus)}`}>{form.approvalStatus}</span>
                        </p>
                      )}
                    </div>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(form.status)}`}>{form.status}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="sticky top-4">
              {selectedForm ? (
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
                    <h2 className="text-2xl font-bold text-white mb-2">{selectedForm.formType}</h2>
                    <div className="flex items-center text-indigo-100">
                      <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm font-medium">
                        Submitted: {formatFullTimestamp(selectedForm.createdAt || selectedForm.submittedAt)}
                      </span>
                    </div>
                  </div>

                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</p>
                        <span className={`mt-1 inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(selectedForm.status)}`}>
                          {selectedForm.status}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Workflow ID</p>
                        <p className="mt-1 text-sm font-mono text-gray-900">#{selectedForm.workflowInstanceId || selectedForm.id}</p>
                      </div>
                    </div>
                    {selectedForm.approverName && (
                      <div className="mt-4">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Reviewed By</p>
                        <p className="mt-1 text-sm text-gray-900">{selectedForm.approverName}</p>
                      </div>
                    )}
                    {selectedForm.approvalComments && (
                      <div className="mt-4">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Comments</p>
                        <p className="mt-1 text-sm text-gray-700 bg-white p-3 rounded border border-gray-200">{selectedForm.approvalComments}</p>
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                        <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                      </svg>
                      Form Data You Submitted
                    </h3>
                    {(() => {
                      const FormComponent = FORM_TYPE_MAP[selectedForm.formType];
                      const formData = selectedForm.formData ? JSON.parse(selectedForm.formData) : {};
                      
                      return FormComponent 
                        ? <FormComponent initialData={formData} disabled={true} />
                        : (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <p className="text-sm font-medium text-yellow-800 mb-2">⚠️ Form component not found for: {selectedForm.formType}</p>
                            <div className="bg-white rounded p-4 max-h-96 overflow-y-auto">
                              <pre className="text-xs text-gray-700 whitespace-pre-wrap">{JSON.stringify(formData, null, 2)}</pre>
                            </div>
                          </div>
                        );
                    })()}
                    
                    {selectedForm.formData && <PDFViewer formData={JSON.parse(selectedForm.formData)} sectionTitle="Attached Documents" />}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                  <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="mt-4 text-gray-500 font-medium">Select a form to view details</p>
                  <p className="mt-2 text-sm text-gray-400">Click on any submission to see what you filled</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
