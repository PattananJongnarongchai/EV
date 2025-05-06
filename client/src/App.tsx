import React, { useState, useEffect } from 'react';
import './App.css';
import UserHistory from './UserHistory';
import Navbar from './components/Navbar';

interface Card {
  _id: string;
  cardId: string;
  isAvailable: boolean;
}

interface Usage {
  _id: string;
  cardId: {
    cardId: string;
  };
  memberName: string;
  startTime: string;
  endTime: string | null;
  hourlyRate: number;
  totalCost: number;
}

interface CardRevenue {
  cardId: string;
  totalRevenue: number;
  usageCount: number;
}

function App() {
  const [currentPage, setCurrentPage] = useState<'main' | 'history'>('main');
  const [cards, setCards] = useState<Card[]>([]);
  const [usages, setUsages] = useState<Usage[]>([]);
  const [selectedCard, setSelectedCard] = useState('');
  const [memberName, setMemberName] = useState('');
  const [hourlyRate, setHourlyRate] = useState(0);
  const [activeUsage, setActiveUsage] = useState<Usage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchCards();
    fetchUsages();
  }, []);

  const fetchCards = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/cards');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setCards(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching cards:', error);
      setError('ไม่สามารถดึงข้อมูลบัตรได้ กรุณาตรวจสอบการเชื่อมต่อเซิร์ฟเวอร์');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsages = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/usage');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setUsages(data);
      // หาการใช้งานที่ยังไม่สิ้นสุด
      const active = data.find((usage: Usage) => !usage.endTime);
      setActiveUsage(active || null);
      setError(null);
    } catch (error) {
      console.error('Error fetching usages:', error);
      setError('ไม่สามารถดึงประวัติการใช้งานได้ กรุณาตรวจสอบการเชื่อมต่อเซิร์ฟเวอร์');
    }
  };

  const startUsage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/usage/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cardId: selectedCard,
          memberName,
          hourlyRate,
        }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setActiveUsage(data);
      fetchCards();
      fetchUsages();
      setError(null);
      setSuccessMessage('เริ่มการใช้งานสำเร็จ');
      // Clear form
      setSelectedCard('');
      setMemberName('');
      setHourlyRate(0);
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error starting usage:', error);
      setError('ไม่สามารถเริ่มการใช้งานได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  const endUsage = async () => {
    if (!activeUsage) return;
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/usage/end/${activeUsage._id}`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      setActiveUsage(null);
      fetchCards();
      fetchUsages();
      setError(null);
      setSuccessMessage('สิ้นสุดการใช้งานสำเร็จ');
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error ending usage:', error);
      setError('ไม่สามารถสิ้นสุดการใช้งานได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  const calculateCardRevenues = (): CardRevenue[] => {
    const cardRevenues = new Map<string, CardRevenue>();
    
    // Initialize revenue for all cards
    cards.forEach(card => {
      cardRevenues.set(card.cardId, {
        cardId: card.cardId,
        totalRevenue: 0,
        usageCount: 0
      });
    });

    // Calculate revenue for each card
    usages.forEach(usage => {
      const cardId = usage.cardId.cardId;
      const current = cardRevenues.get(cardId);
      if (current) {
        current.totalRevenue += usage.totalCost;
        current.usageCount += 1;
        cardRevenues.set(cardId, current);
      }
    });

    return Array.from(cardRevenues.values());
  };

  const calculateTotalRevenue = (): number => {
    return usages.reduce((total, usage) => total + usage.totalCost, 0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB'
    }).format(amount);
  };

  return (
    <div className="app">
      <Navbar currentPage={currentPage} onPageChange={setCurrentPage} />
      <main className="main-content">
        {currentPage === 'history' ? (
          <UserHistory />
        ) : (
          <div className="main-page">
            <h1>ระบบจัดการบัตรสมาชิก</h1>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="success-message">
                {successMessage}
              </div>
            )}

            {loading && (
              <div className="loading-container">
                <div className="loading"></div>
              </div>
            )}

            <div className="main-sections">
              <div className="left-section">
                <div className="card-section">
                  <h2>บัตรที่พร้อมใช้งาน</h2>
                  <div className="card-list">
                    {cards.map((card) => (
                      <div key={card._id} className={`card ${card.isAvailable ? 'available' : 'in-use'}`}>
                        เลขบัตร: {card.cardId}
                        <br />
                        สถานะ: {card.isAvailable ? 'ว่าง' : 'กำลังใช้งาน'}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="usage-section">
                  <h2>เริ่มการใช้งานใหม่</h2>
                  <form onSubmit={startUsage}>
                    <div>
                      <label>เลขบัตร:</label>
                      <select
                        value={selectedCard}
                        onChange={(e) => setSelectedCard(e.target.value)}
                        required
                        disabled={loading}
                      >
                        <option value="">เลือกบัตร</option>
                        {cards
                          .filter((card) => card.isAvailable)
                          .map((card) => (
                            <option key={card._id} value={card.cardId}>
                              {card.cardId}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div>
                      <label>ชื่อ-นามสกุลสมาชิก:</label>
                      <input
                        type="text"
                        value={memberName}
                        onChange={(e) => setMemberName(e.target.value)}
                        required
                        disabled={loading}
                        placeholder="กรอกชื่อ-นามสกุล"
                      />
                    </div>
                    <div>
                      <label>อัตราค่าบริการต่อชั่วโมง (บาท):</label>
                      <input
                        type="number"
                        value={hourlyRate}
                        onChange={(e) => setHourlyRate(Number(e.target.value))}
                        required
                        disabled={loading}
                        min="0"
                        step="0.01"
                        placeholder="กรอกอัตราค่าบริการ"
                      />
                    </div>
                    <button type="submit" disabled={loading}>
                      {loading ? 'กำลังประมวลผล...' : 'เริ่มการใช้งาน'}
                    </button>
                  </form>
                </div>

                {activeUsage && (
                  <div className="active-usage">
                    <h2>การใช้งานปัจจุบัน</h2>
                    <p>สมาชิก: {activeUsage.memberName}</p>
                    <p>เวลาเริ่มต้น: {new Date(activeUsage.startTime).toLocaleString('th-TH')}</p>
                    <p>อัตราค่าบริการ: {formatCurrency(activeUsage.hourlyRate)}/ชั่วโมง</p>
                    <button onClick={endUsage} disabled={loading}>
                      {loading ? 'กำลังประมวลผล...' : 'สิ้นสุดการใช้งาน'}
                    </button>
                  </div>
                )}
              </div>

              <div className="right-section">
                <div className="revenue-section">
                  <h2>สรุปยอดรายได้</h2>
                  <div className="revenue-list">
                    {cards.map((card) => {
                      const cardUsages = usages.filter(usage => usage.cardId.cardId === card.cardId);
                      const totalRevenue = cardUsages.reduce((sum, usage) => sum + usage.totalCost, 0);
                      const usageCount = cardUsages.length;

                      return (
                        <div key={card._id} className="revenue-item">
                          <p>เลขบัตร: {card.cardId}</p>
                          <p>จำนวนการใช้งาน: {usageCount} ครั้ง</p>
                          <p>ยอดรวม: {formatCurrency(totalRevenue)}</p>
                        </div>
                      );
                    })}
                    <div className="revenue-total">
                      <p>ยอดรวมทั้งหมด: {formatCurrency(usages.reduce((sum, usage) => sum + usage.totalCost, 0))}</p>
                    </div>
                  </div>
                </div>

                <div className="history-section">
                  <h2>ประวัติการใช้งานล่าสุด</h2>
                  <div className="usage-list">
                    {usages.slice(0, 5).map((usage) => (
                      <div key={usage._id} className="usage-item">
                        <p>เลขบัตร: {usage.cardId.cardId}</p>
                        <p>สมาชิก: {usage.memberName}</p>
                        <p>เวลาเริ่มต้น: {new Date(usage.startTime).toLocaleString('th-TH')}</p>
                        <p>เวลาสิ้นสุด: {usage.endTime ? new Date(usage.endTime).toLocaleString('th-TH') : 'กำลังใช้งาน'}</p>
                        <p>ค่าใช้จ่าย: {formatCurrency(usage.totalCost)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
