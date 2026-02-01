import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../services/api';

/**
 * FormReviewWrapper - Wraps any form component for review mode
 * Loads submitted data and provides Approve/Deny actions
 */
export default function FormReviewWrapper({ FormComponent, formTitle }) {
  const { taskId } = useParams();
  const navigate = useNavigate();
  
  const [taskDetails, setTaskDetails] = useState(null);
  const [submittedData, setSubmittedData] = useState({});
  const [reviewData, setReviewData] = useState({});
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [actionType, setActionType] = useState('');

  useEffect(() => {
    fetchTaskDetails();
  }, [taskId]);

  const fetchTaskDetails = async () => {
    try {
      setLoading(true);
      const response = await apiService.get(`/api/WorkflowEngine/task/${taskId}`);
      setTaskDetails(response.data);
      
      if (response.data.submittedFormData) {
        try {
          const parsed = JSON.parse(response.data.submittedFormData);
          setSubmittedData(parsed);
          setReviewData(parsed);
        } catch (e) {
          console.error('Failed to parse form data:', e);
        }
      }
    } catch (err) {
      console.error('Error fetching task details:', err);
      setError('Failed to load task details');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (action) => {
    setActionType(action);
    setShowConfirmModal(true);
  };

  const confirmAction = async () => {
    if (actionType === 'deny' && !comments.trim()) {
      alert('Please provide a reason for denial');
      return;
    }

    try {
      setSubmitting(true);
      setShowConfirmModal(false);

      const endpoint = actionType === 'approve' 
        ? `/api/WorkflowEngine/task/${taskId}/approve`
        : `/api/WorkflowEngine/task/${taskId}/deny`;

      await apiService.post(endpoint, {
        taskData: reviewData,
        comments: comments
      });

      alert(`Form ${actionType}d successfully!`);
      navigate('/pending-tasks');
    } catch (err) {
      console.error(`Error ${actionType}ing task:`, err);
      alert(`Failed to ${actionType} form. Please try again.`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFormChange = (updatedData) => {
    setReviewData(prev => ({ ...prev, ...updatedData }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading task details...</p>
        </div>
      </div>
    );
  }

  if (error || !taskDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error || 'Task not found'}</p>
          <button
            onClick={() => navigate('/pending-tasks')}
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            Back to Pending Tasks
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <button
            onClick={() => navigate('/pending-tasks')}
            className="text-blue-600 hover:text-blue-800 flex items-center mb-4"
          >
            <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Pending Tasks
          </button>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{formTitle}</h1>
              <p className="mt-2 text-gray-600">Review and take action on this form</p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2">
              <span className="text-sm font-medium text-yellow-800">⏳ Pending Review</span>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
            <div>
              <p className="text-sm text-gray-500">Submitted By</p>
              <p className="mt-1 text-sm font-medium text-gray-900">{taskDetails.initiatorName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="mt-1 text-sm font-medium text-gray-900">{taskDetails.initiatorEmail}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Submitted On</p>
              <p className="mt-1 text-sm font-medium text-gray-900">
                {new Date(taskDetails.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="mb-6 bg-blue-50 rounded-lg border border-blue-200 p-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
            </svg>
            Employee's Submitted Data
          </h2>
          <div className="bg-white rounded-lg p-4 space-y-2">
            {Object.entries(submittedData).map(([key, value]) => {
              if (!value || key.startsWith('_')) return null;
              return (
                <div key={key} className="border-b border-gray-100 pb-2">
                  <p className="text-xs font-semibold text-gray-600 uppercase">{key.replace(/_/g, ' ')}</p>
                  <p className="text-sm text-gray-900 mt-1">
                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd"/>
            </svg>
            Your Department's Form - Add Your Data Below
          </h2>
          <div className="text-sm text-gray-600 mb-4 bg-gray-50 p-3 rounded">
            ℹ️ Fill in the fields below specific to your department's review process. The employee's data is shown above for reference.
          </div>
          <FormComponent 
            initialData={reviewData}
            onDataChange={handleFormChange}
            mode="review"
          />
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Comments</h2>
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Add your comments here (required for denial)..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="mt-2 text-sm text-gray-500">
            {actionType === 'deny' && '* Comments are required when denying a form'}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky bottom-0">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <p className="font-medium">Ready to take action?</p>
              <p>Approving will forward this to the next department. Denying will close the workflow.</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => handleAction('deny')}
                disabled={submitting}
                className="px-8 py-3 border-2 border-red-300 text-red-700 rounded-lg hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
              >
                ❌ Deny
              </button>
              <button
                onClick={() => handleAction('approve')}
                disabled={submitting}
                className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold shadow-lg"
              >
                ✅ Approve & Forward
              </button>
            </div>
          </div>
        </div>
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl">
              <div className="text-center mb-6">
                {actionType === 'approve' ? (
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                    <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ) : (
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                    <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                )}
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Confirm {actionType === 'approve' ? 'Approval' : 'Denial'}
                </h3>
                <p className="text-gray-600">
                  Are you sure you want to {actionType} this form? This action cannot be undone.
                </p>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAction}
                  className={`flex-1 px-4 py-3 rounded-lg text-white font-medium ${
                    actionType === 'approve'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  Confirm {actionType === 'approve' ? 'Approval' : 'Denial'}
                </button>
              </div>
            </div>
          </div>
        )}
        {submitting && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 flex flex-col items-center shadow-2xl">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-700 font-medium">Processing {actionType}...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
