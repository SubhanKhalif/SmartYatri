import { useState, useRef, useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { qrService } from '../../services/qrService';
import { routeService } from '../../services/routeService';

export default function ConductorScanner() {
  const [scanResult, setScanResult] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(false);
  const html5QrcodeRef = useRef(null);

  useEffect(() => {
    loadRoutes();
    // Cleanup scanner on unmount
    return () => {
      if (html5QrcodeRef.current) {
        html5QrcodeRef.current.stop().catch(() => {});
        html5QrcodeRef.current.clear();
      }
    };
    // eslint-disable-next-line
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

  // Professional scan: QR capture, then close and fetch info
  const startProfessionalScan = async () => {
    setScanResult(null);
    setError('');
    setLoading(false);

    // Clean up any previous scanner
    if (html5QrcodeRef.current) {
      try {
        await html5QrcodeRef.current.stop();
      } catch {}
      try {
        await html5QrcodeRef.current.clear();
      } catch {}
      html5QrcodeRef.current = null;
    }

    setScanning(true);

    const config = {
      fps: 10,
      qrbox: { width: 300, height: 300 },
      aspectRatio: 1.0,
      disableFlip: false,
    };

    // Use new instance every scan for safety
    if (!html5QrcodeRef.current) {
      html5QrcodeRef.current = new Html5Qrcode("reader");
    }

    try {
      await html5QrcodeRef.current.start(
        { facingMode: 'environment' },
        config,
        async (decodedText /*, decodedResult*/) => {
          // Stop scanning immediately after first successful result
          setScanning(false);
          try {
            await html5QrcodeRef.current.stop();
          } catch {}
          try {
            await html5QrcodeRef.current.clear();
          } catch {}
          await handleScanSuccess(decodedText);
        },
        (/* errorMessage */) => {
          // Failure callback can be left empty (do nothing)
        }
      );
    } catch (err) {
      setError("Camera start failed: " + (err.message || err));
      setScanning(false);
    }
  };

  const handleScanSuccess = async (qrId) => {
    if (loading) return;
    setLoading(true);
    setScanResult(null);
    setError('');
    try {
      const routeId = selectedRoute?.id || null;
      const res = await qrService.verifyQR(qrId, routeId);

      setScanResult({
        qrId,
        ...res,
      });
    } catch (err) {
      setError(err.message || 'Failed to verify QR code');
    }
    setLoading(false);
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
        <p className="text-sm text-gray-500 mt-2">Press the Scan button to capture QR code</p>
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
            disabled={scanning || loading}
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
            {/* Scan button */}
            <button
              className={`w-full mb-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-60`}
              onClick={startProfessionalScan}
              disabled={scanning || loading}
            >
              {scanning ? 'Scanning...' : 'Scan QR Code'}
            </button>
            <div id="reader" className={scanning ? 'w-full h-72' : 'w-full h-72 opacity-50 pointer-events-none'}></div>
          </div>

          {/* Status Display */}
          <div className="flex items-center justify-center">{getStatusDisplay()}</div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-900 rounded-lg p-4 text-center">
          <p className="text-sm">
            <strong>Instructions:</strong> Select the route, then press <b>Scan QR Code</b> and capture the passenger's QR code. The system will verify if they have a valid ticket or pass. Camera will close after scanning.
          </p>
        </div>
      </div>
    </div>
  );
}
