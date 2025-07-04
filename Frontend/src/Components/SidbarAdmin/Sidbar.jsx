import React from 'react';
import './Sidbar.css';
import { assets } from '../../assets/admin_assets/assets';
import { useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const navigate = useNavigate(); // Hook de navegação

  return (
    <div className="sidebar">
      <div className="sidebar-options">
        <div className="sidebar-option" onClick={() => navigate('/admin')}>
          <img src={assets.add_icon} alt="admin" />
          <p>Adicionar Item</p>
        </div>
        <div className="sidebar-option" onClick={() => navigate('/admin/list')}>
          <img src={assets.order_icon} alt="List" />
          <p>Lista de Item</p>
        </div>
        <div className="sidebar-option" onClick={() => navigate('/orders')}>
          <img src={assets.order_icon} alt="Orders" />
          <p>Dashboard</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
