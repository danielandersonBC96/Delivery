import React, { useState, useContext, useEffect } from 'react';
import './NavBar.css';
import { assets } from '../../assets/frontend_assets/assets';
import { useNavigate } from 'react-router-dom';
import { StoreContext } from '../../Content/StoreContent';
import { FaBars, FaTimes, FaShoppingCart } from 'react-icons/fa';

const NavBar = ({ setShowLogin }) => {
  const [menu, setMenu] = useState("home");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { getTotalCartAmount, user } = useContext(StoreContext);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [isMenuOpen]);

  return (
    <div className="navbar">
      <img 
        src={assets.logo} 
        alt="Logo" 
        onClick={() => navigate('/')}
        className="logo"
      />

      <div className="menu-icon" onClick={toggleMenu}>
        <FaBars size={28} />
      </div>

      <ul className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
        <div className="menu-close" onClick={toggleMenu}>
          <FaTimes size={28} />
        </div>

        <li 
          className={`navbar-menu-item ${menu === "home" ? "active" : ""}`} 
          onClick={() => {
            navigate('/');
            setMenu("home");
            toggleMenu();
          }}
        >
          Home
        </li>

        <li 
          className={`navbar-menu-item ${menu === "reserva" ? "active" : ""}`} 
          onClick={() => {
            navigate('/reserve');
            setMenu("reserva");
            toggleMenu();
          }}
        >
          Reserva
        </li>
      </ul>

      <div className="navbar-right">
        <div className="navbar-search-icon" onClick={() => navigate('/cart')}>
          <FaShoppingCart size={22} className="carrinho" />
          {getTotalCartAmount() > 0 && <div className="dot"></div>}
        </div>

        {user ? (
          <div className="navbar-user">
            <div className="user-info">
              <span className="user-name">{user.name.split(' ')[0]}</span>
              <span className="user-status" title="Online"></span>
            </div>
          </div>
        ) : (
          <button className="navbar-button" onClick={() => setShowLogin(true)}>
            Sign in
          </button>
        )}
      </div>
    </div>
  );
};

export default NavBar;
