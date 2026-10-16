// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { Layout } from './components/Layout';
// import { ProtectedRoute } from './components/ProtectedRoute';

// import Login from './pages/Auth/Login';
// import Register from './pages/Auth/Register';

// import Projects from './pages/shared/Projects';
// import Tasks from './pages/shared/Tasks';
// import Resources from './pages/shared/Resources';
// import Leads from './pages/shared/Leads';
// import Emails from './pages/shared/Emails';
// import Calendar from './pages/shared/Calendar';
// import Engagements from './pages/shared/Engagements';
// import AuditLogs from './pages/shared/AuditLogs';
// import Profile from './pages/shared/Profile';
// import Notifications from './pages/shared/Notifications';
// import Settings from './pages/shared/Settings';
// import ProjectDetail from './pages/shared/ProjectDetail';
// import Pending from './pages/Auth/Pending';
// import ProjectForm from './pages/shared/ProjectForm';
// import TaskForm from './pages/shared/TaskForm';
// import TaskDetail from './pages/shared/TaskDetail';
// import UpdateTask from './pages/Intern/UpdateTask';
// import LeadDetail from './pages/shared/LeadDetail';
// import LeadFollowUp from './pages/shared/LeadFollowUp';
// import EmailCompose from './pages/shared/EmailCompose';
// import EmailTemplates from './pages/shared/EmailTemplates';
// import MeetingForm from './pages/shared/MeetingForm';
// import EngagementSheet from './pages/shared/EngagementSheet';
// import Progress from './pages/shared/Progress';
// import Team from './pages/shared/Team';

// import SuperAdminDashboard from './pages/SuperAdmin/Dashboard';
// import UserManagement from './pages/SuperAdmin/UserManagement';
// import RegistrationApproval from './pages/SuperAdmin/RegistrationApproval';
// import AdminDashboard from './pages/Admin/Dashboard';
// import ManagerDashboard from './pages/Manager/Dashboard';
// import InternDashboard from './pages/Intern/Dashboard';
// import MyTasks from './pages/Intern/MyTasks';
// import ViewerDashboard from './pages/Viewer/Dashboard';
// import Reports from './pages/Viewer/Reports';

// function App() {
//   return ( 
//     <Router>
//       <Routes>
//         <Route path="/" element={<Login />} />
//         <Route path="/register" element={<Register />} />
//         <Route path="/pending" element={<Pending />} />
//         {/* SUPER ADMIN */}
//         <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><Layout role="superadmin" /></ProtectedRoute>}>
//           <Route path="/superadmin/dashboard" element={<SuperAdminDashboard />} />
//           <Route path="/superadmin/users" element={<UserManagement />} />
//           <Route path="/superadmin/registrations" element={<RegistrationApproval />} />
//           <Route path="/superadmin/projects" element={<Projects role="superadmin" />} />
//           <Route path="/superadmin/projects/:id" element={<ProjectDetail role="superadmin" />} />
//           <Route path="/superadmin/tasks" element={<Tasks role="superadmin" />} />
//           <Route path="/superadmin/resources" element={<Resources role="superadmin" />} />
//           <Route path="/superadmin/leads" element={<Leads role="superadmin" />} />
//           <Route path="/superadmin/emails" element={<Emails role="superadmin" />} />
//           <Route path="/superadmin/calendar" element={<Calendar role="superadmin" />} />
//           <Route path="/superadmin/engagements" element={<Engagements role="superadmin" />} />
//           <Route path="/superadmin/audit" element={<AuditLogs role="superadmin" />} />
//           <Route path="/superadmin/profile" element={<Profile />} />
//           <Route path="/superadmin/notifications" element={<Notifications />} />
//           <Route path="/superadmin/settings" element={<Settings />} />
//           <Route path="/superadmin/projects/new" element={<ProjectForm mode="create" />} />
//           <Route path="/superadmin/projects/:id/edit" element={<ProjectForm mode="edit" />} />
//           <Route path="/superadmin/tasks/new" element={<TaskForm mode="create" />} />
//           <Route path="/superadmin/tasks/:id" element={<TaskDetail role="superadmin" />} />
//           <Route path="/superadmin/tasks/:id/edit" element={<TaskForm mode="edit" />} />
//           <Route path="/superadmin/leads/:id" element={<LeadDetail role="superadmin" />} />
//           <Route path="/superadmin/leads/:id/follow-up" element={<LeadFollowUp />} />
//           <Route path="/superadmin/emails/compose" element={<EmailCompose />} />
//           <Route path="/superadmin/emails/templates" element={<EmailTemplates />} />
//           <Route path="/superadmin/calendar/new" element={<MeetingForm />} />
//           <Route path="/superadmin/engagements/:id" element={<EngagementSheet />} />
//           <Route path="/superadmin/progress" element={<Progress role="superadmin" />} />
//         </Route>

