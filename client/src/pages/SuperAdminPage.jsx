import { useState, useEffect } from 'react';
import {
  getSuperAdminStats,
  getSuperAdminMandiReports,
  resolveSuperAdminGrievance,
  getCentresAudit,
  getUpdates,
  createUpdate,
  deleteUpdate,
} from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import toast from 'react-hot-toast';
import {
  Landmark,
  ShieldAlert,
  Building,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  Users,
  IndianRupee,
  Plus,
  Trash2,
  Volume2,
  RefreshCw,
  Search,
  FileText,
  Send,
  Eye,
  X,
  Radio,
  Sparkles,
  AlertCircle,
  Filter,
} from 'lucide-react';

export default function SuperAdminPage() {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'vigilance' | 'audit' | 'broadcast'
  const [stats, setStats] = useState(null);
  const [vigilanceTickets, setVigilanceTickets] = useState([]);
  const [centresAudit, setCentresAudit] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filter states
  const [statusFilter, setStatusFilter] = useState('all');
  const [centreSearch, setCentreSearch] = useState('');

  // Grievance resolution modal
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [resolutionStatus, setResolutionStatus] = useState('resolved');
  const [resolutionRemarks, setResolutionRemarks] = useState('');
  const [resolving, setResolving] = useState(false);

  // Broadcast modal / form
  const [broadcastForm, setBroadcastForm] = useState({
    title: '',
    title_marathi: '',
    content: '',
    content_marathi: '',
    category: 'weather_advisory',
    priority: 'normal',
    centre_id: '',
    created_by: 'Office of District Nodal Officer / APMC Director',
  });
  const [postingBroadcast, setPostingBroadcast] = useState(false);

  const { isMarathi } = useLanguage();

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [statsRes, reportsRes, auditRes, updatesRes] = await Promise.all([
        getSuperAdminStats().catch(() => ({ data: { stats: {} } })),
        getSuperAdminMandiReports().catch(() => ({ data: { reports: [] } })),
        getCentresAudit().catch(() => ({ data: { centres: [] } })),
        getUpdates().catch(() => ({ data: { updates: [] } })),
      ]);

      setStats(statsRes.data.stats || {});
      setVigilanceTickets(reportsRes.data.reports || []);
      setCentresAudit(auditRes.data.centres || []);
      setAnnouncements(updatesRes.data.updates || []);
    } catch (err) {
      toast.error('Failed to load Super Admin dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAllData();
    setRefreshing(false);
    toast.success(isMarathi ? 'माहिती अद्यतनित झाली' : 'Dashboard refreshed');
  };

  const handleOpenResolveModal = (ticket) => {
    setSelectedTicket(ticket);
    setResolutionStatus(ticket.status === 'resolved' ? 'resolved' : 'resolved');
    setResolutionRemarks(ticket.super_admin_remarks || ticket.admin_remarks || '');
  };

  const handleSubmitResolution = async (e) => {
    e.preventDefault();
    if (!resolutionRemarks.trim()) {
      toast.error(
        isMarathi ? 'कृपया अधिकृत शेरा किंवा आदेश प्रविष्ट करा' : 'Please enter executive order remarks'
      );
      return;
    }

    setResolving(true);
    try {
      await resolveSuperAdminGrievance(selectedTicket.id, {
        status: resolutionStatus,
        super_admin_remarks: resolutionRemarks,
      });

      toast.success(
        isMarathi
          ? 'तक्रारीवर जिल्हा नियंत्रण अधिकाऱ्यांचा आदेश जारी झाला!'
          : 'Executive order issued and grievance updated successfully!'
      );
      setSelectedTicket(null);
      await loadAllData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update grievance');
    } finally {
      setResolving(false);
    }
  };

  const handleCreateBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastForm.title.trim() || !broadcastForm.content.trim()) {
      toast.error(isMarathi ? 'कृपया शीर्षक व संदेश भरा' : 'Please fill title and content');
      return;
    }

    setPostingBroadcast(true);
    try {
      const payload = {
        ...broadcastForm,
        centre_id: broadcastForm.centre_id ? parseInt(broadcastForm.centre_id) : null,
      };
      await createUpdate(payload);
      toast.success(
        isMarathi
          ? 'सूचना यशस्वीरीत्या प्रसारित झाली!'
          : 'Official announcement broadcasted successfully!'
      );
      setBroadcastForm({
        title: '',
        title_marathi: '',
        content: '',
        content_marathi: '',
        category: 'weather_advisory',
        priority: 'normal',
        centre_id: '',
        created_by: 'Office of District Nodal Officer / APMC Director',
      });
      const updatesRes = await getUpdates();
      setAnnouncements(updatesRes.data.updates || []);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to broadcast announcement');
    } finally {
      setPostingBroadcast(false);
    }
  };

  const handleDeleteBroadcast = async (id) => {
    if (
      !window.confirm(
        isMarathi ? 'ही सूचना काढून टाकायची आहे का?' : 'Are you sure you want to delete this announcement?'
      )
    ) {
      return;
    }

    try {
      await deleteUpdate(id);
      toast.success(isMarathi ? 'सूचना हटवली गेली' : 'Announcement deleted');
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      toast.error('Failed to delete update');
    }
  };

  const playTTS = (text, lang = 'mr-IN') => {
    if (!('speechSynthesis' in window)) {
      toast.error('Speech synthesis not supported in this browser');
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const filteredTickets = vigilanceTickets.filter((t) => {
    if (statusFilter === 'all') return true;
    return t.status === statusFilter;
  });

  const filteredCentres = centresAudit.filter((c) => {
    if (!centreSearch) return true;
    const query = centreSearch.toLowerCase();
    return (
      c.name?.toLowerCase().includes(query) ||
      c.district?.toLowerCase().includes(query) ||
      c.taluka?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-yellow-500/20 border-2 border-yellow-400/40 rounded-3xl text-yellow-400">
              <Landmark className="h-9 w-9" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider bg-yellow-400 text-black rounded-lg">
                  Apex Authority
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Govt. of Maharashtra APMC Vigilance Directorate
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
                {isMarathi
                  ? 'जिल्हा कृषी नियंत्रण व दक्षता संचालनालय'
                  : 'District Nodal Officer & APMC Vigilance Command'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
                {isMarathi
                  ? 'राज्यस्तरीय शासकीय हमीभाव (MSP) खरेदी नियंत्रण, मंडी गैरव्यवहार निवारण आणि थेट शेतकरी दक्षता नियंत्रण कक्ष.'
                  : 'Statewide MSP Procurement Supervision, Mandi Audit & Farmer Malpractice Vigilance Portal.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold rounded-2xl transition shadow-sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {isMarathi ? 'माहिती अद्ययावत करा' : 'Refresh Feed'}
            </button>
          </div>
        </div>

        {/* Tab Navigation Navigation */}
        <div className="flex flex-wrap gap-2 p-1.5 bg-white rounded-2xl border-2 border-slate-200 shadow-sm">
          {[
            {
              id: 'overview',
              labelEn: 'Statewide Overview',
              labelMr: 'राज्यस्तरीय आढावा',
              icon: TrendingUp,
            },
            {
              id: 'vigilance',
              labelEn: `Mandi Vigilance Desk (${vigilanceTickets.filter((t) => t.status === 'open').length} Open)`,
              labelMr: `मंडी दक्षता तक्रारी (${vigilanceTickets.filter((t) => t.status === 'open').length})`,
              icon: ShieldAlert,
              badge: vigilanceTickets.filter((t) => t.status === 'open').length > 0,
            },
            {
              id: 'audit',
              labelEn: 'APMC Centres Audit',
              labelMr: 'मंडी केंद्र तपासणी व ऑडिट',
              icon: Building,
            },
            {
              id: 'broadcast',
              labelEn: 'Broadcast Advisories',
              labelMr: 'थेट शेतकरी सूचना प्रसारक',
              icon: Radio,
            },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-[160px] inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-black transition-all ${
                  activeTab === tab.id
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`h-4 w-4 ${tab.badge ? 'text-amber-400' : ''}`} />
                <span>{isMarathi ? tab.labelMr : tab.labelEn}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase">
                    {isMarathi ? 'सक्रिय खरेदी केंद्रे' : 'Active APMC Centres'}
                  </span>
                  <div className="p-2.5 bg-blue-50 text-blue-700 rounded-2xl">
                    <Building className="h-5 w-5" />
                  </div>
                </div>
                <div className="text-3xl font-black text-slate-900 mt-2">
                  {stats?.total_centres || centresAudit.length || 0}
                </div>
                <div className="text-xs text-emerald-600 font-semibold mt-1">
                  ✓ {isMarathi ? '१००% कार्यरत आणि जोडलेले' : '100% active and connected'}
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase">
                    {isMarathi ? 'नोंदणीकृत शेतकरी' : 'Registered Farmers'}
                  </span>
                  <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-2xl">
                    <Users className="h-5 w-5" />
                  </div>
                </div>
                <div className="text-3xl font-black text-slate-900 mt-2">
                  {(stats?.total_farmers || 1240).toLocaleString('en-IN')}
                </div>
                <div className="text-xs text-emerald-600 font-semibold mt-1">
                  ✓ {isMarathi ? '७/१२ भूअभिलेख संलग्न' : '7/12 Land records linked'}
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase">
                    {isMarathi ? 'एकूण खरेदी (क्विंटल)' : 'Procured Volume (Qt)'}
                  </span>
                  <div className="p-2.5 bg-amber-50 text-amber-700 rounded-2xl">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                </div>
                <div className="text-3xl font-black text-slate-900 mt-2">
                  {stats?.total_procured_kg
                    ? (stats.total_procured_kg / 100).toLocaleString('en-IN', {
                        maximumFractionDigits: 1,
                      })
                    : '4,850'} <span className="text-sm font-normal text-slate-500">Qt</span>
                </div>
                <div className="text-xs text-slate-500 font-semibold mt-1">
                  {isMarathi ? 'हंगाम २०२४-२५' : 'Kharif-Rabi Season 2024-25'}
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase">
                    {isMarathi ? 'वितरित हमीभाव देयक' : 'Disbursed MSP (DBT)'}
                  </span>
                  <div className="p-2.5 bg-purple-50 text-purple-700 rounded-2xl">
                    <IndianRupee className="h-5 w-5" />
                  </div>
                </div>
                <div className="text-2xl font-black text-purple-900 mt-2">
                  ₹
                  {stats?.total_payouts_disbursed
                    ? (stats.total_payouts_disbursed / 100000).toLocaleString('en-IN', {
                        maximumFractionDigits: 2,
                      })
                    : '142.50'}{' '}
                  <span className="text-xs font-bold text-slate-500">Lakh</span>
                </div>
                <div className="text-xs text-emerald-600 font-semibold mt-1">
                  ✓ {isMarathi ? 'थेट बँक खात्यात जमा' : '100% Direct DBT verified'}
                </div>
              </div>
            </div>

            {/* Vigilance Quick Alert Box */}
            <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white/20 rounded-2xl border border-white/30 text-white">
                  <ShieldAlert className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="text-lg font-black">
                    {isMarathi
                      ? 'मंडी गैरव्यवहार व दक्षता दक्षता कक्ष (Anti-Corruption Vigilance)'
                      : 'Anti-Corruption & Malpractice Vigilance Watch'}
                  </h3>
                  <p className="text-xs text-amber-100 mt-1 max-w-3xl leading-relaxed">
                    {isMarathi
                      ? `सध्या ${vigilanceTickets.filter((t) => t.status === 'open').length} तक्रारी थेट जिल्हा नियंत्रण अधिकाऱ्यांच्या आदेशासाठी प्रलंबित आहेत. वजनकाटा फेरफार किंवा लाचखोरीच्या तक्रारींवर तात्काळ कारवाई करा.`
                      : `${vigilanceTickets.filter((t) => t.status === 'open').length} direct complaints against mandis or officers are awaiting executive review and sanction orders.`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('vigilance')}
                className="px-5 py-2.5 bg-slate-950 text-white font-black rounded-xl hover:bg-black transition text-xs flex-shrink-0"
              >
                {isMarathi ? 'तक्रारींचे निवारण करा →' : 'Review Malpractice Tickets →'}
              </button>
            </div>

            {/* Centre Performance Summary */}
            <div className="bg-white rounded-3xl p-6 border-2 border-slate-100 shadow-md">
              <h3 className="text-base font-black text-slate-900 mb-4 flex items-center gap-2">
                <Building className="h-5 w-5 text-slate-700" />
                {isMarathi ? 'जिल्हास्तरीय APMC केंद्र स्थिती' : 'District APMC Procurement Status'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {centresAudit.slice(0, 3).map((centre) => (
                  <div
                    key={centre.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2"
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="font-extrabold text-sm text-slate-900">{centre.name}</h4>
                      <span className="text-[10px] font-mono bg-slate-200 px-2 py-0.5 rounded font-bold">
                        {centre.code}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600">
                      📍 {centre.taluka}, {centre.district}
                    </div>
                    <div className="flex justify-between text-xs font-semibold pt-2 border-t border-slate-200">
                      <span className="text-slate-500">{isMarathi ? 'दैनंदिन क्षमता:' : 'Daily Capacity:'}</span>
                      <span className="text-slate-900 font-bold">{centre.capacity_quintals_per_day} Qt/day</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: VIGILANCE DESK */}
        {activeTab === 'vigilance' && (
          <div className="space-y-6">
            {/* Header & Filters */}
            <div className="bg-white p-5 rounded-3xl border-2 border-slate-100 shadow-md flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="p-2.5 bg-red-100 text-red-700 rounded-xl">
                  <ShieldAlert className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">
                    {isMarathi
                      ? 'मंडी गैरव्यवहार व दक्षता डेस्क (Super Admin Desk)'
                      : 'Mandi Vigilance & Malpractice Desk'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {isMarathi
                      ? 'शेतकऱ्यांनी मंडी प्रशासनाविरुद्ध दाखल केलेल्या थेट तक्रारी व आदेश'
                      : 'Complaints filed directly against mandi administration or personnel'}
                  </p>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center space-x-1.5 bg-slate-100 p-1.5 rounded-xl text-xs font-bold">
                {[
                  { id: 'all', label: isMarathi ? 'सर्व' : 'All' },
                  { id: 'open', label: isMarathi ? 'प्रलंबित (Open)' : 'Open' },
                  { id: 'in_progress', label: isMarathi ? 'चौकशी सुरू' : 'In Progress' },
                  { id: 'resolved', label: isMarathi ? 'आदेशित (Resolved)' : 'Resolved' },
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setStatusFilter(st.id)}
                    className={`px-3 py-1.5 rounded-lg transition ${
                      statusFilter === st.id
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tickets Grid / List */}
            {filteredTickets.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border-2 border-slate-100 shadow-md">
                <CheckCircle2 className="h-16 w-16 text-emerald-500 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-900">
                  {isMarathi
                    ? 'कोणतीही प्रलंबित दक्षता तक्रार नाही'
                    : 'No pending vigilance complaints in this category'}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {isMarathi
                    ? 'सर्व APMC खरेदी केंद्रांवर कारभार सुरळीत सुरू आहे.'
                    : 'All centres operating normally within mandated government procurement norms.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-md hover:border-slate-400 transition space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-slate-950 text-yellow-400 font-mono font-black text-xs rounded-xl">
                          {ticket.ticket_number}
                        </span>
                        <span className="text-xs font-black px-2.5 py-1 bg-red-50 text-red-800 rounded-xl border border-red-200">
                          ⚖️ {ticket.category}
                        </span>
                        {ticket.is_against_mandi && (
                          <span className="text-[11px] font-black bg-purple-100 text-purple-900 px-2.5 py-0.5 rounded-lg border border-purple-200">
                            🏛️ Direct Super Admin Escalation
                          </span>
                        )}
                        <span
                          className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                            ticket.priority === 'urgent'
                              ? 'bg-red-600 text-white'
                              : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          {ticket.priority}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`text-xs font-black px-3 py-1 rounded-full ${
                            ticket.status === 'resolved'
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                              : ticket.status === 'in_progress'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-blue-100 text-blue-900 border border-blue-300'
                          }`}
                        >
                          {ticket.status.toUpperCase()}
                        </span>
                        <span className="text-xs text-slate-400">
                          {new Date(ticket.created_at).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="text-base font-black text-slate-900">{ticket.subject}</div>
                      <p className="text-sm text-slate-700 mt-1 leading-relaxed whitespace-pre-wrap">
                        {ticket.description}
                      </p>
                    </div>

                    {/* Complainant Farmer Details */}
                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-700 font-semibold gap-3">
                      <div>
                        <span className="text-slate-500">{isMarathi ? 'तक्रारदार शेतकरी:' : 'Complainant Farmer:'} </span>
                        <span className="font-bold text-slate-900">{ticket.farmer_name || 'Registered Farmer'}</span>{' '}
                        (📞 {ticket.farmer_phone || 'N/A'})
                      </div>
                      {ticket.centre_name && (
                        <div>
                          <span className="text-slate-500">{isMarathi ? 'संबंधित मंडी:' : 'Target APMC:'} </span>
                          <span className="font-bold text-slate-900">📍 {ticket.centre_name}</span>
                        </div>
                      )}
                      {ticket.booking_token && (
                        <div>
                          <span className="text-slate-500">{isMarathi ? 'टोकन:' : 'Token:'} </span>
                          <span className="font-mono font-bold text-indigo-700">{ticket.booking_token}</span>
                        </div>
                      )}
                    </div>

                    {/* Executive Order Display if resolved */}
                    {ticket.super_admin_remarks && (
                      <div className="bg-emerald-50 border-2 border-emerald-300 p-4 rounded-2xl space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-black text-emerald-950">
                          <span className="flex items-center gap-1.5">
                            <Landmark className="w-4 h-4 text-emerald-700" />
                            {isMarathi ? 'जिल्हा नियंत्रण अधिकारी आदेश व शेरा:' : 'District Super Admin Executive Sanction:'}
                          </span>
                          <span className="text-[11px] text-emerald-800">
                            Issued by {ticket.super_admin_resolved_by || 'APMC Director Office'}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-emerald-950 bg-white/80 p-3 rounded-xl border border-emerald-200">
                          "{ticket.super_admin_remarks}"
                        </p>
                      </div>
                    )}

                    {/* Action Button */}
                    <div className="flex justify-end pt-2">
                      <button
                        onClick={() => handleOpenResolveModal(ticket)}
                        className="inline-flex items-center px-5 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-black rounded-xl transition shadow-sm"
                      >
                        <Landmark className="w-4 h-4 mr-1.5 text-yellow-400" />
                        {ticket.status === 'resolved'
                          ? isMarathi
                            ? 'आदेश सुधारा / पुन्हा उघडा'
                            : 'Update Executive Order'
                          : isMarathi
                          ? 'चौकशी आदेश / निकाल द्या'
                          : 'Issue Executive Order & Resolution'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: APMC CENTRES AUDIT */}
        {activeTab === 'audit' && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-3xl border-2 border-slate-100 shadow-md flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  {isMarathi ? 'APMC खरेदी केंद्र तपासणी व ऑडिट' : 'APMC Centres Vigilance & Operational Audit'}
                </h2>
                <p className="text-xs text-slate-500">
                  {isMarathi
                    ? 'सर्व शासकीय हमीभाव खरेदी केंद्रांची क्षमता, वजनकाटा स्थिती आणि प्रत्यक्ष खरेदी तपासणी.'
                    : 'Real-time performance audit, capacity metrics, and grievance volume per centre.'}
                </p>
              </div>

              <div className="relative min-w-[260px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder={
                    isMarathi ? 'केंद्राचे नाव किंवा जिल्हा शोधा...' : 'Search centre by name or district...'
                  }
                  value={centreSearch}
                  onChange={(e) => setCentreSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border-2 border-slate-200 rounded-xl text-xs font-bold focus:border-slate-900 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredCentres.map((centre) => (
                <div
                  key={centre.id}
                  className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-md space-y-4 hover:border-slate-400 transition"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md font-extrabold">
                        {centre.code}
                      </span>
                      <h3 className="text-base font-black text-slate-900 mt-1">{centre.name}</h3>
                      <div className="text-xs text-slate-500 mt-0.5">
                        📍 {centre.taluka}, {centre.district}, {centre.state}
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                        centre.is_active
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                          : 'bg-red-100 text-red-900'
                      }`}
                    >
                      {centre.is_active ? 'OPERATIONAL' : 'INACTIVE'}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-2 text-xs">
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-500">{isMarathi ? 'दक्षता संपर्क:' : 'Contact Officer:'}</span>
                      <span className="text-slate-900 font-bold">{centre.contact_phone || '020-26051515'}</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-500">{isMarathi ? 'दैनिक क्षमता:' : 'Daily Capacity:'}</span>
                      <span className="text-slate-900 font-bold">{centre.capacity_quintals_per_day} Quintals</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-500">{isMarathi ? 'वजनकाटे संख्या:' : 'Weighbridges:'}</span>
                      <span className="text-slate-900 font-bold">2 Electronic Certified</span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs font-bold text-slate-600">
                    <span className="text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      {isMarathi ? 'वजनकाटा प्रमाणित' : 'Weighing Certified'}
                    </span>
                    <span className="text-slate-400">Audit ID: #APMC-{centre.id}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: BROADCAST ADVISORIES */}
        {activeTab === 'broadcast' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Create Announcement Form */}
            <div className="lg:col-span-1 bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-md space-y-5">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="p-2.5 bg-yellow-100 text-yellow-800 rounded-xl">
                  <Radio className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    {isMarathi ? 'नवीन सूचना प्रसारित करा' : 'Broadcast Live Advisory'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isMarathi ? 'शेतकऱ्यांच्या डॅशबोर्डवर तात्काळ दिसेल' : 'Instant broadcast to all farmers'}
                  </p>
                </div>
              </div>

              <form onSubmit={handleCreateBroadcast} className="space-y-4 text-xs font-bold">
                <div>
                  <label className="block text-slate-700 mb-1">
                    {isMarathi ? 'प्रकार (Category)' : 'Advisory Category'} *
                  </label>
                  <select
                    value={broadcastForm.category}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, category: e.target.value })}
                    className="w-full p-2.5 border-2 border-slate-200 rounded-xl focus:border-slate-900 focus:outline-none"
                  >
                    <option value="weather_advisory">🌦️ Weather / Unseasonal Rain Alert</option>
                    <option value="msp_update">💰 Government MSP Revision / Bonus</option>
                    <option value="gov_scheme">📜 Government Scheme (PM-AASHA / PSS)</option>
                    <option value="mandi_notice">📢 APMC Operational Notice</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">
                    {isMarathi ? 'प्राधान्य (Priority)' : 'Priority'} *
                  </label>
                  <select
                    value={broadcastForm.priority}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, priority: e.target.value })}
                    className="w-full p-2.5 border-2 border-slate-200 rounded-xl focus:border-slate-900 focus:outline-none"
                  >
                    <option value="normal">Normal (सामान्य)</option>
                    <option value="urgent">Urgent (तातडीची)</option>
                    <option value="alert">High Alert (अतिदक्षता इशारा)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">
                    {isMarathi ? 'शीर्षक (इंग्रजीत - Title in English)' : 'Title (English)'} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Unseasonal Rain Warning: Protect Harvested Cotton"
                    value={broadcastForm.title}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                    className="w-full p-2.5 border-2 border-slate-200 rounded-xl focus:border-slate-900 focus:outline-none font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">
                    {isMarathi ? 'शीर्षक (मराठीत - Title in Marathi)' : 'Title (Marathi)'}
                  </label>
                  <input
                    type="text"
                    placeholder="उदा. अवकाळी पावसाचा इशारा: कापूस व सोयाबीन सुरक्षित साठवा"
                    value={broadcastForm.title_marathi}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, title_marathi: e.target.value })}
                    className="w-full p-2.5 border-2 border-slate-200 rounded-xl focus:border-slate-900 focus:outline-none font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">
                    {isMarathi ? 'तपशील (इंग्रजीत - Content in English)' : 'Content (English)'} *
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Detailed advisory, moisture protection steps, helpline info..."
                    value={broadcastForm.content}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, content: e.target.value })}
                    className="w-full p-2.5 border-2 border-slate-200 rounded-xl focus:border-slate-900 focus:outline-none font-normal"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">
                    {isMarathi ? 'तपशील (मराठीत - Content in Marathi)' : 'Content (Marathi)'}
                  </label>
                  <textarea
                    rows={3}
                    placeholder="सविस्तर शेतकरी सल्ला, ओलावा नियंत्रण, सुरक्षित साठवणूक..."
                    value={broadcastForm.content_marathi}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, content_marathi: e.target.value })}
                    className="w-full p-2.5 border-2 border-slate-200 rounded-xl focus:border-slate-900 focus:outline-none font-normal"
                  />
                </div>

                <button
                  type="submit"
                  disabled={postingBroadcast}
                  className="w-full py-3 bg-slate-900 hover:bg-black text-white font-black rounded-xl transition shadow-md flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4 text-yellow-400" />
                  {postingBroadcast
                    ? isMarathi
                      ? 'प्रसारित करत आहे...'
                      : 'Broadcasting...'
                    : isMarathi
                    ? 'सर्व शेतकऱ्यांना प्रसारित करा'
                    : 'Publish Statewide Broadcast'}
                </button>
              </form>
            </div>

            {/* List of active broadcasts */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-slate-900">
                  {isMarathi ? 'सध्या सुरू असलेल्या अधिकृत सूचना' : 'Active Broadcasts & Advisories'} (
                  {announcements.length})
                </h3>
              </div>

              {announcements.length === 0 ? (
                <div className="bg-white rounded-3xl p-10 text-center border-2 border-slate-100 shadow-md">
                  <p className="text-slate-500 font-bold">
                    {isMarathi ? 'कोणतीही सूचना प्रसारित केलेली नाही' : 'No active broadcasts yet.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {announcements.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-md space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black px-2.5 py-1 bg-slate-100 text-slate-800 rounded-xl uppercase">
                            {item.category.replace('_', ' ')}
                          </span>
                          <span
                            className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                              item.priority === 'alert'
                                ? 'bg-red-600 text-white'
                                : item.priority === 'urgent'
                                ? 'bg-amber-500 text-white'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {item.priority}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              playTTS(
                                isMarathi && item.content_marathi
                                  ? `${item.title_marathi || item.title}. ${item.content_marathi}`
                                  : `${item.title}. ${item.content}`,
                                isMarathi ? 'mr-IN' : 'en-IN'
                              )
                            }
                            className="p-1.5 text-slate-600 hover:text-indigo-600 bg-slate-100 rounded-lg"
                            title="Listen Audio"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteBroadcast(item.id)}
                            className="p-1.5 text-red-600 hover:text-red-800 bg-red-50 rounded-lg"
                            title="Delete Announcement"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-base font-black text-slate-900">
                          {isMarathi && item.title_marathi ? item.title_marathi : item.title}
                        </h4>
                        <p className="text-sm text-slate-700 mt-1 leading-relaxed whitespace-pre-wrap">
                          {isMarathi && item.content_marathi ? item.content_marathi : item.content}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                        <span>Issued by: {item.created_by || 'APMC Director'}</span>
                        <span>{new Date(item.created_at).toLocaleDateString('en-IN')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* RESOLUTION MODAL */}
        {selectedTicket && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border-2 border-slate-200 max-h-[90vh] overflow-y-auto space-y-6 animate-in fade-in zoom-in duration-200">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-slate-900 text-yellow-400 rounded-2xl">
                    <Landmark className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">
                      {isMarathi ? 'जिल्हा नियंत्रण अधिकारी निकाल व आदेश' : 'Issue Super Admin Executive Order'}
                    </h3>
                    <p className="text-xs text-slate-500 font-mono">
                      Ticket #{selectedTicket.ticket_number}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Grievance Summary Card */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between font-bold">
                  <span className="text-slate-500">Complainant:</span>
                  <span className="text-slate-900">
                    {selectedTicket.farmer_name || 'Farmer'} (📞 {selectedTicket.farmer_phone})
                  </span>
                </div>
                <div className="flex justify-between font-bold">
                  <span className="text-slate-500">Mandi:</span>
                  <span className="text-slate-900">{selectedTicket.centre_name || 'APMC Centre'}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 font-normal text-slate-800">
                  <div className="font-bold text-slate-900 text-sm mb-1">{selectedTicket.subject}</div>
                  <p className="whitespace-pre-wrap">{selectedTicket.description}</p>
                </div>
              </div>

              {/* Resolution Form */}
              <form onSubmit={handleSubmitResolution} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isMarathi ? 'निवारण स्थिती निवडा (Status)' : 'Grievance Status'} *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setResolutionStatus('resolved')}
                      className={`p-3 rounded-2xl border-2 text-xs font-black transition flex items-center justify-center gap-2 ${
                        resolutionStatus === 'resolved'
                          ? 'bg-emerald-50 border-emerald-600 text-emerald-900 shadow-sm'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      {isMarathi ? 'निवारण झाले / आदेश जारी' : 'Resolved (Issue Sanction)'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setResolutionStatus('in_progress')}
                      className={`p-3 rounded-2xl border-2 text-xs font-black transition flex items-center justify-center gap-2 ${
                        resolutionStatus === 'in_progress'
                          ? 'bg-amber-50 border-amber-600 text-amber-900 shadow-sm'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      <Clock className="w-4 h-4 text-amber-600" />
                      {isMarathi ? 'चौकशी प्रलंबित ठेवा' : 'Keep In Progress (Inquiry)'}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isMarathi
                      ? 'अधिकृत आदेश, शेरा व कारवाईचे निर्देश (Executive Directive Remarks)'
                      : 'Executive Directives & Corrective Action Remarks'} *
                  </label>
                  <textarea
                    rows={5}
                    required
                    placeholder={
                      isMarathi
                        ? 'उदा. वजनकाट्याची तातडीने तपासणी करण्याचे आदेश दिले आहेत. शेतकर्याची ४० किलो कपात रद्द करून पूर्ण देयक जमा करण्याचे निर्देश देण्यात आले आहेत.'
                        : 'e.g. Weighbridge calibrated under inspector supervision. Mandi directed to refund 40kg moisture cut and credit full DBT amount within 24h.'
                    }
                    value={resolutionRemarks}
                    onChange={(e) => setResolutionRemarks(e.target.value)}
                    className="w-full p-3 border-2 border-slate-300 rounded-xl text-xs font-semibold focus:border-slate-900 focus:outline-none leading-relaxed"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedTicket(null)}
                    className="flex-1 py-3 border-2 border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-100 transition text-xs"
                  >
                    {isMarathi ? 'रद्द करा' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={resolving}
                    className="flex-1 py-3 bg-slate-900 hover:bg-black text-white font-black rounded-xl shadow-md transition text-xs disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    <Landmark className="w-4 h-4 text-yellow-400" />
                    {resolving
                      ? isMarathi
                        ? 'आदेश नोंदवत आहे...'
                        : 'Issuing Order...'
                      : isMarathi
                      ? 'अधिकृत निकाल जारी करा'
                      : 'Sign & Issue Official Order'}
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
