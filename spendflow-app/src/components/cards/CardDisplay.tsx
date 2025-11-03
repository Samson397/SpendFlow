'use client';

import { Card as CardType } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { getCardExpiryStatus } from '@/lib/utils/cardExpiry';
import { CreditCard } from 'lucide-react';

interface CardDisplayProps {
  card: CardType;
}

export function CardDisplay({ card }: CardDisplayProps) {
  const cardNumberDisplay = `•••• •••• •••• ${card.cardNumber.slice(-4)}`;
  const expiryParts = card.expiryDate.split('/');

  // Check expiry status
  const { isExpired, isExpiringSoon } = getCardExpiryStatus(card.expiryDate);

  // Enhanced color schemes for different card types with better contrast
  const getCardTheme = (cardType: string) => {
    const themes = {
      credit: {
        gradient: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 50%, #a855f7 100%)',
        accent: '#a855f7'
      },
      debit: {
        gradient: 'linear-gradient(135deg, #7c2d12 0%, #dc2626 50%, #ef4444 100%)',
        accent: '#ef4444'
      },
      prepaid: {
        gradient: 'linear-gradient(135deg, #0f766e 0%, #14b8a6 50%, #2dd4bf 100%)',
        accent: '#2dd4bf'
      },
      default: {
        gradient: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)',
        accent: '#475569'
      }
    };
    return themes[cardType as keyof typeof themes] || themes.default;
  };

  const theme = getCardTheme(card.type);

  return (
    <div
      className="relative w-full h-56 rounded-3xl p-6 text-white shadow-2xl overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-3xl"
      style={{
        background: theme.gradient,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
      }}
    >
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/20 -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/15 translate-y-12 -translate-x-12"></div>
      </div>

      {/* Glassmorphism overlay with enhanced blur */}
      <div className="absolute inset-0 bg-white/15 backdrop-blur-xl"></div>

      {/* Card content */}
      <div className="relative z-10 h-full flex flex-col justify-between">
        {/* Top section */}
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs text-white/90 uppercase tracking-widest font-medium">
              {card.type === 'credit' ? 'Credit Card' : card.type === 'debit' ? 'Debit Card' : 'Card'}
            </p>
            <p className="text-lg font-bold capitalize tracking-wide text-white">{card.name || card.type}</p>
          </div>
          <div className="w-12 h-12 bg-white/30 rounded-full flex items-center justify-center backdrop-blur-sm">
            <CreditCard className="h-6 w-6 text-white" />
          </div>
        </div>

        {/* Middle section - Card number and expiry */}
        <div className="space-y-2">
          <div>
            <p className="text-xs text-white/90 mb-2 uppercase tracking-widest font-medium">Card Number</p>
            <p className="text-xl font-mono tracking-[0.2em] font-bold text-white">{cardNumberDisplay}</p>
          </div>
          <div>
            <p className="text-xs text-white/90 mb-1 uppercase tracking-widest font-medium">Expires</p>
            <p className="font-mono text-lg font-bold text-white">{expiryParts[0]}/{expiryParts[1]}</p>
          </div>
        </div>

        {/* Bottom section - Card holder */}
        <div>
          <p className="text-xs text-white/90 mb-1 uppercase tracking-widest font-medium">Card Holder</p>
          <p className="font-bold text-sm tracking-wide text-white">{card.cardHolder}</p>
        </div>
      </div>

      {/* Expiry status indicator */}
      {(isExpired || isExpiringSoon) && (
        <div className="absolute top-2 left-2 bg-white/40 backdrop-blur-xl rounded-xl px-3 py-1 border border-white/30 shadow-lg">
          <p className={`text-xs font-medium ${isExpired ? 'text-red-600' : 'text-orange-600'}`}>
            {isExpired ? 'EXPIRED' : 'EXPIRES SOON'}
          </p>
        </div>
      )}

      {/* Enhanced balance badge - moved back to bottom-right */}
      <div className="absolute bottom-2 right-2 bg-white/40 backdrop-blur-xl rounded-xl px-3 py-2 border border-white/30 shadow-lg">
        <p className="text-xs text-slate-800 uppercase tracking-widest font-medium">Balance</p>
        <p className="font-bold text-base text-slate-900">{formatCurrency(card.balance)}</p>
      </div>

      {/* Enhanced limit badge for credit cards - positioned based on expiry status */}
      {card.type === 'credit' && card.limit && (
        <div className={`absolute top-2 bg-white/40 backdrop-blur-xl rounded-xl px-3 py-2 border border-white/30 shadow-lg ${(isExpired || isExpiringSoon) ? 'right-16' : 'right-2'}`}>
          <p className="text-xs text-slate-800 uppercase tracking-widest font-medium">Limit</p>
          <p className="font-bold text-base text-slate-900">{formatCurrency(card.limit)}</p>
        </div>
      )}
    </div>
  );
}
