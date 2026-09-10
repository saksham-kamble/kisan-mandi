import { useState, useEffect } from 'react';
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
import toast from 'react-hot-toast';
import {
  LayoutDashboard,
  Users,
  CheckCircle2,
  Play,
  Flag,
  MapPin,
  Sparkles,
  HelpCircle,
  Clock,
  AlertTriangle,
  MessageSquare,
  Send,
  UserCheck,
  Filter,
  Zap,
  Award,
} from 'lucide-react';
import QualityInspectionModal from '../components/admin/QualityInspectionModal';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('queue'); // 'queue' | 'grievances'
  const [centres, setCentres] = useState([]);
  const [selectedCentre, setSelectedCentre] = useState(null);
  const [queueData, setQueueData] = useState({ queue: [], stats: {} });
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const { t, isMarathi } = useLanguage();

  // Quality Inspection Modal State
  const [inspectionModalOpen, setInspectionModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [mspRate, setMspRate] = useState(null);
  const [maxMoisture, setMaxMoisture] = useState(null);

  // Grievance State
  const [grievances, setGrievances] = useState([]);
  const [loadingGrievances, setLoadingGrievances] = useState(false);
  const [grievanceFilterStatus, setGrievanceFilterStatus] = useState('all');
  const [selectedGrievance, setSelectedGrievance] = useState(null);
  const [resolutionModalOpen, setResolutionModalOpen] = useState(false);
  const [resolutionForm, setResolutionForm] = useState({
    status: 'resolved',
    admin_remarks: '',
    resolved_by: 'Mandi Grievance Officer',
  });
  const [submittingResolution, setSubmittingResolution] = useState(false);

  useEffect(() => {
    fetchCentres();
  }, []);

  useEffect(() => {
    if (selectedCentre) {
      fetchQueue();
      fetchStats();
      if (activeTab === 'grievances') {
        fetchGrievanceList();
      }
    }
  }, [selectedCentre, activeTab, grievanceFilterStatus]);

  const fetchCentres = async () => {
    try {
      const { data } = await getCentres();
      setCentres(data.centres);
      if (data.centres.length > 0) setSelectedCentre(data.centres[0]);
    } catch (err) {
      toast.error('Failed to load centres');
    }
  };

  const fetchQueue = async () => {
    if (!selectedCentre) return;
    try {
      const { data } = await getLiveQueue(selectedCentre.id);
      setQueueData(data);
    } catch (err) {
      toast.error('Failed to load queue');
    }
  };

  const fetchStats = async () => {
    if (!selectedCentre) return;
    try {
      const { data } = await getCentreStats(selectedCentre.id);
      setStats(data);
    } catch (err) {
      toast.error('Failed to load stats');
    }
  };

  const fetchGrievanceList = async () => {
    setLoadingGrievances(true);
    try {
      const params = {};
      if (grievanceFilterStatus !== 'all') {
        params.status = grievanceFilterStatus;
      }
      const { data } = await getAllGrievances(params);
      setGrievances(data.grievances || []);
    } catch (err) {
      toast.error('Failed to load grievances');
    } finally {
      setLoadingGrievances(false);
    }
  };

  const handleCheckIn = async (id) => {
    setLoading(true);
    try {
      await checkInBooking(id);
      toast.success(isMarathi ? 'शेतकरी चेक-इन पूर्ण (SMS पाठवला)' : 'Farmer checked in (SMS Alert Sent)');
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
      toast.success(isMarathi ? 'वजन व तपासणी सुरू केली (SMS पाठवला)' : 'Processing started (SMS Alert Sent)');
      fetchQueue();
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to start');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (booking) => {
    try {
      const { data } = await getRateForCommodity(encodeURIComponent(booking.commodity));
      const rateVal = data?.rate?.msp_rate_per_quintal ? parseFloat(data.rate.msp_rate_per_quintal) : 2275;
      const moistVal = data?.rate?.max_moisture_percentage ? parseFloat(data.rate.max_moisture_percentage) : 12.0;
      setMspRate(rateVal);
      setMaxMoisture(moistVal);
      setSelectedBooking(booking);
      setInspectionModalOpen(true);
    } catch (err) {
      console.warn('Could not fetch specific MSP data, applying standard default rate:', err);
      // Safe fallback default so inspection and payment workflow is never blocked
      setMspRate(2275);
      setMaxMoisture(12.0);
      setSelectedBooking(booking);
      setInspectionModalOpen(true);
    }
  };

  const submitQualityInspection = async (qualityData) => {
    setLoading(true);
    try {
      await completeBooking(selectedBooking.id, qualityData);
      toast.success(
        isMarathi
          ? '✅ गुणवत्ता तपासणी पूर्ण & DBT देयक प्रक्रिया सुरू!'
          : '✅ Quality inspection complete & DBT payout initiated!'
      );
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
    setLoading(true);
    try {
      await updateBookingPriority(bookingId, {
        priority_level: priorityLevel,
        priority_reason: `Admin gate priority override: ${priorityLevel}`,
      });
      toast.success(isMarathi ? 'प्राधान्य स्तर अद्यतनित केला' : 'Queue priority updated');
      fetchQueue();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update priority');
    } finally {
      setLoading(false);
    }
  };

  const openResolutionModal = (grievance) => {
    setSelectedGrievance(grievance);
    setResolutionForm({
      status: grievance.status === 'open' ? 'resolved' : grievance.status,
      admin_remarks: grievance.admin_remarks || '',
      resolved_by: grievance.resolved_by || 'Mandi Grievance Officer',
    });
    setResolutionModalOpen(true);
  };

  const handleResolveGrievance = async (e) => {
    e.preventDefault();
    if (!resolutionForm.admin_remarks.trim()) {
      toast.error(isMarathi ? 'कृपया अधिकारी शेरा लिहा' : 'Please enter officer resolution remarks');
      return;
    }
    setSubmittingResolution(true);
    try {
      await resolveGrievance(selectedGrievance.id, resolutionForm);
      toast.success(
        isMarathi
          ? '✅ तक्रार निवारण शेरा नोंदवला आणि शेतकऱ्याला SMS पाठवला!'
          : '✅ Grievance remarks recorded and SMS sent to farmer!'
      );
      setResolutionModalOpen(false);
      setSelectedGrievance(null);
      fetchGrievanceList();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to resolve grievance');
    } finally {
      setSubmittingResolution(false);
    }
  };

  const openGrievanceCount = grievances.filter((g) => g.status === 'open').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl shadow-xl border-2 border-gray-100">
          <div>
            <h1 className="text-3xl font-black text-gray-900 flex items-center">
              <LayoutDashboard className="h-8 w-8 mr-3 text-primary-600" />
              {isMarathi ? 'प्रशासक नियंत्रण कक्ष' : 'Admin Mandi Dashboard'}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {isMarathi
                ? 'शेतकरी चेक-इन, वजन तपासणी, तक्रार निवारण आणि देयक प्रक्रिया'
                : 'Manage farmer check-ins, weighment queue, quality testing, and grievance resolution'}
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <select
              value={selectedCentre?.id || ''}
              onChange={(e) => {
                const centre = centres.find((c) => c.id === parseInt(e.target.value));
                setSelectedCentre(centre);
              }}
              className="w-full border-2 border-gray-300 rounded-xl shadow-sm p-3 pl-10 text-sm font-bold bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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

        {/* Navigation Tabs */}
        <div className="flex space-x-3 border-b-2 border-gray-200 pb-2">
          <button
            onClick={() => setActiveTab('queue')}
            className={`flex items-center space-x-2 px-5 py-3 rounded-2xl font-extrabold text-sm transition-all ${
              activeTab === 'queue'
                ? 'bg-primary-700 text-white shadow-lg shadow-primary-700/20'
                : 'bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-200'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>{isMarathi ? 'रांग व खरेदी व्यवस्थापन' : 'Queue & Procurement'}</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('grievances');
              fetchGrievanceList();
            }}
            className={`flex items-center space-x-2 px-5 py-3 rounded-2xl font-extrabold text-sm transition-all ${
              activeTab === 'grievances'
                ? 'bg-primary-700 text-white shadow-lg shadow-primary-700/20'
                : 'bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-200'
            }`}
          >
            <HelpCircle className="h-4 w-4" />
            <span>{isMarathi ? 'तक्रार निवारण कक्ष' : 'Farmer Grievance Redressal'}</span>
            {openGrievanceCount > 0 && (
              <span className="bg-red-500 text-white text-[11px] font-black px-2 py-0.5 rounded-full animate-pulse">
                {openGrievanceCount}
              </span>
            )}
          </button>
        </div>

        {/* Tab 1: Queue & Procurement */}
        {activeTab === 'queue' && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                label={isMarathi ? 'एकूण बुकिंग' : 'Total Bookings'}
                value={stats.total_bookings || 0}
                color="bg-gradient-to-br from-blue-600 to-blue-700"
              />
              <StatCard
                label={isMarathi ? 'पूर्ण खरेदी' : 'Completed'}
                value={stats.completed || 0}
                color="bg-gradient-to-br from-emerald-600 to-green-700"
              />
              <StatCard
                label={isMarathi ? 'प्रक्रियेत' : 'In Progress'}
                value={stats.in_progress || 0}
                color="bg-gradient-to-br from-purple-600 to-indigo-700"
              />
              <StatCard
                label={isMarathi ? 'प्रतीक्षेत' : 'Waiting in Queue'}
                value={stats.waiting || 0}
                color="bg-gradient-to-br from-amber-500 to-orange-600"
              />
            </div>

            {/* Queue Management Card */}
            <div className="bg-white shadow-xl rounded-3xl p-6 sm:p-8 border-2 border-gray-100">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                <h2 className="text-2xl font-black text-gray-900">
                  {isMarathi ? 'रांग व्यवस्थापन (Queue Management)' : 'Live Mandi Queue Actions'}
                </h2>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                  ⚡ {isMarathi ? 'रिअल-टाइम अपडेट्स' : 'Real-time Sync Active'}
                </span>
              </div>

              {queueData.queue.length === 0 ? (
                <p className="text-gray-500 text-center py-12 font-medium">
                  {isMarathi ? 'आजसाठी कोणतेही बुकिंग नाही.' : 'No bookings found for today.'}
                </p>
              ) : (
                <div className="space-y-4">
                  {queueData.queue
                    .filter((b) => b.status !== 'cancelled')
                    .map((booking) => (
                      <div
                        key={booking.id}
                        className="border-2 border-gray-200 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-primary-300 hover:shadow-md transition"
                      >
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="text-xl font-black text-primary-800">
                              {booking.token_number}
                            </span>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                                booking.status === 'completed'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : booking.status === 'in_progress'
                                  ? 'bg-purple-100 text-purple-800 border border-purple-300 animate-pulse'
                                  : booking.status === 'checked_in'
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                  : 'bg-gray-100 text-gray-800 border border-gray-300'
                              }`}
                            >
                              {booking.status.replace('_', ' ').toUpperCase()}
                            </span>

                            {booking.priority_level === 'express_grade_a' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black uppercase bg-yellow-400 text-slate-950 border border-yellow-500 shadow-sm">
                                <Zap className="w-3.5 h-3.5 fill-current" />
                                {isMarathi ? 'ग्रेड-अ फास्ट-ट्रॅक' : 'Grade-A Express'}
                              </span>
                            )}
                            {booking.priority_level === 'moisture_urgent' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black uppercase bg-red-600 text-white shadow-sm">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                {isMarathi ? 'तातडीचे (ओलावा)' : 'Urgent Moisture'}
                              </span>
                            )}
                          </div>

                          <p className="text-sm font-semibold text-gray-700">
                            👤 {booking.farmer_name} • 🌾 {booking.commodity} • 🔢 {isMarathi ? 'रांग' : 'Queue'} #{booking.queue_position}
                            {booking.quality_grade && (
                              <span className="ml-2 inline-flex items-center gap-1 text-xs font-extrabold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                                <Award className="w-3 h-3 text-amber-600" />
                                AI: Grade {booking.quality_grade} ({booking.quality_score} pts)
                              </span>
                            )}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                          {/* Gate Priority Triage Quick Select */}
                          {['booked', 'checked_in'].includes(booking.status) && (
                            <select
                              value={booking.priority_level || 'standard'}
                              onChange={(e) => handlePriorityChange(booking.id, e.target.value)}
                              className="text-xs font-bold border border-gray-300 rounded-lg px-2.5 py-2 bg-gray-50 text-gray-700 hover:bg-gray-100 transition"
                              title="Gate Triage Priority"
                            >
                              <option value="standard">Standard Queue (FIFO)</option>
                              <option value="express_grade_a">⚡ Fast-Track Grade-A</option>
                              <option value="moisture_urgent">🚨 Urgent Priority</option>
                            </select>
                          )}
                          {booking.status === 'booked' && (
                            <button
                              onClick={() => handleCheckIn(booking.id)}
                              disabled={loading}
                              className="flex-1 md:flex-initial px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition disabled:opacity-50 text-sm flex items-center justify-center shadow"
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1.5" />
                              {isMarathi ? 'चेक-इन करा' : 'Check In'}
                            </button>
                          )}

                          {booking.status === 'checked_in' && (
                            <button
                              onClick={() => handleStart(booking.id)}
                              disabled={loading}
                              className="flex-1 md:flex-initial px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition disabled:opacity-50 text-sm flex items-center justify-center shadow"
                            >
                              <Play className="h-4 w-4 mr-1.5" />
                              {isMarathi ? 'काउंंटरवर बोलवा' : 'Start / Serve'}
                            </button>
                          )}

                          {booking.status === 'in_progress' && (
                            <button
                              onClick={() => handleComplete(booking)}
                              disabled={loading}
                              className="flex-1 md:flex-initial px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition disabled:opacity-50 text-sm flex items-center justify-center shadow"
                            >
                              <Flag className="h-4 w-4 mr-1.5" />
                              {isMarathi ? 'वजन पूर्ण करा' : 'Complete & Pay'}
                            </button>
                          )}

                          {booking.status === 'completed' && (
                            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl flex items-center">
                              <CheckCircle2 className="h-4 w-4 mr-1 text-emerald-600" />
                              {isMarathi ? 'खरेदी पूर्ण' : 'Procured'}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Tab 2: Grievances Management */}
        {activeTab === 'grievances' && (
          <div className="bg-white shadow-xl rounded-3xl p-6 sm:p-8 border-2 border-gray-100 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-2xl font-black text-gray-900 flex items-center">
                  <HelpCircle className="h-7 w-7 mr-2.5 text-primary-600" />
                  {isMarathi ? 'शेतकरी तक्रारी व निवारण शेरा' : 'Farmer Grievance Tickets'}
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  {isMarathi
                    ? 'तक्रार निवारण केल्यावर शेतकऱ्याला त्वरित SMS द्वारे अधिकृत निकाल कळवला जातो.'
                    : 'Recording remarks automatically sends an SMS notification to the farmer.'}
                </p>
              </div>

              {/* Status Filter */}
              <div className="flex items-center space-x-2">
                {[
                  { id: 'all', label: isMarathi ? 'सर्व' : 'All' },
                  { id: 'open', label: isMarathi ? 'नोंदवलेल्या' : 'Open' },
                  { id: 'in_progress', label: isMarathi ? 'प्रगतीपथावर' : 'In Progress' },
                  { id: 'resolved', label: isMarathi ? 'निवारण झालेले' : 'Resolved' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setGrievanceFilterStatus(f.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      grievanceFilterStatus === f.id
                        ? 'bg-primary-700 text-white shadow'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {loadingGrievances ? (
              <div className="py-16 text-center text-gray-500 font-bold">
                {isMarathi ? 'तक्रारी लोड होत आहेत...' : 'Loading grievance tickets...'}
              </div>
            ) : grievances.length === 0 ? (
              <div className="text-center py-16 text-gray-500 font-semibold">
                <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-2" />
                {isMarathi ? 'कोणतीही तक्रार आढळली नाही.' : 'No grievances found.'}
              </div>
            ) : (
              <div className="space-y-4">
                {grievances.map((g) => (
                  <div
                    key={g.id}
                    className="border-2 border-gray-200 rounded-2xl p-5 hover:border-primary-300 transition space-y-3"
                  >
                    {/* Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center space-x-2.5">
                        <span className="font-mono font-black text-xs bg-gray-900 text-yellow-300 px-2.5 py-1 rounded-md">
                          {g.ticket_number}
                        </span>
                        <span className="text-xs font-extrabold text-primary-900 bg-primary-50 px-2.5 py-0.5 rounded-md border border-primary-200">
                          {g.category.replace('_', ' ').toUpperCase()}
                        </span>
                        <span
                          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                            g.priority === 'urgent'
                              ? 'bg-red-100 text-red-800'
                              : g.priority === 'high'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {g.priority}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                            g.status === 'resolved'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : g.status === 'in_progress'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-blue-100 text-blue-800 border border-blue-300'
                          }`}
                        >
                          {g.status.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(g.created_at).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {/* Farmer Details */}
                    <div className="text-xs font-bold text-gray-700 bg-gray-50 p-2.5 rounded-xl border border-gray-200 flex flex-wrap gap-4 items-center">
                      <span>👤 <strong>{g.farmer_name}</strong></span>
                      <span>📱 +91 {g.farmer_phone}</span>
                      {g.booking_token && (
                        <span>
                          🎫 {isMarathi ? 'टोकन:' : 'Token:'} <strong>{g.booking_token}</strong> ({g.booking_commodity})
                        </span>
                      )}
                    </div>

                    {/* Subject & Description */}
                    <div>
                      <h4 className="font-extrabold text-gray-900 text-base">{g.subject}</h4>
                      <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{g.description}</p>
                    </div>

                    {/* Officer Remark if present */}
                    {g.admin_remarks && (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-950 font-semibold">
                        <span className="font-bold text-emerald-800 block mb-0.5">
                          ✓ {isMarathi ? 'नोंदवलेला निवारण शेरा:' : 'Recorded Resolution Remark:'} ({g.resolved_by})
                        </span>
                        "{g.admin_remarks}"
                      </div>
                    )}

                    {/* Action Button */}
                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => openResolutionModal(g)}
                        className="inline-flex items-center px-4 py-2 bg-primary-700 hover:bg-primary-800 text-white font-bold rounded-xl text-xs shadow transition"
                      >
                        <UserCheck className="h-4 w-4 mr-1.5" />
                        {g.status === 'resolved'
                          ? (isMarathi ? 'शेरा अद्ययावत करा' : 'Update Remarks')
                          : (isMarathi ? 'निवारण शेरा नोंदवा' : 'Resolve / Add Remarks')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Grievance Resolution Modal */}
      {resolutionModalOpen && selectedGrievance && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border-2 border-gray-100">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
              <div className="flex items-center space-x-2">
                <UserCheck className="h-6 w-6 text-primary-600" />
                <h3 className="text-xl font-black text-gray-900">
                  {isMarathi ? 'तक्रार निवारण व शेरा' : 'Resolve Grievance'}
                </h3>
              </div>
              <button
                onClick={() => setResolutionModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleResolveGrievance} className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-xs space-y-1">
                <div>
                  <span className="text-gray-500">{isMarathi ? 'तक्रार क्र:' : 'Ticket:'}</span>{' '}
                  <strong className="font-mono text-gray-900">{selectedGrievance.ticket_number}</strong>
                </div>
                <div>
                  <span className="text-gray-500">{isMarathi ? 'शेतकरी:' : 'Farmer:'}</span>{' '}
                  <strong>{selectedGrievance.farmer_name}</strong> (+91 {selectedGrievance.farmer_phone})
                </div>
                <div>
                  <span className="text-gray-500">{isMarathi ? 'विषय:' : 'Subject:'}</span>{' '}
                  <span className="text-gray-800">{selectedGrievance.subject}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {isMarathi ? 'स्थिती बदला (Status)' : 'Update Status'} *
                </label>
                <select
                  value={resolutionForm.status}
                  onChange={(e) => setResolutionForm({ ...resolutionForm, status: e.target.value })}
                  className="w-full border-2 border-gray-300 rounded-xl p-2.5 text-sm font-bold bg-white"
                >
                  <option value="in_progress">🟡 {isMarathi ? 'प्रगतीपथावर (In Progress)' : 'In Progress'}</option>
                  <option value="resolved">🟢 {isMarathi ? 'निवारण पूर्ण (Resolved)' : 'Resolved'}</option>
                  <option value="closed">⚪ {isMarathi ? 'बंद केले (Closed)' : 'Closed'}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {isMarathi ? 'निवारण शेरा / चौकशी अहवाल (Remarks)' : 'Official Resolution Remarks'} *
                </label>
                <textarea
                  rows={4}
                  required
                  value={resolutionForm.admin_remarks}
                  onChange={(e) =>
                    setResolutionForm({ ...resolutionForm, admin_remarks: e.target.value })
                  }
                  placeholder={
                    isMarathi
                      ? 'उदा. वजन काटा पुनर्तपासणी केली असून ५० किलोचा फरक भरपाई म्हणून मान्य केला आहे.'
                      : 'e.g. Scale re-calibrated and 50 kg adjustment approved for payout.'
                  }
                  className="w-full border-2 border-gray-300 rounded-xl p-3 text-sm font-semibold focus:border-primary-600 focus:ring-2 focus:ring-primary-500/20"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {isMarathi ? 'निवारण अधिकारी नाव / पद' : 'Grievance Officer Title'}
                </label>
                <input
                  type="text"
                  value={resolutionForm.resolved_by}
                  onChange={(e) =>
                    setResolutionForm({ ...resolutionForm, resolved_by: e.target.value })
                  }
                  className="w-full border-2 border-gray-300 rounded-xl p-2.5 text-xs font-semibold"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setResolutionModalOpen(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl text-sm"
                >
                  {isMarathi ? 'रद्द करा' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={submittingResolution}
                  className="flex-1 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-extrabold rounded-xl text-sm shadow disabled:opacity-50"
                >
                  {submittingResolution
                    ? (isMarathi ? 'जतन करत आहे...' : 'Saving...')
                    : (isMarathi ? 'शेरा नोंदवा & SMS पाठवा' : 'Save & Send SMS')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quality Inspection Modal */}
      {selectedBooking && (
        <QualityInspectionModal
          isOpen={inspectionModalOpen}
          onClose={() => {
            setInspectionModalOpen(false);
            setSelectedBooking(null);
          }}
          onSubmit={submitQualityInspection}
          booking={selectedBooking}
          mspRate={mspRate}
          maxMoisture={maxMoisture}
        />
      )}
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div className={`${color} text-white p-6 rounded-2xl shadow-lg`}>
      <div className="text-3xl sm:text-4xl font-black">{value}</div>
      <div className="text-xs font-bold mt-1 uppercase tracking-wider opacity-90">{label}</div>
    </div>
  );
}
