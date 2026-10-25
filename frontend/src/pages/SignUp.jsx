import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { BarChart3, Eye, EyeOff, Lock, Mail, User, AlertTriangle, ArrowRight, Sun, Moon } from 'lucide-react';

const SignUp = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signup } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Client-side validations
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || trimmedName.length < 2) {
      setError('Please provide your full name (minimum 2 characters).');
      return;
    }

    if (!trimmedEmail || !/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
      setError('Please provide a valid email address.');
      return;
    }

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters in length.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please ensure both passwords are identical.');
      return;
    }

    setLoading(true);

    try {
      await signup(trimmedName, trimmedEmail, password, confirmPassword);
      navigate('/');
    } catch (err) {
      setError(
        err.response?.data?.detail || 
        err.message || 
        'Registration failed. Please check your details and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 flex items-center justify-center p-4 relative">
      {/* Theme toggle in top right corner */}
      <div className="absolute top-4 right-4">
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2.5 rounded-xl text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-400 transition flex items-center justify-center cursor-pointer shadow-sm"
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-300" />
          ) : (
            <Moon className="w-4 h-4 text-slate-300" />
          )}
        </button>
      </div>

      <div className="max-w-md w-full bg-white dark:bg-[#172033] rounded-2xl shadow-2xl border border-slate-100 dark:border-[#293548] overflow-hidden transition-colors duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-blue-600 dark:to-indigo-600 p-8 text-center text-white">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 mb-3 shadow-inner">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Create an Account</h1>
          <p className="text-indigo-100 text-xs mt-1">Vendor Performance Analytics Intelligence Platform</p>
        </div>

        {/* Form Body */}
        <div className="p-8">
          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200 dark:border-[#293548] mb-6">
            <Link
              to="/login"
              className="flex-1 pb-3 text-sm font-semibold text-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
            >
              Sign In
            </Link>
            <div className="flex-1 pb-3 text-sm font-semibold text-center border-b-2 border-indigo-600 dark:border-blue-500 text-indigo-600 dark:text-blue-400">
              Create Account
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 dark:text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jane Doe"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-[#293548] bg-white dark:bg-[#111827] text-slate-900 dark:text-[#F1F5F9] focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-blue-500/20 focus:border-indigo-600 dark:focus:border-blue-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 dark:text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-[#293548] bg-white dark:bg-[#111827] text-slate-900 dark:text-[#F1F5F9] focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-blue-500/20 focus:border-indigo-600 dark:focus:border-blue-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 dark:text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full pl-9 pr-10 py-2 text-sm rounded-lg border border-slate-300 dark:border-[#293548] bg-white dark:bg-[#111827] text-slate-900 dark:text-[#F1F5F9] focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-blue-500/20 focus:border-indigo-600 dark:focus:border-blue-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-hidden cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 dark:text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className="w-full pl-9 pr-10 py-2 text-sm rounded-lg border border-slate-300 dark:border-[#293548] bg-white dark:bg-[#111827] text-slate-900 dark:text-[#F1F5F9] focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-blue-500/20 focus:border-indigo-600 dark:focus:border-blue-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-hidden cursor-pointer"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-2.5 px-4 rounded-xl font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-500 dark:bg-blue-600 dark:hover:bg-blue-500 shadow-md shadow-indigo-600/20 dark:shadow-blue-600/20 disabled:opacity-50 transition flex items-center justify-center space-x-2 cursor-pointer"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              ) : (
                <div className="flex items-center space-x-1.5">
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </button>
          </form>

          {/* Switch to Sign In */}
          <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
            Already registered?{' '}
            <Link to="/login" className="font-semibold text-indigo-600 dark:text-blue-400 hover:text-indigo-800 dark:hover:text-blue-300 transition">
              Sign In here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
