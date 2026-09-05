import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { requestOTP, verifyOTP, register } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import toast from 'react-hot-toast';
import { Wheat, Phone, Lock, User, MapPin, ShieldCheck, ArrowRight, CheckCircle2, Loader, Building2, CreditCard } from 'lucide-react';

export default function RegisterPage() {
  const [step, setStep] = useState(1); // 1: Enter Phone, 2: Verify OTP, 3: Complete Registration
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    aadhaar_last4: '',
    village: '',
    district: '',
    state: 'Maharashtra',
    bank_name: '',
    bank_account_number: '',
    bank_ifsc: '',
    bank_branch: '',
  });
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const { login: authLogin } = useAuth();
  const { t, isMarathi } = useLanguage();
  const navigate = useNavigate();

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    if (phone.length !== 10) {
      toast.error(isMarathi ? 'कृपया वैध 10 अंकी मोबाइल नंबर टाका' : 'Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    try {
      const { data } = await requestOTP({ phone });
      toast.success(isMarathi ? `OTP पाठवला गेला ${phone} वर` : `OTP sent to ${phone}`);
      setOtpSent(true);
      setStep(2);
      setCountdown(600); // 10 minutes countdown

      // Start countdown timer
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      toast.error(err.response?.data?.error || (isMarathi ? 'OTP पाठविण्यात अयशस्वी' : 'Failed to send OTP'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error(isMarathi ? 'कृपया 6 अंकी OTP टाका' : 'Please enter 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const { data } = await verifyOTP({ phone, otp });
      toast.success(isMarathi ? '✅ मोबाइल नंबर पडताळला गेला!' : '✅ Phone number verified!');
      setStep(3);
    } catch (err) {
      toast.error(err.response?.data?.error || (isMarathi ? 'अवैध किंवा कालबाह्य OTP' : 'Invalid or expired OTP'));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: formData.name.trim(),
        password: formData.password,
        phone: phone.trim(),
        otp: otp.trim(),
        village: formData.village.trim() || undefined,
        district: formData.district.trim() || undefined,
        state: formData.state.trim() || 'Maharashtra',
        aadhaar_last4: formData.aadhaar_last4.trim() || undefined,
        bank_name: formData.bank_name.trim() || undefined,
        bank_account_number: formData.bank_account_number.trim() || undefined,
        bank_ifsc: formData.bank_ifsc.trim() || undefined,
        bank_branch: formData.bank_branch.trim() || undefined,
      };
      const { data } = await register(payload);
      authLogin(data.token, data.user);
      toast.success(isMarathi ? `नोंदणी यशस्वी! स्वागत आहे, ${data.user.name}` : `Registration successful! Welcome, ${data.user.name}`);
      navigate('/');
    } catch (err) {
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.errors?.[0]?.msg ||
        (isMarathi ? 'नोंदणी अयशस्वी' : 'Registration failed');
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24 bg-white">
        <div className="mx-auto w-full max-w-md">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-br from-primary-600 to-emerald-600 p-4 rounded-2xl text-white shadow-xl ring-4 ring-primary-100">
              <Wheat className="h-12 w-12 text-yellow-300" strokeWidth={2.5} />
            </div>
          </div>

          <h2 className="text-center text-4xl font-extrabold text-gray-900 mb-2">
            {t('auth.registerTitle')}
          </h2>
          <p className="text-center text-base text-gray-600 mb-8">
            {t('auth.registerSubtitle')}
          </p>

          {/* Progress Stepper */}
          <div className="flex justify-between mb-8">
            <StepIndicator active={step >= 1} completed={step > 1} number="1" label={isMarathi ? 'मोबाइल' : 'Phone'} />
            <div className={`flex-1 h-1 self-center mx-2 ${step > 1 ? 'bg-primary-600' : 'bg-gray-200'}`}></div>
            <StepIndicator active={step >= 2} completed={step > 2} number="2" label="OTP" />
            <div className={`flex-1 h-1 self-center mx-2 ${step > 2 ? 'bg-primary-600' : 'bg-gray-200'}`}></div>
            <StepIndicator active={step >= 3} completed={step > 3} number="3" label={isMarathi ? 'तपशील' : 'Details'} />
          </div>

          {/* Step 1: Phone Number */}
          {step === 1 && (
            <form onSubmit={handleRequestOTP} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  {t('auth.mobileNumber')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    maxLength="10"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t('auth.mobilePlaceholder')}
                    className="pl-10 block w-full border-2 border-gray-300 rounded-xl shadow-sm focus:ring-primary-500 focus:border-primary-500 text-base p-3 transition"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {isMarathi
                    ? '🔐 OTP आपल्या या नंबरवर पाठवला जाईल पडताळणीसाठी'
                    : '🔐 We will send an OTP to verify your number'}
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || phone.length !== 10}
                className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-base font-bold text-white bg-gradient-to-r from-primary-600 to-emerald-600 hover:from-primary-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-all duration-200 hover:scale-[1.02]"
              >
                {loading ? (
                  <>
                    <Loader className="animate-spin h-5 w-5 mr-2" />
                    {isMarathi ? 'OTP पाठवत आहे...' : 'Sending OTP...'}
                  </>
                ) : (
                  <>
                    {isMarathi ? 'OTP पाठवा' : 'Send OTP'}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Step 2: Verify OTP */}
          {step === 2 && (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-4">
                <p className="text-sm text-emerald-800 font-semibold">
                  📱 OTP {isMarathi ? 'पाठवला गेला' : 'sent to'} +91 {phone}
                </p>
                {countdown > 0 && (
                  <p className="text-xs text-emerald-600 mt-1">
                    ⏱️ {isMarathi ? 'वैध कालावधी:' : 'Valid for:'} {formatTime(countdown)}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  {isMarathi ? '6 अंकी OTP कोड टाका' : 'Enter 6-digit OTP Code'}
                </label>
                <input
                  type="text"
                  maxLength="6"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="block w-full border-2 border-gray-300 rounded-xl shadow-sm focus:ring-primary-500 focus:border-primary-500 text-2xl text-center font-bold p-4 tracking-widest transition"
                />
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-base font-bold text-white bg-gradient-to-r from-primary-600 to-emerald-600 hover:from-primary-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-all duration-200 hover:scale-[1.02]"
              >
                {loading ? (
                  <>
                    <Loader className="animate-spin h-5 w-5 mr-2" />
                    {isMarathi ? 'पडताळत आहे...' : 'Verifying...'}
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-5 w-5 mr-2" />
                    {isMarathi ? 'OTP पडताळा' : 'Verify OTP'}
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-center text-sm text-primary-600 hover:text-primary-700 font-semibold"
              >
                ← {isMarathi ? 'नंबर बदला' : 'Change Number'}
              </button>
            </form>
          )}

          {/* Step 3: Complete Registration */}
          {step === 3 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 mb-4 flex items-center">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 mr-2 flex-shrink-0" />
                <p className="text-sm text-emerald-800 font-semibold">
                  ✅ {isMarathi ? 'मोबाइल पडताळला गेला:' : 'Phone verified:'} +91 {phone}
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  {t('auth.fullName')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder={t('auth.namePlaceholder')}
                    className="pl-10 block w-full border-2 border-gray-300 rounded-xl shadow-sm focus:ring-primary-500 focus:border-primary-500 text-sm p-3 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  {t('auth.password')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder={t('auth.passwordPlaceholder')}
                    className="pl-10 block w-full border-2 border-gray-300 rounded-xl shadow-sm focus:ring-primary-500 focus:border-primary-500 text-sm p-3 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    {t('auth.village')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="village"
                      value={formData.village}
                      onChange={handleChange}
                      placeholder={t('auth.villagePlaceholder')}
                      className="pl-9 block w-full border-2 border-gray-300 rounded-xl shadow-sm focus:ring-primary-500 focus:border-primary-500 text-sm p-3 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    {t('auth.district')}
                  </label>
                  <input
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    placeholder={t('auth.districtPlaceholder')}
                    className="block w-full border-2 border-gray-300 rounded-xl shadow-sm focus:ring-primary-500 focus:border-primary-500 text-sm p-3 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  {t('auth.aadhaar')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <ShieldCheck className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="aadhaar_last4"
                    maxLength="4"
                    value={formData.aadhaar_last4}
                    onChange={handleChange}
                    placeholder={t('auth.aadhaarPlaceholder')}
                    className="pl-10 block w-full border-2 border-gray-300 rounded-xl shadow-sm focus:ring-primary-500 focus:border-primary-500 text-sm p-3 transition"
                  />
                </div>
              </div>

              {/* Bank / DBT Section */}
              <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200 space-y-3 mt-4">
                <div className="flex items-center space-x-2">
                  <Building2 className="h-5 w-5 text-emerald-700" />
                  <h4 className="font-bold text-emerald-900 text-sm">
                    {isMarathi ? 'बँक खाते तपशील (DBT देयकासाठी)' : 'Bank Details (For DBT Payments)'}
                  </h4>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      {isMarathi ? 'बँकेचे नाव' : 'Bank Name'}
                    </label>
                    <input
                      type="text"
                      name="bank_name"
                      value={formData.bank_name}
                      onChange={handleChange}
                      placeholder={isMarathi ? 'उदा. SBI / Bank of Maha' : 'e.g. SBI, Bank of Baroda'}
                      className="block w-full border border-gray-300 rounded-lg text-xs p-2.5 focus:ring-primary-500 focus:border-primary-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      {isMarathi ? 'खाते क्रमांक' : 'Account Number'}
                    </label>
                    <input
                      type="text"
                      name="bank_account_number"
                      value={formData.bank_account_number}
                      onChange={handleChange}
                      placeholder="1234567890"
                      className="block w-full border border-gray-300 rounded-lg text-xs p-2.5 focus:ring-primary-500 focus:border-primary-500 bg-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      {isMarathi ? 'IFSC कोड' : 'IFSC Code'}
                    </label>
                    <input
                      type="text"
                      name="bank_ifsc"
                      maxLength="11"
                      value={formData.bank_ifsc}
                      onChange={(e) => setFormData({ ...formData, bank_ifsc: e.target.value.toUpperCase() })}
                      placeholder="SBIN0001234"
                      className="block w-full border border-gray-300 rounded-lg text-xs p-2.5 focus:ring-primary-500 focus:border-primary-500 bg-white font-mono uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      {isMarathi ? 'शाखा (Branch)' : 'Branch Name'}
                    </label>
                    <input
                      type="text"
                      name="bank_branch"
                      value={formData.bank_branch}
                      onChange={handleChange}
                      placeholder={isMarathi ? 'उदा. हडपसर, पुणे' : 'e.g. Pune Main'}
                      className="block w-full border border-gray-300 rounded-lg text-xs p-2.5 focus:ring-primary-500 focus:border-primary-500 bg-white"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-base font-bold text-white bg-gradient-to-r from-primary-600 to-emerald-600 hover:from-primary-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-all duration-200 hover:scale-[1.02] mt-6"
              >
                {loading ? (
                  <>
                    <Loader className="animate-spin h-5 w-5 mr-2" />
                    {t('auth.registering')}
                  </>
                ) : (
                  <>
                    {t('auth.registerButton')}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {t('auth.alreadyRegistered')}{' '}
              <Link
                to="/login"
                className="font-bold text-primary-600 hover:text-primary-700 underline"
              >
                {t('auth.loginHere')}
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side Illustration / Showcase */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary-600 via-emerald-600 to-green-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>

        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <h2 className="text-4xl font-extrabold mb-6 drop-shadow-lg">
            शेतकऱ्यांसाठी डिजिटल क्रांती 🌾
          </h2>
          <p className="text-xl mb-8 text-emerald-50 leading-relaxed font-medium">
            किसान मंडी सोबत आजच नोंदणी करा आणि आपल्या पिकाची विक्री सुलभ, जलद आणि पारदर्शक बनवा.
          </p>

          <div className="bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-2xl p-6 space-y-4">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">📱</span>
              <span className="font-semibold text-lg">मोफत SMS अपडेट्स थेट तुमच्या फोनवर</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-2xl">⏱️</span>
              <span className="font-semibold text-lg">वेळेची बचत - रांगेत उभे राहण्याची गरज नाही</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-2xl">💰</span>
              <span className="font-semibold text-lg">शासकीय हमीभाव (MSP) थेट बँक खात्यात</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🔐</span>
              <span className="font-semibold text-lg">OTP पडताळणी - सुरक्षित आणि खात्रीशीर</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepIndicator({ active, completed, number, label }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition ${
          completed
            ? 'bg-primary-600 text-white'
            : active
            ? 'bg-primary-600 text-white ring-4 ring-primary-100'
            : 'bg-gray-200 text-gray-500'
        }`}
      >
        {completed ? <CheckCircle2 className="h-5 w-5" /> : number}
      </div>
      <span className={`text-xs font-semibold mt-1 ${active ? 'text-primary-600' : 'text-gray-400'}`}>
        {label}
      </span>
    </div>
  );
}
