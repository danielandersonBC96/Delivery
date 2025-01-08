import React, { useEffect, useState } from 'react';
import NavBarAdmin from '../../Components/NavBarAdmin/NavBarAdmin';
import Sidebar from '../../Components/SidbarAdmin/Sidbar';
import './AdminListProduct.css';
import { assets } from '../../assets/admin_assets/assets';

const AdminListProducts = () => {
    const [foods, setFoods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertError, setAlertError] = useState(''); // Novo estado para mensagem de erro
    const [selectedFood, setSelectedFood] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchFoods = async () => {
            setLoading(true);
            try {
                const response = await fetch(`http://localhost:4000/foods?page=${page}`);
                if (!response.ok) throw new Error('Erro ao buscar os alimentos');
                const result = await response.json();
                setFoods(result.data);
                setTotalItems(result.totalCount);
            } catch (err) {
                setError(err.message);
                showAlertError(err.message); // Mostrar erro ao buscar alimentos
            } finally {
                setLoading(false);
            }
        };

        fetchFoods();
    }, [page]);

    const handleDelete = async (name) => {
        try {
            const response = await fetch(`http://localhost:4000/foods/name/${encodeURIComponent(name)}`, {
                method: 'DELETE'
            });
    
            if (!response.ok) throw new Error('Erro ao excluir o alimento');
    
            setFoods(prevFoods => prevFoods.filter(food => food.name !== name));
            showAlert('Alimento deletado com sucesso');
        } catch (err) {
            console.error(err.message);
            showAlertError('Erro ao excluir o alimento'); // Usar nova função para erro
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

            setFoods(prevFoods => prevFoods.map(food => (food.id === updatedFood.id ? { ...food, ...updatedFood, image: updatedFood.image instanceof File ? URL.createObjectURL(updatedFood.image) : food.image } : food)));
            showAlert('Alimento atualizado com sucesso');
            setIsModalOpen(false);
        } catch (err) {
            console.error(err.message);
            showAlertError('Erro ao atualizar o alimento'); // Usar nova função para erro
        }
    };

    const showAlert = (message) => {
        setAlertMessage(message);
        setAlertError(''); // Limpar mensagem de erro
        setTimeout(() => setAlertMessage(''), 3000);
    };

    const showAlertError = (message) => {
        setAlertError(message);
        setAlertMessage(''); // Limpar mensagem de alerta
        setTimeout(() => setAlertError(''), 3000);
    };

    const limit = 10;
    const totalPages = Math.ceil(totalItems / limit);

    if (loading) return <p>Carregando...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className='admin-list'>
            <NavBarAdmin />
            <div className="app-content">
                <Sidebar />
                <div className="product-list">
                    <p className='lista-p'>Lista de Alimentos</p>
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
                                foods.map(food => (
                                    <tr key={food.id}>
                                        <td>
                                            <img
                                                src={food.image}
                                                alt={food.name}
                                                style={{ width: '100px' }}
                                            />
                                        </td>
                                        <td>{food.name}</td>
                                        <td>{food.description}</td>
                                        <td>{food.category}</td>
                                        <td>R$ {food.price.toFixed(2)}</td>
                                        <td>
                                            <div className='icon-table'>
                                                <img 
                                                    src={assets.excluir} 
                                                    alt="Excluir" 
                                                    onClick={() => handleDelete(food.name)} 
                                                    style={{ cursor: 'pointer' }} 
                                                />
                                                <img 
                                                    src={assets.editar} 
                                                    alt="Editar" 
                                                    onClick={() => handleEdit(food)} 
                                                    style={{ cursor: 'pointer' }} 
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
                        <button
                            onClick={() => setPage(prev => Math.max(prev - 1, 0))}
                            disabled={page === 0}
                        >
                            <i className="fa fa-chevron-left"></i> Anterior
                        </button>
                        <span>Página {page + 1} de {totalPages}</span>
                        <button
                            onClick={() => setPage(prev => Math.min(prev + 1, totalPages - 1))}
                            disabled={page >= totalPages - 1}
                        >
                            Próximo <i className="fa fa-chevron-right"></i>
                        </button>
                    </div>
                </div>
            </div>

            {alertMessage && (
                <div className="alert-message">
                    {alertMessage}
                </div>
            )}

            {alertError && (
                <div className="alert-error">
                    {alertError}
                </div>
            )}

            {isModalOpen && (
                <EditFoodModal
                    food={selectedFood}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                />
            )}
        </div>
    );
}

// EditFoodModal component
const EditFoodModal = ({ food, onClose, onSave }) => {
    const [formData, setFormData] = useState({ ...food });

    useEffect(() => {
        setFormData({ ...food });
    }, [food]);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === "image") {
            setFormData((prev) => ({
                ...prev,
                image: files[0]
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        onSave(formData);
    };

    const handleRemoveImage = () => {
        setFormData((prev) => ({ ...prev, image: null }));
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <img
                onClick={onClose}
                src={assets.fechar}
                alt="Close"
                className="close-icon"
            />
            <h2 className='close-title'>Fechar</h2>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2 className="modal-title">Editar Alimento</h2>

                <div className="add-img-upload flex-col">
                    <label className="upload-label" htmlFor="image">
                        {formData.image ? (
                            <div className="image-container">
                                <img
                                    src={typeof formData.image === "object" ? URL.createObjectURL(formData.image) : formData.image}
                                    alt="Selected"
                                    className="image-preview"
                                />
                                <button
                                    type="button"
                                    className="remove-image-btn"
                                    onClick={handleRemoveImage}
                                >
                                    Remover
                                </button>
                            </div>
                        ) : (
                            <img
                                src={assets.upload_area}
                                alt="Add"
                                className="add-img-icon"
                            />
                        )}
                    </label>
                    <input
                        type="file"
                        id="image"
                        name="image"
                        accept="image/*"
                        onChange={handleChange}
                        style={{ display: 'none' }}
                    />
                </div>

                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Nome"
                        required
                    />
                    <input
                        type="text"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Descrição"
                        required
                    />
                    <input
                        type="text"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        placeholder="Categoria"
                        required
                    />
                      <select 
            name="category" 
            className="select-field" 
            required 
            value={formData.category}
            onChange={handleChange}
          >
            <option value="">Select Category</option>
            <option value="Salad">Salad</option>
            <option value="Rolls">Rolls</option>
            <option value="Deserts">Deserts</option>
            <option value="Sandwich">Sandwich</option>
            <option value="Cake">Cake</option>
            <option value="Pure Veg">Pure Veg</option>
            <option value="Pasta">Pasta</option>
            <option value="Noodles">Noodles</option>
          </select>
                    <button  className="save-btn"type="submit">Salvar</button>
                </form>
            </div>
        </div>
    );
};

export default AdminListProducts;
