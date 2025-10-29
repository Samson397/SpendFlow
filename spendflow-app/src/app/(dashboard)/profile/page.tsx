'use client';

import { useAuth } from '@/contexts/AuthContext';
import { User, Mail, Shield, Calendar } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mb-8"></div>
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif text-slate-100 mb-4 tracking-wide">
          P R O F I L E
        </h1>
        <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mb-6"></div>
        <p className="text-slate-400 text-sm tracking-widest uppercase">Account Information</p>
      </div>

      {/* Profile Card */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-gradient-to-br from-amber-900/20 via-slate-900/50 to-slate-900/20 border border-amber-700/30 rounded-sm p-12 backdrop-blur-sm">
          <div className="text-center mb-12">
            <div className="w-24 h-24 bg-slate-800 rounded-full mx-auto mb-6 flex items-center justify-center border-2 border-amber-600">
              <User className="h-12 w-12 text-amber-400" />
            </div>
            <h2 className="text-3xl font-serif text-slate-100 mb-2">{user?.displayName || 'User'}</h2>
            <div className="text-slate-500 text-sm tracking-wider">{user?.email}</div>
          </div>

          <div className="space-y-6">
            <div className="border border-slate-800 bg-slate-900/50 p-6">
              <div className="border-l-2 border-amber-600 pl-6">
                <div className="flex items-center gap-3 mb-3">
                  <Mail className="h-5 w-5 text-amber-400" />
                  <div className="text-slate-500 text-xs tracking-widest uppercase font-serif">Email</div>
                </div>
                <div className="text-lg font-serif text-slate-100">{user?.email}</div>
              </div>
            </div>

            <div className="border border-slate-800 bg-slate-900/50 p-6">
              <div className="border-l-2 border-amber-600 pl-6">
                <div className="flex items-center gap-3 mb-3">
                  <Shield className="h-5 w-5 text-amber-400" />
                  <div className="text-slate-500 text-xs tracking-widest uppercase font-serif">Account Status</div>
                </div>
                <div className="text-lg font-serif text-slate-100">Elite Member</div>
              </div>
            </div>

            <div className="border border-slate-800 bg-slate-900/50 p-6">
              <div className="border-l-2 border-amber-600 pl-6">
                <div className="flex items-center gap-3 mb-3">
                  <Calendar className="h-5 w-5 text-amber-400" />
                  <div className="text-slate-500 text-xs tracking-widest uppercase font-serif">Member Since</div>
                </div>
                <div className="text-lg font-serif text-slate-100">
                  {user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quote */}
      <div className="text-center py-12 border-t border-slate-800">
        <div className="text-amber-400/40 text-6xl mb-4">&quot;</div>
        <p className="text-slate-400 text-lg font-serif italic mb-4 max-w-2xl mx-auto">
          Your financial journey is unique. Make it extraordinary.
        </p>
        <div className="text-slate-600 text-sm tracking-widest">— SPENDFLOW</div>
      </div>
    </div>
  );
}
