import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { routeService } from '../../services/routeService';
import { ticketService } from '../../services/ticketService';
import Sidebar from '../../components/Sidebar';

export default function BookTicket() {
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loadingRoutes, setLoadingRoutes] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadRoutes();
    // eslint-disable-next-line
  }, []);

  const loadRoutes = async () => {
    try {
      setLoadingRoutes(true);
      const res = await routeService.listRoutes(true);
      setRoutes(res.routes || []);
    } catch (err) {
      console.error('Error loading routes:', err);
      setError('Failed to load routes');
    } finally {
      setLoadingRoutes(false);
    }
  };

  const handlePurchase = async () => {
    if (!selectedRoute) {
      setError('Please select a route');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      await ticketService.createTicket(selectedRoute.id, 'DAILY');
      setSuccess('Ticket purchased successfully!');
      setTimeout(() => {
        navigate('/student/my-tickets');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to purchase ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 flex">
      <Sidebar role="student" />
      <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-700 to-cyan-600 bg-clip-text text-transparent mb-2">
            Buy Ticket
          </h1>
          <p className="text-gray-600">Purchase a daily bus ticket. Select a route below.</p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6 md:p-8 hover:shadow-2xl transition-all duration-300">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800 flex items-center gap-2">
              <span className="inline-flex items-center justify-center p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
              </span>
              Select Route
            </h2>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                {success}
              </div>
            )}

            {loadingRoutes ? (
              <div className="w-full py-20 flex justify-center items-center">
                <div>
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-center text-gray-600">Loading routes...</p>
                </div>
              </div>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  {routes.map((route) => (
                    <div
                      key={route.id}
                      className={`p-5 border-2 rounded-xl cursor-pointer group transition-all flex flex-col justify-between h-full min-h-[130px] ${
                        selectedRoute?.id === route.id
                          ? 'border-blue-500 bg-gradient-to-r from-blue-50/60 to-cyan-50/70 shadow-xl scale-[1.03]'
                          : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50/40'
                      }`}
                      onClick={() => setSelectedRoute(route)}
                      role="button"
                      tabIndex={0}
                      aria-selected={selectedRoute?.id === route.id}
                      onKeyPress={e => {
                        if (e.key === 'Enter') setSelectedRoute(route);
                      }}
                    >
                      <div>
                        <h3 className="font-semibold text-lg text-gray-800 flex items-center mb-1">
                          <span>{route.name}</span>
                          {selectedRoute?.id === route.id && (
                            <svg className="w-5 h-5 text-blue-500 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          Stops: {Array.isArray(route.stops) ? route.stops.join(' → ') : 'N/A'}
                        </p>
                        {Array.isArray(route.scheduleTime) && route.scheduleTime.length > 0 && (
                          <p className="text-sm text-gray-600 mt-1">
                            Schedule: {route.scheduleTime.join(', ')}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end mt-4">
                        <p className="text-lg font-bold text-blue-600">₹50</p>
                        <p className="text-xs text-gray-500">Daily Ticket</p>
                      </div>
                    </div>
                  ))}
                </div>
                {routes.length === 0 && (
                  <div className="text-gray-500 text-center py-10 text-base">
                    No routes available
                  </div>
                )}
              </>
            )}

            {/* Ticket purchase summary & action */}
            <div
              className={`transition-all duration-300 ${
                selectedRoute ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
              }`}
            >
              {selectedRoute && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
                    <div>
                      <p className="text-gray-600">Selected Route</p>
                      <p className="text-lg font-semibold">{selectedRoute.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">₹50</p>
                      <p className="text-sm text-gray-500">Total</p>
                    </div>
                  </div>
                  <button
                    onClick={handlePurchase}
                    disabled={loading}
                    className={`w-full py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg
                      bg-gradient-to-r from-blue-600 to-cyan-600 text-white
                      hover:from-blue-700 hover:to-cyan-700
                      disabled:opacity-60 disabled:cursor-not-allowed
                    `}
                  >
                    {loading ? 'Processing...' : 'Purchase Ticket'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
