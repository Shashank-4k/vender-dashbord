import React, { useState } from 'react';
import { vendorAPI } from '../services/api';
import { X, Plus, AlertTriangle, CheckCircle2, ShieldCheck } from 'lucide-react';

const CATEGORIES = [
  'Beverage & Spirits',
  'Wine & Champagne',
  'Craft Beer & Cider',
  'Packaging & Supplies',
  'Logistics & Freight',
  'Ingredients & Raw Materials',
  'General Merchandise',
];

const AddVendorModal = ({ isOpen, onClose, onVendorAdded }) => {
  const [vendorNumber, setVendorNumber] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [category, setCategory] = useState('Beverage & Spirits');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const parsedNumber = parseInt(vendorNumber, 10);
    if (!parsedNumber || parsedNumber <= 0) {
      setError('Please provide a valid positive integer for the Vendor Number.');
      return;
    }

    if (!vendorName.trim()) {
      setError('Vendor Name is required.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        vendor_number: parsedNumber,
        vendor_name: vendorName.trim(),
        category: category.trim(),
      };
      const res = await vendorAPI.addVendor(payload);
      setSuccess(res.data.message || 'Vendor added successfully to MySQL!');
      
      // Notify parent to re-fetch metrics and refresh the total vendor count
      if (onVendorAdded) {
        onVendorAdded(res.data);
      }

      setTimeout(() => {
        setVendorNumber('');
        setVendorName('');
        setCategory('Beverage & Spirits');
        setSuccess('');
        onClose();
      }, 1200);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 403) {
        setError('403 Forbidden: Only Admin users are authorized to add new vendors.');
      } else if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Failed to create vendor. Please verify database connectivity.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white dark:bg-[#172033] rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 dark:border-[#293548] overflow-hidden transform transition-all duration-200">
        {/* Header */}
        <div className="bg-slate-900 dark:bg-[#111827] px-6 py-4 flex items-center justify-between text-white border-b border-slate-800 dark:border-[#293548]">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 dark:bg-blue-500/20 text-indigo-400 dark:text-blue-400 flex items-center justify-center border border-indigo-500/30 dark:border-blue-500/30">
              <ShieldCheck className="w-4 h-4 text-indigo-400 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Add New Vendor</h3>
              <p className="text-xs text-slate-400">Admin-exclusive vendor catalog provisioning</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 dark:hover:bg-[#1E293B] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Vendor Number (Unique Identifier) *
            </label>
            <input
              type="number"
              required
              placeholder="e.g. 99501"
              value={vendorNumber}
              onChange={(e) => setVendorNumber(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-[#293548] bg-white dark:bg-[#111827] text-slate-900 dark:text-[#F1F5F9] focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-blue-500/20 focus:border-indigo-600 dark:focus:border-blue-500 font-mono transition"
            />
            <p className="text-[11px] text-slate-400 dark:text-slate-400 mt-1">Unique numeric ID matching ERP or supplier invoice numbers.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Vendor / Supplier Legal Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Apex Beverage Distributing Co."
              value={vendorName}
              onChange={(e) => setVendorName(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-[#293548] bg-white dark:bg-[#111827] text-slate-900 dark:text-[#F1F5F9] focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-blue-500/20 focus:border-indigo-600 dark:focus:border-blue-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Primary Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-[#293548] bg-white dark:bg-[#111827] text-slate-900 dark:text-[#F1F5F9] focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-blue-500/20 focus:border-indigo-600 dark:focus:border-blue-500 transition"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1E293B] rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-lg shadow-xs disabled:opacity-50 transition cursor-pointer"
            >
              {loading ? (
                <span>Adding to MySQL...</span>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Save Vendor</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddVendorModal;
