import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProfileUser.css';

export const ProfileUser = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('Usuário não autenticado');
          return;
        }

        // Busca os pedidos do usuário autenticado
        const response = await axios.get('http://localhost:4000/api/orders/user', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const ordersData = response.data.orders;

        // Para cada pedido, buscar os itens relacionados (usando a rota correta)
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
    const updatedOrders = [...orders];
    updatedOrders[orderIndex] = {
      ...updatedOrders[orderIndex],
      status: 'Pedido Novamente'
    };
    setOrders(updatedOrders);
  };

  return (
    <div className="centered-container">
      <h2>Compras do Usuário</h2>
      <div className="purchase-container">
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
              <h3>Detalhes da Compra {index + 1}</h3>
              <p>Data da compra: {order.purchaseDate}</p>
              <p>Status da compra: {order.status}</p>
              <p className="total">Total: R$ {order.total ? order.total.toFixed(2) : ''}</p>
              {order.status !== 'Pedido Novamente' ? (
                <button onClick={() => handleOrderAgain(index)}>Pedir Novamente</button>
              ) : (
                <p>Status: Pedido Novamente</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfileUser;
