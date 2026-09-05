import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { getProfile, updateProfile } from '../services/api';
import toast from 'react-hot-toast';
import {
  User,
  Phone,
  MapPin,
  CreditCard,
  Building2,
  ShieldCheck,
  Edit3,
  Save,
  X,
  FileText,
  Volume2,
  CheckCircle2,
  Sparkles,
  Landmark,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { isMarathi } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingBank, setIsEditingBank] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form states
  const [profileForm, setProfileForm] = useState({
    name: '',
    village: '',
    district: '',
    state: 'Maharashtra',
    aadhaar_last4: '',
  });

  const [bankForm, setBankForm] = useState({
    bank_name: '',
    bank_account_number: '',
    bank_ifsc: '',
    bank_branch: '',
  });

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const { data } = await getProfile();
      if (data?.user) {
        populateForms(data.user);
        updateUser(data.user);
      }
    } catch (err) {
      toast.error('Failed to load profile details');
    } finally {
      setLoading(false);
    }
  };

  const populateForms = (u) => {
    setProfileForm({
      name: u.name || '',
      village: u.village || '',
      district: u.district || '',
      state: u.state || 'Maharashtra',
      aadhaar_last4: u.aadhaar_last4 || '',
    });

    setBankForm({
      bank_name: u.bank_name || '',
      bank_account_number: u.bank_account_number || '',
      bank_ifsc: u.bank_ifsc || '',
      bank_branch: u.bank_branch || '',
    });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!profileForm.name.trim()) {
      toast.error('Name is required');
      return;
    }

    try {
      setSaving(true);
      const { data } = await updateProfile(profileForm);
      updateUser(data.user);
      populateForms(data.user);
      setIsEditingProfile(false);
      toast.success(
        isMarathi ? 'माहिती यशस्वीरीत्या अद्ययावत केली!' : 'Profile details updated successfully!'
      );
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveBank = async (e) => {
    e.preventDefault();
    if (bankForm.bank_ifsc && bankForm.bank_ifsc.length !== 11) {
      toast.error('IFSC code must be 11 characters (e.g. SBIN0001234)');
      return;
    }

    try {
      setSaving(true);
      const { data } = await updateProfile(bankForm);
      updateUser(data.user);
      populateForms(data.user);
      setIsEditingBank(false);
      toast.success(
        isMarathi ? 'बँक माहिती यशस्वीरीत्या जतन केली!' : 'Bank details updated successfully!'
      );
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update bank details');
    } finally {
      setSaving(false);
    }
  };

  const speakProfile = () => {
    if (!('speechSynthesis' in window)) {
      toast.error('Audio readout not supported on this browser');
      return;
    }
    const text = isMarathi
      ? `शेतकरी नाव: ${user?.name || 'नोंद नाही'}. मोबाईल: ${user?.phone}. गाव: ${
          user?.village || 'नोंद नाही'
        }. बँक खाते: ${user?.bank_name || 'डीबीटी बँक संलग्न'}.`
      : `Farmer name: ${user?.name}. Phone: ${user?.phone}. Village: ${user?.village || 'N/A'}, District: ${
          user?.district || 'N/A'
        }. DBT Bank: ${user?.bank_name || 'Configured'}.`;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = isMarathi ? 'mr-IN' : 'en-IN';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-emerald-50 flex items-center justify-center">
        <p className="text-gray-500 font-bold text-lg">Loading Profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Hero Card */}
        <div className="bg-gradient-to-r from-primary-700 via-emerald-700 to-green-800 text-white rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-10 translate-x-8 translate-y-8 pointer-events-none">
            <Landmark className="w-64 h-64 text-white" />
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 bg-yellow-400 text-primary-900 rounded-2xl flex items-center justify-center font-black text-3xl shadow-xl ring-4 ring-yellow-300/40">
                {user?.name?.charAt(0) || 'K'}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl sm:text-3xl font-black">{user?.name}</h1>
                  <span className="bg-yellow-400 text-primary-900 text-xs font-black px-2.5 py-0.5 rounded-full uppercase">
                    {user?.role === 'super_admin'
                      ? isMarathi
                        ? 'जिल्हा नियंत्रण अधिकारी'
                        : 'Super Admin'
                      : user?.role === 'admin'
                      ? isMarathi
                        ? 'मंडी प्रशासक'
                        : 'Mandi Admin'
                      : isMarathi
                      ? 'प्रमाणित शेतकरी'
                      : 'Verified Farmer'}
                  </span>
                </div>
                <p className="text-emerald-100 text-sm font-medium flex items-center gap-2">
                  <Phone className="w-4 h-4 text-yellow-300" />
                  +91 {user?.phone}
                  {user?.village && (
                    <>
                      <span>•</span>
                      <MapPin className="w-4 h-4 text-yellow-300" />
                      {user?.village}, {user?.district}
                    </>
                  )}
                </p>
              </div>
            </div>

            <button
              onClick={speakProfile}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl text-white font-bold text-sm shadow-md transition"
              title="Speak Profile (Audio Readout)"
            >
              <Volume2 className="w-4 h-4 text-yellow-300" />
              <span>{isMarathi ? 'माहिती ऐका (Audio)' : 'Listen Audio'}</span>
            </button>
          </div>
        </div>

        {/* Profile Content Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Card 1: Personal & Demographic Details */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xl border-2 border-gray-100 relative">
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-emerald-100 text-primary-700 rounded-xl">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-gray-900">
                    {isMarathi ? 'वैयक्तिक माहिती' : 'Personal Details'}
                  </h2>
                  <p className="text-xs text-gray-500">
                    {isMarathi ? 'शेतकरी ओळख व पत्ता' : 'Identity & Residential Details'}
                  </p>
                </div>
              </div>

              {!isEditingProfile ? (
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-primary-700 font-bold text-xs rounded-lg transition"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  {isMarathi ? 'बदला' : 'Edit'}
                </button>
              ) : (
                <button
                  onClick={() => {
                    populateForms(user);
                    setIsEditingProfile(false);
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-xs rounded-lg transition"
                >
                  <X className="w-3.5 h-3.5" />
                  {isMarathi ? 'रद्द करा' : 'Cancel'}
                </button>
              )}
            </div>

            {isEditingProfile ? (
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {isMarathi ? 'पूर्ण नाव' : 'Full Name'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full border-2 border-gray-300 rounded-xl p-2.5 text-sm font-semibold focus:border-primary-600 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      {isMarathi ? 'गाव' : 'Village'}
                    </label>
                    <input
                      type="text"
                      value={profileForm.village}
                      onChange={(e) => setProfileForm({ ...profileForm, village: e.target.value })}
                      placeholder="e.g. Hadapsar"
                      className="w-full border-2 border-gray-300 rounded-xl p-2.5 text-sm font-semibold focus:border-primary-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      {isMarathi ? 'जिल्हा' : 'District'}
                    </label>
                    <input
                      type="text"
                      value={profileForm.district}
                      onChange={(e) => setProfileForm({ ...profileForm, district: e.target.value })}
                      placeholder="e.g. Pune"
                      className="w-full border-2 border-gray-300 rounded-xl p-2.5 text-sm font-semibold focus:border-primary-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      {isMarathi ? 'राज्य' : 'State'}
                    </label>
                    <input
                      type="text"
                      value={profileForm.state}
                      onChange={(e) => setProfileForm({ ...profileForm, state: e.target.value })}
                      className="w-full border-2 border-gray-300 rounded-xl p-2.5 text-sm font-semibold focus:border-primary-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      {isMarathi ? 'आधार शेवटचे ४ अंक' : 'Aadhaar (Last 4)'}
                    </label>
                    <input
                      type="text"
                      maxLength={4}
                      value={profileForm.aadhaar_last4}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          aadhaar_last4: e.target.value.replace(/\D/g, ''),
                        })
                      }
                      placeholder="e.g. 4521"
                      className="w-full border-2 border-gray-300 rounded-xl p-2.5 text-sm font-semibold focus:border-primary-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-600 to-emerald-600 hover:from-primary-700 hover:to-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {saving
                      ? isMarathi
                        ? 'जतन करत आहे...'
                        : 'Saving...'
                      : isMarathi
                      ? 'बदल जतन करा'
                      : 'Save Profile Changes'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                  <div>
                    <span className="text-[11px] font-bold text-gray-500 block uppercase">
                      {isMarathi ? 'शेतकरी नाव' : 'Farmer Name'}
                    </span>
                    <span className="text-sm font-black text-gray-900 mt-0.5 block">
                      {user?.name || '—'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-gray-500 block uppercase">
                      {isMarathi ? 'मोबाईल नंबर' : 'Phone Number'}
                    </span>
                    <span className="text-sm font-black text-gray-900 mt-0.5 block">
                      +91 {user?.phone}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                  <div>
                    <span className="text-[11px] font-bold text-gray-500 block uppercase">
                      {isMarathi ? 'गाव' : 'Village'}
                    </span>
                    <span className="text-sm font-black text-gray-900 mt-0.5 block">
                      {user?.village || '—'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-gray-500 block uppercase">
                      {isMarathi ? 'जिल्हा व राज्य' : 'District & State'}
                    </span>
                    <span className="text-sm font-black text-gray-900 mt-0.5 block">
                      {user?.district || '—'}, {user?.state || 'Maharashtra'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-100">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <div>
                      <span className="text-xs font-bold text-emerald-900 block">
                        {isMarathi ? 'आधार सत्यापन' : 'Aadhaar Verification'}
                      </span>
                      <span className="text-xs text-emerald-700">
                        •••• •••• {user?.aadhaar_last4 || '4521'}
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] font-black bg-emerald-200 text-emerald-900 px-2.5 py-1 rounded-full uppercase">
                    ✓ Verified
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Card 2: Direct Benefit Transfer (DBT) Bank Account */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xl border-2 border-gray-100 relative">
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-gray-900">
                    {isMarathi ? 'थेट बँक खाते (DBT)' : 'DBT Bank Details'}
                  </h2>
                  <p className="text-xs text-gray-500">
                    {isMarathi
                      ? 'हमीभाव रक्कम थेट जमा करण्यासाठी बँक खाते'
                      : 'MSP Payouts Direct Benefit Transfer Account'}
                  </p>
                </div>
              </div>

              {!isEditingBank ? (
                <button
                  onClick={() => setIsEditingBank(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs rounded-lg transition"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  {isMarathi ? 'बदला' : 'Edit'}
                </button>
              ) : (
                <button
                  onClick={() => {
                    populateForms(user);
                    setIsEditingBank(false);
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-xs rounded-lg transition"
                >
                  <X className="w-3.5 h-3.5" />
                  {isMarathi ? 'रद्द करा' : 'Cancel'}
                </button>
              )}
            </div>

            {isEditingBank ? (
              <form onSubmit={handleSaveBank} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {isMarathi ? 'बँकेचे नाव' : 'Bank Name'}
                  </label>
                  <input
                    type="text"
                    value={bankForm.bank_name}
                    onChange={(e) => setBankForm({ ...bankForm, bank_name: e.target.value })}
                    placeholder="e.g. State Bank of India"
                    className="w-full border-2 border-gray-300 rounded-xl p-2.5 text-sm font-semibold focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {isMarathi ? 'बँक खाते क्रमांक' : 'Bank Account Number'}
                  </label>
                  <input
                    type="text"
                    value={bankForm.bank_account_number}
                    onChange={(e) =>
                      setBankForm({ ...bankForm, bank_account_number: e.target.value })
                    }
                    placeholder="e.g. 30495812903"
                    className="w-full border-2 border-gray-300 rounded-xl p-2.5 text-sm font-semibold focus:border-amber-500 focus:outline-none font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      {isMarathi ? 'IFSC कोड' : 'IFSC Code'}
                    </label>
                    <input
                      type="text"
                      maxLength={11}
                      value={bankForm.bank_ifsc}
                      onChange={(e) =>
                        setBankForm({
                          ...bankForm,
                          bank_ifsc: e.target.value.toUpperCase(),
                        })
                      }
                      placeholder="e.g. SBIN0001245"
                      className="w-full border-2 border-gray-300 rounded-xl p-2.5 text-sm font-semibold focus:border-amber-500 focus:outline-none uppercase font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      {isMarathi ? 'शाखा' : 'Branch'}
                    </label>
                    <input
                      type="text"
                      value={bankForm.bank_branch}
                      onChange={(e) => setBankForm({ ...bankForm, bank_branch: e.target.value })}
                      placeholder="e.g. Hadapsar Branch"
                      className="w-full border-2 border-gray-300 rounded-xl p-2.5 text-sm font-semibold focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-sm rounded-xl shadow-md transition disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {saving
                      ? isMarathi
                        ? 'जतन करत आहे...'
                        : 'Saving...'
                      : isMarathi
                      ? 'बँक माहिती जतन करा'
                      : 'Save Bank Details'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-2xl border-2 border-amber-200 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-800">
                        {isMarathi ? 'संलग्न बँक' : 'Primary Bank'}
                      </span>
                      <h4 className="text-base font-black text-gray-900 mt-0.5">
                        {user?.bank_name || 'State Bank of India'}
                      </h4>
                    </div>
                    <Building2 className="w-6 h-6 text-amber-700" />
                  </div>

                  <div className="pt-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 block">
                      {isMarathi ? 'खाते क्रमांक' : 'Account Number'}
                    </span>
                    <span className="font-mono text-base font-bold text-gray-800 tracking-wider">
                      {user?.bank_account_number
                        ? `•••• •••• ${user.bank_account_number.slice(-4)}`
                        : '•••• •••• 2903'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                    <div>
                      <span className="text-gray-500 block text-[10px] uppercase font-bold">
                        IFSC Code
                      </span>
                      <span className="font-mono font-black text-gray-900">
                        {user?.bank_ifsc || 'SBIN0001245'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-[10px] uppercase font-bold">
                        {isMarathi ? 'शाखा' : 'Branch'}
                      </span>
                      <span className="font-extrabold text-gray-900 truncate block">
                        {user?.bank_branch || 'District Branch'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 bg-green-50 rounded-xl border border-green-200 text-xs font-semibold text-green-800">
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>
                    {isMarathi
                      ? 'डीबीटी (DBT) सक्रिय: हमीभाव देयक २४-४८ तासांत याच खात्यात वर्ग केले जाईल.'
                      : 'DBT Enabled: MSP payments are directly transferred to this account.'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Card: 7/12 Land Records Quick Access */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-emerald-100 text-emerald-800 rounded-2xl">
              <FileText className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900">
                {isMarathi ? 'डिजिटल ७/१२ जमीन उतारे व कोटा' : 'Digital 7/12 Land Records & Quota'}
              </h3>
              <p className="text-sm text-gray-600 mt-0.5">
                {isMarathi
                  ? 'आपले ७/१२ जमिनीचे क्षेत्र बदला, नवीन गट नोंदवा किंवा पीकनिहाय हमीभाव कोटा तपासा.'
                  : 'Manage survey parcels, update sown crops, or verify eligible seasonal procurement quota.'}
              </p>
            </div>
          </div>

          <Link
            to="/land-records"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-emerald-600 text-white font-bold rounded-xl hover:from-primary-700 hover:to-emerald-700 transition shadow-lg text-sm"
          >
            <span>{isMarathi ? '७/१२ व्यवस्थापित करा' : 'Manage 7/12 Records'}</span>
            <span>→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