//         {/* ADMIN */}
//         <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}><Layout role="admin" /></ProtectedRoute>}>
//           <Route path="/admin/dashboard" element={<AdminDashboard />} />
//           <Route path="/admin/projects" element={<Projects role="admin" />} />
//           <Route path="/admin/projects/:id" element={<ProjectDetail role="admin" />} />
//           <Route path="/admin/tasks" element={<Tasks role="admin" />} />
//           <Route path="/admin/resources" element={<Resources role="admin" />} />
//           <Route path="/admin/profile" element={<Profile />} />
//           <Route path="/admin/notifications" element={<Notifications />} />
//           <Route path="/admin/settings" element={<Settings />} />
//           <Route path="/admin/projects/new" element={<ProjectForm mode="create" />} />
//           <Route path="/admin/projects/:id/edit" element={<ProjectForm mode="edit" />} />
//           <Route path="/admin/tasks/new" element={<TaskForm mode="create" />} />
//           <Route path="/admin/tasks/:id" element={<TaskDetail role="admin" />} />
//         </Route>

//         {/* MANAGER */}
//         <Route element={<ProtectedRoute allowedRoles={['MANAGER', 'SUPER_ADMIN']}><Layout role="manager" /></ProtectedRoute>}>
//           <Route path="/manager/dashboard" element={<ManagerDashboard />} />
//           <Route path="/manager/projects" element={<Projects role="manager" />} />
//           <Route path="/manager/projects/:id" element={<ProjectDetail role="manager" />} />
//           <Route path="/manager/tasks" element={<Tasks role="manager" />} />
//           <Route path="/manager/resources" element={<Resources role="manager" />} />
//           <Route path="/manager/profile" element={<Profile />} />
//           <Route path="/manager/notifications" element={<Notifications />} />
//           <Route path="/manager/settings" element={<Settings />} />
//           <Route path="/manager/projects/:id/edit" element={<ProjectForm mode="edit" />} />
//           <Route path="/manager/tasks/:id" element={<TaskDetail role="manager" />} />
//           <Route path="/manager/team" element={<Team />} />
//           <Route path="/manager/progress" element={<Progress role="manager" />} />
//         </Route>

//         {/* INTERN */}
//         <Route element={<ProtectedRoute allowedRoles={['INTERN']}><Layout role="intern" /></ProtectedRoute>}>
//           <Route path="/intern/dashboard" element={<InternDashboard />} />
//           <Route path="/intern/tasks" element={<MyTasks />} />
//           <Route path="/intern/profile" element={<Profile />} />
//           <Route path="/intern/notifications" element={<Notifications />} />
//           <Route path="/intern/settings" element={<Settings />} />
//           <Route path="/intern/tasks/:id" element={<UpdateTask />} />
//         </Route>

//         {/* VIEWER */}
//         <Route element={<ProtectedRoute allowedRoles={['VIEWER', 'SUPER_ADMIN']}><Layout role="viewer" /></ProtectedRoute>}>
//           <Route path="/viewer/dashboard" element={<ViewerDashboard />} />
//           <Route path="/viewer/reports" element={<Reports />} />
//           <Route path="/viewer/projects" element={<Projects role="viewer" />} />
//           <Route path="/viewer/tasks" element={<Tasks role="viewer" />} />
//           <Route path="/viewer/resources" element={<Resources role="viewer" />} />
//           <Route path="/viewer/profile" element={<Profile />} />
//           <Route path="/viewer/notifications" element={<Notifications />} />
//           <Route path="/viewer/settings" element={<Settings />} />
//           <Route path="/viewer/progress" element={<Progress role="viewer" />} />
//           <Route path="/viewer/engagements" element={<Engagements role="viewer" />} />
//           <Route path="/viewer/engagements/:id" element={<EngagementSheet />} />
//         </Route>

//         <Route path="*" element={<Navigate to="/" replace />} />
//       </Routes>
//     </Router>
//   );
// }

// export default App;




import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';

// Auth
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Pending from './pages/Auth/Pending';
import ForgotPassword from './pages/Auth/ForgotPassword';

