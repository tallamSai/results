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
import Compliance_Officer___Reviews_visa_and_insurance_requirementsWrapper from './components/Compliance_Officer___Reviews_visa_and_insurance_requirementsWrapper';
import Employee___Submits_travel_request_with_destination_travel_daWrapper from './components/Employee___Submits_travel_request_with_destination_travel_daWrapper';
import Finance_Officer___Verifies_budget_and_issues_travel_advanceWrapper from './components/Finance_Officer___Verifies_budget_and_issues_travel_advanceWrapper';

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
          <Route path="/forms/compliance-officer---reviews-visa-and-insurance-requirements" element={<ProtectedRoute><Compliance_Officer___Reviews_visa_and_insurance_requirementsWrapper /></ProtectedRoute>} />
          <Route path="/forms/employee-submits-travel-request-with-destination,-travel-da..." element={<ProtectedRoute><Employee___Submits_travel_request_with_destination_travel_daWrapper /></ProtectedRoute>} />
          <Route path="/forms/finance-officer---verifies-budget-and-issues-travel-advance" element={<ProtectedRoute><Finance_Officer___Verifies_budget_and_issues_travel_advanceWrapper /></ProtectedRoute>} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
