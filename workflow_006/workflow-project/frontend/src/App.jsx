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
import Direct_Manager___VerifiesWrapper from './components/Direct_Manager___VerifiesWrapper';
import Employee___Submits_expense_claim_with_expense_type_amount_dWrapper from './components/Employee___Submits_expense_claim_with_expense_type_amount_dWrapper';
import Finance_Officer___Processes_payment_by_entering_payment_date_and_traWrapper from './components/Finance_Officer___Processes_payment_by_entering_payment_date_and_traWrapper';
import Finance_Officer___Reviews_for_policy_complianceWrapper from './components/Finance_Officer___Reviews_for_policy_complianceWrapper';

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
          <Route path="/forms/direct-manager---verifies" element={<ProtectedRoute><Direct_Manager___VerifiesWrapper /></ProtectedRoute>} />
          <Route path="/forms/employee---submits-expense-claim-with-expense-type,-amount,-d..." element={<ProtectedRoute><Employee___Submits_expense_claim_with_expense_type_amount_dWrapper /></ProtectedRoute>} />
          <Route path="/forms/finance-officer---processes-payment-by-entering-payment-date-and-tra..." element={<ProtectedRoute><Finance_Officer___Processes_payment_by_entering_payment_date_and_traWrapper /></ProtectedRoute>} />
          <Route path="/forms/finance-officer---reviews-for-policy-compliance" element={<ProtectedRoute><Finance_Officer___Reviews_for_policy_complianceWrapper /></ProtectedRoute>} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
