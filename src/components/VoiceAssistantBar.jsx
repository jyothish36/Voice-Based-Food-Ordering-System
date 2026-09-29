import React, { useState } from 'react';
import { useOrder } from '../context/OrderContext';
import { speechRecognizer } from '../services/speechRecognizer';
import { Mic, MicOff, Volume2, Cpu, CheckCircle2, HelpCircle, Terminal } from 'lucide-react';

export default function VoiceAssistantBar() {
  const { voiceState, micPermissionDenied, handleVoiceCommand, screen } = useOrder();
  const [showSimInput, setShowSimInput] = useState(false);
  const [manualText, setManualText] = useState('');

  // Status mapping
  const getStatusDisplay = () => {
    switch (voiceState) {
      case 'LISTENING':
        return {
          icon: <Mic className="state-icon listening-pulse" size={24} />,
          title: 'Listening...',
          description: 'Speak your order naturally',
          statusClass: 'state-listening'
        };
      case 'PROCESSING':
        return {
          icon: <Cpu className="state-icon processing-spin" size={24} />,
          title: 'Understanding...',
          description: 'Processing your voice command',
          statusClass: 'state-processing'
        };
      case 'SPEAKING':
        return {
          icon: <Volume2 className="state-icon speaking-bounce" size={24} />,
          title: 'Speaking...',
          description: 'Kerala Kiosk AI assistant speaking',
          statusClass: 'state-speaking'
        };
      case 'WAITING_FOR_CONFIRMATION':
        return {
          icon: <HelpCircle className="state-icon waiting-pulse" size={24} />,
          title: 'Waiting for Confirmation...',
          description: 'Say "Yes" to confirm or "No" to change',
          statusClass: 'state-waiting'
        };
      case 'CHECKOUT':
        return {
          icon: <Mic className="state-icon listening-pulse" size={24} />,
          title: 'Listening for Payment Method...',
          description: 'Say "UPI", "Card", or "Cash"',
          statusClass: 'state-checkout'
        };
      case 'COMPLETED':
        return {
          icon: <CheckCircle2 className="state-icon completed-glow" size={24} />,
          title: 'Order Confirmed',
          description: 'Say "Start a new order" to order again',
          statusClass: 'state-completed'
        };
      case 'IDLE':
      default:
        return {
          icon: <Mic className="state-icon idle-icon" size={24} />,
          title: 'Ready',
          description: 'Microphone active • Touchless Ordering Ready',
          statusClass: 'state-idle'
        };
    }
  };

  const status = getStatusDisplay();

  const handleSimSubmit = (e) => {
    e.preventDefault();
    if (manualText.trim()) {
      speechRecognizer.simulateInput(manualText.trim());
      setManualText('');
    }
  };

  const sampleCommands = screen === 'review'
    ? ['Yes', 'Confirm', 'No, change something']
    : screen === 'checkout'
    ? ['Pay with UPI', 'Card', 'Cash']
    : screen === 'confirmation'
    ? ['Start a new order']
    : [
        'I want two pazham pori',
        'Add one ulli vada',
        'Show drinks',
        'Give me two teas',
        'Remove the tea',
        "What's in my cart?",
        "That's all"
      ];

  return (
    <div className={`voice-assistant-bar ${status.statusClass}`}>
      <div className="voice-bar-main">
        {/* Visual Waveform and State Icon */}
        <div className="voice-mic-container">
          <div className="voice-halo-ring"></div>
          {status.icon}
        </div>

        <div className="voice-info-col">
          <div className="voice-status-title-row">
            <span className="voice-status-title">{status.title}</span>
            {micPermissionDenied && (
              <span className="voice-mic-warning">
                <MicOff size={14} /> Mic permission needed
              </span>
            )}
          </div>
          <span className="voice-status-subtitle">{status.description}</span>
        </div>

        {/* Animated Audio Equalizer / Waveform */}
        <div className={`voice-waveform ${voiceState === 'LISTENING' || voiceState === 'SPEAKING' ? 'active' : ''}`}>
          <span className="wave-bar bar-1"></span>
          <span className="wave-bar bar-2"></span>
          <span className="wave-bar bar-3"></span>
          <span className="wave-bar bar-4"></span>
          <span className="wave-bar bar-5"></span>
          <span className="wave-bar bar-6"></span>
          <span className="wave-bar bar-7"></span>
        </div>

        {/* Quick Voice Command Suggestion Chips */}
        <div className="voice-suggestions-row">
          <span className="suggestions-label">Try saying:</span>
          <div className="suggestions-scroll">
            {sampleCommands.map((cmd, idx) => (
              <button
                key={idx}
                type="button"
                className="voice-quick-chip"
                onClick={() => speechRecognizer.simulateInput(cmd)}
                title={`Click to simulate: "${cmd}"`}
              >
                "{cmd}"
              </button>
            ))}
          </div>
        </div>

        {/* Dev / Silent Testing Toggle */}
        <button
          type="button"
          className="voice-sim-toggle"
          onClick={() => setShowSimInput(!showSimInput)}
          title="Manual voice testing input"
        >
          <Terminal size={16} />
        </button>
      </div>

      {/* Manual Speech Test Drawer */}
      {showSimInput && (
        <form onSubmit={handleSimSubmit} className="voice-sim-drawer">
          <input
            type="text"
            className="sim-input-field"
            placeholder='Type any voice phrase e.g. "I want two pazham pori" or "Show drinks"...'
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
          />
          <button type="submit" className="sim-submit-btn">
            Send Voice Input
          </button>
        </form>
      )}
    </div>
  );
}

