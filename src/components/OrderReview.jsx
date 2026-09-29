import React from 'react';
import { useOrder } from '../context/OrderContext';
import { Check, ArrowLeft, ShieldCheck, Sparkles } from 'lucide-react';

export default function OrderReview() {
  const { cart, totalAmount, setScreen, speak } = useOrder();

  const handleConfirm = () => {
    setScreen('checkout');
    speak("Please complete your payment.");
  };

  const handleBackToMenu = () => {
    setScreen('menu');
    speak("No problem. What would you like to change?");
  };

  return (
    <div className="kiosk-review-view">
      <div className="review-card-container">
        <div className="review-header">
          <button 
            type="button" 
            className="review-back-btn" 
            onClick={handleBackToMenu}
          >
            <ArrowLeft size={20} />
            <span>Back to Menu</span>
          </button>
          <div className="review-header-title">
            <h2 className="review-title">ORDER SUMMARY</h2>
            <p className="review-subtitle">Please review your selected Kerala delicacies</p>
          </div>
        </div>

        <div className="review-items-table-wrap">
          <table className="review-table">
            <thead>
              <tr>
                <th>Item</th>
                <th className="text-center">Qty</th>
                <th className="text-right">Unit Price</th>
                <th className="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {cart.map(({ item, quantity }) => (
                <tr key={item.id} className="review-row">
                  <td className="review-item-cell">
                    <img src={item.image} alt={item.name} className="review-item-img" />
                    <div>
                      <strong className="review-item-name">{item.name}</strong>
                      <span className="review-item-unit">({item.unit})</span>
                    </div>
                  </td>
                  <td className="text-center review-qty-cell">
                    <span className="review-qty-badge">{quantity}</span>
                  </td>
                  <td className="text-right review-price-cell">₹{item.price}</td>
                  <td className="text-right review-subtotal-cell">₹{item.price * quantity}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="review-total-row">
                <td colSpan="3" className="review-total-label">Grand Total</td>
                <td className="text-right review-grand-total">₹{totalAmount}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="review-voice-action-box">
          <div className="voice-prompt-highlight">
            <Sparkles className="sparkle-icon" size={20} />
            <p className="voice-prompt-text">
              Say <strong>"Yes"</strong> or <strong>"Confirm"</strong> to place order, or <strong>"No"</strong> to change items.
            </p>
          </div>

          <div className="review-touch-buttons">
            <button 
              type="button" 
              className="review-cancel-btn" 
              onClick={handleBackToMenu}
            >
              No, Change Order
            </button>
            <button 
              type="button" 
              className="review-confirm-btn" 
              onClick={handleConfirm}
            >
              <Check size={20} />
              <span>Yes, Confirm & Pay</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
