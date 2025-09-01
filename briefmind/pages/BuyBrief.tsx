'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaCheckCircle, FaSignOutAlt, FaPlus, FaMinus, FaGift, FaInfoCircle } from 'react-icons/fa';
import Link from 'next/link';

const Loader = () => (
  <div className="flex justify-center items-center space-x-2">
    <div className="w-3 h-3 rounded-full bg-cyan-400 animate-bounce animation-delay-0" />
    <div className="w-3 h-3 rounded-full bg-cyan-400 animate-bounce animation-delay-200" />
    <div className="w-3 h-3 rounded-full bg-cyan-400 animate-bounce animation-delay-400" />
  </div>
);

export default function BuyBrief() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [briefsAvailable, setBriefsAvailable] = useState(0);
  const [briefsUsed, setBriefsUsed] = useState(0);
  const [pricePerBrief, setPricePerBrief] = useState(0);
  const [userPlan, setUserPlan] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [success, setSuccess] = useState(false);

  const router = useRouter();

  // Cargar info del usuario
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('user_id');
    const storedName = localStorage.getItem('user_name');

    if (!token || !userId) {
      setIsAuthenticated(false);
      return;
    }

    setIsAuthenticated(true);
    if (storedName) setUserName(storedName);

    fetch(`http://localhost:5000/api/users/${userId}/info-plan`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('No autorizado');
        return res.json();
      })
      .then((data) => {
        setBriefsAvailable(data.briefs_available);
        setBriefsUsed(data.briefs_used);
        setPricePerBrief(data.price_per_extra_brief);
        setUserPlan(data.subscription_plan);
      })
      .catch(() => setIsAuthenticated(false));
  }, []);

  const handleBuyBrief = async () => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('user_id');

    if (!token || !userId) {
      alert('Sesión inválida. Inicia sesión nuevamente.');
      setIsAuthenticated(false);
      return;
    }

    setLoading(true);
    setSuccess(false);

    try {
      const res = await fetch(`http://localhost:5000/api/users/${userId}/briefs/checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity }),
      });

      const data = await res.json();
      if (!res.ok || !data.checkoutUrl) throw new Error(data.message || 'Error al crear sesión de pago.');

      // Redirige seguro a Stripe Checkout
      window.location.href = data.checkoutUrl;

    } catch (error: any) {
      alert('No se pudo iniciar el pago: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push('/LoginRegister');
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-[#0F172A] to-[#1a1f36] text-white flex items-center justify-center animate-fade-in">
        <h1 className="text-3xl font-semibold">Cargando usuario...</h1>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0F172A] to-[#1a1f36] text-white font-sans">
      {/* Navbar */}
      <nav className="w-full flex justify-between items-center px-8 py-4 bg-[#111827]/90 backdrop-blur-md border-b border-gray-700 shadow-lg">
        <div className="text-2xl font-extrabold text-blue-400 cursor-pointer hover:text-blue-300 transition" >
          BriefNest
        </div>
        <div className="flex gap-6 items-center text-lg">
             <Link href="/" className="hover:text-cyan-300 transition">Inicio</Link>
              <Link href="/BuyBrief" className="hover:text-cyan-300 transition">Comprar</Link>
              <Link href="/BriefForm" className="hover:text-cyan-300 transition">Brief</Link>
              <Link href="/Checkout" className="hover:text-cyan-300 transition">Suscripción</Link>              
              <button onClick={handleLogout} className="flex items-center gap-2 text-red-400 hover:text-red-500 transition">
                <FaSignOutAlt /> Cerrar sesión
              </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-6 md:px-20 lg:px-40 flex flex-col items-center">
        <div className="max-w-3xl w-full bg-gradient-to-tr from-[#1E293B]/90 to-[#111827]/90 backdrop-blur-2xl p-12 rounded-3xl shadow-2xl border border-cyan-500 animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-4 text-cyan-400 animate-pulse">
            {userName ? `Hola, ${userName}` : 'Compra de Briefs'}
          </h1>
          <p className="text-center text-gray-300 mb-10">
            Plan actual: <span className="font-bold text-cyan-300">{userPlan ?? 'Ninguno'}</span>
          </p>

          {/* Contador briefs */}
          <div className="flex justify-center gap-6 mb-10">
            <div className="relative w-72 bg-gradient-to-tr from-cyan-600/30 to-blue-500/30 p-6 rounded-2xl text-center border border-cyan-400 shadow-lg hover:scale-105 transition-transform overflow-hidden">
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-cyan-400/20 rounded-full animate-spin-slow"></div>
              <p className="text-sm text-gray-300 uppercase tracking-wide">Disponibles</p>
              <p className="text-4xl font-extrabold text-green-400">{briefsAvailable - briefsUsed}</p>
            </div>
          </div>

          {/* Selector de cantidad */}
          <div className="mb-8 flex flex-col items-center">
            <label className="block mb-3 text-lg font-medium text-white flex items-center justify-center gap-2">
              <FaInfoCircle className="text-cyan-300 animate-bounce" /> Cantidad de briefs a comprar
            </label>
            <div className="flex items-center justify-center gap-4 mb-4">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="bg-cyan-500 hover:bg-cyan-600 text-white px-5 py-3 rounded-full text-xl transition-shadow shadow-md hover:shadow-cyan-400"
              >
                <FaMinus />
              </button>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-24 text-center px-4 py-3 text-lg rounded-xl bg-gray-900 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
              <button
                onClick={() => setQuantity(q => q + 1)}
                className="bg-cyan-500 hover:bg-cyan-600 text-white px-5 py-3 rounded-full text-xl transition-shadow shadow-md hover:shadow-cyan-400"
              >
                <FaPlus />
              </button>
            </div>
            <p className="text-md text-cyan-300 text-center">
              Total aproximado: <span className="font-bold text-green-400">${(quantity * pricePerBrief).toFixed(2)} USD</span>
            </p>
          </div>

          {/* Botón de compra */}
          <button
            onClick={handleBuyBrief}
            disabled={loading || !userPlan}
            className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-blue-500 hover:to-cyan-400 text-gray-900 px-6 py-4 rounded-2xl text-lg font-bold disabled:opacity-50 shadow-xl hover:shadow-cyan-400 transition-all transform hover:scale-105"
          >
            {loading ? <Loader /> : userPlan ? `Comprar ${quantity} brief(s)` : 'Debes tener un plan activo'}
          </button>

          {/* Mensaje de éxito */}
          {success && (
            <div className="mt-6 text-green-400 font-semibold flex items-center gap-2 justify-center animate-fade-in">
              <FaCheckCircle /> ¡Compra realizada con éxito!
            </div>
          )}

          {/* Información extra */}
          <div className="mt-12 text-gray-400 text-sm text-center space-y-3">
            <p><FaGift className="inline mr-2 text-yellow-400" />Cada compra agrega briefs a tu plan automáticamente.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
