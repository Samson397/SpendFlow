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
          const userCards = await cardsService.getByUserId(user.uid);
          setCards(userCards);
        } catch (error) {
          console.error('Error loading cards:', error);
          toast.error('Unable to load your cards. Please refresh the page or try again later.');
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

    // Open modal immediately without waiting for permission check
    setShowModal(true);

    // Check permissions in background and close modal if not allowed
    try {
      const accessResult = await canAddCard();

      if (!accessResult.allowed) {
        setShowModal(false); // Close modal if not allowed

        if (accessResult.upgradeRequired) {
          toast.error(
            accessResult.reason || 'You\'ve reached your card limit. Upgrade to add more cards to your SpendFlow account.',
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
          toast.error(accessResult.reason || 'Unable to add cards at this time. Please check your account status or contact support.');
        }
      }
    } catch (error) {
      console.error('Error checking card permissions:', error);
      setShowModal(false);
      toast.error('Unable to verify permissions. Please try again.');
    }
  };

  const handleAddSuccess = async () => {
    setShowModal(false);
    // Refresh cards after adding - optimize by not awaiting
    if (user) {
      cardsService.getByUserId(user.uid).then(userCards => {
        setCards(userCards);
      }).catch(error => {
        console.error('Error refreshing cards after add:', error);
        // Fallback: reload page or show error
        window.location.reload();
      });
    }
  };

  const handleEditSuccess = async () => {
    setShowEditModal(false);
    setSelectedCard(null);
    // Refresh cards after editing - optimize by not awaiting
    if (user) {
      cardsService.getByUserId(user.uid).then(userCards => {
        setCards(userCards);
      }).catch(error => {
        console.error('Error refreshing cards after edit:', error);
        // Fallback: reload page or show error
        window.location.reload();
      });
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
        toast.error('Unable to delete this card. Please try again or contact support if the problem persists.');
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
          {/* @ts-expect-error Conflicting React types between lucide-react and project */}
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

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
            {cards.map((card) => (
              <div key={card.id} className="relative">
                <CardDisplay card={card} />
                
                {/* Action Buttons - Modern Design - Hidden when modals are open or sidebar is open */}
                {!(showModal || showEditModal) && (
                  <div className="absolute top-4 right-4 flex gap-2 z-20">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditClick(card);
                      }}
                      className="group relative w-10 h-10 bg-white/20 hover:bg-white/30 active:bg-white/40 backdrop-blur-md border-2 border-white/30 hover:border-white/40 text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-200 flex items-center justify-center touch-manipulation"
                      aria-label="Edit card"
                    >
                      {/* @ts-expect-error Conflicting React types between lucide-react and project */}
                      <Edit2 className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                      <div className="absolute inset-0 rounded-full bg-linear-to-br from-blue-500/30 to-purple-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(card.id);
                      }}
                      className="group relative w-10 h-10 bg-white/20 hover:bg-white/30 active:bg-white/40 backdrop-blur-md border-2 border-white/30 hover:border-white/40 text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-200 flex items-center justify-center touch-manipulation"
                      aria-label="Delete card"
                    >
                      {/* @ts-expect-error Conflicting React types between lucide-react and project */}
                      <Trash2 className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                      <div className="absolute inset-0 rounded-full bg-linear-to-br from-red-500/30 to-orange-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 sm:py-16 md:py-20 border border-slate-800 bg-slate-900/40 rounded-lg backdrop-blur-sm">
          <div className="text-amber-400 mb-4">
            {/* @ts-expect-error Conflicting React types between lucide-react and project */}
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
