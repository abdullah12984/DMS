import React, { useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Sidebar = ({ role, isOpen, onClose }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Close sidebar on route change (mobile)
  useEffect(() => {
    if (onClose) onClose();
  }, [location.pathname]);

  const menus = {
    superadmin: [
      { name: 'Dashboard', path: '/superadmin/dashboard', },
      { name: 'Users', path: '/superadmin/users', },
      { name: 'Registrations', path: '/superadmin/registrations',  },
      { name: 'Projects', path: '/superadmin/projects',  },
      { name: 'Tasks', path: '/superadmin/tasks',  },
      { name: 'Resources', path: '/superadmin/resources', },
      { name: 'Leads', path: '/superadmin/leads',  },
      { name: 'Emails', path: '/superadmin/emails',  },
      { name: 'Calendar', path: '/superadmin/calendar', },
      { name: 'Engagements', path: '/superadmin/engagements', },
      { name: 'Audit Logs', path: '/superadmin/audit', },
      { name: 'Notifications', path: '/superadmin/notifications', },
      { name: 'Settings', path: '/superadmin/settings',  },
    ],
    admin: [
      { name: 'Dashboard', path: '/admin/dashboard',  },
      { name: 'Projects', path: '/admin/projects', },
      { name: 'Tasks', path: '/admin/tasks',  },
      { name: 'Resources', path: '/admin/resources',  },
      { name: 'Calendar', path: '/admin/calendar',  },
      { name: 'Notifications', path: '/admin/notifications', },
      { name: 'Settings', path: '/admin/settings',  },
    ],
    manager: [
      { name: 'Dashboard', path: '/manager/dashboard', },
      { name: 'My Projects', path: '/manager/projects',  },
      { name: 'Team Tasks', path: '/manager/tasks',  },
      { name: 'Resources', path: '/manager/resources',  },
      { name: 'Calendar', path: '/manager/calendar', }, 
      { name: 'Notifications', path: '/manager/notifications', },
      { name: 'Settings', path: '/manager/settings', },
    ],
    intern: [
      { name: 'Dashboard', path: '/intern/dashboard',},
      { name: 'My Tasks', path: '/intern/tasks', },
      { name: 'Calendar', path: '/intern/calendar', }, 
      { name: 'Notifications', path: '/intern/notifications',  },
      { name: 'Settings', path: '/intern/settings',  },
    ],
    viewer: [
      { name: 'Dashboard', path: '/viewer/dashboard', },
      { name: 'Reports', path: '/viewer/reports',  },
      { name: 'Projects', path: '/viewer/projects',  },
      { name: 'Tasks', path: '/viewer/tasks',  },
      { name: 'Resources', path: '/viewer/resources',  },
      { name: 'Engagements', path: '/viewer/engagements', },  
      { name: 'Notifications', path: '/viewer/notifications', },
      { name: 'Settings', path: '/viewer/settings',  },
    ],
  };

  const currentMenu = menus[role] || menus.viewer;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      {/* Mobile overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Sidebar */}
      <aside
        className={`fixed lg:static top-0 left-0 z-50 h-full w-72 lg:w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <span className="text-white font-bold text-sm">D</span>
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-tight">DMS Portal</h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Management System</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-500"
          >
            ✕
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-thin">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-3 mb-2">
            Main Menu
          </p>
          <ul className="space-y-0.5">
            {currentMenu.map((item, i) => (
              <li key={i}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-500/15 to-purple-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-slate-100'
                    }`
                  }
                >
                  <span className="text-base group-hover:scale-110 transition-transform duration-200">{item.icon}</span>
                  <span className="truncate">{item.name}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 shrink-0">
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/60 dark:to-slate-800/30 rounded-xl p-3 mb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {(user?.name || 'SA').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">{user?.name || 'Super Admin'}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider truncate">{role}</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors"
          >
            <span>🚪</span>
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};