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
import Compliance_Officer___Reviews_legal_documents_including_business_licenseWrapper from './components/Compliance_Officer___Reviews_legal_documents_including_business_licenseWrapper';
import Finance_Officer___Sets_up_vendor_in_payment_system_with_bank_detailsWrapper from './components/Finance_Officer___Sets_up_vendor_in_payment_system_with_bank_detailsWrapper';
import Procurement_Officer___Initiates_vendor_registration_with_company_name_cWrapper from './components/Procurement_Officer___Initiates_vendor_registration_with_company_name_cWrapper';
import Vendor___Receives_confirmation_and_welcome_packageWrapper from './components/Vendor___Receives_confirmation_and_welcome_packageWrapper';

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
          <Route path="/forms/compliance-officer---reviews-legal-documents-including-business-license..." element={<ProtectedRoute><Compliance_Officer___Reviews_legal_documents_including_business_licenseWrapper /></ProtectedRoute>} />
          <Route path="/forms/finance-officer---sets-up-vendor-in-payment-system-with-bank-details..." element={<ProtectedRoute><Finance_Officer___Sets_up_vendor_in_payment_system_with_bank_detailsWrapper /></ProtectedRoute>} />
          <Route path="/forms/procurement-officer---initiates-vendor-registration-with-company-name,-c..." element={<ProtectedRoute><Procurement_Officer___Initiates_vendor_registration_with_company_name_cWrapper /></ProtectedRoute>} />
          <Route path="/forms/vendor-receives-confirmation-and-welcome-package" element={<ProtectedRoute><Vendor___Receives_confirmation_and_welcome_packageWrapper /></ProtectedRoute>} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
