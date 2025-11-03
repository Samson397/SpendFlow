'use client';

import { useState, useEffect } from 'react';
import { Monitor, Smartphone, Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { DeviceManagementService, TrustedDevice } from '@/lib/services/deviceManagementService';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

export function DeviceManagement() {
  const { user } = useAuth();
  const [devices, setDevices] = useState<TrustedDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDeviceId, setCurrentDeviceId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadDevices();
      getCurrentDeviceId();
    }
  }, [user]); // loadDevices is defined in component scope, no need to add

  const loadDevices = async () => {
    if (!user) return;

    try {
      const userDevices = await DeviceManagementService.getTrustedDevices(user.uid);
      setDevices(userDevices);
    } catch (error) {
      console.error('Error loading devices:', error);
      toast.error('Failed to load devices');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentDeviceId = async () => {
    try {
      const fingerprint = await DeviceManagementService.generateDeviceFingerprint();
      const deviceId = await DeviceManagementService.generateDeviceId(fingerprint);
      setCurrentDeviceId(deviceId);
    } catch (error) {
      console.error('Error getting current device ID:', error);
    }
  };

  const handleRevokeTrust = async (deviceId: string) => {
    if (!confirm('Are you sure you want to revoke trust for this device? You will need to verify your identity the next time you log in from this device.')) {
      return;
    }

    try {
      await DeviceManagementService.revokeDeviceTrust(deviceId);
      await loadDevices();
      toast.success('Device trust revoked');
    } catch (error) {
      console.error('Error revoking device trust:', error);
      toast.error('Failed to revoke device trust');
    }
  };

  const getDeviceIcon = (device: TrustedDevice) => {
    const ua = device.fingerprint.userAgent.toLowerCase();

    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return <Smartphone className="h-5 w-5 text-blue-400" />;
    }

    return <Monitor className="h-5 w-5 text-purple-400" />;
  };

  const getDeviceType = (device: TrustedDevice) => {
    const ua = device.fingerprint.userAgent.toLowerCase();

    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return 'Mobile';
    }

    return 'Desktop';
  };

  const formatLastLogin = (timestamp: unknown) => {
    if (!timestamp) return 'Never';

    const date = (timestamp as any)?.toDate?.() || new Date(timestamp as any);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;

    return date.toLocaleDateString();
  };

  const getSecurityBadge = (device: TrustedDevice) => {
    const isCurrentDevice = device.deviceId === currentDeviceId;

    if (isCurrentDevice) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-900/30 text-green-400">
          <CheckCircle className="h-3 w-3 mr-1" />
          Current Device
        </span>
      );
    }

    if (device.isTrusted) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-900/30 text-blue-400">
          <Shield className="h-3 w-3 mr-1" />
          Trusted
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-900/30 text-gray-400">
        <AlertTriangle className="h-3 w-3 mr-1" />
        Not Trusted
      </span>
    );
  };

  if (loading) {
    return (
      <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-amber-400 border-t-transparent"></div>
          <span className="ml-3 text-slate-400">Loading devices...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Shield className="h-6 w-6 text-amber-400" />
        <div>
          <h2 className="text-2xl font-serif text-slate-100">Device Management</h2>
          <p className="text-slate-400 text-sm">Manage trusted devices and login sessions</p>
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-blue-400 mt-0.5" />
          <div>
            <h3 className="text-blue-400 font-medium mb-1">Security Information</h3>
            <p className="text-blue-300 text-sm">
              Trusted devices allow you to stay logged in longer without re-authentication.
              Revoking trust will require you to verify your identity on the next login from that device.
            </p>
          </div>
        </div>
      </div>

      {/* Devices List */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-lg overflow-hidden">
        {devices.length === 0 ? (
          <div className="text-center py-12">
            <Monitor className="h-12 w-12 text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-400">No devices found</p>
            <p className="text-xs text-slate-500 mt-1">Devices will appear here as you log in</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {devices.map((device) => (
              <div key={device.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="p-2 bg-slate-800 rounded-lg">
                      {getDeviceIcon(device)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-medium text-slate-100 truncate">
                          {device.deviceName}
                        </h3>
                        {getSecurityBadge(device)}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-slate-400 mb-3">
                        <div>
                          <span className="font-medium">Type:</span> {getDeviceType(device)}
                        </div>
                        <div>
                          <span className="font-medium">Platform:</span> {device.fingerprint.platform}
                        </div>
                        <div>
                          <span className="font-medium">Browser:</span> {device.fingerprint.userAgent.split(' ').slice(-2, -1)[0] || 'Unknown'}
                        </div>
                        <div>
                          <span className="font-medium">Last Login:</span> {formatLastLogin(device.lastLogin)}
                        </div>
                        <div>
                          <span className="font-medium">Login Count:</span> {device.loginCount}
                        </div>
                        <div>
                          <span className="font-medium">Security:</span> {device.securityLevel.charAt(0).toUpperCase() + device.securityLevel.slice(1)}
                        </div>
                      </div>

                      {device.ipAddress && (
                        <div className="text-xs text-slate-500 mb-2">
                          <span className="font-medium">IP Address:</span> {device.ipAddress}
                        </div>
                      )}

                      {device.location && (
                        <div className="text-xs text-slate-500">
                          <span className="font-medium">Location:</span> {device.location.city}, {device.location.country}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 ml-4">
                    {device.deviceId !== currentDeviceId && device.isTrusted && (
                      <button
                        onClick={() => handleRevokeTrust(device.id)}
                        className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors flex items-center gap-1"
                        title="Revoke trust for this device"
                      >
                        <XCircle className="h-3 w-3" />
                        Revoke Trust
                      </button>
                    )}

                    {device.deviceId === currentDeviceId && (
                      <div className="px-3 py-1 text-xs bg-green-900/30 text-green-400 rounded-md flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Current
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Statistics */}
      {devices.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <p className="text-2xl font-bold text-slate-100">
                  {devices.filter(d => d.isTrusted).length}
                </p>
                <p className="text-sm text-slate-400">Trusted Devices</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
            <div className="flex items-center">
              <Monitor className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <p className="text-2xl font-bold text-slate-100">
                  {devices.filter(d => d.fingerprint.userAgent.toLowerCase().includes('mobile')).length}
                </p>
                <p className="text-sm text-slate-400">Mobile Devices</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-amber-500 mr-3" />
              <div>
                <p className="text-2xl font-bold text-slate-100">
                  {devices.filter(d => !d.isTrusted).length}
                </p>
                <p className="text-sm text-slate-400">Untrusted Devices</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
