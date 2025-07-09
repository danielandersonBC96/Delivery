import React, { useEffect, useRef, useContext } from 'react';
import './ExploreMenu.css';
import { StoreContext } from '../../Content/StoreContent';
import { FiMenu, FiHome } from 'react-icons/fi';

const ExploreMenu = ({ category, setCategory }) => {
  const carouselRef = useRef(null);
  const { categories, fetchCategories } = useContext(StoreContext);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    const savedCategory = localStorage.getItem('selectedCategory');
    if (savedCategory) {
      setCategory(savedCategory);
    }
  }, [setCategory]);

  const handleCategoryClick = (catTitle) => {
    const newCategory = catTitle === 'Home' ? 'All' : catTitle;
    setCategory(newCategory);
    localStorage.setItem('selectedCategory', newCategory);
  };

  const scrollLeft = () => {
    if (carouselRef.current)
      carouselRef.current.scrollBy({ left: -200, behavior: 'smooth' });
  };

  const scrollRight = () => {
    if (carouselRef.current)
      carouselRef.current.scrollBy({ left: 200, behavior: 'smooth' });
  };

  return (
    <div className="explore-menu" id="explore-menu">
      <div className="explore-menu-header">
        <h1>Explore o Menu</h1>
        <FiMenu className="menu-icon" />
      </div>
      <p className="explore-menu-text">Explore todos os tipos de comidas</p>

      <div className="carousel-container">
        <button className="arrow left" onClick={scrollLeft}>
          &lt;
        </button>

        <div className="explore-menu-list" ref={carouselRef}>
          {/* Categoria "Home" com ícone */}
          <div
            onClick={() => handleCategoryClick('Home')}
            className="explore-menu-list-item"
          >
            <FiHome className={`category-icon ${category === 'All' ? 'active' : ''}`} />
            <p>Home</p>
          </div>

          {/* Demais categorias com imagem */}
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => handleCategoryClick(cat.title)}
              className="explore-menu-list-item"
            >
              <img
                className={category === cat.title ? 'active' : ''}
                src={
                  cat.image
                    ? `http://localhost:4000/uploads/${cat.image}`
                    : '/assets/default.png'
                }
                alt={cat.title}
                onError={(e) => {
                  e.target.src = '/assets/default.png';
                }}
              />
              <p>{cat.title}</p>
            </div>
          ))}
        </div>

        <button className="arrow right" onClick={scrollRight}>
          &gt;
        </button>
      </div>
    </div>
  );
};

export default ExploreMenu;
