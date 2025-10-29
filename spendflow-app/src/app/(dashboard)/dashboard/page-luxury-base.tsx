'use client';

import Link from 'next/link';
import { ArrowLeft, TrendingUp, Award } from 'lucide-react';

export default function LuxuryDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-12">
        <Link href="/demo" className="inline-flex items-center gap-2 text-amber-200 hover:text-amber-100 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm tracking-wider uppercase">Return</span>
        </Link>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto">
        {/* Title */}
        <div className="text-center mb-16">
          <div className="inline-block mb-6">
            <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mb-8"></div>
          </div>
          <h1 className="text-6xl font-serif text-slate-100 mb-4 tracking-wide">
            D A S H B O A R D
          </h1>
          <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mb-6"></div>
          <p className="text-slate-400 text-sm tracking-widest uppercase">Financial Overview</p>
        </div>

        {/* Main Balance Card */}
        <div className="mb-12">
          <div className="bg-gradient-to-br from-amber-900/20 via-slate-900/50 to-slate-900/20 border border-amber-700/30 rounded-sm p-12 backdrop-blur-sm">
            <div className="text-center">
              <div className="text-amber-400/60 text-xs tracking-widest uppercase mb-4 font-serif">Total Balance</div>
              <div className="text-7xl font-serif text-slate-100 mb-2">$12,345.00</div>
              <div className="flex items-center justify-center gap-2 text-amber-400">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm tracking-wider">+2.5% This Quarter</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-8 mb-12">
          <div className="border border-slate-800 bg-slate-900/50 p-8 backdrop-blur-sm">
            <div className="border-l-2 border-amber-600 pl-6">
              <div className="text-slate-500 text-xs tracking-widest uppercase mb-3 font-serif">Income</div>
              <div className="text-4xl font-serif text-slate-100 mb-2">$5,000.00</div>
              <div className="text-slate-600 text-sm">Monthly Revenue</div>
            </div>
          </div>

          <div className="border border-slate-800 bg-slate-900/50 p-8 backdrop-blur-sm">
            <div className="border-l-2 border-amber-600 pl-6">
              <div className="text-slate-500 text-xs tracking-widest uppercase mb-3 font-serif">Expenses</div>
              <div className="text-4xl font-serif text-slate-100 mb-2">$3,200.00</div>
              <div className="text-slate-600 text-sm">Monthly Expenditure</div>
            </div>
          </div>
        </div>

        {/* Portfolio Section */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-0.5 bg-gradient-to-r from-amber-600 to-transparent"></div>
            <h2 className="text-2xl font-serif text-slate-100 tracking-wide">Portfolio Overview</h2>
          </div>

          <div className="border border-slate-800 bg-slate-900/30 backdrop-blur-sm">
            <div className="grid grid-cols-3 divide-x divide-slate-800">
              <div className="p-8 text-center">
                <div className="text-amber-400 mb-3">
                  <Award className="h-8 w-8 mx-auto" />
                </div>
                <div className="text-3xl font-serif text-slate-100 mb-2">3</div>
                <div className="text-slate-500 text-xs tracking-widest uppercase">Premium Accounts</div>
              </div>
              <div className="p-8 text-center">
                <div className="text-amber-400 mb-3">
                  <div className="text-3xl">◆</div>
                </div>
                <div className="text-3xl font-serif text-slate-100 mb-2">$2,145</div>
                <div className="text-slate-500 text-xs tracking-widest uppercase">Monthly Savings</div>
              </div>
              <div className="p-8 text-center">
                <div className="text-amber-400 mb-3">
                  <div className="text-3xl">★</div>
                </div>
                <div className="text-3xl font-serif text-slate-100 mb-2">Elite</div>
                <div className="text-slate-500 text-xs tracking-widest uppercase">Member Status</div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-0.5 bg-gradient-to-r from-amber-600 to-transparent"></div>
            <h2 className="text-2xl font-serif text-slate-100 tracking-wide">Recent Activity</h2>
          </div>

          <div className="space-y-1">
            <div className="border-b border-slate-800 py-6 hover:bg-slate-900/30 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="w-1 h-12 bg-amber-600"></div>
                  <div>
                    <div className="text-slate-200 font-serif mb-1">Grocery Store</div>
                    <div className="text-slate-600 text-xs tracking-wider">Today, 2:30 PM</div>
                  </div>
                </div>
                <div className="text-slate-300 font-serif text-xl">-$45.20</div>
              </div>
            </div>

            <div className="border-b border-slate-800 py-6 hover:bg-slate-900/30 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="w-1 h-12 bg-amber-600"></div>
                  <div>
                    <div className="text-slate-200 font-serif mb-1">Salary Deposit</div>
                    <div className="text-slate-600 text-xs tracking-wider">Today, 9:00 AM</div>
                  </div>
                </div>
                <div className="text-slate-300 font-serif text-xl">+$2,500.00</div>
              </div>
            </div>

            <div className="border-b border-slate-800 py-6 hover:bg-slate-900/30 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="w-1 h-12 bg-amber-600"></div>
                  <div>
                    <div className="text-slate-200 font-serif mb-1">Investment Return</div>
                    <div className="text-slate-600 text-xs tracking-wider">Yesterday, 4:15 PM</div>
                  </div>
                </div>
                <div className="text-slate-300 font-serif text-xl">+$850.00</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quote */}
        <div className="text-center py-12 border-t border-slate-800">
          <div className="text-amber-400/40 text-6xl mb-4">"</div>
          <p className="text-slate-400 text-lg font-serif italic mb-4 max-w-2xl mx-auto">
            Wealth consists not in having great possessions, but in having few wants.
          </p>
          <div className="text-slate-600 text-sm tracking-widest">— EPICTETUS</div>
        </div>

        {/* Style Info */}
        <div className="mt-12 border border-amber-900/30 bg-gradient-to-br from-amber-950/20 to-slate-900/20 p-8 backdrop-blur-sm">
          <div className="text-center">
            <div className="text-amber-400 text-xs tracking-widest uppercase mb-3">Style 9</div>
            <h4 className="text-2xl font-serif text-slate-100 mb-4">Luxury Premium</h4>
            <p className="text-slate-400 mb-6 max-w-2xl mx-auto leading-relaxed">
              Elegant and sophisticated design with gold accents, serif typography, and spacious layout. 
              Inspired by premium brands like Rolex and Tesla for a refined financial experience.
            </p>
            <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-amber-600 to-transparent mx-auto mb-6"></div>
            <p className="text-slate-500 text-sm">
              Interested in this style? Simply say: &quot;I want Style 9&quot; or &quot;I prefer the luxury design&quot;
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
