// src/pages/AdminOrderPayment.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { FaUserTie, FaSignOutAlt, FaClipboardList, FaChartLine, FaCalendarAlt, FaCalendarDay, FaArrowLeft, FaArrowRight } from 'react-icons/fa'; // ✅ Ícones adicionados
import './AdminOrderPayment.css';

const socket = io('http://localhost:4000', { transports: ['websocket'] });

const AdminOrderPayment = () => {
  const [orders, setOrders] = useState([]);
  const [username, setUsername] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  const [monthInput, setMonthInput] = useState('');
  const [dayInput, setDayInput] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [dayFilter, setDayFilter] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const storedUsername = localStorage.getItem('username') || 'Admin';
    setUsername(storedUsername);

    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:4000/api/orders/all', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrders(res.data.orders || []);
      } catch (error) {
        console.error('Erro ao buscar pedidos:', error);
      }
    };

    fetchOrders();

    socket.on('newOrder', (newOrder) => {
      setOrders((prev) => [newOrder, ...prev]);
    });

    return () => {
      socket.off('newOrder');
    };
  }, []);

  const filteredOrders = orders.filter((order) => {
    const date = new Date(order.created_at);
    const [year, month] = monthFilter.split('-').map(Number);
    const day = Number(dayFilter);

    const isSameMonth = monthFilter
      ? date.getFullYear() === year && date.getMonth() + 1 === month
      : true;

    const isSameDay = dayFilter ? date.getDate() === day : true;

    return isSameMonth && isSameDay;
  });

  const currentOrders = filteredOrders.slice(
    (currentPage - 1) * ordersPerPage,
    currentPage * ordersPerPage
  );

  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const handleApplyFilters = () => {
    setMonthFilter(monthInput);
    setDayFilter(dayInput);
    setCurrentPage(1);
  };

  const faturamentoTotal = filteredOrders.reduce((acc, o) => acc + (o.total || 0), 0);
  const faturamentoDia = filteredOrders
    .filter((o) => {
      const date = new Date(o.created_at);
      return date.getDate() === Number(dayFilter);
    })
    .reduce((acc, o) => acc + (o.total || 0), 0);

  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <h2><FaUserTie /> Admin</h2>
        <ul>
          <li onClick={() => navigate('/Admin')}><FaClipboardList /> Home Admin</li>
          <li onClick={() => navigate('/sendrequest')}><FaClipboardList /> Enviar Pedidos</li>
          <li onClick={() => navigate('/')}><FaSignOutAlt /> Sair</li>
        </ul>
      </aside>
      <div className="main-content">
        <nav className="navbar-admin">
          <h1>Painel Administrativo</h1>
          <span>Bem-vindo, {username}!</span>
        </nav>
        <main className="content">
          <h2>Pedidos Recebidos</h2>
          <div className="filter-container">
            <label htmlFor="monthFilter">Filtrar por mês:</label>
            <input
              id="monthFilter"
              type="month"
              value={monthInput}
              onChange={(e) => {
                setMonthInput(e.target.value);
                setDayInput('');
              }}
            />

            <label htmlFor="dayFilter" style={{ marginLeft: '1rem' }}>
              Filtrar por dia:
            </label>
            <input
              id="dayFilter"
              type="number"
              min="1"
              max="31"
              placeholder="Dia"
              value={dayInput}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '' || (Number(val) >= 1 && Number(val) <= 31)) {
                  setDayInput(val);
                }
              }}
              disabled={!monthInput}
              style={{ width: '4rem', marginLeft: '0.5rem' }}
            />

            <button
              onClick={handleApplyFilters}
              disabled={!monthInput || !dayInput}
              style={{ marginLeft: '1rem', padding: '0.4rem 1rem' }}
            >
              Buscar
            </button>
          </div>

          <div className="faturamento-wrapper">
            <div className="faturamento-box">
              <h3><FaChartLine /> Faturamento Total</h3>
              <p>R$ {faturamentoTotal.toFixed(2)}</p>
            </div>

            <div className="faturamento-box">
              <h3><FaCalendarAlt /> Faturamento do Mês</h3>
              <p>R$ {faturamentoTotal.toFixed(2)}</p>
            </div>

            <div className="faturamento-box">
              <h3><FaCalendarDay /> Faturamento do Dia</h3>
              <p>R$ {faturamentoDia.toFixed(2)}</p>
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <p className="empty-message">Nenhum pedido recebido até o momento.</p>
          ) : (
            <>
              <div className="table-container">
                <table className="orders-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>ID Usuário</th>
                      <th>Cliente</th>
                      <th>Telefone</th>
                      <th>Pagamento</th>
                      <th>Desconto</th>
                      <th>Total</th>
                      <th>Data/Hora</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentOrders.map((order) => (
                      <tr key={order.id}>
                        <td>{order.id}</td>
                        <td>{order.user_id}</td>
                        <td>{order.customer_name}</td>
                        <td>{order.phone_number}</td>
                        <td>{order.payment_method}</td>
                        <td>R$ {order.discount?.toFixed(2) || '0.00'}</td>
                        <td>R$ {order.total?.toFixed(2) || '0.00'}</td>
                        <td>{new Date(order.created_at).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="pagination">
                <button onClick={() => setCurrentPage((prev) => prev - 1)} disabled={currentPage === 1}>
                  <FaArrowLeft /> Anterior
                </button>
                <span>
                  Página {currentPage} de {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  disabled={currentPage >= totalPages}
                >
                  Próxima <FaArrowRight />
                </button>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminOrderPayment;
