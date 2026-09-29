import React from 'react';
import { useOrder } from '../context/OrderContext';
import { ShoppingCart, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';

export default function CartSidebar() {
  const { cart, removeFromCart, addToCart, clearCart, totalAmount, totalItemCount, setScreen, speak } = useOrder();

  const handleCheckout = () => {
    if (cart.length === 0) {
      speak("Your cart is empty. Please order some items first.");
      return;
    }
    setScreen('review');
    speak("Let me review your order.");
  };

  return (
    <aside className="kiosk-cart-panel" aria-label="Current Order">
      <div className="cart-panel-header">
        <div className="cart-title-with-icon">
          <ShoppingCart size={22} className="cart-header-icon" />
          <h2 className="cart-panel-title">YOUR ORDER</h2>
        </div>
        {cart.length > 0 && (
          <button 
            type="button" 
            className="cart-clear-btn" 
            onClick={() => {
              clearCart();
              speak("I have cleared your cart.");
            }}
            title="Clear all items"
          >
            <Trash2 size={16} />
            <span>Clear</span>
          </button>
        )}
      </div>

      <div className="cart-items-container">
        {cart.length === 0 ? (
          <div className="cart-empty-state">
            <div className="empty-cart-illustration">🛒</div>
            <p className="empty-cart-title">Your order is empty</p>
            <p className="empty-cart-subtitle">Speak to order or say:</p>
            <div className="empty-voice-suggestions">
              <span className="voice-chip">"I want two pazham pori"</span>
              <span className="voice-chip">"Give me one tea"</span>
              <span className="voice-chip">"Show meals"</span>
            </div>
          </div>
        ) : (
          <ul className="cart-items-list">
            {cart.map(({ item, quantity }) => {
              const subtotal = item.price * quantity;
              return (
                <li key={item.id} className="cart-item-row">
                  <div className="cart-item-thumb-wrapper">
                    <img src={item.image} alt={item.name} className="cart-item-thumb" />
                  </div>
                  <div className="cart-item-details">
                    <h4 className="cart-item-name">{item.shortName}</h4>
                    <div className="cart-item-meta">
                      <span className="cart-item-unit-price">₹{item.price} each</span>
                    </div>
                  </div>

                  <div className="cart-item-actions">
                    <div className="cart-qty-controls">
                      <button 
                        type="button" 
                        className="qty-btn"
                        onClick={() => removeFromCart(item, 1)}
                        aria-label="Decrease quantity"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="cart-item-qty">{quantity}</span>
                      <button 
                        type="button" 
                        className="qty-btn"
                        onClick={() => addToCart(item, 1)}
                        aria-label="Increase quantity"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <div className="cart-item-subtotal">₹{subtotal}</div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="cart-panel-footer">
        <div className="cart-summary-calculations">
          <div className="calc-row">
            <span className="calc-label">Total Items</span>
            <span className="calc-val">{totalItemCount}</span>
          </div>
          <div className="calc-row total-row">
            <span className="total-label">TOTAL</span>
            <span className="total-val">₹{totalAmount}</span>
          </div>
        </div>

        <button 
          type="button" 
          className={`cart-checkout-action-btn ${cart.length === 0 ? 'disabled' : ''}`}
          onClick={handleCheckout}
          disabled={cart.length === 0}
        >
          <span>Review & Checkout</span>
          <ArrowRight size={20} />
        </button>

        <div className="cart-voice-prompt">
          <span>Say <strong>"That's all"</strong> or <strong>"Checkout"</strong></span>
        </div>
      </div>
    </aside>
  );
}
