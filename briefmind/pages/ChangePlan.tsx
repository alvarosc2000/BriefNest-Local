'use client';

import React, { Component } from 'react';
import { FaCheck, FaCrown } from 'react-icons/fa';
import { withRouter } from 'next/router';
import Link from 'next/link';

type Plan = {
  name: 'Basic' | 'Pro' | 'Premium';
  price: number;
  briefs: number;
  extraPrice: number;
  features: string[];
  accent: string;
  popular?: boolean;
};

const plans: Plan[] = [
  {
    name: 'Basic',
    price: 10,
    briefs: 3,
    extraPrice: 7,
    features: ['Formulario inteligente de briefs', 'Exportación en PDF', 'Historial básico'],
    accent: 'from-cyan-500/20',
  },
  {
    name: 'Pro',
    price: 30,
    briefs: 10,
    extraPrice: 5,
    features: ['Todo lo de Basic', 'Plantillas reutilizables', 'Colaboración sencilla'],
    accent: 'from-blue-500/20',
    popular: true,
  },
  {
    name: 'Premium',
    price: 80,
    briefs: 30,
    extraPrice: 3,
    features: ['Todo lo de Pro', 'Espacios de equipo', 'Soporte prioritario'],
    accent: 'from-purple-500/20',
  },
];

interface BuyBriefState {
  userPlan: Plan['name'] | '';
  selectedPlan: Plan['name'] | '';
  isAuthenticated: boolean;
  loading: boolean;
  errorMsg: string | null;
}

class BuyBrief extends Component<any, BuyBriefState> {
  constructor(props: any) {
    super(props);
    this.state = {
      userPlan: '',
      selectedPlan: '',
      isAuthenticated: false,
      loading: false,
      errorMsg: null,
    };
  }

