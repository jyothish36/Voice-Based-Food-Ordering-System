import React from 'react';
import { useOrder } from '../context/OrderContext';
import { QrCode, CreditCard, Banknote, Loader2, ArrowLeft } from 'lucide-react';

export default function Checkout() {
  const { 
    totalAmount, 
    selectedPayment, 
    setSelectedPayment, 
    isProcessingPayment, 
    processPayment, 
    setScreen, 
    speak 
  } = useOrder();

  const paymentMethods = [
    {
      id: 'UPI',
      name: 'Instant UPI / QR',
      subtitle: 'Scan with Google Pay, PhonePe, Paytm',
      icon: <QrCode size={36} />,
      badge: 'Fastest'
    },
    {
      id: 'Card',
      name: 'Credit / Debit Card',
      subtitle: 'Tap or insert card on terminal',
      icon: <CreditCard size={36} />,
      badge: 'Contactless'
    },
    {
      id: 'Cash',
      name: 'Cash at Counter',
      subtitle: 'Pay cash to the barista when collecting',
      icon: <Banknote size={36} />,
      badge: 'Traditional'
    }
  ];

  const handleSelectMethod = (id) => {
    setSelectedPayment(id);
    speak(`Selected ${id}. Tap complete payment or say Complete payment.`);
  };

  return (
    <div className="kiosk-checkout-view">
      <div className="checkout-card-container">
        <div className="checkout-header">
          <button 
            type="button" 
            className="checkout-back-btn" 
            onClick={() => {
              setScreen('review');
              speak("Returned to order review.");
            }}
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
          <div className="checkout-header-title">
            <h2 className="checkout-title">SELECT PAYMENT METHOD</h2>
            <p className="checkout-subtitle">Say "UPI", "Card", or "Cash" to choose</p>
          </div>
        </div>

        <div className="checkout-amount-banner">
          <span className="checkout-amount-label">TOTAL AMOUNT DUE</span>
          <span className="checkout-amount-val">₹{totalAmount}</span>
        </div>

        <div className="payment-options-grid">
          {paymentMethods.map(m => {
            const isSelected = selectedPayment === m.id;
            return (
              <div
                key={m.id}
                className={`payment-method-card ${isSelected ? 'selected' : ''}`}
                onClick={() => handleSelectMethod(m.id)}
              >
                <div className="payment-method-badge">{m.badge}</div>
                <div className="payment-method-icon-wrap">{m.icon}</div>
                <h3 className="payment-method-name">{m.name}</h3>
                <p className="payment-method-sub">{m.subtitle}</p>
                <div className="payment-method-radio">
                  <div className={`radio-indicator ${isSelected ? 'checked' : ''}`}></div>
                  <span>{isSelected ? 'Selected' : 'Select'}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected method dynamic interactive preview */}
        <div className="payment-preview-box">
          {selectedPayment === 'UPI' && (
            <div className="upi-preview-content">
              <div className="qr-box">
                {/* SVG Mock QR Code */}
                <svg viewBox="0 0 100 100" width="120" height="120" className="qr-svg">
                  <rect width="100" height="100" fill="#ffffff" />
                  <rect x="10" y="10" width="25" height="25" fill="#1e293b" />
                  <rect x="15" y="15" width="15" height="15" fill="#ffffff" />
                  <rect x="65" y="10" width="25" height="25" fill="#1e293b" />
                  <rect x="70" y="15" width="15" height="15" fill="#ffffff" />
                  <rect x="10" y="65" width="25" height="25" fill="#1e293b" />
                  <rect x="15" y="70" width="15" height="15" fill="#ffffff" />
                  <rect x="42" y="15" width="15" height="15" fill="#1e293b" />
                  <rect x="42" y="42" width="15" height="15" fill="#1e293b" />
                  <rect x="15" y="42" width="15" height="15" fill="#1e293b" />
                  <rect x="65" y="42" width="20" height="15" fill="#1e293b" />
                  <rect x="42" y="65" width="20" height="25" fill="#1e293b" />
                  <rect x="70" y="70" width="15" height="15" fill="#1e293b" />
                </svg>
              </div>
              <div className="upi-details">
                <span className="upi-id-badge">chayakada@okaxis</span>
                <p className="upi-desc">Scan QR code using any UPI app to pay ₹{totalAmount}</p>
              </div>
            </div>
          )}

          {selectedPayment === 'Card' && (
            <div className="card-preview-content">
              <div className="card-chip-anim">
                <CreditCard size={48} className="terminal-card-icon" />
              </div>
              <p className="card-desc">Please tap your contactless card or insert into the side card reader</p>
            </div>
          )}

          {selectedPayment === 'Cash' && (
            <div className="cash-preview-content">
              <Banknote size={48} className="cash-icon" />
              <p className="cash-desc">A payment token will be printed. Hand ₹{totalAmount} to the cashier counter</p>
            </div>
          )}
        </div>

        <div className="checkout-action-zone">
          <button 
            type="button" 
            className="checkout-pay-btn"
            onClick={() => processPayment(selectedPayment)}
            disabled={isProcessingPayment}
          >
            {isProcessingPayment ? (
              <>
                <Loader2 className="animate-spin" size={24} />
                <span>Simulating Payment Verification...</span>
              </>
            ) : (
              <>
                <span>Complete Payment (₹{totalAmount})</span>
              </>
            )}
          </button>
          <div className="checkout-voice-hint">
            <span>Or say: <strong>"Complete payment"</strong> or <strong>"Pay now"</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}
