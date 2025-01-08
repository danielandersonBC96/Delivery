import React, { useState } from 'react';
import NavBar from './Components/Navbar/NavBar';
import './App.css'; 
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Pages/Home/Home';
import Cart from './Pages/Cart/Cart';
 // Corrigido o nome do componente
import Footer from './Components/Footer/Footer';
import LoginPopup from './Components/LoginPopup/LoginPopup';
import AdminHome from './Pages/Admin/AdminHome';
import AdminListProduct from './Pages/List/AdminListProduct';
import PagesDetails from './Pages/FoodDetails/PagesDetails';

const App = () => {
  const [showLogin, setShowLogin] = useState(false); // Inicia sem mostrar a tela de login

  return (
    <div className="App">
      {showLogin ? (
        <LoginPopup setShowLogin={setShowLogin} />  // Mostra o popup de login se showLogin for true
      ) : (
        <>
          <NavBar setShowLogin={setShowLogin} />
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/admin' element={<AdminHome/>}/>
            <Route path='/admin/list' element={<AdminListProduct/>}/>
            <Route path='/product/:id' element={<PagesDetails />} /> {/* Rota de detalhe do produto */}
            <Route path='/cart' element={<Cart />} />
          </Routes>
          <Footer />
        </>
      )}
    </div>
  );
};

export default App;
