import { useState, useEffect } from 'react';
import { getUpdates, getMSPRates } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import toast from 'react-hot-toast';
import {
  Bell,
  CloudRain,
  TrendingUp,
  ShieldCheck,
  Volume2,
  Search,
  Radio,
  Calendar,
  Building,
  RefreshCw,
  Sparkles,
  AlertTriangle,
  Info,
} from 'lucide-react';

export default function UpdatesPage() {
  const [updates, setUpdates] = useState([]);
  const [mspRates, setMspRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

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
      setUpdates(updatesRes.data.updates || []);
      setMspRates(mspRes.data.rates || []);
    } catch (err) {
      toast.error('Failed to load mandi updates');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
    toast.success(isMarathi ? 'माहिती अद्यतनित झाली' : 'Updates refreshed');
  };

  const playTTS = (text, lang = 'mr-IN') => {
    if (!('speechSynthesis' in window)) {
      toast.error('Audio synthesis is not supported on this device');
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const filteredUpdates = updates.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const query = searchQuery.toLowerCase();
    const matchesQuery =
      !searchQuery ||
      item.title?.toLowerCase().includes(query) ||
      item.title_marathi?.toLowerCase().includes(query) ||
      item.content?.toLowerCase().includes(query) ||
      item.content_marathi?.toLowerCase().includes(query);

    return matchesCategory && matchesQuery;
  });

  const getCategoryInfo = (category) => {
    switch (category) {
      case 'weather_advisory':
        return {
          labelEn: 'Weather & Harvesting Advisory',
          labelMr: 'हवामान व काढणी सल्ला',
          icon: <CloudRain className="w-5 h-5 text-blue-600" />,
          bgColor: 'bg-blue-50 text-blue-800 border-blue-200',
        };
      case 'msp_update':
        return {
          labelEn: 'MSP Revision & Price Bonus',
          labelMr: 'हमीभाव दर व बोनस सूचना',
          icon: <TrendingUp className="w-5 h-5 text-emerald-600" />,
          bgColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        };
      case 'gov_scheme':
        return {
          labelEn: 'Government Scheme (PM-AASHA/PSS)',
          labelMr: 'शासकीय योजना (PM-AASHA)',
          icon: <ShieldCheck className="w-5 h-5 text-purple-600" />,
          bgColor: 'bg-purple-50 text-purple-800 border-purple-200',
        };
      default:
        return {
          labelEn: 'Mandi Operational Notice',
          labelMr: 'मंडी कामकाज नोटीस',
          icon: <Bell className="w-5 h-5 text-amber-600" />,
          bgColor: 'bg-amber-50 text-amber-800 border-amber-200',
        };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Hero */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-2.5 bg-primary-100 text-primary-800 rounded-2xl">
                <Radio className="h-7 w-7 text-primary-800 animate-pulse" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
                {isMarathi ? 'थेट कृषी सूचना व हवामान सल्ला केंद्र' : 'Live Mandi Updates & Weather Bulletins'}
              </h1>
            </div>
            <p className="text-sm text-gray-600 mt-1 max-w-2xl">
              {isMarathi
                ? 'शासकीय हमीभाव (MSP) दर, अवकाळी पाऊस अंदाज, पीक साठवणूक सूचना आणि नवीन योजनांची अधिकृत माहिती.'
                : 'Real-time government MSP rates, unseasonal weather alerts, crop storage advisories, and PM-AASHA updates.'}
            </p>
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-2xl transition shadow-sm text-xs flex-shrink-0"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {isMarathi ? 'अद्ययावत करा' : 'Refresh Feed'}
          </button>
        </div>

        {/* Live MSP Grid Cards */}
        {mspRates.length > 0 && (
          <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-yellow-400 text-slate-950 rounded-xl font-black text-xs uppercase">
                  MSP 2024-25
                </span>
                <h2 className="text-base sm:text-lg font-black text-white">
                  {isMarathi ? 'शासकीय हमीभाव (MSP) अधिकृत दर' : 'Current Mandated MSP Price Matrix'}
                </h2>
              </div>
              <span className="text-xs text-slate-400 font-medium">
                {isMarathi ? 'किंमत प्रती क्विंटल' : 'Rates per Quintal (100 kg)'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {mspRates.map((r, idx) => (
                <div
                  key={idx}
                  className="bg-slate-800/80 border border-slate-700/60 p-3.5 rounded-2xl space-y-1 hover:border-yellow-400/50 transition"
                >
                  <div className="text-xs text-yellow-300 font-bold truncate">
                    {isMarathi ? r.commodity_name_mr || r.commodity_name : r.commodity_name}
                  </div>
                  <div className="text-xl font-black text-white font-mono">
                    ₹{r.msp_price_per_quintal}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Max Moisture: {r.max_moisture_percentage}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters and Search Bar */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl shadow-md border-2 border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
            {[
              { id: 'all', labelEn: 'All Updates', labelMr: 'सर्व सूचना' },
              { id: 'weather_advisory', labelEn: '🌦️ Weather', labelMr: '🌦️ हवामान सल्ला' },
              { id: 'msp_update', labelEn: '💰 MSP & Bonus', labelMr: '💰 हमीभाव' },
              { id: 'gov_scheme', labelEn: '📜 Schemes', labelMr: '📜 योजना' },
              { id: 'mandi_notice', labelEn: '📢 Notices', labelMr: '📢 नोटीस' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                  selectedCategory === cat.id
                    ? 'bg-primary-700 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {isMarathi ? cat.labelMr : cat.labelEn}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder={isMarathi ? 'सूचना शोधा...' : 'Search bulletins...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-xl text-xs font-bold focus:border-primary-600 focus:outline-none"
            />
          </div>
        </div>

        {/* Advisories Grid List */}
        {loading ? (
          <div className="py-20 text-center text-gray-500 font-bold">
            {isMarathi ? 'माहिती लोड होत आहे...' : 'Loading advisories and announcements...'}
          </div>
        ) : filteredUpdates.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-lg border-2 border-gray-100 space-y-3">
            <Info className="h-16 w-16 text-primary-600 mx-auto" />
            <h3 className="text-xl font-bold text-gray-900">
              {isMarathi ? 'कोणतीही सूचना आढळली नाही' : 'No bulletins found'}
            </h3>
            <p className="text-sm text-gray-500">
              {isMarathi
                ? 'निवडलेल्या श्रेणीत सध्या कोणतीही नोटीस नाही.'
                : 'No announcements match your current filter or search criteria.'}
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {filteredUpdates.map((item) => {
              const catInfo = getCategoryInfo(item.category);
              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-3xl p-6 sm:p-7 shadow-xl border-2 transition-all duration-200 hover:shadow-2xl space-y-4 ${
                    item.priority === 'alert'
                      ? 'border-red-300 bg-gradient-to-br from-red-50/30 to-white'
                      : item.priority === 'urgent'
                      ? 'border-amber-300 bg-gradient-to-br from-amber-50/30 to-white'
                      : 'border-gray-100'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-100">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-xs font-extrabold px-3 py-1 rounded-xl border flex items-center gap-1.5 ${catInfo.bgColor}`}
                      >
                        {catInfo.icon}
                        {isMarathi ? catInfo.labelMr : catInfo.labelEn}
                      </span>

                      {item.priority !== 'normal' && (
                        <span
                          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                            item.priority === 'alert'
                              ? 'bg-red-600 text-white animate-pulse'
                              : 'bg-amber-500 text-white'
                          }`}
                        >
                          {item.priority}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() =>
                          playTTS(
                            isMarathi && item.content_marathi
                              ? `${item.title_marathi || item.title}. ${item.content_marathi}`
                              : `${item.title}. ${item.content}`,
                            isMarathi ? 'mr-IN' : 'en-IN'
                          )
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 rounded-xl text-xs font-bold transition"
                      >
                        <Volume2 className="w-4 h-4 text-emerald-700" />
                        <span>{isMarathi ? 'ध्वनी ऐका' : 'Listen Audio'}</span>
                      </button>

                      <span className="text-xs text-gray-400 font-medium">
                        {new Date(item.created_at).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-gray-900 leading-snug">
                      {isMarathi && item.title_marathi ? item.title_marathi : item.title}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-700 mt-2 whitespace-pre-wrap leading-relaxed">
                      {isMarathi && item.content_marathi ? item.content_marathi : item.content}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100 font-semibold gap-2">
                    <span>
                      🏛️ {isMarathi ? 'प्रसारक:' : 'Issued by:'} {item.created_by || 'District Nodal Office'}
                    </span>
                    <span>
                      📍 {item.centre_name || (isMarathi ? 'महाराष्ट्र राज्यव्यापी प्रसारण' : 'Statewide Maharashtra Broadcast')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
