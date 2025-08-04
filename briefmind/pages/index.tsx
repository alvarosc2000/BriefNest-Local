import { useEffect, useState } from "react";

type Plan = {
  name: string;
  price: string;
  briefsIncluded: number;
  pricePerExtraBrief: string;
  description: string;
};

const plans: Plan[] = [
  {
    name: "Basic",
    price: "$10 USD / mes",
    briefsIncluded: 3,
    pricePerExtraBrief: "$7 USD",
    description:
      "Perfecto para freelancers. Accede al formulario inteligente con exportación en PDF y Word. Precio fijo mensual.",
  },
  {
    name: "Pro",
    price: "$30 USD / mes",
    briefsIncluded: 10,
    pricePerExtraBrief: "$5 USD",
    description:
      "Para profesionales activos. Mismo formulario potente, exportación en PDF/Word y más briefs incluidos.",
  },
  {
    name: "Premium",
    price: "$80 USD / mes",
    briefsIncluded: 30,
    pricePerExtraBrief: "$3 USD",
    description:
      "Optimizado para agencias y equipos. Uso colaborativo, mismo acceso a funciones, y más volumen mensual.",
  },
];

export default function Landing() {
  const [scrolled, setScrolled] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <main className="relative min-h-screen bg-[#0F172A] text-white font-inter overflow-hidden scroll-smooth">
      <AnimatedBackground />

      {/* Intro */}
      <section className="relative z-10 flex flex-col items-center justify-center text-center min-h-screen px-6 md:px-20 lg:px-40 bg-gradient-to-br from-[#071b2e] via-[#0c2a4a] to-[#061827] animate-backgroundPulse">
        <h1
          className="text-6xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight select-none"
          style={{
            background: "linear-gradient(90deg, #06b6d4, #0ea5e9, #3b82f6)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            textShadow: "0 0 12px rgba(231, 208, 73, 0.7)",
          }}
        >
          BriefMind{" "}
          <span className="inline-block animate-bounce-smooth ml-2" role="img" aria-label="cerebro">
            💡
          </span>
        </h1>

        <p className="max-w-3xl text-lg md:text-xl text-gray-300 mb-12 leading-relaxed">
          Crea <span className="font-semibold text-cyan-400">briefs inteligentes</span> con IA.
          <br />
          El mismo potente formulario para todos los planes. Exporta a PDF y Word. Simple y profesional.
        </p>

        <a
          href="/LoginRegister"
          className="bg-cyan-500 hover:bg-cyan-600 text-gray-900 font-semibold rounded-full px-12 py-4 shadow-xl hover:shadow-cyan-400 transition-all duration-300 transform hover:scale-105 animate-pulse"
        >
          Empezar ahora
        </a>

        <style jsx>{`
          @keyframes backgroundPulse {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          .animate-backgroundPulse {
            background-size: 200% 200%;
            animation: backgroundPulse 10s ease infinite;
          }
          @keyframes bounceSmooth {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10%); }
          }
          .animate-bounce-smooth {
            animation: bounceSmooth 2.5s ease-in-out infinite;
          }
        `}</style>
      </section>

      {/* Planes */}
      <section className="relative z-10 bg-[#1e2a47] py-20 px-6 md:px-20 lg:px-40 text-center">
        <h2 className="text-3xl font-bold mb-6">Planes y precios</h2>
        <p className="text-gray-300 max-w-xl mx-auto mb-12">
          Todos los planes incluyen acceso completo al formulario y exportaciones en PDF y Word.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              onClick={() => setSelectedPlan(plan)}
              className={`bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-xl cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                selectedPlan?.name === plan.name ? "border-2 border-cyan-400" : ""
              }`}
            >
              <h3 className="text-2xl font-bold mb-4 text-cyan-300">{plan.name}</h3>
              <div className="text-3xl font-extrabold text-white mb-2">{plan.price}</div>
              <p className="text-gray-300 mb-1">{plan.briefsIncluded} briefs incluidos</p>
              <p className="text-gray-400 mb-4">Extra: {plan.pricePerExtraBrief}</p>
              <p className="text-gray-200 text-sm">{plan.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Opiniones */}
      <section className="relative z-10 bg-[#16223B] py-20 px-6 md:px-20 lg:px-40 text-center">
        <h2 className="text-3xl font-bold mb-6">Lo que opinan nuestros usuarios</h2>
        <p className="text-gray-300 max-w-2xl mx-auto mb-12">
          Profesionales y equipos ya están optimizando su flujo de trabajo con BriefMind.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto text-left">
          {[{
            name: "Ana Martínez",
            role: "Brand Strategist",
            text: "BriefMind me ahorra horas. Los briefs son claros, organizados y listos para el cliente.",
          },
          {
            name: "Carlos Gómez",
            role: "Consultor de Marketing",
            text: "Mis clientes notaron la diferencia desde el primer brief. Herramienta imprescindible.",
          },
          {
            name: "Laura Ríos",
            role: "Agencia Boutique",
            text: "Colaborar en equipo nunca fue tan fácil. Todo el equipo genera briefs claros y consistentes.",
          }].map((op) => (
            <blockquote
              key={op.name}
              className="bg-white/5 backdrop-blur-md p-6 rounded-xl shadow-lg text-gray-300 border border-white/10 hover:scale-[1.02] transition-all duration-300"
            >
              <p className="italic mb-4">“{op.text}”</p>
              <div className="font-semibold text-white">{op.name}</div>
              <div className="text-sm text-gray-400">{op.role}</div>
            </blockquote>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="relative z-10 py-20 px-6 md:px-20 lg:px-40 text-center bg-[#0F172A]">
        <h2 className="text-4xl font-bold mb-6">¿Listo para comenzar?</h2>
        <p className="max-w-xl mx-auto text-gray-300 mb-8">
          Comienza a generar briefs potentes con IA. Sin complicaciones.
        </p>
        <a
          href="/"
          className="bg-cyan-500 hover:bg-cyan-600 text-gray-900 font-semibold rounded-full px-10 py-4 shadow-lg hover:shadow-cyan-400 transition-all duration-300 animate-pulse"
        >
          Crear mi primer brief
        </a>
      </section>

      <footer className="text-center py-6 text-gray-500 text-sm select-none">
        &copy; 2025 BriefMind. Todos los derechos reservados.
      </footer>
    </main>
  );
}

function AnimatedBackground() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 -z-10 bg-gradient-to-tr from-cyan-900 via-blue-900 to-indigo-900 animate-gradient-x"
      style={{ backgroundSize: "400% 400%" }}
    />
  );
}
