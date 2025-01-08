import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StoreContext } from '../../Content/StoreContent';
import './PagesDetails.css';
import { 
  acompanhamento_refri, 
  acompanhamento_arroz, 
  acompanhamento_batata, 
  acompanhamento_principal 
} from '../../assets/frontend_assets/assets';

const PagesDetails = () => {
  const { addToCart, food_list } = useContext(StoreContext);
  const navigate = useNavigate();
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (food_list && food_list.length > 0) {
      const foundProduct = food_list.find((item) => item._id === id);
      if (foundProduct) {
        setProduct(foundProduct);
      }
      setLoading(false);
    }
  }, [food_list, id]);

  const handleCheckboxChange = (event, item) => {
    const itemName = item.acompanhamento_name || item.acompanhamento_arroz_name || item.acompanhamento_batata_name || item.acompanhamento_principal_name;
    const itemPrice = item.preco;

    setSelectedItems((prevSelected) => {
      if (event.target.checked) {
        return [...prevSelected, { name: itemName, price: itemPrice }];
      } else {
        return prevSelected.filter((selectedItem) => selectedItem.name !== itemName);
      }
    });
  };

  const handleAddToCart = () => {
    if (product) {
      const cartItem = {
        id: product._id,
        name: product.name,
        price: product.price,
        description: product.description,
        category: product.category,
        image: product.image || '/default-image.jpg',
        extras: selectedItems,
        total: product.price + selectedItems.reduce((sum, item) => sum + item.price, 0),
      };

      addToCart(cartItem);
      setShowModal(true); // Show modal after adding to cart
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    navigate('/Cart'); // Navigate to Cart after closing modal
  };

  if (loading) {
    return <p>Carregando...</p>;
  }

  if (!product) {
    return <p>Produto não encontrado</p>;
  }

  return (
    <div className="product-details">
      {/* Product and Extras Section */}
      <div className="product-image-container">
        <img src={product.image || '/default-image.jpg'} alt={product.name} className="product-details-image" />
      </div>
      <div className="product-info">
        <h1>Detalhes da compra</h1>
        <p className="product-name">{product.name}</p>
        <p className="product-description">{product.description}</p>
        <p className="product-category">{product.category}</p>
        <div className="product-price">
          <p><strong>Preço:</strong> ${product.price}</p>
        </div>
      </div>

      <div className="Cardapio">
        <h1>Cardápio</h1>

        {/* Render Extra Options */}
        {[
          { title: "Escolha o Refrigerante", data: acompanhamento_refri, key: "acompanhamento_name", imageKey: "acompanhamento_image" },
          { title: "Escolha o Arroz", data: acompanhamento_arroz, key: "acompanhamento_arroz_name", imageKey: "acompanhamento_arroz_image" },
          { title: "Escolha a Batata", data: acompanhamento_batata, key: "acompanhamento_batata_name", imageKey: "acompanhamento_batata_image" },
          { title: "Escolha o Principal", data: acompanhamento_principal, key: "acompanhamento_principal_name", imageKey:  "acompanhamento_principal_image" }
        ].map(({ title, data, key, imageKey }, index) => (
          <div key={index}>
            <p className="title-cardapio">{title}</p>
            <div className="acompanhamentos-container">
              {data.map((item, idx) => (
                <div key={idx} className="explore-menu-list-coca">
                  <img src={item[imageKey]} alt={item[key]} className="acompanhamento-image" />
                  <p>{item[key]}</p>
                  <p className='preco'><strong>Preço:</strong> {item.preco}</p>
                  <input
                    type="checkbox"
                    onChange={(e) => handleCheckboxChange(e, item)}
                    checked={selectedItems.some(selected => selected.name === item[key])}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

      </div>
      <button className="add-to-cart-button" onClick={handleAddToCart}>Adicionar ao Carrinho</button>

      {/* Modal */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Itens Selecionados</h2>
            <p><strong>Produto:</strong> {product.name}</p>
            <p><strong>Preço:</strong> ${product.price}</p>
            <h3>Extras Selecionados:</h3>
            <ul>
              {selectedItems.map((item, index) => (
                <li key={index}>{item.name} - ${item.price}</li>
              ))}
            </ul>
            <button onClick={handleCloseModal}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PagesDetails;
