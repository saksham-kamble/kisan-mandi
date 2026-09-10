import React, { useState, useEffect } from 'react';
import {
  getCentres,
  getLiveQueue,
  checkInBooking,
  startProcessing,
  completeBooking,
  getCentreStats,
  getRateForCommodity,
  getAllGrievances,
  resolveGrievance,
  updateBookingPriority,
} from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { StatusBadge, PriorityBadge, QualityGradeTag } from '../utils/helpers';
import toast from 'react-hot-toast';
import {
  LayoutDashboard,
  Users,
  CheckCircle2,
  Play,
  Flag,
  MapPin,
  HelpCircle,
  Clock,
  AlertTriangle,
  MessageSquare,
  Send,
  UserCheck,
} from 'lucide-react';
import QualityInspectionModal from '../components/admin/QualityInspectionModal';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('queue');
  const [centres, setCentres] = useState([]);
  const [selectedCentre, setSelectedCentre] = useState(null);
  const [queueData, setQueueData] = useState({ queue: [], stats: {} });
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const { isMarathi } = useLanguage();

  // Quality Modal State
  const [inspectionModalOpen, setInspectionModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [mspRate, setMspRate] = useState(2275);
  const [maxMoisture, setMaxMoisture] = useState(12.0);

  // Grievances State
  const [grievances, setGrievances] = useState([]);
  const [grievanceFilterStatus, setGrievanceFilterStatus] = useState('all');
  const [selectedGrievance, setSelectedGrievance] = useState(null);
  const [resolutionModalOpen, setResolutionModalOpen] = useState(false);
  const [resolutionRemarks, setResolutionRemarks] = useState('');

  useEffect(() => {
    fetchCentres();
  }, []);

  useEffect(() => {
    if (!selectedCentre) return;
    fetchQueue();
    fetchStats();
    if (activeTab === 'grievances') fetchGrievances();
  }, [selectedCentre, activeTab, grievanceFilterStatus]);

  const fetchCentres = async () => {
    try {
      const { data } = await getCentres();
      setCentres(data.centres || []);
      if (data.centres?.length > 0) setSelectedCentre(data.centres[0]);
    } catch {
      toast.error('Failed to load centres');
    }
  };

  const fetchQueue = async () => {
    if (!selectedCentre) return;
    try {
      const { data } = await getLiveQueue(selectedCentre.id);
      setQueueData(data);
    } catch {
      toast.error('Failed to load queue');
    }
  };

  const fetchStats = async () => {
    if (!selectedCentre) return;
    try {
      const { data } = await getCentreStats(selectedCentre.id);
      setStats(data);
    } catch {
      toast.error('Failed to load stats');
    }
  };

  const fetchGrievances = async () => {
    try {
      const params = grievanceFilterStatus !== 'all' ? { status: grievanceFilterStatus } : {};
      const { data } = await getAllGrievances(params);
      setGrievances(data.grievances || []);
    } catch {
      toast.error('Failed to load grievances');
    }
  };

  const handleCheckIn = async (id) => {
    setLoading(true);
    try {
      await checkInBooking(id);
      toast.success(isMarathi ? 'शेतकरी चेक-इन पूर्ण' : 'Farmer checked in');
      fetchQueue();
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Check-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async (id) => {
    setLoading(true);
    try {
      await startProcessing(id);
      toast.success(isMarathi ? 'तपासणी सुरू केली' : 'Serving farmer');
      fetchQueue();
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to start');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenInspection = async (booking) => {
    try {
      const { data } = await getRateForCommodity(encodeURIComponent(booking.commodity));
      setMspRate(parseFloat(data?.rate?.msp_rate_per_quintal) || 2275);
      setMaxMoisture(parseFloat(data?.rate?.max_moisture_percentage) || 12.0);
    } catch {
      setMspRate(2275);
      setMaxMoisture(12.0);
    }
    setSelectedBooking(booking);
    setInspectionModalOpen(true);
  };

  const handleCompleteInspection = async (qualityData) => {
    setLoading(true);
    try {
      await completeBooking(selectedBooking.id, qualityData);
      toast.success(isMarathi ? 'खरेदी पूर्ण व DBT देयक सुरू' : 'Procurement completed & payout initiated');
      setInspectionModalOpen(false);
      setSelectedBooking(null);
      fetchQueue();
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to complete');
    } finally {
      setLoading(false);
    }
  };

  const handlePriorityChange = async (bookingId, priorityLevel) => {
    try {
      await updateBookingPriority(bookingId, {
        priority_level: priorityLevel,
        priority_reason: `Gate Priority Override: ${priorityLevel}`,
      });
      toast.success('Queue priority updated');
      fetchQueue();
    } catch {
      toast.error('Failed to update priority');
    }
  };

  const handleResolveGrievance = async (e) => {
    e.preventDefault();
    if (!resolutionRemarks.trim()) return toast.error('Please enter resolution remarks');
    try {
      await resolveGrievance(selectedGrievance.id, {
        status: 'resolved',
        admin_remarks: resolutionRemarks,
        resolved_by: 'Mandi Grievance Officer',
      });
      toast.success('Grievance resolved');
      setResolutionModalOpen(false);
      setSelectedGrievance(null);
      setResolutionRemarks('');
      fetchGrievances();
    } catch {
      toast.error('Failed to resolve grievance');
    }
  };

  const openGrievanceCount = grievances.filter((g) => g.status === 'open').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl shadow-xl border-2 border-gray-100">
          <div>
            <h1 className="text-3xl font-black text-gray-900 flex items-center">
              <LayoutDashboard className="h-8 w-8 mr-3 text-primary-600" />
              {isMarathi ? 'प्रशासक नियंत्रण कक्ष' : 'Admin Mandi Dashboard'}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {isMarathi ? 'शेतकरी चेक-इन, वजन तपासणी, तक्रार निवारण आणि देयक प्रक्रिया' : 'Manage check-ins, queue triage, and grievance tickets'}
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <select
              value={selectedCentre?.id || ''}
              onChange={(e) => setSelectedCentre(centres.find((c) => c.id === parseInt(e.target.value)))}
              className="w-full border-2 border-gray-300 rounded-xl p-3 pl-10 text-sm font-bold bg-white text-gray-900"
            >
              {centres.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-primary-600 pointer-events-none" />
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex space-x-3 border-b-2 border-gray-200 pb-2">
          <button
            onClick={() => setActiveTab('queue')}
            className={`flex items-center space-x-2 px-5 py-3 rounded-2xl font-extrabold text-sm transition ${
              activeTab === 'queue' ? 'bg-primary-700 text-white shadow-lg' : 'bg-white text-gray-700 border-2 border-gray-200'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>{isMarathi ? 'रांग व खरेदी व्यवस्थापन' : 'Queue & Procurement'}</span>
          </button>

          <button
            onClick={() => setActiveTab('grievances')}
            className={`flex items-center space-x-2 px-5 py-3 rounded-2xl font-extrabold text-sm transition ${
              activeTab === 'grievances' ? 'bg-primary-700 text-white shadow-lg' : 'bg-white text-gray-700 border-2 border-gray-200'
            }`}
          >
            <HelpCircle className="h-4 w-4" />
            <span>{isMarathi ? 'तक्रार निवारण' : 'Grievance Redressal'}</span>
            {openGrievanceCount > 0 && (
              <span className="bg-red-500 text-white text-[11px] font-black px-2 py-0.5 rounded-full animate-pulse">
                {openGrievanceCount}
              </span>
            )}
          </button>
        </div>

        {/* Tab 1: Queue */}
        {activeTab === 'queue' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Total Bookings" value={stats.total_bookings || 0} color="from-blue-600 to-blue-700" />
              <StatCard label="Completed" value={stats.completed || 0} color="from-emerald-600 to-green-700" />
              <StatCard label="In Progress" value={stats.in_progress || 0} color="from-purple-600 to-indigo-700" />
              <StatCard label="Waiting" value={stats.waiting || 0} color="from-amber-500 to-orange-600" />
            </div>

            <div className="bg-white shadow-xl rounded-3xl p-6 sm:p-8 border-2 border-gray-100">
              <h2 className="text-2xl font-black text-gray-900 mb-6 pb-3 border-b border-gray-100">
                {isMarathi ? 'रांग व्यवस्थापन (Live Queue)' : 'Live Mandi Queue Actions'}
              </h2>

              {queueData.queue.length === 0 ? (
                <p className="text-gray-500 text-center py-12">No bookings for today.</p>
              ) : (
                <div className="space-y-4">
                  {queueData.queue
                    .filter((b) => b.status !== 'cancelled')
                    .map((booking) => (
                      <div
                        key={booking.id}
                        className="border-2 border-gray-200 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-primary-300 transition"
                      >
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="text-xl font-black text-primary-800">{booking.token_number}</span>
                            <StatusBadge status={booking.status} isMarathi={isMarathi} />
                            <PriorityBadge priorityLevel={booking.priority_level} isMarathi={isMarathi} />
                          </div>
                          <p className="text-sm font-semibold text-gray-700">
                            👤 {booking.farmer_name} • 🌾 {booking.commodity} • #{booking.queue_position}
                            {booking.quality_grade && (
                              <span className="ml-2">
                                <QualityGradeTag grade={booking.quality_grade} score={booking.quality_score} />
                              </span>
                            )}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                          {['booked', 'checked_in'].includes(booking.status) && (
                            <select
                              value={booking.priority_level || 'standard'}
                              onChange={(e) => handlePriorityChange(booking.id, e.target.value)}
                              className="text-xs font-bold border border-gray-300 rounded-lg px-2.5 py-2 bg-gray-50 text-gray-700"
                            >
                              <option value="standard">Standard (FIFO)</option>
                              <option value="express_grade_a">⚡ Fast-Track Grade-A</option>
                              <option value="moisture_urgent">🚨 Urgent Priority</option>
                            </select>
                          )}

                          {booking.status === 'booked' && (
                            <button
                              onClick={() => handleCheckIn(booking.id)}
                              disabled={loading}
                              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm flex items-center shadow"
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1.5" /> Check In
                            </button>
                          )}

                          {booking.status === 'checked_in' && (
                            <button
                              onClick={() => handleStart(booking.id)}
                              disabled={loading}
                              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-sm flex items-center shadow"
                            >
                              <Play className="h-4 w-4 mr-1.5" /> Start / Serve
                            </button>
                          )}

                          {booking.status === 'in_progress' && (
                            <button
                              onClick={() => handleOpenInspection(booking)}
                              disabled={loading}
                              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm flex items-center shadow"
                            >
                              <Flag className="h-4 w-4 mr-1.5" /> Complete & Pay
                            </button>
                          )}

                          {booking.status === 'completed' && (
                            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl flex items-center">
                              <CheckCircle2 className="h-4 w-4 mr-1 text-emerald-600" /> Procured
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Grievances */}
        {activeTab === 'grievances' && (
          <div className="bg-white shadow-xl rounded-3xl p-6 sm:p-8 border-2 border-gray-100 space-y-6">
            <h2 className="text-2xl font-black text-gray-900 pb-3 border-b border-gray-100">
              {isMarathi ? 'शेतकरी तक्रारी व निवारण शेरा' : 'Farmer Grievance Tickets'}
            </h2>

            <div className="flex gap-2">
              {['all', 'open', 'resolved'].map((st) => (
                <button
                  key={st}
                  onClick={() => setGrievanceFilterStatus(st)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition ${
                    grievanceFilterStatus === st ? 'bg-primary-700 text-white shadow' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {grievances.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No grievances found.</p>
            ) : (
              <div className="space-y-4">
                {grievances.map((g) => (
                  <div key={g.id} className="border-2 border-gray-200 rounded-2xl p-5 hover:border-primary-300 transition">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-black text-primary-700">{g.ticket_number}</span>
                        <h4 className="text-lg font-bold text-gray-900 mt-1">{g.subject}</h4>
                        <p className="text-sm text-gray-600 mt-1">{g.description}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${g.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                        {g.status}
                      </span>
                    </div>

                    {g.status === 'open' && (
                      <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
                        <button
                          onClick={() => {
                            setSelectedGrievance(g);
                            setResolutionRemarks('');
                            setResolutionModalOpen(true);
                          }}
                          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl"
                        >
                          Resolve Ticket →
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Quality Inspection Modal */}
        {inspectionModalOpen && selectedBooking && (
          <QualityInspectionModal
            isOpen={inspectionModalOpen}
            onClose={() => setInspectionModalOpen(false)}
            booking={selectedBooking}
            mspRate={mspRate}
            maxMoisture={maxMoisture}
            onSubmit={handleCompleteInspection}
            loading={loading}
          />
        )}

        {/* Grievance Resolution Modal */}
        {resolutionModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border-2 border-gray-200">
              <h3 className="text-xl font-black text-gray-900 mb-2">Resolve Grievance #{selectedGrievance?.ticket_number}</h3>
              <form onSubmit={handleResolveGrievance} className="space-y-4">
                <textarea
                  rows="4"
                  value={resolutionRemarks}
                  onChange={(e) => setResolutionRemarks(e.target.value)}
                  placeholder="Enter official resolution remarks..."
                  className="w-full border-2 border-gray-300 rounded-xl p-3 text-sm focus:border-primary-500"
                  required
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setResolutionModalOpen(false)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-bold text-gray-700"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-xs font-bold text-white shadow">
                    Submit Resolution
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

function StatCard({ label, value, color }) {
  return (
    <div className={`p-5 rounded-2xl shadow-lg bg-gradient-to-br ${color} text-white`}>
      <span className="text-xs font-bold uppercase tracking-wider opacity-80">{label}</span>
      <div className="text-3xl font-black my-1">{value}</div>
    </div>
  );
}
