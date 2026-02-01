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
import Direct_Manager___Reviews_relevanceWrapper from './components/Direct_Manager___Reviews_relevanceWrapper';
import Employee___Submits_a_training_request_with_course_name_trainWrapper from './components/Employee___Submits_a_training_request_with_course_name_trainWrapper';
import Finance_Officer___Processes_paymentWrapper from './components/Finance_Officer___Processes_paymentWrapper';
import HR_Representative___Enrolls_the_employee_and_sends_confirmation_with_tWrapper from './components/HR_Representative___Enrolls_the_employee_and_sends_confirmation_with_tWrapper';

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
          <Route path="/forms/direct-manager---reviews-relevance" element={<ProtectedRoute><Direct_Manager___Reviews_relevanceWrapper /></ProtectedRoute>} />
          <Route path="/forms/employee---submits-a-training-request-with-course-name,-train..." element={<ProtectedRoute><Employee___Submits_a_training_request_with_course_name_trainWrapper /></ProtectedRoute>} />
          <Route path="/forms/finance-officer---processes-payment" element={<ProtectedRoute><Finance_Officer___Processes_paymentWrapper /></ProtectedRoute>} />
          <Route path="/forms/hr-representative-enrolls-the-employee-and-sends-confirmation-with-t..." element={<ProtectedRoute><HR_Representative___Enrolls_the_employee_and_sends_confirmation_with_tWrapper /></ProtectedRoute>} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
