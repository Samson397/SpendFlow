'use client';

import { useEffect, useState } from 'react';
import { healthService, HealthCheckResult } from '@/lib/healthService';

const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case 'operational':
      return <span className="text-lg">✅</span>;
    case 'degraded':
      return <span className="text-lg">⚠️</span>;
    case 'outage':
      return <span className="text-lg">❌</span>;
    default:
      return <span className="text-lg">⏰</span>;
  }
};

export default function StatusPage() {
  const [status, setStatus] = useState<HealthCheckResult[]>([]);
  const [history, setHistory] = useState<HealthCheckResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    // Initial load
    const loadInitialStatus = async () => {
      const results = await healthService.checkAllServices();
      setStatus(results);
      setHistory(healthService.getStatusHistory());
      setLastUpdated(new Date());
      setIsLoading(false);
    };

    loadInitialStatus();

    // Subscribe to updates
    const unsubscribe = healthService.subscribe((results) => {
      setStatus(results);
      setHistory(healthService.getStatusHistory());
      setLastUpdated(new Date());
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const getUptimePercentage = (service: string) => {
    const serviceHistory = history.filter(s => s.service === service);
    if (serviceHistory.length === 0) return 100;
    
    const operationalCount = serviceHistory.filter(s => s.status === 'operational').length;
    return Math.round((operationalCount / serviceHistory.length) * 100);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-400 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-slate-100">System Status</h2>
          <div className="text-sm text-slate-400">
            {lastUpdated && `Last checked: ${lastUpdated.toLocaleTimeString()}`}
          </div>
        </div>

        <div className="space-y-4">
          {status.map((service) => (
            <div key={service.service} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <StatusIcon status={service.status} />
                <div>
                  <div className="font-medium text-slate-100 capitalize">{service.service}</div>
                  <div className="text-sm text-slate-400">
                    {service.status === 'operational' 
                      ? 'All systems operational' 
                      : service.error || 'Service experiencing issues'}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-slate-400">
                  {service.responseTime}ms
                </div>
                <div className="text-xs text-slate-500">
                  {getUptimePercentage(service.service)}% uptime
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
        <h3 className="text-lg font-medium text-slate-100 mb-4">Status History</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-800">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Time</th>
                {status.map(service => (
                  <th key={service.service} className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase tracking-wider">
                    {service.service}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {history.slice(0, 10).map((check, index) => (
                <tr key={index}>
                  <td className="px-4 py-3 text-sm text-slate-300">
                    {new Date(check.lastChecked).toLocaleTimeString()}
                  </td>
                  {status.map(service => {
                    const serviceCheck = history
                      .filter(s => s.service === service.service && 
                        s.lastChecked.getTime() === check.lastChecked.getTime())[0];
                    return (
                      <td key={service.service} className="px-4 py-3 text-center">
                        {serviceCheck && (
                          <StatusIcon status={serviceCheck.status} />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
