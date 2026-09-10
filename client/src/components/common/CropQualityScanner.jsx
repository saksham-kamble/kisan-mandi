import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { evaluateGrainQuality, PriorityBadge, QualityGradeTag } from '../../utils/helpers';
import {
  Camera,
  Upload,
  Sparkles,
  CheckCircle2,
  Zap,
  RefreshCw,
  X,
  Droplets,
  Layers,
  ArrowRight,
} from 'lucide-react';

const SAMPLES = [
  {
    id: 'sample_wheat',
    name: 'Wheat (Grade A)',
    img: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80',
    metrics: { grainUniformity: 98, moisture: 9.8, foreignMatter: 0.2, brokenKernels: 0.9 },
  },
  {
    id: 'sample_chana',
    name: 'Gram / Chana (Grade A)',
    img: 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=600&q=80',
    metrics: { grainUniformity: 95, moisture: 10.2, foreignMatter: 0.4, brokenKernels: 1.2 },
  },
  {
    id: 'sample_paddy',
    name: 'Paddy / Rice (Standard)',
    img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
    metrics: { grainUniformity: 84, moisture: 12.8, foreignMatter: 1.2, brokenKernels: 2.8 },
  },
];

export default function CropQualityScanner({ commodity = 'Wheat', onScanComplete, onCancel, initialData = null }) {
  const { isMarathi } = useLanguage();
  const [image, setImage] = useState(initialData?.crop_image_url || null);
  const [scanning, setScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [result, setResult] = useState(initialData || null);

  const runScan = (imgUrl, metricsData = null) => {
    setImage(imgUrl);
    setScanning(true);
    setResult(null);
    setScanStep(1);

    setTimeout(() => setScanStep(2), 600);
    setTimeout(() => setScanStep(3), 1200);

    setTimeout(() => {
      setScanning(false);
      const metrics = metricsData || {
        grainUniformity: Math.floor(Math.random() * 4 + 94),
        moisture: parseFloat((Math.random() * 1.5 + 9.8).toFixed(1)),
        foreignMatter: parseFloat((Math.random() * 0.4 + 0.2).toFixed(1)),
        brokenKernels: parseFloat((Math.random() * 1 + 0.8).toFixed(1)),
      };

      const evalResult = evaluateGrainQuality({ commodity, ...metrics });

      setResult({
        crop_image_url: imgUrl,
        quality_grade: evalResult.grade,
        quality_score: evalResult.score,
        quality_metrics: evalResult.metrics,
        priority_level: evalResult.isPriority ? 'express_grade_a' : 'standard',
        priority_reason: `AI Optical Check: ${evalResult.grade} (${evalResult.score}/100 pts, ${metrics.moisture}% moisture)`,
      });
    }, 1800);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => runScan(ev.target.result);
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl border-2 border-emerald-500/40 shadow-2xl relative">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-2xl text-slate-950 shadow-lg">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              {isMarathi ? 'स्मार्ट AI धान्य गुणवत्ता स्कॅनर' : 'Smart AI Grain Quality Scanner'}
            </h3>
            <p className="text-xs sm:text-sm text-emerald-200 mt-0.5">
              {isMarathi
                ? 'फोटो स्कॅन करून हमीभाव केंद्रावर २-३ तास आधी फास्ट-ट्रॅक प्रवेश मिळवा.'
                : 'Scan your harvest sample to qualify for Grade-A Express Mandi Fast-Track entry.'}
            </p>
          </div>
        </div>
        {onCancel && (
          <button onClick={onCancel} className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Main Scanner Body */}
      <div className="grid md:grid-cols-2 gap-6 items-center">
        {/* Left: Viewport / Image Box */}
        <div className="relative aspect-video sm:aspect-square rounded-2xl bg-black/40 border-2 border-dashed border-emerald-500/40 overflow-hidden flex flex-col items-center justify-center p-4">
          {image ? (
            <img src={image} alt="Crop sample" className="w-full h-full object-cover rounded-xl" />
          ) : (
            <div className="text-center space-y-3">
              <Camera className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
              <p className="text-sm text-gray-300 font-bold">
                {isMarathi ? 'धान्याचा स्पष्ट फोटो निवडा किंवा अपलोड करा' : 'Upload or select a clear grain photo'}
              </p>
            </div>
          )}

          {/* Laser Scanning Animation */}
          {scanning && (
            <div className="absolute inset-0 bg-emerald-500/20 backdrop-blur-[2px] flex flex-col items-center justify-center p-6">
              <div className="w-full h-1 bg-yellow-400 shadow-[0_0_15px_#facc15] animate-pulse absolute top-1/2 -translate-y-1/2"></div>
              <div className="bg-black/80 px-4 py-2 rounded-xl text-xs font-mono font-bold text-yellow-300 border border-yellow-400/40 animate-bounce">
                {scanStep === 1 && (isMarathi ? 'दाण्यांची रचना विश्लेषण...' : 'Analyzing grain structure...')}
                {scanStep === 2 && (isMarathi ? 'ओलावा आणि कचरा तपासणी...' : 'Measuring moisture index...')}
                {scanStep === 3 && (isMarathi ? 'ग्रेड प्रमाणपत्र तयार करत आहे...' : 'Generating quality certificate...')}
              </div>
            </div>
          )}
        </div>

        {/* Right: Actions / Results */}
        <div className="space-y-4">
          {!result && !scanning && (
            <div className="space-y-3">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-300">
                {isMarathi ? 'त्वरित चाचणी नमुने (Quick Presets)' : 'Quick Sample Presets'}
              </span>
              <div className="grid grid-cols-1 gap-2">
                {SAMPLES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => runScan(s.img, s.metrics)}
                    className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-left flex items-center justify-between transition"
                  >
                    <div className="flex items-center gap-3">
                      <img src={s.img} alt={s.name} className="w-10 h-10 rounded-lg object-cover" />
                      <div>
                        <p className="text-sm font-bold text-white">{s.name}</p>
                        <p className="text-xs text-gray-400">Moisture: {s.metrics.moisture}%</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-yellow-300 bg-yellow-400/10 px-2 py-1 rounded">Select →</span>
                  </button>
                ))}
              </div>

              <div className="pt-2">
                <label className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg transition">
                  <Upload className="w-4 h-4" />
                  <span>{isMarathi ? 'स्वतःचा फोटो अपलोड करा' : 'Upload Grain Photo'}</span>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
            </div>
          )}

          {result && (
            <div className="bg-white/10 p-5 rounded-2xl border border-emerald-400/30 space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-300 uppercase">AI Quality Certificate</span>
                  <h4 className="text-xl font-black text-yellow-300">{result.quality_grade}</h4>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-300">Score</span>
                  <p className="text-2xl font-black text-emerald-400">{result.quality_score}/100</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-medium bg-black/30 p-3 rounded-xl">
                <p className="text-gray-300 flex items-center gap-1">
                  <Droplets className="w-3.5 h-3.5 text-blue-400" /> Moisture: <strong className="text-white">{result.quality_metrics?.moisture}</strong>
                </p>
                <p className="text-gray-300 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-yellow-400" /> Uniformity: <strong className="text-white">{result.quality_metrics?.uniformity}</strong>
                </p>
              </div>

              {result.priority_level === 'express_grade_a' ? (
                <div className="p-3 bg-yellow-400/20 border border-yellow-400/50 rounded-xl flex items-center gap-2 text-yellow-200 text-xs font-bold">
                  <Zap className="w-4 h-4 text-yellow-400 fill-current flex-shrink-0" />
                  <span>{isMarathi ? 'अभिनंदन! आपल्याला ग्रेड-अ फास्ट-ट्रॅक ई-टोकन प्राप्त होईल.' : 'Qualified for Grade-A Fast-Track Mandi Priority Pass!'}</span>
                </div>
              ) : (
                <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-xs text-gray-300 font-medium">
                  {isMarathi ? 'प्रमाणित FAQ गुणवत्ता. सामान्य रांगेत प्रवेश मिळेल.' : 'Standard FAQ quality. Assigned to standard queue.'}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setResult(null)}
                  className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl flex items-center gap-1 transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> {isMarathi ? 'पुन्हा स्कॅन' : 'Re-Scan'}
                </button>
                <button
                  onClick={() => onScanComplete && onScanComplete(result)}
                  className="flex-1 py-2.5 bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 font-black text-sm rounded-xl shadow-lg hover:from-yellow-300 hover:to-amber-400 flex items-center justify-center gap-1 transition"
                >
                  <span>{isMarathi ? 'प्रमाणपत्र स्वीकारा' : 'Accept & Apply Pass'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
