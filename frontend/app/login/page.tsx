'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/authContext';
import { ShieldAlert, Mail, Lock, User, Building2, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('Worker');
  const [siteId, setSiteId] = useState('OIL-DULIAJAN-01');

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login, signup } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        if (!name) {
          setError('Name is required for registration.');
          setSubmitting(false);
          return;
        }
        await signup({ name, email, password, role, site_id: siteId });
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Authentication failed. Please check credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-8">
      <div className="max-w-sm w-full">
        
        {/* Logo Mark Header */}
        <div className="text-center mb-6">
          <div className="w-10 h-10 bg-teal-700 text-white rounded-lg mx-auto flex items-center justify-center font-bold text-sm shadow-sm mb-2">
            <ShieldAlert className="w-5 h-5 text-teal-100" />
          </div>
          <h1 className="text-lg font-semibold text-slate-900 tracking-tight">SIFRA AI</h1>
          <p className="text-xs text-slate-500 font-medium">Oil India Limited • Safety Platform</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          
          {/* Tab Switcher */}
          <div className="flex bg-slate-100 p-1 rounded-lg mb-5 border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => { setIsLogin(true); setError(''); }}
              className={`flex-1 py-1.5 rounded transition-colors ${
                isLogin ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(''); }}
              className={`flex-1 py-1.5 rounded transition-colors ${
                !isLogin ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Register
            </button>
          </div>

          {error && (
            <div className="mb-4 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {!isLogin && (
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ramesh Kumar"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 rounded border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-teal-700 focus:bg-white transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Work Email</label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="worker@oilindia.in"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 rounded border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-teal-700 focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 rounded border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-teal-700 focus:bg-white transition-colors"
                />
              </div>
            </div>

            {!isLogin && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 rounded border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-teal-700"
                  >
                    <option value="Worker">Worker</option>
                    <option value="HSE Officer">HSE Officer</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">Site Location</label>
                  <select
                    value={siteId}
                    onChange={(e) => setSiteId(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 rounded border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-teal-700"
                  >
                    <option value="OIL-DULIAJAN-01">Duliajan HQ</option>
                    <option value="OIL-DIGBOI-01">Digboi Field</option>
                    <option value="OIL-MORAN-01">Moran Site</option>
                    <option value="OIL-JORHAT-01">Jorhat Complex</option>
                  </select>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 py-2 bg-teal-700 text-white font-semibold rounded text-xs hover:bg-teal-800 disabled:opacity-50 transition-colors flex items-center justify-center space-x-1.5"
            >
              <span>{submitting ? 'Authenticating...' : isLogin ? 'Sign In to Portal' : 'Create Account'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="mt-5 pt-3 border-t border-slate-100 text-center text-[11px] text-slate-400">
            <span className="font-semibold text-slate-600">Demo Accounts:</span>
            <div className="mt-0.5 space-y-0.5 font-mono text-slate-700">
              <div>Worker: worker@oilindia.in / worker123</div>
              <div>Admin: admin@oilindia.in / admin123</div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
