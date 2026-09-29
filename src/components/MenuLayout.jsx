import React from 'react';
import { useOrder } from '../context/OrderContext';
import { MENU_ITEMS, CATEGORIES } from '../data/menu';
import CategoryNav from './CategoryNav';
import FoodCard from './FoodCard';
import CartSidebar from './CartSidebar';

export default function MenuLayout() {
  const { activeCategory } = useOrder();

  const filteredItems = MENU_ITEMS.filter(item => item.category === activeCategory);
  const currentCategoryInfo = CATEGORIES.find(c => c.id === activeCategory);

  return (
    <div className="kiosk-menu-layout">
      <main className="kiosk-menu-main">
        <CategoryNav />

        <div className="menu-category-header">
          <h2 className="category-section-title">
            {currentCategoryInfo ? currentCategoryInfo.name : 'All Items'}
          </h2>
          <span className="category-item-count">{filteredItems.length} fresh items ready</span>
        </div>

        <div className="food-cards-grid">
          {filteredItems.map(item => (
            <FoodCard key={item.id} item={item} />
          ))}
        </div>
      </main>

      <CartSidebar />
    </div>
  );
}
