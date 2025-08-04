'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaCheckCircle, FaChevronRight } from 'react-icons/fa';
import Link from 'next/link';

type Plan = {
  name: string;
  price: string;
  briefsIncluded: number;
  pricePerExtraBrief: string;
  description: string;
};

const plans: Plan[] = [
  {
    name: 'Basic',
    price: '$10 / mes',
    briefsIncluded: 3,
    pricePerExtraBrief: '$7 USD',
    description: 'Ideal para freelancers principiantes.',
  },
  {
    name: 'Pro',
    price: '$30 USD / mes',
    briefsIncluded: 10,
    pricePerExtraBrief: '$5 USD',
    description: 'Para freelancers y consultores activos.',
  },
  {
    name: 'Premium',
    price: '$80 USD / mes',
    briefsIncluded: 30,
    pricePerExtraBrief: '$3 USD',
    description: 'Para microagencias o equipos pequeños.',
  },
];

const Loader = () => (
  <div className="flex justify-center items-center space-x-2">
    <div className="w-3 h-3 rounded-full bg-cyan-400 animate-bounce" />
    <div className="w-3 h-3 rounded-full bg-cyan-400 animate-bounce delay-200" />
    <div className="w-3 h-3 rounded-full bg-cyan-400 animate-bounce delay-400" />
  </div>
);

const PlanCard = ({
  plan,
  selected,
  onSelect,
}: {
  plan: Plan;
  selected: boolean;
  onSelect: () => void;
}) => (
  <button
    onClick={onSelect}
    aria-pressed={selected}
    className={`group relative w-full p-6 rounded-xl shadow-lg transition border-2 duration-200
      ${
        selected
          ? 'border-cyan-500 bg-cyan-900 shadow-cyan-500/40'
          : 'border-slate-700 bg-slate-800 hover:border-cyan-400 hover:shadow-cyan-400/30'
      } flex flex-col cursor-pointer`}
  >
    <h3 className="text-2xl font-bold mb-2 group-hover:text-cyan-300">{plan.name}</h3>
    <p className="text-cyan-300 font-semibold mb-1">{plan.price}</p>
    <p className="mb-2 text-white/80">Briefs incluidos: {plan.briefsIncluded}</p>
    <p className="text-sm text-gray-300 mb-3 flex-1">{plan.description}</p>
    <p className="text-sm text-gray-400">
      Precio briefs extra: <span className="font-semibold">{plan.pricePerExtraBrief}</span>
    </p>
    {selected && (
      <FaCheckCircle
        className="absolute top-4 right-4 text-cyan-400"
        size={24}
        aria-label="Plan seleccionado"
      />
    )}
  </button>
);

export default function Checkout() {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null); // null = cargando
  const [userBriefs, setUserBriefs] = useState(0);
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('user_id');
    const storedName = localStorage.getItem('user_name');

    if (storedName) setUserName(storedName);

    if (token && userId) {
      fetch(`http://localhost:5000/api/users/${userId}/info-plan`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => {
          if (!res.ok) throw new Error('No se pudo obtener el plan.');
          return res.json();
        })
        .then(data => {
          const briefsLeft = data.briefs_available - data.briefs_used;
          setUserBriefs(briefsLeft);
          setIsAuthenticated(true);
          if (briefsLeft > 0) router.push('/BriefForm');
        })
        .catch(err => {
          console.error(err);
          setIsAuthenticated(false);
        });
    } else {
      setIsAuthenticated(false);
    }
  }, [router]);

  const handlePlanSelection = async () => {
    if (!selectedPlan) return;

    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('user_id');

    if (!token || !userId) {
      alert('No se pudo validar tu sesión. Vuelve a iniciar sesión.');
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
        body: JSON.stringify({ plan: selectedPlan.name }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
      }

      const data = await res.json();
      window.location.href = data.checkoutUrl;
    } catch (error: any) {
      console.error(error);
      alert('Error al iniciar el pago: ' + error.message);
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push('/Index');
  };

  if (isAuthenticated === null) {
    return (
      <main className="min-h-screen bg-[#0F172A] text-white flex items-center justify-center">
        <Loader />
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#0F172A] text-white flex items-center justify-center text-center p-8">
        <div>
          <h2 className="text-2xl font-bold mb-4">No estás autenticado</h2>
          <Link
            href="/LoginRegister"
            className="text-cyan-400 underline hover:text-cyan-300"
          >
            Ir a iniciar sesión
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0F172A] text-white font-sans pb-16">
      {/* NAVBAR */}
      <nav className="w-full bg-[#1E293B] px-6 py-4 flex justify-between items-center border-b border-cyan-600">
        <div className="text-cyan-400 font-extrabold text-xl">BriefMind</div>
        <div className="flex gap-4 text-sm md:text-base items-center">
          <Link href="/Index" className="hover:text-cyan-300 transition">
            Inicio
          </Link>
          <Link href="/Checkout" className="hover:text-cyan-300 transition">
            Checkout
          </Link>
          <Link href="/BriefForm" className="hover:text-cyan-300 transition">
            BriefForm
          </Link>
          <button
            onClick={handleLogout}
            className="text-red-400 hover:text-red-500 font-semibold transition"
          >
            Cerrar sesión
          </button>
        </div>
      </nav>

      <div className="px-6 md:px-20 lg:px-40 py-12 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 animate-fadeIn">
          {userName ? `¡Bienvenido, ${userName}!` : '¡Hola! Comienza a crear tu brief'}
        </h1>
        <h2 className="text-3xl font-bold mb-10">Elige tu plan</h2>

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
          {plans.map(plan => (
            <PlanCard
              key={plan.name}
              plan={plan}
              selected={selectedPlan?.name === plan.name}
              onSelect={() => setSelectedPlan(plan)}
            />
          ))}
        </section>

        {selectedPlan && (
          <section className="max-w-md mx-auto bg-[#1e2a47] rounded-xl p-6 mb-8 shadow-lg border border-cyan-600">
            <h3 className="text-2xl font-bold mb-3 flex items-center justify-between">
              Resumen del plan
              <FaChevronRight className="text-cyan-400" />
            </h3>
            <p>
              <strong>Plan:</strong> {selectedPlan.name}
            </p>
            <p>
              <strong>Precio:</strong> {selectedPlan.price}
            </p>
            <p>
              <strong>Briefs incluidos:</strong> {selectedPlan.briefsIncluded}
            </p>
            <p>
              <strong>Precio por briefs extra:</strong> {selectedPlan.pricePerExtraBrief}
            </p>
          </section>
        )}

        <button
          disabled={!selectedPlan || loading}
          onClick={() => setShowConfirm(true)}
          className="bg-cyan-500 hover:bg-cyan-600 text-gray-900 px-10 py-3 rounded-xl text-lg font-semibold disabled:opacity-50 transition"
        >
          {loading ? <Loader /> : 'Seleccionar Plan'}
        </button>
      </div>

      {showConfirm && selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center p-4 z-50">
          <div className="bg-[#15233c] rounded-lg p-6 max-w-md w-full text-white shadow-lg">
            <h4 className="text-2xl font-bold mb-4">Confirmar selección</h4>
            <p className="mb-6">
              ¿Seguro que quieres seleccionar el plan <strong>{selectedPlan.name}</strong>?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handlePlanSelection}
                className="px-4 py-2 rounded bg-cyan-500 hover:bg-cyan-600 text-gray-900 font-semibold transition"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
