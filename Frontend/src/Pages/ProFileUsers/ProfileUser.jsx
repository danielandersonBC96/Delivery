import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProfileUser.css';

export const ProfileUser = () => {
  const [orders, setOrders] = useState([]);
  const [username, setUsername] = useState('');

  useEffect(() => {
    const storedUsername = localStorage.getItem('username') || 'Usuário';
    setUsername(storedUsername);

    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('Usuário não autenticado');
          return;
        }

        const response = await axios.get('http://localhost:4000/api/orders/user', {
          headers: { Authorization: `Bearer ${token}` }
        });

        const ordersData = response.data.orders;

        const ordersWithItems = await Promise.all(
          ordersData.map(async (order) => {
            try {
              const itemsRes = await axios.get(`http://localhost:4000/api/order-items/${order.id}`, {
                headers: { Authorization: `Bearer ${token}` }
              });

              return {
                ...order,
                purchaseDate: formatPurchaseDate(order.created_at || order.purchaseDate || new Date()),
                status: order.status || 'Pendente',
                items: itemsRes.data.orderItems || []
              };
            } catch (err) {
              console.error(`Erro ao buscar itens do pedido ${order.id}`, err);
              return { ...order, items: [] };
            }
          })
        );

        setOrders(ordersWithItems);
      } catch (error) {
        console.error('Erro ao carregar pedidos:', error);
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

  const handleOrderAgain = (orderIndex) => {
    setOrders(prevOrders => {
      const updated = [...prevOrders];
      updated[orderIndex] = {
        ...updated[orderIndex],
        status: 'Pedido Novamente'
      };
      return updated;
    });
  };

  return (
    <div className="profile-page">
      {/* NAVBAR */}
      <nav className="navbar1" aria-label="Barra de navegação principal">
        <div className="navbar-logo">Meu Perfil</div>
        <div className="navbar-user" aria-live="polite">Bem-vindo, {username}!</div>
      </nav>

      {/* MAIN WRAPPER: Sidebar + Conteúdo */}
      <div className="main-wrapper">
        <aside className="sidebar" aria-label="Menu lateral">
          <ul>
         
            <li><button type="button" className="sidebar-btn">Meus Pedidos</button></li>
            <li><button type="button" className="sidebar-btn">mercado</button></li>
            <li><button type="button" className="sidebar-btn">Sair</button></li>
          </ul>
        </aside>

        <main className="profile-content" role="main">
          <h2>Minhas Compras</h2>
          <div className="purchase-container">
            {orders.length === 0 && <p>Você ainda não fez nenhum pedido.</p>}

            {orders.map((order, index) => (
              <div key={order.id || index} className="purchase">
                <div className="purchase-items">
                  <h3>Itens da Compra {index + 1}</h3>
                  <div className="table-responsive">
                    <table className="purchase-table">
                      <thead>
                        <tr>
                          <th>Nome</th>
                          <th>Descrição</th>
                          <th>Preço</th>
                          <th>Quantidade</th>
                          <th>Imagem</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.items && order.items.map((item, itemIndex) => (
                          <tr key={itemIndex}>
                            <td>{item.name}</td>
                            <td>{item.description}</td>
                            <td>R$ {item.price ? item.price.toFixed(2) : ''}</td>
                            <td>{item.quantity}</td>
                            <td>
                              {item.image ? (
                                <img src={item.image} alt={item.name} className="product-image" />
                              ) : (
                                'Sem imagem'
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="purchase-details">
                  <h3>Detalhes da Compra</h3>
                  <p><strong>Data:</strong> {order.purchaseDate}</p>
                  <p><strong>Status:</strong> {order.status}</p>
                  <p className="total">Total: R$ {order.total ? order.total.toFixed(2) : ''}</p>

                  {order.status !== 'Pedido Novamente' ? (
                    <button onClick={() => handleOrderAgain(index)} className="btn-order-again">
                      Pedir Novamente
                    </button>
                  ) : (
                    <p className="order-again-status">Status: Pedido Novamente</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProfileUser;
