import React from 'react';
import './NavBarAdmin.css';
import { assets } from '../../assets/admin_assets/assets';

const NavBarAdmin = () => {
  return (
    <nav className="navbar-admin">
      <div className="navbar-logo">

        <p>Admin Painel </p>
       
      </div>
      <div className="navbar-profile">
        <img src={assets.profile_image} alt="Profile" />
      </div>
    </nav>
  );
};

export default NavBarAdmin;
