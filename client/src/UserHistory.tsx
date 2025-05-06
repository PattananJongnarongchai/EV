import React, { useState, useEffect } from 'react';
import './UserHistory.css';
import UserDetail from './components/UserDetail';
import * as XLSX from 'xlsx';

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

type SortableField = keyof Usage | 'duration';

interface SortConfig {
  key: SortableField;
  direction: 'ascending' | 'descending';
}

function UserHistory() {
  const [usages, setUsages] = useState<Usage[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [exportFormat, setExportFormat] = useState<'excel' | 'csv' | 'pdf'>('excel');

  useEffect(() => {
    fetchUsages();
  }, []);

  const fetchUsages = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/usage');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setUsages(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching usages:', error);
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

  const handleSort = (key: SortableField) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortedData = () => {
    if (!sortConfig) return usages;

    return [...usages].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      if (sortConfig.key === 'duration') {
        aValue = calculateDuration(a.startTime, a.endTime);
        bValue = calculateDuration(b.startTime, b.endTime);
      } else if (sortConfig.key === 'cardId') {
        aValue = a.cardId.cardId;
        bValue = b.cardId.cardId;
      } else {
        aValue = a[sortConfig.key as keyof Usage];
        bValue = b[sortConfig.key as keyof Usage];
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  };

  const filteredAndSortedData = getSortedData().filter(usage =>
    usage.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usage.cardId.cardId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSortIcon = (key: SortableField) => {
    if (!sortConfig || sortConfig.key !== key) return '↕️';
    return sortConfig.direction === 'ascending' ? '↑' : '↓';
  };

  const exportToCSV = () => {
    const headers = [
      'ชื่อ-นามสกุล',
      'เลขบัตร',
      'วันที่',
      'เวลาเริ่มต้น',
      'เวลาสิ้นสุด',
      'ระยะเวลา',
      'อัตราค่าบริการ',
      'ค่าใช้จ่าย'
    ];

    const csvData = filteredAndSortedData.map(usage => {
      const start = new Date(usage.startTime);
      const end = usage.endTime ? new Date(usage.endTime) : new Date();
      const duration = calculateDuration(usage.startTime, usage.endTime);

      return [
        usage.memberName,
        usage.cardId.cardId,
        start.toLocaleDateString('th-TH'),
        start.toLocaleTimeString('th-TH'),
        usage.endTime ? end.toLocaleTimeString('th-TH') : 'กำลังใช้งาน',
        formatHours(duration),
        `${formatCurrency(usage.hourlyRate)}/ชั่วโมง`,
        formatCurrency(usage.totalCost)
      ];
    });

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `ประวัติการใช้งาน_${new Date().toLocaleDateString('th-TH')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToExcel = () => {
    const headers = ['ชื่อ-นามสกุล', 'เลขบัตร', 'เวลาเริ่มต้น', 'เวลาสิ้นสุด', 'ระยะเวลา', 'อัตราค่าบริการ', 'ค่าใช้จ่าย'];
    const excelData = filteredAndSortedData.map(usage => {
      const start = new Date(usage.startTime);
      const end = usage.endTime ? new Date(usage.endTime) : new Date();
      const duration = calculateDuration(usage.startTime, usage.endTime);
      return {
        'ชื่อ-นามสกุล': usage.memberName,
        'เลขบัตร': usage.cardId.cardId,
        'เวลาเริ่มต้น': start.toLocaleString('th-TH'),
        'เวลาสิ้นสุด': usage.endTime ? end.toLocaleString('th-TH') : 'กำลังใช้งาน',
        'ระยะเวลา': formatHours(duration),
        'อัตราค่าบริการ': formatCurrency(usage.hourlyRate),
        'ค่าใช้จ่าย': formatCurrency(usage.totalCost)
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'ประวัติการใช้งาน');
    XLSX.writeFile(workbook, `ประวัติการใช้งาน_${new Date().toLocaleDateString('th-TH')}.xlsx`);
  };

  const exportToPDF = () => {
    // TODO: Implement PDF export
    alert('การส่งออกเป็น PDF กำลังอยู่ในระหว่างการพัฒนา');
  };

  const handleExport = () => {
    switch (exportFormat) {
      case 'excel':
        exportToExcel();
        break;
      case 'csv':
        exportToCSV();
        break;
      case 'pdf':
        exportToPDF();
        break;
    }
  };

  if (selectedUser) {
    return (
      <UserDetail
        memberName={selectedUser}
        onBack={() => setSelectedUser(null)}
      />
    );
  }

  return (
    <div className="user-history">
      <h1>ประวัติการใช้งานทั้งหมด</h1>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="controls">
        <div className="search-section">
          <input
            type="text"
            placeholder="ค้นหาด้วยชื่อ-นามสกุล หรือเลขบัตร"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="export-section">
          <select 
            value={exportFormat} 
            onChange={(e) => setExportFormat(e.target.value as 'excel' | 'csv' | 'pdf')}
            className="export-select"
          >
            <option value="excel">Excel</option>
            <option value="csv">CSV</option>
            <option value="pdf">PDF</option>
          </select>
          <button onClick={handleExport} className="export-button">
            ส่งออกข้อมูล
          </button>
        </div>
        <button 
          className="refresh-button"
          onClick={fetchUsages}
          disabled={loading}
        >
          {loading ? 'กำลังโหลด...' : 'โหลดข้อมูลใหม่'}
        </button>
      </div>

      {loading && (
        <div className="loading-container">
          <div className="loading"></div>
        </div>
      )}

      <div className="table-container">
        <table className="usage-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('memberName')}>
                ชื่อ-นามสกุล {getSortIcon('memberName')}
              </th>
              <th onClick={() => handleSort('cardId')}>
                เลขบัตร {getSortIcon('cardId')}
              </th>
              <th onClick={() => handleSort('startTime')}>
                วันที่ {getSortIcon('startTime')}
              </th>
              <th onClick={() => handleSort('startTime')}>
                เวลาเริ่มต้น {getSortIcon('startTime')}
              </th>
              <th onClick={() => handleSort('endTime')}>
                เวลาสิ้นสุด {getSortIcon('endTime')}
              </th>
              <th onClick={() => handleSort('duration')}>
                ระยะเวลา {getSortIcon('duration')}
              </th>
              <th onClick={() => handleSort('hourlyRate')}>
                อัตราค่าบริการ {getSortIcon('hourlyRate')}
              </th>
              <th onClick={() => handleSort('totalCost')}>
                ค่าใช้จ่าย {getSortIcon('totalCost')}
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedData.map((usage) => {
              const start = new Date(usage.startTime);
              const end = usage.endTime ? new Date(usage.endTime) : new Date();
              const duration = calculateDuration(usage.startTime, usage.endTime);

              return (
                <tr key={usage._id}>
                  <td>
                    <button
                      className="user-link"
                      onClick={() => setSelectedUser(usage.memberName)}
                    >
                      {usage.memberName}
                    </button>
                  </td>
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

      <div className="summary">
        <p>จำนวนรายการทั้งหมด: {filteredAndSortedData.length} รายการ</p>
      </div>
    </div>
  );
}

export default UserHistory; 