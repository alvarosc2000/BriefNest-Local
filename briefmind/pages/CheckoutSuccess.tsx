import React from 'react';
import { useNavigate } from 'react-router-dom';

const CheckoutSuccess = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center p-4">
      <h1 className="text-4xl font-bold mb-4">¡Pago Exitoso! 🎉</h1>
      <p className="text-lg mb-6">Gracias por tu compra. Tu cuenta se ha actualizado correctamente.</p>
      <button
        onClick={handleGoHome}
        className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl shadow-md transition"
      >
        Ir al Inicio
      </button>
    </div>
  );
};

export default CheckoutSuccess;
