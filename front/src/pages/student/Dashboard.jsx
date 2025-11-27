import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { qrService } from '../../services/qrService';
import { passService } from '../../services/passService';
import { notificationService } from '../../services/notificationService';
import Sidebar from '../../components/Sidebar';
import QRDisplay from '../../components/QRDisplay';

export default function StudentDashboard() {
  const [qrData, setQrData] = useState(null);
  const [pass, setPass] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [qrRes, passRes, notifRes] = await Promise.all([
        qrService.generateQR().catch(() => null),
        passService.getUserPass().catch(() => null),
        notificationService.listNotifications().catch(() => null),
      ]);

      if (qrRes) setQrData(qrRes);
      if (passRes?.pass) setPass(passRes.pass);
      if (notifRes?.notifications) setNotifications(notifRes.notifications);
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar role="student" />
      <div className="flex-1 p-4 md:p-6 lg:p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Student Dashboard</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* QR Code Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">My QR Code</h2>
            {qrData ? (
              <QRDisplay
                qrCode={qrData.qrCode}
                qrId={qrData.qrId}
                status={pass?.status || 'NO_PASS'}
                profile={qrData.profile}
              />
            ) : (
              <p className="text-gray-500">Failed to load QR code</p>
            )}
          </div>

          {/* Pass Status Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Pass Status</h2>
            {pass ? (
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Type</p>
                  <p className="text-lg font-semibold">{pass.type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                      pass.status === 'ACTIVE'
                        ? 'bg-green-100 text-green-800'
                        : pass.status === 'PENDING'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {pass.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Valid Until</p>
                  <p className="text-lg">{new Date(pass.endDate).toLocaleDateString()}</p>
                </div>
                {pass.status === 'PENDING' && (
                  <p className="text-sm text-yellow-600">Awaiting approval from manager</p>
                )}
              </div>
            ) : (
              <div>
                <p className="text-gray-500 mb-4">No active pass</p>
                <button
                  onClick={() => navigate('/student/my-pass')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Get a Pass
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <button
            onClick={() => navigate('/student/book-ticket')}
            className="bg-blue-600 text-white p-6 rounded-lg shadow-md hover:bg-blue-700 transition text-left"
          >
            <h3 className="text-lg font-semibold mb-2">Buy Ticket</h3>
            <p className="text-sm opacity-90">Purchase a daily ticket</p>
          </button>
          <button
            onClick={() => navigate('/student/my-tickets')}
            className="bg-green-600 text-white p-6 rounded-lg shadow-md hover:bg-green-700 transition text-left"
          >
            <h3 className="text-lg font-semibold mb-2">My Tickets</h3>
            <p className="text-sm opacity-90">View ticket history</p>
          </button>
          <button
            onClick={() => navigate('/student/travel-history')}
            className="bg-purple-600 text-white p-6 rounded-lg shadow-md hover:bg-purple-700 transition text-left"
          >
            <h3 className="text-lg font-semibold mb-2">Travel History</h3>
            <p className="text-sm opacity-90">View past travels</p>
          </button>
        </div>

        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Notifications</h2>
            <div className="space-y-2">
              {notifications.slice(0, 5).map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3 rounded-lg border-l-4 ${
                    notif.isRead
                      ? 'bg-gray-50 border-gray-300'
                      : 'bg-blue-50 border-blue-500'
                  }`}
                >
                  <h4 className="font-semibold">{notif.title}</h4>
                  <p className="text-sm text-gray-600">{notif.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(notif.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
