-- ============================================
-- Workflow Management System - Database Initialization
-- This script creates all required tables and initial data
-- ============================================

USE master;
GO

-- Drop database if exists and recreate
IF EXISTS (SELECT name FROM sys.databases WHERE name = 'WorkflowDB')
BEGIN
    ALTER DATABASE WorkflowDB SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE WorkflowDB;
END
GO

CREATE DATABASE WorkflowDB;
GO

USE WorkflowDB;
GO

PRINT 'Database WorkflowDB created successfully.';
GO

-- ============================================
-- CORE SYSTEM TABLES
-- ============================================

-- Users table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Users')
BEGIN
    CREATE TABLE Users (
        Id INT PRIMARY KEY IDENTITY(1,1),
        Email NVARCHAR(255) NOT NULL UNIQUE,
        Password NVARCHAR(500) NOT NULL,
        FirstName NVARCHAR(100) NOT NULL,
        LastName NVARCHAR(100) NOT NULL,
        GenId NVARCHAR(100) NOT NULL,
        ProfilePicture NVARCHAR(MAX) NULL,
        Role NVARCHAR(50) NOT NULL,
        CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
        UpdatedAt DATETIME NULL
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Users_Email')
CREATE INDEX IX_Users_Email ON Users(Email);
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Users_Role')
CREATE INDEX IX_Users_Role ON Users(Role);
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Users_GenId')
CREATE INDEX IX_Users_GenId ON Users(GenId);
GO

-- Insert default admin user (password: Admin@123)
IF NOT EXISTS (SELECT * FROM Users WHERE Email = 'admin@workflow.com')
BEGIN
    INSERT INTO Users (Email, Password, FirstName, LastName, GenId, ProfilePicture, Role, CreatedAt)
    VALUES ('admin@workflow.com', '$2a$11$UH2L4R72/k/jmNXJpnEcsesTedOMHXYXg7nUAA11MU9/q46isiwUS', 'Admin', 'User', 'ADMIN001', NULL, 'Admin', GETDATE());
END
GO

-- Notifications table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Notifications')
BEGIN
    CREATE TABLE Notifications (
        NotificationId INT PRIMARY KEY IDENTITY(1,1),
        UserId INT NOT NULL,
        Title NVARCHAR(255) NOT NULL,
        Message NVARCHAR(MAX) NOT NULL,
        Type NVARCHAR(50) NOT NULL,
        RelatedFormType NVARCHAR(100) NULL,
        RelatedFormId INT NULL,
        RelatedWorkflowInstanceId INT NULL,
        FromUserId INT NULL,
        FromUserName NVARCHAR(200) NULL,
        FromUserRole NVARCHAR(50) NULL,
        IsRead BIT NOT NULL DEFAULT 0,
        CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
        FOREIGN KEY (UserId) REFERENCES Users(Id)
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Notifications_UserId')
CREATE INDEX IX_Notifications_UserId ON Notifications(UserId);
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Notifications_IsRead')
CREATE INDEX IX_Notifications_IsRead ON Notifications(IsRead);
GO

-- FormRoleMapping table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'FormRoleMapping')
BEGIN
    CREATE TABLE FormRoleMapping (
        MappingId INT PRIMARY KEY IDENTITY(1,1),
        FormType NVARCHAR(100) NOT NULL,
        AllowedRole NVARCHAR(50) NOT NULL,
        TargetRoles NVARCHAR(500) NULL
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_FormRoleMapping_FormType')
CREATE INDEX IX_FormRoleMapping_FormType ON FormRoleMapping(FormType);
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_FormRoleMapping_AllowedRole')
CREATE INDEX IX_FormRoleMapping_AllowedRole ON FormRoleMapping(AllowedRole);
GO

PRINT 'Core system tables created successfully.';
GO


-- ============================================
-- WORKFLOW MANAGEMENT TABLES
-- ============================================

-- WorkflowInstances table - Tracks each workflow execution
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'WorkflowInstances')
BEGIN
    CREATE TABLE WorkflowInstances (
        Id INT PRIMARY KEY IDENTITY(1,1),
        WorkflowName NVARCHAR(255) NOT NULL,
        FormType NVARCHAR(255) NOT NULL,
        InitiatedBy INT NOT NULL,
        InitiatorEmail NVARCHAR(255) NULL,
        InitiatorName NVARCHAR(200) NULL,
        CurrentTaskId NVARCHAR(255) NULL,
        CurrentTaskName NVARCHAR(500) NULL,
        CurrentRole NVARCHAR(100) NULL,
        NextRole NVARCHAR(100) NULL,
        Status NVARCHAR(50) NOT NULL DEFAULT 'Active',
        Priority NVARCHAR(20) NOT NULL DEFAULT 'Normal',
        DueDate DATETIME NULL,
        SubmittedFormData NVARCHAR(MAX) NULL,
        CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
        UpdatedAt DATETIME NULL,
        CompletedAt DATETIME NULL,
        FOREIGN KEY (InitiatedBy) REFERENCES Users(Id)
    );
END
GO

-- WorkflowTasks table - Individual tasks in workflow
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'WorkflowTasks')
BEGIN
    CREATE TABLE WorkflowTasks (
        Id INT PRIMARY KEY IDENTITY(1,1),
        WorkflowInstanceId INT NOT NULL,
        TaskId NVARCHAR(255) NOT NULL,
        TaskName NVARCHAR(500) NOT NULL,
        TaskRole NVARCHAR(100) NOT NULL,
        TaskSequence INT NOT NULL DEFAULT 0,
        AssignedTo INT NULL,
        AssignedToRole NVARCHAR(100) NOT NULL,
        Status NVARCHAR(50) NOT NULL DEFAULT 'Pending',
        Decision NVARCHAR(50) NULL,
        FormData NVARCHAR(MAX) NULL,
        FormType NVARCHAR(255) NULL,  -- NEW: Which form to show for this task
        RoleAppearanceIndex INT NOT NULL DEFAULT 0,  -- NEW: 0=first time, 1=second time, etc.
        Comments NVARCHAR(MAX) NULL,
        CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
        StartedAt DATETIME NULL,
        CompletedAt DATETIME NULL,
        CompletedBy INT NULL,
        CompletedByName NVARCHAR(200) NULL,
        FOREIGN KEY (WorkflowInstanceId) REFERENCES WorkflowInstances(Id) ON DELETE CASCADE,
        FOREIGN KEY (AssignedTo) REFERENCES Users(Id),
        FOREIGN KEY (CompletedBy) REFERENCES Users(Id)
    );
