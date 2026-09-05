import { useState, useEffect } from 'react';
import { getMyGrievances, createGrievance, getMyBookings } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import toast from 'react-hot-toast';
import {
  HelpCircle,
  Plus,
  PhoneCall,
  Mail,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ShieldAlert,
  ChevronRight,
  MessageSquare,
  Building,
  UserCheck,
  Search,
  Landmark,
  ShieldCheck,
  X,
} from 'lucide-react';

export default function HelpdeskPage() {
  const [grievances, setGrievances] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    category: 'payment_delay',
    subject: '',
    description: '',
    booking_id: '',
    priority: 'medium',
    target_authority: 'mandi_admin', // 'mandi_admin' | 'super_admin'
    is_against_mandi: false,
  });

  const { isMarathi } = useLanguage();

  const categories = [
    {
      id: 'payment_delay',
      nameEn: 'DBT Payment Delay',
      nameMr: 'देयक विलंब (DBT Payment)',
      icon: '💰',
    },
    {
      id: 'weight_dispute',
      nameEn: 'Weighment Discrepancy / Scale Tampering',
      nameMr: 'वजन मोजणी तफावत / वजनकाटा फेरफार',
      icon: '⚖️',
    },
    {
      id: 'quality_dispute',
      nameEn: 'Quality & Moisture Cut Dispute',
      nameMr: 'गुणवत्ता व ओलावा कपात वाद',
      icon: '🌾',
    },
    {
      id: 'slot_queue_issue',
      nameEn: 'Slot Booking / Queue Favoritism',
      nameMr: 'स्लॉट बुकिंग / रांगेतील पक्षपात',
      icon: '⏰',
    },
    {
      id: 'officer_conduct',
      nameEn: 'Mandi Official Misconduct / Corruption',
      nameMr: 'मंडी अधिकारी / कर्मचारी गैरवर्तन व लाचखोरी',
      icon: '👤',
    },
    {
      id: 'other',
      nameEn: 'Other APMC Issue',
      nameMr: 'इतर तक्रार',
      icon: '📝',
    },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [grievanceRes, bookingsRes] = await Promise.all([
        getMyGrievances(),
        getMyBookings().catch(() => ({ data: { bookings: [] } })),
      ]);
      setGrievances(grievanceRes.data.grievances || []);
      setBookings(bookingsRes.data.bookings || []);
    } catch (err) {
      toast.error('Failed to load helpdesk tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGrievance = async (e) => {
    e.preventDefault();
    if (!formData.subject.trim() || !formData.description.trim()) {
      toast.error(isMarathi ? 'कृपया विषय आणि तपशील भरा' : 'Please fill subject and description');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        category: formData.category,
        subject: formData.subject,
        description: formData.description,
        priority: formData.is_against_mandi ? 'urgent' : formData.priority,
        booking_id: formData.booking_id ? parseInt(formData.booking_id) : null,
        target_authority: formData.is_against_mandi ? 'super_admin' : 'mandi_admin',
        is_against_mandi: formData.is_against_mandi,
      };

      const { data } = await createGrievance(payload);
      toast.success(
        formData.is_against_mandi
          ? isMarathi
            ? `जिल्हा नियंत्रण अधिकाऱ्यांकडे तक्रार वर्ग झाली! तक्रार क्र: ${data.grievance.ticket_number}`
            : `Report sent directly to District Super Admin! Ticket: ${data.grievance.ticket_number}`
          : isMarathi
          ? `तक्रार नोंदणी यशस्वी! तक्रार क्र: ${data.grievance.ticket_number}`
          : `Grievance registered! Ticket: ${data.grievance.ticket_number}`
      );
      setShowModal(false);
      setFormData({
        category: 'payment_delay',
        subject: '',
        description: '',
        booking_id: '',
        priority: 'medium',
        target_authority: 'mandi_admin',
        is_against_mandi: false,
      });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit grievance');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredGrievances = grievances.filter((g) => {
    if (statusFilter === 'all') return true;
    return g.status === statusFilter;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'resolved':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-emerald-600" />
            {isMarathi ? 'निवारण झाले (Resolved)' : 'Resolved'}
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800 border border-amber-300">
            <Clock className="h-3.5 w-3.5 mr-1 text-amber-600" />
            {isMarathi ? 'चौकशी सुरू (In Progress)' : 'In Progress'}
          </span>
        );
      case 'closed':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-gray-100 text-gray-800 border border-gray-300">
            {isMarathi ? 'बंद (Closed)' : 'Closed'}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-blue-100 text-blue-800 border border-blue-300">
            <AlertTriangle className="h-3.5 w-3.5 mr-1 text-blue-600" />
            {isMarathi ? 'नोंदवले (Open)' : 'Open'}
          </span>
        );
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'urgent':
        return (
          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-red-100 text-red-800 border border-red-200">
            {isMarathi ? 'अतितात्काळ' : 'Urgent'}
          </span>
        );
      case 'high':
        return (
          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
            {isMarathi ? 'उच्च' : 'High'}
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-gray-100 text-gray-700">
            {isMarathi ? 'सामान्य' : 'Normal'}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Hero Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-2.5 bg-primary-100 text-primary-800 rounded-2xl">
                <HelpCircle className="h-7 w-7" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
                {isMarathi ? 'शेतकरी मदत व तक्रार निवारण केंद्र' : 'Kisan Helpdesk & Grievance Desk'}
              </h1>
            </div>
            <p className="text-sm text-gray-600 mt-1 max-w-2xl">
              {isMarathi
                ? 'वजन मोजणी तफावत, ओलावा कपात किंवा देयक विलंबाची अधिकृत तक्रार नोंदवा. मंडी गैरव्यवहाराची तक्रार थेट जिल्हा नियंत्रण अधिकाऱ्यांकडे (Super Admin) करू शकता.'
                : 'Raise official disputes for weight discrepancies, moisture deductions, or DBT delays. Report mandi irregularities directly to the District Super Admin.'}
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center px-6 py-3.5 bg-gradient-to-r from-primary-600 to-emerald-600 text-white font-black rounded-2xl hover:from-primary-700 hover:to-emerald-700 transition shadow-xl text-sm flex-shrink-0"
          >
            <Plus className="h-5 w-5 mr-2" />
            {isMarathi ? 'नवीन तक्रार नोंदवा' : 'Raise New Grievance'}
          </button>
        </div>

        {/* Support Channels Banner */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="bg-gradient-to-r from-primary-700 to-emerald-700 text-white p-5 rounded-3xl shadow-lg flex items-center space-x-4">
            <div className="p-3 bg-white/15 rounded-2xl border border-white/20">
              <PhoneCall className="h-6 w-6 text-yellow-300" />
            </div>
            <div>
              <div className="text-xs text-emerald-200 font-semibold">
                {isMarathi ? 'टोल-फ्री कृषी हेल्पलाईन' : 'Toll-Free Kisan Helpline'}
              </div>
              <div className="text-xl font-black text-yellow-300 tracking-wide">1800-180-1551</div>
              <div className="text-[11px] text-emerald-200">
                24x7 {isMarathi ? 'मोफत मदत' : 'Toll-Free Support'}
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl shadow-md border-2 border-gray-100 flex items-center space-x-4">
            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200">
              <Landmark className="h-6 w-6 text-emerald-700" />
            </div>
            <div>
              <div className="text-xs text-gray-500 font-semibold">
                {isMarathi ? 'जिल्हा कृषी नियंत्रण अधिकारी कक्ष' : 'District Super Admin Vigilance'}
              </div>
              <div className="text-base font-extrabold text-gray-900">020-26051515 / 16</div>
              <div className="text-[11px] text-gray-500">
                {isMarathi ? 'थेट मंडी तक्रार निवारण' : 'Direct Mandi Escalations'}
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl shadow-md border-2 border-gray-100 flex items-center space-x-4 sm:col-span-2 lg:col-span-1">
            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200">
              <Mail className="h-6 w-6 text-emerald-700" />
            </div>
            <div>
              <div className="text-xs text-gray-500 font-semibold">
                {isMarathi ? 'अधिकृत ईमेल' : 'Official Helpdesk Email'}
              </div>
              <div className="text-sm font-bold text-gray-900">nodal.kisanmandi@gov.in</div>
              <div className="text-[11px] text-gray-500">
                {isMarathi ? '२४ तासांत प्रतिसाद' : 'Response in 24 hours'}
              </div>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-3xl shadow-md border-2 border-gray-100">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-gray-500 mr-1">
              {isMarathi ? 'स्थिती फिल्टर:' : 'Filter Status:'}
            </span>
            {[
              { id: 'all', label: isMarathi ? 'सर्व' : 'All' },
              { id: 'open', label: isMarathi ? 'नोंदवलेल्या' : 'Open' },
              { id: 'in_progress', label: isMarathi ? 'प्रगतीपथावर' : 'In Progress' },
              { id: 'resolved', label: isMarathi ? 'निवारण झालेले' : 'Resolved' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  statusFilter === tab.id
                    ? 'bg-primary-700 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="text-xs font-bold text-gray-500">
            {isMarathi
              ? `एकूण तक्रारी: ${filteredGrievances.length}`
              : `Total Tickets: ${filteredGrievances.length}`}
          </div>
        </div>

        {/* Tickets List */}
        {loading ? (
          <div className="py-20 text-center text-gray-500 font-bold">
            {isMarathi ? 'तक्रार इतिहास लोड होत आहे...' : 'Loading grievance tickets...'}
          </div>
        ) : filteredGrievances.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-lg border-2 border-gray-100 space-y-3">
            <CheckCircle2 className="h-16 w-16 text-emerald-500 mx-auto" />
            <h3 className="text-xl font-bold text-gray-900">
              {isMarathi ? 'कोणतीही प्रलंबित तक्रार नाही' : 'No grievance tickets found'}
            </h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              {isMarathi
                ? 'आपली सर्व खरेदी व देयके व्यवस्थित पार पडली आहेत. काही अडचण असल्यास नवीन तक्रार नोंदवा.'
                : 'You have no active complaints. If you face any issues regarding weight, quality, or payments, click Raise New Grievance.'}
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {filteredGrievances.map((ticket) => (
              <div
                key={ticket.id}
                className="bg-white rounded-3xl p-6 sm:p-7 shadow-xl border-2 border-gray-100 hover:border-emerald-300 transition-all duration-200 space-y-4"
              >
                {/* Top Row: Ticket ID, Category, Badges */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-100">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 bg-gray-900 text-yellow-300 rounded-xl text-xs font-mono font-black tracking-wider">
                      {ticket.ticket_number}
                    </span>

                    <span className="text-xs font-extrabold text-primary-800 bg-primary-50 px-2.5 py-1 rounded-xl border border-primary-200">
                      {categories.find((c) => c.id === ticket.category)?.icon || '📌'}{' '}
                      {isMarathi
                        ? categories.find((c) => c.id === ticket.category)?.nameMr
                        : categories.find((c) => c.id === ticket.category)?.nameEn ||
                          ticket.category}
                    </span>

                    {/* Direct to Super Admin Vigilance Badge */}
                    {(ticket.is_against_mandi || ticket.target_authority === 'super_admin') && (
                      <span className="text-xs font-black bg-purple-100 text-purple-900 px-3 py-1 rounded-xl border border-purple-300 flex items-center gap-1">
                        <Landmark className="w-3.5 h-3.5 text-purple-700" />
                        {isMarathi ? 'जिल्हा नियंत्रण अधिकारी (Super Admin)' : 'Direct to Super Admin'}
                      </span>
                    )}

                    {getPriorityBadge(ticket.priority)}
                  </div>

                  <div className="flex items-center space-x-3">
                    {getStatusBadge(ticket.status)}
                    <span className="text-xs text-gray-400 font-medium">
                      {new Date(ticket.created_at).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                {/* Subject & Description */}
                <div>
                  <h3 className="text-lg font-black text-gray-900">{ticket.subject}</h3>
                  <p className="text-sm text-gray-700 mt-1.5 whitespace-pre-wrap leading-relaxed">
                    {ticket.description}
                  </p>
                </div>

                {/* Linked Booking details if any */}
                {ticket.booking_token && (
                  <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-200 flex flex-wrap items-center gap-4 text-xs font-semibold text-gray-700">
                    <span className="text-gray-500">
                      {isMarathi ? 'संबंधित खरेदी टोकन:' : 'Linked Token:'}
                    </span>
                    <span className="font-mono font-bold text-primary-800">
                      {ticket.booking_token}
                    </span>
                    <span>• {ticket.booking_commodity}</span>
                    {ticket.centre_name && <span>• 📍 {ticket.centre_name}</span>}
                  </div>
                )}

                {/* Super Admin Executive Resolution / Mandi Officer Remarks */}
                {ticket.admin_remarks || ticket.super_admin_remarks ? (
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-2xl p-4 sm:p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <UserCheck className="h-5 w-5 text-emerald-700" />
                        <span className="text-xs font-black text-emerald-950">
                          {ticket.super_admin_remarks
                            ? isMarathi
                              ? 'जिल्हा नियंत्रण अधिकारी (Super Admin) आदेश व निकाल'
                              : 'District Super Admin Executive Order'
                            : isMarathi
                            ? 'अधिकारी शेरा व निवारण अहवाल'
                            : 'Officer Resolution Remark'}
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-800">
                        ✓ {ticket.super_admin_resolved_by || ticket.resolved_by || 'Grievance Officer'}
                      </span>
                    </div>

                    <p className="text-sm text-emerald-950 font-semibold bg-white/90 p-3.5 rounded-xl border border-emerald-200 leading-relaxed">
                      "{ticket.super_admin_remarks || ticket.admin_remarks}"
                    </p>

                    {(ticket.super_admin_resolved_at || ticket.resolved_at) && (
                      <div className="text-[10px] text-emerald-700 text-right font-medium">
                        {isMarathi ? 'निवारण दिनांक:' : 'Resolved on:'}{' '}
                        {new Date(
                          ticket.super_admin_resolved_at || ticket.resolved_at
                        ).toLocaleString('en-IN')}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-gray-500 flex items-center space-x-1.5 pt-1">
                    <Clock className="h-3.5 w-3.5 text-amber-500" />
                    <span>
                      {ticket.is_against_mandi || ticket.target_authority === 'super_admin'
                        ? isMarathi
                          ? 'तक्रार थेट जिल्हा नियंत्रण अधिकाऱ्यांच्या (Super Admin) तपासणी खाली आहे.'
                          : 'Under executive review by the District Super Admin Office.'
                        : isMarathi
                        ? 'तक्रार चौकशीसाठी वर्ग केली आहे. लवकरच निवारण शेरा उपलब्ध होईल.'
                        : 'Ticket under review by the Mandi procurement officer. Remarks will update here.'}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Raise Grievance Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border-2 border-gray-100 max-h-[90vh] overflow-y-auto space-y-5 animate-in fade-in zoom-in duration-200">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2.5 bg-primary-100 text-primary-800 rounded-2xl">
                    <HelpCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900">
                      {isMarathi ? 'नवीन तक्रार दाखल करा' : 'File a New Grievance'}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {isMarathi
                        ? 'शासकीय हमीभाव खरेदी निवारण प्रणाली'
                        : 'Official Mandi Grievance Redressal System'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateGrievance} className="space-y-4">
                {/* Direct to Super Admin Highlight Toggle Card */}
                <div
                  onClick={() =>
                    setFormData({
                      ...formData,
                      is_against_mandi: !formData.is_against_mandi,
                      target_authority: !formData.is_against_mandi ? 'super_admin' : 'mandi_admin',
                    })
                  }
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    formData.is_against_mandi
                      ? 'bg-purple-50 border-purple-400 shadow-md'
                      : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={formData.is_against_mandi}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          is_against_mandi: e.target.checked,
                          target_authority: e.target.checked ? 'super_admin' : 'mandi_admin',
                        })
                      }
                      className="mt-1 h-4 w-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                    />
                    <div>
                      <h4 className="text-sm font-black text-gray-900 flex items-center gap-1.5">
                        <Landmark className="w-4 h-4 text-purple-700" />
                        {isMarathi
                          ? 'थेट जिल्हा नियंत्रण अधिकाऱ्यांना (Super Admin) तक्रार पाठवा'
                          : 'Report Directly to District Super Admin (Higher Authority)'}
                      </h4>
                      <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                        {isMarathi
                          ? 'जर तक्रार मंडी अधिकारी गैरवर्तन, वजनकाटा फेरफार किंवा मंडी प्रशासनाविरुद्ध असेल तर हा पर्याय निवडा.'
                          : 'Check this box if your complaint is against the Mandi officials, weighbridge tampering, corruption, or bias.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Category Selection */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    {isMarathi ? 'तक्रार प्रकार निवडा (Category)' : 'Grievance Category'} *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map((cat) => (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => setFormData({ ...formData, category: cat.id })}
                        className={`p-3 rounded-2xl border-2 text-left text-xs font-bold transition flex items-center space-x-2 ${
                          formData.category === cat.id
                            ? 'bg-primary-50 border-primary-600 text-primary-900 shadow-sm'
                            : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <span className="text-lg">{cat.icon}</span>
                        <span className="truncate">
                          {isMarathi ? cat.nameMr : cat.nameEn}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Linked Token */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {isMarathi ? 'संबंधित खरेदी टोकन (ऐच्छिक)' : 'Linked Booking Token (Optional)'}
                  </label>
                  <select
                    value={formData.booking_id}
                    onChange={(e) => setFormData({ ...formData, booking_id: e.target.value })}
                    className="w-full border-2 border-gray-300 rounded-xl p-2.5 text-sm font-semibold focus:border-primary-600 focus:outline-none"
                  >
                    <option value="">
                      {isMarathi ? '-- टोकन निवडा (लागू असल्यास) --' : '-- Select Token (if applicable) --'}
                    </option>
                    {bookings.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.token_number} - {b.commodity} ({b.status})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {isMarathi ? 'तक्रारीचा विषय (Subject)' : 'Subject'} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={
                      isMarathi
                        ? 'उदा. वजन मोजणीत २०० किलोची तफावत आढळली'
                        : 'e.g. Weighbridge showing 200kg discrepancy'
                    }
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full border-2 border-gray-300 rounded-xl p-2.5 text-sm font-semibold focus:border-primary-600 focus:outline-none"
                  />
                </div>

                {/* Detailed Description */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {isMarathi ? 'तपशीलवार वर्णन (Detailed Description)' : 'Detailed Description'} *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder={
                      isMarathi
                        ? 'घटनेची तारीख, वेळ, वजन किंवा संबंधित अधिकारी यांची सविस्तर माहिती लिहा...'
                        : 'Describe what happened, date, vehicle number, scale discrepancy or payment delay details...'
                    }
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full border-2 border-gray-300 rounded-xl p-2.5 text-sm font-semibold focus:border-primary-600 focus:outline-none"
                  ></textarea>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-3 border-2 border-gray-300 rounded-xl font-bold text-gray-700 hover:bg-gray-100 transition text-sm"
                  >
                    {isMarathi ? 'रद्द करा' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-3 bg-gradient-to-r from-primary-600 to-emerald-600 hover:from-primary-700 hover:to-emerald-700 text-white font-bold rounded-xl shadow-md transition text-sm disabled:opacity-50"
                  >
                    {submitting
                      ? isMarathi
                        ? 'नोंदवत आहे...'
                        : 'Submitting...'
                      : isMarathi
                      ? 'तक्रार दाखल करा'
                      : 'Submit Grievance'}
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
