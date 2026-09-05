import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Wheat, Calendar, Clock, CreditCard, BarChart3, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import MandiUpdatesSection from '../components/home/MandiUpdatesSection';

export default function HomePage() {
  const { user } = useAuth();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-emerald-600 to-green-700">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
          <div className="text-center">
            <div className="flex justify-center mb-6 animate-bounce">
              <div className="bg-yellow-400 p-5 rounded-2xl shadow-2xl ring-4 ring-yellow-300/50">
                <Wheat className="h-20 w-20 text-primary-800" strokeWidth={2.5} />
              </div>
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-white mb-4 drop-shadow-lg tracking-tight">
              {t('home.hero.welcome')} <br />
              <span className="text-yellow-300 inline-flex items-center gap-2">
                {t('home.hero.appName')}
                <Sparkles className="h-10 w-10 text-yellow-200 animate-pulse" />
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-emerald-50 max-w-3xl mx-auto mb-10 leading-relaxed font-medium drop-shadow">
              {t('home.hero.tagline')}
            </p>

            {user ? (
              <Link
                to="/book-slot"
                className="inline-flex items-center px-10 py-4 border-4 border-yellow-400 text-lg font-bold rounded-xl text-primary-900 bg-yellow-400 hover:bg-yellow-300 shadow-2xl hover:shadow-yellow-400/50 hover:scale-105 transition-all duration-200"
              >
                <Calendar className="mr-3 h-7 w-7" />
                {t('home.hero.bookNow')}
                <ArrowRight className="ml-2 h-6 w-6" />
              </Link>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  to="/register"
                  className="inline-flex items-center px-10 py-4 border-4 border-yellow-400 text-lg font-bold rounded-xl text-primary-900 bg-yellow-400 hover:bg-yellow-300 shadow-2xl hover:shadow-yellow-400/50 hover:scale-105 transition-all duration-200"
                >
                  {t('home.hero.registerFarmer')}
                  <ArrowRight className="ml-2 h-6 w-6" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center px-10 py-4 border-4 border-white text-lg font-bold rounded-xl text-white bg-white/10 backdrop-blur hover:bg-white/20 shadow-xl transition-all duration-200"
                >
                  {t('nav.login')}
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 w-full">
          <svg viewBox="0 0 1440 120" className="w-full h-16 md:h-24" preserveAspectRatio="none">
            <path fill="#f0fdf4" d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
          </svg>
        </div>
      </div>

      {/* Live Mandi Announcements & MSP Rates Ticker Section */}
      <MandiUpdatesSection />

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-14">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            {t('home.features.title')}
          </h2>
          <div className="w-24 h-1.5 bg-gradient-to-r from-primary-600 to-emerald-500 mx-auto rounded-full"></div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard
            icon={<Calendar className="h-12 w-12 text-white" />}
            title={t('home.features.bookOnline')}
            description={t('home.features.bookOnlineDesc')}
            bgColor="bg-gradient-to-br from-blue-500 to-blue-600"
          />
          <FeatureCard
            icon={<Clock className="h-12 w-12 text-white" />}
            title={t('home.features.liveTracking')}
            description={t('home.features.liveTrackingDesc')}
            bgColor="bg-gradient-to-br from-emerald-500 to-green-600"
          />
          <FeatureCard
            icon={<CreditCard className="h-12 w-12 text-white" />}
            title={t('home.features.fastPayments')}
            description={t('home.features.fastPaymentsDesc')}
            bgColor="bg-gradient-to-br from-amber-500 to-orange-600"
          />
          <FeatureCard
            icon={<BarChart3 className="h-12 w-12 text-white" />}
            title={t('home.features.transparent')}
            description={t('home.features.transparentDesc')}
            bgColor="bg-gradient-to-br from-purple-500 to-purple-600"
          />
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-gradient-to-br from-primary-50 to-emerald-50 py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
              {t('home.howItWorks.title')}
            </h2>
            <div className="w-24 h-1.5 bg-gradient-to-r from-primary-600 to-emerald-500 mx-auto rounded-full"></div>
          </div>

          <div className="space-y-6">
            <Step number="1" title={t('home.howItWorks.step1')} description={t('home.howItWorks.step1Desc')} />
            <Step number="2" title={t('home.howItWorks.step2')} description={t('home.howItWorks.step2Desc')} />
            <Step number="3" title={t('home.howItWorks.step3')} description={t('home.howItWorks.step3Desc')} />
            <Step number="4" title={t('home.howItWorks.step4')} description={t('home.howItWorks.step4Desc')} />
            <Step number="5" title={t('home.howItWorks.step5')} description={t('home.howItWorks.step5Desc')} />
            <Step number="6" title={t('home.howItWorks.step6')} description={t('home.howItWorks.step6Desc')} />
          </div>
        </div>
      </div>

      {/* Welcome User Card */}
      {user && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-gradient-to-r from-primary-600 to-emerald-600 text-white shadow-2xl rounded-2xl p-8 md:p-10 border-4 border-primary-500">
            <div className="flex items-start">
              <div className="bg-yellow-400 p-3 rounded-xl mr-5 shadow-lg">
                <CheckCircle className="h-10 w-10 text-primary-800" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl md:text-3xl font-bold mb-3">
                  {t('home.welcome.greeting')}, {user.name}! 🎉
                </h3>
                <p className="text-lg text-emerald-50 mb-5 font-medium">
                  {user.village && user.district
                    ? `${user.village}, ${user.district}`
                    : t('home.welcome.readyToBook')}
                </p>
                <Link
                  to="/my-bookings"
                  className="inline-flex items-center px-6 py-3 bg-yellow-400 text-primary-900 font-bold rounded-lg hover:bg-yellow-300 transition shadow-lg text-base"
                >
                  {t('home.welcome.viewBookings')} →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FeatureCard({ icon, title, description, bgColor }) {
  return (
    <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-primary-200 hover:-translate-y-2">
      <div className={`${bgColor} w-16 h-16 rounded-xl flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}

function Step({ number, title, description }) {
  return (
    <div className="flex items-start group">
      <div className="flex-shrink-0 bg-gradient-to-br from-primary-600 to-emerald-600 text-white w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg group-hover:scale-110 transition-transform duration-200 border-4 border-primary-400">
        {number}
      </div>
      <div className="ml-6 bg-white p-5 rounded-xl shadow-md group-hover:shadow-lg transition-all flex-1 border border-gray-100">
        <h4 className="text-xl font-bold text-gray-900 mb-1">{title}</h4>
        <p className="text-gray-600 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
