import React from 'react';
import { Zap, AlertTriangle, CheckCircle2, Award, Clock } from 'lucide-react';

/**
 * Standard Status Badge for Mandi Bookings
 */
export function StatusBadge({ status, isMarathi = false }) {
  const configs = {
    booked: {
      label: isMarathi ? 'बुक केले' : 'Booked',
      cls: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: '○',
    },
    checked_in: {
      label: isMarathi ? 'चेक-इन' : 'Checked In',
      cls: 'bg-amber-100 text-amber-900 border-amber-300',
      icon: '●',
    },
    in_progress: {
      label: isMarathi ? 'प्रक्रियेत' : 'In Progress',
      cls: 'bg-purple-100 text-purple-800 border-purple-200 animate-pulse',
      icon: '⏳',
    },
    completed: {
      label: isMarathi ? 'पूर्ण झाले' : 'Completed',
      cls: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      icon: '✓',
    },
    cancelled: {
      label: isMarathi ? 'रद्द केले' : 'Cancelled',
      cls: 'bg-red-100 text-red-800 border-red-200',
      icon: '✕',
    },
  };

  const config = configs[status] || {
    label: status,
    cls: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: '•',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${config.cls}`}
    >
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
}

/**
 * Standard Priority Badge for Fast-Track Queue
 */
export function PriorityBadge({ priorityLevel, isMarathi = false }) {
  if (priorityLevel === 'express_grade_a') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black uppercase bg-yellow-400 text-slate-950 shadow-sm border border-yellow-500">
        <Zap className="w-3.5 h-3.5 fill-current" />
        {isMarathi ? 'फास्ट-ट्रॅक' : 'Fast-Track'}
      </span>
    );
  }

  if (priorityLevel === 'moisture_urgent') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black uppercase bg-red-600 text-white shadow-sm">
        <AlertTriangle className="w-3.5 h-3.5" />
        {isMarathi ? 'तातडीचे' : 'Urgent'}
      </span>
    );
  }

  return null;
}

/**
 * Standard Quality Grade Certificate Tag
 */
export function QualityGradeTag({ grade, score, isMarathi = false }) {
  if (!grade) return null;

  const isGradeA = grade === 'A' || grade === 'Grade A (Premium)';
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-extrabold border ${
        isGradeA
          ? 'bg-amber-50 text-amber-900 border-amber-300'
          : 'bg-gray-50 text-gray-800 border-gray-300'
      }`}
    >
      <Award className="w-3.5 h-3.5 text-amber-600" />
      <span>{isMarathi ? 'श्रेणी' : 'Grade'}: {grade}</span>
      {score && <span className="text-gray-500 font-normal">({score} pts)</span>}
    </span>
  );
}

/**
 * Standard Web Audio chime for queue updates
 */
export function playQueueChime() {
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
    // Audio policy might require user click first
  }
}

/**
 * Standard Formatters
 */
export const formatKg = (qty) => `${Number(qty || 0).toLocaleString('en-IN')} kg`;
export const formatCurrency = (amt) => `₹${Number(amt || 0).toLocaleString('en-IN')}`;

/**
 * Standard Pure Algorithm for AI Grain Quality Analysis
 */
export function evaluateGrainQuality({ commodity, grainUniformity = 94, moisture = 10.8, foreignMatter = 1.2, brokenKernels = 2.1 }) {
  // Moisture penalty
  const moisturePenalty = moisture > 12 ? (moisture - 12) * 5 : 0;
  // Foreign matter penalty
  const foreignPenalty = foreignMatter * 3;
  // Broken kernel penalty
  const brokenPenalty = brokenKernels * 2;

  // Composite Score out of 100
  const score = Math.max(40, Math.min(98, Math.round(grainUniformity - moisturePenalty - foreignPenalty - brokenPenalty)));

  let grade = 'Grade B (FAQ Standard)';
  let isPriority = false;
  let summary = 'Standard FAQ quality meeting mandi fair average quality specs.';

  if (score >= 88 && moisture <= 12.0) {
    grade = 'Grade A (Premium)';
    isPriority = true;
    summary = 'Super-clean premium grain with optimal moisture. Qualified for Grade-A Fast-Track Express E-Token.';
  } else if (score < 70 || moisture > 14.0) {
    grade = 'Grade C (Needs Pre-Cleaning)';
    isPriority = false;
    summary = 'Slightly high moisture or foreign particles. Recommended to sun-dry before weighing.';
  }

  return {
    score,
    grade,
    isPriority,
    summary,
    metrics: {
      uniformity: `${grainUniformity}%`,
      moisture: `${moisture}%`,
      foreignMatter: `${foreignMatter}%`,
      brokenKernels: `${brokenKernels}%`,
    },
  };
}
