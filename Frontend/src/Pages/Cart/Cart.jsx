import React, { useContext, useState } from 'react';
import './Cart.css';
import { StoreContext } from '../../Content/StoreContent';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const { cartItems, removeFromCart, getTotalCartAmount } = useContext(StoreContext);
  const [discount, setDiscount] = useState(0);
  const [promoCode, setPromoCode] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const navigate = useNavigate();

  const safeToFixed = (value, decimals = 2) => {
    return value && !isNaN(value) ? value.toFixed(decimals) : '0.00';
  };

  const getProductTotal = (item) => {
    let productTotal = (item.product?.price || 0) * (item.quantity || 0);
    if (item.acompanhamentos && item.acompanhamentos.length > 0) {
      item.acompanhamentos.forEach((acomp) => {
        productTotal += acomp.preco || 0;
      });
    }
    return productTotal;
  };

  const handleApplyPromoCode = () => {
    if (promoCode === "DESCONTO10") {
      setDiscount(0.1);
    } else {
      setDiscount(0);
    }
  };

  const getFinalTotal = () => {
    const subtotal = getTotalCartAmount();
    const deliveryFee = 2.00;
    const discountAmount = subtotal * discount;
    return safeToFixed(subtotal + deliveryFee - discountAmount);
  };
  const sendWhatsAppMessage = () => {
    if (!phoneNumber || !customerName) {
      alert("Preencha o nome e número do cliente antes de continuar.");
      return;
    }
  
    if (!paymentMethod) {
      alert("Selecione um método de pagamento.");
      return;
    }
  
    const formattedItems = Object.keys(cartItems).map((productId) => {
      const item = cartItems[productId];
      if (item.quantity > 0) {
        const productTotal = getProductTotal(item);
        const accompDetails = item.acompanhamentos && item.acompanhamentos.length > 0
          ? ` (Acompanhamentos: ${item.acompanhamentos.map(acomp => acomp.name).join(', ')})`
          : '';
        return `- ${item.product?.name} (${item.quantity}x) R$ ${safeToFixed(productTotal)}${accompDetails}`;
      }
      return null;
    }).filter(Boolean).join("\n");
  
    const subtotal = getTotalCartAmount();
    const discountAmount = subtotal * discount;
    const totalAmount = parseFloat(subtotal - discountAmount + 2).toFixed(2); // Total com desconto e taxa
  
    const message = `Olá, ${customerName}! 😊\n\n` +
      `🌟 *Idelivery* 🌟\n\n` +
      `🛒 *Itens do Pedido:*\n${formattedItems}\n\n` +
      `💰 *Total dos Itens:* R$ ${safeToFixed(subtotal)}\n` +
      `📦 *Taxa de entrega:* R$ 2.00\n` +
      `💳 *Método de pagamento:* ${paymentMethod}\n` +
      `🛍️ *Total Final:* R$ ${totalAmount}\n` +
      `📱 Número: ${phoneNumber}\n\n`;
  
    // Corrigir formato do número de telefone
    const formattedPhoneNumber = phoneNumber.replace(/\D/g, ''); // Remove não dígitos
  
    // Verificar se o dispositivo é mobile ou desktop
    const isMobile = /Mobi|Android|iPhone/i.test(navigator.userAgent);
  
    const url = isMobile
      ? `https://wa.me/55${formattedPhoneNumber}?text=${encodeURIComponent(message)}`
      : `https://web.whatsapp.com/send?phone=55${formattedPhoneNumber}&text=${encodeURIComponent(message)}`;
  
    window.open(url, '_blank');
  };
  
  
  return (
    <div className="cart">
      <div className="cart-items">
        {Object.keys(cartItems).map((productId) => {
          const item = cartItems[productId];
          if (item.quantity > 0) {
            return (
              <div className="cart-item-card" key={productId}>
                <div className="cart-item-image">
                  <img src={item.product?.image || '/default-image.jpg'} alt={item.product?.name} />
                </div>
                <div className="cart-item-details">
                  <h4>{item.product?.name || 'Unavailable'}</h4>
                  <p>Price: R$ {item.product?.price ? safeToFixed(item.product.price) : '0.00'}</p>
                  <p>Quantity: {item.quantity}</p>
                  <p>Total: R$ {safeToFixed(getProductTotal(item))}</p>
                  {item.acompanhamentos && item.acompanhamentos.length > 0 ? (
                    <ul>
                      {item.acompanhamentos.map((acomp, index) => (
                        <li key={index}>{acomp.name || 'Extras'}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>No extras</p>
                  )}
                </div>
                <button  onClick={() => removeFromCart(item.product._id)} className="remove-button">Remove</button>
              </div>
            );
          }
          return null;
        })}
      </div>

      <div className="cart-summary">
        <div className="cart-total">
          <div className="cart-total-details">
            <p>SubTotal</p>
            <p>R$ {safeToFixed(getTotalCartAmount())}</p>
          </div>
          <div className="cart-total-details">
            <p>Delivery Fee</p>
            <p>R$ 2.00</p>
          </div>
          <div className="cart-total-details">
            <b>Total</b>
            <b>R$ {getFinalTotal()}</b>
          </div>
        </div>

        <div className="cart-promocode">
          <div className="cart-promocode-input">
            <input
              type="text"
              className="promo-input"
              placeholder="Promo Code"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
            />
            <button className="promo-submit" onClick={handleApplyPromoCode}>Apply</button>
          </div>
          <button className="pay-button" onClick={() => setShowModal(true)}>Checkout</button>
        </div>
      </div>

      {showModal && (
        <div className="payment-modal">
          <div className="modal-content">
            <h3>Escolha o método de pagamento</h3>
            <select 
              value={paymentMethod} 
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="">Selecione o método de pagamento</option>
              <option value="PIX">PIX</option>
              <option value="Cartão de Crédito">Cartão de Crédito</option>
              <option value="Cartão de Débito">Cartão de Débito</option>
            </select>
            <input
              type="text"
              placeholder="Nome do cliente"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className='input-modal'
            />
            <input
              type="text"
              placeholder="Número do cliente"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            className='input'
            />
            <button onClick={sendWhatsAppMessage}>Enviar WhatsApp</button>
            <button onClick={() => setShowModal(false)}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
