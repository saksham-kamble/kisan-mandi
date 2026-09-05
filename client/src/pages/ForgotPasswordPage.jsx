import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { requestPasswordResetOTP, resetPassword } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import toast from 'react-hot-toast';
import {
  Wheat,
  Phone,
  Lock,
  KeyRound,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Loader,
  Eye,
  EyeOff,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1); // 1: Enter Phone, 2: Enter OTP & New Password, 3: Success
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [demoOtp, setDemoOtp] = useState('123456');
  const [farmerName, setFarmerName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const { t, isMarathi } = useLanguage();
  const navigate = useNavigate();

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      toast.error(
        isMarathi
          ? 'कृपया वैध 10 अंकी नोंदणीकृत मोबाइल नंबर टाका'
          : 'Please enter a valid 10-digit registered mobile number'
      );
      return;
    }

    setLoading(true);
    try {
      const { data } = await requestPasswordResetOTP({ phone: cleanPhone });
      const receivedOtp = data.otp || '123456';
      setDemoOtp(receivedOtp);
      setFarmerName(data.farmerName || '');
      toast.success(
        data.isSimulated
          ? isMarathi
            ? `पासवर्ड रीसेट OTP: ${receivedOtp}`
            : `Demo Reset OTP: ${receivedOtp}`
          : isMarathi
          ? `OTP पाठवला गेला +91 ${cleanPhone} वर`
          : `Reset OTP sent to +91 ${cleanPhone}`
      );
      setStep(2);
      setCountdown(600);

      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      toast.error(
        err.response?.data?.error ||
          (isMarathi
            ? 'या नंबरवर खाते आढळले नाही किंवा OTP पाठविण्यात अयशस्वी'
            : 'No account found with this phone number')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    const cleanOtp = (otp || demoOtp || '123456').trim();

    if (newPassword.length < 6) {
      toast.error(
        isMarathi
          ? 'पासवर्ड किमान ६ अक्षरांचा असावा'
          : 'Password must be at least 6 characters long'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error(
        isMarathi ? 'दोन्ही पासवर्ड जुळत नाहीत' : 'New passwords do not match'
      );
      return;
    }

    setLoading(true);
    try {
      const { data } = await resetPassword({
        phone: phone.replace(/\D/g, ''),
        otp: cleanOtp,
        new_password: newPassword,
      });

      toast.success(
        isMarathi
          ? '✅ पासवर्ड यशस्वीरित्या बदलला गेला!'
          : '✅ Password reset successfully!'
      );
      setStep(3);
    } catch (err) {
      toast.error(
        err.response?.data?.error ||
          (isMarathi ? 'अवैध किंवा कालबाह्य OTP' : 'Invalid or expired OTP')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-emerald-50 via-white to-green-50">
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-md">
          {/* Header Icon */}
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-br from-amber-500 to-primary-600 p-4 rounded-2xl text-white shadow-xl ring-4 ring-primary-100">
              <KeyRound className="h-10 w-10 text-yellow-200" strokeWidth={2.5} />
            </div>
          </div>

          <h2 className="text-center text-3xl sm:text-4xl font-black text-gray-900 mb-2">
            {isMarathi ? 'पासवर्ड विसरलात?' : 'Forgot Password?'} 🔐
          </h2>
          <p className="text-center text-sm sm:text-base text-gray-600 mb-8">
            {isMarathi
              ? 'आपल्या नोंदणीकृत मोबाइल नंबरद्वारे नवीन पासवर्ड तयार करा'
              : 'Reset your password securely via mobile OTP verification'}
          </p>

          {/* STEP 1: Enter Registered Phone */}
          {step === 1 && (
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl border-2 border-gray-100 animate-fadeIn">
              <form onSubmit={handleRequestOTP} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    {isMarathi ? 'नोंदणीकृत मोबाइल नंबर' : 'Registered Mobile Number'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      maxLength="10"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder={t('auth.mobilePlaceholder')}
                      className="pl-12 block w-full border-2 border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base p-3.5 transition"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {isMarathi
                      ? '📱 या नंबरवर पासवर्ड रीसेट करण्यासाठी OTP पाठवला जाईल.'
                      : '📱 A verification OTP will be sent to your registered phone.'}
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || phone.replace(/\D/g, '').length !== 10}
                  className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-base font-bold text-white bg-gradient-to-r from-primary-600 to-emerald-600 hover:from-primary-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-all duration-200 hover:scale-[1.01]"
                >
                  {loading ? (
                    <>
                      <Loader className="animate-spin h-5 w-5 mr-2" />
                      {isMarathi ? 'OTP पाठवत आहे...' : 'Sending OTP...'}
                    </>
                  ) : (
                    <>
                      {isMarathi ? 'OTP मिळवा' : 'Send Reset OTP'}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center pt-4 border-t border-gray-100">
                <Link
                  to="/login"
                  className="inline-flex items-center text-sm font-bold text-primary-600 hover:text-primary-700 underline"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  {isMarathi ? 'लॉगिन पृष्ठावर परत जा' : 'Back to Login'}
                </Link>
              </div>
            </div>
          )}

          {/* STEP 2: Enter OTP & New Password */}
          {step === 2 && (
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl border-2 border-gray-100 animate-fadeIn">
              <form onSubmit={handleResetPassword} className="space-y-4">
                {/* Farmer account info banner */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 mb-2">
                  <p className="text-xs font-bold text-emerald-900">
                    👨‍🌾 {isMarathi ? 'खातेदार:' : 'Account Holder:'}{' '}
                    <strong>{farmerName || 'Registered Farmer'}</strong>
                  </p>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    📱 +91 {phone} • {countdown > 0 && `⏱️ ${Math.floor(countdown / 60)}:${(countdown % 60).toString().padStart(2, '0')}`}
                  </p>
                </div>

                {/* Instant Demo OTP auto-fill */}
                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-xl p-3 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold text-amber-900">
                      {isMarathi ? 'रीसेट OTP कोड:' : 'Reset OTP Code:'}
                    </p>
                    <p className="font-mono text-base font-black text-primary-800 tracking-widest">
                      {demoOtp}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOtp(demoOtp)}
                    className="bg-amber-200 hover:bg-amber-300 text-amber-950 text-xs font-extrabold px-3 py-1.5 rounded-lg transition flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                    {isMarathi ? '1-क्लिक भरा' : 'Auto-Fill'}
                  </button>
                </div>

                {/* OTP Input */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {isMarathi ? '6 अंकी OTP टाका' : 'Enter 6-digit OTP'} *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <ShieldCheck className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      maxLength="6"
                      required
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="123456"
                      className="pl-9 block w-full border-2 border-gray-300 rounded-xl shadow-sm text-base font-mono tracking-widest p-2.5 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {isMarathi ? 'नवीन पासवर्ड (New Password)' : 'New Password'} *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength="6"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-9 pr-10 block w-full border-2 border-gray-300 rounded-xl shadow-sm text-base p-2.5 focus:ring-primary-500 focus:border-primary-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {isMarathi ? 'नवीन पासवर्डची पुष्टी करा' : 'Confirm New Password'} *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength="6"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-9 pr-10 block w-full border-2 border-gray-300 rounded-xl shadow-sm text-base p-2.5 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>

                <div className="flex space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-3 px-3 border border-gray-300 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 transition"
                  >
                    {isMarathi ? 'नंबर बदला' : 'Change Phone'}
                  </button>
                  <button
                    type="submit"
                    disabled={loading || newPassword.length < 6}
                    className="flex-1 py-3 px-3 border border-transparent rounded-xl shadow-lg text-xs font-black text-white bg-gradient-to-r from-primary-600 to-emerald-600 hover:from-primary-700 hover:to-emerald-700 focus:outline-none disabled:opacity-50 transition"
                  >
                    {loading ? (
                      <Loader className="animate-spin h-4 w-4 mx-auto" />
                    ) : (
                      isMarathi ? 'पासवर्ड बदला' : 'Reset Password'
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 3: Success State */}
          {step === 3 && (
            <div className="bg-white p-8 rounded-2xl shadow-xl border-2 border-green-200 text-center animate-fadeIn">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">
                {isMarathi ? 'पासवर्ड यशस्वीरित्या बदलला!' : 'Password Reset Successfully!'} 🎉
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                {isMarathi
                  ? 'आपला नवीन पासवर्ड जतन केला गेला आहे. आता आपण नवीन पासवर्ड वापरून सहज लॉगिन करू शकता.'
                  : 'Your account has been updated with the new password. You can now login.'}
              </p>

              <button
                onClick={() => navigate('/login')}
                className="w-full flex justify-center items-center py-3.5 px-4 rounded-xl shadow-lg text-base font-extrabold text-white bg-gradient-to-r from-primary-600 to-emerald-600 hover:from-primary-700 hover:to-emerald-700 transition"
              >
                {isMarathi ? 'आता लॉगिन करा' : 'Login Now'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