END
GO

-- WorkflowFiles table - File attachments
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'WorkflowFiles')
BEGIN
    CREATE TABLE WorkflowFiles (
        Id INT PRIMARY KEY IDENTITY(1,1),
        WorkflowInstanceId INT NOT NULL,
        TaskId INT NULL,
        FieldName NVARCHAR(255) NULL,
        FileName NVARCHAR(500) NOT NULL,
        OriginalFileName NVARCHAR(500) NOT NULL,
        FilePath NVARCHAR(1000) NOT NULL,
        FileSize BIGINT NOT NULL,
        ContentType NVARCHAR(200) NULL,
        UploadedBy INT NOT NULL,
        UploadedAt DATETIME NOT NULL DEFAULT GETDATE(),
        FOREIGN KEY (WorkflowInstanceId) REFERENCES WorkflowInstances(Id) ON DELETE CASCADE,
        FOREIGN KEY (TaskId) REFERENCES WorkflowTasks(Id),
        FOREIGN KEY (UploadedBy) REFERENCES Users(Id)
    );
END
GO

-- WorkflowHistory table - Comprehensive audit log
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'WorkflowHistory')
BEGIN
    CREATE TABLE WorkflowHistory (
        Id INT PRIMARY KEY IDENTITY(1,1),
        WorkflowInstanceId INT NOT NULL,
        TaskId INT NULL,
        Action NVARCHAR(100) NOT NULL,
        ActionDetails NVARCHAR(MAX) NULL,
        PerformedBy INT NOT NULL,
        PerformedByName NVARCHAR(200) NOT NULL,
        PerformedByRole NVARCHAR(100) NOT NULL,
        FromStatus NVARCHAR(50) NULL,
        ToStatus NVARCHAR(50) NULL,
        FromRole NVARCHAR(100) NULL,
        ToRole NVARCHAR(100) NULL,
        Decision NVARCHAR(50) NULL,
        Comments NVARCHAR(MAX) NULL,
        FormDataSnapshot NVARCHAR(MAX) NULL,
        Timestamp DATETIME NOT NULL DEFAULT GETDATE(),
        FOREIGN KEY (WorkflowInstanceId) REFERENCES WorkflowInstances(Id) ON DELETE CASCADE,
        FOREIGN KEY (TaskId) REFERENCES WorkflowTasks(Id),
        FOREIGN KEY (PerformedBy) REFERENCES Users(Id)
    );
