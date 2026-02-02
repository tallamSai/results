import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function PendingForms() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedForm, setSelectedForm] = useState(null);
  const [comments, setComments] = useState('');
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
    fetchPendingForms();
  }, []);

  const fetchPendingForms = async () => {
    try {
      setLoading(true);
      const response = await api.get('/WorkflowEngine/pending-tasks');
      setForms(response.data || []);
    } catch (error) {
      console.error('Error fetching forms:', error);
      setForms([]);
    } finally {
      setLoading(false);
    }
  };

  const viewFormDetails = async (form) => {
    try {
      const response = await api.get(`/WorkflowEngine/task/${form.id}`);
      setSelectedForm(response.data);
      setComments('');
    } catch (error) {
      console.error('Error fetching form details:', error);
      alert('Failed to load form details');
    }
  };

  const handleApprove = async () => {
    if (!selectedForm) return;
    try {
      await api.post(`/WorkflowEngine/task/${selectedForm.id}/approve`, {
        taskData: selectedForm.formData || {},
        comments: comments || 'Approved'
      });
      alert('Form approved successfully');
      setSelectedForm(null);
      setComments('');
      fetchPendingForms();
    } catch (error) {
      console.error('Error approving form:', error);
      alert('Failed to approve form');
    }
  };

  const handleReject = async () => {
    if (!selectedForm || !comments.trim()) {
      alert('Please provide comments for rejection');
      return;
    }
    try {
      await api.post(`/WorkflowEngine/task/${selectedForm.id}/deny`, {
        taskData: selectedForm.formData || {},
        comments: comments
      });
      alert('Form rejected');
      setSelectedForm(null);
      setComments('');
      fetchPendingForms();
    } catch (error) {
      console.error('Error rejecting form:', error);
      alert('Failed to reject form');
    }
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
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Pending Forms</h1>
          <button onClick={() => navigate('/home')} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
            Back to Home
          </button>
        </div>

        {forms.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <h3 className="mt-2 text-sm font-medium text-gray-900">No pending forms</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              {forms.map((form) => (
                <div key={form.id} className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer" onClick={() => viewFormDetails(form)}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Form #{form.id}</h3>
                      <p className="text-sm text-gray-600">Submitted by: {form.submitterName}</p>
                      <p className="text-sm text-gray-500">{new Date(form.submittedAt).toLocaleString()}</p>
                    </div>
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">{form.status}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="sticky top-4">
              {selectedForm ? (
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Form Details</h2>
                  <div className="space-y-4 mb-6">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Submitted By</p>
                      <p className="text-lg text-gray-900">{selectedForm.submitterName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-2">Form Data</p>
                      <div className="bg-gray-50 rounded p-4 max-h-64 overflow-y-auto">
                        {selectedForm.formData ? (
                          <pre className="text-sm text-gray-700 whitespace-pre-wrap">{JSON.stringify(JSON.parse(selectedForm.formData), null, 2)}</pre>
                        ) : (
                          <p className="text-gray-500">No data</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Comments</label>
                    <textarea value={comments} onChange={(e) => setComments(e.target.value)} rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  {userRole && (
                    <div className="flex space-x-4">
                      <button onClick={handleApprove} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Approve</button>
                      <button onClick={handleReject} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Reject</button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                  <p className="mt-4 text-gray-500">Select a form to view details</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
