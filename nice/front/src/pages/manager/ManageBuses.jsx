import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { busService } from '../../services/busService';
import { routeService } from '../../services/routeService';
import { userService } from '../../services/userService';

export default function ManageBuses() {
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [conductors, setConductors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBus, setEditingBus] = useState(null);
  const [formData, setFormData] = useState({
    numberPlate: '',
    from: '',
    to: '',
    departureTime: '',
    arrivalTime: '',
    totalSeats: '',
    routeId: '',
    conductorId: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [busesRes, routesRes, conductorsRes] = await Promise.all([
        busService.listBuses(),
        routeService.listRoutes(),
        userService.listUsers({ loginType: 'CONDUCTOR' }),
      ]);
      setBuses(busesRes.buses || []);
      setRoutes(routesRes.routes || []);
      setConductors(conductorsRes.users || []);
    } catch (err) {
      console.error('Error loading data:', err);
      alert(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingBus(null);
    setFormData({
      numberPlate: '',
      from: '',
      to: '',
      departureTime: '',
      arrivalTime: '',
      totalSeats: '',
      routeId: '',
      conductorId: '',
    });
    setShowModal(true);
  };

  const handleEdit = (bus) => {
    setEditingBus(bus);
    setFormData({
      numberPlate: bus.numberPlate,
      from: bus.from,
      to: bus.to,
      departureTime: bus.departureTime ? new Date(bus.departureTime).toISOString().slice(0, 16) : '',
      arrivalTime: bus.arrivalTime ? new Date(bus.arrivalTime).toISOString().slice(0, 16) : '',
      totalSeats: String(bus.totalSeats),
      routeId: bus.routeId ? String(bus.routeId) : '',
      conductorId: bus.conductorId ? String(bus.conductorId) : '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const busData = {
        ...formData,
        totalSeats: parseInt(formData.totalSeats),
        routeId: formData.routeId || null,
        conductorId: formData.conductorId || null,
      };

      if (editingBus) {
        await busService.updateBus(editingBus.id, busData);
      } else {
        await busService.createBus(busData);
      }

      setShowModal(false);
      await loadData();
    } catch (err) {
      alert(err.message || 'Failed to save bus');
    }
  };

  const handleToggleActive = async (bus) => {
    try {
      await busService.updateBus(bus.id, { active: !bus.active });
      await loadData();
    } catch (err) {
      alert(err.message || 'Failed to update bus');
    }
  };

  const handleDelete = async (bus) => {
    if (!confirm(`Are you sure you want to delete bus ${bus.numberPlate}?`)) return;
    try {
      await busService.deleteBus(bus.id);
      await loadData();
    } catch (err) {
      alert(err.message || 'Failed to delete bus');
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Manage Buses</h1>
          <button
            onClick={handleCreate}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            + Add Bus
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Number Plate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Route
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Conductor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Seats
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {buses.map((bus) => (
                <tr key={bus.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {bus.numberPlate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {bus.route?.name || 'Not assigned'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {bus.conductor?.fullName || 'Not assigned'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {bus.totalSeats}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        bus.active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {bus.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEdit(bus)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggleActive(bus)}
                      className={`${
                        bus.active ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'
                      }`}
                    >
                      {bus.active ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      onClick={() => handleDelete(bus)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">
                {editingBus ? 'Edit Bus' : 'Add New Bus'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Number Plate *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.numberPlate}
                      onChange={(e) => setFormData({ ...formData, numberPlate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Seats *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.totalSeats}
                      onChange={(e) => setFormData({ ...formData, totalSeats: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">From *</label>
                    <input
                      type="text"
                      required
                      value={formData.from}
                      onChange={(e) => setFormData({ ...formData, from: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">To *</label>
                    <input
                      type="text"
                      required
                      value={formData.to}
                      onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Departure Time *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.departureTime}
                      onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Arrival Time *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.arrivalTime}
                      onChange={(e) => setFormData({ ...formData, arrivalTime: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Route</label>
                  <select
                    value={formData.routeId}
                    onChange={(e) => setFormData({ ...formData, routeId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select Route</option>
                    {routes.map((route) => (
                      <option key={route.id} value={route.id}>
                        {route.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Conductor</label>
                  <select
                    value={formData.conductorId}
                    onChange={(e) => setFormData({ ...formData, conductorId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select Conductor</option>
                    {conductors.map((conductor) => (
                      <option key={conductor.id} value={conductor.id}>
                        {conductor.profile?.fullName || conductor.username}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {editingBus ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

