import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  Wheat,
  Calendar,
  Clock,
  CreditCard,
  LayoutDashboard,
  LogOut,
  User,
  Globe,
  Home,
  FileText,
  HelpCircle,
  Landmark,
  Radio,
} from 'lucide-react';

export default function Navbar() {
  const { user, logout, isAdmin, isSuperAdmin } = useAuth();
  const { t, language, toggleLanguage } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-gradient-to-r from-primary-800 via-primary-700 to-primary-900 text-white shadow-lg sticky top-0 z-50 border-b border-primary-600/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2.5 font-bold text-xl group">
            <div className="bg-yellow-400/20 p-1.5 rounded-lg border border-yellow-300/30 group-hover:scale-105 transition">
              <Wheat className="h-6 w-6 text-yellow-300" />
            </div>
            <span className="tracking-wide text-white drop-shadow-sm">{t('nav.appName')}</span>
            <span className="text-[10px] bg-yellow-400 text-primary-950 px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wider shadow-sm">
              2026
            </span>
          </Link>

          {/* Center / Navigation Links */}
          <div className="flex items-center space-x-1.5 sm:space-x-2.5">
            {/* Language Switcher Button */}
            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/10 hover:bg-white/20 border border-white/20 transition shadow-inner"
              title="Change Language / भाषा बदला"
            >
              <Globe className="h-3.5 w-3.5 text-yellow-300" />
              <span>{language === 'en' ? 'मराठी' : 'English'}</span>
            </button>

            {/* Public Live Updates link */}
            <Link
              to="/updates"
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold hover:bg-white/10 transition text-yellow-200 hover:text-yellow-100"
              title="Live Mandi Bulletins & Weather Advisories"
            >
              <Radio className="h-3.5 w-3.5 text-yellow-300 animate-pulse" />
              <span className="hidden sm:inline">{language === 'en' ? 'Live Updates' : 'थेट सूचना'}</span>
            </Link>

            {user ? (
              <>
                <Link
                  to="/"
                  className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium hover:bg-white/10 transition"
                >
                  <Home className="h-4 w-4 text-emerald-300" />
                  <span className="hidden md:inline">{language === 'en' ? 'Home' : 'होम'}</span>
                </Link>

                <Link
                  to="/book-slot"
                  className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium hover:bg-white/10 transition"
                >
                  <Calendar className="h-4 w-4 text-emerald-300" />
                  <span className="hidden md:inline">{t('nav.bookSlot')}</span>
                </Link>

                <Link
                  to="/my-bookings"
                  className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium hover:bg-white/10 transition"
                >
                  <Clock className="h-4 w-4 text-emerald-300" />
                  <span className="hidden lg:inline">{t('nav.mySlots')}</span>
                </Link>

                <Link
                  to="/live-queue"
                  className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium bg-emerald-600/40 hover:bg-emerald-600/60 border border-emerald-400/30 transition shadow-sm"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-300"></span>
                  </span>
                  <span>{t('nav.liveQueue')}</span>
                </Link>

                <Link
                  to="/payments"
                  className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium hover:bg-white/10 transition"
                >
                  <CreditCard className="h-4 w-4 text-emerald-300" />
                  <span className="hidden xl:inline">{t('nav.payments')}</span>
                </Link>

                <Link
                  to="/land-records"
                  className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium hover:bg-white/10 transition"
                >
                  <FileText className="h-4 w-4 text-emerald-300" />
                  <span className="hidden xl:inline">{language === 'en' ? '7/12 Land' : '७/१२ उतारा'}</span>
                </Link>

                <Link
                  to="/helpdesk"
                  className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium hover:bg-white/10 transition"
                >
                  <HelpCircle className="h-4 w-4 text-emerald-300" />
                  <span className="hidden 2xl:inline">{language === 'en' ? 'Helpdesk' : 'तक्रार निवारण'}</span>
                </Link>

                {/* Super Admin Apex Portal Link */}
                {isSuperAdmin && (
                  <Link
                    to="/super-admin"
                    className="flex items-center space-x-1 px-3 py-1.5 bg-slate-900 text-yellow-300 font-extrabold rounded-lg text-xs hover:bg-black border border-yellow-400/40 transition shadow"
                  >
                    <Landmark className="h-3.5 w-3.5 text-yellow-400" />
                    <span>{language === 'en' ? 'Super Admin' : 'जिल्हा नियंत्रण'}</span>
                  </Link>
                )}

                {/* Mandi Admin Link */}
                {isAdmin && !isSuperAdmin && (
                  <Link
                    to="/admin"
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-yellow-400 text-primary-950 font-bold rounded-lg text-xs sm:text-sm hover:bg-yellow-300 transition shadow"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span>{t('nav.adminPanel')}</span>
                  </Link>
                )}

                {/* Profile Link & Logout */}
                <div className="flex items-center space-x-1.5 border-l border-white/20 pl-2 sm:pl-3">
                  <Link
                    to="/profile"
                    className="text-xs font-semibold text-emerald-100 hover:text-white flex items-center gap-1.5 bg-black/20 hover:bg-black/40 px-2.5 py-1 rounded-full border border-white/10 transition"
                    title="Farmer Profile & DBT Bank Details"
                  >
                    <User className="h-3.5 w-3.5 text-yellow-300" />
                    <span className="hidden sm:inline max-w-[90px] truncate">{user.name}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="p-1.5 rounded-lg hover:bg-red-500/20 text-emerald-100 hover:text-white border border-transparent hover:border-red-400/30 transition"
                    title={t('nav.logout')}
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium hover:bg-white/10 transition border border-transparent hover:border-white/20"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 bg-yellow-400 text-primary-950 font-bold rounded-lg text-xs sm:text-sm hover:bg-yellow-300 transition shadow"
                >
                  {t('nav.register')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
