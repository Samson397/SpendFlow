'use client';

import React from 'react';
import { Card as CardType } from '@/types';
import { useCurrency } from '@/contexts/CurrencyContext';
import { getCardExpiryStatus } from '@/lib/utils/cardExpiry';
import { CreditCard } from 'lucide-react';

interface CardDisplayProps {
  card: CardType;
}

export function CardDisplay({ card }: CardDisplayProps) {
  const { formatAmount } = useCurrency();
  // Get last 4 digits from cardNumber or lastFour field
  const lastFour = card.lastFour || (card.cardNumber ? card.cardNumber.slice(-4) : '****');
  const cardNumberDisplay = `•••• •••• •••• ${lastFour}`;

  // Handle expiry date
  const expiryParts = card.expiryDate ? card.expiryDate.split('/') : ['--', '--'];

  // Check expiry status if expiryDate exists
  const { isExpired, isExpiringSoon } = card.expiryDate ? getCardExpiryStatus(card.expiryDate) : { isExpired: false, isExpiringSoon: false };

  // Enhanced color schemes - use stored color or fall back to type-based themes
  const getCardTheme = (card: CardType) => {
    // If card has a custom color (any color that's not empty), use it
    if (card.color && card.color.trim() !== '') {
      const hexColor = card.color.startsWith('#') ? card.color : `#${card.color}`;
      // Create a gradient using the selected color
      return {
        gradient: `linear-gradient(135deg, ${hexColor}cc 0%, ${hexColor} 50%, ${hexColor}aa 100%)`,
        accent: hexColor
      };
    }

    // Fall back to type-based themes
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
    return themes[card.type as keyof typeof themes] || themes.default;
  };

  const theme = getCardTheme(card);

  return (
    <div
      className="relative w-full h-56 sm:h-56 md:h-64 lg:h-72 rounded-2xl sm:rounded-3xl p-3 sm:p-4 md:p-5 lg:p-6 text-white shadow-2xl overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-3xl"
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
        {/* Top section - Compact grouped layout */}
        <div className="space-y-1">
          {/* Card Type and Name */}
          <div className="flex items-center justify-between">
            <div className="text-xs text-white/90 uppercase tracking-widest font-medium">
              {card.type === 'credit' ? 'Credit Card' : card.type === 'debit' ? 'Debit Card' : 'Card'} - ({card.name || card.type})
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/30 rounded-full flex items-center justify-center backdrop-blur-sm shrink-0">
              {/* @ts-expect-error Conflicting React types between lucide-react and project */}
              <CreditCard className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
            </div>
          </div>
          {/* Expiry Date with label */}
          <div className="text-xs text-white/80 uppercase tracking-widest font-medium">
            Expires - ({expiryParts[0]}/{expiryParts[1]})
          </div>
        </div>

        {/* Middle section - Card number and card holder */}
        <div className="space-y-1 sm:space-y-2">
          <div>
            <p className="text-xs text-white/90 uppercase tracking-widest font-medium">Card Number</p>
            <p className="text-xs sm:text-sm md:text-base font-mono tracking-wide sm:tracking-wider md:tracking-widest font-bold text-white break-all">{cardNumberDisplay}</p>
            <p className="font-bold text-sm sm:text-base md:text-lg tracking-wide text-white truncate mt-1" title={card.cardHolder}>
              {card.cardHolder || 'Card Holder'}
            </p>
          </div>
        </div>

        {/* Bottom section - Balance */}
        <div className="flex justify-between items-end">
          <div className="flex-1">
            {card.type === 'credit' ? (
              <>
                <p className="text-xs text-white/90 uppercase tracking-widest font-medium">Available Credit</p>
                <p className="font-bold text-sm sm:text-base md:text-lg lg:text-xl text-white">
                  {formatAmount((card.limit || 0) - card.balance)}
                </p>
                {card.limit && (
                  <p className="text-xs text-white/70 mt-1">
                    Used: {formatAmount(card.balance)} / {formatAmount(card.limit)}
                  </p>
                )}
              </>
            ) : (
              <>
                <p className="text-xs text-white/90 uppercase tracking-widest font-medium">
                  {card.balance < 0 ? 'Overdraft' : 'Balance'}
                </p>
                <p className={`font-bold text-sm sm:text-base md:text-lg lg:text-xl ${card.balance < 0 ? 'text-red-300' : 'text-white'}`}>
                  {formatAmount(Math.abs(card.balance))}
                </p>
                {card.balance < 0 && card.overdraftLimit && (
                  <p className="text-xs text-red-200 mt-1">
                    Limit: {formatAmount(card.overdraftLimit)}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Expiry status indicator - Centered */}
      {(isExpired || isExpiringSoon) && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/40 backdrop-blur-xl rounded-xl px-3 py-1 border border-white/30 shadow-lg z-10">
          <p className={`text-xs font-medium ${isExpired ? 'text-red-600' : 'text-orange-600'}`}>
            {isExpired ? 'EXPIRED' : 'EXPIRES SOON'}
          </p>
        </div>
      )}
    </div>
  );
}
