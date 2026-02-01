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
import Accounts_Payable_Clerk___Receives_and_logs_invoice_with_vendor_name_invoicWrapper from './components/Accounts_Payable_Clerk___Receives_and_logs_invoice_with_vendor_name_invoicWrapper';
import Department_Manager___Verifies_goods_or_services_receivedWrapper from './components/Department_Manager___Verifies_goods_or_services_receivedWrapper';
import Finance_Manager___Reviews_for_budget_allocationWrapper from './components/Finance_Manager___Reviews_for_budget_allocationWrapper';
import Vendor___Receives_payment_confirmationWrapper from './components/Vendor___Receives_payment_confirmationWrapper';

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
          <Route path="/forms/accounts-payable-clerk---receives-and-logs-invoice-with-vendor-name,-invoic..." element={<ProtectedRoute><Accounts_Payable_Clerk___Receives_and_logs_invoice_with_vendor_name_invoicWrapper /></ProtectedRoute>} />
          <Route path="/forms/department-manager-verifies-goods-or-services-received" element={<ProtectedRoute><Department_Manager___Verifies_goods_or_services_receivedWrapper /></ProtectedRoute>} />
          <Route path="/forms/finance-manager---reviews-for-budget-allocation" element={<ProtectedRoute><Finance_Manager___Reviews_for_budget_allocationWrapper /></ProtectedRoute>} />
          <Route path="/forms/vendor---receives-payment-confirmation" element={<ProtectedRoute><Vendor___Receives_payment_confirmationWrapper /></ProtectedRoute>} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