END
GO

-- WorkflowRoleTasks table - Pending tasks per role
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'WorkflowRoleTasks')
BEGIN
    CREATE TABLE WorkflowRoleTasks (
        Id INT PRIMARY KEY IDENTITY(1,1),
        WorkflowInstanceId INT NOT NULL,
        TaskId INT NOT NULL,
        RoleName NVARCHAR(100) NOT NULL,
        Status NVARCHAR(50) NOT NULL DEFAULT 'Pending',
        AssignedAt DATETIME NOT NULL DEFAULT GETDATE(),
        ClaimedBy INT NULL,
        ClaimedAt DATETIME NULL,
        FOREIGN KEY (WorkflowInstanceId) REFERENCES WorkflowInstances(Id) ON DELETE CASCADE,
        FOREIGN KEY (TaskId) REFERENCES WorkflowTasks(Id),
        FOREIGN KEY (ClaimedBy) REFERENCES Users(Id)
    );
END
GO

-- Indexes for workflow tables
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_WorkflowInstances_Status')
CREATE INDEX IX_WorkflowInstances_Status ON WorkflowInstances(Status);
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_WorkflowInstances_InitiatedBy')
CREATE INDEX IX_WorkflowInstances_InitiatedBy ON WorkflowInstances(InitiatedBy);
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_WorkflowInstances_CurrentRole')
CREATE INDEX IX_WorkflowInstances_CurrentRole ON WorkflowInstances(CurrentRole);
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_WorkflowTasks_Status')
CREATE INDEX IX_WorkflowTasks_Status ON WorkflowTasks(Status);
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_WorkflowTasks_WorkflowInstanceId')
CREATE INDEX IX_WorkflowTasks_WorkflowInstanceId ON WorkflowTasks(WorkflowInstanceId);
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_WorkflowTasks_AssignedToRole')
CREATE INDEX IX_WorkflowTasks_AssignedToRole ON WorkflowTasks(AssignedToRole);
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_WorkflowRoleTasks_RoleName')
CREATE INDEX IX_WorkflowRoleTasks_RoleName ON WorkflowRoleTasks(RoleName);
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_WorkflowRoleTasks_Status')
CREATE INDEX IX_WorkflowRoleTasks_Status ON WorkflowRoleTasks(Status);
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_WorkflowHistory_WorkflowInstanceId')
CREATE INDEX IX_WorkflowHistory_WorkflowInstanceId ON WorkflowHistory(WorkflowInstanceId);
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_WorkflowHistory_PerformedBy')
CREATE INDEX IX_WorkflowHistory_PerformedBy ON WorkflowHistory(PerformedBy);
GO

PRINT 'Workflow management tables created successfully.';
GO


-- ============================================
-- WORKFLOW CONFIGURATION TABLE
-- ============================================

