import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import toast from 'react-hot-toast';
import { Wheat, Phone, Lock, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [formData, setFormData] = useState({ phone: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login: authLogin } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await login(formData);
      authLogin(data.token, data.user);
      toast.success(`Welcome back, ${data.user.name}!`);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Login failed');
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
            {t('auth.loginTitle')}
          </h2>
          <p className="text-center text-base text-gray-600 mb-8">
            {t('auth.loginSubtitle')}
          </p>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Phone */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                {t('auth.mobileNumber')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder={t('auth.mobilePlaceholder')}
                  className="pl-12 block w-full border-2 border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base p-3.5 transition"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                {t('auth.password')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={t('auth.passwordPlaceholder')}
                  className="pl-12 block w-full border-2 border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base p-3.5 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-base font-bold text-white bg-gradient-to-r from-primary-600 to-emerald-600 hover:from-primary-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-all duration-200 hover:scale-[1.02]"
            >
              {loading ? t('auth.loggingIn') : t('auth.loginButton')}
              {!loading && <ArrowRight className="ml-2 h-5 w-5" />}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-semibold">
                  {t('auth.demoCredentials')}
                </span>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="bg-blue-50 border-2 border-blue-200 p-3 rounded-lg">
                <p className="text-xs font-bold text-blue-900 mb-1">{t('auth.farmer')}</p>
                <p className="text-xs text-blue-700">9876543210</p>
                <p className="text-xs text-blue-700">password123</p>
              </div>
              <div className="bg-amber-50 border-2 border-amber-200 p-3 rounded-lg">
                <p className="text-xs font-bold text-amber-900 mb-1">{t('auth.admin')}</p>
                <p className="text-xs text-amber-700">9999999999</p>
                <p className="text-xs text-amber-700">password123</p>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              {t('auth.newFarmer')}{' '}
              <Link
                to="/register"
                className="font-bold text-primary-600 hover:text-primary-700 underline"
              >
                {t('auth.registerHere')}
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Hero/Feature Showcase (hidden on mobile) */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary-600 via-emerald-600 to-green-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>

        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <h2 className="text-5xl font-extrabold mb-6 drop-shadow-lg">
            {t('nav.appName')} 🌾
          </h2>
          <p className="text-2xl mb-8 text-emerald-50 leading-relaxed font-medium">
            {t('home.hero.tagline')}
          </p>

          <div className="space-y-5">
            <FeaturePoint text={t('home.features.bookOnline')} />
            <FeaturePoint text={t('home.features.liveTracking')} />
            <FeaturePoint text={t('home.features.fastPayments')} />
            <FeaturePoint text={t('home.features.transparent')} />
          </div>

          <div className="mt-12 bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-2xl p-6">
            <p className="text-yellow-300 font-bold text-lg mb-2">✨ स्मार्ट शेतकरी मंडी</p>
            <p className="text-emerald-50 text-sm">
              डिजिटल इंडियाच्या दिशेने एक पाऊल - शेतकऱ्यांसाठी आधुनिक खरेदी व्यवस्था
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeaturePoint({ text }) {
  return (
    <div className="flex items-center space-x-3">
      <div className="bg-yellow-400 p-2 rounded-lg shadow-lg">
        <ArrowRight className="h-5 w-5 text-primary-800" />
      </div>
      <span className="text-lg font-semibold">{text}</span>
    </div>
  );
}
