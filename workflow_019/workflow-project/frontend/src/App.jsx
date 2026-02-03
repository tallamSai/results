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
import Employee___Requests_visitor_access_with_visitor_name_companyWrapper from './components/Employee___Requests_visitor_access_with_visitor_name_companyWrapper';
import Reception_Desk___Prepares_visitor_badgeWrapper from './components/Reception_Desk___Prepares_visitor_badgeWrapper';
import Security_Officer___Runs_background_check_for_sensitive_areasWrapper from './components/Security_Officer___Runs_background_check_for_sensitive_areasWrapper';

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
          <Route path="/forms/employee-requests-visitor-access-with-visitor-name,-company" element={<ProtectedRoute><Employee___Requests_visitor_access_with_visitor_name_companyWrapper /></ProtectedRoute>} />
          <Route path="/forms/reception-desk-prepares-visitor-badge" element={<ProtectedRoute><Reception_Desk___Prepares_visitor_badgeWrapper /></ProtectedRoute>} />
          <Route path="/forms/security-officer-runs-background-check-for-sensitive-areas" element={<ProtectedRoute><Security_Officer___Runs_background_check_for_sensitive_areasWrapper /></ProtectedRoute>} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
