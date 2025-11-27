import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';

export default function Sidebar({ role = 'student' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const menuItems = {
    student: [
      { path: '/student/dashboard', label: 'Dashboard', icon: '🏠' },
      { path: '/student/book-ticket', label: 'Buy Ticket', icon: '🎫' },
      { path: '/student/my-tickets', label: 'My Tickets', icon: '📋' },
      { path: '/student/my-pass', label: 'My Pass', icon: '🎟️' },
      { path: '/student/travel-history', label: 'Travel History', icon: '📊' },
      { path: '/student/profile', label: 'Profile', icon: '👤' },
    ],
    conductor: [
      { path: '/conductor/scanner', label: 'QR Scanner', icon: '📷' },
    ],
    manager: [
      { path: '/manager/dashboard', label: 'Dashboard', icon: '🏠' },
      { path: '/manager/approve-passes', label: 'Approve Passes', icon: '✅' },
      { path: '/manager/routes', label: 'Manage Routes', icon: '🛣️' },
      { path: '/manager/passes', label: 'All Passes', icon: '🎟️' },
      { path: '/manager/reports', label: 'Reports', icon: '📊' },
    ],
    admin: [
      { path: '/admin/dashboard', label: 'Dashboard', icon: '🏠' },
      { path: '/admin/users', label: 'Manage Users', icon: '👥' },
      { path: '/admin/audit', label: 'Audit Logs', icon: '📝' },
      { path: '/admin/config', label: 'System Config', icon: '⚙️' },
    ],
    faculty: [
      { path: '/faculty/dashboard', label: 'Dashboard', icon: '🏠' },
      { path: '/faculty/book-ticket', label: 'Book Ticket', icon: '🎫' },
      { path: '/faculty/my-pass', label: 'My Pass', icon: '🎟️' },
      { path: '/faculty/profile', label: 'Profile', icon: '👤' },
    ],
  };

  const items = menuItems[role] || menuItems.student;

  const handleLogout = async () => {
    try {
      const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
      await fetch(`${SERVER_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
      navigate('/login');
    }
    setOpen(false);
  };

  const handleNavigate = (path) => {
    navigate(path);
    setOpen(false);
  };

  return (
    <>
      {/* Mobile: hamburger button */}
      <button
        className="fixed top-4 left-4 z-50 md:hidden bg-gray-800 text-white rounded-full p-2 shadow-lg focus:outline-none"
        onClick={() => setOpen((v) => !v)}
        aria-label="Toggle sidebar"
        style={{ width: 44, height: 44 }}
      >
        {!open ? (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width={28} height={28}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width={28} height={28}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
      </button>

      {/* Sidebar */}
      <div
        className={`
          fixed z-40 left-0 top-0 h-full w-64 bg-gray-800 text-white flex flex-col transition-transform duration-300
          md:static md:translate-x-0 md:w-64 md:min-h-screen
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{ minHeight: '100vh' }}
      >
        <div className="p-6 border-b border-gray-700 flex items-center justify-between md:block">
          <div>
            <h2 className="text-xl font-bold">Bus Ticket System</h2>
            <p className="text-sm text-gray-400 capitalize">{role}</p>
          </div>
          {/* Close button for mobile sidebar */}
          <button
            className="md:hidden ml-2 text-gray-400 hover:text-white focus:outline-none"
            onClick={() => setOpen(false)}
            aria-label="Close sidebar"
          >
            <svg width={28} height={28} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {items.map((item) => (
              <li key={item.path}>
                <button
                  onClick={() => handleNavigate(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    location.pathname === item.path
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 transition"
          >
            <span className="text-xl">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </div>
      {/* Overlay for mobile when sidebar open */}
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-30 md:hidden transition-opacity"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}
