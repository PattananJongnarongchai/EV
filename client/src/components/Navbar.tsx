import React from 'react';
import './Navbar.css';

interface NavbarProps {
  currentPage: 'main' | 'history';
  onPageChange: (page: 'main' | 'history') => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentPage, onPageChange }) => {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        ระบบจัดการบัตรสมาชิก
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
      </div>
    </nav>
  );
};

export default Navbar; 