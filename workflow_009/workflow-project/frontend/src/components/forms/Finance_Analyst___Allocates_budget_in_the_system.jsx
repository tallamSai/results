import React, { useState, useEffect } from 'react';
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

export default function FinanceAnalystAllocatesbudgetinthesystem({ workflowInstanceId = null, previousStageData = null, onSubmit, loading, initialData = {}, disabled = false }) {
  const [formData, setFormData] = useState(initialData);
  
  // Update formData when initialData changes (important for read-only display)
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      console.log(`📝 Form (FinanceAnalystAllocatesbudgetinthesystem): Loading initialData:`, initialData);
      setFormData(initialData);
    }
  }, [initialData]);
  
  // Convert File to base64 with metadata
  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          data: reader.result,
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };
  
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

  const handleInputChange = async (field, value) => {
    if (disabled) return; // Prevent changes when disabled
    
    // If value is a File object, convert to base64 with metadata
    let processedValue = value;
    if (value instanceof File) {
      try {
        processedValue = await convertFileToBase64(value);
        console.log(`📎 File converted for ${field}:`, {
          name: processedValue.name,
          size: `${(processedValue.size / 1024).toFixed(2)} KB`,
          type: processedValue.type
        });
      } catch (error) {
        console.error(`Error converting file ${field}:`, error);
        alert(`Failed to process file: ${value.name}`);
        return;
      }
    }
    
    const newData = { ...formData, [field]: processedValue };
    setFormData(newData);
    if (onDataChange) {
      onDataChange(newData);
    }
  };

const handleSubmit = (e) => {
    e.preventDefault();
    if (disabled) return;
    if (onSubmit) {
      onSubmit(formData);
    } else {
      console.log('Form submitted with data:', formData);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar 
        userName={userName}
        userRole={userRole}
      />
      <EmployeeHeader 
        title="Finance Analyst - Allocates budget in the system"
        subtitle="Finance Analyst Process"
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
          <span className="text-gray-900 font-medium">Finance Analyst - Allocates budget in the system</span>
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
                    Recommended Budget Status <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={formData['question_1f58ef38'] || ''}
                      onChange={e => handleInputChange('question_1f58ef38', e.target.value)}
                      className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white"
                      required
                    >
                      <option value="">Select an option</option>
                      <option value="Approved">Approved</option><option value="Approved with Modifications">Approved with Modifications</option><option value="Rejected">Rejected</option>
                    </select>
                    <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">
                    Recommended Allocation Amount <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData['question_c32ec387'] || ''}
                    onChange={e => handleInputChange('question_c32ec387', e.target.value)}
                    placeholder="Enter recommended budget amount"
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    required
                    min="0"
                    
                  />
                </div>
              </div>
                <div className="flex flex-col gap-2 mb-6">
                  <label className="text-sm font-medium text-gray-700">
                    Reasons for Recommendation <span className="text-red-500">*</span>
                  </label>
                  <div className="bg-white border border-gray-300 rounded-md">
                    <textarea
                      value={formData['question_b9fed3b8'] || ''}
                      onChange={e => handleInputChange('question_b9fed3b8', e.target.value)}
                      placeholder="Explain the rationale for approval/rejection/adjustments"
                      rows="4"
                      className="w-full px-4 py-3 text-sm text-gray-700 placeholder-gray-400 outline-none resize-none rounded-md focus:ring-2 focus:ring-blue-500 transition-colors"
                      required
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2 mb-6">
                  <label className="text-sm font-medium text-gray-700">
                    Additional Notes/Comments
                  </label>
                  <div className="bg-white border border-gray-300 rounded-md">
                    <textarea
                      value={formData['question_d92b8fd9'] || ''}
                      onChange={e => handleInputChange('question_d92b8fd9', e.target.value)}
                      placeholder="Include any supporting details or concerns"
                      rows="4"
                      className="w-full px-4 py-3 text-sm text-gray-700 placeholder-gray-400 outline-none resize-none rounded-md focus:ring-2 focus:ring-blue-500 transition-colors"
                      
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2 w-full text-left">
                  <label className="text-sm md:text-base font-semibold">
                    Supporting Documentation
                    
                  </label>
                  <div className="flex items-center justify-between border rounded-lg p-3 bg-gray-50 gap-6 w-fit">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col text-sm text-gray-600">
                        <span className="font-medium">Choose a File</span>
                        <span className="text-xs text-gray-500">PDF format • Max. 3MB</span>
                      </div>
                      <label className="px-4 py-1 border rounded-md text-sm text-sky-600 border-sky-600 hover:bg-sky-50 cursor-pointer">
                        Attach
                        <input
                          type="file"
                          accept="application/pdf"
                          onChange={e => { const file = e.target.files[0]; if (file && file.size <= 3 * 1024 * 1024) { handleInputChange('question_39bd5b85', file); } else if (file) { alert('File size should not exceed 3MB'); } } }
                          className="hidden"
                        />
                      </label>
                    </div>
                    {formData['question_39bd5b85'] && (
                      <div className="flex items-center gap-3 border-l pl-4">
                        <div className="w-8 h-8 bg-red-100 flex items-center justify-center rounded">
                          <span className="text-xs font-bold text-red-600">PDF</span>
                        </div>
                        <div className="flex flex-col text-sm">
                          <span className="font-medium">{formData['question_39bd5b85'].name}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(formData['question_39bd5b85'].lastModified).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} 
                            • {(formData['question_39bd5b85'].size / (1024 * 1024)).toFixed(1)}MB
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleInputChange('question_39bd5b85', null)}
                          className="ml-2 text-red-500 hover:text-red-700 text-sm">
                          🗑
                        </button>
                      </div>
                    )}
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