-- WorkflowConfigurations table - Store workflow definitions dynamically
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'WorkflowConfigurations')
BEGIN
    CREATE TABLE WorkflowConfigurations (
        Id INT PRIMARY KEY IDENTITY(1,1),
        WorkflowKey NVARCHAR(100) NOT NULL UNIQUE,
        WorkflowName NVARCHAR(255) NOT NULL,
        Description NVARCHAR(MAX) NULL,
        BpmnXml NVARCHAR(MAX) NULL,
        ConfigJson NVARCHAR(MAX) NOT NULL,
        IsActive BIT NOT NULL DEFAULT 1,
        CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
        UpdatedAt DATETIME NULL,
        CreatedBy INT NULL,
        FOREIGN KEY (CreatedBy) REFERENCES Users(Id)
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_WorkflowConfigurations_WorkflowKey')
CREATE INDEX IX_WorkflowConfigurations_WorkflowKey ON WorkflowConfigurations(WorkflowKey);
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_WorkflowConfigurations_IsActive')
CREATE INDEX IX_WorkflowConfigurations_IsActive ON WorkflowConfigurations(IsActive);
GO

PRINT 'WorkflowConfigurations table created successfully.';
GO


-- Schema for Direct_Manager___Confirms_Pending_Work_Handover_Status
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Direct_Manager___Confirms_Pending_Work_Handover_Status')
BEGIN
    CREATE TABLE Direct_Manager___Confirms_Pending_Work_Handover_Status (
        Id INT PRIMARY KEY IDENTITY(1,1),
        WorkflowInstanceId INT NULL,
        UserId INT NOT NULL,
        FormData NVARCHAR(MAX) NOT NULL,
        Status NVARCHAR(50) NOT NULL DEFAULT 'Pending',
        ApprovalStatus NVARCHAR(50) NULL,
        ApprovedBy INT NULL,
        ApprovalComments NVARCHAR(MAX) NULL,
        ApprovedAt DATETIME NULL,
        SubmittedAt DATETIME NOT NULL DEFAULT GETDATE(),
        UpdatedAt DATETIME NULL,
        FOREIGN KEY (WorkflowInstanceId) REFERENCES WorkflowInstances(Id) ON DELETE SET NULL,
        FOREIGN KEY (UserId) REFERENCES Users(Id),
        FOREIGN KEY (ApprovedBy) REFERENCES Users(Id)
    );
END
GO

-- Indexes for Direct_Manager___Confirms_Pending_Work_Handover_Status
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Direct_Manager___Confirms_Pending_Work_Handover_Status_WorkflowInstanceId')
CREATE INDEX IX_Direct_Manager___Confirms_Pending_Work_Handover_Status_WorkflowInstanceId ON Direct_Manager___Confirms_Pending_Work_Handover_Status(WorkflowInstanceId);
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Direct_Manager___Confirms_Pending_Work_Handover_Status_UserId')
CREATE INDEX IX_Direct_Manager___Confirms_Pending_Work_Handover_Status_UserId ON Direct_Manager___Confirms_Pending_Work_Handover_Status(UserId);
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Direct_Manager___Confirms_Pending_Work_Handover_Status_Status')
CREATE INDEX IX_Direct_Manager___Confirms_Pending_Work_Handover_Status_Status ON Direct_Manager___Confirms_Pending_Work_Handover_Status(Status);
GO

PRINT 'Direct_Manager___Confirms_Pending_Work_Handover_Status table created successfully.';
GO


-- Schema for Finance_Officer___Processes_Final_Settlement_With_Pending_Salary,_Le...
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Finance_Officer___Processes_Final_Settlement_With_Pending_Salary,_Le...')
BEGIN
    CREATE TABLE Finance_Officer___Processes_Final_Settlement_With_Pending_Salary,_Le... (
        Id INT PRIMARY KEY IDENTITY(1,1),
        WorkflowInstanceId INT NULL,
        UserId INT NOT NULL,
        FormData NVARCHAR(MAX) NOT NULL,
        Status NVARCHAR(50) NOT NULL DEFAULT 'Pending',
        ApprovalStatus NVARCHAR(50) NULL,
        ApprovedBy INT NULL,
        ApprovalComments NVARCHAR(MAX) NULL,
        ApprovedAt DATETIME NULL,
        SubmittedAt DATETIME NOT NULL DEFAULT GETDATE(),
        UpdatedAt DATETIME NULL,
        FOREIGN KEY (WorkflowInstanceId) REFERENCES WorkflowInstances(Id) ON DELETE SET NULL,
        FOREIGN KEY (UserId) REFERENCES Users(Id),
        FOREIGN KEY (ApprovedBy) REFERENCES Users(Id)
    );
END
GO

-- Indexes for Finance_Officer___Processes_Final_Settlement_With_Pending_Salary,_Le...
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Finance_Officer___Processes_Final_Settlement_With_Pending_Salary,_Le..._WorkflowInstanceId')
CREATE INDEX IX_Finance_Officer___Processes_Final_Settlement_With_Pending_Salary,_Le..._WorkflowInstanceId ON Finance_Officer___Processes_Final_Settlement_With_Pending_Salary,_Le...(WorkflowInstanceId);
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Finance_Officer___Processes_Final_Settlement_With_Pending_Salary,_Le..._UserId')
CREATE INDEX IX_Finance_Officer___Processes_Final_Settlement_With_Pending_Salary,_Le..._UserId ON Finance_Officer___Processes_Final_Settlement_With_Pending_Salary,_Le...(UserId);
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Finance_Officer___Processes_Final_Settlement_With_Pending_Salary,_Le..._Status')
CREATE INDEX IX_Finance_Officer___Processes_Final_Settlement_With_Pending_Salary,_Le..._Status ON Finance_Officer___Processes_Final_Settlement_With_Pending_Salary,_Le...(Status);
GO

PRINT 'Finance_Officer___Processes_Final_Settlement_With_Pending_Salary,_Le... table created successfully.';
GO


-- Schema for HR_Representative___Initiates_Offboarding_By_Entering_Employee_Name,_L...
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'HR_Representative___Initiates_Offboarding_By_Entering_Employee_Name,_L...')
BEGIN
    CREATE TABLE HR_Representative___Initiates_Offboarding_By_Entering_Employee_Name,_L... (
        Id INT PRIMARY KEY IDENTITY(1,1),
        WorkflowInstanceId INT NULL,
        UserId INT NOT NULL,
        FormData NVARCHAR(MAX) NOT NULL,
        Status NVARCHAR(50) NOT NULL DEFAULT 'Pending',
        ApprovalStatus NVARCHAR(50) NULL,
        ApprovedBy INT NULL,
        ApprovalComments NVARCHAR(MAX) NULL,
        ApprovedAt DATETIME NULL,
        SubmittedAt DATETIME NOT NULL DEFAULT GETDATE(),
        UpdatedAt DATETIME NULL,
        FOREIGN KEY (WorkflowInstanceId) REFERENCES WorkflowInstances(Id) ON DELETE SET NULL,
        FOREIGN KEY (UserId) REFERENCES Users(Id),
        FOREIGN KEY (ApprovedBy) REFERENCES Users(Id)
    );
