import { useState, useEffect } from 'react';
import {
  getCentres,
  getCentreSlots,
  createBooking,
  getQuotaForCommodity,
  getMyBookings,
} from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import toast from 'react-hot-toast';
import {
  Calendar,
  MapPin,
  Clock,
  Wheat,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  FileCheck,
  BookmarkCheck,
  ExternalLink,
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

export default function BookSlotPage() {
  const [centres, setCentres] = useState([]);
  const [selectedCentre, setSelectedCentre] = useState(null);
  const [slots, setSlots] = useState([]);
  const [myBookingsList, setMyBookingsList] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [formData, setFormData] = useState({
    commodity: 'Wheat',
    estimated_quantity_kg: '',
  });
  const [quotaData, setQuotaData] = useState(null);
  const [loadingQuota, setLoadingQuota] = useState(false);
  const [loading, setLoading] = useState(false);
  const { t, isMarathi } = useLanguage();
  const navigate = useNavigate();

  const commodityOptions = [
    { value: 'Wheat', label: isMarathi ? '🌾 गहू (Wheat)' : '🌾 Wheat', icon: '🌾' },
    { value: 'Rice (Paddy)', label: isMarathi ? '🍚 भात / धान (Rice/Paddy)' : '🍚 Rice (Paddy)', icon: '🍚' },
    { value: 'Mustard', label: isMarathi ? '🟡 मोहरी (Mustard)' : '🟡 Mustard', icon: '🟡' },
    { value: 'Maize', label: isMarathi ? '🌽 मका (Maize)' : '🌽 Maize', icon: '🌽' },
    { value: 'Gram (Chana)', label: isMarathi ? '🫘 हरभरा / चणा (Gram/Chana)' : '🫘 Gram (Chana)', icon: '🫘' },
  ];

  useEffect(() => {
    fetchCentres();
    fetchMyExistingBookings();
  }, []);

  useEffect(() => {
    if (formData.commodity) {
      fetchQuota(formData.commodity);
    }
  }, [formData.commodity]);

  const fetchMyExistingBookings = async () => {
    try {
      const { data } = await getMyBookings();
      setMyBookingsList(data.bookings || []);
    } catch (err) {
      console.error('Failed to load my bookings:', err);
    }
  };

  const fetchQuota = async (commodity) => {
    setLoadingQuota(true);
    try {
      const { data } = await getQuotaForCommodity(commodity);
      setQuotaData(data);
    } catch (err) {
      console.error('Failed to load quota:', err);
    } finally {
      setLoadingQuota(false);
    }
  };

  const fetchCentres = async () => {
    try {
      const { data } = await getCentres();
      setCentres(data.centres);
    } catch (err) {
      toast.error('Failed to load centres');
    }
  };

  const handleCentreSelect = async (centre) => {
    setSelectedCentre(centre);
    setSelectedSlot(null);
    try {
      const { data } = await getCentreSlots(centre.id);
      setSlots(data.slots);
      await fetchMyExistingBookings();
    } catch (err) {
      toast.error('Failed to load slots');
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!selectedSlot) {
      toast.error(t('bookSlot.selectSlot'));
      return;
    }

    // Check if farmer already booked this slot
    const alreadyBooked = myBookingsList.find(
      (b) => b.slot_id === selectedSlot.id && b.status !== 'cancelled'
    );
    if (alreadyBooked) {
      toast.error(
        isMarathi
          ? `आपण हा स्लॉट आधीच बुक केला आहे (टोकन: ${alreadyBooked.token_number}). कृपया दुसरा स्लॉट निवडा.`
          : `You have already booked this slot (Token: ${alreadyBooked.token_number}). Please pick another available slot.`
      );
      return;
    }

    setLoading(true);
    try {
      const { data } = await createBooking({
        slot_id: selectedSlot.id,
        ...formData,
      });
      toast.success(`${t('bookSlot.bookingSuccess')} ${data.booking.token_number} 🎉`);
      navigate('/my-bookings');
    } catch (err) {
      toast.error(err.response?.data?.error || t('bookSlot.bookingFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-gray-900 mb-2">
            {t('bookSlot.title')} 🌾
          </h1>
          <p className="text-lg text-gray-600">
            {isMarathi
              ? 'आपल्या सोयीनुसार खरेदी केंद्र आणि वेळ निवडा'
              : 'Select your preferred procurement centre and time slot'}
          </p>
        </div>

        {/* Step 1: Select Centre */}
        <div className="bg-white shadow-xl rounded-2xl p-6 sm:p-8 mb-8 border-2 border-gray-100">
          <div className="flex items-center mb-6">
            <div className="bg-primary-600 text-white w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg mr-4 shadow-md">
              1
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{t('bookSlot.step1')}</h2>
              <p className="text-sm text-gray-500">
                {isMarathi ? 'आपल्या जवळचे शासकीय खरेदी केंद्र निवडा' : 'Choose your nearest mandi centre'}
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {centres.map((centre) => (
              <button
                key={centre.id}
                onClick={() => handleCentreSelect(centre)}
                className={`text-left p-5 border-2 rounded-xl transition-all duration-200 ${
                  selectedCentre?.id === centre.id
                    ? 'border-primary-600 bg-primary-50/80 shadow-md ring-2 ring-primary-500/20'
                    : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <h3 className="font-bold text-lg text-gray-900 flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-primary-600 flex-shrink-0" />
                    {centre.name}
                  </h3>
                  {selectedCentre?.id === centre.id && (
                    <CheckCircle2 className="h-6 w-6 text-primary-600 flex-shrink-0" />
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-2 ml-7">{centre.location}</p>
                <div className="mt-3 ml-7 flex items-center text-xs font-semibold text-primary-800 bg-primary-100/60 px-3 py-1 rounded-full w-fit">
                  <Clock className="h-3.5 w-3.5 mr-1" />
                  {centre.operating_hours}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Select Slot */}
        {selectedCentre && (
          <div className="bg-white shadow-xl rounded-2xl p-6 sm:p-8 mb-8 border-2 border-gray-100 animate-fadeIn">
            <div className="flex items-center mb-6">
              <div className="bg-primary-600 text-white w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg mr-4 shadow-md">
                2
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{t('bookSlot.step2')}</h2>
                <p className="text-sm text-gray-500">
                  {isMarathi ? 'उपलब्ध तारीख आणि वेळ निवडा' : 'Pick an available date and timing'}
                </p>
              </div>
            </div>

            {slots.length === 0 ? (
              <p className="text-gray-500 py-6 text-center">{t('bookSlot.noSlots')}</p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {slots.map((slot) => {
                  const isFull = slot.status === 'full';
                  const isClosed = slot.status === 'closed';
                  const isSelected = selectedSlot?.id === slot.id;

                  // Check if farmer already booked this exact slot
                  const existingForSlot = myBookingsList.find(
                    (b) => b.slot_id === slot.id && b.status !== 'cancelled'
                  );

                  return (
                    <div
                      key={slot.id}
                      className={`p-5 border-2 rounded-2xl transition-all duration-200 flex flex-col justify-between space-y-3 ${
                        existingForSlot
                          ? 'border-indigo-300 bg-indigo-50/50 shadow-sm'
                          : isSelected
                          ? 'border-primary-600 bg-primary-50/80 shadow-md ring-2 ring-primary-500/20'
                          : isFull || isClosed
                          ? 'border-gray-200 bg-gray-100 opacity-60'
                          : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50 cursor-pointer'
                      }`}
                      onClick={() => {
                        if (!isFull && !isClosed && !existingForSlot) {
                          setSelectedSlot(slot);
                        }
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-5 w-5 text-primary-600" />
                            <span className="font-bold text-gray-900">{slot.date}</span>
                          </div>
                          <p className="text-sm font-semibold text-gray-700 mt-1">
                            ⏰ {slot.start_time} - {slot.end_time}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            👥 {slot.booked_count} / {slot.max_farmers} {t('bookSlot.farmersBooked')}
                          </p>
                        </div>

                        <div>
                          {existingForSlot ? (
                            <span className="px-3 py-1 bg-indigo-600 text-white text-[11px] font-black rounded-full flex items-center gap-1 shadow-sm">
                              <BookmarkCheck className="w-3.5 h-3.5 text-yellow-300" />
                              {isMarathi ? 'आपण बुक केले' : 'Already Booked'}
                            </span>
                          ) : isFull ? (
                            <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-black rounded-full uppercase">
                              {t('bookSlot.full')}
                            </span>
                          ) : isClosed ? (
                            <span className="px-3 py-1 bg-gray-200 text-gray-700 text-xs font-black rounded-full uppercase">
                              {t('bookSlot.closed')}
                            </span>
                          ) : (
                            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-black rounded-full uppercase">
                              {t('bookSlot.available')}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* If already booked, show token and shortcut link */}
                      {existingForSlot && (
                        <div className="pt-2 border-t border-indigo-200 flex items-center justify-between text-xs text-indigo-950 font-bold">
                          <span>
                            {isMarathi ? 'टोकन क्रमांक:' : 'Token:'}{' '}
                            <strong className="font-mono text-indigo-800">
                              {existingForSlot.token_number}
                            </strong>
                          </span>
                          <Link
                            to="/my-bookings"
                            className="text-indigo-700 hover:text-indigo-900 underline flex items-center gap-0.5"
                          >
                            {isMarathi ? 'बुकिंग पहा' : 'View Booking'}
                            <ExternalLink className="w-3 h-3 ml-0.5" />
                          </Link>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Crop Details */}
        {selectedSlot && (
          <div className="bg-white shadow-xl rounded-2xl p-6 sm:p-8 mb-8 border-2 border-gray-100 animate-fadeIn">
            <div className="flex items-center mb-6">
              <div className="bg-primary-600 text-white w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg mr-4 shadow-md">
                3
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{t('bookSlot.step3')}</h2>
                <p className="text-sm text-gray-500">
                  {isMarathi
                    ? 'आपल्या पिकाचा आणि वजनाचा तपशील प्रविष्ट करा'
                    : 'Enter your crop and quantity estimate'}
                </p>
              </div>
            </div>

            <form onSubmit={handleBooking} className="space-y-6">
              <div>
                <label className="block text-base font-bold text-gray-800 mb-2">
                  {t('bookSlot.commodity')}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {commodityOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, commodity: opt.value })}
                      className={`p-3.5 rounded-xl border-2 font-bold text-sm text-left transition flex items-center space-x-2 ${
                        formData.commodity === opt.value
                          ? 'border-primary-600 bg-primary-50 text-primary-900 ring-2 ring-primary-500/20'
                          : 'border-gray-200 hover:border-primary-200 text-gray-700'
                      }`}
                    >
                      <span className="text-xl">{opt.icon}</span>
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 7/12 Quota Banner */}
              {quotaData && (
                <div className="bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 border-2 border-emerald-300 p-4 sm:p-5 rounded-2xl">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="flex items-center space-x-2">
                      <ShieldCheck className="h-5 w-5 text-emerald-700" />
                      <span className="font-extrabold text-sm text-emerald-950">
                        {isMarathi ? 'प्रमाणित ७/१२ दाखला व कोटा' : 'Digital 7/12 Verified Quota'}
                      </span>
                    </div>
                    <span className="text-xs font-black bg-emerald-200 text-emerald-900 px-2.5 py-0.5 rounded-full">
                      ✓ {quotaData.verified_by || 'MahaBhumi Verified'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5 text-center my-3">
                    <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-200">
                      <div className="text-xs text-gray-500 font-semibold">
                        {isMarathi ? 'एकूण कोटा' : 'Total Quota'}
                      </div>
                      <div className="text-base sm:text-lg font-black text-gray-900 mt-0.5">
                        {quotaData.total_quota_kg?.toLocaleString()} kg
                      </div>
                      <div className="text-[10px] text-gray-500">
                        ({quotaData.cultivated_acres} {isMarathi ? 'एकर' : 'Acres'})
                      </div>
                    </div>
                    <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-200">
                      <div className="text-xs text-gray-500 font-semibold">
                        {isMarathi ? 'वापरलेला' : 'Used'}
                      </div>
                      <div className="text-base sm:text-lg font-black text-amber-700 mt-0.5">
                        {quotaData.used_quota_kg?.toLocaleString()} kg
                      </div>
                      <div className="text-[10px] text-gray-500">
                        (
                        {Math.round(
                          (quotaData.used_quota_kg / (quotaData.total_quota_kg || 1)) * 100
                        )}
                        %)
                      </div>
                    </div>
                    <div className="bg-emerald-600 text-white p-2.5 rounded-xl shadow-sm">
                      <div className="text-xs font-semibold text-emerald-100">
                        {isMarathi ? 'शिल्लक कोटा' : 'Available'}
                      </div>
                      <div className="text-base sm:text-lg font-black text-yellow-300 mt-0.5">
                        {quotaData.remaining_quota_kg?.toLocaleString()} kg
                      </div>
                      <div className="text-[10px] text-emerald-100">
                        {isMarathi ? 'कमाल मर्यादा' : 'Max Cap'}
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-emerald-800 font-semibold flex items-center justify-between pt-1">
                    <span>
                      📍 {isMarathi ? 'गट क्रमांक' : 'Gat / Survey No'}:{' '}
                      <strong>{quotaData.survey_number}</strong>
                    </span>
                    <span>
                      {isMarathi ? 'हंगाम' : 'Season'}: <strong>Rabi 2024-25</strong>
                    </span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-base font-bold text-gray-800 mb-2">
                  {t('bookSlot.estimatedQuantity')}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    min="1"
                    max={quotaData?.remaining_quota_kg || 10000}
                    value={formData.estimated_quantity_kg}
                    onChange={(e) =>
                      setFormData({ ...formData, estimated_quantity_kg: e.target.value })
                    }
                    placeholder={
                      quotaData
                        ? isMarathi
                          ? `कमाल मर्यादा: ${quotaData.remaining_quota_kg} kg`
                          : `Max limit: ${quotaData.remaining_quota_kg} kg`
                        : t('bookSlot.quantityPlaceholder')
                    }
                    className={`block w-full border-2 rounded-xl shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base p-3.5 transition ${
                      quotaData &&
                      parseFloat(formData.estimated_quantity_kg) > quotaData.remaining_quota_kg
                        ? 'border-red-500 bg-red-50 text-red-900'
                        : 'border-gray-300'
                    }`}
                  />
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-500 font-bold">
                    {t('common.kg')}
                  </div>
                </div>
                {quotaData &&
                  parseFloat(formData.estimated_quantity_kg) > quotaData.remaining_quota_kg && (
                    <p className="text-xs font-bold text-red-600 mt-1.5 flex items-center">
                      <AlertCircle className="h-3.5 w-3.5 mr-1" />
                      {isMarathi
                        ? `आपण ७/१२ शिल्लक कोट्यापेक्षा (${quotaData.remaining_quota_kg} kg) जास्त वजन टाकू शकत नाही.`
                        : `Cannot exceed your remaining 7/12 quota of ${quotaData.remaining_quota_kg} kg.`}
                    </p>
                  )}
              </div>

              <div className="bg-emerald-50 border-2 border-emerald-200 p-4 rounded-xl flex items-start space-x-3">
                <span className="text-2xl">📱</span>
                <div>
                  <h4 className="font-bold text-emerald-900 text-sm">
                    {isMarathi ? 'मोफत SMS सूचना' : 'Free Real-Time SMS Alert'}
                  </h4>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    {isMarathi
                      ? 'बुकिंग निश्चित झाल्यावर आपल्याला टोकन क्रमांक आणि केंद्राचा पत्ता SMS द्वारे मिळेल.'
                      : 'You will receive instant SMS confirmation with your token number and centre details.'}
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-xl shadow-xl text-lg font-extrabold text-white bg-gradient-to-r from-primary-600 to-emerald-600 hover:from-primary-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-all duration-200 hover:scale-[1.01]"
              >
                {loading ? t('bookSlot.booking') : t('bookSlot.confirmBooking')}
                {!loading && <ArrowRight className="ml-2 h-6 w-6" />}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
