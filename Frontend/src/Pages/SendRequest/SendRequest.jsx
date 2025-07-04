import React, { useEffect, useState } from 'react';
import './SendRequest.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // ✅ Importado

export const SendRequest = () => {
  const [orders, setOrders] = useState([]);
  const [username, setUserName] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 5;
  const [loading, setLoading] = useState(true);

  const [monthInput, setMonthInput] = useState('');
  const [dayInput, setDayInput] = useState('');

  const navigate = useNavigate(); // ✅ Instanciado

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

        const ordersWithItems = allOrders.map(order => ({
          ...order,
          customerName: order.customerName || order.customer_name || order.user?.email || 'Desconhecido',
          purchaseDate: formatPurchaseDate(order.createdAt || order.created_at || new Date()),
          status: order.status || 'Pendente',
          items: Array.isArray(order.items) ? order.items : []
        }));

        setOrders(ordersWithItems);
      } catch (error) {
        console.error('Erro ao carregar pedidos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const formatPurchaseDate = (purchaseDate) => {
    const today = new Date();
    const purchaseDateTime = new Date(purchaseDate);
    const diffTime = Math.abs(today - purchaseDateTime);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return 'Ontem';
    return purchaseDateTime.toLocaleDateString();
  };

  const filteredOrders = orders.filter(order => {
    const date = new Date(order.createdAt || order.created_at);
    const matchMonth = monthInput ? (date.getMonth() + 1).toString() === monthInput : true;
    const matchDay = dayInput ? date.getDate().toString() === dayInput : true;
    return matchMonth && matchDay;
  });

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleSendOrder = (order) => {
    alert(`Pedido ${order.id || order._id} enviado!`);
    // Aqui você pode implementar a lógica real de envio
  };

  return (
    <div className="profile-page">
      <nav className="navbar1">
        <div className="navbar-logo">Painel de Pedidos</div>
        <div className="navbar-user">Administrador: {username}</div>
      </nav>

      <div className="main-wrapper">
        <aside className="sidebar">
          <h2>Admin</h2>
          <ul>
            <li onClick={() => navigate('/orders')} style={{ cursor: 'pointer' }}>
              📋 Pedidos Recebidos
            </li>
            <li>⚙️ Sair</li>
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
                      <td>{order.status}</td>
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
                        <button className="btn-send-order" onClick={() => handleSendOrder(order)}>
                          Enviar Pedido
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredOrders.length > ordersPerPage && (
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
