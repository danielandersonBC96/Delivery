import React from 'react';
import "./Footer.css";
import { assets } from '../../assets/frontend_assets/assets';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        
        <section className="footer-content-left" aria-labelledby="about">
          <img src={assets.logo} alt="Company Logo" className="footer-logo" />
          <p id="about">Transformando seu jeito de pedir comida</p>
          <div className="footer-social-icons">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <img src={assets.facebook_icon} alt="Facebook Icon" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <img src={assets.twitter_icon} alt="Twitter Icon" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <img src={assets.linkedin_icon} alt="LinkedIn Icon" />
            </a>
          </div>
        </section>
        
        <nav className="footer-content-center" aria-labelledby="company">
          <ul>
            <li><a href="#home">Home</a></li>
            <li><a href="#about-us">About Us</a></li>
            <li><a href="#delivery">Delivery</a></li>
            <li><a href="#privacy-policy">Privacy Policy</a></li>
          </ul>
        </nav>

        <address className="footer-content-right" aria-labelledby="contact">
          <ul>
            <li>Phone: 4352435</li>
            <li>Email: <a href="mailto:contact@gmail.com">contact@gmail.com</a></li>
          </ul>
        </address>

      </div>
    </footer>
  );
};

export default Footer;
