import React, { useState, useEffect } from 'react';
import './Add.css';
import { assets } from '../../assets/admin_assets/assets';

const CustomAlert = ({ message, onClose }) => {
  return (
    <div className="custom-alert">
      <div className="alert-content">
        <p>{message}</p>
        <button onClick={onClose} className="close-alert-btn">Close</button>
      </div>
    </div>
  );
};

const Add = () => {
  const [formData, setFormData] = useState({
    image: null,
    name: '',
    description: '',
    category: '',
    price: 0,
  });

  const [categories, setCategories] = useState([]); // <-- Estado para categorias

  const [alertMessage, setAlertMessage] = useState('');

  // Buscar categorias do backend ao montar o componente
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:4000/category/get-category');
        const data = await response.json();
        setCategories(data.categories || []);
      } catch (error) {
        console.error('Erro ao buscar categorias:', error);
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'file' ? files[0] : value,
    }));
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({
      ...prev,
      image: null,
    }));
  };

  const onSubmitHandle = async (event) => {
    event.preventDefault();

    const submitData = new FormData();
    submitData.append("name", formData.name);
    submitData.append("description", formData.description);
    submitData.append("price", formData.price);
    submitData.append("category", formData.category);
    if (formData.image) {
        submitData.append("image", formData.image);
    }

    try {
        const response = await fetch('http://localhost:4000/api/foods', {
            method: 'POST',
            body: submitData,
        });

        if (!response.ok) {
            throw new Error('Erro ao adicionar produto');
        }

        const result = await response.json();
        console.log('Produto adicionado com sucesso:', result);

        setAlertMessage('Produto adicionado com sucesso!');

        setFormData({
            image: null,
            name: '',
            description: '',
            category: '',
            price: 0,
        });
    } catch (error) {
        console.error('Erro ao adicionar produto:', error);
        setAlertMessage('Erro ao adicionar produto. Tente novamente.');
    }
  };

  return (
    <div className="add">
      <form onSubmit={onSubmitHandle} className="add-form flex-col">
        <div className="add-img-upload flex-col">
          <p>Upload Image</p>
          <label className="upload-label" htmlFor="image">
            {formData.image ? (
              <div className="image-container">
                <img 
                  src={URL.createObjectURL(formData.image)} 
                  alt="Selected" 
                  className="image-preview" 
                />
                <button
                  type="button" 
                  className="remove-image-btn" 
                  onClick={handleRemoveImage}
                >
                  Remove 
                </button>
              </div>
            ) : (
              <img 
                src={assets.upload_area} 
                alt="Upload" 
                className="upload-placeholder" 
              />
            )}
            <input 
              type="file" 
              id="image" 
              name="image" 
              className="upload-input" 
              onChange={handleChange} 
            />
          </label>
        </div>

        <div className="add-product-name">
          <p>Product Name</p>
          <input 
            type="text" 
            name="name" 
            placeholder="Type Here" 
            className="input-field" 
            required 
            value={formData.name}
            onChange={handleChange}
          />
        </div>

        <div className="add-product-description flex-col">
          <p>Product Description</p>
          <textarea
            name="description"
            cols="30"
            rows="5"
            placeholder="Description"
            className="textarea-field"
            required
            value={formData.description}
            onChange={handleChange}
          ></textarea>
        </div>

        <div className="add-category-price">
          <p>Product Category</p>
          <select 
            name="category" 
            className="select-field" 
            required 
            value={formData.category}
            onChange={handleChange}
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.title}>
                {cat.title}
              </option>
            ))}
          </select>
        </div>

        <div className="add-price">
          <p>Product Price</p>
          <input 
            type="number" 
            name="price" 
            placeholder="Enter Price" 
            className="input-field" 
            required 
            min="0" 
            value={formData.price}
            onChange={handleChange}
          />
        </div>

        <div className="add-submit">
          <button type="submit" className="submit-btn">Add Product</button>
        </div>
      </form>

      {alertMessage && (
        <CustomAlert
          message={alertMessage}
          onClose={() => setAlertMessage('')}
        />
      )}
    </div>
  );
};

export default Add;
