'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Plus, Award, Edit2, Trash2 } from 'lucide-react';
import { cardsService } from '@/lib/firebase/firestore';
import { Card as CardType } from '@/types';
import { AddCardModal } from '@/components/cards/AddCardModal';
import { EditCardModal } from '@/components/cards/EditCardModal';
import toast from 'react-hot-toast';

export default function CardsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { formatAmount } = useCurrency();
  const [cards, setCards] = useState<CardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);

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

  const totalBalance = cards.reduce((sum, card) => sum + card.balance, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-amber-400 text-lg font-serif tracking-wider">Loading...</div>
      </div>
    );
  }

  const handleAddCard = () => {
    setShowModal(true);
  };

  const handleEditCard = (card: CardType) => {
    setSelectedCard(card);
    setShowEditModal(true);
  };

  const handleDeleteCard = async (card: CardType) => {
    if (window.confirm(`Delete ${card.type} card? This will delete all associated transactions.`)) {
      try {
        await cardsService.delete(card.id);
        toast.success('Card deleted successfully!');
        loadCards();
      } catch (error) {
        console.error('Error deleting card:', error);
        toast.error('Failed to delete card');
      }
    }
  };

  const handleSuccess = () => {
    loadCards();
  };

  return (
    <div className="space-y-12">
      {/* Add Card Modal */}
      <AddCardModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        onSuccess={handleSuccess}
      />
      
      {selectedCard && (
        <EditCardModal
          card={selectedCard}
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedCard(null);
          }}
          onSuccess={handleSuccess}
        />
      )}
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif text-slate-100 mb-2 tracking-wide">
            P O R T F O L I O
          </h1>
          <p className="text-slate-400 text-sm tracking-widest uppercase">Payment Methods</p>
        </div>
        <button
          onClick={handleAddCard}
          className="flex items-center gap-2 px-6 py-3 border border-amber-600 text-amber-400 hover:bg-amber-600/10 transition-colors tracking-wider uppercase text-sm"
        >
          <Plus className="h-5 w-5" />
          Add Card
        </button>
      </div>

      {/* Total Balance */}
      <div className="bg-gradient-to-br from-amber-900/20 via-slate-900/50 to-slate-900/20 border border-amber-700/30 rounded-sm p-12 backdrop-blur-sm">
        <div className="text-center">
          <div className="text-amber-400/60 text-xs tracking-widest uppercase mb-4 font-serif">Total Balance</div>
          <div className="text-6xl font-serif text-slate-100 mb-2">{formatAmount(totalBalance)}</div>
          <div className="text-slate-500 text-sm tracking-wider">Across {cards.length} Premium Accounts</div>
        </div>
      </div>

      {/* Cards Grid */}
      {cards.length > 0 ? (
        <div>
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-0.5 bg-gradient-to-r from-amber-600 to-transparent"></div>
            <h2 className="text-2xl font-serif text-slate-100 tracking-wide">Your Cards</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {cards.map((card) => (
              <div
                key={card.id}
                className="border border-slate-800 p-8 backdrop-blur-sm hover:shadow-lg transition-all group relative overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${card.color}15 0%, ${card.color}05 50%, transparent 100%)`,
                }}
              >
                <div className="border-l-4 pl-6" style={{ borderColor: card.color }}>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <div className="text-slate-500 text-xs tracking-widest uppercase mb-2 font-serif">
                        {card.type}
                      </div>
                      <div className="text-2xl font-serif text-slate-100">{card.name || card.type}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditCard(card)}
                        className="p-2 text-slate-400 hover:text-amber-400 transition-colors opacity-0 group-hover:opacity-100"
                        title="Edit card"
                      >
                        <Edit2 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCard(card)}
                        className="p-2 text-slate-400 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete card"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                      <Award className="h-6 w-6 text-amber-400" />
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="text-slate-600 text-xs tracking-wider mb-2">Balance</div>
                    <div className="text-4xl font-serif text-slate-100">{formatAmount(card.balance)}</div>
                  </div>

                  <div className="text-slate-500 font-mono tracking-wider">
                    •••• •••• •••• {card.lastFour || '****'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-16 border border-slate-800 bg-slate-900/30">
          <div className="text-amber-400 mb-4">
            <Award className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-2xl font-serif text-slate-100 mb-3">No Cards Yet</h3>
          <p className="text-slate-400 mb-8 tracking-wide">Begin your premium financial journey</p>
          <button 
            onClick={handleAddCard}
            className="px-6 py-3 border border-amber-600 text-amber-400 hover:bg-amber-600/10 transition-colors tracking-wider uppercase text-sm"
          >
            Add Your First Card
          </button>
        </div>
      )}
    </div>
  );
}
