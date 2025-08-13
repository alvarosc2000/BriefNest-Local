import React from 'react';
import { useNavigate } from 'react-router-dom';

const CheckoutCancel = () => {
  const navigate = useNavigate();

  const handleRetry = () => {
    navigate('/');  // O la ruta donde tengas tus planes/precios
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center p-4">
      <h1 className="text-4xl font-bold mb-4 text-red-500">¡Pago Cancelado! ❌</h1>
      <p className="text-lg mb-6">Parece que cancelaste el pago. Si fue un error, puedes intentarlo de nuevo.</p>
      <button
        onClick={handleRetry}
        className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl shadow-md transition"
      >
        Volver a Intentar
      </button>
    </div>
  );
};

export default CheckoutCancel;
