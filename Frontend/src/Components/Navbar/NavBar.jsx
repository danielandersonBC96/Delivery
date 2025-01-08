import React, { useState, useContext, useEffect } from 'react';
import './NavBar.css';
import { assets } from '../../assets/frontend_assets/assets';
import { useNavigate } from 'react-router-dom';
import { StoreContext } from '../../Content/StoreContent';

const NavBar = ({ setShowLogin }) => {
  const [menu, setMenu] = useState("home");
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Controlar o estado do menu
  const navigate = useNavigate();
  const { getTotalCartAmount } = useContext(StoreContext);

  // Função para alternar o estado do menu
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  // Efeito para controlar a rolagem da tela quando o menu está aberto
  useEffect(() => {
    const body = document.body;
    if (isMenuOpen) {
      body.style.overflow = 'hidden'; // Bloqueia a rolagem
    } else {
      body.style.overflow = 'auto'; // Libera a rolagem
    }

    // Cleanup effect para restaurar o estado do body ao desmontar o componente
    return () => {
      body.style.overflow = 'auto';
    };
  }, [isMenuOpen]); // O efeito depende do estado isMenuOpen

  return (
    <div className="navbar">
      <img 
        src={assets.logo} 
        alt="Logo" 
        onClick={() => navigate('/')}
        className="logo"
      />
      {/* Ícone de menu hambúrguer */}
      <div className="menu-icon" onClick={toggleMenu}>
        <img src={assets.menu_icon} alt="Menu Icon" />
      </div>

      <ul className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
        {/* Ícone de fechar no canto superior direito */}
        <div className="menu-close" onClick={toggleMenu}>
          <img src={assets.cross_icon} alt="Close" />
        </div>

        {/* Adicionando item "Home" */}
        <li 
          className={`navbar-menu-item ${menu === "home" ? "active" : ""}`} 
          onClick={() => {
            navigate('/');
            setMenu("home");
            toggleMenu(); // Fecha o menu após clicar
          }}
        >
          Home
        </li>
      </ul>

      <div className="navbar-right">
        <div className="navbar-search-icon" onClick={() => navigate('/cart')}>
          <img src={assets.carrinho} alt="Basket" className="carrinho" />
          {getTotalCartAmount() > 0 && <div className="dot"></div>}
        </div>
        <button className="navbar-button" onClick={() => setShowLogin(true)}>Sign in</button>
      </div>
    </div>
  );
};

export default NavBar;
