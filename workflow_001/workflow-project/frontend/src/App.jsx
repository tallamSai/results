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
import Finance_Officer___Sets_up_payrollWrapper from './components/Finance_Officer___Sets_up_payrollWrapper';
import HR_Representative___Collects_new_hire_information_Sends_welcome_packaWrapper from './components/HR_Representative___Collects_new_hire_information_Sends_welcome_packaWrapper';
import Hiring_Manager___Reviews_the_submissionWrapper from './components/Hiring_Manager___Reviews_the_submissionWrapper';
import IT_Administrator___Provisions_system_accessWrapper from './components/IT_Administrator___Provisions_system_accessWrapper';

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
          <Route path="/forms/finance-officer---sets-up-payroll" element={<ProtectedRoute><Finance_Officer___Sets_up_payrollWrapper /></ProtectedRoute>} />
          <Route path="/forms/hr-representative---collects-new-hire-information,-sends-welcome-packa..." element={<ProtectedRoute><HR_Representative___Collects_new_hire_information_Sends_welcome_packaWrapper /></ProtectedRoute>} />
          <Route path="/forms/hiring-manager-reviews-the-submission" element={<ProtectedRoute><Hiring_Manager___Reviews_the_submissionWrapper /></ProtectedRoute>} />
          <Route path="/forms/it-administrator---provisions-system-access" element={<ProtectedRoute><IT_Administrator___Provisions_system_accessWrapper /></ProtectedRoute>} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
