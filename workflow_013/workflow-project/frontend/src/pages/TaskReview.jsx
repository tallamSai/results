import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiService from '../services/api';
import PDFViewer from '../components/PDFViewer';

import Change_Manager___Reviews_completeness from '../components/forms/Change_Manager___Reviews_completeness';
import IT_Staff___Submits_change_request_with_change_title__descript___ from '../components/forms/IT_Staff___Submits_change_request_with_change_title,_descript...';

const ROLE_FORM_MAP = {
  'IT_Staff': IT_Staff___Submits_change_request_with_change_title__descript___,
  'IT_Staff_Step1': IT_Staff___Submits_change_request_with_change_title__descript___,
  'IT_Staff_BpmnStep2': IT_Staff___Submits_change_request_with_change_title__descript___,
  'Change_Manager': Change_Manager___Reviews_completeness,
  'Change_Manager_Step1': Change_Manager___Reviews_completeness,
  'Change_Manager_BpmnStep3': Change_Manager___Reviews_completeness,
};

const ROLE_STEP_FORM_MAP = {
  'IT_Staff': IT_Staff___Submits_change_request_with_change_title__descript___,
  'IT_Staff_Step1': IT_Staff___Submits_change_request_with_change_title__descript___,
  'IT_Staff_BpmnStep2': IT_Staff___Submits_change_request_with_change_title__descript___,
  'Change_Manager': Change_Manager___Reviews_completeness,
  'Change_Manager_Step1': Change_Manager___Reviews_completeness,
  'Change_Manager_BpmnStep3': Change_Manager___Reviews_completeness,
};

