import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { paymentService } from '../../services/paymentService';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

function getProofUrl(url) {
  // If url is absolute (starts with http or https), return as is
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  // Otherwise, assume it's a relative path (as per uploads), prepend server url
  return SERVER_URL.replace(/\/$/, '') + (url.startsWith('/') ? url : '/' + url);
}

export default function VerifyPayment() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    loadPendingPayments();
  }, []);

  const loadPendingPayments = async () => {
    try {
      const res = await paymentService.getPendingPayments();
      setPayments(res.payments || []);
    } catch (err) {
      console.error('Error loading payments:', err);
      alert(err.message || 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (paymentId, action) => {
    try {
      setProcessing(paymentId);
      await paymentService.verifyPayment(paymentId, action);
      await loadPendingPayments();
    } catch (err) {
      console.error('Error verifying payment:', err);
      alert(err.message || 'Failed to verify payment');
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar role="manager" />
        <div className="flex-1 p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar role="manager" />
      <div className="flex-1 p-4 md:p-6 lg:p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Verify Payments</h1>

        {payments.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500 text-lg">No pending payments</p>
          </div>
        ) : (
          <div className="space-y-4">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">User</p>
                        <p className="font-semibold">{payment.userName}</p>
                        <p className="text-xs text-gray-400">{payment.userEmail}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Amount</p>
                        <p className="font-semibold text-lg">₹{payment.amount}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Payment Method</p>
                        <p className="font-semibold">{payment.method || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Reference</p>
                        <p className="font-semibold text-sm">{payment.reference || 'N/A'}</p>
                      </div>
                    </div>
                    {payment.passCode && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-500">Pass Code</p>
                        <p className="font-mono text-blue-600">{payment.passCode}</p>
                      </div>
                    )}
                    {payment.proofUrl && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-500 mb-2">Payment Proof</p>
                        <a
                          href={getProofUrl(payment.proofUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          View Proof
                        </a>
                      </div>
                    )}
                    <p className="text-xs text-gray-400">
                      Requested: {new Date(payment.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleVerify(payment.id, 'APPROVE')}
                      disabled={processing === payment.id}
                      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processing === payment.id ? 'Processing...' : 'Approve'}
                    </button>
                    <button
                      onClick={() => handleVerify(payment.id, 'REJECT')}
                      disabled={processing === payment.id}
                      className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processing === payment.id ? 'Processing...' : 'Reject'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
