import React from 'react';
import { OrderProvider, useOrder } from './context/OrderContext';
import Header from './components/Header';
import MenuLayout from './components/MenuLayout';
import OrderReview from './components/OrderReview';
import Checkout from './components/Checkout';
import OrderConfirmation from './components/OrderConfirmation';
import VoiceAssistantBar from './components/VoiceAssistantBar';
import StartKioskModal from './components/StartKioskModal';
import MicrophonePermissionModal from './components/MicrophonePermissionModal';
import './App.css';

function KioskContent() {
  const { screen } = useOrder();

  return (
    <div className="kiosk-app-container">
      <Header />

      <div className="kiosk-body-viewport">
        {screen === 'menu' && <MenuLayout />}
        {screen === 'review' && <OrderReview />}
        {screen === 'checkout' && <Checkout />}
        {screen === 'confirmation' && <OrderConfirmation />}
      </div>

      <VoiceAssistantBar />
      <StartKioskModal />
      <MicrophonePermissionModal />
    </div>
  );
}

export default function App() {
  return (
    <OrderProvider>
      <KioskContent />
    </OrderProvider>
  );
}
