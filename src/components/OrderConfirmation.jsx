import React, { useState } from 'react';
import { useOrder } from '../context/OrderContext';
import { CheckCircle2, Clock, Hash, Utensils, RotateCcw, Sparkles, Printer } from 'lucide-react';

export default function OrderConfirmation() {
  const { orderNumber, totalAmount, resetOrder, cart } = useOrder();

  const [orderTimestamp] = useState(() => {
    const d = new Date();
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const strHours = String(hours).padStart(2, '0');

    return {
      date: `${day}/${month}/${year}`,
      time: `${strHours}:${minutes} ${ampm}`
    };
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="kiosk-confirmation-view">
      <div className="confirmation-card-container">
        <div className="confirmation-success-badge">
          <CheckCircle2 size={72} className="success-icon-bounce" />
        </div>

        <h2 className="confirmation-title">ORDER CONFIRMED</h2>
        <p className="confirmation-subtitle">Your delicious Kerala delicacies are being prepared fresh!</p>

        <div className="confirmation-details-card">
          <div className="confirmation-detail-row order-number-highlight">
            <div className="detail-meta">
              <Hash size={24} className="meta-icon" />
              <span className="meta-label">Token / Order Number</span>
            </div>
            <span className="order-number-val">#{orderNumber}</span>
          </div>

          <div className="confirmation-detail-row">
            <div className="detail-meta">
              <Clock size={24} className="meta-icon" />
              <span className="meta-label">Estimated Preparation Time</span>
            </div>
            <span className="prep-time-val">10 minutes</span>
          </div>

          <div className="confirmation-detail-row">
            <div className="detail-meta">
              <Utensils size={24} className="meta-icon" />
              <span className="meta-label">Order Total Paid</span>
            </div>
            <span className="paid-amount-val">₹{totalAmount}</span>
          </div>
        </div>

        <div className="confirmation-items-summary">
          <span className="summary-title">Ordered Items:</span>
          <div className="summary-tags-list">
            {cart.map(e => (
              <span key={e.item.id} className="summary-item-tag">
                {e.item.shortName || e.item.name} × {e.quantity}
              </span>
            ))}
          </div>
        </div>

        <div className="confirmation-action-box">
          <div className="confirmation-voice-tip">
            <Sparkles size={18} />
            <span>Say <strong>"Start a new order"</strong> or <strong>"New order"</strong> anytime!</span>
          </div>

          <div className="confirmation-buttons-group">
            <button 
              type="button" 
              className="print-bill-btn" 
              id="print-bill-btn"
              onClick={handlePrint}
            >
              <Printer size={20} />
              <span>Print Bill</span>
            </button>

            <button 
              type="button" 
              className="start-new-order-btn" 
              onClick={resetOrder}
            >
              <RotateCcw size={20} />
              <span>Start a New Order</span>
            </button>
          </div>
        </div>
      </div>

      {/* 58mm Thermal Receipt Layout (Optimized for 58mm Thermal Receipt Printers) */}
      <div className="thermal-receipt-wrapper" aria-hidden="true">
        <div className="thermal-receipt">
          {/* Chaya Kada name at the top, centered */}
          <div className="receipt-header">
            <h1 className="receipt-store-title">CHAYA KADA</h1>
            <p className="receipt-tagline">Authentic Kerala Delicacies</p>
            <p className="receipt-kiosk-tag">KIOSK #03</p>
          </div>

          <div className="receipt-divider-line" />

          {/* Order number & Date and time */}
          <div className="receipt-meta-box">
            <div className="receipt-meta-row">
              <span className="receipt-meta-key">ORDER #:</span>
              <span className="receipt-meta-val order-num-bold">#{orderNumber}</span>
            </div>
            <div className="receipt-meta-row">
              <span className="receipt-meta-key">DATE:</span>
              <span className="receipt-meta-val">{orderTimestamp.date}</span>
            </div>
            <div className="receipt-meta-row">
              <span className="receipt-meta-key">TIME:</span>
              <span className="receipt-meta-val">{orderTimestamp.time}</span>
            </div>
          </div>

          <div className="receipt-divider-line" />

          {/* Items in the confirmed order: Quantity, Unit price, Item total */}
          <table className="receipt-items-table">
            <thead>
              <tr className="receipt-table-head">
                <th className="th-item">ITEM</th>
                <th className="th-qty">QTY</th>
                <th className="th-price">PRICE</th>
                <th className="th-total">TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {cart.map((entry) => {
                const itemTotal = entry.quantity * entry.item.price;
                return (
                  <tr key={entry.item.id} className="receipt-item-row">
                    <td className="td-item">{entry.item.shortName || entry.item.name}</td>
                    <td className="td-qty">{entry.quantity}</td>
                    <td className="td-price">₹{entry.item.price}</td>
                    <td className="td-total">₹{itemTotal}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="receipt-divider-line" />

          {/* Grand total */}
          <div className="receipt-totals-box">
            <div className="receipt-total-line">
              <span>TOTAL ITEMS:</span>
              <span>{cart.reduce((sum, entry) => sum + entry.quantity, 0)}</span>
            </div>
            <div className="receipt-grand-total-line">
              <span>GRAND TOTAL:</span>
              <span>₹{totalAmount}</span>
            </div>
          </div>

          <div className="receipt-divider-line" />

          {/* “Thank You” message at the bottom */}
          <div className="receipt-footer">
            <p className="receipt-thank-msg">THANK YOU! VISIT AGAIN</p>
            <p className="receipt-thank-mal">നന്ദി! വീണ്ടും സന്ദർശിക്കുക</p>
            <p className="receipt-footer-sub">Kerala Traditional Tea Shop</p>
            <div className="receipt-cut-margin" />
          </div>
        </div>
      </div>
    </div>
  );
}

