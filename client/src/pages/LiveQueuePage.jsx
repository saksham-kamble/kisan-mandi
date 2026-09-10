import { useState, useEffect } from 'react';
import { getCentres, getLiveQueue } from '../services/api';
import {
  connectSocket,
  disconnectSocket,
  joinQueueRoom,
  leaveQueueRoom,
  onQueueUpdate,
  offQueueUpdate,
} from '../services/socket';
import { useLanguage } from '../context/LanguageContext';
import toast from 'react-hot-toast';
import { Clock, Users, CheckCircle2, Volume2, VolumeX, Sparkles, MapPin, Zap, Award, AlertTriangle } from 'lucide-react';

export default function LiveQueuePage() {
  const [centres, setCentres] = useState([]);
  const [selectedCentre, setSelectedCentre] = useState(null);
  const [queueData, setQueueData] = useState({
    queue: [],
    currentToken: null,
    stats: { total: 0, completed: 0, waiting: 0 },
  });
  const [loading, setLoading] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const { t, isMarathi } = useLanguage();

  useEffect(() => {
    fetchCentres();
    connectSocket();

    return () => {
      disconnectSocket();
    };
  }, []);

  useEffect(() => {
    if (selectedCentre) {
      fetchQueue(selectedCentre.id);
      joinQueueRoom(selectedCentre.id);

      onQueueUpdate(() => {
        fetchQueue(selectedCentre.id);
        if (soundEnabled) {
          playChime();
        }
      });

      return () => {
        leaveQueueRoom(selectedCentre.id);
        offQueueUpdate();
      };
    }
  }, [selectedCentre, soundEnabled]);

  const playChime = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.log('Audio not allowed yet without user interaction');
    }
  };

  const fetchCentres = async () => {
    try {
      const { data } = await getCentres();
      setCentres(data.centres);
      if (data.centres.length > 0) {
        setSelectedCentre(data.centres[0]);
      }
    } catch (err) {
      toast.error('Failed to load centres');
    }
  };

  const fetchQueue = async (centreId) => {
    setLoading(true);
    try {
      const { data } = await getLiveQueue(centreId);
      setQueueData(data);
    } catch (err) {
      toast.error('Failed to load queue data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary-950 to-slate-900 text-white py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-2xl">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black flex items-center tracking-tight">
              <span className="relative flex h-4 w-4 mr-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 shadow-lg shadow-emerald-500/50"></span>
              </span>
              {t('liveQueue.title')}
            </h1>
            <p className="text-emerald-300 text-sm mt-1">
              {t('liveQueue.subtitle')}
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Audio Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-3 rounded-xl border transition ${
                soundEnabled
                  ? 'bg-emerald-600/30 border-emerald-400/40 text-emerald-300'
                  : 'bg-white/5 border-white/10 text-gray-400'
              }`}
              title={soundEnabled ? 'Chime sound active' : 'Sound muted'}
            >
              {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
            </button>

            {/* Centre Selector */}
            <div className="relative flex-1 md:w-72">
              <select
                value={selectedCentre?.id || ''}
                onChange={(e) => {
                  const centre = centres.find((c) => c.id === parseInt(e.target.value));
                  setSelectedCentre(centre);
                }}
                className="w-full bg-white/10 text-white border-2 border-white/20 rounded-xl shadow-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 p-3 pl-10 text-sm font-semibold transition"
              >
                {centres.map((c) => (
                  <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                    {c.name}
                  </option>
                ))}
              </select>
              <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-emerald-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            label={t('liveQueue.nowServing')}
            value={queueData.currentToken ? queueData.currentToken.token_number : '---'}
            bgColor="bg-gradient-to-br from-amber-500 to-yellow-600 text-white"
            subtext={
              queueData.currentToken?.priority_level === 'express_grade_a'
                ? '⚡ Fast-Track Grade-A'
                : queueData.currentToken?.commodity || t('liveQueue.centreReady')
            }
          />
          <StatCard
            label={t('liveQueue.inQueue')}
            value={queueData.stats.waiting}
            bgColor="bg-white/5 border border-white/10 text-emerald-300"
            subtext={t('liveQueue.farmersWaiting')}
          />
          <StatCard
            label={isMarathi ? 'फास्ट-ट्रॅक टोकन्स' : 'Fast-Track Tokens'}
            value={queueData.stats.priority_count || 0}
            bgColor="bg-gradient-to-br from-emerald-950 to-slate-900 border-2 border-yellow-400/50 text-yellow-300"
            subtext={isMarathi ? 'ग्रेड-अ प्राधान्य रांग' : 'Grade-A Express Triage'}
          />
          <StatCard
            label={t('liveQueue.completedToday')}
            value={queueData.stats.completed}
            bgColor="bg-white/5 border border-white/10 text-green-400"
            subtext={t('liveQueue.procurementsDone')}
          />
        </div>

        {/* Main Live Board Display */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Hero Board: Now Serving */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gradient-to-br from-emerald-800 via-primary-800 to-slate-900 border-2 border-emerald-500/40 rounded-3xl shadow-2xl p-8 sm:p-12 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                <Sparkles className="h-48 w-48 text-yellow-300" />
              </div>

              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-black uppercase tracking-widest">
                  🔔 {t('liveQueue.nowServing')}
                </span>
                {queueData.currentToken?.priority_level === 'express_grade_a' && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-400 text-slate-950 text-xs font-black uppercase tracking-wider shadow-lg animate-pulse">
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    {isMarathi ? 'ग्रेड-अ फास्ट-ट्रॅक' : 'Grade-A Fast-Track'}
                  </span>
                )}
              </div>

              <div className="text-6xl sm:text-7xl md:text-8xl font-black my-4 tracking-wider text-yellow-300 drop-shadow-[0_10px_20px_rgba(253,224,71,0.3)] animate-pulse">
                {queueData.currentToken ? queueData.currentToken.token_number : '---'}
              </div>

              <div className="mt-6 text-xl sm:text-2xl font-bold text-white">
                {queueData.currentToken ? (
                  <div className="space-y-1">
                    <p className="text-yellow-200">{queueData.currentToken.farmer_name}</p>
                    <p className="text-emerald-200 text-lg font-normal">
                      🌾 {queueData.currentToken.commodity}
                      {queueData.currentToken.quality_grade && (
                        <span className="ml-2 text-xs font-bold text-yellow-300 bg-black/40 px-2.5 py-1 rounded-full border border-yellow-400/30">
                          {queueData.currentToken.quality_grade}
                        </span>
                      )}
                    </p>
                  </div>
                ) : (
                  <p className="text-emerald-200 font-normal">
                    {t('liveQueue.noFarmerServing')}
                  </p>
                )}
              </div>
            </div>

            {/* Next in Line Queue List */}
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-xl">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-emerald-400" />
                {t('liveQueue.nextUp')}
              </h2>

              {queueData.queue.filter((b) => ['booked', 'checked_in'].includes(b.status)).length === 0 ? (
                <p className="text-gray-400 text-center py-8">{t('liveQueue.noMoreFarmers')}</p>
              ) : (
                <div className="space-y-3">
                  {queueData.queue
                    .filter((b) => ['booked', 'checked_in'].includes(b.status))
                    .slice(0, 8)
                    .map((item, index) => {
                      const isExpress = item.priority_level === 'express_grade_a';
                      const isUrgent = item.priority_level === 'moisture_urgent';

                      return (
                        <div
                          key={item.id}
                          className={`flex items-center justify-between p-4 rounded-xl transition ${
                            isExpress
                              ? 'bg-gradient-to-r from-yellow-500/10 via-slate-900 to-emerald-950/80 border-2 border-yellow-400/60 shadow-lg'
                              : isUrgent
                              ? 'bg-red-950/30 border border-red-500/50'
                              : 'bg-white/5 hover:bg-white/10 border border-white/5'
                          }`}
                        >
                          <div className="flex items-center space-x-3.5">
                            <span
                              className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm ${
                                isExpress
                                  ? 'bg-yellow-400 text-slate-950 shadow-md font-mono'
                                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                              }`}
                            >
                              {index + 1}
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-lg text-white tracking-wide">
                                  {item.token_number}
                                </span>
                                {isExpress && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-yellow-400 text-slate-950 flex items-center gap-1 shadow-sm">
                                    <Zap className="w-3 h-3 fill-current" />
                                    {isMarathi ? 'फास्ट-ट्रॅक' : 'Fast-Track'}
                                  </span>
                                )}
                                {isUrgent && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-red-600 text-white flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3" />
                                    {isMarathi ? 'तातडीचे' : 'Urgent'}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-emerald-300/80 mt-0.5">
                                {item.farmer_name}{' '}
                                {item.quality_grade && (
                                  <span className="text-yellow-300 font-semibold">• {item.quality_grade}</span>
                                )}
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-sm font-semibold text-gray-200">
                              {item.commodity}
                            </span>
                            <span
                              className={`block text-xs font-bold ${
                                item.status === 'checked_in'
                                  ? 'text-amber-400'
                                  : 'text-gray-400'
                              }`}
                            >
                              {item.status === 'checked_in'
                                ? `● ${t('liveQueue.checkedIn')}`
                                : `○ ${t('liveQueue.booked')}`}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Completed History */}
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-xl flex flex-col">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <CheckCircle2 className="h-5 w-5 mr-2 text-emerald-400" />
              {t('liveQueue.completedToday')}
            </h2>

            {queueData.queue.filter((b) => b.status === 'completed').length === 0 ? (
              <p className="text-gray-400 text-sm py-8 text-center">{t('liveQueue.noCompleted')}</p>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {queueData.queue
                  .filter((b) => b.status === 'completed')
                  .map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-white">{item.token_number}</span>
                        <p className="text-xs text-gray-400">{item.farmer_name}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-semibold text-emerald-300">
                          {item.commodity}
                        </span>
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, bgColor, subtext }) {
  return (
    <div className={`p-5 rounded-2xl shadow-lg ${bgColor} backdrop-blur-sm transition-transform duration-200 hover:scale-[1.02]`}>
      <span className="text-xs font-bold uppercase tracking-wider opacity-80">{label}</span>
      <div className="text-3xl sm:text-4xl font-black my-1 tracking-tight">{value}</div>
      <span className="text-xs opacity-75">{subtext}</span>
    </div>
  );
}
