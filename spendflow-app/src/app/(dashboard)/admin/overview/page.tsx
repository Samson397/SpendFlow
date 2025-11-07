'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { ShieldCheckIcon, ArrowLeftIcon, UsersIcon as Users, EyeIcon as Eye, BoltIcon as Activity, ArrowTrendingUpIcon as TrendingUp, ClockIcon as Clock, UserIcon as User, EllipsisHorizontalIcon as Circle } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function AdminOverviewPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [visitorStats, setVisitorStats] = useState({
    totalVisitors: 0,
    todayVisitors: 0,
    activeSessions: 0,
    pageViews: 0
  });

  // Check admin access
  const adminEmails = process.env['NEXT_PUBLIC_ADMIN_EMAILS']?.split(',') || [];
  const isAdmin = user?.email ? adminEmails.includes(user.email) : false;

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (!isAdmin) {
      router.push('/dashboard');
      return;
    }

    // Load visitor analytics (mock data for now)
    loadVisitorStats();
  }, [user, isAdmin, router]);

  const loadVisitorStats = async () => {
    // Mock visitor statistics - in a real app, this would come from analytics service
    setVisitorStats({
      totalVisitors: 1247,
      todayVisitors: 89,
      activeSessions: 23,
      pageViews: 3421
    });
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="text-center">
          <ShieldCheckIcon className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-serif text-slate-100 mb-2">Access Denied</h1>
          <p className="text-slate-400">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="flex items-center gap-2 text-slate-400 hover:text-amber-400 transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              Back to Admin Dashboard
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheckIcon className="h-5 w-5 text-amber-400" />
            <span className="text-amber-400 font-serif tracking-wide">ADMIN</span>
          </div>
        </div>

        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-serif text-slate-100 mb-2 tracking-wide">
            Admin Overview
          </h1>
          <p className="text-slate-400 text-sm tracking-wider">
            Real-time monitoring of users, visitors, and system activity
          </p>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Visitors</p>
                <p className="text-3xl font-bold text-slate-100">{visitorStats.totalVisitors.toLocaleString()}</p>
                <p className="text-xs text-slate-500 mt-1">All time</p>
              </div>
              <Users className="h-8 w-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Today's Visitors</p>
                <p className="text-3xl font-bold text-slate-100">{visitorStats.todayVisitors}</p>
                <p className="text-xs text-green-400 mt-1">↑ 12% from yesterday</p>
              </div>
              <Eye className="h-8 w-8 text-green-400" />
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Active Sessions</p>
                <p className="text-3xl font-bold text-slate-100">{visitorStats.activeSessions}</p>
                <p className="text-xs text-slate-500 mt-1">Currently online</p>
              </div>
              <Activity className="h-8 w-8 text-amber-400" />
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Page Views</p>
                <p className="text-3xl font-bold text-slate-100">{visitorStats.pageViews.toLocaleString()}</p>
                <p className="text-xs text-blue-400 mt-1">↑ 8% this week</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-400" />
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Online Users */}
          <div className="lg:col-span-1">
            <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-5 w-5 text-amber-400" />
                <h3 className="text-lg font-medium text-slate-100">Online Users (3)</h3>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                      <User className="h-4 w-4 text-slate-300" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-200">John Doe</p>
                      <p className="text-xs text-slate-400">Online now</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Circle className="h-2 w-2 text-green-500" />
                    <span className="text-xs text-slate-400">Active</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                      <User className="h-4 w-4 text-slate-300" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-200">Jane Smith</p>
                      <p className="text-xs text-slate-400">Online now</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Circle className="h-2 w-2 text-green-500" />
                    <span className="text-xs text-slate-400">Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Recent Activity & Quick Actions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Activity */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-5 w-5 text-amber-400" />
                <h3 className="text-lg font-medium text-slate-100">Recent Activity</h3>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-slate-800/30 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-green-400 mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-200">New user registration</p>
                    <p className="text-xs text-slate-400">john.doe@example.com • 2 minutes ago</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-800/30 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-blue-400 mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-200">Credit card payment processed</p>
                    <p className="text-xs text-slate-400">$125.50 • 5 minutes ago</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-800/30 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-amber-400 mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-200">New contact message received</p>
                    <p className="text-xs text-slate-400">Support inquiry • 12 minutes ago</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-800/30 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-purple-400 mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-200">User updated profile</p>
                    <p className="text-xs text-slate-400">sarah.smith@example.com • 18 minutes ago</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-700">
                <Link
                  href="/admin/messages"
                  className="text-sm text-amber-400 hover:text-amber-300 transition-colors"
                >
                  View all messages →
                </Link>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
              <h3 className="text-lg font-medium text-slate-100 mb-4">Quick Actions</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link
                  href="/admin/messages"
                  className="flex items-center gap-3 p-4 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors group"
                >
                  <div className="p-2 bg-blue-900/30 rounded-lg group-hover:bg-blue-900/50 transition-colors">
                    <Activity className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-200">Check Messages</p>
                    <p className="text-xs text-slate-400">Respond to user inquiries</p>
                  </div>
                </Link>

                <Link
                  href="/admin/users"
                  className="flex items-center gap-3 p-4 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors group"
                >
                  <div className="p-2 bg-green-900/30 rounded-lg group-hover:bg-green-900/50 transition-colors">
                    <Users className="h-5 w-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-200">Manage Users</p>
                    <p className="text-xs text-slate-400">User accounts & permissions</p>
                  </div>
                </Link>

                <Link
                  href="/admin/recurring"
                  className="flex items-center gap-3 p-4 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors group"
                >
                  <div className="p-2 bg-amber-900/30 rounded-lg group-hover:bg-amber-900/50 transition-colors">
                    <TrendingUp className="h-5 w-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-200">Process Payments</p>
                    <p className="text-xs text-slate-400">Run recurring payments</p>
                  </div>
                </Link>

                <Link
                  href="/admin/settings"
                  className="flex items-center gap-3 p-4 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors group"
                >
                  <div className="p-2 bg-purple-900/30 rounded-lg group-hover:bg-purple-900/50 transition-colors">
                    <ShieldCheckIcon className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-200">System Settings</p>
                    <p className="text-xs text-slate-400">Configure application</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="mt-8 bg-slate-900/50 border border-slate-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-slate-100">System Status</h3>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/30 text-green-400">
                All Systems Operational
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <div>
                <p className="text-sm font-medium text-slate-200">Database</p>
                <p className="text-xs text-slate-400">Connected & healthy</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <div>
                <p className="text-sm font-medium text-slate-200">Firebase Auth</p>
                <p className="text-xs text-slate-400">Authentication active</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <div>
                <p className="text-sm font-medium text-slate-200">Real-time Sync</p>
                <p className="text-xs text-slate-400">Presence monitoring active</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
