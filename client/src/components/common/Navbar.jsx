import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';

export default function Navbar() {
  const { user, logout, isAdmin, isSuperAdmin } = useAuth();
  const { t, language, toggleLanguage } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Close mobile menu whenever route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    setMobileMenuOpen(false);
    logout();
    navigate('/login');
  };

  const isLinkActive = (path) => location.pathname === path;

  return (
    <nav className="bg-gradient-to-r from-primary-800 via-primary-700 to-primary-900 text-white shadow-lg sticky top-0 z-50 border-b border-primary-600/40">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo / Brand */}
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center space-x-2 font-bold text-lg sm:text-xl group flex-shrink-0"
          >
            <div className="bg-yellow-400/20 p-1.5 rounded-lg border border-yellow-300/30 group-hover:scale-105 transition">
              <Wheat className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-300" />
            </div>
            <span className="tracking-wide text-white drop-shadow-sm font-black">
              {t('nav.appName')}
            </span>
            <span className="text-[9px] sm:text-[10px] bg-yellow-400 text-primary-950 px-1.5 py-0.5 rounded-full font-extrabold uppercase tracking-wider shadow-sm">
              2026
            </span>
          </Link>

          {/* Desktop Navigation Links (hidden on mobile/tablet) */}
          <div className="hidden lg:flex items-center space-x-1.5 xl:space-x-2">
            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/10 hover:bg-white/20 border border-white/20 transition shadow-inner"
              title="Change Language / भाषा बदला"
            >
              <Globe className="h-3.5 w-3.5 text-yellow-300" />
              <span>{language === 'en' ? 'मराठी' : 'English'}</span>
            </button>

            {/* Public Live Updates */}
            <Link
              to="/updates"
              className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                isLinkActive('/updates')
                  ? 'bg-white/20 text-yellow-300'
                  : 'text-yellow-200 hover:text-yellow-100 hover:bg-white/10'
              }`}
              title="Live Mandi Bulletins & Weather Advisories"
            >
              <Radio className="h-3.5 w-3.5 text-yellow-300 animate-pulse" />
              <span>{language === 'en' ? 'Live Updates' : 'थेट सूचना'}</span>
            </Link>

            {user ? (
              <>
                <Link
                  to="/"
                  className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                    isLinkActive('/') ? 'bg-white/20 text-white' : 'hover:bg-white/10 text-emerald-100'
                  }`}
                >
                  <Home className="h-3.5 w-3.5 text-emerald-300" />
                  <span>{language === 'en' ? 'Home' : 'होम'}</span>
                </Link>

                <Link
                  to="/book-slot"
                  className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                    isLinkActive('/book-slot') ? 'bg-white/20 text-white' : 'hover:bg-white/10 text-emerald-100'
                  }`}
                >
                  <Calendar className="h-3.5 w-3.5 text-emerald-300" />
                  <span>{t('nav.bookSlot')}</span>
                </Link>

                <Link
                  to="/my-bookings"
                  className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                    isLinkActive('/my-bookings') ? 'bg-white/20 text-white' : 'hover:bg-white/10 text-emerald-100'
                  }`}
                >
                  <Clock className="h-3.5 w-3.5 text-emerald-300" />
                  <span>{t('nav.mySlots')}</span>
                </Link>

                <Link
                  to="/live-queue"
                  className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition shadow-sm ${
                    isLinkActive('/live-queue')
                      ? 'bg-emerald-600 border-yellow-300/50 text-white'
                      : 'bg-emerald-600/40 hover:bg-emerald-600/60 border-emerald-400/30 text-white'
                  }`}
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-300"></span>
                  </span>
                  <span>{t('nav.liveQueue')}</span>
                </Link>

                <Link
                  to="/payments"
                  className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                    isLinkActive('/payments') ? 'bg-white/20 text-white' : 'hover:bg-white/10 text-emerald-100'
                  }`}
                >
                  <CreditCard className="h-3.5 w-3.5 text-emerald-300" />
                  <span>{t('nav.payments')}</span>
                </Link>

                <Link
                  to="/land-records"
                  className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                    isLinkActive('/land-records') ? 'bg-white/20 text-white' : 'hover:bg-white/10 text-emerald-100'
                  }`}
                >
                  <FileText className="h-3.5 w-3.5 text-emerald-300" />
                  <span>{language === 'en' ? '7/12 Land' : '७/१२ उतारा'}</span>
                </Link>

                <Link
                  to="/helpdesk"
                  className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                    isLinkActive('/helpdesk') ? 'bg-white/20 text-white' : 'hover:bg-white/10 text-emerald-100'
                  }`}
                >
                  <HelpCircle className="h-3.5 w-3.5 text-emerald-300" />
                  <span>{language === 'en' ? 'Helpdesk' : 'तक्रार'}</span>
                </Link>

                {/* Super Admin Link */}
                {isSuperAdmin && (
                  <Link
                    to="/super-admin"
                    className="flex items-center space-x-1 px-2.5 py-1.5 bg-slate-900 text-yellow-300 font-extrabold rounded-lg text-xs hover:bg-black border border-yellow-400/40 transition shadow"
                  >
                    <Landmark className="h-3.5 w-3.5 text-yellow-400" />
                    <span>{language === 'en' ? 'Super Admin' : 'जिल्हा नियंत्रण'}</span>
                  </Link>
                )}

                {/* Mandi Admin Link */}
                {isAdmin && !isSuperAdmin && (
                  <Link
                    to="/admin"
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-yellow-400 text-primary-950 font-bold rounded-lg text-xs hover:bg-yellow-300 transition shadow"
                  >
                    <LayoutDashboard className="h-3.5 w-3.5" />
                    <span>{t('nav.adminPanel')}</span>
                  </Link>
                )}

                {/* Profile Link & Logout */}
                <div className="flex items-center space-x-1.5 border-l border-white/20 pl-2">
                  <Link
                    to="/profile"
                    className={`text-xs font-semibold flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition ${
                      isLinkActive('/profile')
                        ? 'bg-yellow-400 text-primary-950 border-yellow-300 font-bold'
                        : 'text-emerald-100 hover:text-white bg-black/20 hover:bg-black/40 border-white/10'
                    }`}
                    title="Farmer Profile & DBT Bank Details"
                  >
                    <User className="h-3.5 w-3.5 text-yellow-300" />
                    <span className="max-w-[85px] truncate">{user.name}</span>
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
                  className="px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-white/10 transition border border-transparent hover:border-white/20"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 bg-yellow-400 text-primary-950 font-bold rounded-lg text-xs hover:bg-yellow-300 transition shadow"
                >
                  {t('nav.register')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Right Controls: Language + Hamburger */}
          <div className="flex lg:hidden items-center space-x-2">
            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-white/10 hover:bg-white/20 border border-white/20 transition shadow-inner"
              title="Change Language / भाषा बदला"
            >
              <Globe className="h-3.5 w-3.5 text-yellow-300" />
              <span>{language === 'en' ? 'मराठी' : 'English'}</span>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 focus:outline-none transition shadow-sm"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6 text-yellow-300" />
              ) : (
                <Menu className="h-6 w-6 text-white" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown / Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-gradient-to-b from-primary-900 via-primary-950 to-emerald-950 border-t border-primary-600/50 px-4 py-5 shadow-2xl space-y-4 max-h-[calc(100vh-4rem)] overflow-y-auto">
          {user ? (
            <>
              {/* User Profile Card */}
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-3.5 bg-white/10 hover:bg-white/15 rounded-2xl border border-white/20 transition group"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="bg-yellow-400 text-primary-950 p-2.5 rounded-xl font-bold">
                    <User className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-sm text-white truncate">{user.name}</div>
                    <div className="text-xs text-emerald-200 truncate">
                      {user.village ? `${user.village}, ${user.district}` : user.phone}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-1.5 flex-shrink-0">
                  <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
                    {user.role}
                  </span>
                  <ChevronRight className="h-4 w-4 text-gray-300 group-hover:translate-x-0.5 transition" />
                </div>
              </Link>

              {/* Navigation Links Grid */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-2.5 p-3 rounded-xl text-xs font-bold transition ${
                    isLinkActive('/')
                      ? 'bg-yellow-400 text-primary-950 shadow-md'
                      : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                  }`}
                >
                  <Home className="h-4 w-4 text-yellow-300 flex-shrink-0" />
                  <span className="truncate">{language === 'en' ? 'Home' : 'मुख्य पान'}</span>
                </Link>

                <Link
                  to="/book-slot"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-2.5 p-3 rounded-xl text-xs font-bold transition ${
                    isLinkActive('/book-slot')
                      ? 'bg-yellow-400 text-primary-950 shadow-md'
                      : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                  }`}
                >
                  <Calendar className="h-4 w-4 text-yellow-300 flex-shrink-0" />
                  <span className="truncate">{t('nav.bookSlot')}</span>
                </Link>

                <Link
                  to="/my-bookings"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-2.5 p-3 rounded-xl text-xs font-bold transition ${
                    isLinkActive('/my-bookings')
                      ? 'bg-yellow-400 text-primary-950 shadow-md'
                      : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                  }`}
                >
                  <Clock className="h-4 w-4 text-yellow-300 flex-shrink-0" />
                  <span className="truncate">{t('nav.mySlots')}</span>
                </Link>

                <Link
                  to="/live-queue"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-2.5 p-3 rounded-xl text-xs font-bold transition ${
                    isLinkActive('/live-queue')
                      ? 'bg-yellow-400 text-primary-950 shadow-md'
                      : 'bg-emerald-600/50 hover:bg-emerald-600/70 text-white border border-emerald-400/40'
                  }`}
                >
                  <span className="relative flex h-2 w-2 flex-shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-300"></span>
                  </span>
                  <span className="truncate">{t('nav.liveQueue')}</span>
                </Link>

                <Link
                  to="/payments"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-2.5 p-3 rounded-xl text-xs font-bold transition ${
                    isLinkActive('/payments')
                      ? 'bg-yellow-400 text-primary-950 shadow-md'
                      : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                  }`}
                >
                  <CreditCard className="h-4 w-4 text-yellow-300 flex-shrink-0" />
                  <span className="truncate">{t('nav.payments')}</span>
                </Link>

                <Link
                  to="/land-records"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-2.5 p-3 rounded-xl text-xs font-bold transition ${
                    isLinkActive('/land-records')
                      ? 'bg-yellow-400 text-primary-950 shadow-md'
                      : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                  }`}
                >
                  <FileText className="h-4 w-4 text-yellow-300 flex-shrink-0" />
                  <span className="truncate">{language === 'en' ? '7/12 Land' : '७/१२ उतारा'}</span>
                </Link>

                <Link
                  to="/helpdesk"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-2.5 p-3 rounded-xl text-xs font-bold transition ${
                    isLinkActive('/helpdesk')
                      ? 'bg-yellow-400 text-primary-950 shadow-md'
                      : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                  }`}
                >
                  <HelpCircle className="h-4 w-4 text-yellow-300 flex-shrink-0" />
                  <span className="truncate">{language === 'en' ? 'Helpdesk' : 'तक्रार निवारण'}</span>
                </Link>

                <Link
                  to="/updates"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-2.5 p-3 rounded-xl text-xs font-bold transition ${
                    isLinkActive('/updates')
                      ? 'bg-yellow-400 text-primary-950 shadow-md'
                      : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                  }`}
                >
                  <Radio className="h-4 w-4 text-yellow-300 animate-pulse flex-shrink-0" />
                  <span className="truncate">{language === 'en' ? 'Live Updates' : 'थेट सूचना'}</span>
                </Link>
              </div>

              {/* Admin & Super Admin Links */}
              {isSuperAdmin && (
                <Link
                  to="/super-admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-3.5 bg-slate-900 hover:bg-black rounded-xl border border-yellow-400/40 text-yellow-300 font-extrabold text-xs shadow-lg transition"
                >
                  <div className="flex items-center space-x-2.5">
                    <Landmark className="h-4 w-4 text-yellow-400" />
                    <span>{language === 'en' ? 'Super Admin Command Portal' : 'जिल्हा कृषी नियंत्रण कक्ष'}</span>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              )}

              {isAdmin && !isSuperAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-3.5 bg-yellow-400 hover:bg-yellow-300 rounded-xl text-primary-950 font-black text-xs shadow-lg transition"
                >
                  <div className="flex items-center space-x-2.5">
                    <LayoutDashboard className="h-4 w-4" />
                    <span>{t('nav.adminPanel')}</span>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              )}

              {/* Prominent Full-Width Logout Button */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-2 py-3.5 px-4 rounded-xl bg-red-600/90 hover:bg-red-600 text-white font-extrabold text-sm transition shadow-lg border border-red-500/50"
              >
                <LogOut className="h-4 w-4" />
                <span>{t('nav.logout')}</span>
              </button>
            </>
          ) : (
            <div className="space-y-3 pt-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 transition"
              >
                {t('nav.login')}
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center py-3 px-4 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-primary-950 font-black text-sm shadow-lg transition"
              >
                {t('nav.register')}
              </Link>
              <Link
                to="/updates"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-emerald-600/40 text-yellow-200 font-bold text-xs border border-emerald-400/30"
              >
                <Radio className="h-4 w-4 text-yellow-300 animate-pulse" />
                <span>{language === 'en' ? 'View Live Mandi Bulletins' : 'थेट शेतकरी सूचना फलक'}</span>
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