END
GO

-- Indexes for HR_Representative___Initiates_Offboarding_By_Entering_Employee_Name,_L...
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_HR_Representative___Initiates_Offboarding_By_Entering_Employee_Name,_L..._WorkflowInstanceId')
CREATE INDEX IX_HR_Representative___Initiates_Offboarding_By_Entering_Employee_Name,_L..._WorkflowInstanceId ON HR_Representative___Initiates_Offboarding_By_Entering_Employee_Name,_L...(WorkflowInstanceId);
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_HR_Representative___Initiates_Offboarding_By_Entering_Employee_Name,_L..._UserId')
CREATE INDEX IX_HR_Representative___Initiates_Offboarding_By_Entering_Employee_Name,_L..._UserId ON HR_Representative___Initiates_Offboarding_By_Entering_Employee_Name,_L...(UserId);
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_HR_Representative___Initiates_Offboarding_By_Entering_Employee_Name,_L..._Status')
CREATE INDEX IX_HR_Representative___Initiates_Offboarding_By_Entering_Employee_Name,_L..._Status ON HR_Representative___Initiates_Offboarding_By_Entering_Employee_Name,_L...(Status);
GO

PRINT 'HR_Representative___Initiates_Offboarding_By_Entering_Employee_Name,_L... table created successfully.';
GO


-- Schema for IT_Administrator___Revokes_System_Access_And_Collects_Equipment_Inclu...
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'IT_Administrator___Revokes_System_Access_And_Collects_Equipment_Inclu...')
BEGIN
    CREATE TABLE IT_Administrator___Revokes_System_Access_And_Collects_Equipment_Inclu... (
        Id INT PRIMARY KEY IDENTITY(1,1),
        WorkflowInstanceId INT NULL,
        UserId INT NOT NULL,
        FormData NVARCHAR(MAX) NOT NULL,
        Status NVARCHAR(50) NOT NULL DEFAULT 'Pending',
        ApprovalStatus NVARCHAR(50) NULL,
        ApprovedBy INT NULL,
        ApprovalComments NVARCHAR(MAX) NULL,
        ApprovedAt DATETIME NULL,
        SubmittedAt DATETIME NOT NULL DEFAULT GETDATE(),
        UpdatedAt DATETIME NULL,
        FOREIGN KEY (WorkflowInstanceId) REFERENCES WorkflowInstances(Id) ON DELETE SET NULL,
        FOREIGN KEY (UserId) REFERENCES Users(Id),
        FOREIGN KEY (ApprovedBy) REFERENCES Users(Id)
    );
