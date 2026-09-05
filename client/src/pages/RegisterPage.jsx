import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { requestOTP, verifyOTP, register } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import toast from 'react-hot-toast';
import { Wheat, Phone, Lock, User, MapPin, ShieldCheck, ArrowRight, CheckCircle2, Loader, Building2, CreditCard, KeyRound, Sparkles } from 'lucide-react';

export default function RegisterPage() {
  const [step, setStep] = useState(1); // 1: Enter Phone, 2: Verify OTP, 3: Complete Registration
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [demoOtp, setDemoOtp] = useState('123456');
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
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      toast.error(isMarathi ? 'कृपया वैध 10 अंकी मोबाइल नंबर टाका' : 'Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    try {
      const { data } = await requestOTP({ phone: cleanPhone });
      const receivedOtp = data.otp || '123456';
      setDemoOtp(receivedOtp);
      toast.success(
        data.isSimulated
          ? (isMarathi ? `OTP तयार झाला: ${receivedOtp}` : `Demo OTP: ${receivedOtp}`)
          : (isMarathi ? `OTP पाठवला गेला ${cleanPhone} वर` : `OTP sent to ${cleanPhone}`)
      );
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
    const cleanOtp = (otp || '').trim();
    if (cleanOtp.length < 4) {
      toast.error(isMarathi ? 'कृपया वैध OTP टाका' : 'Please enter valid OTP');
      return;
    }

    setLoading(true);
    try {
      await verifyOTP({ phone: phone.replace(/\D/g, ''), otp: cleanOtp });
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
        phone: phone.replace(/\D/g, '').trim(),
        otp: (otp || demoOtp || '123456').trim(),
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
      toast.success(
        isMarathi
          ? `नोंदणी यशस्वी झाली! स्वागत आहे, ${data.user.name}`
          : `Registration successful! Welcome, ${data.user.name}`
      );
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || (isMarathi ? 'नोंदणी अयशस्वी' : 'Registration failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
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
                    : '🔐 We will send an OTP to verify your mobile number'}
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || phone.replace(/\D/g, '').length !== 10}
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
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-2">
                <p className="text-sm text-emerald-800 font-semibold">
                  📱 OTP {isMarathi ? 'पाठवला गेला' : 'sent to'} +91 {phone}
                </p>
                {countdown > 0 && (
                  <p className="text-xs text-emerald-600 mt-1">
                    ⏱️ {isMarathi ? 'कालबाह्य' : 'Expires in'}: {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
                  </p>
                )}
              </div>

              {/* Instant Demo OTP Auto-fill Box */}
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-xl p-3.5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <KeyRound className="w-5 h-5 text-amber-700" />
                    <div>
                      <p className="text-xs font-bold text-amber-900">
                        {isMarathi ? 'पडताळणी OTP कोड:' : 'Verification OTP Code:'}
                      </p>
                      <p className="font-mono text-lg font-black text-primary-800 tracking-wider">
                        {demoOtp}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOtp(demoOtp)}
                    className="bg-amber-200 hover:bg-amber-300 text-amber-950 text-xs font-extrabold px-3 py-2 rounded-xl transition shadow-sm flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                    {isMarathi ? '1-क्लिक भरा' : 'Auto-Fill'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  {isMarathi ? '6 अंकी OTP प्रविष्ट करा' : 'Enter 6-digit OTP'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <ShieldCheck className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    maxLength="6"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                    className="pl-10 block w-full border-2 border-gray-300 rounded-xl shadow-sm focus:ring-primary-500 focus:border-primary-500 text-xl font-mono tracking-widest p-3 transition"
                  />
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 px-4 border border-gray-300 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition"
                >
                  {isMarathi ? 'नंबर बदला' : 'Change Phone'}
                </button>
                <button
                  type="submit"
                  disabled={loading || otp.length < 4}
                  className="flex-1 py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-gradient-to-r from-primary-600 to-emerald-600 hover:from-primary-700 hover:to-emerald-700 focus:outline-none disabled:opacity-50 transition"
                >
                  {loading ? (
                    <Loader className="animate-spin h-5 w-5 mx-auto" />
                  ) : (
                    isMarathi ? 'पडताळणी करा' : 'Verify OTP'
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Complete Farmer Profile & Registration */}
          {step === 3 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center space-x-2 text-green-800 text-sm font-bold">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span>+91 {phone} {isMarathi ? 'पडताळणी पूर्ण झाली' : 'Verified'}</span>
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {t('auth.fullName')} *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder={isMarathi ? 'उदा. रमेश पाटील' : 'e.g. Ramesh Patil'}
                    className="pl-9 block w-full border border-gray-300 rounded-lg text-sm p-2.5 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {t('auth.password')} *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="pl-9 block w-full border border-gray-300 rounded-lg text-sm p-2.5 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              {/* Aadhaar Last 4 */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {isMarathi ? 'आधार कार्डचे शेवटचे ४ अंक' : 'Aadhaar Last 4 Digits'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <ShieldCheck className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    maxLength="4"
                    name="aadhaar_last4"
                    value={formData.aadhaar_last4}
                    onChange={handleChange}
                    placeholder="XXXX"
                    className="pl-9 block w-full border border-gray-300 rounded-lg text-sm p-2.5 font-mono tracking-widest focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              {/* Village & District */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {isMarathi ? 'गाव' : 'Village'}
                  </label>
                  <input
                    type="text"
                    name="village"
                    value={formData.village}
                    onChange={handleChange}
                    placeholder={isMarathi ? 'गाव' : 'Village'}
                    className="block w-full border border-gray-300 rounded-lg text-sm p-2.5 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {isMarathi ? 'जिल्हा' : 'District'}
                  </label>
                  <input
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    placeholder={isMarathi ? 'उदा. पुणे / नाशिक' : 'e.g. Pune / Nashik'}
                    className="block w-full border border-gray-300 rounded-lg text-sm p-2.5 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              {/* Bank Details for DBT */}
              <div className="pt-2 border-t border-gray-200">
                <p className="text-xs font-black text-gray-900 mb-2 flex items-center gap-1">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  {isMarathi ? 'थेट बँक खात्यात पैसे (DBT बँक तपशील)' : 'DBT Bank Account for Fast Payouts'}
                </p>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <input
                    type="text"
                    name="bank_name"
                    value={formData.bank_name}
                    onChange={handleChange}
                    placeholder={isMarathi ? 'बँकेचे नाव (उदा. SBI)' : 'Bank Name (e.g. SBI)'}
                    className="border border-gray-300 rounded-lg text-xs p-2.5 focus:ring-primary-500"
                  />
                  <input
                    type="text"
                    name="bank_ifsc"
                    value={formData.bank_ifsc}
                    onChange={handleChange}
                    placeholder="IFSC Code (e.g. SBIN0001245)"
                    className="border border-gray-300 rounded-lg text-xs p-2.5 font-mono uppercase focus:ring-primary-500"
                  />
                </div>
                <input
                  type="text"
                  name="bank_account_number"
                  value={formData.bank_account_number}
                  onChange={handleChange}
                  placeholder={isMarathi ? 'खाते क्रमांक (Account Number)' : 'Account Number'}
                  className="w-full border border-gray-300 rounded-lg text-xs p-2.5 font-mono focus:ring-primary-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-base font-extrabold text-white bg-gradient-to-r from-primary-600 to-emerald-600 hover:from-primary-700 hover:to-emerald-700 focus:outline-none disabled:opacity-50 transition hover:scale-[1.01]"
              >
                {loading ? (
                  <Loader className="animate-spin h-5 w-5 mr-2" />
                ) : (
                  <>
                    {isMarathi ? 'नोंदणी पूर्ण करा' : 'Complete Registration'}
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

      {/* Right Side - Hero / Feature Showcase */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary-600 via-emerald-600 to-green-700 relative overflow-hidden">
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <h2 className="text-5xl font-extrabold mb-6 drop-shadow-lg">
            {t('nav.appName')} 🌾
          </h2>
          <p className="text-2xl mb-8 text-emerald-50 leading-relaxed font-medium">
            {isMarathi ? 'शासकीय हमीभाव आणि पारदर्शक खरेदी प्रणाली' : 'Government MSP Procurement Platform'}
          </p>
          <div className="bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-2xl p-6">
            <p className="text-yellow-300 font-bold text-lg mb-2">✨ त्वरित डिजिटल नोंदणी</p>
            <p className="text-emerald-50 text-sm leading-relaxed">
              आपल्या पिकाची थेट शासकीय हमीभावाने विक्री करा आणि पैसे थेट आपल्या आधार लिंक बँक खात्यात मिळवा.
            </p>
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
        className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-200 ${
          completed
            ? 'bg-emerald-600 text-white shadow-md'
            : active
            ? 'bg-primary-600 text-white ring-4 ring-primary-100 shadow-md'
            : 'bg-gray-200 text-gray-600'
        }`}
      >
        {completed ? '✓' : number}
      </div>
      <span className={`text-xs mt-1 font-bold ${active ? 'text-primary-800' : 'text-gray-400'}`}>
        {label}
      </span>
    </div>
  );
}
