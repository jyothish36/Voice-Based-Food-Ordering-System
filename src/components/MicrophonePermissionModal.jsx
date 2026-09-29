import React from 'react';
import { useOrder } from '../context/OrderContext';
import { MicOff, AlertCircle, RefreshCw } from 'lucide-react';
import { speechRecognizer } from '../services/speechRecognizer';

export default function MicrophonePermissionModal() {
  const { micPermissionDenied, setMicPermissionDenied } = useOrder();

  if (!micPermissionDenied) return null;

  const handleRetry = () => {
    setMicPermissionDenied(false);
    speechRecognizer.start();
  };

  return (
    <div className="mic-denied-overlay">
      <div className="mic-denied-card">
        <div className="mic-denied-icon-wrap">
          <MicOff size={48} className="mic-denied-icon" />
        </div>
        <h3 className="mic-denied-title">Microphone Access Required</h3>
        <p className="mic-denied-text">
          To provide a completely hands-free voice ordering experience, please allow microphone access in your browser's address bar.
        </p>
        <p className="mic-denied-subtext">
          Alternatively, you can touch the screen or use the quick voice chips at the bottom to test every voice action!
        </p>

        <div className="mic-denied-actions">
          <button 
            type="button" 
            className="mic-retry-btn"
            onClick={handleRetry}
          >
            <RefreshCw size={18} />
            <span>Try Enabling Again</span>
          </button>
          <button 
            type="button" 
            className="mic-dismiss-btn"
            onClick={() => setMicPermissionDenied(false)}
          >
            Continue with Visual Controls
          </button>
        </div>
      </div>
    </div>
  );
}
