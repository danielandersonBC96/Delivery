import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProfileUser.css';

export const ProfileUser = () => {
  const [orders, setOrders] = useState([]);
  const [username, setUsername] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const ordersPerPage = 5;

  useEffect(() => {
    const storedUsername = localStorage.getItem('username') || 'Usuário';
    setUsername(storedUsername);

    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');

        if (!token || !userId) {
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

  const handleOrderAgain = async (orderIndex) => {
    const order = currentOrders[orderIndex];
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    if (!token || !userId) {
      console.error('Usuário não autenticado');
      return;
    }

    try {
      const orderItems = order.items.map(item => ({
        productId: item.food_id,
        quantity: item.quantity,
        price: item.price,
        name: item.name,
        description: item.description,
        image: item.image
      }));

      const newOrderPayload = {
        user_id: userId,
        total: order.total,
        paymentMethod: 'Pedido Novamente',
        customerName: username,
        phoneNumber: 'Sem número',
        discount: 0,
        cartItems: orderItems
      };

      const response = await axios.post('http://localhost:4000/api/orders', newOrderPayload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.status === 201) {
        setSuccessMessage('✅ Pedido feito com sucesso!');
      } else {
        setSuccessMessage('❌ Falha ao fazer o pedido.');
      }
    } catch (error) {
      console.error('Erro ao recriar pedido:', error);
      setSuccessMessage('❌ Erro ao enviar o pedido.');
    } finally {
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  // Paginação
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

  return (
    <div className="profile-page">
      <nav className="navbar1">
        <div className="navbar-logo">Meu Perfil</div>
        <div className="navbar-user">Bem-vindo, {username}!</div>
      </nav>

      {successMessage && (
        <div className={`alert-card ${successMessage.startsWith('✅') ? 'success' : 'error'}`}>
          {successMessage}
        </div>
      )}

      <div className="main-wrapper">
        <aside className="sidebar">
          <ul>
            <li><button className="sidebar-btn">Meus Pedidos</button></li>
            <li><button className="sidebar-btn">Mercado</button></li>
            <li><button className="sidebar-btn">Sair</button></li>
          </ul>
        </aside>

        <main className="profile-content">
          <h2>Minhas Compras</h2>

          {loading ? (
            <p>Carregando seus pedidos...</p>
          ) : (
            <div className="purchase-container">
              {orders.length === 0 && <p>Você ainda não fez nenhum pedido.</p>}

              {currentOrders.map((order, index) => (
                <div key={order.id || index} className="purchase">
                  <div className="purchase-items">
                    <h3>Itens da Compra</h3>
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
                          {order.items.map((item, itemIndex) => (
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

              {orders.length > 3 && (
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

export default ProfileUser;
