import React from 'react';
import { useOrder } from '../context/OrderContext';
import { Mic, Sparkles, Volume2 } from 'lucide-react';

export default function StartKioskModal() {
  const { isKioskStarted, startKiosk } = useOrder();

  if (isKioskStarted) return null;

  return (
    <div className="kiosk-welcome-overlay" onClick={startKiosk}>
      <div className="welcome-card">
        <div className="welcome-icon-bubble">
          <img src="/images/logo.png" alt="Chaya Kada Logo" className="welcome-logo-img" />
        </div>
        
        <div className="welcome-titles">
          <span className="welcome-pretitle">WELCOME TO</span>
          <h1 className="welcome-main-title">CHAYA KADA</h1>
          <p className="welcome-subtitle">Kerala Tea Shop & Snacks Kiosk</p>
        </div>

        <div className="welcome-features">
          <div className="feature-badge">
            <Mic className="feature-icon" size={20} />
            <span>100% Touchless Voice Ordering</span>
          </div>
          <div className="feature-badge">
            <Volume2 className="feature-icon" size={20} />
            <span>Interactive Voice Assistant</span>
          </div>
          <div className="feature-badge">
            <Sparkles className="feature-icon" size={20} />
            <span>Fresh & Hot Kerala Delicacies</span>
          </div>
        </div>

        <button 
          type="button" 
          className="welcome-start-button"
          onClick={(e) => {
            e.stopPropagation();
            startKiosk();
          }}
        >
          <Mic size={24} className="mic-start-pulse" />
          <span>Touch Anywhere to Begin Voice Order</span>
        </button>

        <p className="welcome-tap-hint">
          Click or tap to activate microphone & voice assistant
        </p>
      </div>
    </div>
  );
}
