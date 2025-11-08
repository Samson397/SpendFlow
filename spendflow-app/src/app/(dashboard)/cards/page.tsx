'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useAccessControl } from '@/lib/services/accessControlService';
import { CardDisplay } from '@/components/cards/CardDisplay';
import * as Lucide from 'lucide-react';
import { AuthGate } from '@/components/auth/AuthGate';
import { useCards } from '@/hooks/useCards';
import { cardsService } from '@/lib/firebase/firestore';
import { Card } from '@/types';
import toast from 'react-hot-toast';
import { AddCardModal } from '@/components/cards/AddCardModal';
import { EditCardModal } from '@/components/cards/EditCardModal';

function CardsPageContent() {
  const { user } = useAuth();
  const { formatAmount } = useCurrency();
  const { canAddCard } = useAccessControl();

  // Real-time data hook
  const { cards, loading } = useCards(user?.uid);

  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [cardToDelete, setCardToDelete] = useState<Card | null>(null);

  // Removed total balance calculation as it was confusing to aggregate credit available and debit balances

  // Show loading only when we have cards but they're still loading
  // If no cards exist, show the no-cards state immediately for instant UX
  if (loading && cards.length > 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-amber-400 text-lg font-serif tracking-wider">Loading...</div>
      </div>
    );
  }

  const handleAddSuccess = () => {
    setShowModal(false);
    // Data updates automatically through real-time hooks
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    setSelectedCard(null);
    // Data updates automatically through real-time hooks
  };

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

  const handleEditClick = (card: Card) => {
    setSelectedCard(card);
    setShowEditModal(true);
  };

  const handleDeleteClick = (card: Card) => {
    setCardToDelete(card);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!cardToDelete) return;

    try {
      if (user) {
        await cardsService.delete(cardToDelete.id);
        // Data will update automatically through real-time hooks
        toast.success('Card deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting card:', error);
      toast.error('Unable to delete this card. Please try again or contact support if the problem persists.');
    } finally {
      setShowDeleteModal(false);
      setCardToDelete(null);
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
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && cardToDelete && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowDeleteModal(false)}>
          <div className="bg-slate-950 border border-red-700/30 rounded-lg shadow-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-600/20 rounded-full flex items-center justify-center">
                  <Lucide.AlertTriangle className="h-6 w-6 text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-serif text-slate-100 tracking-wide">Delete Card</h3>
                  <p className="text-sm text-slate-400">This action cannot be undone</p>
                </div>
              </div>
              
              <div className="mb-6">
                <p className="text-slate-300 mb-2">
                  Are you sure you want to delete this card?
                </p>
                <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                  <p className="text-slate-200 font-medium">{cardToDelete.name || 'Unnamed Card'}</p>
                  <p className="text-slate-400 text-sm">****{cardToDelete.lastFour || '****'}</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-700 text-slate-400 hover:bg-slate-800 transition-colors tracking-wider uppercase text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-slate-900 hover:bg-red-500 transition-colors tracking-wider uppercase text-sm font-semibold"
                >
                  Delete Card
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
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
        
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button
            onClick={handleAddCardClick}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 border border-amber-600 text-amber-400 hover:bg-amber-600/10 transition-colors tracking-wider uppercase text-sm rounded-md touch-manipulation min-h-[44px]"
          >
            <Lucide.Plus className="h-4 w-4 sm:h-5 sm:w-5" />
            Add Card
          </button>
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
              <CardDisplay
                key={card.id}
                card={card}
                onEdit={handleEditClick}
                onDelete={(cardId) => {
                  const cardToDelete = cards.find(c => c.id === cardId);
                  if (cardToDelete) handleDeleteClick(cardToDelete);
                }}
                showActions={!(showModal || showEditModal || showDeleteModal)}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 sm:py-16 md:py-20 border border-slate-800 bg-slate-900/40 rounded-lg backdrop-blur-sm">
          <div className="text-amber-400 mb-4">
            <Lucide.Award className="h-12 w-12 sm:h-16 sm:w-16 mx-auto opacity-80" />
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
