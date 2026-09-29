import React from 'react';
import { useOrder } from '../context/OrderContext';
import { ShoppingBag, Sparkles, Mic } from 'lucide-react';

export default function Header() {
  const { totalItemCount, totalAmount, screen, setScreen } = useOrder();

  return (
    <header className="kiosk-header">
      <div className="header-brand">
        <div className="brand-logo-badge">
          <img src="/images/logo.png" alt="Chaya Kada Logo" className="brand-logo-img" />
        </div>
        <div className="brand-text">
          <div className="brand-title-row">
            <h1 className="brand-title">CHAYA KADA</h1>
            <span className="kiosk-tag">KIOSK #03</span>
          </div>
          <p className="brand-subtitle">Authentic Kerala Tea Shop & Traditional Snacks</p>
        </div>
      </div>

      <div className="header-status-badge">
        <span className="voice-enabled-pill">
          <Mic size={16} className="pulse-icon" />
          <span>Voice-First Experience • Speak Naturally</span>
        </span>
      </div>

      <div className="header-cart-summary" onClick={() => screen === 'menu' && totalItemCount > 0 && setScreen('review')}>
        <div className="cart-badge-icon">
          <ShoppingBag size={22} />
          {totalItemCount > 0 && <span className="cart-counter-bubble">{totalItemCount}</span>}
        </div>
        <div className="cart-summary-text">
          <span className="cart-label">CURRENT ORDER</span>
          <span className="cart-total-amount">₹{totalAmount}</span>
        </div>
      </div>
    </header>
  );
}
