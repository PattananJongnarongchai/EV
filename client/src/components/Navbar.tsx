import React from 'react';
import './Navbar.css';

interface NavbarProps {
  currentPage: 'main' | 'history' | 'setting'; // แก้ไขตรงนี้จาก 'history | 'setting' เป็น 'history' | 'setting'
  onPageChange: (page: 'main' | 'history' | 'setting') => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentPage, onPageChange }) => {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
      <a
          
          onClick={() => onPageChange('main')}
        >
        ระบบจัดการบัตรสมาชิก
        </a>
      </div>
      <div className="navbar-menu">
        <button
          className={`nav-button ${currentPage === 'main' ? 'active' : ''}`}
          onClick={() => onPageChange('main')}
        >
          หน้าหลัก
        </button>
        <button
          className={`nav-button ${currentPage === 'history' ? 'active' : ''}`}
          onClick={() => onPageChange('history')}
        >
          ประวัติการใช้งาน
        </button>
        <button
          className={`nav-button ${currentPage === 'setting' ? 'active' : ''}`}
          onClick={() => onPageChange('setting')}
        >
          ตั้งค่า
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