END
GO

-- Indexes for IT_Administrator___Revokes_System_Access_And_Collects_Equipment_Inclu...
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_IT_Administrator___Revokes_System_Access_And_Collects_Equipment_Inclu..._WorkflowInstanceId')
CREATE INDEX IX_IT_Administrator___Revokes_System_Access_And_Collects_Equipment_Inclu..._WorkflowInstanceId ON IT_Administrator___Revokes_System_Access_And_Collects_Equipment_Inclu...(WorkflowInstanceId);
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_IT_Administrator___Revokes_System_Access_And_Collects_Equipment_Inclu..._UserId')
CREATE INDEX IX_IT_Administrator___Revokes_System_Access_And_Collects_Equipment_Inclu..._UserId ON IT_Administrator___Revokes_System_Access_And_Collects_Equipment_Inclu...(UserId);
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_IT_Administrator___Revokes_System_Access_And_Collects_Equipment_Inclu..._Status')
CREATE INDEX IX_IT_Administrator___Revokes_System_Access_And_Collects_Equipment_Inclu..._Status ON IT_Administrator___Revokes_System_Access_And_Collects_Equipment_Inclu...(Status);
GO

PRINT 'IT_Administrator___Revokes_System_Access_And_Collects_Equipment_Inclu... table created successfully.';
GO


-- ============================================
-- FORM ROLE MAPPING DATA
-- ============================================

-- Clear existing mappings
DELETE FROM FormRoleMapping;
GO

INSERT INTO FormRoleMapping (FormType, AllowedRole, TargetRoles) VALUES ('hr-representative---initiates-offboarding-by-entering-employee-name,-l...', 'HR_Representative', 'Admin');
INSERT INTO FormRoleMapping (FormType, AllowedRole, TargetRoles) VALUES ('hr-representative---initiates-offboarding-by-entering-employee-name,-l...', 'Admin', 'Admin');
INSERT INTO FormRoleMapping (FormType, AllowedRole, TargetRoles) VALUES ('direct-manager---confirms-pending-work-handover-status', 'Direct_Manager', 'Admin');
INSERT INTO FormRoleMapping (FormType, AllowedRole, TargetRoles) VALUES ('direct-manager---confirms-pending-work-handover-status', 'Admin', 'Admin');
INSERT INTO FormRoleMapping (FormType, AllowedRole, TargetRoles) VALUES ('it-administrator---revokes-system-access-and-collects-equipment-inclu...', 'IT_Administrator', 'Admin');
INSERT INTO FormRoleMapping (FormType, AllowedRole, TargetRoles) VALUES ('it-administrator---revokes-system-access-and-collects-equipment-inclu...', 'Admin', 'Admin');
INSERT INTO FormRoleMapping (FormType, AllowedRole, TargetRoles) VALUES ('finance-officer---processes-final-settlement-with-pending-salary,-le...', 'Finance_Officer', 'Admin');
INSERT INTO FormRoleMapping (FormType, AllowedRole, TargetRoles) VALUES ('finance-officer---processes-final-settlement-with-pending-salary,-le...', 'Admin', 'Admin');
GO

PRINT 'Form role mappings created successfully.';
GO
-- ============================================
-- Verification
-- ============================================

PRINT '';
PRINT '===========================================';
PRINT 'Database initialization completed!';
PRINT '===========================================';
PRINT '';

-- Display created tables
SELECT 
    TABLE_SCHEMA,
    TABLE_NAME,
    TABLE_TYPE
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_TYPE = 'BASE TABLE'
ORDER BY TABLE_NAME;
GO

PRINT '';
PRINT 'All tables created successfully.';
GO
