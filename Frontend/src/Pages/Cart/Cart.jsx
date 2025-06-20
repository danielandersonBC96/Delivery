import React, { useContext, useState, useEffect } from 'react';
import './Cart.css';
import { StoreContext } from '../../Content/StoreContent';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Cart = () => {
  const { cartItems, removeFromCart, getTotalCartAmount, clearCart } = useContext(StoreContext);
  const [discount, setDiscount] = useState(0);
  const [promoCode, setPromoCode] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [userOrders, setUserOrders] = useState([]);
  const navigate = useNavigate();

  const safeToFixed = (value, decimals = 2) => {
    return value !== undefined && value !== null && !isNaN(value) ? Number(value).toFixed(decimals) : '0.00';
  };

  const getProductTotal = (item) => {
    const basePrice = item.product?.price || 0;
    const quantity = item.quantity || 0;
    const baseTotal = basePrice * quantity;

    const acompanhamentosTotal = item.acompanhamentos?.reduce(
      (sum, acomp) => sum + ((acomp.preco || 0) * quantity),
      0
    ) || 0;

    return {
      total: baseTotal + acompanhamentosTotal,
      name: item.product?.name || '',
      description: item.product?.description || '',
      image: item.product?.image || ''
    };
  };

  const getFinalTotal = () => {
    const subtotal = getTotalCartAmount();
    const discountAmount = subtotal * discount;
    const deliveryFee = 2;
    return subtotal - discountAmount + deliveryFee;
  };

  const handleApplyPromoCode = () => {
    if (promoCode.trim().toUpperCase() === "DESCONTO10") {
      setDiscount(0.1);
      alert("Desconto de 10% aplicado.");
    } else {
      setDiscount(0);
      alert("Código inválido.");
    }
  };

  const registerPurchase = async () => {
    const user_id = localStorage.getItem('userId');
    const token = localStorage.getItem('token');

    if (!user_id || !token) {
      alert('Usuário não autenticado.');
      return;
    }

    if (!cartItems || cartItems.length === 0) {
      alert('Carrinho vazio.');
      return;
    }

    if (!customerName.trim() || !phoneNumber.trim()) {
      alert('Preencha nome e número do cliente.');
      return;
    }

    if (!paymentMethod) {
      alert('Escolha um método de pagamento.');
      return;
    }

    const totalAmount = getFinalTotal();

    const items = cartItems.map((item) => ({
      productId: Number(item.product._id),
      quantity: item.quantity,
      price: item.product.price,
      name: item.product.name,
      description: item.product.description,
      image: item.product.image,
      acompanhamentos: item.acompanhamentos || [],
    }));

    const orderDetails = {
      user_id: Number(user_id),
      total: Number(totalAmount),
      paymentMethod,
      customerName: customerName.trim(),
      phoneNumber: phoneNumber.trim(),
      discount,
      cartItems: items,
    };

    try {
      const response = await axios.post('http://localhost:4000/api/orders', orderDetails, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 201) {
        alert('Compra registrada com sucesso!');
        sendWhatsAppMessage();
        clearCart();
        setShowModal(false);
        fetchUserOrders(token);
      } else {
        alert('Erro ao registrar a compra.');
      }
    } catch (error) {
      console.error('Erro:', error.response ? error.response.data : error.message);
      alert('Erro ao registrar a compra.');
    }
  };

  const fetchUserOrders = async (token) => {
    try {
      const response = await axios.get('http://localhost:4000/api/orders/user', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.status === 200 && response.data.orders) {
        setUserOrders(response.data.orders);
      } else {
        setUserOrders([]);
      }
    } catch (error) {
      console.error('Erro ao buscar pedidos do usuário:', error.response ? error.response.data : error.message);
      setUserOrders([]);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserOrders(token);
    }
  }, []);

  const sendWhatsAppMessage = () => {
    if (!phoneNumber.trim() || !customerName.trim() || !paymentMethod) {
      alert('Preencha todos os dados do cliente e pagamento.');
      return;
    }

    const formattedItems = cartItems.map((item) => {
      if (item.quantity > 0) {
        const productTotal = getProductTotal(item).total;
        const accompDetails = item.acompanhamentos?.length > 0
          ? ` (Acompanhamentos: ${item.acompanhamentos.map(acomp => acomp.name).join(', ')})`
          : '';
        return `- ${item.product?.name} (${item.quantity}x) R$ ${safeToFixed(productTotal)}${accompDetails}`;
      }
      return null;
    }).filter(Boolean).join('\n');

    const subtotal = getTotalCartAmount();
    const discountAmount = subtotal * discount;
    const totalAmount = (subtotal - discountAmount + 2).toFixed(2);

    const message = `Olá, ${customerName}!\n\n` +
      `Idelivery - Confirmação de Pedido:\n\n` +
      `Itens do Pedido:\n${formattedItems}\n\n` +
      `Total dos Itens: R$ ${safeToFixed(subtotal)}\n` +
      `Taxa de entrega: R$ 2.00\n` +
      `Método de pagamento: ${paymentMethod}\n` +
      `Total Final: R$ ${totalAmount}\n` +
      `Contato: ${phoneNumber}\n`;

    const formattedPhoneNumber = phoneNumber.replace(/\D/g, '');
    const isMobile = /Mobi|Android|iPhone/i.test(navigator.userAgent);

    const url = isMobile
      ? `https://wa.me/55${formattedPhoneNumber}?text=${encodeURIComponent(message)}`
      : `https://web.whatsapp.com/send?phone=55${formattedPhoneNumber}&text=${encodeURIComponent(message)}`;

    window.open(url, '_blank');
  };

  return (
    <div className="cart">
      <div className="cart-items">
        {cartItems.length === 0 && <p>Carrinho vazio.</p>}

        {cartItems.map((item, index) => (
          item.quantity > 0 && (
            <div className="cart-item-card" key={index}>
              <div className="cart-item-image">
                <img src={item.product?.image || '/default-image.jpg'} alt={item.product?.name || 'Produto'} />
              </div>
              <div className="cart-item-details">
                <h4>{item.product?.name || 'Indisponível'}</h4>
                <p>Descrição: {item.product?.description || 'Sem descrição'}</p>
                <p>Preço: R$ {safeToFixed(item.product?.price)}</p>
                <p>Quantidade: {item.quantity}</p>
                <p>Total: R$ {safeToFixed(getProductTotal(item).total)}</p>
                {item.acompanhamentos?.length > 0 ? (
                  <ul>
                    {item.acompanhamentos.map((acomp, idx) => (
                      <li key={idx}>{acomp.name}</li>
                    ))}
                  </ul>
                ) : (
                  <p>Sem extras</p>
                )}
              </div>
              <button onClick={() => removeFromCart(item.product._id)} className="remove-button">
                Remover
              </button>
            </div>
          )
        ))}
      </div>

      <div className="cart-summary">
        <div className="cart-total">
          <div className="cart-total-details">
            <p>SubTotal</p>
            <p>R$ {safeToFixed(getTotalCartAmount())}</p>
          </div>
          <div className="cart-total-details">
            <p>Taxa de entrega</p>
            <p>R$ 2.00</p>
          </div>
          <div className="cart-total-details">
            <b>Total</b>
            <b>R$ {safeToFixed(getFinalTotal())}</b>
          </div>
        </div>

        <div className="cart-promocode">
          <div className="cart-promocode-input">
            <input
              type="text"
              className="promo-input"
              placeholder="Código promocional"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
            />
            <button className="promo-submit" onClick={handleApplyPromoCode}>
              Aplicar
            </button>
          </div>
          <button className="pay-button" onClick={() => setShowModal(true)} disabled={cartItems.length === 0}>
            Finalizar Pedido
          </button>
        </div>
      </div>

      {showModal && (
        <div className="payment-modal">
          <div className="modal-content">
            <h3>Escolha o método de pagamento</h3>
            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
              <option value="">Selecione</option>
              <option value="PIX">PIX</option>
              <option value="Cartão de Crédito">Cartão de Crédito</option>
              <option value="Cartão de Débito">Cartão de Débito</option>
            </select>
            <input
              type="text"
              placeholder="Nome do cliente"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="input-modal"
            />
            <input
              type="text"
              placeholder="Número do cliente"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="input-modal"
            />
            <button onClick={registerPurchase}>Registrar Compra</button>
            <button onClick={() => setShowModal(false)}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
