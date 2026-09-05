import { useState, useEffect } from 'react';
import { getMyPayments, getJFormUrl } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import toast from 'react-hot-toast';
import { CreditCard, CheckCircle2, Clock, AlertTriangle, ArrowRight, ShieldCheck, IndianRupee, FileText, Droplets, Award, FileSpreadsheet } from 'lucide-react';

export default function PaymentTrackPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t, isMarathi } = useLanguage();

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const { data } = await getMyPayments();
      setPayments(data.payments);
    } catch (err) {
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300 uppercase tracking-wider">
            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
            {t('payments.statuses.paid')}
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300 uppercase tracking-wider animate-pulse">
            <Clock className="h-3.5 w-3.5 mr-1" />
            {t('payments.statuses.processing')}
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-black bg-gray-100 text-gray-700 border border-gray-300 uppercase tracking-wider">
            {t('payments.statuses.pending')}
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-black bg-red-100 text-red-800 border border-red-200 uppercase tracking-wider">
            <AlertTriangle className="h-3.5 w-3.5 mr-1" />
            {t('payments.statuses.failed')}
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500 font-bold">{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 flex items-center">
            <CreditCard className="h-9 w-9 mr-3 text-primary-600" />
            {t('payments.title')}
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            {isMarathi ? 'थेट हमीभाव (MSP) देयक स्थिती आणि बँक हस्तांतरण तपशील' : 'Real-time MSP payout status and direct bank transfer records'}
          </p>
        </div>

        {payments.length === 0 ? (
          <div className="bg-white shadow-xl rounded-3xl p-12 text-center border-2 border-gray-100">
            <div className="w-20 h-20 bg-emerald-100 text-primary-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <CreditCard className="h-10 w-10" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {t('payments.noPayments')}
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              {isMarathi
                ? 'मंडीत पीक वजन आणि खरेदी पूर्ण झाल्यानंतर आपले देयक तपशील येथे दिसतील.'
                : 'Payments will appear here once your crop is weighed and procured at the Mandi.'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {payments.map((p) => (
              <div
                key={p.id}
                className="bg-white shadow-xl rounded-2xl overflow-hidden border-2 border-gray-100 hover:border-primary-300 transition-all duration-200"
              >
                {/* Header Bar */}
                <div className="bg-gradient-to-r from-emerald-800 to-primary-800 text-white px-6 py-4 flex flex-wrap justify-between items-center gap-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-black uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-md">
                      {t('payments.token')}
                    </span>
                    <span className="text-2xl font-black tracking-wider text-yellow-300">
                      {p.token_number}
                    </span>
                    <span className="text-sm text-emerald-200 hidden sm:inline">
                      • {p.centre_name} ({p.date})
                    </span>
                  </div>
                  <div>{getStatusBadge(p.status)}</div>
                </div>

                {/* Body Content */}
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-gray-100">
                    <div>
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        {isMarathi ? 'एकूण MSP देयक' : 'Total MSP Payout'}
                      </span>
                      <div className="text-4xl font-black text-primary-700 flex items-center mt-1">
                        {p.amount ? (
                          <>
                            <IndianRupee className="h-8 w-8 mr-1 text-primary-600" />
                            {parseFloat(p.amount).toLocaleString('en-IN')}
                          </>
                        ) : (
                          <span className="text-gray-400 text-2xl font-bold">
                            {isMarathi ? 'वजनाची प्रतीक्षा...' : 'Pending Weighment...'}
                          </span>
                        )}
                      </div>
                    </div>

                    {p.msp_rate && (
                      <div className="bg-amber-50 border border-amber-200 px-4 py-2 rounded-xl text-right">
                        <span className="text-xs font-bold text-amber-800">
                          {t('payments.mspRate')}
                        </span>
                        <p className="text-lg font-black text-amber-900">
                          ₹{p.msp_rate} {t('common.perQuintal')}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* 4 Details Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
                    <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-100">
                      <span className="text-xs font-bold text-emerald-800 block">{t('payments.commodity')}</span>
                      <span className="text-base font-extrabold text-gray-900 mt-1 block">{p.commodity}</span>
                    </div>

                    <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-100">
                      <span className="text-xs font-bold text-emerald-800 block">{t('payments.weight')}</span>
                      <span className="text-base font-extrabold text-gray-900 mt-1 block">
                        {p.actual_quantity_kg ? `${p.actual_quantity_kg} kg` : '---'}
                      </span>
                    </div>

                    <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-100">
                      <span className="text-xs font-bold text-emerald-800 block">{t('payments.reference')}</span>
                      <span className="text-xs font-mono font-bold text-gray-800 mt-1 block truncate">
                        {p.payment_reference || (isMarathi ? 'निर्मित होत आहे...' : 'Generating...')}
                      </span>
                    </div>

                    <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-100">
                      <span className="text-xs font-bold text-emerald-800 block">{t('payments.paidOn')}</span>
                      <span className="text-sm font-extrabold text-gray-900 mt-1 block">
                        {p.paid_at ? new Date(p.paid_at).toLocaleDateString() : (isMarathi ? 'प्रलंबित' : 'Pending')}
                      </span>
                    </div>
                  </div>

                  {/* Quality Inspection Report Section */}
                  {p.quality_grade && (
                    <div className="mt-6 pt-6 border-t border-gray-100">
                      <div className="flex items-center mb-3">
                        <Award className="h-5 w-5 text-emerald-600 mr-2" />
                        <h4 className="font-bold text-gray-900 text-sm">
                          {isMarathi ? 'गुणवत्ता तपासणी अहवाल' : 'Quality Inspection Report'}
                        </h4>
                      </div>

                      <div className="bg-gradient-to-br from-emerald-50/50 to-green-50/50 p-4 rounded-xl border border-emerald-200 space-y-4">
                        {/* Badges Grid */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-white p-3 rounded-lg border border-gray-200">
                            <span className="text-xs text-gray-500 font-bold block">
                              {isMarathi ? 'गुणवत्ता श्रेणी' : 'Quality Grade'}
                            </span>
                            <span className={`text-lg font-black mt-1 inline-flex items-center ${
                              p.quality_grade === 'A' ? 'text-emerald-700' :
                              p.quality_grade === 'B' ? 'text-amber-700' :
                              p.quality_grade === 'C' ? 'text-orange-700' : 'text-red-700'
                            }`}>
                              Grade {p.quality_grade}
                              <span className="text-xs font-semibold ml-2 text-gray-600">
                                {p.quality_grade === 'A' ? '(FAQ - No deduction)' :
                                 p.quality_grade === 'B' ? '(2% deduction)' :
                                 p.quality_grade === 'C' ? '(5% deduction)' : '(Rejected)'}
                              </span>
                            </span>
                          </div>

                          <div className="bg-white p-3 rounded-lg border border-gray-200">
                            <span className="text-xs text-gray-500 font-bold block">
                              {isMarathi ? 'आर्द्रता चाचणी' : 'Moisture Test'}
                            </span>
                            <span className="text-lg font-black text-blue-700 mt-1 inline-flex items-center">
                              <Droplets className="h-4 w-4 mr-1 text-blue-500" />
                              {p.actual_moisture_percentage}%
                              <span className="text-xs font-semibold ml-2 text-gray-600">
                                (Max: {p.max_allowed_moisture_percentage}%)
                              </span>
                            </span>
                          </div>
                        </div>

                        {/* Calculation Breakdown */}
                        <div className="bg-white p-3 rounded-lg border border-gray-200 text-xs space-y-1.5 font-medium text-gray-700">
                          <div className="flex justify-between">
                            <span>{isMarathi ? 'एकूण वजन' : 'Gross Weight'}:</span>
                            <span className="font-bold text-gray-900">{p.actual_quantity_kg} kg</span>
                          </div>
                          {p.moisture_deduction_kg > 0 && (
                            <div className="flex justify-between text-amber-800">
                              <span>{isMarathi ? 'आर्द्रता कपात' : 'Moisture Deduction'}:</span>
                              <span className="font-bold">- {parseFloat(p.moisture_deduction_kg).toFixed(2)} kg</span>
                            </div>
                          )}
                          <div className="flex justify-between border-t border-gray-100 pt-1">
                            <span className="font-bold">{isMarathi ? 'निव्वळ वजन' : 'Net Weight'}:</span>
                            <span className="font-black text-gray-900">{parseFloat(p.net_quantity_kg || p.actual_quantity_kg).toFixed(2)} kg</span>
                          </div>
                          <div className="flex justify-between">
                            <span>{isMarathi ? 'एकूण रक्कम' : 'Gross Amount'}:</span>
                            <span className="font-bold text-gray-900">₹{parseFloat(p.gross_amount || p.amount).toLocaleString('en-IN')}</span>
                          </div>
                          {p.deduction_amount > 0 && (
                            <div className="flex justify-between text-orange-800">
                              <span>{isMarathi ? 'गुणवत्ता कपात' : 'Quality Deduction'} ({p.quality_deduction_percentage}%):</span>
                              <span className="font-bold">- ₹{parseFloat(p.deduction_amount).toLocaleString('en-IN')}</span>
                            </div>
                          )}
                        </div>

                        {p.quality_notes && (
                          <div className="text-xs text-gray-600 bg-white p-2.5 rounded-lg border border-gray-200">
                            <strong>{isMarathi ? 'टिपा' : 'Notes'}:</strong> {p.quality_notes}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* DBT Bank Transfer Info */}
                  {(p.bank_account_number || p.status === 'paid') && (
                    <div className="mt-6 pt-6 border-t border-gray-100">
                      <div className="flex items-center mb-3">
                        <CreditCard className="h-5 w-5 text-primary-600 mr-2" />
                        <h4 className="font-bold text-gray-900 text-sm">
                          {isMarathi ? 'DBT बँक हस्तांतरण तपशील' : 'DBT Bank Transfer Details'}
                        </h4>
                      </div>
                      <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-200 grid grid-cols-2 gap-3">
                        <div>
                          <span className="text-xs font-bold text-blue-800 block">
                            {isMarathi ? 'बँकेचे नाव' : 'Bank Name'}
                          </span>
                          <span className="text-sm font-extrabold text-gray-900 mt-0.5 block">
                            {p.bank_name || '---'}
                          </span>
                        </div>
                        <div>
                          <span className="text-xs font-bold text-blue-800 block">
                            {isMarathi ? 'खाते क्रमांक' : 'Account Number'}
                          </span>
                          <span className="text-sm font-mono font-extrabold text-gray-900 mt-0.5 block">
                            {p.bank_account_number ? `****${p.bank_account_number.slice(-4)}` : '---'}
                          </span>
                        </div>
                        <div>
                          <span className="text-xs font-bold text-blue-800 block">IFSC Code</span>
                          <span className="text-sm font-mono font-extrabold text-gray-900 mt-0.5 block">
                            {p.bank_ifsc || '---'}
                          </span>
                        </div>
                        <div>
                          <span className="text-xs font-bold text-blue-800 block">
                            {isMarathi ? 'हस्तांतरण स्थिती' : 'Transfer Status'}
                          </span>
                          <span className={`text-sm font-extrabold mt-0.5 block ${p.status === 'paid' ? 'text-emerald-700' : 'text-amber-700'}`}>
                            {p.status === 'paid' ? (isMarathi ? '✓ जमा झाले' : '✓ Credited') : (isMarathi ? '⏳ प्रलंबित' : '⏳ Pending')}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Download J-Form Button */}
                  {(p.status === 'processing' || p.status === 'paid') && (
                    <div className="mt-6 pt-6 border-t border-gray-100">
                      <a
                        href={getJFormUrl(p.booking_id)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-primary-600 to-emerald-600 text-white font-bold rounded-xl hover:from-primary-700 hover:to-emerald-700 transition shadow-lg hover:shadow-primary-600/30"
                      >
                        <FileText className="h-5 w-5 mr-2" />
                        {isMarathi ? 'जे-फॉर्म पावती डाउनलोड करा' : 'Download J-Form Receipt'}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
