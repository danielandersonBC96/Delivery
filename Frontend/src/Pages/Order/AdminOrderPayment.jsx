import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import './AdminOrderPayment.css';

const socket = io('http://localhost:4000');

const AdminOrderPayment = () => {
  const [orders, setOrders] = useState([]);
  const [username, setUsername] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  // Estado dos filtros temporários (inputs)
  const [monthInput, setMonthInput] = useState('');
  const [dayInput, setDayInput] = useState('');

  // Estado dos filtros efetivos (que aplicam filtro)
  const [monthFilter, setMonthFilter] = useState('');
  const [dayFilter, setDayFilter] = useState('');

  useEffect(() => {
    const storedUsername = localStorage.getItem('username') || 'Admin';
    setUsername(storedUsername);

    const fetchAllOrders = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/foods-admin');
        setOrders(response.data.orders || []);
      } catch (error) {
        console.error('Erro ao buscar pedidos:', error);
      }
    };

    fetchAllOrders();

    socket.on('newOrder', (newOrder) => {
      setOrders((prevOrders) => [newOrder, ...prevOrders]);
    });

    return () => {
      socket.off('newOrder');
    };
  }, []);

  // Aplica filtro apenas com os filtros efetivos
  const filteredOrders = monthFilter
    ? orders.filter(order => {
        const orderDate = new Date(order.created_at);
        const [yearFilter, monthFilterNum] = monthFilter.split('-').map(Number);
        return (
          orderDate.getFullYear() === yearFilter &&
          orderDate.getMonth() + 1 === monthFilterNum
        );
      })
    : orders;

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);

  const totalFaturamento = filteredOrders.reduce((sum, order) => sum + (order.total || 0), 0);
  const faturamentoMes = totalFaturamento;

  // Faturamento do dia com filtro aplicado
  const faturamentoDia = orders.reduce((sum, order) => {
    if (!monthFilter || !dayFilter) return sum;

    const orderDate = new Date(order.created_at);
    const [yearFilter, monthFilterNum] = monthFilter.split('-').map(Number);

    const orderYear = orderDate.getFullYear();
    const orderMonth = orderDate.getMonth() + 1;
    const orderDay = orderDate.getDate();

    const dayToCheck = Number(dayFilter);

    if (
      orderYear === yearFilter &&
      orderMonth === monthFilterNum &&
      orderDay === dayToCheck
    ) {
      return sum + (order.total || 0);
    }
    return sum;
  }, 0);

  const handleNextPage = () => {
    if (indexOfLastOrder < filteredOrders.length) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  // Função para aplicar os filtros quando clicar em buscar
  const handleApplyFilters = () => {
    setMonthFilter(monthInput);
    setDayFilter(dayInput);
    setCurrentPage(1);
  };

  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <h2>Admin</h2>
        <ul>
          <li>📋 Pedidos</li>
          <li>🍔 Produtos</li>
          <li>👥 Usuários</li>
          <li>⚙️ Configurações</li>
        </ul>
      </aside>

      <div className="main-content">
        <nav className="navbar-admin">
          <h1>Painel Administrativo</h1>
          <span>Bem-vindo, {username}!</span>
        </nav>

        <main className="content">
          <h2>Pedidos Recebidos</h2>

          {/* Filtros */}
          <div className="filter-container">
            <label htmlFor="monthFilter">Filtrar por mês: </label>
            <input
              id="monthFilter"
              type="month"
              value={monthInput}
              onChange={(e) => {
                setMonthInput(e.target.value);
                setDayInput(''); // Resetar dia ao trocar mês
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
              style={{ marginLeft: '1rem', padding: '0.4rem 1rem', cursor: (!monthInput || !dayInput) ? 'not-allowed' : 'pointer' }}
            >
              Buscar
            </button>
          </div>

          {/* Cards de faturamento */}
          <div className="faturamento-wrapper">
            <div className="faturamento-box">
              <h3>📈 Faturamento Total</h3>
              <p>R$ {totalFaturamento.toFixed(2)}</p>
            </div>

            <div className="faturamento-box">
              <h3>📅 Faturamento do Mês</h3>
              <p>R$ {faturamentoMes.toFixed(2)}</p>
            </div>

            <div className="faturamento-box">
              <h3>🗓️ Faturamento do Dia</h3>
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
                        <td>R$ {order.discount ? order.discount.toFixed(2) : '0.00'}</td>
                        <td>R$ {order.total ? order.total.toFixed(2) : '0.00'}</td>
                        <td>{new Date(order.created_at).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="pagination">
                <button onClick={handlePrevPage} disabled={currentPage === 1}>
                  ◀ Anterior
                </button>
                <span>
                  Página {currentPage} de {Math.ceil(filteredOrders.length / ordersPerPage)}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={indexOfLastOrder >= filteredOrders.length}
                >
                  Próxima ▶
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
