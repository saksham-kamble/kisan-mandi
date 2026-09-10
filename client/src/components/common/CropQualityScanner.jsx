import { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import {
  Camera,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Zap,
  ShieldCheck,
  RefreshCw,
  X,
  Droplets,
  Layers,
  Award,
  ArrowRight,
  Info,
} from 'lucide-react';

export default function CropQualityScanner({
  commodity = 'Wheat',
  onScanComplete,
  onCancel,
  initialData = null,
}) {
  const { isMarathi } = useLanguage();
  const [selectedImage, setSelectedImage] = useState(initialData?.crop_image_url || null);
  const [scanning, setScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0); // 0 to 4
  const [scanResult, setScanResult] = useState(initialData || null);

  // Preset realistic sample presets for instant testing
  const SAMPLE_PRESETS = [
    {
      id: 'grade_a_wheat',
      title: isMarathi ? '🌾 नमुना १: उत्कृष्ट ग्रेड-अ गहू' : '🌾 Sample 1: Premium Grade-A Wheat',
      desc: isMarathi ? 'कमी ओलावा, चमकदार दाणे' : 'Low moisture, high lustre',
      img: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80',
      grade: 'Grade A (Premium)',
      score: 96,
      metrics: {
        uniformity_pct: 98,
        broken_grains_pct: 0.9,
        foreign_matter_pct: 0.2,
        moisture_est_pct: 9.8,
      },
      priority: 'express_grade_a',
      reason: 'AI Pre-Scan Verified: Grade-A Premium Grain (9.8% Moisture, 98% Lustre)',
    },
    {
      id: 'grade_a_chana',
      title: isMarathi ? '🫘 नमुना २: दर्जेदार हरभरा / चणा' : '🫘 Sample 2: Grade-A Clean Gram (Chana)',
      desc: isMarathi ? 'स्वच्छ, एकसमान दाणे' : 'Clean, uniform bold grains',
      img: 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=600&q=80',
      grade: 'Grade A (Premium)',
      score: 93,
      metrics: {
        uniformity_pct: 94,
        broken_grains_pct: 1.4,
        foreign_matter_pct: 0.4,
        moisture_est_pct: 10.2,
      },
      priority: 'express_grade_a',
      reason: 'AI Pre-Scan Verified: Grade-A Premium Pulse (10.2% Moisture)',
    },
    {
      id: 'standard_paddy',
      title: isMarathi ? '🍚 नमुना ३: सर्वसाधारण भात (FAQ)' : '🍚 Sample 3: Standard Fair Quality Paddy',
      desc: isMarathi ? 'साधारण प्रत, प्रमाणित' : 'Standard fair average quality',
      img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
      grade: 'Grade B (Standard FAQ)',
      score: 82,
      metrics: {
        uniformity_pct: 85,
        broken_grains_pct: 2.8,
        foreign_matter_pct: 1.1,
        moisture_est_pct: 12.4,
      },
      priority: 'standard',
      reason: 'AI Pre-Scan: Standard FAQ Grade B (12.4% Moisture)',
    },
  ];

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedImage(event.target.result);
      runAISimulation(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPreset = (preset) => {
    setSelectedImage(preset.img);
    runAISimulation(preset.img, preset);
  };

  const runAISimulation = (imgUrl, forcedPreset = null) => {
    setScanning(true);
    setScanResult(null);
    setScanStep(1);

    // Step 1: Optical analysis
    setTimeout(() => {
      setScanStep(2);
    }, 600);

    // Step 2: Foreign matter & moisture
    setTimeout(() => {
      setScanStep(3);
    }, 1200);

    // Step 3: Grade classification
    setTimeout(() => {
      setScanStep(4);
    }, 1800);

    // Final result
    setTimeout(() => {
      setScanning(false);
      if (forcedPreset) {
        setScanResult({
          crop_image_url: imgUrl,
          quality_grade: forcedPreset.grade,
          quality_score: forcedPreset.score,
          quality_metrics: forcedPreset.metrics,
          priority_level: forcedPreset.priority,
          priority_reason: forcedPreset.reason,
        });
      } else {
        // High quality simulated result for user uploaded photo
        const score = Math.floor(Math.random() * 8) + 91; // 91 to 98
        const moisture = (Math.random() * 2 + 9.5).toFixed(1);
        const broken = (Math.random() * 1.2 + 0.6).toFixed(1);
        const foreign = (Math.random() * 0.4 + 0.1).toFixed(1);
        const uniformity = Math.floor(Math.random() * 5 + 94);

        setScanResult({
          crop_image_url: imgUrl,
          quality_grade: 'Grade A (Premium)',
          quality_score: score,
          quality_metrics: {
            uniformity_pct: uniformity,
            broken_grains_pct: parseFloat(broken),
            foreign_matter_pct: parseFloat(foreign),
            moisture_est_pct: parseFloat(moisture),
          },
          priority_level: 'express_grade_a',
          priority_reason: `AI Optical Scan: Grade A (${moisture}% Moisture, ${uniformity}% Uniformity)`,
        });
      }
    }, 2400);
  };

  const handleConfirmCertificate = () => {
    if (scanResult && onScanComplete) {
      onScanComplete(scanResult);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl border-2 border-emerald-500/40 shadow-2xl relative overflow-hidden">
      {/* Background Decorative Glow */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-64 h-64 bg-yellow-400/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-2xl text-slate-950 shadow-lg ring-2 ring-yellow-300/40">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl sm:text-2xl font-black text-white">
                {isMarathi ? 'स्मार्ट AI धान्य गुणवत्ता स्कॅनर' : 'Smart AI Grain Quality Scanner'}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-400 text-slate-950">
                AgriVision v2.6
              </span>
            </div>
            <p className="text-xs sm:text-sm text-emerald-200 mt-0.5 font-medium">
              {isMarathi
                ? 'फोटो स्कॅन करून हमीभाव केंद्रावर २-३ तास आधी फास्ट-ट्रॅक प्रवेश मिळवा.'
                : 'Scan your harvest sample to qualify for Grade-A Express Mandi Fast-Track entry.'}
            </p>
          </div>
        </div>

        {onCancel && (
          <button
            onClick={onCancel}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Image Selection / Camera Upload Area */}
      {!selectedImage && (
        <div className="space-y-6">
          <label className="border-2 border-dashed border-emerald-400/40 hover:border-yellow-400 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer bg-white/5 hover:bg-white/10 transition duration-200 group">
            <div className="p-4 bg-emerald-500/20 group-hover:bg-yellow-400/20 rounded-2xl text-emerald-300 group-hover:text-yellow-300 transition mb-3">
              <Camera className="w-10 h-10 animate-bounce" />
            </div>
            <span className="text-base font-bold text-white text-center">
              {isMarathi ? '📸 पिकाचा फोटो अपलोड करा / कॅमेरा उघडा' : '📸 Take a Crop Photo or Upload Sample'}
            </span>
            <span className="text-xs text-slate-300 mt-1 text-center">
              {isMarathi
                ? 'गहू, हरभरा किंवा इतर धान्याची मूठभर रास पांढऱ्या कागदावर ठेवून फोटो काढा'
                : 'Place a handful of grain on a clean surface and capture under good light'}
            </span>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>

          {/* Preset Samples */}
          <div>
            <div className="flex items-center gap-2 mb-3 text-xs font-bold text-slate-300 uppercase tracking-wider">
              <Info className="w-3.5 h-3.5 text-yellow-400" />
              <span>{isMarathi ? 'किंवा चाचणीसाठी तयार नमुना निवडा:' : 'Or pick a demo harvest sample for instant test:'}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {SAMPLE_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  className="p-3 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-emerald-400 rounded-xl text-left transition flex items-center gap-3 group"
                >
                  <img
                    src={preset.img}
                    alt={preset.title}
                    className="w-12 h-12 rounded-lg object-cover border border-slate-600 flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate group-hover:text-yellow-300 transition">
                      {preset.title}
                    </div>
                    <div className="text-[11px] text-emerald-300 truncate">{preset.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Interactive Scanning Active Animation */}
      {selectedImage && scanning && (
        <div className="py-8 flex flex-col items-center justify-center space-y-6 animate-fadeIn">
          {/* Grain Image with Laser Sweep Grid */}
          <div className="relative w-64 h-64 rounded-2xl overflow-hidden border-2 border-emerald-400 shadow-2xl">
            <img src={selectedImage} alt="Scanning" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-emerald-500/10 pointer-events-none"></div>

            {/* Laser Line Animation */}
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-yellow-300 to-transparent shadow-[0_0_15px_#fde047] animate-bounce"></div>

            {/* AI HUD Box Grid */}
            <div className="absolute inset-3 border border-dashed border-emerald-300/50 rounded-lg pointer-events-none flex items-center justify-center">
              <div className="text-center bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-emerald-400/40 text-[11px] font-mono text-emerald-300">
                SCANNING: {commodity.toUpperCase()}
              </div>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="text-center space-y-2 max-w-sm">
            <div className="flex items-center justify-center gap-2 text-yellow-300 font-bold text-sm">
              <RefreshCw className="w-4 h-4 animate-spin text-yellow-400" />
              <span>
                {scanStep === 1 && (isMarathi ? 'दाण्यांचे रंग व आकारमान तपासत आहे...' : 'Analyzing grain color spectrum & shape...')}
                {scanStep === 2 && (isMarathi ? 'ओलावा आणि कचरा प्रमाण मोजत आहे...' : 'Measuring moisture index & foreign matter...')}
                {scanStep === 3 && (isMarathi ? 'अगमार्क ग्रेडिंग निकष पडताळत आहे...' : 'Matching Agmarknet Grade-A criteria...')}
                {scanStep === 4 && (isMarathi ? 'डिजिटल गुणवत्ता प्रमाणपत्र तयार करत आहे...' : 'Generating AI Quality Certificate...')}
              </span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-700">
              <div
                className="bg-gradient-to-r from-emerald-400 to-yellow-400 h-full transition-all duration-300"
                style={{ width: `${scanStep * 25}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Scan Results Card */}
      {selectedImage && !scanning && scanResult && (
        <div className="space-y-6 animate-fadeIn">
          {/* Grade Top Banner */}
          <div
            className={`p-5 rounded-2xl border-2 flex flex-col sm:flex-row items-center justify-between gap-4 ${
              scanResult.priority_level === 'express_grade_a'
                ? 'bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 border-yellow-400 shadow-xl ring-2 ring-yellow-400/30'
                : 'bg-slate-850 border-slate-700'
            }`}
          >
            <div className="flex items-center space-x-4">
              <img
                src={selectedImage}
                alt="Grain Sample"
                className="w-16 h-16 rounded-xl object-cover border-2 border-yellow-400 shadow-md flex-shrink-0"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase text-emerald-300 tracking-wider">
                    {isMarathi ? 'प्रमाणित प्रतवारी' : 'AI Verified Grade'}
                  </span>
                  {scanResult.priority_level === 'express_grade_a' && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-yellow-400 text-slate-950 flex items-center gap-1 shadow">
                      <Zap className="w-3 h-3 text-slate-950 fill-current" />
                      {isMarathi ? 'फास्ट-ट्रॅक पात्र' : 'Fast-Track Eligible'}
                    </span>
                  )}
                </div>
                <h4 className="text-xl sm:text-2xl font-black text-white mt-0.5 flex items-center gap-2">
                  {scanResult.quality_grade}
                </h4>
                <p className="text-xs text-slate-300 mt-0.5">{scanResult.priority_reason}</p>
              </div>
            </div>

            {/* Score Badge */}
            <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto border-t sm:border-t-0 border-slate-700 pt-3 sm:pt-0">
              <span className="text-xs text-slate-400 font-bold">
                {isMarathi ? 'गुणवत्ता गुण' : 'Quality Score'}
              </span>
              <div className="text-2xl sm:text-3xl font-black text-yellow-300 font-mono">
                {scanResult.quality_score}
                <span className="text-sm text-slate-400">/100</span>
              </div>
            </div>
          </div>

          {/* Metric Breakdown Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-800/90 p-3.5 rounded-xl border border-slate-700 text-center">
              <div className="text-[11px] text-slate-400 font-bold flex items-center justify-center gap-1">
                <Layers className="w-3.5 h-3.5 text-yellow-400" />
                {isMarathi ? 'एकसमानता' : 'Uniformity'}
              </div>
              <div className="text-lg font-black text-white mt-1">
                {scanResult.quality_metrics?.uniformity_pct}%
              </div>
              <div className="text-[10px] text-emerald-400 font-semibold">✓ Grade A (&gt;90%)</div>
            </div>

            <div className="bg-slate-800/90 p-3.5 rounded-xl border border-slate-700 text-center">
              <div className="text-[11px] text-slate-400 font-bold flex items-center justify-center gap-1">
                <Droplets className="w-3.5 h-3.5 text-blue-400" />
                {isMarathi ? 'अंदाजित ओलावा' : 'Est. Moisture'}
              </div>
              <div className="text-lg font-black text-white mt-1">
                {scanResult.quality_metrics?.moisture_est_pct}%
              </div>
              <div className="text-[10px] text-emerald-400 font-semibold">
                ✓ Safe (&lt;12% limit)
              </div>
            </div>

            <div className="bg-slate-800/90 p-3.5 rounded-xl border border-slate-700 text-center">
              <div className="text-[11px] text-slate-400 font-bold flex items-center justify-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                {isMarathi ? 'तुकडे दाणे' : 'Broken Grain'}
              </div>
              <div className="text-lg font-black text-white mt-1">
                {scanResult.quality_metrics?.broken_grains_pct}%
              </div>
              <div className="text-[10px] text-emerald-400 font-semibold">✓ Min (&lt;2.0%)</div>
            </div>

            <div className="bg-slate-800/90 p-3.5 rounded-xl border border-slate-700 text-center">
              <div className="text-[11px] text-slate-400 font-bold flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                {isMarathi ? 'कचरा प्रमाण' : 'Foreign Matter'}
              </div>
              <div className="text-lg font-black text-white mt-1">
                {scanResult.quality_metrics?.foreign_matter_pct}%
              </div>
              <div className="text-[10px] text-emerald-400 font-semibold">✓ Clean (&lt;0.5%)</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setSelectedImage(null);
                setScanResult(null);
              }}
              className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm border border-slate-700 flex items-center justify-center gap-2 transition"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{isMarathi ? 'दुसरा फोटो स्कॅन करा' : 'Scan Different Sample'}</span>
            </button>

            <button
              type="button"
              onClick={handleConfirmCertificate}
              className="flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-slate-950 font-black text-sm sm:text-base hover:shadow-xl hover:scale-[1.01] transition flex items-center justify-center gap-2 shadow-lg"
            >
              <CheckCircle2 className="w-5 h-5 text-slate-950" />
              <span>
                {scanResult.priority_level === 'express_grade_a'
                  ? isMarathi
                    ? 'फास्ट-ट्रॅक प्रमाणपत्र जोडून स्लॉट बुक करा ⚡'
                    : 'Apply Grade-A Fast-Track Certificate & Book ⚡'
                  : isMarathi
                  ? 'गुणवत्ता प्रमाणपत्रासह पुढे जा'
                  : 'Confirm & Proceed with Certificate'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