// Shared
import Projects from './pages/shared/Projects';
import ProjectDetail from './pages/shared/ProjectDetail';
import ProjectForm from './pages/shared/ProjectForm';
import Tasks from './pages/shared/Tasks';
import TaskDetail from './pages/shared/TaskDetail';
import TaskForm from './pages/shared/TaskForm';
import Resources from './pages/shared/Resources';
import Leads from './pages/shared/Leads';
import LeadDetail from './pages/shared/LeadDetail';
import LeadFollowUp from './pages/shared/LeadFollowUp';
import Emails from './pages/shared/Emails';
import EmailCompose from './pages/shared/EmailCompose';
import EmailTemplates from './pages/shared/EmailTemplates';
import EmailDetail from './pages/shared/EmailDetail';
import Calendar from './pages/shared/Calendar';
import MeetingForm from './pages/shared/MeetingForm';
import Engagements from './pages/shared/Engagements';
import EngagementSheet from './pages/shared/EngagementSheet';
import Progress from './pages/shared/Progress';
import Team from './pages/shared/Team';
import AuditLogs from './pages/shared/AuditLogs';
import Notifications from './pages/shared/Notifications';
import Settings from './pages/shared/Settings';
import UpdateTask from './pages/Intern/UpdateTask';

// Role Dashboards
import SuperAdminDashboard from './pages/SuperAdmin/Dashboard';
import UserManagement from './pages/SuperAdmin/UserManagement';
import RegistrationApproval from './pages/SuperAdmin/RegistrationApproval';
import AdminDashboard from './pages/Admin/Dashboard';
import ManagerDashboard from './pages/Manager/Dashboard';
import InternDashboard from './pages/Intern/Dashboard';
import MyTasks from './pages/Intern/MyTasks';
import ViewerDashboard from './pages/Viewer/Dashboard';
import Reports from './pages/Viewer/Reports';

