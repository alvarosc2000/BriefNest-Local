'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaCheckCircle, FaSignOutAlt } from 'react-icons/fa';
import Link from 'next/link';
import { loadStripe } from '@stripe/stripe-js';

const Loader = () => (
  <div className="flex justify-center items-center space-x-2">
    <div className="w-3 h-3 rounded-full bg-cyan-400 animate-bounce animation-delay-0" />
    <div className="w-3 h-3 rounded-full bg-cyan-400 animate-bounce animation-delay-200" />
    <div className="w-3 h-3 rounded-full bg-cyan-400 animate-bounce animation-delay-400" />
  </div>
);

const stripePromise = loadStripe('pk_test_51Rt8hjBRmozeY5V28OlghjWReZVDJtSP2TfpIym9bOjucj4IXVSFBhd6SpHzkGl9tHLdCkkXO4TiwoYbbAELwHoQ00AaxTd3Ew');

export default function BuyBrief() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [briefsAvailable, setBriefsAvailable] = useState(0);
  const [briefsUsed, setBriefsUsed] = useState(0);
  const [pricePerBrief, setPricePerBrief] = useState(0);
  const [userPlan, setUserPlan] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [success, setSuccess] = useState(false);

  const router = useRouter();

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
      headers: {
        Authorization: `Bearer ${token}`,
      },
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
      .catch(() => {
        setIsAuthenticated(false);
      });
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
        body: JSON.stringify({
          quantity,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.sessionId) {
        throw new Error(data.message || 'Error al crear sesión de pago.');
      }

      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe no se cargó correctamente.');

      await stripe.redirectToCheckout({ sessionId: data.sessionId });
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
      <main className="min-h-screen bg-[#0F172A] text-white flex items-center justify-center">
        <h1 className="text-2xl font-semibold">Cargando usuario...</h1>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0F172A] to-[#1a1f36] text-white">
            {/* Navbar */}
      <nav className="w-full flex justify-between items-center px-8 py-4 bg-[#111827] border-b border-gray-700">
        <div className="text-2xl font-bold text-blue-400 cursor-pointer" onClick={() => router.push('/Index')}>
          BriefMind
        </div>
        <div className="flex gap-6 items-center">
          <Link href="/" className="hover:text-blue-300 text-sm">Inicio</Link>
          <Link href="/BriefForm" className="hover:text-blue-300 text-sm">Crear Brief</Link>
          <button onClick={handleLogout} className="flex items-center gap-2 text-red-400 hover:text-red-500 text-sm">
            <FaSignOutAlt /> Cerrar sesión
          </button>
        </div>
      </nav>


      <section className="py-16 px-6 md:px-20 lg:px-40 flex items-center justify-center">
        <div className="max-w-2xl w-full bg-[#1E293B] p-10 rounded-3xl shadow-2xl border border-cyan-500 transition-all duration-300">
          <h1 className="text-4xl font-extrabold text-center mb-4 text-cyan-300">
            {userName ? `Hola, ${userName}` : 'Compra de Briefs'}
          </h1>

          <h2 className="text-lg text-center mb-8 text-gray-300">
            Plan actual: <span className="font-bold text-cyan-400">{userPlan}</span>
          </h2>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-gray-800 p-5 rounded-xl text-center border border-cyan-700">
              <p className="text-sm text-gray-400">Briefs disponibles</p>
              <p className="text-3xl font-bold text-green-400">
                {briefsAvailable - briefsUsed}
              </p>
            </div>
            <div className="bg-gray-800 p-5 rounded-xl text-center border border-gray-600">
              <p className="text-sm text-gray-400">Briefs usados</p>
              <p className="text-3xl font-bold text-yellow-400">{briefsUsed}</p>
            </div>
          </div>

          <div className="mb-6">
            <label className="block mb-3 text-lg font-medium text-white">
              Cantidad de briefs a comprar:
            </label>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-md text-xl"
              >
                −
              </button>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) =>
                  setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                }
                className="w-20 text-center px-3 py-2 text-lg rounded-md bg-gray-900 text-white border border-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <button
                onClick={() => setQuantity(q => q + 1)}
                className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-md text-xl"
              >
                +
              </button>
            </div>

            <p className="mt-4 text-md text-cyan-300">
              Total a pagar:{' '}
              <span className="font-bold text-green-400">
                ${(quantity * pricePerBrief).toFixed(2)} USD
              </span>
            </p>
          </div>

          <button
            onClick={handleBuyBrief}
            disabled={loading}
            className="w-full bg-cyan-500 hover:bg-cyan-600 text-gray-900 px-6 py-3 rounded-lg text-lg font-bold disabled:opacity-50 transition-all shadow-lg"
          >
            {loading ? <Loader /> : `Comprar ${quantity} brief(s)`}
          </button>

          {success && (
            <div className="mt-6 text-green-400 font-semibold flex items-center gap-2 justify-center">
              <FaCheckCircle className="text-green-400" />
              ¡Compra realizada con éxito!
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
