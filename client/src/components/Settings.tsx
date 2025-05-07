import { useState, useEffect } from 'react';
import axios from 'axios';
import AddCardForm from './AddCardForm';

interface Card {
  _id: string;
  cardId: string;
  icCard: string;
  isAvailable: boolean;
  currentUser: string;
}

const Settings: React.FC = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [editCard, setEditCard] = useState<Card | null>(null);

  // Fetch data from the API
  const fetchCards = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/cards');
      setCards(response.data);
    } catch (error) {
      setError('Failed to fetch cards. Please try again.');
    }
  };

  useEffect(() => {
    fetchCards(); // Fetch data when the component mounts
  }, []);

  // Handle Delete Card
  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`http://localhost:5000/api/cards/${id}`);
      fetchCards();
    } catch (error) {
      alert('Failed to delete the card.');
    }
  };

  // Handle Edit Card
  const handleEdit = (card: Card) => {
    setEditCard(card);
    setIsOpen(true);
  };

  // Handle Update Card
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCard) return;
    try {
      await axios.put(`http://localhost:5000/api/cards/${editCard._id}`, editCard);
      setEditCard(null);
      setIsOpen(false);
      fetchCards();
    } catch (error) {
      alert('Failed to update the card.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-4">Settings</h2>

      <button
        onClick={() => setIsOpen(true)}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Add New Card
      </button>

      {/* Modal for Add/Edit Card */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-25 z-50">
          <div className="flex items-center justify-center min-h-full p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
              <h3 className="text-lg font-medium mb-4">
                {editCard ? 'Edit Card' : 'Add New Card'}
              </h3>
              {editCard ? (
                <form onSubmit={handleUpdate} className="space-y-4">
                  <input
                    type="text"
                    className="w-full border px-2 py-1 rounded"
                    value={editCard.cardId}
                    onChange={(e) =>
                      setEditCard({ ...editCard, cardId: e.target.value })
                    }
                    required
                  />
                  <input
                    type="text"
                    className="w-full border px-2 py-1 rounded"
                    value={editCard.icCard}
                    onChange={(e) =>
                      setEditCard({ ...editCard, icCard: e.target.value })
                    }
                    required
                  />
                  <label className="block">
                    <input
                      type="checkbox"
                      checked={editCard.isAvailable}
                      onChange={(e) =>
                        setEditCard({
                          ...editCard,
                          isAvailable: e.target.checked,
                        })
                      }
                    />{' '}
                    Available
                  </label>
                  <input
                    type="text"
                    className="w-full border px-2 py-1 rounded"
                    value={editCard.currentUser}
                    onChange={(e) =>
                      setEditCard({ ...editCard, currentUser: e.target.value })
                    }
                  />
                  <button type="submit" className="bg-yellow-500 text-white px-4 py-2 rounded">
                    Update
                  </button>
                </form>
              ) : (
                <AddCardForm
                  onCardAdded={() => {
                    fetchCards();
                    setIsOpen(false);
                  }}
                />
              )}
              <button
                onClick={() => {
                  setIsOpen(false);
                  setEditCard(null);
                }}
                className="mt-4 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <h3 className="text-lg font-semibold mt-6">Existing Cards</h3>
      <table className="min-w-full mt-4 border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border p-2">Card ID</th>
            <th className="border p-2">IC Card</th>
            <th className="border p-2">Available</th>
            <th className="border p-2">Current User</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {cards.map((card) => (
            <tr key={card._id}>
              <td className="border p-2">{card.cardId}</td>
              <td className="border p-2">{card.icCard}</td>
              <td className="border p-2">{card.isAvailable ? 'Yes' : 'No'}</td>
              <td className="border p-2">{card.currentUser}</td>
              <td className="border p-2 space-x-2">
                <button
                  onClick={() => handleEdit(card)}
                  className="px-2 py-1 bg-yellow-400 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(card._id)}
                  className="px-2 py-1 bg-red-500 text-white rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {error && <div className="text-red-500 text-center mt-4">{error}</div>}
    </div>
  );
};

export default Settings;
