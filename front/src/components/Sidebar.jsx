import { useNavigate, useLocation } from 'react-router-dom';

export default function Sidebar({ role = 'student' }) {
  const navigate = useNavigate();
  const location = useLocation();

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
  };

  return (
    <div className="w-64 bg-gray-800 text-white min-h-screen flex flex-col">
      <div className="p-6 border-b border-gray-700">
        <h2 className="text-xl font-bold">Bus Ticket System</h2>
        <p className="text-sm text-gray-400 capitalize">{role}</p>
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.path}>
              <button
                onClick={() => navigate(item.path)}
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
  );
}
