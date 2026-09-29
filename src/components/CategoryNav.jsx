import React from 'react';
import { CATEGORIES } from '../data/menu';
import { useOrder } from '../context/OrderContext';
import { Sparkles, Coffee, Utensils } from 'lucide-react';

const ICON_MAP = {
  Sparkles: Sparkles,
  Coffee: Coffee,
  Utensils: Utensils
};

export default function CategoryNav() {
  const { activeCategory, setActiveCategory, speak } = useOrder();

  const handleSelect = (categoryId, categoryName) => {
    setActiveCategory(categoryId);
    speak(`Showing ${categoryName}.`);
  };

  return (
    <nav className="category-navigation" aria-label="Menu categories">
      <div className="category-track">
        {CATEGORIES.map(cat => {
          const Icon = ICON_MAP[cat.icon] || Sparkles;
          const isActive = activeCategory === cat.id;

          return (
            <button
              key={cat.id}
              className={`category-btn ${isActive ? 'active' : ''}`}
              onClick={() => handleSelect(cat.id, cat.name)}
              type="button"
            >
              <div className="category-icon-wrapper">
                <Icon size={22} />
              </div>
              <span className="category-name">{cat.name}</span>
              <span className="category-count">{cat.count}</span>
            </button>
          );
        })}
      </div>
      <div className="category-voice-tip">
        <span>💡 Say: <em>"Show drinks"</em> or <em>"Show snacks"</em></span>
      </div>
    </nav>
  );
}
