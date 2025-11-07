'use client';

import { useCurrency } from '@/contexts/CurrencyContext';

interface Card {
  id: string;
  name?: string;
  type: 'credit' | 'debit';
  balance: number;
  lastFour?: string;
  cardHolder?: string;
}

interface CardsBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: Card[];
  type: 'credit' | 'debit';
}

export function CardsBreakdownModal({ isOpen, onClose, cards, type }: CardsBreakdownModalProps) {
  const { formatAmount } = useCurrency();

  if (!isOpen) return null;

  const filteredCards = cards.filter(card => card.type === type);
  const totalBalance = filteredCards.reduce((sum, card) => sum + card.balance, 0);
  const title = type === 'credit' ? 'Credit Cards' : 'Debit Cards';

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-slate-950 border border-amber-700/30 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div>
            <h2 className="text-2xl font-serif text-slate-100 tracking-wide mb-1">
              {title.toUpperCase()}
            </h2>
            <p className="text-slate-500 text-sm tracking-wider">
              {filteredCards.length} {filteredCards.length === 1 ? 'Card' : 'Cards'} • Total: {formatAmount(totalBalance)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            <span className="text-lg">×</span>
          </button>
        </div>

        {/* Cards List */}
        <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
          {filteredCards.length > 0 ? (
            filteredCards.map((card) => (
              <div
                key={card.id}
                className="bg-slate-900 border border-slate-800 rounded-lg p-6 hover:border-amber-600/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${
                      type === 'credit' 
                        ? 'bg-blue-900/20 text-blue-400' 
                        : 'bg-green-900/20 text-green-400'
                    }`}>
                      <span className="text-2xl">💳</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-serif text-slate-100 mb-1">
                        {card.name || `${type === 'credit' ? 'Credit' : 'Debit'} Card`}
                      </h3>
                      <div className="space-y-1">
                        {card.cardHolder && (
                          <p className="text-sm text-slate-400">
                            {card.cardHolder}
                          </p>
                        )}
                        {card.lastFour && (
                          <p className="text-sm text-slate-500 font-mono">
                            •••• {card.lastFour}
                          </p>
                        )}
                        <p className="text-xs text-slate-600 uppercase tracking-wider">
                          {type === 'credit' ? 'Available Credit' : 'Available Balance'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-serif ${
                      type === 'credit' ? 'text-blue-400' : 'text-green-400'
                    }`}>
                      {formatAmount(card.balance)}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💳</span>
              </div>
              <p className="text-slate-400 font-serif">No {type} cards found</p>
              <p className="text-slate-600 text-sm mt-2">Add a card to get started</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-slate-800 bg-slate-900/50">
          <div>
            <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Total {type === 'credit' ? 'Available Credit' : 'Balance'}</p>
            <p className="text-3xl font-serif text-slate-100">{formatAmount(totalBalance)}</p>
          </div>
          <button
            onClick={onClose}
            className="px-6 py-3 border border-amber-600 text-amber-400 hover:bg-amber-600/10 transition-colors font-serif tracking-wider uppercase text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
