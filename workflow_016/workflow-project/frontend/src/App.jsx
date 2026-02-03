import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import ProtectedRoute from './pages/ProtectedRoute';
import SubmittedForms from './pages/SubmittedForms';
import WorkflowDashboard from './pages/WorkflowDashboard';
import PendingTasks from './pages/PendingTasks';
import TaskReview from './pages/TaskReview';
import AdminDashboard from './pages/AdminDashboard';
import AdminWorkflowLogs from './pages/AdminWorkflowLogs';
import WorkflowDetails from './pages/WorkflowDetails';
import { initializeSignalR } from './services/signalr';
import Contract_Manager___Drafts_contract_with_vendor_name_contract_type_vWrapper from './components/Contract_Manager___Drafts_contract_with_vendor_name_contract_type_vWrapper';
import Finance_Director___Confirms_budget_availabilityWrapper from './components/Finance_Director___Confirms_budget_availabilityWrapper';
import Legal_Counsel___Reviews_and_suggests_modificationsWrapper from './components/Legal_Counsel___Reviews_and_suggests_modificationsWrapper';

function App() {
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      initializeSignalR();
    }
  }, []);

  return (
    <>
      <Toaster position="top-right" />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/submitted-forms" element={<ProtectedRoute><SubmittedForms /></ProtectedRoute>} />
          <Route path="/workflow/dashboard" element={<ProtectedRoute><WorkflowDashboard /></ProtectedRoute>} />
          <Route path="/pending-tasks" element={<ProtectedRoute><PendingTasks /></ProtectedRoute>} />
          <Route path="/task-review/:taskId" element={<ProtectedRoute><TaskReview /></ProtectedRoute>} />
          <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/workflow-logs" element={<ProtectedRoute><AdminWorkflowLogs /></ProtectedRoute>} />
          <Route path="/admin/workflow-details/:workflowId" element={<ProtectedRoute><WorkflowDetails /></ProtectedRoute>} />
          <Route path="/forms/contract-manager---drafts-contract-with-vendor-name,-contract-type,-v..." element={<ProtectedRoute><Contract_Manager___Drafts_contract_with_vendor_name_contract_type_vWrapper /></ProtectedRoute>} />
          <Route path="/forms/finance-director---confirms-budget-availability" element={<ProtectedRoute><Finance_Director___Confirms_budget_availabilityWrapper /></ProtectedRoute>} />
          <Route path="/forms/legal-counsel---reviews-and-suggests-modifications" element={<ProtectedRoute><Legal_Counsel___Reviews_and_suggests_modificationsWrapper /></ProtectedRoute>} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
