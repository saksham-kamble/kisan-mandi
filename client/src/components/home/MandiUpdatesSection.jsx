import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUpdates, getMSPRates } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import {
  Bell,
  CloudRain,
  TrendingUp,
  Sparkles,
  Volume2,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Radio,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function MandiUpdatesSection() {
  const [updates, setUpdates] = useState([]);
  const [mspRates, setMspRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isMarathi } = useLanguage();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [updatesRes, mspRes] = await Promise.all([
        getUpdates().catch(() => ({ data: { updates: [] } })),
        getMSPRates().catch(() => ({ data: { rates: [] } })),
      ]);
      setUpdates(updatesRes.data.updates?.slice(0, 4) || []);
      setMspRates(mspRes.data.rates || []);
    } catch (err) {
      console.error('Failed to fetch home updates:', err);
    } finally {
      setLoading(false);
    }
  };

  const playTTS = (text, lang = 'mr-IN') => {
    if (!('speechSynthesis' in window)) {
      toast.error('Audio not supported in this browser');
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'weather_advisory':
        return <CloudRain className="w-5 h-5 text-blue-600" />;
      case 'msp_update':
        return <TrendingUp className="w-5 h-5 text-emerald-600" />;
      case 'gov_scheme':
        return <ShieldCheck className="w-5 h-5 text-purple-600" />;
      default:
        return <Bell className="w-5 h-5 text-amber-600" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Live MSP Ticker Bar */}
      {mspRates.length > 0 && (
        <div className="bg-slate-900 text-white rounded-2xl p-3 sm:p-4 mb-8 shadow-xl flex items-center gap-3 overflow-hidden border border-slate-800">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-yellow-400 text-slate-950 rounded-xl font-black text-xs uppercase flex-shrink-0 tracking-wider">
            <Radio className="w-3.5 h-3.5 animate-pulse text-red-600" />
            {isMarathi ? 'हमीभाव दर' : 'Live MSP'}
          </div>
          <div className="flex items-center gap-6 overflow-x-auto no-scrollbar py-1 text-xs sm:text-sm font-semibold whitespace-nowrap">
            {mspRates.map((r, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-yellow-300 font-bold">
                  {isMarathi ? r.commodity_name_mr || r.commodity_name : r.commodity_name}:
                </span>
                <span className="font-mono font-black text-white">₹{r.msp_price_per_quintal}/Qt</span>
                <span className="text-slate-500">•</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary-700 font-black text-xs uppercase tracking-widest">
            <Sparkles className="w-4 h-4 text-yellow-500" />
            {isMarathi ? 'थेट कृषी सूचना व हवामान सल्ला' : 'Live Mandi Broadcast & Advisories'}
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-1">
            {isMarathi ? 'अधिकृत शेतकरी सूचना फलक' : 'Official Mandi Announcements'}
          </h2>
        </div>

        <Link
          to="/updates"
          className="inline-flex items-center text-sm font-black text-primary-700 hover:text-primary-800 group"
        >
          {isMarathi ? 'सर्व सूचना पहा' : 'View All Bulletins'}
          <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Grid of Update Cards */}
      {loading ? (
        <div className="py-12 text-center text-gray-500 font-bold">
          {isMarathi ? 'सूचना लोड होत आहेत...' : 'Loading advisories...'}
        </div>
      ) : updates.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 text-center border-2 border-gray-100 shadow-md">
          <p className="text-gray-500 font-semibold">
            {isMarathi
              ? 'सध्या कोणतीही नवीन सूचना नाही. सर्व केंद्रे सुरळीत कार्यरत आहेत.'
              : 'No new alerts posted. All mandis are operating normally.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {updates.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-3xl p-6 border-2 transition-all duration-200 hover:shadow-xl space-y-3 ${
                item.priority === 'alert'
                  ? 'border-red-300 bg-red-50/20'
                  : item.priority === 'urgent'
                  ? 'border-amber-300 bg-amber-50/20'
                  : 'border-gray-100'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-gray-50 rounded-xl border border-gray-200">
                    {getCategoryIcon(item.category)}
                  </div>
                  <span className="text-[11px] font-black uppercase text-gray-700 tracking-wider">
                    {item.category.replace('_', ' ')}
                  </span>
                  {item.priority !== 'normal' && (
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                        item.priority === 'alert'
                          ? 'bg-red-600 text-white animate-pulse'
                          : 'bg-amber-500 text-white'
                      }`}
                    >
                      {item.priority}
                    </span>
                  )}
                </div>

                <button
                  onClick={() =>
                    playTTS(
                      isMarathi && item.content_marathi
                        ? `${item.title_marathi || item.title}. ${item.content_marathi}`
                        : `${item.title}. ${item.content}`,
                      isMarathi ? 'mr-IN' : 'en-IN'
                    )
                  }
                  className="p-2 text-gray-500 hover:text-primary-700 hover:bg-primary-50 rounded-xl transition flex items-center gap-1 text-xs font-bold"
                  title="Audio Listen"
                >
                  <Volume2 className="w-4 h-4 text-primary-700" />
                  <span className="hidden sm:inline">{isMarathi ? 'ऐका' : 'Listen'}</span>
                </button>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-black text-gray-900 leading-snug">
                  {isMarathi && item.title_marathi ? item.title_marathi : item.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-1.5 line-clamp-3 leading-relaxed">
                  {isMarathi && item.content_marathi ? item.content_marathi : item.content}
                </p>
              </div>

              <div className="flex items-center justify-between text-[11px] text-gray-400 pt-2 border-t border-gray-100">
                <span>📍 {item.centre_name || (isMarathi ? 'महाराष्ट्र राज्य प्रसारण' : 'Statewide Broadcast')}</span>
                <span>{new Date(item.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
