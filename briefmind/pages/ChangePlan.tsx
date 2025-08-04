'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import Link from 'next/link';

const stripePromise = loadStripe('pk_test_tu_clave_publica_de_stripe');

const plans = [
  { name: 'Basic', price: 10, briefs: 3 },
  { name: 'Premium', price: 80, briefs: 30 },
  { name: 'Pro', price: 30, briefs: 10 },
];

export default function ChangePlan() {
  const [userPlan, setUserPlan] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('user_id');

    if (!token || !userId) {
      setIsAuthenticated(false);
      return;
    }

    setIsAuthenticated(true);

    fetch(`http://localhost:5000/api/users/${userId}/info-plan`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setUserPlan(data.subscription_plan);
      })
      .catch(() => {
        setIsAuthenticated(false);
      });
  }, []);

  const handleChangePlan = async () => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('user_id');

    if (!selectedPlan || !token || !userId) {
      alert('Selecciona un plan válido.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/users/${userId}/plan/checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan: selectedPlan }),
      });

      const data = await res.json();
      if (!res.ok || !data.checkoutUrl) throw new Error(data.error || 'Error al crear la sesión');

      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe no se cargó');

      window.location.href = data.checkoutUrl;
    } catch (err: any) {
      alert('Error: ' + err.message);
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
      <nav className="w-full bg-[#1E293B] px-6 py-4 flex justify-between items-center border-b border-cyan-600">
        <div className="text-cyan-400 font-bold text-xl">BriefMind</div>
        <div className="flex gap-6 text-sm md:text-base items-center">
          <Link href="/Index" className="hover:text-cyan-300 transition">Inicio</Link>
          <Link href="/BuyBrief" className="hover:text-cyan-300 transition">Comprar Briefs</Link>
          <Link href="/BriefForm" className="hover:text-cyan-300 transition">BriefForm</Link>
          <button onClick={handleLogout} className="text-red-400 hover:text-red-500 font-semibold transition">
            Cerrar sesión
          </button>
        </div>
      </nav>

      <section className="py-16 px-6 md:px-20 lg:px-40 flex items-center justify-center">
        <div className="max-w-3xl w-full bg-[#1E293B] p-10 rounded-3xl shadow-2xl border border-cyan-500">
          <h1 className="text-4xl font-extrabold text-center mb-4 text-cyan-300">
            Cambiar Plan
          </h1>
          <p className="text-center mb-8 text-gray-300">
            Tu plan actual es: <span className="font-bold text-cyan-400">{userPlan}</span>
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {plans.map((plan) => (
              <div
                key={plan.name}
                onClick={() => setSelectedPlan(plan.name.toLowerCase())}
                className={`cursor-pointer p-6 rounded-xl border-2 transition-all duration-300 ${
                  selectedPlan === plan.name.toLowerCase()
                    ? 'border-cyan-400 bg-gray-800'
                    : 'border-gray-600 bg-gray-900 hover:border-cyan-700'
                }`}
              >
                <h2 className="text-2xl font-bold mb-2 text-cyan-300">{plan.name}</h2>
                <p className="text-gray-400 mb-1">Precio: ${plan.price} USD</p>
                <p className="text-gray-400">Briefs incluidos: {plan.briefs}</p>
              </div>
            ))}
          </div>

          <button
            onClick={handleChangePlan}
            disabled={loading || !selectedPlan}
            className="w-full bg-cyan-500 hover:bg-cyan-600 text-gray-900 px-6 py-3 rounded-lg text-lg font-bold disabled:opacity-50 transition-all shadow-lg"
          >
            {loading ? 'Redirigiendo...' : `Cambiar a ${selectedPlan || '...'} plan`}
          </button>
        </div>
      </section>
    </main>
  );
}
