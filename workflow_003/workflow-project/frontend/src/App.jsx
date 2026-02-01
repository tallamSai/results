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
import Department_Head___Reviews_the_evaluationWrapper from './components/Department_Head___Reviews_the_evaluationWrapper';
import Direct_Manager___Completes_the_performance_evaluation_form_with_ratWrapper from './components/Direct_Manager___Completes_the_performance_evaluation_form_with_ratWrapper';
import HR_Representative___Initiates_the_review_cycle_by_selecting_the_employWrapper from './components/HR_Representative___Initiates_the_review_cycle_by_selecting_the_employWrapper';
import HR_Representative___Schedules_a_feedback_meetingWrapper from './components/HR_Representative___Schedules_a_feedback_meetingWrapper';

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
          <Route path="/forms/department-head-reviews-the-evaluation" element={<ProtectedRoute><Department_Head___Reviews_the_evaluationWrapper /></ProtectedRoute>} />
          <Route path="/forms/direct-manager---completes-the-performance-evaluation-form-with-rat..." element={<ProtectedRoute><Direct_Manager___Completes_the_performance_evaluation_form_with_ratWrapper /></ProtectedRoute>} />
          <Route path="/forms/hr-representative---initiates-the-review-cycle-by-selecting-the-employ..." element={<ProtectedRoute><HR_Representative___Initiates_the_review_cycle_by_selecting_the_employWrapper /></ProtectedRoute>} />
          <Route path="/forms/hr-representative-schedules-a-feedback-meeting" element={<ProtectedRoute><HR_Representative___Schedules_a_feedback_meetingWrapper /></ProtectedRoute>} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
