'use client';

import { useState } from 'react';
import { Crown, X, ArrowRight } from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useRouter } from 'next/navigation';

interface UpgradePromptProps {
  title?: string;
  message?: string;
  feature?: string;
  showCloseButton?: boolean;
  compact?: boolean;
  onClose?: () => void;
}

export function UpgradePrompt({
  title = "Upgrade to Unlock More",
  message = "You've reached your plan limit. Upgrade to access more features.",
  feature,
  showCloseButton = true,
  compact = false,
  onClose
}: UpgradePromptProps) {
  const router = useRouter();
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    router.push('/subscription');
  };

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  if (compact) {
    return (
      <div className="bg-linear-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
              {feature ? `${feature} limit reached` : title}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleUpgrade}
              disabled={isUpgrading}
              className="text-xs bg-amber-500 hover:bg-amber-600 text-white px-2 py-1 rounded font-medium transition-colors"
            >
              {isUpgrading ? 'Loading...' : 'Upgrade'}
            </button>
            {showCloseButton && (
              <button
                onClick={handleClose}
                className="text-amber-500 hover:text-amber-600 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-linear-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200 dark:border-amber-800/30 rounded-xl p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="shrink-0">
            <div className="w-12 h-12 bg-linear-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
              <Crown className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100 mb-2">
              {title}
            </h3>
            <p className="text-amber-700 dark:text-amber-300 text-sm leading-relaxed">
              {message}
              {feature && (
                <span className="font-medium"> Upgrade to add more {feature.toLowerCase()}.</span>
              )}
            </p>
          </div>
        </div>
        {showCloseButton && (
          <button
            onClick={handleClose}
            className="text-amber-400 hover:text-amber-600 dark:text-amber-500 dark:hover:text-amber-400 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="mt-6 flex gap-3">
        <button
          onClick={handleUpgrade}
          disabled={isUpgrading}
          className="flex items-center gap-2 bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md"
        >
          {isUpgrading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Upgrading...
            </>
          ) : (
            <>
              Upgrade Now
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
        <button
          onClick={() => router.push('/subscription')}
          className="text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 text-sm font-medium px-4 py-2 rounded-lg border border-amber-200 dark:border-amber-800/30 hover:border-amber-300 dark:hover:border-amber-700/50 transition-colors"
        >
          View Plans
        </button>
      </div>
    </div>
  );
}

// Hook to easily show upgrade prompts based on access checks
export function useUpgradePrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [promptConfig, setPromptConfig] = useState<Partial<UpgradePromptProps>>({});

  const triggerUpgrade = (config: Partial<UpgradePromptProps> = {}) => {
    setPromptConfig(config);
    setShowPrompt(true);
  };

  const hidePrompt = () => {
    setShowPrompt(false);
  };

  const UpgradePromptComponent = showPrompt ? (
    <UpgradePrompt {...promptConfig} onClose={hidePrompt} />
  ) : null;

  return {
    triggerUpgrade,
    hidePrompt,
    UpgradePromptComponent,
    isVisible: showPrompt,
  };
}