  componentDidMount() {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('user_id');

    if (!token || !userId) {
      this.setState({ isAuthenticated: false });
      return;
    }

    this.setState({ isAuthenticated: true });

    fetch(`http://localhost:5000/api/users/${userId}/info-plan`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('No autorizado');
        return res.json();
      })
      .then((data) => {
        const planName = (String(data.subscription_plan || '') as Plan['name']) || '';
        this.setState({ userPlan: planName });
      })
      .catch(() => this.setState({ isAuthenticated: false }));
  }

  handleSimulateBuyPlan = async () => {
    const { selectedPlan } = this.state;
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('user_id');

    if (!selectedPlan || !token || !userId) {
      this.setState({ errorMsg: 'Selecciona un plan válido.' });
      return;
    }

    this.setState({ loading: true, errorMsg: null });
    try {
      const res = await fetch(`http://localhost:5000/api/users/${userId}/simulate-buy-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ plan: selectedPlan }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al actualizar plan');

      this.setState({ userPlan: data.user.subscription_plan });
      alert(`Plan ${data.user.subscription_plan} comprado con éxito`);
    } catch (err: any) {
      this.setState({ errorMsg: err?.message || 'No se pudo actualizar el plan.' });
    } finally {
      this.setState({ loading: false });
    }
  };

  handleLogout = () => {
    localStorage.clear();
    this.props.router.push('/LoginRegister');
  };

  render() {
    const { isAuthenticated, userPlan, selectedPlan, loading, errorMsg } = this.state;

    if (!isAuthenticated) {
      return (
        <main className="min-h-screen bg-[#0F172A] text-white flex items-center justify-center">
          <h1 className="text-2xl font-semibold animate-pulse">Cargando usuario...</h1>
        </main>
      );
    }

    const selectedPlanObj = plans.find((p) => p.name.toLowerCase() === selectedPlan.toLowerCase());

    return (
      <main className="min-h-screen bg-gradient-to-br from-[#0F172A] via-[#111a2d] to-[#1a1f36] text-white">
        {/* Navbar */}
        <nav className="sticky top-0 z-50 w-full bg-[#0F172A]/80 backdrop-blur-md border-b border-white/10 px-6 py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <button
              onClick={() => this.props.router.push('/')}
              className="text-xl md:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent"
            >
              BriefNest
            </button>
            <div className="flex gap-6 items-center text-sm md:text-base">
              <Link href="/" className="hover:text-cyan-300 transition">Inicio</Link>
              <Link href="/BuyBrief" className="hover:text-cyan-300 transition">Comprar Briefs</Link>
              <Link href="/BriefForm" className="hover:text-cyan-300 transition">Crear Brief</Link>
              <button onClick={this.handleLogout} className="text-red-400 hover:text-red-500 font-semibold transition">
                Cerrar sesión
              </button>
            </div>
          </div>
        </nav>

        {/* Header */}
        <header className="px-6 pt-10 md:pt-16">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-3">Comprar Plan</h1>
            <p className="text-gray-300 mb-8">
              Plan actual: <span className="font-bold text-cyan-400">{userPlan || '—'}</span>
            </p>
          </div>
        </header>

        {/* Plans */}
        <section className="px-6 pb-28 md:pb-36">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => {
              const isSelected = selectedPlan.toLowerCase() === plan.name.toLowerCase();
              const pricePerBrief = plan.price / plan.briefs;

              return (
                <button
                  key={plan.name}
                  onClick={() => this.setState({ selectedPlan: plan.name })}
                  className={`group relative rounded-3xl p-7 text-left transition-all duration-300 border
                    ${isSelected ? 'border-cyan-400 ring-2 ring-cyan-400/40' : 'border-white/10 hover:border-cyan-400/60'}
                    bg-gradient-to-br ${plan.accent} to-transparent
                    hover:translate-y-[-2px] hover:shadow-xl`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 right-4 flex items-center gap-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full shadow">
                      <FaCrown /> Popular
                    </div>
                  )}

                  <h3 className="text-2xl font-extrabold mb-2">{plan.name}</h3>
                  <div className="flex items-end gap-2 mb-4">
                    <span className="text-4xl font-extrabold">${plan.price}</span>
                    <span className="text-gray-400 mb-1">/ mes</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mb-5">
                    <span className="text-xs bg-white/10 text-white/90 px-3 py-1 rounded-full">{plan.briefs} briefs incluidos</span>
                    <span className="text-xs bg-white/10 text-white/80 px-3 py-1 rounded-full">Extra ${plan.extraPrice}/brief</span>
                    <span className="text-xs bg-white/10 text-white/70 px-3 py-1 rounded-full">~${pricePerBrief.toFixed(2)}/brief</span>
                  </div>

                  <ul className="space-y-2">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-gray-200">
                        <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-300">
                          <FaCheck className="h-3.5 w-3.5" />
                        </span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <div className={`mt-6 text-sm font-semibold transition ${isSelected ? 'text-cyan-300' : 'text-gray-400 group-hover:text-cyan-200'}`}>
                    {isSelected ? 'Plan seleccionado' : 'Haz clic para seleccionar'}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Sticky Summary Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-40">
          <div className="mx-auto max-w-6xl px-6 pb-6">
            <div className={`rounded-2xl border ${selectedPlan ? 'border-cyan-500' : 'border-white/10'} bg-[#0b1426]/95 backdrop-blur-md shadow-2xl px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4`}>
              <div className="flex-1">
                <div className="text-sm text-gray-400">Plan seleccionado</div>
                <div className="text-xl font-bold">
                  {selectedPlanObj ? `${selectedPlanObj.name} — $${selectedPlanObj.price}/mes` : '—'}
                </div>
                {selectedPlanObj && (
                  <div className="text-sm text-gray-300">
                    {selectedPlanObj.briefs} briefs/mes · Extra ${selectedPlanObj.extraPrice}/brief · ~${(selectedPlanObj.price / selectedPlanObj.briefs).toFixed(2)}/brief
                  </div>
                )}
                {errorMsg && <div className="mt-2 text-sm text-red-400">{errorMsg}</div>}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => this.setState({ selectedPlan: '' })}
                  className="px-5 py-3 rounded-xl border border-white/15 text-white/90 hover:bg-white/5 transition"
                >
                  Limpiar
                </button>
                <button
                  onClick={this.handleSimulateBuyPlan}
                  className={`px-6 py-3 rounded-xl font-bold transition shadow-lg
                    ${!selectedPlan ? 'bg-gray-700 text-white/70 cursor-not-allowed' : 'bg-gradient-to-r from-cyan-400 to-blue-500 text-gray-900 hover:from-blue-500 hover:to-cyan-400'}`}
                >
                  {loading ? 'Procesando…' : 'Comprar Plan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }
}

/** Subcomponentes **/
function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat-card rounded-2xl border border-white/10 bg-white/5 px-6 py-5 shadow-lg">
      <div className="text-xs uppercase tracking-wide text-gray-400">{label}</div>
      <div className="text-2xl font-extrabold mt-1">{value}</div>
    </div>
  );
}

export default withRouter(BuyBrief);
