// AddCardForm.tsx
import { useState } from 'react';
import axios from 'axios';

const AddCardForm: React.FC<{ onCardAdded: () => void }> = ({ onCardAdded }) => {
  const [cardId, setCardId] = useState('');
  const [icCard, setIcCard] = useState('');
  const [isAvailable, setIsAvailable] = useState(false);
  const [currentUser, setCurrentUser] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/cards', {
        cardId,
        icCard,
        isAvailable,
        currentUser,
      });
      onCardAdded();
    } catch (error) {
      alert('Failed to add card');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        className="w-full border px-2 py-1 rounded"
        placeholder="Card ID"
        value={cardId}
        onChange={(e) => setCardId(e.target.value)}
        required
      />
      <input
        type="text"
        className="w-full border px-2 py-1 rounded"
        placeholder="IC Card"
        value={icCard}
        onChange={(e) => setIcCard(e.target.value)}
        required
      />
      <label className="block">
        <input
          type="checkbox"
          checked={isAvailable}
          onChange={(e) => setIsAvailable(e.target.checked)}
        />{' '}
        Available
      </label>
      <input
        type="text"
        className="w-full border px-2 py-1 rounded"
        placeholder="Current User"
        value={currentUser}
        onChange={(e) => setCurrentUser(e.target.value)}
      />
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
        Add Card
      </button>
    </form>
  );
};

export default AddCardForm;
