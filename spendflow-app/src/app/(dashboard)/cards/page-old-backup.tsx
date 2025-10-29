'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, CreditCard, TrendingUp, DollarSign, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { cardsService } from '@/lib/firebase/firestore';
import { Card as CardType } from '@/types';

export default function CardsPage() {
  const { user } = useAuth();
  const [cards, setCards] = useState<CardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    loadCards();
  }, [user]);

  const loadCards = async () => {
    try {
      setLoading(true);
      const data = await cardsService.getByUserId(user!.uid);
      setCards(data);
    } catch (error) {
      console.error('Error loading cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    if (confirm('Are you sure you want to delete this card?')) {
      try {
        await cardsService.delete(cardId);
        loadCards();
      } catch (error) {
        console.error('Error deleting card:', error);
      }
    }
  };

  const totalBalance = cards.reduce((sum, card) => sum + card.balance, 0);
  const creditCards = cards.filter(c => c.type === 'credit');
  const debitCards = cards.filter(c => c.type === 'debit');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">My Cards</h1>
          <p className="text-slate-400 mt-1">Manage your payment methods</p>
        </div>
        <button
          onClick={() => {/* Add card modal */}}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Plus className="h-5 w-5" />
          Add Card
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-xl shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white/20 rounded-lg">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <span className="text-white/80 text-sm font-medium">Total Balance</span>
          </div>
          <div className="text-3xl font-bold text-white">${totalBalance.toLocaleString()}</div>
          <div className="text-white/60 text-sm mt-2">Across {cards.length} cards</div>
        </div>

        <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <CreditCard className="h-6 w-6 text-green-500" />
            </div>
            <span className="text-slate-400 text-sm font-medium">Credit Cards</span>
          </div>
          <div className="text-2xl font-bold text-white">{creditCards.length}</div>
          <div className="text-slate-500 text-sm mt-2">
            ${creditCards.reduce((sum, c) => sum + c.balance, 0).toLocaleString()} total
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-500" />
            </div>
            <span className="text-slate-400 text-sm font-medium">Debit Cards</span>
          </div>
          <div className="text-2xl font-bold text-white">{debitCards.length}</div>
          <div className="text-slate-500 text-sm mt-2">
            ${debitCards.reduce((sum, c) => sum + c.balance, 0).toLocaleString()} total
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      {cards.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => (
            <div
              key={card.id}
              className="group relative"
            >
              {/* Card */}
              <div
                className="relative h-52 rounded-2xl p-6 shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-3xl"
                style={{
                  background: `linear-gradient(135deg, ${card.color || '#3b82f6'} 0%, ${adjustColor(card.color || '#3b82f6', -30)} 100%)`,
                }}
              >
                {/* Card Type Badge */}
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium text-white">
                    {card.type.toUpperCase()}
                  </span>
                </div>

                {/* Card Content */}
                <div className="flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <CreditCard className="h-5 w-5 text-white/80" />
                      <span className="text-white/80 text-sm font-medium">{card.name}</span>
                    </div>
                  </div>

                  <div>
                    {/* Balance */}
                    <div className="mb-4">
                      <div className="text-white/70 text-xs mb-1">Balance</div>
                      <div className="text-3xl font-bold text-white">
                        ${card.balance.toLocaleString()}
                      </div>
                    </div>

                    {/* Card Number */}
                    <div className="flex items-center justify-between">
                      <div className="text-white/90 text-lg font-mono tracking-wider">
                        •••• •••• •••• {card.lastFour}
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm"></div>
                        <div className="w-8 h-8 rounded-full bg-white/30 backdrop-blur-sm -ml-3"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Shine Effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>

              {/* Action Menu */}
              <div className="absolute top-2 right-2 z-10">
                <button
                  onClick={() => setActiveMenu(activeMenu === card.id ? null : card.id)}
                  className="p-2 bg-black/20 backdrop-blur-sm rounded-lg hover:bg-black/30 transition-colors"
                >
                  <MoreVertical className="h-4 w-4 text-white" />
                </button>

                {activeMenu === card.id && (
                  <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden">
                    <button
                      onClick={() => {/* Edit */}}
                      className="w-full flex items-center gap-3 px-4 py-3 text-slate-200 hover:bg-slate-700 transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                      <span className="text-sm">Edit Card</span>
                    </button>
                    <button
                      onClick={() => handleDeleteCard(card.id)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-slate-700 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="text-sm">Delete Card</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center">
          <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No cards yet</h3>
          <p className="text-slate-400 mb-6">Add your first card to start tracking your finances</p>
          <button
            onClick={() => {/* Add card modal */}}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Add Your First Card
          </button>
        </div>
      )}
    </div>
  );
}

// Helper function to adjust color brightness
function adjustColor(color: string, amount: number): string {
  const hex = color.replace('#', '');
  const num = parseInt(hex, 16);
  const r = Math.max(0, Math.min(255, (num >> 16) + amount));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
  const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}
