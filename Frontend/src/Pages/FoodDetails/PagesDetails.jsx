import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StoreContext } from '../../Content/StoreContent';
import './PagesDetails.css';
import axios from 'axios';

import {
  acompanhamento_refri,
  acompanhamento_arroz,
  acompanhamento_batata,
  acompanhamento_principal
} from '../../assets/frontend_assets/assets';

const PagesDetails = () => {
  const { addToCart } = useContext(StoreContext);
  const navigate = useNavigate();
  const { id } = useParams(); // ID da URL

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showModal, setShowModal] = useState(false);

  // ✅ Buscar o produto por ID da URL
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:4000/api/foods/${id}`);
        setProduct(response.data);
      } catch (error) {
        console.error('❌ Erro ao buscar produto:', error.response?.data || error.message);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  const formatPrice = (price) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(Number(price) || 0);

  const handleCheckboxChange = (event, item) => {
    const itemName =
      item.acompanhamento_name ||
      item.acompanhamento_arroz_name ||
      item.acompanhamento_batata_name ||
      item.acompanhamento_principal_name;

    const itemPrice = Number(item.preco) || 0;

    setSelectedItems((prevSelected) =>
      event.target.checked
        ? [...prevSelected, { name: itemName, price: itemPrice }]
        : prevSelected.filter((selectedItem) => selectedItem.name !== itemName)
    );
  };

  const handleAddToCart = () => {
    if (!product) return;

    const totalExtrasPrice = selectedItems.reduce((sum, item) => sum + item.price, 0);

    const cartItem = {
      id: product.id,
      name: product.name,
      price: Number(product.price) || 0,
      description: product.description,
      category: product.category,
      image: product.image || '/default-image.jpg',
      extras: selectedItems,
      total: (Number(product.price) || 0) + totalExtrasPrice,
    };

    addToCart(cartItem);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    navigate('/Cart');
  };

  if (loading) return <p>Carregando...</p>;
  if (!product) return <p>❌ Produto não encontrado.</p>;

  return (
    <div className="product-details">
      <div className="product-image-container">
        <img
          src={product.image || '/default-image.jpg'}
          alt={product.name}
          className="product-details-image"
        />
      </div>

      <div className="product-info">
        <h1>Detalhes da compra</h1>
        <p className="product-name">{product.name}</p>
        <p className="product-description">{product.description}</p>
        <p className="product-category">{product.category}</p>
        <div className="product-price">
          <p><strong>Preço:</strong> {formatPrice(product.price)}</p>
        </div>
      </div>

      <div className="Cardapio">
        <h1>Cardápio</h1>

        {[ // Extras
          { title: "Escolha o Refrigerante", data: acompanhamento_refri, key: "acompanhamento_name", imageKey: "acompanhamento_image" },
          { title: "Escolha o Arroz", data: acompanhamento_arroz, key: "acompanhamento_arroz_name", imageKey: "acompanhamento_arroz_image" },
          { title: "Escolha a Batata", data: acompanhamento_batata, key: "acompanhamento_batata_name", imageKey: "acompanhamento_batata_image" },
          { title: "Escolha o Principal", data: acompanhamento_principal, key: "acompanhamento_principal_name", imageKey: "acompanhamento_principal_image" }
        ].map(({ title, data, key, imageKey }, index) => (
          <div key={index}>
            <p className="title-cardapio">{title}</p>
            <div className="acompanhamentos-container">
              {data.map((item, idx) => (
                <div key={idx} className="explore-menu-list-coca">
                  <img src={item[imageKey]} alt={item[key]} className="acompanhamento-image" />
                  <p>{item[key]}</p>
                  <p className='preco'><strong>Preço:</strong> {formatPrice(item.preco)}</p>
                  <label>
                    <input
                      type="checkbox"
                      onChange={(e) => handleCheckboxChange(e, item)}
                      checked={selectedItems.some(selected => selected.name === item[key])}
                    />
                    Selecionar
                  </label>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button className="add-to-cart-button" onClick={handleAddToCart}>Adicionar ao Carrinho</button>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Itens Selecionados</h2>
            <p><strong>Produto:</strong> {product.name}</p>
            <p><strong>Preço:</strong> {formatPrice(product.price)}</p>
            <h3>Extras Selecionados:</h3>
            {selectedItems.length > 0 ? (
              <ul>
                {selectedItems.map((item, index) => (
                  <li key={index}>{item.name} - {formatPrice(item.price)}</li>
                ))}
              </ul>
            ) : (
              <p>Nenhum extra selecionado.</p>
            )}
            <button onClick={handleCloseModal}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PagesDetails;
