import React from 'react';
import './SidbarUser.css';
import { useNavigate } from 'react-router-dom';
import { MdTableRestaurant, MdEventNote, MdHome } from 'react-icons/md';

const SidbarUser = () => {
  const navigate = useNavigate();

  return (
    <aside className="sidebar-user">
      <div className="sidebar-options">
        <div className="sidebar-option" onClick={() => navigate('/')}>
          <MdHome size={22} />
          <span>Início</span>
        </div>

        <div className="sidebar-option" onClick={() => navigate('/reservar')}>
          <MdTableRestaurant size={22} />
          <span>Reservar Mesa</span>
        </div>

        <div className="sidebar-option" onClick={() => navigate('/minhas-reservas')}>
          <MdEventNote size={22} />
          <span>Minhas Reservas</span>
        </div>
      </div>
    </aside>
  );
};

export default SidbarUser;
