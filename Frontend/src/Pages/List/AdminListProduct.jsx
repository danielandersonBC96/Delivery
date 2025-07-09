import React, { useEffect, useState, useContext } from 'react';
import NavBarAdmin from '../../Components/NavBarAdmin/NavBarAdmin';
import Sidebar from '../../Components/SidbarAdmin/Sidbar';
import './AdminListProduct.css';
import { StoreContext } from '../../Content/StoreContent'; // ✅ Importação do contexto

import { FiTrash2, FiEdit } from 'react-icons/fi'; // <-- Import dos ícones React Icons

const AdminListProduct = () => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertError, setAlertError] = useState('');
  const [selectedFood, setSelectedFood] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { fetchFoodList } = useContext(StoreContext); // ✅ Uso do contexto

  useEffect(() => {
    const fetchFoods = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:4000/api/foods?page=${page}`);
        if (!response.ok) throw new Error('Erro ao buscar os alimentos');
        const result = await response.json();
        setFoods(result.data);
        setTotalItems(result.totalCount);
      } catch (err) {
        setError(err.message);
        showAlertError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFoods();
  }, [page]);

  const handleDelete = async (name) => {
    try {
      const response = await fetch(`http://localhost:4000/api/foods/name/${encodeURIComponent(name)}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Erro ao excluir o alimento');

      setFoods((prevFoods) => prevFoods.filter((food) => food.name !== name));
      await fetchFoodList(); // ✅ Atualiza menu automaticamente
      showAlert('Alimento deletado com sucesso');
    } catch (err) {
      console.error(err.message);
      showAlertError('Erro ao excluir o alimento');
    }
  };

  const handleEdit = (food) => {
    setSelectedFood(food);
    setIsModalOpen(true);
  };

  const handleSave = async (updatedFood) => {
    try {
      const formData = new FormData();
      formData.append('name', updatedFood.name);
      formData.append('description', updatedFood.description);
      formData.append('category', updatedFood.category);
      formData.append('price', updatedFood.price);

      if (updatedFood.image) {
        formData.append('image', updatedFood.image);
      }

      const response = await fetch(`http://localhost:4000/foods/${updatedFood.id}`, {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) throw new Error('Erro ao atualizar o alimento');

      setFoods((prevFoods) =>
        prevFoods.map((food) =>
          food.id === updatedFood.id
            ? {
                ...food,
                ...updatedFood,
                image:
                  updatedFood.image instanceof File
                    ? URL.createObjectURL(updatedFood.image)
                    : food.image,
              }
            : food
        )
      );

      await fetchFoodList(); // ✅ Atualiza menu automaticamente
      showAlert('Alimento atualizado com sucesso');
      setIsModalOpen(false);
    } catch (err) {
      console.error(err.message);
      showAlertError('Erro ao atualizar o alimento');
    }
  };

  const showAlert = (message) => {
    setAlertMessage(message);
    setAlertError('');
    setTimeout(() => setAlertMessage(''), 3000);
  };

  const showAlertError = (message) => {
    setAlertError(message);
    setAlertMessage('');
    setTimeout(() => setAlertError(''), 3000);
  };

  const limit = 10;
  const totalPages = Math.ceil(totalItems / limit);

  if (loading) return <p>Carregando...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="admin-list">
      <NavBarAdmin />
      <div className="app-content">
        <Sidebar />
        <div className="product-list">
          <p className="lista-p">Lista de Alimentos</p>
          <table className="product-table">
            <thead>
              <tr>
                <th>Imagem</th>
                <th>Nome</th>
                <th>Descrição</th>
                <th>Categoria</th>
                <th>Valor</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {foods.length > 0 ? (
                foods.map((food) => (
                  <tr key={food.id}>
                    <td>
                      <img src={food.image} alt={food.name} style={{ width: '100px' }} />
                    </td>
                    <td>{food.name}</td>
                    <td>{food.description}</td>
                    <td>{food.category}</td>
                    <td>R$ {food.price.toFixed(2)}</td>
                    <td>
                      <div className="icon-table">
                        <FiTrash2
                          size={20}
                          color="red"
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleDelete(food.name)}
                          title="Excluir"
                        />
                        <FiEdit
                          size={20}
                          color="blue"
                          style={{ cursor: 'pointer', marginLeft: 10 }}
                          onClick={() => handleEdit(food)}
                          title="Editar"
                        />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">Nenhum alimento encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="pagination">
            <button onClick={() => setPage((prev) => Math.max(prev - 1, 0))} disabled={page === 0}>
              <i className="fa fa-chevron-left"></i> Anterior
            </button>
            <span>
              Página {page + 1} de {totalPages}
            </span>
            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages - 1))}
              disabled={page >= totalPages - 1}
            >
              Próximo <i className="fa fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>

      {alertMessage && <div className="alert-message">{alertMessage}</div>}
      {alertError && <div className="alert-error">{alertError}</div>}

      {isModalOpen && (
        <EditFoodModal
          food={selectedFood}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default AdminListProduct;

// ------------------------------------------------------
// Modal EditFoodModal incluído aqui para facilitar:

const EditFoodModal = ({ food, onClose, onSave }) => {
  const [name, setName] = useState(food.name || '');
  const [description, setDescription] = useState(food.description || '');
  const [category, setCategory] = useState(food.category || '');
  const [price, setPrice] = useState(food.price || '');
  const [image, setImage] = useState(null); // Para novo arquivo de imagem (File)
  const [preview, setPreview] = useState(food.image || ''); // Preview da imagem

  React.useEffect(() => {
    setName(food.name || '');
    setDescription(food.description || '');
    setCategory(food.category || '');
    setPrice(food.price || '');
    setPreview(food.image || '');
    setImage(null);
  }, [food]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name || !description || !category || !price) {
      alert('Por favor, preencha todos os campos');
      return;
    }

    onSave({
      id: food.id,
      name,
      description,
      category,
      price,
      image, // arquivo do input para upload
    });
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-edit-food">
        <h2>Editar Alimento</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Nome:
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label>
            Descrição:
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </label>
          <label>
            Categoria:
            <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} />
          </label>
          <label>
            Preço:
            <input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </label>
          <label>
            Imagem:
            <input type="file" accept="image/*" onChange={handleImageChange} />
          </label>
          {preview && <img src={preview} alt="Preview" style={{ width: '150px' }} />}
          <div className="modal-buttons">
            <button type="submit">Salvar</button>
            <button type="button" onClick={onClose}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
