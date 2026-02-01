import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle, XCircle, AlertCircle, User, FileText, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import apiService from '../services/api';

const WorkflowDetails = () => {
  const { workflowId } = useParams();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [workflow, setWorkflow] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkflowDetails();
  }, [workflowId]);

  const fetchWorkflowDetails = async () => {
    try {
      setLoading(true);
      
      const historyResponse = await apiService.get(`/WorkflowEngine/${workflowId}/history`);
      console.log('[WorkflowDetails] Fetched history:', historyResponse.data);
      setHistory(historyResponse.data || []);
      
      const allWorkflowsResponse = await apiService.get('/WorkflowEngine/all');
      const currentWorkflow = allWorkflowsResponse.data?.find(wf => wf.workflowInstanceId === parseInt(workflowId));
      setWorkflow(currentWorkflow);
      
    } catch (error) {
      console.error('[WorkflowDetails] Error fetching workflow details:', error);
      toast.error('Failed to load workflow details');
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getActionIcon = (action, decision) => {
    if (action === 'Workflow Initiated') return <FileText className="w-6 h-6 text-blue-600" />;
    if (action === 'Task Approved' || decision === 'Approved') return <CheckCircle className="w-6 h-6 text-green-600" />;
    if (action === 'Task Denied' || decision === 'Denied') return <XCircle className="w-6 h-6 text-red-600" />;
    return <AlertCircle className="w-6 h-6 text-yellow-600" />;
  };

  const getActionColor = (action, decision) => {
    if (action === 'Workflow Initiated') return 'border-blue-500 bg-blue-50';
    if (action === 'Task Approved' || decision === 'Approved') return 'border-green-500 bg-green-50';
    if (action === 'Task Denied' || decision === 'Denied') return 'border-red-500 bg-red-50';
    return 'border-yellow-500 bg-yellow-50';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading workflow details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <button
            onClick={() => navigate('/admin/workflow-logs')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Workflow Logs
          </button>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Workflow #{workflowId} - Detailed History
              </h1>
              {workflow && (
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Form Type:</span> {workflow.formType}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Initiator:</span> {workflow.initiatorName}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Status:</span> 
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                      workflow.status === 'Completed' ? 'bg-green-100 text-green-800' :
                      workflow.status?.includes('Denied') ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {workflow.status}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Progress:</span> {workflow.completedTasks}/{workflow.totalTasks} tasks completed
                  </p>
                </div>
              )}
            </div>
            
            {workflow && (
              <div className="text-right">
                <div className="text-sm text-gray-600">
                  <div className="mb-1">
                    <span className="font-medium">Created:</span>
                    <div>{formatDate(workflow.createdAt)}</div>
                  </div>
                  {workflow.completedAt && (
                    <div>
                      <span className="font-medium">Completed:</span>
                      <div>{formatDate(workflow.completedAt)}</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Complete Action Timeline</h2>
          
          {history.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <AlertCircle className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>No history records found for this workflow</p>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>
              <div className="space-y-8">
                {history.map((item, index) => (
                  <div key={item.id} className="relative pl-20">
                    <div className={`absolute left-0 w-16 h-16 rounded-full border-4 flex items-center justify-center ${getActionColor(item.action, item.decision)}`}>
                      {getActionIcon(item.action, item.decision)}
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">{item.action}</h3>
                          <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                            <User className="w-4 h-4" />
                            <span className="font-medium">{item.performedByName}</span>
                            <span className="text-gray-400">•</span>
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                              {item.performedByRole}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Clock className="w-4 h-4" />
                          {formatDate(item.timestamp)}
                        </div>
                      </div>
                      <div className="mt-3 space-y-2">
                        {item.decision && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-700">Decision:</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              item.decision === 'Approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {item.decision}
                            </span>
                          </div>
                        )}
                        
                        {item.fromRole && item.toRole && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="font-medium">Flow:</span>
                            <span className="px-2 py-1 bg-gray-200 rounded text-xs">{item.fromRole}</span>
                            <span>→</span>
                            <span className="px-2 py-1 bg-gray-200 rounded text-xs">{item.toRole}</span>
                          </div>
                        )}
                        
                        {item.fromStatus && item.toStatus && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="font-medium">Status Change:</span>
                            <span className="px-2 py-1 bg-gray-200 rounded text-xs">{item.fromStatus}</span>
                            <span>→</span>
                            <span className="px-2 py-1 bg-gray-200 rounded text-xs">{item.toStatus}</span>
                          </div>
                        )}
                        
                        {item.comments && (
                          <div className="mt-2 pt-2 border-t border-gray-300">
                            <div className="flex items-start gap-2">
                              <MessageSquare className="w-4 h-4 text-gray-500 mt-0.5" />
                              <div>
                                <span className="text-sm font-medium text-gray-700">Comments:</span>
                                <p className="text-sm text-gray-600 mt-1">{item.comments}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkflowDetails;
