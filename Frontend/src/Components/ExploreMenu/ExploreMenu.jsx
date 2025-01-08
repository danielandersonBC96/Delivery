import React, { useEffect, useRef } from 'react';
import './ExploreMenu.css';
import { menu_list } from '../../assets/frontend_assets/assets';

const ExploreMenu = ({ category, setCategory }) => {
  const carouselRef = useRef(null);

  // Load the selected category from localStorage on component mount
  useEffect(() => {
    const savedCategory = localStorage.getItem('selectedCategory');
    if (savedCategory) {
      setCategory(savedCategory);
    }
  }, [setCategory]);

  // Reset to "All" category when "Home" is accessed
  const handleCategoryClick = (item) => {
    const newCategory = item.menu_name === "Home" ? "All" : item.menu_name;
    setCategory(newCategory);
    localStorage.setItem('selectedCategory', newCategory);
  };

  // Scroll to the left
  const scrollLeft = () => {
    carouselRef.current.scrollBy({ left: -200, behavior: 'smooth' });
  };

  // Scroll to the right
  const scrollRight = () => {
    carouselRef.current.scrollBy({ left: 200, behavior: 'smooth' });
  };

  return (
    <div className="explore-menu" id="explore-menu">
      <h1>Explore Menu</h1>
      <p className="explore-menu-text">Explore all kinds of foods</p>

      <div className="carousel-container">
        {/* Left Arrow */}
        <button className="arrow left" onClick={scrollLeft}>
          &lt;
        </button>

        {/* Carousel Items */}
        <div className="explore-menu-list" ref={carouselRef}>
          {menu_list.map((item, index) => (
            <div
              onClick={() => handleCategoryClick(item)}
              key={index}
              className="explore-menu-list-item"
            >
              <img
                className={category === item.menu_name || (item.menu_name === "Home" && category === "All") ? 'active' : ''}
                src={item.menu_image}
                alt={item.menu_name}
              />
              <p>{item.menu_name}</p>
            </div>
          ))}
        </div>

        {/* Right Arrow */}
        <button className="arrow right" onClick={scrollRight}>
          &gt;
        </button>
      </div>
    </div>
  );
};

export default ExploreMenu;
