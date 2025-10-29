'use client';

import { Card as CardType } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { CreditCard } from 'lucide-react';

interface CardDisplayProps {
  card: CardType;
}

export function CardDisplay({ card }: CardDisplayProps) {
  const cardNumberDisplay = `•••• •••• •••• ${card.cardNumber.slice(-4)}`;
  const expiryParts = card.expiryDate.split('/');

  return (
    <div
      className="relative w-full h-56 rounded-2xl p-6 text-white shadow-2xl overflow-hidden group cursor-pointer transition-transform duration-300 hover:scale-105"
      style={{
        background: `linear-gradient(135deg, ${card.color} 0%, ${adjustColor(card.color, -20)} 100%)`,
      }}
    >
      {/* Glassmorphism overlay */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>

      {/* Card content */}
      <div className="relative z-10 h-full flex flex-col justify-between">
        {/* Top section */}
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs opacity-75 uppercase tracking-wider">Card Type</p>
            <p className="text-lg font-semibold capitalize">{card.type}</p>
          </div>
          <CreditCard className="h-8 w-8 opacity-90" />
        </div>

        {/* Middle section - Card number */}
        <div>
          <p className="text-sm opacity-75 mb-2">Card Number</p>
          <p className="text-xl font-mono tracking-widest">{cardNumberDisplay}</p>
        </div>

        {/* Bottom section */}
        <div className="flex justify-between items-end">
          <div>
            <p className="text-xs opacity-75 mb-1">Card Holder</p>
            <p className="font-semibold text-sm">{card.cardHolder}</p>
          </div>
          <div className="text-right">
            <p className="text-xs opacity-75 mb-1">Expires</p>
            <p className="font-mono text-sm">{expiryParts[0]}/{expiryParts[1]}</p>
          </div>
        </div>
      </div>

      {/* Balance badge */}
      <div className="absolute bottom-4 right-4 bg-white/20 backdrop-blur-md rounded-lg px-3 py-2 z-20">
        <p className="text-xs opacity-75">Balance</p>
        <p className="font-bold text-sm">{formatCurrency(card.balance)}</p>
      </div>

      {/* Limit badge if credit card */}
      {card.type === 'credit' && card.limit && (
        <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md rounded-lg px-3 py-2 z-20">
          <p className="text-xs opacity-75">Limit</p>
          <p className="font-bold text-sm">{formatCurrency(card.limit)}</p>
        </div>
      )}
    </div>
  );
}

// Helper function to adjust color brightness
function adjustColor(color: string, percent: number): string {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return '#' + (
    0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255)
  ).toString(16).slice(1);
}
