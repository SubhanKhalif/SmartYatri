import { useState, useRef, useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { qrService } from '../../services/qrService';
import { routeService } from '../../services/routeService';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

function getPhotoUrl(photo) {
  // If no photo, fallback to empty string (handled later)
  if (!photo) return '';
  // If it looks like an absolute URL (e.g., data URL or http(s)), return as is
  if (/^(data:|https?:\/\/)/.test(photo)) return photo;
  // If string contains "/uploads/", prepend SERVER_URL unless already there
  if (/^\/?uploads\//.test(photo)) {
    // Ensure there is exactly one slash between SERVER_URL and the path
    return SERVER_URL.replace(/\/+$/, '') + '/' + photo.replace(/^\/+/, '');
  }
  // Backward compatibility: for custom cases, just return as is
  return photo;
}

export default function ConductorScanner() {
  const [scanResult, setScanResult] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isScannerActive, setIsScannerActive] = useState(false);
  const [cameraPermissionError, setCameraPermissionError] = useState('');
  const readerRef = useRef(null);
  const html5QrCodeRef = useRef(null);

  const loadRoutes = async () => {
    try {
      const res = await routeService.listRoutes(true);
      setRoutes(res.routes || []);
      if (res.routes && res.routes.length > 0) {
        setSelectedRoute(res.routes[0]);
      }
    } catch (err) {
      console.error('Error loading routes:', err);
    }
  };

  useEffect(() => {
    // Load routes on component mount
    loadRoutes();
    // Cleanup scanner if any
    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(() => {
          // Ignore cleanup errors
        });
        html5QrCodeRef.current.clear().catch(() => {
          // Ignore cleanup errors
        });
      }
    };
  }, []);

  const startSingleScan = async () => {
    setScanResult(null);
    setError('');
    setCameraPermissionError('');
    setIsScannerActive(true);

    // Dispose previous scanner if exists
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        await html5QrCodeRef.current.clear();
      } catch {
        // Ignore disposal errors
      }
    }

    // Create new scanner instance
    html5QrCodeRef.current = new Html5Qrcode("reader");
    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
      disableFlip: false,
    };

    try {
      await html5QrCodeRef.current.start(
        { facingMode: "environment" },
        config,
        async (decodedText /*, result*/) => {
          html5QrCodeRef.current
            .stop()
            .then(() => {
              html5QrCodeRef.current.clear();
              setIsScannerActive(false);
            })
            .catch(() => {
              // Ignore stop errors
            });
          await handleScanSuccess(decodedText);
        },
        () => {
          // ignore scan failures, don't show error to user in this handler
        }
      );
    } catch {
      setCameraPermissionError(
        'Camera access was denied or not available. Please enable camera and try again.'
      );
      setIsScannerActive(false);
      if (html5QrCodeRef.current) {
        try {
          await html5QrCodeRef.current.stop();
          await html5QrCodeRef.current.clear();
        } catch {
          // Ignore cleanup errors
        }
      }
    }
  };

  const handleScanSuccess = async (qrId) => {
    if (loading) return;

    try {
      setLoading(true);
      setError('');
      setScanResult(null);

      const routeId = selectedRoute?.id || null;
      // Fetch all QR-related data, not just verification
      const res = await qrService.verifyQR(qrId, routeId);

      setScanResult({
        qrId,
        ...res,
      });

      setLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to verify QR code');
      setLoading(false);
    }
  };

  const getStatusDisplay = () => {
    if (loading) {
      return (
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-4 border-blue-500 rounded-2xl shadow-xl p-8 text-center">
          <div className="flex flex-col items-center mb-4">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
            <span className="font-bold text-blue-900 text-xl">Verifying QR Code...</span>
            <p className="text-sm text-blue-700 mt-2">Please wait</p>
          </div>
        </div>
      );
    }

    if (cameraPermissionError) {
      return (
        <div className="bg-gradient-to-br from-red-50 to-pink-50 border-4 border-red-500 rounded-2xl shadow-xl p-8 text-center">
          <div className="mb-4">
            <svg className="w-20 h-20 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="text-xl font-bold text-red-800 mb-2">Camera Access Denied</p>
          <p className="text-red-600">{cameraPermissionError}</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-gradient-to-br from-red-50 to-pink-50 border-4 border-red-500 rounded-2xl shadow-xl p-8 text-center">
          <div className="mb-4">
            <svg className="w-20 h-20 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-xl font-bold text-red-800 mb-2">Error</p>
          <p className="text-red-600">{error}</p>
        </div>
      );
    }

    if (scanResult) {
      const { valid, user, pass, ticket, message } = scanResult;
      return (
        <div className={`border-4 rounded-2xl shadow-2xl p-6 ${
          valid
            ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-500'
            : 'bg-gradient-to-br from-red-50 to-pink-50 border-red-500'
        }`}>
          {/* Status Badge */}
          <div className="text-center mb-6">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
              valid ? 'bg-green-500' : 'bg-red-500'
            }`}>
              {valid ? (
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
            <span className={`text-3xl font-black block mb-2 ${
              valid ? 'text-green-800' : 'text-red-800'
            }`}>
              {valid ? 'VALID PASS' : 'INVALID'}
            </span>
            <p className={`text-sm font-semibold ${valid ? 'text-green-700' : 'text-red-700'}`}>
              {message}
            </p>
          </div>

          {/* User Profile Card */}
          {user && (
            <div className="bg-white rounded-xl shadow-lg p-6 mb-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="relative">
                  <img
                    src={getPhotoUrl(user.photo) || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || 'User')}&background=3b82f6&color=fff&size=128`}
                    alt={user.fullName}
                    className="w-20 h-20 rounded-full object-cover border-4 border-gray-200 shadow-md"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || 'User')}&background=3b82f6&color=fff&size=128`;
                    }}
                  />
                  {valid && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800 mb-1">{user.fullName || 'Unknown'}</h3>
                  {user.roleType && (
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                      {user.roleType}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-200">
                {user.idNumber && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">ID Number</p>
                    <p className="font-semibold text-gray-800">{user.idNumber}</p>
                  </div>
                )}
                {user.classOrPosition && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Class/Position</p>
                    <p className="font-semibold text-gray-800">{user.classOrPosition}</p>
                  </div>
                )}
                {user.schoolName && (
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500 mb-1">School/Organization</p>
                    <p className="font-semibold text-gray-800">{user.schoolName}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Pass Information */}
          {valid && pass && (
            <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl shadow-md p-4 mb-3 border-l-4 border-green-500">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                </svg>
                <p className="font-bold text-green-800">Active Pass</p>
              </div>
              <p className="text-sm text-green-700 mb-1"><span className="font-semibold">Type:</span> {pass.type}</p>
              <p className="text-sm text-green-700">
                <span className="font-semibold">Valid until:</span> {new Date(pass.endDate).toLocaleDateString()}
              </p>
            </div>
          )}

          {/* Ticket Information */}
          {valid && ticket && (
            <div className="bg-gradient-to-r from-blue-100 to-cyan-100 rounded-xl shadow-md p-4 border-l-4 border-blue-500">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
                <p className="font-bold text-blue-800">Active Ticket</p>
              </div>
              <p className="text-sm text-blue-700"><span className="font-semibold">Type:</span> {ticket.type}</p>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-4 border-gray-300 rounded-2xl shadow-xl p-8 text-center">
        <div className="mb-4">
          <svg className="w-20 h-20 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>
        </div>
        <p className="text-xl font-bold text-gray-700 mb-2">Ready to Scan</p>
        <p className="text-sm text-gray-500">Press the <span className="font-bold text-gray-700">Scan QR</span> button to begin scanning passenger QR codes.</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50/30 to-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent mb-2">
            QR Code Scanner
          </h1>
          <p className="text-gray-600">Scan passenger QR codes to verify passes and tickets</p>
        </div>

        {/* Route Selection */}
        <div className="mb-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1 w-full">
            <label className="block text-base font-bold text-gray-700 mb-2">
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                Select Route
              </span>
            </label>
            <select
              value={selectedRoute?.id || ''}
              onChange={(e) => {
                const route = routes.find((r) => r.id === parseInt(e.target.value));
                setSelectedRoute(route);
              }}
              className="w-full bg-white text-gray-800 rounded-xl p-3 border-2 border-gray-300 text-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition outline-none font-medium"
            >
              {routes.map((route) => (
                <option key={route.id} value={route.id}>
                  {route.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 flex items-center justify-center mt-4 md:mt-0">
            <button
              className={`px-8 py-4 text-xl rounded-xl font-bold transition-all duration-200 bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg hover:from-green-700 hover:to-emerald-700 active:scale-95 transform ${
                isScannerActive || loading
                  ? 'opacity-50 pointer-events-none'
                  : 'hover:shadow-2xl'
              }`}
              onClick={startSingleScan}
              disabled={isScannerActive || loading}
              data-testid="scan-btn"
            >
              <span className="flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
                Scan QR Code
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 items-stretch">
          {/* Scanner */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6 flex flex-col items-center justify-center min-h-[400px]">
            {/* Scanner Render Area */}
            <div className="w-full flex-1 flex items-center justify-center relative">
              {/* Only show reader when scanning */}
              <div
                ref={readerRef}
                id="reader"
                className={`transition-all duration-300 ${
                  isScannerActive
                    ? 'opacity-100 max-h-[350px]'
                    : 'opacity-40 grayscale max-h-0 overflow-hidden'
                }`}
                style={{
                  width: isScannerActive ? 320 : 0,
                  margin: 'auto',
                  minHeight: isScannerActive ? 320 : 0
                }}
              />
              {!isScannerActive && (
                <div className="absolute m-auto left-0 right-0 text-gray-400 flex flex-col items-center justify-center pointer-events-none" style={{ minHeight: 320 }}>
                  <svg className="w-24 h-24 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                  <span className="text-lg font-semibold text-gray-500">Camera will open when you click Scan QR</span>
                </div>
              )}
            </div>
            {isScannerActive && (
              <div className="w-full flex justify-center mt-4">
                <span className="inline-flex items-center gap-2 text-gray-700 text-sm bg-green-100 border border-green-300 rounded-full px-4 py-2 font-semibold">
                  <svg className="w-4 h-4 animate-pulse text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                  Scanning... Point camera at QR code
                </span>
              </div>
            )}
          </div>
          {/* Status Display */}
          <div className="flex items-center justify-center">{getStatusDisplay()}</div>
        </div>

        {/* Instructions */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl shadow-lg p-6 text-center text-white">
          <div className="flex items-center justify-center gap-3 mb-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-lg font-bold">Instructions</p>
          </div>
          <p className="text-sm opacity-95">
            Select the route, then click <span className="font-bold">Scan QR Code</span>. The camera will activate; point it at the passenger's QR code. The system will automatically verify and display all passenger details including profile photo, pass status, and ticket information.
          </p>
        </div>
      </div>
    </div>
  );
}