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
import Procurement_Analyst___Evaluates_quotes_based_on_price_quality_and_deliWrapper from './components/Procurement_Analyst___Evaluates_quotes_based_on_price_quality_and_deliWrapper';
import Procurement_Manager___Selects_winning_vendorWrapper from './components/Procurement_Manager___Selects_winning_vendorWrapper';
import Procurement_Officer___Creates_RFQ_with_item_specifications_quantity_deWrapper from './components/Procurement_Officer___Creates_RFQ_with_item_specifications_quantity_deWrapper';
import Procurement_Officer___Sends_RFQ_to_approved_vendorsWrapper from './components/Procurement_Officer___Sends_RFQ_to_approved_vendorsWrapper';

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
          <Route path="/forms/procurement-analyst---evaluates-quotes-based-on-price,-quality,-and-deli..." element={<ProtectedRoute><Procurement_Analyst___Evaluates_quotes_based_on_price_quality_and_deliWrapper /></ProtectedRoute>} />
          <Route path="/forms/procurement-manager---selects-winning-vendor" element={<ProtectedRoute><Procurement_Manager___Selects_winning_vendorWrapper /></ProtectedRoute>} />
          <Route path="/forms/procurement-officer---creates-rfq-with-item-specifications,-quantity,-de..." element={<ProtectedRoute><Procurement_Officer___Creates_RFQ_with_item_specifications_quantity_deWrapper /></ProtectedRoute>} />
          <Route path="/forms/procurement-officer-sends-rfq-to-approved-vendors" element={<ProtectedRoute><Procurement_Officer___Sends_RFQ_to_approved_vendorsWrapper /></ProtectedRoute>} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
