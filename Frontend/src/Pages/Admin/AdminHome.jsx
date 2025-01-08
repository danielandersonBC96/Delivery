import React from 'react';
import "./AdminHome.css"
import NavBarAdmin from '../../Components/NavBarAdmin/NavBarAdmin';
import Sidebar from '../../Components/SidbarAdmin/Sidbar';
import Add from '../Add/Add'


const AdminHome = () => {
  return (
    <div className=' admin-home'>
      <NavBarAdmin />
      <div className="app-content">
    
      <Sidebar />
      <Add/>
        <div className="content-area">
       
        </div>
      </div>
    </div>
  );
};

export default AdminHome;
