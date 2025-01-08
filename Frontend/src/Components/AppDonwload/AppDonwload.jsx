import React from 'react';
import { assets } from '../../assets/frontend_assets/assets'; // ensure the path is correct
import './AppDonwloads.css';

const AppDonwload = () => {
  return (
    <div className="app-download" id="app-download"> {/* Use correct class name */}
      <p>
        For Better Experience Download <br /> Tomato App
      </p>
      <div className="app-download-platforms">
        <img src={assets.play_store} alt="Play Store" />
        <img src={assets.app_store} alt="App Store" />
      </div>
    </div>
  );
};

export default AppDonwload;