const TaskReview = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  
  const [taskDetails, setTaskDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [comments, setComments] = useState('');
  const [currentRoleFormData, setCurrentRoleFormData] = useState({});
  const [currentRoleFormSubmitted, setCurrentRoleFormSubmitted] = useState(false);
  const [showActionButtons, setShowActionButtons] = useState(false);
  const [loadedFormData, setLoadedFormData] = useState({});
  const [loadingFormData, setLoadingFormData] = useState({});
  const [initiatorFormData, setInitiatorFormData] = useState(null);
  const [loadingInitiatorFormData, setLoadingInitiatorFormData] = useState(false);

  useEffect(() => {
    console.log('╔═══════════════════════════════════════════════════════════════════╗');
    console.log('║            📋 ALL AVAILABLE FORM MAPPINGS (ROLE_FORM_MAP)         ║');
    console.log('╠═══════════════════════════════════════════════════════════════════╣');
    Object.keys(ROLE_FORM_MAP).forEach(key => {
      console.log('║ "' + key + '" → ', ROLE_FORM_MAP[key]?.name || 'Component');
    });
    console.log('╚═══════════════════════════════════════════════════════════════════╝');
  }, []);

  useEffect(() => {
    fetchTaskDetails();
  }, [taskId]);

  useEffect(() => {
    if (taskDetails?.previousCompletedTasks) {
      taskDetails.previousCompletedTasks.forEach(task => {
        fetchFormDataForTask(task.taskId);
      });
    }
    if (taskDetails?.workflowInstanceId) {
      fetchInitiatorFormData(taskDetails.workflowInstanceId);
    }
  }, [taskDetails?.previousCompletedTasks, taskDetails?.workflowInstanceId]);

  const fetchTaskDetails = async () => {
    try {
      setLoading(true);
      const response = await apiService.get(`/WorkflowEngine/task/${taskId}`);
      
      console.log('╔═══════════════════════════════════════════════════════════════════╗');
      console.log('║              🔍 TASK DETAILS RECEIVED FROM BACKEND                 ║');
      console.log('╠═══════════════════════════════════════════════════════════════════╣');
      console.log('║ Task ID:', response.data.taskId);
      console.log('║ Workflow Instance:', response.data.workflowInstanceId);
      console.log('║ Task Role:', response.data.taskRole);
      console.log('║ Form Type:', response.data.formType);
      console.log('║ 🎯 RoleAppearanceIndex:', response.data.roleAppearanceIndex, '(0-based, from DB)');
      console.log('║    → This should map to:', response.data.taskRole + '_Step' + (response.data.roleAppearanceIndex + 1));
      console.log('║ Status:', response.data.status);
      console.log('║ Initiator:', response.data.initiatorName, '(' + response.data.initiatorRole + ')');
      console.log('╚═══════════════════════════════════════════════════════════════════╝');
      
      setTaskDetails(response.data);
    } catch (err) {
      console.error('[TaskReview] ❌ Error fetching task details:', err);
      setError('Failed to load task details');
    } finally {
      setLoading(false);
    }
  };

  const fetchFormDataForTask = async (previousTaskId) => {
    if (loadedFormData[previousTaskId] || loadingFormData[previousTaskId]) {
      return;
    }

    try {
      setLoadingFormData(prev => ({ ...prev, [previousTaskId]: true }));
      console.log(`[TaskReview] Lazy loading FormData for task ${previousTaskId}...`);
      
      const response = await apiService.get(`/WorkflowEngine/task/${previousTaskId}/formdata`);
      
      setLoadedFormData(prev => ({ 
        ...prev, 
        [previousTaskId]: response.data.formData 
      }));
      console.log(`[TaskReview] ✅ Loaded FormData for task ${previousTaskId}`);
    } catch (err) {
      console.error(`[TaskReview] ❌ Error loading FormData for task ${previousTaskId}:`, err);
      setLoadedFormData(prev => ({ ...prev, [previousTaskId]: '{}' }));
    } finally {
      setLoadingFormData(prev => ({ ...prev, [previousTaskId]: false }));
    }
  };

  const fetchInitiatorFormData = async (workflowInstanceId) => {
    if (initiatorFormData || loadingInitiatorFormData) {
      return;
    }

    try {
      setLoadingInitiatorFormData(true);
      console.log(`[TaskReview] Lazy loading initiator FormData for workflow ${workflowInstanceId}...`);
      
      const response = await apiService.get(`/WorkflowEngine/workflow/${workflowInstanceId}/initiator-formdata`);
      
      setInitiatorFormData(response.data.formData);
      console.log(`[TaskReview] ✅ Loaded initiator FormData`);
    } catch (err) {
      console.error(`[TaskReview] ❌ Error loading initiator FormData:`, err);
      setInitiatorFormData('{}');
    } finally {
      setLoadingInitiatorFormData(false);
    }
  };

  const handleCurrentRoleFormSubmit = (formData) => {
    console.log('[TaskReview] Current role form submitted:', formData);
    setCurrentRoleFormData(formData);
    setCurrentRoleFormSubmitted(true);
    setShowActionButtons(true);
  };

  const handleApprove = async () => {
    if (!currentRoleFormSubmitted) {
      toast.error('Please fill and submit your form first');
      return;
    }

    const loadingToast = toast.loading('Approving and forwarding form...');
    try {
      setSubmitting(true);
      const response = await apiService.post(`/WorkflowEngine/task/${taskId}/approve`, {
        taskData: currentRoleFormData,
        comments: comments
      });
      toast.success(`✅ Form approved and forwarded to ${response.data.nextRole || 'next stage'}!`, {
        id: loadingToast,
        duration: 4000
      });
      setTimeout(() => navigate('/pending-tasks'), 1500);
    } catch (err) {
      console.error('[TaskReview] Error approving task:', err);
      toast.error('❌ Failed to approve form. Please try again.', {
        id: loadingToast
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeny = async () => {
    if (!comments.trim()) {
      toast.error('Please provide a reason for denial');
      return;
    }

    const loadingToast = toast.loading('Processing denial...');
    try {
      setSubmitting(true);
      const response = await apiService.post(`/WorkflowEngine/task/${taskId}/deny`, {
        taskData: currentRoleFormData || {},
        comments: comments
      });
      toast.error(`❌ Form denied. Notification sent to ${taskDetails.initiatorName}.`, {
        id: loadingToast,
        duration: 4000,
        icon: '📮'
      });
      setTimeout(() => navigate('/pending-tasks'), 1500);
    } catch (err) {
      console.error('[TaskReview] Error denying task:', err);
      toast.error('Failed to deny form. Please try again.', {
        id: loadingToast
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading task details...</p>
        </div>
      </div>
    );
  }

  if (error || !taskDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <p className="text-red-600 text-xl mb-4">{error || 'Task not found'}</p>
          <button onClick={() => navigate('/pending-tasks')} className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            Back to Pending Tasks
          </button>
        </div>
      </div>
    );
  }

  const getFormComponentForRoleAndStep = (role, roleAppearanceIndex = 0) => {
    const roleMappings = Object.keys(ROLE_FORM_MAP).filter(k => k.startsWith(role));
    console.log(`[FormSelection] Available mappings for role '${role}':`, roleMappings);
    
    const stepKey = `${role}_Step${roleAppearanceIndex + 1}`;
    console.log(`[FormSelection] Looking for key: ${stepKey}`);
    if (ROLE_FORM_MAP[stepKey]) {
      console.log(`[FormSelection] ✅ Using step-aware form: ${stepKey}`);
      return ROLE_FORM_MAP[stepKey];
    }
    
    if (roleAppearanceIndex > 0) {
      for (let i = roleAppearanceIndex; i >= 1; i--) {
        const fallbackKey = `${role}_Step${i}`;
        if (ROLE_FORM_MAP[fallbackKey]) {
          console.warn(`[FormSelection] ⚠️  No form for ${stepKey}, reusing ${fallbackKey} (BPMN has more appearances than forms)`);
          return ROLE_FORM_MAP[fallbackKey];
        }
      }
    }
    
    if (ROLE_FORM_MAP[role]) {
      console.log(`[FormSelection] Using default form for role: ${role}`);
      return ROLE_FORM_MAP[role];
    }
    
    console.error(`[FormSelection] ❌ No form found for role: ${role}, appearance: ${roleAppearanceIndex + 1}`);
    return null;
  };
  
  const InitiatorFormComponent = getFormComponentForRoleAndStep(taskDetails.initiatorRole, 0);
  const employeeData = initiatorFormData ? JSON.parse(initiatorFormData) : {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button onClick={() => navigate('/pending-tasks')} className="text-indigo-600 hover:text-indigo-800 flex items-center mb-4 font-medium transition-colors">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Pending Tasks
          </button>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Task Review - {taskDetails.formType}</h1>
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <div><span className="font-medium">Submitted by:</span> {taskDetails.initiatorName}</div>
              <div><span className="font-medium">Current Stage:</span> {taskDetails.taskRole}</div>
              <div><span className="font-medium">Status:</span> <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${taskDetails.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>{taskDetails.status}</span></div>
            </div>
          </div>
        </div>
        <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Workflow Progress</h2>
          <div className="flex items-center space-x-4 overflow-x-auto pb-2">
            <div className="flex flex-col items-center min-w-[120px]">
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">✓</div>
              <p className="mt-2 text-sm font-medium text-gray-900">Employee</p>
              <p className="text-xs text-gray-500">Submitted</p>
            </div>
            {taskDetails.previousCompletedTasks && taskDetails.previousCompletedTasks.map((task, index) => (
              <React.Fragment key={task.taskId}>
                <div className="h-0.5 w-12 bg-green-500"></div>
                <div className="flex flex-col items-center min-w-[120px]">
                  <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">✓</div>
                  <p className="mt-2 text-sm font-medium text-gray-900">{task.taskRole}</p>
                  <p className="text-xs text-gray-500">Completed</p>
                </div>
              </React.Fragment>
            ))}
            <div className="h-0.5 w-12 bg-gray-300"></div>
            <div className="flex flex-col items-center min-w-[120px]">
              <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold animate-pulse">→</div>
              <p className="mt-2 text-sm font-medium text-gray-900">{taskDetails.taskRole}</p>
              <p className="text-xs text-gray-500">Current</p>
            </div>
          </div>
        </div>
        <div className="mb-8 bg-white rounded-xl shadow-sm border-2 border-indigo-200 overflow-hidden">
          <div className="bg-indigo-50 px-6 py-4 border-b border-indigo-200">
            <h2 className="text-xl font-bold text-indigo-900">📋 {taskDetails.initiatorRole}'s Original Submission</h2>
            <p className="text-sm text-indigo-700 mt-1">Submitted by {taskDetails.initiatorName} ({taskDetails.initiatorRole})</p>
          </div>
          <div className="p-6">
            {loadingInitiatorFormData ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading initiator's form data with PDFs...</p>
                </div>
              </div>
            ) : (
              <>
                {InitiatorFormComponent ? <InitiatorFormComponent initialData={employeeData} disabled={true} /> : <div className="text-gray-500">Form component not found for role: {taskDetails.initiatorRole}</div>}
                <PDFViewer formData={employeeData} sectionTitle={`${taskDetails.initiatorRole}'s Attached Documents`} />
              </>
            )}
          </div>
        </div>
        {taskDetails.previousCompletedTasks && taskDetails.previousCompletedTasks.length > 0 && (
          <div className="space-y-6 mb-8">
            {taskDetails.previousCompletedTasks.map((completedTask, index) => {
              const roleAppearanceIndex = completedTask.roleAppearanceIndex || 0;
              const FormComponent = getFormComponentForRoleAndStep(completedTask.taskRole, roleAppearanceIndex);
              
              const isLoadingFormData = loadingFormData[completedTask.taskId];
              const formDataStr = loadedFormData[completedTask.taskId];
              const formData = formDataStr ? JSON.parse(formDataStr) : {};
              
              return (
                <div key={completedTask.taskId} className="bg-white rounded-xl shadow-sm border-2 border-green-200 overflow-hidden">
                  <div className="bg-green-50 px-6 py-4 border-b border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-bold text-green-900">✓ {completedTask.taskRole}'s Review (Stage {index + 2})</h2>
                        <p className="text-sm text-green-700 mt-1">Completed on {new Date(completedTask.completedAt).toLocaleString()}</p>
                      </div>
                      <div className="px-3 py-1 bg-green-600 text-white rounded-full text-sm font-semibold">Approved</div>
                    </div>
                  </div>
                  <div className="p-6">
                    {isLoadingFormData ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-green-600 mx-auto"></div>
                          <p className="mt-4 text-gray-600">Loading form data with PDFs...</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        {FormComponent ? <FormComponent initialData={formData} disabled={true} /> : <div className="bg-gray-50 rounded p-4"><p className="text-sm text-gray-600 font-medium mb-2">Form Data:</p><pre className="text-xs text-gray-700 whitespace-pre-wrap overflow-auto max-h-64">{JSON.stringify(formData, null, 2)}</pre></div>}
                        <PDFViewer formData={formData} sectionTitle={`${completedTask.taskRole}'s Attached Documents`} />
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div className="mb-8 bg-white rounded-xl shadow-lg border-2 border-amber-300 overflow-hidden">
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 px-6 py-4 border-b border-amber-200">
            <h2 className="text-xl font-bold text-amber-900">✏️ Your Review as {taskDetails.taskRole}</h2>
            <p className="text-sm text-amber-700 mt-1">Please fill out your review form below</p>
          </div>
          <div className="p-6">
            {(() => {
              const roleAppearanceIndex = taskDetails.roleAppearanceIndex || 0;
              console.log('[TaskReview] Current user\'s task: Role=' + taskDetails.taskRole + ', RoleAppearanceIndex=' + roleAppearanceIndex + ', looking for form key: ' + taskDetails.taskRole + '_Step' + (roleAppearanceIndex + 1));
              const CurrentRoleFormComponent = getFormComponentForRoleAndStep(taskDetails.taskRole, roleAppearanceIndex);
              
              return CurrentRoleFormComponent 
                ? React.createElement(CurrentRoleFormComponent, {onSubmit: handleCurrentRoleFormSubmit, disabled: currentRoleFormSubmitted}) 
                : <div className="text-red-500">Form for role "{taskDetails.taskRole}" (step {roleAppearanceIndex + 1}) not found</div>;
            })()}
          </div>
        </div>
        {showActionButtons && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Final Decision</h2>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Comments</label>
              <textarea value={comments} onChange={(e) => setComments(e.target.value)} rows={4} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Add your comments here..." />
            </div>
            <div className="flex gap-4">
              <button onClick={handleApprove} disabled={submitting} className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium">{submitting ? 'Processing...' : '✓ Approve & Forward'}</button>
              <button onClick={handleDeny} disabled={submitting} className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium">{submitting ? 'Processing...' : '✗ Deny'}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskReview;
