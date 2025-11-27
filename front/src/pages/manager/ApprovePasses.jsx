import { useState, useEffect } from 'react';
import { passService } from '../../services/passService';
import Sidebar from '../../components/Sidebar';

export default function ApprovePasses() {
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    loadPendingPasses();
  }, []);

  const loadPendingPasses = async () => {
    try {
      const res = await passService.getPendingPasses();
      setPasses(res.passes || []);
    } catch (err) {
      console.error('Error loading passes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (passId, action) => {
    try {
      setProcessing(passId);
      await passService.approvePass(passId, action);
      await loadPendingPasses(); // Reload list
    } catch (err) {
      console.error('Error approving pass:', err);
      alert(err.message || 'Failed to update pass');
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
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Approve Pass Requests</h1>

        {passes.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500 text-lg">No pending pass requests</p>
          </div>
        ) : (
          <div className="space-y-4">
            {passes.map((pass) => (
              <div key={pass.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{pass.userName}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Pass Type</p>
                        <p className="font-semibold">{pass.type}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Start Date</p>
                        <p className="font-semibold">{new Date(pass.startDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">End Date</p>
                        <p className="font-semibold">{new Date(pass.endDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Requested</p>
                        <p className="font-semibold">{new Date(pass.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleApprove(pass.id, 'APPROVE')}
                      disabled={processing === pass.id}
                      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processing === pass.id ? 'Processing...' : 'Approve'}
                    </button>
                    <button
                      onClick={() => handleApprove(pass.id, 'REJECT')}
                      disabled={processing === pass.id}
                      className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processing === pass.id ? 'Processing...' : 'Reject'}
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
