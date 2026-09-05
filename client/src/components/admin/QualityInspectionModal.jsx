import { useState, useEffect } from 'react';
import { X, Droplets, Award, Calculator, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function QualityInspectionModal({ isOpen, onClose, onSubmit, booking, mspRate, maxMoisture }) {
  const { isMarathi } = useLanguage();
  const [formData, setFormData] = useState({
    actual_quantity_kg: '',
    actual_moisture_percentage: '',
    quality_grade: 'A',
    quality_notes: ''
  });

  const [calculation, setCalculation] = useState({
    moistureDeduction: 0,
    netWeight: 0,
    grossAmount: 0,
    qualityDeduction: 0,
    deductionAmount: 0,
    finalAmount: 0
  });

  useEffect(() => {
    if (formData.actual_quantity_kg && formData.actual_moisture_percentage) {
      calculatePayment();
    }
  }, [formData]);

  const calculatePayment = () => {
    const grossWeight = parseFloat(formData.actual_quantity_kg) || 0;
    const moisture = parseFloat(formData.actual_moisture_percentage) || 0;
    const maxAllowed = maxMoisture || 12.0;

    // Moisture deduction
    let moistureDeduction = 0;
    if (moisture > maxAllowed) {
      const excess = moisture - maxAllowed;
      moistureDeduction = (grossWeight * excess * 0.5) / 100;
    }

    const netWeight = grossWeight - moistureDeduction;

    // Quality deduction
    const qualityDeductions = { A: 0, B: 2, C: 5, Rejected: 100 };
    const qualityDeduction = qualityDeductions[formData.quality_grade] || 0;

    // Amounts
    const quintals = netWeight / 100;
    const grossAmount = quintals * (mspRate || 2275);
    const deductionAmount = (grossAmount * qualityDeduction) / 100;
    const finalAmount = grossAmount - deductionAmount;

    setCalculation({
      moistureDeduction,
      netWeight,
      grossAmount,
      qualityDeduction,
      deductionAmount,
      finalAmount
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.actual_quantity_kg || !formData.actual_moisture_percentage) {
      alert(isMarathi ? 'कृपया सर्व आवश्यक फील्ड भरा' : 'Please fill all required fields');
      return;
    }
    onSubmit(formData);
  };

  const getMoistureStatus = () => {
    const moisture = parseFloat(formData.actual_moisture_percentage) || 0;
    const maxAllowed = maxMoisture || 12.0;
    if (moisture <= maxAllowed) return { color: 'emerald', text: '✓ Within Limit', bg: 'bg-emerald-50' };
    if (moisture <= maxAllowed + 2) return { color: 'yellow', text: '⚠️ Slightly Over', bg: 'bg-yellow-50' };
    return { color: 'red', text: '⚠️ Excess', bg: 'bg-red-50' };
  };

  if (!isOpen) return null;

  const moistureStatus = getMoistureStatus();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-primary-700 to-emerald-700 text-white px-6 py-4 flex justify-between items-center rounded-t-2xl">
          <div>
            <h2 className="text-xl font-black">
              {isMarathi ? 'गुणवत्ता तपासणी व वजन' : 'Quality Inspection & Weighment'}
            </h2>
            <p className="text-sm text-emerald-100 mt-0.5">
              {booking.token_number} • {booking.commodity}
            </p>
          </div>
          <button onClick={onClose} className="text-white hover:bg-white/20 rounded-lg p-2 transition">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Weight Input */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              {isMarathi ? 'वजन काट्यावरील खरे वजन (किलो)' : 'Verified Scale Weight (kg)'} <span className="text-red-600">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.actual_quantity_kg}
              onChange={(e) => setFormData({ ...formData, actual_quantity_kg: e.target.value })}
              className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-lg font-bold focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder={isMarathi ? 'उदा. 1000' : 'e.g. 1000'}
              required
            />
          </div>

          {/* Moisture Input */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              {isMarathi ? 'आर्द्रता टक्केवारी (%)' : 'Moisture Percentage (%)'} <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <Droplets className="absolute left-3 top-3.5 h-5 w-5 text-blue-600" />
              <input
                type="number"
                step="0.1"
                value={formData.actual_moisture_percentage}
                onChange={(e) => setFormData({ ...formData, actual_moisture_percentage: e.target.value })}
                className={`w-full border-2 ${moistureStatus.bg} border-${moistureStatus.color}-300 rounded-xl pl-11 pr-4 py-3 text-lg font-bold focus:ring-2 focus:ring-${moistureStatus.color}-500`}
                placeholder={isMarathi ? 'उदा. 12.5' : 'e.g. 12.5'}
                required
              />
            </div>
            <div className="flex justify-between items-center mt-1.5">
              <span className="text-xs text-gray-600 font-semibold">
                {isMarathi ? 'कमाल मर्यादा' : 'Max Allowed'}: <strong>{maxMoisture || 12.0}%</strong>
              </span>
              <span className={`text-xs font-bold text-${moistureStatus.color}-700`}>
                {moistureStatus.text}
              </span>
            </div>
          </div>

          {/* Quality Grade */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">
              {isMarathi ? 'गुणवत्ता श्रेणी' : 'Quality Grade'} <span className="text-red-600">*</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { value: 'A', label: 'Grade A', desc: isMarathi ? 'कमाल - कपात नाही' : 'Premium - No deduction', color: 'emerald' },
                { value: 'B', label: 'Grade B', desc: isMarathi ? '2% कपात' : '2% deduction', color: 'yellow' },
                { value: 'C', label: 'Grade C', desc: isMarathi ? '5% कपात' : '5% deduction', color: 'orange' },
                { value: 'Rejected', label: isMarathi ? 'नाकारले' : 'Rejected', desc: isMarathi ? 'अस्वीकार्य' : 'Not acceptable', color: 'red' }
              ].map((grade) => (
                <button
                  key={grade.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, quality_grade: grade.value })}
                  className={`p-3 rounded-xl border-2 text-left transition ${
                    formData.quality_grade === grade.value
                      ? `bg-${grade.color}-100 border-${grade.color}-500 ring-2 ring-${grade.color}-500`
                      : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`text-sm font-black ${formData.quality_grade === grade.value ? `text-${grade.color}-800` : 'text-gray-700'}`}>
                    {grade.label}
                  </div>
                  <div className={`text-xs mt-1 ${formData.quality_grade === grade.value ? `text-${grade.color}-700` : 'text-gray-500'}`}>
                    {grade.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Quality Notes */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              {isMarathi ? 'तपासणी टिपा (पर्यायी)' : 'Inspection Notes (Optional)'}
            </label>
            <textarea
              value={formData.quality_notes}
              onChange={(e) => setFormData({ ...formData, quality_notes: e.target.value })}
              className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              rows="2"
              placeholder={isMarathi ? 'उदा. चांगली गुणवत्ता, किंचित फुटलेले दाणे' : 'e.g. Good quality grain, slight broken kernels'}
            />
          </div>

          {/* Live Calculation Preview */}
          {formData.actual_quantity_kg && formData.actual_moisture_percentage && (
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-300 rounded-xl p-5">
              <div className="flex items-center mb-3">
                <Calculator className="h-5 w-5 text-emerald-700 mr-2" />
                <h3 className="font-black text-emerald-900">
                  {isMarathi ? 'देयक गणना पूर्वावलोकन' : 'Payment Calculation Preview'}
                </h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-700 font-semibold">{isMarathi ? 'एकूण वजन' : 'Gross Weight'}:</span>
                  <span className="font-black text-gray-900">{parseFloat(formData.actual_quantity_kg).toFixed(2)} kg</span>
                </div>
                {calculation.moistureDeduction > 0 && (
                  <div className="flex justify-between text-amber-800">
                    <span className="font-semibold">{isMarathi ? 'आर्द्रता वजावट' : 'Moisture Deduction'}:</span>
                    <span className="font-black">- {calculation.moistureDeduction.toFixed(2)} kg</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-emerald-200 pt-2">
                  <span className="text-gray-700 font-semibold">{isMarathi ? 'निव्वळ वजन' : 'Net Weight'}:</span>
                  <span className="font-black text-gray-900">{calculation.netWeight.toFixed(2)} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700 font-semibold">{isMarathi ? 'MSP दर' : 'MSP Rate'}:</span>
                  <span className="font-black text-gray-900">₹{(mspRate || 2275).toLocaleString('en-IN')} / quintal</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700 font-semibold">{isMarathi ? 'एकूण रक्कम' : 'Gross Amount'}:</span>
                  <span className="font-black text-gray-900">₹{calculation.grossAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                </div>
                {calculation.deductionAmount > 0 && (
                  <div className="flex justify-between text-orange-800">
                    <span className="font-semibold">{isMarathi ? 'गुणवत्ता कपात' : 'Quality Deduction'} ({calculation.qualityDeduction}%):</span>
                    <span className="font-black">- ₹{calculation.deductionAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="flex justify-between border-t-2 border-emerald-400 pt-2 mt-2">
                  <span className="text-lg font-black text-emerald-900">{isMarathi ? 'निव्वळ देय रक्कम' : 'Final Payout'}:</span>
                  <span className="text-2xl font-black text-emerald-700">₹{calculation.finalAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl transition"
            >
              {isMarathi ? 'रद्द करा' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-primary-600 hover:from-emerald-700 hover:to-primary-700 text-white font-bold rounded-xl transition shadow-lg"
            >
              {isMarathi ? 'पूर्ण करा व देयक सुरू करा' : 'Complete & Initiate Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
