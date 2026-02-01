import React, { useState } from 'react';
import { Menu, Search, ShoppingCart, Edit, Link2, Bookmark, Grid3x3, Bell, ArrowLeft, Clock } from 'lucide-react';

const Navbar = ({ 
  userName = "Employee User",
  userRole = "Employee",
  userAvatar = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
  cartCount = 0,
  notificationCount = 0,
  onSearch,
  onMenuClick
}) => {
  const [activeTab, setActiveTab] = useState('My Workspace');
  const [searchValue, setSearchValue] = useState('');

  const tabs = ['Nest', 'My Workspace', 'Manager Hub'];

  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
    if (onSearch) {
      onSearch(e.target.value);
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={onMenuClick}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu size={20} className="text-gray-600" />
          </button>
          <div className="flex items-center gap-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeTab === tab
                    ? 'bg-blue-400 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="search"
              value={searchValue}
              onChange={handleSearchChange}
              className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ShoppingCart size={20} className="text-gray-600" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Edit size={20} className="text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Link2 size={20} className="text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Bookmark size={20} className="text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Grid3x3 size={20} className="text-gray-600" />
            </button>
            <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell size={20} className="text-gray-600" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {notificationCount}
                </span>
              )}
            </button>
          </div>
          <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">{userName}</p>
              <p className="text-xs text-gray-500">{userRole}</p>
            </div>
            <img
              src={userAvatar}
              alt={userName}
              className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
            />
          </div>
        </div>
      </div>
    </nav>
  );
};

const EmployeeHeader = ({ 
  title = "Form Title",
  subtitle = "Employee Initiation",
  employeeName = "Employee Name",
  genId = "00000000",
  email = "employee@company.com",
  avatarUrl = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
  designation = "Employee",
  division = "Department",
  managerName = "Manager Name",
  onBack,
  onClockClick
}) => {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} className="text-gray-700" />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              {title} <span className="text-base font-normal text-gray-600">- {subtitle}</span>
            </h1>
          </div>
        </div>
        <button 
          onClick={onClockClick}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Clock size={24} className="text-blue-400" />
        </button>
      </div>
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={avatarUrl}
              alt={employeeName}
              className="w-14 h-14 rounded-full object-cover border-2 border-gray-200"
            />
            <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold text-gray-900">{employeeName}</span>
              <span className="text-sm text-gray-600">• Gen ID: {genId}</span>
            </div>
            <span className="text-sm text-gray-600">{email}</span>
          </div>
        </div>
        <div className="flex flex-col items-start px-8">
          <span className="text-sm text-gray-500 mb-1">Designation</span>
          <span className="text-base font-medium text-gray-900">{designation}</span>
        </div>
        <div className="flex flex-col items-start px-8 flex-1">
          <span className="text-sm text-gray-500 mb-1">Division</span>
          <span className="text-base font-medium text-gray-900">{division}</span>
        </div>
        <div className="flex flex-col items-start px-8">
          <span className="text-sm text-gray-500 mb-1">Manager</span>
          <span className="text-base font-medium text-gray-900">{managerName}</span>
        </div>
      </div>
    </div>
  );
};

