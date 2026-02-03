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
import Employee___Submits_maintenance_request_with_location_issue_tWrapper from './components/Employee___Submits_maintenance_request_with_location_issue_tWrapper';
import Facilities_Coordinator___Reviews_and_assigns_priorityWrapper from './components/Facilities_Coordinator___Reviews_and_assigns_priorityWrapper';
import Maintenance_Technician___Inspects_and_provides_repair_estimate_Completes_rWrapper from './components/Maintenance_Technician___Inspects_and_provides_repair_estimate_Completes_rWrapper';

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
          <Route path="/forms/employee---submits-maintenance-request-with-location,-issue-t..." element={<ProtectedRoute><Employee___Submits_maintenance_request_with_location_issue_tWrapper /></ProtectedRoute>} />
          <Route path="/forms/facilities-coordinator---reviews-and-assigns-priority" element={<ProtectedRoute><Facilities_Coordinator___Reviews_and_assigns_priorityWrapper /></ProtectedRoute>} />
          <Route path="/forms/maintenance-technician---inspects-and-provides-repair-estimate,-completes-r..." element={<ProtectedRoute><Maintenance_Technician___Inspects_and_provides_repair_estimate_Completes_rWrapper /></ProtectedRoute>} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
