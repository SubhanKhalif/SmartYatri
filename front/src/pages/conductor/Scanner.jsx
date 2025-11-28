import { useState, useRef, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { qrService } from '../../services/qrService';
import { routeService } from '../../services/routeService';

export default function ConductorScanner() {
  const [scanResult, setScanResult] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const scannerRef = useRef(null);
  const html5QrcodeScannerRef = useRef(null);

  useEffect(() => {
    loadRoutes();
    startScanner();
    return () => {
      if (html5QrcodeScannerRef.current) {
        html5QrcodeScannerRef.current.clear();
      }
    };
  }, []);

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

  const startScanner = () => {
    const config = {
      fps: 10,
      qrbox: { width: 300, height: 300 },
      aspectRatio: 1.0,
      disableFlip: false,
    };

    const scanner = new Html5QrcodeScanner('reader', config, false);
    html5QrcodeScannerRef.current = scanner;

    scanner.render(
      (decodedText) => {
        handleScanSuccess(decodedText);
      },
      (errorMessage) => {
        // Error handling is done in onScanFailure callback
      }
    );
  };

  const handleScanSuccess = async (qrId) => {
    if (loading) return;

    try {
      setLoading(true);
      setError('');
      setScanResult(null);

      const routeId = selectedRoute?.id || null;
      const res = await qrService.verifyQR(qrId, routeId);

      setScanResult({
        qrId,
        ...res,
      });

      // Continue scanning after a delay
      setTimeout(() => {
        setScanResult(null);
        setLoading(false);
      }, 3000);
    } catch (err) {
      setError(err.message || 'Failed to verify QR code');
      setLoading(false);
      setTimeout(() => {
        setError('');
        setScanResult(null);
      }, 3000);
    }
  };

  const getStatusDisplay = () => {
    if (loading) {
      return (
        <div className="bg-blue-100 border-4 border-blue-500 rounded-lg p-6 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-blue-800">Verifying...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-100 border-4 border-red-500 rounded-lg p-6 text-center">
          <div className="text-6xl mb-4">❌</div>
          <p className="text-xl font-semibold text-red-800 mb-2">Error</p>
          <p className="text-red-600">{error}</p>
        </div>
      );
    }

    if (scanResult) {
      const { valid, user, pass, ticket, message } = scanResult;
      return (
        <div
          className={`border-4 rounded-lg p-6 text-center ${
            valid
              ? 'bg-green-100 border-green-500'
              : 'bg-red-100 border-red-500'
          }`}
        >
          <div className="text-6xl mb-4">{valid ? '✅' : '❌'}</div>
          <p
            className={`text-2xl font-bold mb-2 ${
              valid ? 'text-green-800' : 'text-red-800'
            }`}
          >
            {valid ? 'VALID' : 'INVALID'}
          </p>
          {user && (
            <div className="mt-4 text-left bg-white rounded p-4">
              <p className="font-semibold text-gray-800">{user.fullName}</p>
              {user.idNumber && <p className="text-sm text-gray-600">ID: {user.idNumber}</p>}
              {user.roleType && (
                <p className="text-sm text-gray-600">Type: {user.roleType}</p>
              )}
            </div>
          )}
          {valid && pass && (
            <div className="mt-2 text-left bg-white rounded p-4">
              <p className="text-sm font-semibold text-gray-800">Pass: {pass.type}</p>
              <p className="text-xs text-gray-600">
                Valid until: {new Date(pass.endDate).toLocaleDateString()}
              </p>
            </div>
          )}
          {valid && ticket && (
            <div className="mt-2 text-left bg-white rounded p-4">
              <p className="text-sm font-semibold text-gray-800">Ticket: {ticket.type}</p>
            </div>
          )}
          <p className={`mt-4 text-sm ${valid ? 'text-green-700' : 'text-red-700'}`}>
            {message}
          </p>
        </div>
      );
    }

    return (
      <div className="bg-gray-100 border-4 border-gray-300 rounded-lg p-6 text-center">
        <p className="text-xl font-semibold text-gray-600">Ready to Scan</p>
        <p className="text-sm text-gray-500 mt-2">Point camera at QR code</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">QR Code Scanner</h1>

        {/* Route Selection */}
        <div className="mb-4 bg-gray-800 rounded-lg p-4">
          <label className="block text-sm font-semibold mb-2">Select Route</label>
          <select
            value={selectedRoute?.id || ''}
            onChange={(e) => {
              const route = routes.find((r) => r.id === parseInt(e.target.value));
              setSelectedRoute(route);
            }}
            className="w-full bg-gray-700 text-white rounded-lg p-2 border border-gray-600"
          >
            {routes.map((route) => (
              <option key={route.id} value={route.id}>
                {route.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Scanner */}
          <div className="bg-white rounded-lg p-4">
            <div id="reader" className="w-full"></div>
          </div>

          {/* Status Display */}
          <div className="flex items-center justify-center">{getStatusDisplay()}</div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-900 rounded-lg p-4 text-center">
          <p className="text-sm">
            <strong>Instructions:</strong> Select the route, then scan the passenger's QR code. The
            system will verify if they have a valid ticket or pass.
          </p>
        </div>
      </div>
    </div>
  );
}