export default function HRRepresentativeSchedulesafeedbackmeeting({ workflowInstanceId = null, previousStageData = null }) {
  const [formData, setFormData] = useState({});
  
  // Get user data from localStorage
  const getUserData = () => {{
    try {{
      const userStr = localStorage.getItem('user');
      if (userStr) {{
        return JSON.parse(userStr);
      }}
    }} catch (e) {{
      console.error('Error parsing user data:', e);
    }}
    return null;
  }};
  
  const user = getUserData();
  const employeeName = user ? `${user.firstName} ${user.lastName}` : 'Employee Name';
  const email = user ? user.email : 'employee@company.com';
  const designation = user ? user.role : 'Employee';
  const genId = user ? (user.id ? user.id.toString().padStart(8, '0') : '00000000') : '00000000';
  // Note: division and manager fields would need to be added to the User model in the generated backend
  const division = user ? (user.division || user.role) : 'Department';
  const managerName = user ? (user.manager || 'N/A') : 'N/A';
  const userName = employeeName;
  const userRole = designation;

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const submissionData = {
      workflowInstanceId: workflowInstanceId,
      currentStage: 'HR Representative',
      formData: formData,
      action: 'submit',
      timestamp: new Date().toISOString()
    };
    
    console.log('Form submitted with workflow context:', submissionData);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar 
        userName={userName}
        userRole={userRole}
      />
      <EmployeeHeader 
        title="HR Representative - Schedules a feedback meeting"
        subtitle="HR Representative Process"
        employeeName={employeeName}
        email={email}
        genId={genId}
        designation={designation}
        division={division}
        managerName={managerName}
      />
      
      <div className="max-w-6xl mx-auto px-6 py-3">
        <div className="flex items-center text-sm text-gray-600">
          <span className="hover:text-blue-600 cursor-pointer">My Workspace</span>
          <span className="mx-2">›</span>
          <span className="text-gray-900 font-medium">HR Representative - Schedules a feedback meeting</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pb-6">
        
        
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <div className="px-8 py-6">
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-200">
              <div className="p-2.5 bg-green-100 rounded-lg">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-4"/>
                  <rect x="9" y="3" width="6" height="4" rx="2"/>
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Required Information</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">
                    Employee Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData['question_1d6f2177'] || ''}
                    onChange={e => handleInputChange('question_1d6f2177', e.target.value)}
                    placeholder="Enter employee full name"
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">
                    Review Period Start Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={formData['question_4d56c38c'] || ''}
                      onChange={e => handleInputChange('question_4d56c38c', e.target.value)}
                      className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      required
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">
                    Review Period End Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={formData['question_29aac47a'] || ''}
                      onChange={e => handleInputChange('question_29aac47a', e.target.value)}
                      className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      required
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">
                    Meeting Date and Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData['question_5403d35c'] || ''}
                    onChange={e => handleInputChange('question_5403d35c', e.target.value)}
                    placeholder="YYYY-MM-DD HH:MM"
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">
                    Meeting Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData['question_df3bdb37'] || ''}
                    onChange={e => handleInputChange('question_df3bdb37', e.target.value)}
                    placeholder="Physical address or virtual meeting link"
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">
                    Meeting Type <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={formData['question_23a31f0c'] || ''}
                      onChange={e => handleInputChange('question_23a31f0c', e.target.value)}
                      className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white"
                      required
                    >
                      <option value="">Select an option</option>
                      <option value="In-person">In-person</option><option value="Virtual">Virtual</option><option value="Hybrid">Hybrid</option>
                    </select>
                    <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
                <div className="flex flex-col gap-2 w-full text-left">
                  <label className="text-sm md:text-base font-semibold">
                    Participants
                    *
                  </label>
                  <div className="space-y-2">
                    
            <div key="Employee" className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="question_4b9576fc_choice_0"
                checked={formData['question_4b9576fc'] && formData['question_4b9576fc'].includes('Employee')}
                onChange={e => { const currentValues = formData['question_4b9576fc'] || []; const newValues = e.target.checked ? [...currentValues, 'Employee'] : currentValues.filter(v => v !== 'Employee'); handleInputChange('question_4b9576fc', newValues); }}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="question_4b9576fc_choice_0" className="text-sm text-gray-700">
                Employee
              </label>
            </div>
            <div key="Direct Manager" className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="question_4b9576fc_choice_1"
                checked={formData['question_4b9576fc'] && formData['question_4b9576fc'].includes('Direct Manager')}
                onChange={e => { const currentValues = formData['question_4b9576fc'] || []; const newValues = e.target.checked ? [...currentValues, 'Direct Manager'] : currentValues.filter(v => v !== 'Direct Manager'); handleInputChange('question_4b9576fc', newValues); }}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="question_4b9576fc_choice_1" className="text-sm text-gray-700">
                Direct Manager
              </label>
            </div>
            <div key="Department Head" className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="question_4b9576fc_choice_2"
                checked={formData['question_4b9576fc'] && formData['question_4b9576fc'].includes('Department Head')}
                onChange={e => { const currentValues = formData['question_4b9576fc'] || []; const newValues = e.target.checked ? [...currentValues, 'Department Head'] : currentValues.filter(v => v !== 'Department Head'); handleInputChange('question_4b9576fc', newValues); }}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="question_4b9576fc_choice_2" className="text-sm text-gray-700">
                Department Head
              </label>
            </div>
            <div key="HR Representative" className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="question_4b9576fc_choice_3"
                checked={formData['question_4b9576fc'] && formData['question_4b9576fc'].includes('HR Representative')}
                onChange={e => { const currentValues = formData['question_4b9576fc'] || []; const newValues = e.target.checked ? [...currentValues, 'HR Representative'] : currentValues.filter(v => v !== 'HR Representative'); handleInputChange('question_4b9576fc', newValues); }}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="question_4b9576fc_choice_3" className="text-sm text-gray-700">
                HR Representative
              </label>
            </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2 mb-6">
                  <label className="text-sm font-medium text-gray-700">
                    Meeting Agenda Notes
                  </label>
                  <div className="bg-white border border-gray-300 rounded-md">
                    <textarea
                      value={formData['question_dfbfa75a'] || ''}
                      onChange={e => handleInputChange('question_dfbfa75a', e.target.value)}
                      placeholder="Brief summary of discussion topics"
                      rows="4"
                      className="w-full px-4 py-3 text-sm text-gray-700 placeholder-gray-400 outline-none resize-none rounded-md focus:ring-2 focus:ring-blue-500 transition-colors"
                      
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2 w-full text-left">
                  <label className="text-sm md:text-base font-semibold">
                    Confirm to Close Review Cycle
                    *
                  </label>
                  <div className="space-y-2">
                    
            <div key="Yes" className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="question_5fe56cf9_choice_0"
                checked={formData['question_5fe56cf9'] && formData['question_5fe56cf9'].includes('Yes')}
                onChange={e => { const currentValues = formData['question_5fe56cf9'] || []; const newValues = e.target.checked ? [...currentValues, 'Yes'] : currentValues.filter(v => v !== 'Yes'); handleInputChange('question_5fe56cf9', newValues); }}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="question_5fe56cf9_choice_0" className="text-sm text-gray-700">
                Yes
              </label>
            </div>
                  </div>
                </div>
              
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}