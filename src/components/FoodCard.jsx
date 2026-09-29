import React from 'react';
import { useOrder } from '../context/OrderContext';
import { Plus, Check } from 'lucide-react';

export default function FoodCard({ item }) {
  const { addToCart, highlightedItemId, cart, speak } = useOrder();
  const isHighlighted = highlightedItemId === item.id;
  const inCartEntry = cart.find(e => e.item.id === item.id);
  const inCartQty = inCartEntry ? inCartEntry.quantity : 0;

  const handleAdd = () => {
    addToCart(item, 1);
    speak(`Added one ${item.shortName}.`);
  };

  return (
    <div className={`food-card ${isHighlighted ? 'highlighted' : ''} ${inCartQty > 0 ? 'in-cart' : ''}`}>
      <div className="food-card-image-wrap">
        <img 
          src={item.image} 
          alt={item.name} 
          className="food-card-image"
          loading="lazy"
        />
        <div className="food-card-overlay-gradient"></div>
        {inCartQty > 0 && (
          <div className="food-in-cart-badge">
            <Check size={14} />
            <span>{inCartQty} in cart</span>
          </div>
        )}
        {isHighlighted && (
          <div className="food-voice-highlight-tag">
            <span>Voice Selected!</span>
          </div>
        )}
      </div>

      <div className="food-card-content">
        <div className="food-title-row">
          <h3 className="food-name">{item.name}</h3>
        </div>
        <p className="food-desc">{item.description}</p>

        <div className="food-card-footer">
          <div className="food-pricing">
            <span className="food-price-currency">₹</span>
            <span className="food-price-val">{item.price}</span>
            <span className="food-unit">/ {item.unit}</span>
          </div>

          <button 
            type="button" 
            className="food-add-btn"
            onClick={handleAdd}
            aria-label={`Add ${item.name} to order`}
          >
            <Plus size={18} />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
}