function App() {
  return (
    <Router>
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/pending" element={<Pending />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        {/* ==================== SUPER ADMIN ==================== */}
        <Route
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
              <Layout role="superadmin" />
            </ProtectedRoute>
          }
        >
          <Route path="/superadmin/dashboard" element={<SuperAdminDashboard />} />
          <Route path="/superadmin/users" element={<UserManagement />} />
          <Route path="/superadmin/registrations" element={<RegistrationApproval />} />

          {/* Projects */}
          <Route path="/superadmin/projects" element={<Projects role="superadmin" />} />
          <Route path="/superadmin/projects/new" element={<ProjectForm mode="create" />} />
          <Route path="/superadmin/projects/:id" element={<ProjectDetail role="superadmin" />} />
          <Route path="/superadmin/projects/:id/edit" element={<ProjectForm mode="edit" />} />

          {/* Tasks */}
          <Route path="/superadmin/tasks" element={<Tasks role="superadmin" />} />
          <Route path="/superadmin/tasks/new" element={<TaskForm mode="create" />} />
          <Route path="/superadmin/tasks/:id" element={<TaskDetail role="superadmin" />} />
          <Route path="/superadmin/tasks/:id/edit" element={<TaskForm mode="edit" />} />

          {/* Resources */}
          <Route path="/superadmin/resources" element={<Resources role="superadmin" />} />

          {/* Leads */}
          <Route path="/superadmin/leads" element={<Leads role="superadmin" />} />
          <Route path="/superadmin/leads/:id" element={<LeadDetail role="superadmin" />} />
          <Route path="/superadmin/leads/:id/follow-up" element={<LeadFollowUp />} />

          {/* Emails */}
          <Route path="/superadmin/emails" element={<Emails role="superadmin" />} />
          <Route path="/superadmin/emails/compose" element={<EmailCompose />} />
          <Route path="/superadmin/emails/templates" element={<EmailTemplates />} />
          <Route path="/superadmin/emails/:id" element={<EmailDetail />} />
          {/* Calendar */}
          <Route path="/superadmin/calendar" element={<Calendar role="superadmin" />} />
          <Route path="/superadmin/calendar/new" element={<MeetingForm />} />

          {/* Engagements */}
          <Route path="/superadmin/engagements" element={<Engagements role="superadmin" />} />
          <Route path="/superadmin/engagements/:id" element={<EngagementSheet role="superadmin" />} />

          {/* Progress */}
          <Route path="/superadmin/progress" element={<Progress role="superadmin" />} />

          {/* Audit */}
          <Route path="/superadmin/audit" element={<AuditLogs role="superadmin" />} />

          {/* User */}
          <Route path="/superadmin/notifications" element={<Notifications />} />
          <Route path="/superadmin/settings" element={<Settings />} />
        </Route>

        {/* ==================== ADMIN ==================== */}
        <Route
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
              <Layout role="admin" />
            </ProtectedRoute>
          }
        >
          <Route path="/admin/dashboard" element={<AdminDashboard />} />

          {/* Projects */}
          <Route path="/admin/projects" element={<Projects role="admin" />} />
          <Route path="/admin/projects/new" element={<ProjectForm mode="create" />} />
          <Route path="/admin/projects/:id" element={<ProjectDetail role="admin" />} />
          <Route path="/admin/projects/:id/edit" element={<ProjectForm mode="edit" />} />

          {/* Tasks */}
          <Route path="/admin/tasks" element={<Tasks role="admin" />} />
          <Route path="/admin/tasks/new" element={<TaskForm mode="create" />} />
          <Route path="/admin/tasks/:id" element={<TaskDetail role="admin" />} />
          <Route path="/admin/tasks/:id/edit" element={<TaskForm mode="edit" />} />

          {/* Resources */}
          <Route path="/admin/resources" element={<Resources role="admin" />} />

          {/* User */}
         
          <Route path="/admin/notifications" element={<Notifications />} />
          <Route path="/admin/settings" element={<Settings />} />
          <Route path="/admin/calendar" element={<Calendar role="admin" />} />
        </Route>

        {/* ==================== MANAGER ==================== */}
        <Route
          element={
            <ProtectedRoute allowedRoles={['MANAGER', 'SUPER_ADMIN']}>
              <Layout role="manager" />
            </ProtectedRoute>
          }
        >
          <Route path="/manager/dashboard" element={<ManagerDashboard />} />

          {/* Projects */}
          <Route path="/manager/projects" element={<Projects role="manager" />} />
          <Route path="/manager/projects/:id" element={<ProjectDetail role="manager" />} />
          <Route path="/manager/projects/:id/edit" element={<ProjectForm mode="edit" />} />

          {/* Tasks */}
          <Route path="/manager/tasks" element={<Tasks role="manager" />} />
          <Route path="/manager/tasks/new" element={<TaskForm mode="create" />} />
          <Route path="/manager/tasks/:id" element={<TaskDetail role="manager" />} />
          <Route path="/manager/tasks/:id/edit" element={<TaskForm mode="edit" />} />

          {/* Resources */}
          <Route path="/manager/resources" element={<Resources role="manager" />} />

          {/* Team & Progress */}
          <Route path="/manager/team" element={<Team />} />
          <Route path="/manager/progress" element={<Progress role="manager" />} />

          {/* User */}
          
          <Route path="/manager/notifications" element={<Notifications />} />
          <Route path="/manager/settings" element={<Settings />} />
          <Route path="/manager/calendar" element={<Calendar role="manager" />} />
        </Route>

        {/* ==================== INTERN ==================== */}
        <Route
          element={
            <ProtectedRoute allowedRoles={['INTERN']}>
              <Layout role="intern" />
            </ProtectedRoute>
          }
        >
          <Route path="/intern/dashboard" element={<InternDashboard />} />
          <Route path="/intern/tasks" element={<MyTasks />} />
          <Route path="/intern/tasks/:id" element={<UpdateTask />} />
          
          <Route path="/intern/notifications" element={<Notifications />} />
          <Route path="/intern/settings" element={<Settings />} />
          <Route path="/intern/calendar" element={<Calendar role="intern" />} />
        </Route>

        {/* ==================== VIEWER ==================== */}
        <Route
          element={
            <ProtectedRoute allowedRoles={['VIEWER', 'SUPER_ADMIN']}>
              <Layout role="viewer" />
            </ProtectedRoute>
          }
        >
          <Route path="/viewer/dashboard" element={<ViewerDashboard />} />
          <Route path="/viewer/reports" element={<Reports />} />

          {/* Projects */}
          <Route path="/viewer/projects" element={<Projects role="viewer" />} />
          <Route path="/viewer/projects/:id" element={<ProjectDetail role="viewer" />} />

          {/* Tasks */}
          <Route path="/viewer/tasks" element={<Tasks role="viewer" />} />
          <Route path="/viewer/tasks/:id" element={<TaskDetail role="viewer" />} />

          {/* Resources */}
          <Route path="/viewer/resources" element={<Resources role="viewer" />} />

          {/* Engagements */}
          <Route path="/viewer/engagements" element={<Engagements role="viewer" />} />
          <Route path="/viewer/engagements/:id" element={<EngagementSheet role="viewer" />} />

          {/* Progress */}
          <Route path="/viewer/progress" element={<Progress role="viewer" />} />

          {/* User */}
          
          <Route path="/viewer/notifications" element={<Notifications />} />
          <Route path="/viewer/settings" element={<Settings />} />
        </Route>

        {/* CATCH ALL */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;