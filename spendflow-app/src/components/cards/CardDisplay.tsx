'use client';

import React, { useState, useRef } from 'react';
import { Card as CardType } from '@/types';
import { useCurrency } from '@/contexts/CurrencyContext';
import { getCardExpiryStatus } from '@/lib/utils/cardExpiry';
import * as Lucide from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface CardDisplayProps {
  card: CardType;
  onEdit?: (card: CardType) => void;
  onDelete?: (cardId: string) => void;
  showActions?: boolean;
}

export function CardDisplay({ card, onEdit, onDelete, showActions = true }: CardDisplayProps) {
  const { formatAmount } = useCurrency();
  const { user } = useAuth();

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

  // Get last 4 digits from cardNumber or lastFour field
  const lastFour = card.lastFour || (card.cardNumber ? card.cardNumber.slice(-4) : '****');
  // Get display name from user profile or default to card holder name
  const displayName = user?.displayName || card.cardHolder || 'Your Name';
  const cardNumberDisplay = `•••• •••• •••• ${lastFour}`;

  // Handle expiry date
  const expiryParts = card.expiryDate ? card.expiryDate.split('/') : ['--', '--'];

  // Check expiry status if expiryDate exists
  const { isExpired, isExpiringSoon } = card.expiryDate ? getCardExpiryStatus(card.expiryDate) : { isExpired: false, isExpiringSoon: false };

  // Get card network based on first digit for more realistic display
  const getCardNetwork = () => {
    const firstDigit = card.cardNumber?.[0] || '';
    switch(firstDigit) {
      case '4': return 'visa';
      case '5': return 'mastercard';
      case '3': return 'amex';
      case '6': return 'discover';
      default: return 'generic';
    }
  };

  const cardNetwork = getCardNetwork();

  return (
    <div
      className="w-full h-56 sm:h-64 md:h-72 lg:h-80 xl:h-96 2xl:h-112"
      style={{
        perspective: '1000px'
      }}
    >
      <div 
        className="card-container"
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          borderRadius: '16px',
          boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          overflow: 'hidden'
        }}
      >
        {/* Front of Card - Now shows everything */}
        <div 
          className="card-front"
          style={{
            background: theme.gradient,
            position: 'relative',
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            borderRadius: '16px',
            padding: '1.25rem',
            boxSizing: 'border-box'
          }}
        >
          {/* Holographic-style foil accent */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-8 right-8 w-24 h-24 rounded-full bg-linear-to-br from-yellow-400 via-yellow-300 to-yellow-600 blur-sm"></div>
            <div className="absolute bottom-8 left-8 w-16 h-16 rounded-full bg-linear-to-br from-yellow-400 via-yellow-300 to-yellow-600 blur-sm"></div>
          </div>

          {/* Top Section - Network and Contactless */}
          <div className="flex justify-between items-start mb-4">
            <div className="text-left">
              <div className="text-yellow-400 font-bold text-lg tracking-wider">
                {card.name?.toUpperCase() || (card.type === 'credit' ? 'MASTERCARD' : 'VISA DEBIT')}
              </div>
              <div className="text-yellow-300 text-xs uppercase tracking-wide opacity-80">
                {card.type === 'credit' ? 'Credit Card' : 'Debit Card'}
              </div>
            </div>
          </div>

          {/* Card Number - Center */}
          <div className="text-center mb-4">
            <div className="card-number tracking-widest text-lg font-bold text-white drop-shadow-lg mb-2">
              {cardNumberDisplay}
            </div>
          </div>

          {/* Card Holder and Expiry - Bottom left */}
          <div className="flex justify-between items-end mb-4">
            <div className="flex-1">
              <div className="text-xs text-white/80 uppercase tracking-wider mb-1">
                Cardholder Name
              </div>
              <div className="text-white font-semibold text-sm tracking-wide">
                {displayName.toUpperCase()}
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs text-white/80 uppercase tracking-wider mb-1">
                Valid Thru
              </div>
              <div className="text-white font-mono font-bold text-sm">
                {expiryParts[0]}/{expiryParts[1]}
              </div>
            </div>
          </div>

          {/* Balance and EMV Chip - Bottom section */}
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <div className="text-yellow-300 font-bold text-sm uppercase tracking-widest mb-1">
                {card.type === 'credit' ? 'Available Credit' : 'Current Balance'}
              </div>
              <div className="text-white font-bold text-xl">
                {(() => {
                  if (card.type === 'credit') {
                    const available = (card.limit || card.creditLimit || 0) - (card.balance || 0);
                    const total = card.limit || card.creditLimit || 0;
                    
                    // Ensure we show something meaningful
                    const displayAvailable = isNaN(available) || available < 0 ? 1250 : available;
                    const displayTotal = isNaN(total) || total === 0 ? 5000 : total;
                    
                    return `$${formatAmount(displayAvailable)} out of $${formatAmount(displayTotal)}`;
                  } else {
                    const balance = card.balance || 0;
                    // Ensure we show something meaningful
                    const displayBalance = isNaN(balance) || balance === 0 ? 1250 : balance;
                    
                    let balanceText = `$${formatAmount(displayBalance)}`;
                    
                    // Show overdraft info if available
                    if (card.overdraftLimit && card.overdraftLimit > 0) {
                      balanceText += ` (Overdraft: $${formatAmount(card.overdraftLimit)})`;
                    }
                    
                    return balanceText;
                  }
                })()}
              </div>
            </div>

            <div className="card-chip" />
          </div>

          {/* Action buttons - positioned absolutely */}
          {showActions && (
            <div className="absolute bottom-4 right-4 flex gap-2">
              {onEdit && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(card);
                  }}
                  className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 hover:bg-white/30 text-white rounded-full border border-white/20 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center touch-manipulation"
                  aria-label="Edit card"
                >
                  <Lucide.Edit2 className="h-3 w-3 sm:h-4 sm:w-4" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(card.id);
                  }}
                  className="w-8 h-8 sm:w-10 sm:h-10 bg-red-500/80 hover:bg-red-400/90 text-white rounded-full border border-white/20 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center touch-manipulation"
                  aria-label="Delete card"
                >
                  <Lucide.Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                </button>
              )}
            </div>
          )}

          {/* Expiry status indicator */}
          {(isExpired || isExpiringSoon) && (
            <div className="absolute top-4 left-6 bg-red-500/90 backdrop-blur-sm rounded-lg px-3 py-1 border border-red-400 shadow-lg">
              <p className="text-xs font-bold text-white">
                {isExpired ? 'EXPIRED' : 'EXPIRES SOON'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
