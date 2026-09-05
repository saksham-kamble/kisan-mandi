import { useState, useEffect } from 'react';
import {
  getMyLandRecords,
  addLandRecord,
  updateLandRecord,
  deleteLandRecord,
} from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import toast from 'react-hot-toast';
import {
  FileText,
  ShieldCheck,
  MapPin,
  Plus,
  CheckCircle2,
  AlertCircle,
  Wheat,
  Edit3,
  Trash2,
  Save,
  X,
  Sparkles,
  HelpCircle,
} from 'lucide-react';

export default function LandRecordsPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeRecord, setActiveRecord] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    survey_number: '',
    village: '',
    taluka: '',
    district: '',
    total_land_acres: '',
    cultivated_area_acres: '',
    crop_sown: 'Wheat',
    season: 'Rabi 2024-25',
  });

  const [editFormData, setEditFormData] = useState({
    survey_number: '',
    village: '',
    taluka: '',
    district: '',
    total_land_acres: '',
    cultivated_area_acres: '',
    crop_sown: 'Wheat',
    season: 'Rabi 2024-25',
  });

  const { isMarathi } = useLanguage();

  const CROP_OPTIONS = [
    { label: 'Wheat (गहू)', value: 'Wheat', yieldKg: 1800 },
    { label: 'Rice / Paddy (भात / धान)', value: 'Rice (Paddy)', yieldKg: 2000 },
    { label: 'Gram / Chana (हरभरा)', value: 'Gram (Chana)', yieldKg: 1000 },
    { label: 'Mustard (मोहरी)', value: 'Mustard', yieldKg: 800 },
    { label: 'Maize (मका)', value: 'Maize', yieldKg: 2200 },
    { label: 'Soybean (सोयाबीन)', value: 'Soybean', yieldKg: 1000 },
    { label: 'Cotton (कापूस)', value: 'Cotton', yieldKg: 900 },
  ];

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const { data } = await getMyLandRecords();
      setRecords(data.land_records || []);
    } catch (err) {
      toast.error('Failed to load 7/12 records');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRecord = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await addLandRecord(formData);
      toast.success(isMarathi ? '७/१२ नोंद यशस्वीरीत्या जोडली!' : '7/12 Land record registered!');
      setShowAddModal(false);
      setFormData({
        survey_number: '',
        village: '',
        taluka: '',
        district: '',
        total_land_acres: '',
        cultivated_area_acres: '',
        crop_sown: 'Wheat',
        season: 'Rabi 2024-25',
      });
      fetchRecords();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add record');
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = (rec) => {
    setActiveRecord(rec);
    setEditFormData({
      survey_number: rec.survey_number || '',
      village: rec.village || '',
      taluka: rec.taluka || '',
      district: rec.district || '',
      total_land_acres: rec.total_land_acres || '',
      cultivated_area_acres: rec.cultivated_area_acres || '',
      crop_sown: rec.crop_sown || 'Wheat',
      season: rec.season || 'Rabi 2024-25',
    });
    setShowEditModal(true);
  };

  const handleUpdateRecord = async (e) => {
    e.preventDefault();
    if (!activeRecord) return;
    try {
      setSaving(true);
      await updateLandRecord(activeRecord.id, editFormData);
      toast.success(
        isMarathi ? '७/१२ नोंद अद्ययावत केली व कोटा पुनर्गणना केली!' : '7/12 record updated & quota recalculated!'
      );
      setShowEditModal(false);
      setActiveRecord(null);
      fetchRecords();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update record');
    } finally {
      setSaving(false);
    }
  };

  const openDeleteModal = (rec) => {
    setActiveRecord(rec);
    setShowDeleteModal(true);
  };

  const handleDeleteRecord = async () => {
    if (!activeRecord) return;
    try {
      setSaving(true);
      await deleteLandRecord(activeRecord.id);
      toast.success(
        isMarathi ? '७/१२ नोंद यशस्वीरीत्या हटवली!' : '7/12 record deleted successfully!'
      );
      setShowDeleteModal(false);
      setActiveRecord(null);
      fetchRecords();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete record');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 sm:p-8 rounded-3xl shadow-xl border-2 border-gray-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-2 bg-emerald-100 text-primary-700 rounded-xl">
                <FileText className="h-6 w-6" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
                {isMarathi ? 'डिजिटल ७/१२ जमीन नोंदणी व कोटा' : 'Digital 7/12 Land Records & Quota'}
              </h1>
            </div>
            <p className="text-sm text-gray-600 mt-1 max-w-2xl">
              {isMarathi
                ? 'महाभूमि पोर्टलशी जोडलेले डिजिटल सातबारा उतारे. शेतकरी जमीन क्षेत्र बदलू शकतात किंवा पीकनिहाय हमीभाव खरेदी कोटा व्यवस्थापित करू शकतात.'
                : 'Government verified 7/12 land records. Manage survey parcels, edit acreage or sown crops, and check real-time MSP procurement allowances.'}
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-5 py-3 bg-gradient-to-r from-primary-600 to-emerald-600 text-white font-bold rounded-2xl hover:from-primary-700 hover:to-emerald-700 transition shadow-lg text-sm flex-shrink-0"
          >
            <Plus className="h-4 w-4 mr-2" />
            {isMarathi ? 'नवीन ७/१२ जोडा' : 'Add 7/12 Record'}
          </button>
        </div>

        {/* Records Grid */}
        {loading ? (
          <div className="py-20 text-center text-gray-500 font-bold">Loading 7/12 records...</div>
        ) : records.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl text-center shadow-lg border-2 border-gray-100 space-y-4">
            <ShieldCheck className="h-16 w-16 text-emerald-600 mx-auto" />
            <h3 className="text-xl font-black text-gray-900">
              {isMarathi ? 'कोणतेही ७/१२ रेकॉर्ड सापडले नाही' : 'No 7/12 records registered'}
            </h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              {isMarathi
                ? 'हमीभाव खरेदीसाठी आपले ७/१२ जमिनीचे क्षेत्र नोंदवा.'
                : 'Add your land parcel details to enable automated MSP quota calculation.'}
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-5 py-2.5 bg-primary-600 text-white font-bold rounded-xl shadow hover:bg-primary-700 transition text-sm"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              {isMarathi ? 'नवीन ७/१२ नोंदवा' : 'Register 7/12 Record'}
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {records.map((rec) => (
              <div
                key={rec.id}
                className="bg-white shadow-xl rounded-3xl overflow-hidden border-2 border-gray-100 hover:border-emerald-300 transition-all duration-200 flex flex-col justify-between"
              >
                {/* Banner */}
                <div>
                  <div className="bg-gradient-to-r from-emerald-800 to-primary-800 text-white px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <ShieldCheck className="h-5 w-5 text-emerald-300" />
                      <span className="font-black text-sm sm:text-base">
                        {isMarathi ? 'गट क्रमांक' : 'Gat / Survey'}: {rec.survey_number}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-black bg-emerald-100 text-emerald-900 px-3 py-1 rounded-full uppercase tracking-wider">
                        ✓ {rec.verification_status}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    {/* Location & Crop */}
                    <div className="grid grid-cols-2 gap-3 pb-3 border-b border-gray-100">
                      <div>
                        <span className="text-[11px] font-bold text-gray-500 block uppercase">
                          {isMarathi ? 'गाव व जिल्हा' : 'Village & District'}
                        </span>
                        <span className="text-sm font-black text-gray-900 mt-0.5 flex items-center">
                          <MapPin className="h-3.5 w-3.5 mr-1 text-primary-600 flex-shrink-0" />
                          {rec.village}, {rec.district}
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-gray-500 block uppercase">
                          {isMarathi ? 'पेरा नोंदणी (पीक)' : 'Sown Crop'}
                        </span>
                        <span className="text-sm font-black text-emerald-800 mt-0.5 flex items-center">
                          <Wheat className="h-3.5 w-3.5 mr-1 text-emerald-600 flex-shrink-0" />
                          {rec.crop_sown} ({rec.season})
                        </span>
                      </div>
                    </div>

                    {/* Acreage Details */}
                    <div className="grid grid-cols-2 gap-3 bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-100">
                      <div>
                        <span className="text-[11px] font-bold text-emerald-800 block uppercase">
                          {isMarathi ? 'एकूण जमीन' : 'Total Land'}
                        </span>
                        <span className="text-base font-black text-gray-900 mt-0.5 block">
                          {rec.total_land_acres} {isMarathi ? 'एकर' : 'Acres'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-emerald-800 block uppercase">
                          {isMarathi ? 'लागवड क्षेत्र' : 'Cultivated Area'}
                        </span>
                        <span className="text-base font-black text-gray-900 mt-0.5 block">
                          {rec.cultivated_area_acres} {isMarathi ? 'एकर' : 'Acres'}
                        </span>
                      </div>
                    </div>

                    {/* Quota Progress Meter */}
                    <div className="space-y-2 pt-1">
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-gray-700">
                          {isMarathi ? 'हमीभाव खरेदी कोटा वापर' : 'MSP Quota Utilization'}
                        </span>
                        <span className="text-primary-700 font-black">{rec.usage_percentage}%</span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            rec.usage_percentage > 80
                              ? 'bg-red-500'
                              : rec.usage_percentage > 50
                              ? 'bg-amber-500'
                              : 'bg-emerald-600'
                          }`}
                          style={{ width: `${rec.usage_percentage}%` }}
                        ></div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs font-semibold">
                        <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200">
                          <span className="text-gray-500 block text-[10px] uppercase font-bold">
                            {isMarathi ? 'एकूण कोटा' : 'Total Quota'}
                          </span>
                          <span className="font-black text-gray-900 text-sm">
                            {rec.total_quota_kg?.toLocaleString()} kg
                          </span>
                        </div>
                        <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200">
                          <span className="text-gray-500 block text-[10px] uppercase font-bold">
                            {isMarathi ? 'वापरलेला' : 'Used'}
                          </span>
                          <span className="font-black text-amber-700 text-sm">
                            {rec.used_quota_kg?.toLocaleString()} kg
                          </span>
                        </div>
                        <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-300">
                          <span className="text-emerald-800 block text-[10px] uppercase font-black">
                            {isMarathi ? 'शिल्लक' : 'Remaining'}
                          </span>
                          <span className="font-black text-emerald-700 text-sm">
                            {rec.remaining_quota_kg?.toLocaleString()} kg
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="px-6 py-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                  <div className="text-[11px] text-gray-500 font-medium truncate max-w-[200px]">
                    ✓ {rec.verified_by || 'MahaBhumi Digital Portal'}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(rec)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold text-xs rounded-xl transition"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      {isMarathi ? 'बदला' : 'Edit 7/12'}
                    </button>
                    <button
                      onClick={() => openDeleteModal(rec)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded-xl transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      {isMarathi ? 'हटवा' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Record Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="text-xl font-black text-gray-900 flex items-center">
                  <FileText className="h-6 w-6 mr-2 text-primary-600" />
                  {isMarathi ? 'नवीन ७/१२ नोंद जोडा' : 'Add 7/12 Land Record'}
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddRecord} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      {isMarathi ? 'गट / सर्व्हे क्र.' : 'Survey / Gat No'} *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.survey_number}
                      onChange={(e) => setFormData({ ...formData, survey_number: e.target.value })}
                      placeholder="e.g. Gat-412/1A"
                      className="w-full border-2 border-gray-300 rounded-xl p-2.5 text-sm font-semibold focus:border-primary-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      {isMarathi ? 'गाव' : 'Village'} *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.village}
                      onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                      placeholder="e.g. Hadapsar"
                      className="w-full border-2 border-gray-300 rounded-xl p-2.5 text-sm font-semibold focus:border-primary-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      {isMarathi ? 'तालुका' : 'Taluka'}
                    </label>
                    <input
                      type="text"
                      value={formData.taluka}
                      onChange={(e) => setFormData({ ...formData, taluka: e.target.value })}
                      placeholder="e.g. Haveli"
                      className="w-full border-2 border-gray-300 rounded-xl p-2.5 text-sm font-semibold focus:border-primary-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      {isMarathi ? 'जिल्हा' : 'District'} *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      placeholder="e.g. Pune"
                      className="w-full border-2 border-gray-300 rounded-xl p-2.5 text-sm font-semibold focus:border-primary-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      {isMarathi ? 'एकूण जमीन (एकर)' : 'Total Land (Acres)'} *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.total_land_acres}
                      onChange={(e) =>
                        setFormData({ ...formData, total_land_acres: e.target.value })
                      }
                      placeholder="e.g. 5.0"
                      className="w-full border-2 border-gray-300 rounded-xl p-2.5 text-sm font-semibold focus:border-primary-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      {isMarathi ? 'लागवड क्षेत्र (एकर)' : 'Cultivated Area'} *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.cultivated_area_acres}
                      onChange={(e) =>
                        setFormData({ ...formData, cultivated_area_acres: e.target.value })
                      }
                      placeholder="e.g. 3.5"
                      className="w-full border-2 border-gray-300 rounded-xl p-2.5 text-sm font-semibold focus:border-primary-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      {isMarathi ? 'पेरा नोंदणी (पीक)' : 'Crop Sown'} *
                    </label>
                    <select
                      value={formData.crop_sown}
                      onChange={(e) => setFormData({ ...formData, crop_sown: e.target.value })}
                      className="w-full border-2 border-gray-300 rounded-xl p-2.5 text-sm font-semibold focus:border-primary-600 focus:outline-none"
                    >
                      {CROP_OPTIONS.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      {isMarathi ? 'हंगाम' : 'Season'} *
                    </label>
                    <select
                      value={formData.season}
                      onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                      className="w-full border-2 border-gray-300 rounded-xl p-2.5 text-sm font-semibold focus:border-primary-600 focus:outline-none"
                    >
                      <option value="Rabi 2024-25">Rabi 2024-25 (रब्बी)</option>
                      <option value="Kharif 2024-25">Kharif 2024-25 (खरीप)</option>
                      <option value="Summer 2025">Summer 2025 (उन्हाळी)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-3 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-3 border-2 border-gray-300 rounded-xl font-bold text-gray-700 hover:bg-gray-100 transition text-sm"
                  >
                    {isMarathi ? 'रद्द करा' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 py-3 bg-gradient-to-r from-primary-600 to-emerald-600 hover:from-primary-700 hover:to-emerald-700 text-white font-bold rounded-xl shadow-md transition text-sm disabled:opacity-50"
                  >
                    {saving
                      ? isMarathi
                        ? 'जोडत आहे...'
                        : 'Adding...'
                      : isMarathi
                      ? 'नोंद जोडा'
                      : 'Add Record'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Record Modal */}
        {showEditModal && activeRecord && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="text-xl font-black text-gray-900 flex items-center">
                  <Edit3 className="h-6 w-6 mr-2 text-primary-600" />
                  {isMarathi ? '७/१२ नोंद संपादित करा' : 'Edit 7/12 Land Record'}
                </h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateRecord} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      {isMarathi ? 'गट / सर्व्हे क्र.' : 'Survey / Gat No'} *
                    </label>
                    <input
                      type="text"
                      required
                      value={editFormData.survey_number}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, survey_number: e.target.value })
                      }
                      className="w-full border-2 border-gray-300 rounded-xl p-2.5 text-sm font-semibold focus:border-primary-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      {isMarathi ? 'गाव' : 'Village'} *
                    </label>
                    <input
                      type="text"
                      required
                      value={editFormData.village}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, village: e.target.value })
                      }
                      className="w-full border-2 border-gray-300 rounded-xl p-2.5 text-sm font-semibold focus:border-primary-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      {isMarathi ? 'तालुका' : 'Taluka'}
                    </label>
                    <input
                      type="text"
                      value={editFormData.taluka}
                      onChange={(e) => setEditFormData({ ...editFormData, taluka: e.target.value })}
                      className="w-full border-2 border-gray-300 rounded-xl p-2.5 text-sm font-semibold focus:border-primary-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      {isMarathi ? 'जिल्हा' : 'District'} *
                    </label>
                    <input
                      type="text"
                      required
                      value={editFormData.district}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, district: e.target.value })
                      }
                      className="w-full border-2 border-gray-300 rounded-xl p-2.5 text-sm font-semibold focus:border-primary-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      {isMarathi ? 'एकूण जमीन (एकर)' : 'Total Land (Acres)'} *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={editFormData.total_land_acres}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, total_land_acres: e.target.value })
                      }
                      className="w-full border-2 border-gray-300 rounded-xl p-2.5 text-sm font-semibold focus:border-primary-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      {isMarathi ? 'लागवड क्षेत्र (एकर)' : 'Cultivated Area'} *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={editFormData.cultivated_area_acres}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          cultivated_area_acres: e.target.value,
                        })
                      }
                      className="w-full border-2 border-gray-300 rounded-xl p-2.5 text-sm font-semibold focus:border-primary-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      {isMarathi ? 'पेरा नोंदणी (पीक)' : 'Crop Sown'} *
                    </label>
                    <select
                      value={editFormData.crop_sown}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, crop_sown: e.target.value })
                      }
                      className="w-full border-2 border-gray-300 rounded-xl p-2.5 text-sm font-semibold focus:border-primary-600 focus:outline-none"
                    >
                      {CROP_OPTIONS.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      {isMarathi ? 'हंगाम' : 'Season'} *
                    </label>
                    <select
                      value={editFormData.season}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, season: e.target.value })
                      }
                      className="w-full border-2 border-gray-300 rounded-xl p-2.5 text-sm font-semibold focus:border-primary-600 focus:outline-none"
                    >
                      <option value="Rabi 2024-25">Rabi 2024-25 (रब्बी)</option>
                      <option value="Kharif 2024-25">Kharif 2024-25 (खरीप)</option>
                      <option value="Summer 2025">Summer 2025 (उन्हाळी)</option>
                    </select>
                  </div>
                </div>

                {/* Quota Recalculation Preview Banner */}
                {editFormData.cultivated_area_acres && (
                  <div className="bg-emerald-50 p-3.5 rounded-2xl border border-emerald-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-emerald-900 block">
                        {isMarathi ? 'अपेक्षित नवीन हमीभाव कोटा' : 'Estimated New MSP Quota'}
                      </span>
                      <span className="text-emerald-700">
                        {editFormData.cultivated_area_acres} Acres ×{' '}
                        {CROP_OPTIONS.find((c) => c.value === editFormData.crop_sown)?.yieldKg ||
                          1500}{' '}
                        kg/Acre
                      </span>
                    </div>
                    <span className="text-base font-black text-emerald-800">
                      {(
                        parseFloat(editFormData.cultivated_area_acres || 0) *
                        (CROP_OPTIONS.find((c) => c.value === editFormData.crop_sown)?.yieldKg ||
                          1500)
                      ).toLocaleString()}{' '}
                      kg
                    </span>
                  </div>
                )}

                <div className="pt-3 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 py-3 border-2 border-gray-300 rounded-xl font-bold text-gray-700 hover:bg-gray-100 transition text-sm"
                  >
                    {isMarathi ? 'रद्द करा' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 py-3 bg-gradient-to-r from-primary-600 to-emerald-600 hover:from-primary-700 hover:to-emerald-700 text-white font-bold rounded-xl shadow-md transition text-sm disabled:opacity-50 inline-flex items-center justify-center gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    {saving
                      ? isMarathi
                        ? 'जतन करत आहे...'
                        : 'Saving...'
                      : isMarathi
                      ? 'बदल जतन करा'
                      : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && activeRecord && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>

              <div className="text-center space-y-2">
                <h3 className="text-lg font-black text-gray-900">
                  {isMarathi ? '७/१२ नोंद हटवायची आहे का?' : 'Delete 7/12 Land Record?'}
                </h3>
                <p className="text-xs text-gray-500">
                  {isMarathi
                    ? `गट क्र. ${activeRecord.survey_number} (${activeRecord.crop_sown}) कायमस्वरूपी हटवले जाईल.`
                    : `Gat No. ${activeRecord.survey_number} (${activeRecord.crop_sown}) will be permanently removed.`}
                </p>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-2.5 border-2 border-gray-300 rounded-xl font-bold text-gray-700 hover:bg-gray-100 transition text-sm"
                >
                  {isMarathi ? 'रद्द करा' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={handleDeleteRecord}
                  disabled={saving}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md transition text-sm disabled:opacity-50"
                >
                  {saving
                    ? isMarathi
                      ? 'हटवत आहे...'
                      : 'Deleting...'
                    : isMarathi
                    ? 'होय, हटवा'
                    : 'Yes, Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
