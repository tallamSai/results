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
import End_User___Reports_an_issue_by_submitting_a_ticketWrapper from './components/End_User___Reports_an_issue_by_submitting_a_ticketWrapper';
import IT_Manager___Provides_guidance_or_additional_resourcesWrapper from './components/IT_Manager___Provides_guidance_or_additional_resourcesWrapper';
import IT_Technician___Investigates_root_cause_and_performs_diagnosticsWrapper from './components/IT_Technician___Investigates_root_cause_and_performs_diagnosticsWrapper';
import Service_Desk_Agent___Performs_initial_triage_Assigns_incident_to_IT_teWrapper from './components/Service_Desk_Agent___Performs_initial_triage_Assigns_incident_to_IT_teWrapper';

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
          <Route path="/forms/end-user---reports-an-issue-by-submitting-a-ticket" element={<ProtectedRoute><End_User___Reports_an_issue_by_submitting_a_ticketWrapper /></ProtectedRoute>} />
          <Route path="/forms/it-manager---provides-guidance-or-additional-resources" element={<ProtectedRoute><IT_Manager___Provides_guidance_or_additional_resourcesWrapper /></ProtectedRoute>} />
          <Route path="/forms/it-technician-investigates-root-cause-and-performs-diagnostics" element={<ProtectedRoute><IT_Technician___Investigates_root_cause_and_performs_diagnosticsWrapper /></ProtectedRoute>} />
          <Route path="/forms/service-desk-agent---performs-initial-triage,-assigns-incident-to-it-te..." element={<ProtectedRoute><Service_Desk_Agent___Performs_initial_triage_Assigns_incident_to_IT_teWrapper /></ProtectedRoute>} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
