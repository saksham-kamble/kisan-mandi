import { useState, useEffect } from 'react';
import { getMyBookings, cancelBooking, getJFormUrl } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import toast from 'react-hot-toast';
import { Calendar, Clock, MapPin, Wheat, CheckCircle2, AlertCircle, XCircle, Plus, Sparkles, QrCode, FileText, Zap, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t, isMarathi } = useLanguage();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const { data } = await getMyBookings();
      setBookings(data.bookings);
    } catch (err) {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!confirm(isMarathi ? 'तुम्हाला नक्की हे बुकिंग रद्द करायचे आहे का?' : 'Are you sure you want to cancel this booking?')) return;
    try {
      await cancelBooking(id);
      toast.success(isMarathi ? 'बुकिंग यशस्वीरीत्या रद्द केले' : 'Booking cancelled successfully');
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to cancel');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'booked':
        return (
          <span className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-black bg-blue-100 text-blue-800 border border-blue-200 uppercase tracking-wider">
            {t('myBookings.statuses.booked')}
          </span>
        );
      case 'checked_in':
        return (
          <span className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300 uppercase tracking-wider">
            ● {t('myBookings.statuses.checked_in')}
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-black bg-purple-100 text-purple-800 border border-purple-200 uppercase tracking-wider animate-pulse">
            ⏳ {t('myBookings.statuses.in_progress')}
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300 uppercase tracking-wider">
            ✓ {t('myBookings.statuses.completed')}
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-black bg-red-100 text-red-800 border border-red-200 uppercase tracking-wider">
            ✕ {t('myBookings.statuses.cancelled')}
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500 font-bold">{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900">
              {t('myBookings.title')} 🎟️
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              {isMarathi ? 'आपले डिजिटल टोकन आणि मंडी स्लॉट तपशील' : 'Your digital tokens and mandi slot reservations'}
            </p>
          </div>

          <Link
            to="/book-slot"
            className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-primary-600 to-emerald-600 text-white font-bold rounded-xl hover:from-primary-700 hover:to-emerald-700 transition shadow-lg hover:shadow-primary-600/30 hover:scale-105"
          >
            <Plus className="h-5 w-5 mr-1.5" />
            {t('myBookings.bookNow')}
          </Link>
        </div>

        {bookings.length === 0 ? (
          <div className="bg-white shadow-xl rounded-3xl p-12 text-center border-2 border-gray-100">
            <div className="w-20 h-20 bg-emerald-100 text-primary-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-10 w-10" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {t('myBookings.noBookings')}
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              {isMarathi
                ? 'आपण अद्याप कोणताही खरेदी स्लॉट बुक केलेला नाही. नवीन स्लॉट बुक करण्यासाठी खाली क्लिक करा.'
                : 'You have not booked any mandi procurement slots yet. Reserve one now.'}
            </p>
            <Link
              to="/book-slot"
              className="inline-flex items-center px-8 py-3.5 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition shadow-lg"
            >
              {t('myBookings.bookNow')} →
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((b) => (
              <div
                key={b.id}
                className="bg-white shadow-xl rounded-2xl overflow-hidden border-2 border-gray-100 hover:border-primary-300 transition-all duration-200"
              >
                {/* Top Banner / Token Ribbon */}
                <div className={`px-6 py-4 flex flex-wrap justify-between items-center gap-3 ${
                  b.priority_level === 'express_grade_a'
                    ? 'bg-gradient-to-r from-yellow-600 via-amber-700 to-emerald-800 text-white'
                    : 'bg-gradient-to-r from-primary-700 via-emerald-700 to-primary-800 text-white'
                }`}>
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-black uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-md">
                      {t('myBookings.token')}
                    </span>
                    <span className="text-2xl sm:text-3xl font-black tracking-wider text-yellow-300">
                      {b.token_number}
                    </span>
                    {b.priority_level === 'express_grade_a' && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-yellow-400 text-slate-950 uppercase tracking-wide shadow-md">
                        <Zap className="w-3.5 h-3.5 fill-current" />
                        {isMarathi ? 'ग्रेड-अ फास्ट-ट्रॅक' : 'Grade-A Fast-Track'}
                      </span>
                    )}
                  </div>
                  <div>{getStatusBadge(b.status)}</div>
                </div>

                {/* Card Body */}
                <div className="p-6">
                  <div className="grid md:grid-cols-3 gap-6">
                    {/* Centre info */}
                    <div className="md:col-span-2 space-y-3">
                      <div>
                        <h3 className="text-xl font-black text-gray-900">{b.centre_name}</h3>
                        <p className="text-sm text-gray-600 flex items-center mt-1">
                          <MapPin className="h-4 w-4 mr-1 text-primary-600 flex-shrink-0" />
                          {b.centre_location}
                        </p>
                      </div>

                      <div className="grid grid-cols-3 gap-3 pt-2">
                        <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                          <span className="text-xs font-bold text-emerald-800">{t('myBookings.commodity')}</span>
                          <p className="text-base font-extrabold text-gray-900 mt-0.5">{b.commodity}</p>
                        </div>
                        <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                          <span className="text-xs font-bold text-emerald-800">{t('myBookings.quantity')}</span>
                          <p className="text-base font-extrabold text-gray-900 mt-0.5">{b.estimated_quantity_kg} kg</p>
                        </div>
                        <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                          <span className="text-xs font-bold text-emerald-800">{isMarathi ? 'रांग क्रमांक' : 'Queue Pos'}</span>
                          <p className="text-base font-extrabold text-primary-700 mt-0.5">#{b.queue_position}</p>
                        </div>
                      </div>

                      {/* AI Quality / Assessment Certificate Box if available */}
                      {b.quality_grade && (
                        <div className="mt-3 p-3.5 rounded-xl bg-gradient-to-r from-amber-50/80 via-emerald-50/60 to-slate-50 border border-amber-200/80 flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-yellow-500 text-white flex items-center justify-center font-bold shadow-sm">
                              <Award className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-xs font-extrabold text-gray-800 flex items-center gap-1">
                                {isMarathi ? 'स्मार्ट AI गुणवत्ता तपासणी' : 'Smart AI Quality Pre-Check'}
                                <span className="text-emerald-600">✓</span>
                              </p>
                              <p className="text-[11px] text-gray-600">
                                {isMarathi ? 'प्रमाणपत्र श्रेणी:' : 'Certified Grade:'} <strong className="text-amber-800">{b.quality_grade}</strong> • {isMarathi ? 'गुणवत्ता स्कोअर:' : 'Score:'} <strong className="text-emerald-800">{b.quality_score}/100</strong>
                              </p>
                            </div>
                          </div>
                          {b.priority_level === 'express_grade_a' ? (
                            <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                              ⚡ {isMarathi ? 'एक्सप्रेस प्राधान्य मंजूर' : 'Express Triage Active'}
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-gray-100 text-gray-700">
                              {isMarathi ? 'सामान्य तपासणी' : 'Standard Verification'}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Date / Time Card */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex flex-col justify-between">
                      <div>
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                          {t('myBookings.date')} & {t('myBookings.time')}
                        </span>
                        <p className="text-lg font-black text-gray-900 mt-1 flex items-center">
                          <Calendar className="h-4 w-4 mr-1.5 text-primary-600" />
                          {b.date}
                        </p>
                        <p className="text-sm font-semibold text-gray-700 mt-1 flex items-center">
                          <Clock className="h-4 w-4 mr-1.5 text-primary-600" />
                          {b.start_time} - {b.end_time}
                        </p>
                      </div>

                      {b.status === 'booked' && (
                        <div className="mt-4 pt-3 border-t border-gray-200">
                          <button
                            onClick={() => handleCancel(b.id)}
                            className="w-full text-center py-2 px-3 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-lg text-xs transition border border-red-200"
                          >
                            ✕ {t('myBookings.cancel')}
                          </button>
                        </div>
                      )}

                      {b.status === 'completed' && (
                        <div className="mt-4 pt-3 border-t border-gray-200">
                          <a
                            href={getJFormUrl(b.id)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full text-center py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition flex items-center justify-center"
                          >
                            <FileText className="h-3.5 w-3.5 mr-1" />
                            {isMarathi ? 'जे-फॉर्म डाउनलोड करा' : 'Download J-Form'}
                          </a>
                        </div>
                      )}
                    </div>
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
