'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useAccessControl } from '@/lib/services/accessControlService';
import { CardDisplay } from '@/components/cards/CardDisplay';
import { Edit2, Trash2, Plus, Award } from 'lucide-react';
import { AuthGate } from '@/components/auth/AuthGate';
import { cardsService } from '@/lib/firebase/firestore';
import { Card } from '@/types';
import toast from 'react-hot-toast';
import { AddCardModal } from '@/components/cards/AddCardModal';
import { EditCardModal } from '@/components/cards/EditCardModal';

function CardsPageContent() {
  const { user } = useAuth();
  const { formatAmount } = useCurrency();
  const { canAddCard } = useAccessControl();
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  useEffect(() => {
    const loadCards = async () => {
      if (user) {
        try {
          const allCards = await cardsService.getAll();
          const userCards = allCards.filter(card => card.userId === user.uid);
          setCards(userCards);
        } catch (error) {
          console.error('Error loading cards:', error);
          toast.error('Failed to load cards');
        } finally {
          setLoading(false);
        }
      }
    };

    loadCards();
  }, [user]);

  const totalBalance = cards.reduce((sum, card) => sum + card.balance, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-amber-400 text-lg font-serif tracking-wider">Loading...</div>
      </div>
    );
  }

  const handleAddCardClick = async () => {
    if (!user) return;

    // Check if user can add a card based on their subscription
    const accessResult = await canAddCard();

    if (!accessResult.allowed) {
      if (accessResult.upgradeRequired) {
        toast.error(
          accessResult.reason || 'Upgrade your plan to add more cards',
          {
            duration: 5000,
            style: {
              background: '#1e293b',
              color: '#f1f5f9',
              border: '1px solid #f59e0b',
            },
          }
        );
        // TODO: Add upgrade prompt/modal here
      } else {
        toast.error(accessResult.reason || 'Cannot add card at this time');
      }
      return;
    }

    setShowModal(true);
  };

  const handleAddSuccess = async () => {
    setShowModal(false);
    // Refresh cards after adding
    if (user) {
      const userCards = await cardsService.getByUserId(user.uid);
      setCards(userCards);
    }
  };

  const handleEditSuccess = async () => {
    setShowEditModal(false);
    // Refresh cards after editing
    if (user) {
      const userCards = await cardsService.getByUserId(user.uid);
      setCards(userCards);
    }
  };

  const handleEditClick = (card: Card) => {
    setSelectedCard(card);
    setShowEditModal(true);
  };

  const handleDeleteClick = async (cardId: string) => {
    if (window.confirm('Are you sure you want to delete this card?')) {
      try {
        if (user) {
          await cardsService.delete(cardId);
          setCards(cards.filter(card => card.id !== cardId));
          toast.success('Card deleted successfully');
        }
      } catch (error) {
        console.error('Error deleting card:', error);
        toast.error('Failed to delete card');
      }
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 mx-auto space-y-6 sm:space-y-8 md:space-y-10 lg:space-y-12">
      {/* Add Card Modal */}
      <AddCardModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)}
        onSuccess={handleAddSuccess}
      />
      
      {selectedCard && (
        <EditCardModal
          card={selectedCard}
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedCard(null);
          }}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
        <div className="text-center sm:text-left">
          <div className="w-8 sm:w-12 md:w-16 h-0.5 bg-linear-to-r from-transparent via-amber-400 to-transparent mx-auto sm:mx-0 mb-3 sm:mb-4 md:mb-6"></div>
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-serif text-slate-100 mb-1 sm:mb-2 tracking-wide">
            P O R T F O L I O
          </h1>
          <div className="w-12 sm:w-16 md:w-20 h-0.5 bg-linear-to-r from-transparent via-amber-400 to-transparent mx-auto sm:mx-0 mb-3 sm:mb-4"></div>
          <p className="text-slate-400 text-xs sm:text-sm tracking-widest uppercase">Payment Methods</p>
        </div>
        <button
          onClick={handleAddCardClick}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 border border-amber-600 text-amber-400 hover:bg-amber-600/10 transition-colors tracking-wider uppercase text-sm rounded-md touch-manipulation min-h-[44px]"
        >
          <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
          Add Card
        </button>
      </div>

      {/* Total Balance */}
      <div className="bg-linear-to-br from-amber-900/30 via-slate-900/60 to-slate-900/30 border border-amber-700/40 rounded-lg p-6 sm:p-8 md:p-10 lg:p-12 backdrop-blur-sm">
        <div className="text-center">
          <div className="text-amber-400 text-xs tracking-widest uppercase mb-3 sm:mb-4 font-serif font-semibold">Total Balance</div>
          <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif text-slate-100 mb-2 font-bold">{formatAmount(totalBalance)}</div>
          <div className="text-slate-400 text-sm tracking-wider font-medium">Across {cards.length} Card{cards.length !== 1 ? 's' : ''}</div>
        </div>
      </div>

      {/* Cards Grid */}
      {cards.length > 0 ? (
        <div>
          <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="w-8 sm:w-12 h-0.5 bg-linear-to-r from-amber-600 to-transparent"></div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-serif text-slate-100 tracking-wide">Your Cards</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
            {cards.map((card) => (
              <div key={card.id} className="relative group">
                {/* Card Display */}
                <CardDisplay card={card} />
                
                {/* Action Overlay */}
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-in-out rounded-3xl flex items-center justify-center z-10">
                  <div className="flex flex-col sm:flex-row gap-3 bg-black/50 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <button
                      onClick={() => handleEditClick(card)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors duration-200 ease-in-out flex items-center gap-2 border border-blue-500/30"
                      aria-label="Edit card"
                    >
                      <Edit2 className="h-4 w-4" />
                      <span className="hidden sm:inline">Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteClick(card.id)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors duration-200 ease-in-out flex items-center gap-2 border border-red-500/30"
                      aria-label="Delete card"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 sm:py-16 md:py-20 border border-slate-800 bg-slate-900/40 rounded-lg backdrop-blur-sm">
          <div className="text-amber-400 mb-4">
            <Award className="h-12 w-12 sm:h-16 sm:w-16 mx-auto opacity-80" />
          </div>
          <h3 className="text-xl sm:text-2xl font-serif text-slate-100 mb-3 font-semibold">No Cards Yet</h3>
          <p className="text-slate-300 mb-6 sm:mb-8 text-sm sm:text-base tracking-wide px-4 font-medium">Begin your premium financial journey</p>
          <button
            onClick={handleAddCardClick}
            className="px-6 py-3 border-2 border-amber-600 text-amber-400 hover:bg-amber-600/20 hover:border-amber-500 transition-colors tracking-wider uppercase text-sm rounded-md touch-manipulation min-h-[44px] font-semibold shadow-lg hover:shadow-amber-500/20"
          >
            Add Your First Card
          </button>
        </div>
      )}
    </div>
  );
}

export default function CardsPage() {
  return (
    <AuthGate>
      <CardsPageContent />
    </AuthGate>
  );
}
