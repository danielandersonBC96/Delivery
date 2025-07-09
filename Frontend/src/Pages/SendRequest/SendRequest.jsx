import React, { useEffect, useState } from 'react';
import './SendRequest.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaUserTie, FaSignOutAlt, FaClipboardList } from 'react-icons/fa';

export const SendRequest = () => {
  const [orders, setOrders] = useState([]);
  const [username, setUserName] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 5;
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUsername = localStorage.getItem('username') || 'Administrador';
    setUserName(storedUsername);

    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:4000/api/orders/all', {
          headers: { Authorization: `Bearer ${token}` }
        });

        const allOrders = response.data.orders || [];

        const ordersWithItems = allOrders.map(order => {
          const rawDate = new Date(order.createdAt || order.created_at || new Date());
          return {
            ...order,
            rawDate,
            customerName: order.customerName || order.customer_name || order.user?.email || 'Desconhecido',
            purchaseDate: formatPurchaseDate(rawDate),
            status: order.status || 'Pendente',
            items: Array.isArray(order.items) ? order.items : []
          };
        });

        setOrders(ordersWithItems);
      } catch (error) {
        console.error('Erro ao carregar pedidos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const formatPurchaseDate = (date) => {
    const today = new Date();
    const diffTime = today.setHours(0, 0, 0, 0) - date.setHours(0, 0, 0, 0);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return 'Ontem';
    return date.toLocaleDateString();
  };

  const isOlderThanOneDay = (date) => {
    const now = new Date();
    const diff = now - date;
    return diff > 24 * 60 * 60 * 1000;
  };

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(orders.length / ordersPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleSendOrder = async (order) => {
    if (order.status !== 'Pendente') {
      alert('Este pedido já foi enviado ou não pode ser reenviado.');
      return;
    }

    try {
      const token = localStorage.getItem('token');

      await axios.put(
        `http://localhost:4000/api/orders/${order._id || order.id}/status`,
        { status: 'Enviado' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setOrders(prev =>
        prev.map(o =>
          (o._id || o.id) === (order._id || order.id)
            ? { ...o, status: 'Enviado' }
            : o
        )
      );

      alert(`Pedido ${order._id || order.id} enviado com sucesso!`);
    } catch (error) {
      console.error('Erro ao enviar pedido:', error);
      alert('Erro ao enviar o pedido. Tente novamente.');
    }
  };

  return (
    <div className="profile-page">
      <nav className="navbar1">
        <div className="navbar-logo">Painel de Pedidos</div>
        <div className="navbar-user">Administrador: {username}</div>
      </nav>

      <div className="main-wrapper">
        <aside className="sidebar">
          <h2><FaUserTie /> Admin</h2>
          <ul>
            <li onClick={() => navigate('/Admin')}><FaClipboardList /> Home Admin</li>
            <li onClick={() => navigate('/orders')}><FaClipboardList /> Pedidos Recebidos</li>
            <li onClick={() => navigate('/')}><FaSignOutAlt /> Sair</li>
          </ul>
        </aside>

        <main className="profile-content">
          <h2>Enviar Pedidos</h2>

          {loading ? (
            <p>Carregando pedidos...</p>
          ) : currentOrders.length === 0 ? (
            <p>Nenhum pedido encontrado.</p>
          ) : (
            <div className="table-responsive">
              <table className="purchase-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Cliente</th>
                    <th>Data</th>
                    <th>Status</th>
                    <th>Total</th>
                    <th>Itens</th>
                    <th>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {currentOrders.map((order, index) => (
                    <tr key={order._id || index}>
                      <td>{order.id || order._id}</td>
                      <td>{order.customerName}</td>
                      <td>{order.purchaseDate}</td>
                      <td>
                        <span className={
                          order.status === 'Enviado'
                            ? 'status-enviado'
                            : isOlderThanOneDay(order.rawDate)
                            ? 'status-nao-enviado'
                            : 'status-pendente'
                        }>
                          {order.status === 'Enviado'
                            ? 'Enviado'
                            : isOlderThanOneDay(order.rawDate)
                            ? 'Não Enviado'
                            : 'Pendente'}
                        </span>
                      </td>
                      <td>R$ {(order.total || 0).toFixed(2)}</td>
                      <td>
                        <details>
                          <summary>Ver Itens ({order.items.length})</summary>
                          <ul>
                            {order.items.map((item, i) => (
                              <li key={i}>
                                <strong>{item.name}</strong> - {item.quantity}x - R$ {(item.price || 0).toFixed(2)}
                              </li>
                            ))}
                          </ul>
                        </details>
                      </td>
                      <td>
                        <button
                          className="btn-send-order"
                          onClick={() => handleSendOrder(order)}
                          disabled={order.status !== 'Pendente'}
                        >
                          Enviar Pedido
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {orders.length > ordersPerPage && (
                <div className="pagination">
                  <button onClick={handlePrevPage} disabled={currentPage === 1}>
                    Anterior
                  </button>
                  <span>Página {currentPage} de {totalPages}</span>
                  <button onClick={handleNextPage} disabled={currentPage === totalPages}>
                    Próxima
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default SendRequest;
