import React, { useState, useEffect } from 'react';
import './UserDetail.css';

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

interface UserDetailProps {
  memberName: string;
  onBack: () => void;
}

const UserDetail: React.FC<UserDetailProps> = ({ memberName, onBack }) => {
  const [usages, setUsages] = useState<Usage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserUsages();
  }, [memberName]);

  const fetchUserUsages = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/usage');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      // กรองเฉพาะข้อมูลของผู้ใช้ที่เลือก
      const userUsages = data.filter((usage: Usage) => usage.memberName === memberName);
      setUsages(userUsages);
      setError(null);
    } catch (error) {
      console.error('Error fetching user usages:', error);
      setError('ไม่สามารถดึงข้อมูลประวัติการใช้งานได้ กรุณาตรวจสอบการเชื่อมต่อเซิร์ฟเวอร์');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB'
    }).format(amount);
  };

  const formatHours = (hours: number) => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours} ชั่วโมง ${minutes} นาที`;
  };

  const calculateDuration = (startTime: string, endTime: string | null) => {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  };

  const calculateTotalHours = () => {
    return usages.reduce((total, usage) => {
      return total + calculateDuration(usage.startTime, usage.endTime);
    }, 0);
  };

  const calculateTotalCost = () => {
    return usages.reduce((total, usage) => total + usage.totalCost, 0);
  };

  return (
    <div className="user-detail">
      <div className="user-header">
        <button className="back-button" onClick={onBack}>
          ← กลับ
        </button>
        <h1>ประวัติการใช้งานของ {memberName}</h1>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <div className="loading"></div>
        </div>
      ) : (
        <>
          <div className="user-summary">
            <div className="summary-card">
              <h3>จำนวนครั้งที่ใช้งาน</h3>
              <p>{usages.length} ครั้ง</p>
            </div>
            <div className="summary-card">
              <h3>เวลารวม</h3>
              <p>{formatHours(calculateTotalHours())}</p>
            </div>
            <div className="summary-card">
              <h3>ค่าใช้จ่ายรวม</h3>
              <p>{formatCurrency(calculateTotalCost())}</p>
            </div>
          </div>

          <div className="table-container">
            <table className="usage-table">
              <thead>
                <tr>
                  <th>เลขบัตร</th>
                  <th>วันที่</th>
                  <th>เวลาเริ่มต้น</th>
                  <th>เวลาสิ้นสุด</th>
                  <th>ระยะเวลา</th>
                  <th>อัตราค่าบริการ</th>
                  <th>ค่าใช้จ่าย</th>
                </tr>
              </thead>
              <tbody>
                {usages.map((usage) => {
                  const start = new Date(usage.startTime);
                  const end = usage.endTime ? new Date(usage.endTime) : new Date();
                  const duration = calculateDuration(usage.startTime, usage.endTime);

                  return (
                    <tr key={usage._id}>
                      <td>{usage.cardId.cardId}</td>
                      <td>{start.toLocaleDateString('th-TH')}</td>
                      <td>{start.toLocaleTimeString('th-TH')}</td>
                      <td>{usage.endTime ? end.toLocaleTimeString('th-TH') : 'กำลังใช้งาน'}</td>
                      <td>{formatHours(duration)}</td>
                      <td>{formatCurrency(usage.hourlyRate)}/ชั่วโมง</td>
                      <td>{formatCurrency(usage.totalCost)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default UserDetail; 