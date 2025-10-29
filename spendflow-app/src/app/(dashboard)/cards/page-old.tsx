'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Trash2, Lock } from 'lucide-react';
import { cardsService } from '@/lib/firebase/firestore';
import { Card as CardType } from '@/types';
import { CardModal } from '@/components/cards/CardModal';
import { CardDisplay } from '@/components/cards/CardDisplay';

export default function CardsPage() {
  const { user } = useAuth();
  const [cards, setCards] = useState<CardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCard, setEditingCard] = useState<CardType | null>(null);

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

  const handleAddCard = () => {
    setEditingCard(null);
    setShowModal(true);
  };

  const handleEditCard = (card: CardType) => {
    setEditingCard(card);
    setShowModal(true);
  };

  const handleDeleteCard = async (cardId: string) => {
    if (confirm('Are you sure you want to delete this card?')) {
      try {
        await cardsService.delete(cardId);
        setCards(cards.filter(c => c.id !== cardId));
      } catch (error) {
        console.error('Error deleting card:', error);
      }
    }
  };

  const handleSaveCard = async () => {
    await loadCards();
    setShowModal(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">My Cards</h1>
        <Button onClick={handleAddCard} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" />
          Add Card
        </Button>
      </div>

      {cards.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Lock className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4">No cards added yet</p>
            <Button onClick={handleAddCard} variant="outline">
              Add Your First Card
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <div key={card.id} className="relative group">
              <CardDisplay card={card} />
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                <button
                  onClick={() => handleEditCard(card)}
                  className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
                >
                  <Edit2 className="h-4 w-4 text-blue-600" />
                </button>
                <button
                  onClick={() => handleDeleteCard(card.id)}
                  className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <CardModal
          card={editingCard}
          onClose={() => setShowModal(false)}
          onSave={handleSaveCard}
        />
      )}
    </div>
  );
}
