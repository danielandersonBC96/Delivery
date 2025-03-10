// ProfileUser.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { food_list } from '../../assets/frontend_assets/assets'; // Lista de produtos
import './ProfileUser.css';

const ProfileUser = () => {
  const userName = localStorage.getItem('userName') || "Guest";
  const userId = localStorage.getItem('userId'); // ID do usuário armazenado no localStorage
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        if (!userId) {
          console.error("User ID not found in localStorage.");
          return;
        }

        const response = await axios.get(`http://localhost:4000/api/purchases/${userId}`);
        setPurchases(response.data);
      } catch (error) {
        console.error("Erro ao carregar compras:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPurchases();
  }, [userId]);

  const handleReorder = (purchase) => {
    if (!food_list || food_list.length === 0) {
      console.error("Food list is not available.");
      return;
    }

    const reorderedItems = purchase.items.map(item => {
      const product = food_list.find(p => p.name === item.product_name);
      if (!product) {
        console.error(`Product not found for ${item.product_name}`);
        return null;
      }

      return {
        product: {
          name: product.name,
          price: product.price,
        },
        quantity: item.quantity,
      };
    }).filter(Boolean); // Remove itens nulos

    // Adicionar os itens ao carrinho
    console.log("Reorder purchase:", reorderedItems);
    // Aqui você pode adicionar os itens ao carrinho, chamando a função do seu carrinho
  };

  return (
    <div className="profile-user-container">
      <h1>Welcome, {userName}!</h1>
      <p className="profile-user-text">
        This is your profile page. Here you can view and update your information.
      </p>

      <h2>Your Previous Purchases</h2>
      {loading ? (
        <p>Loading your purchases...</p>
      ) : (
        purchases.length > 0 ? (
          <div className="purchase-list">
            {purchases.map((purchase, index) => (
              <div key={index} className="purchase-item">
                <h3>Purchase on {new Date(purchase.purchase_date).toLocaleDateString()}</h3>
                <ul>
                  {purchase.items.map((item, idx) => {
                    const product = food_list.find(p => p.name === item.product_name);
                    return (
                      <li key={idx}>
                        {product
                          ? `${product.name} - ${item.quantity} x R$ ${product.price.toFixed(2)}`
                          : `Product not found (${item.product_name})`}
                      </li>
                    );
                  })}
                </ul>
                <p>Total: R$ {purchase.total.toFixed(2)}</p>
                <button onClick={() => handleReorder(purchase)}>Reorder</button>
              </div>
            ))}
          </div>
        ) : (
          <p>No previous purchases found.</p>
        )
      )}
    </div>
  );
};

export default ProfileUser;
