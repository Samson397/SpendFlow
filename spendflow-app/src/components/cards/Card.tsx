import { Card as CardType } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface CardProps {
  card: CardType;
  onEdit: () => void;
  onDelete: () => void;
  isDemo?: boolean;
}

export function Card({ card, onEdit, onDelete, isDemo = false }: CardProps) {
  const cardType = card.type === 'credit' ? 'CREDIT' : 'DEBIT';
  const balance = formatCurrency(card.balance);
  const limit = card.creditLimit ? formatCurrency(card.creditLimit) : null;
  const available = card.creditLimit 
    ? formatCurrency(card.creditLimit - card.balance) 
    : null;

  return (
    <div className={`relative overflow-hidden rounded-xl p-5 transition-all ${card.color} text-white`}>
      <div className="flex justify-between items-start mb-6">
        <div>
          <p className="text-sm font-medium text-white/80">{card.name}</p>
          <p className="text-2xl font-bold mt-1">
            {card.cardNumber.replace(/\d{4}(?=\d{4})/g, '•••• ')}
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1">
          <span className="text-xs font-semibold tracking-wider">{cardType}</span>
        </div>
      </div>

      <div className="flex justify-between items-end">
        <div>
          <p className="text-xs text-white/70 mb-1">Card Holder</p>
          <p className="text-sm font-medium">{card.cardHolder.toUpperCase()}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-white/70 mb-1">Expires</p>
          <p className="text-sm font-medium">{card.expiryDate}</p>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-white/10">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs text-white/70 mb-1">Balance</p>
            <p className="text-lg font-bold">{balance}</p>
          </div>
          {limit && (
            <div className="text-right">
              <p className="text-xs text-white/70 mb-1">Available</p>
              <p className="text-sm font-medium">{available}</p>
            </div>
          )}
        </div>
      </div>

      {isDemo && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-end p-4 opacity-0 hover:opacity-100 transition-opacity">
          <div className="flex space-x-2">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              aria-label="Edit card"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              aria-label="Delete card"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
