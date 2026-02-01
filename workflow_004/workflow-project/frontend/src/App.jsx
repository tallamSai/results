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
import Direct_Manager___Confirms_pending_work_handover_statusWrapper from './components/Direct_Manager___Confirms_pending_work_handover_statusWrapper';
import Finance_Officer___Processes_final_settlement_with_pending_salary_leWrapper from './components/Finance_Officer___Processes_final_settlement_with_pending_salary_leWrapper';
import HR_Representative___Initiates_offboarding_by_entering_employee_name_lWrapper from './components/HR_Representative___Initiates_offboarding_by_entering_employee_name_lWrapper';
import IT_Administrator___Revokes_system_access_and_collects_equipment_incluWrapper from './components/IT_Administrator___Revokes_system_access_and_collects_equipment_incluWrapper';

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
          <Route path="/forms/direct-manager---confirms-pending-work-handover-status" element={<ProtectedRoute><Direct_Manager___Confirms_pending_work_handover_statusWrapper /></ProtectedRoute>} />
          <Route path="/forms/finance-officer---processes-final-settlement-with-pending-salary,-le..." element={<ProtectedRoute><Finance_Officer___Processes_final_settlement_with_pending_salary_leWrapper /></ProtectedRoute>} />
          <Route path="/forms/hr-representative---initiates-offboarding-by-entering-employee-name,-l..." element={<ProtectedRoute><HR_Representative___Initiates_offboarding_by_entering_employee_name_lWrapper /></ProtectedRoute>} />
          <Route path="/forms/it-administrator---revokes-system-access-and-collects-equipment-inclu..." element={<ProtectedRoute><IT_Administrator___Revokes_system_access_and_collects_equipment_incluWrapper /></ProtectedRoute>} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
