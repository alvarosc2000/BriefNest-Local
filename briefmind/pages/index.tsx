import { useState } from "react";

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
      "Perfecto para freelancers. Accede al formulario inteligente con exportación en PDF. Precio fijo mensual.",
  },
  {
    name: "Pro",
    price: "$30 USD / mes",
    briefsIncluded: 10,
    pricePerExtraBrief: "$5 USD",
    description:
      "Para profesionales activos. Mismo formulario potente, exportación en PDF y más briefs incluidos.",
  },
  {
    name: "Premium",
    price: "$80 USD / mes",
    briefsIncluded: 30,
    pricePerExtraBrief: "$3 USD",
    description:
      "Optimizado para agencias y equipos. Uso colaborativo, acceso a funciones avanzadas y más volumen mensual.",
  },
];

export default function Landing() {
  return (
    <main className="relative min-h-screen bg-[#0f172a] text-white font-inter overflow-x-hidden">
      <AnimatedBackground />

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center text-center min-h-screen md:min-h-[105vh] px-6 md:px-20 lg:px-40 overflow-hidden bg-gradient-to-br from-[#071b2e] via-[#0c2a4a] to-[#061827]">
        
        {/* Fondo animado con partículas */}
        <div className="absolute inset-0">
          {Array.from({ length: 70 }).map((_, i) => (
            <span
              key={i}
              className="absolute rounded-full opacity-20 animate-floating"
              style={{
                width: `${3 + Math.random() * 7}px`,
                height: `${3 + Math.random() * 7}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                backgroundColor: `hsl(${Math.random() * 200 + 160}, 70%, 60%)`,
                animationDuration: `${5 + Math.random() * 6}s`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

        {/* Título principal */}
        <h1 className="text-6xl md:text-7xl font-extrabold mb-6 leading-tight bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent animate-fade-in-up shadow-glow">
          BriefMind
        </h1>

        {/* Subtítulo */}
        <p className="max-w-3xl text-lg md:text-xl text-gray-300 mb-12 animate-fade-in-up delay-200 leading-relaxed">
          Genera briefs inteligentes en minutos con IA, listos para entregar a tus clientes o equipo. 
          Optimiza tu flujo de trabajo, ahorra tiempo y mejora tu productividad con documentos claros y profesionales.
        </p>

        {/* Beneficios destacados */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-12 animate-fade-in-up delay-400">
          <div className="bg-[#0c1a33]/70 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/10">
            <h3 className="text-xl font-bold text-cyan-300 mb-2">Ahorra tiempo</h3>
            <p className="text-gray-300 text-sm">Genera briefs completos en minutos con nuestro formulario inteligente y plantillas prediseñadas.</p>
          </div>
          <div className="bg-[#0c1a33]/70 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/10">
            <h3 className="text-xl font-bold text-cyan-300 mb-2">Profesionalismo</h3>
            <p className="text-gray-300 text-sm">Entrega briefs claros y bien estructurados que impresionan a tus clientes y equipo.</p>
          </div>
          <div className="bg-[#0c1a33]/70 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/10">
            <h3 className="text-xl font-bold text-cyan-300 mb-2">Escalabilidad</h3>
            <p className="text-gray-300 text-sm">Ideal para freelancers, profesionales y agencias. Crea tantos briefs como necesites.</p>
          </div>
        </div>

        {/* CTA principal */}
        <a
          href="/LoginRegister"
          className="bg-cyan-500 hover:bg-cyan-600 text-gray-900 font-semibold rounded-full px-16 py-5 shadow-xl hover:shadow-cyan-400 transition-all duration-300 transform hover:scale-105 animate-pulse"
        >
          Comenzar ahora
        </a>
      </section>


      {/* Planes Section */}
      <section className="relative z-10 py-20 px-6 md:px-20 lg:px-40 text-center bg-[#1e2a47]">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Planes y precios</h2>
        <p className="text-gray-300 max-w-xl mx-auto mb-12">
          Todos los planes incluyen acceso completo al formulario y exportación en PDF.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className="bg-gradient-to-tr from-[#0f172a]/80 via-[#16223b]/60 to-[#0c1a33]/80 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl animate-fade-in-up transition-transform duration-300 hover:scale-105 hover:shadow-cyan-500"
            >
              <h3 className="text-2xl font-bold mb-3 text-cyan-300">{plan.name}</h3>
              <div className="text-3xl font-extrabold text-white mb-2">{plan.price}</div>
              <p className="text-gray-300 mb-1">{plan.briefsIncluded} briefs incluidos</p>
              <p className="text-gray-400 mb-4">Extra: {plan.pricePerExtraBrief}</p>
              <p className="text-gray-200 text-sm">{plan.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonios */}
      <section className="relative z-10 py-20 px-6 md:px-20 lg:px-40 bg-[#16223B] text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Opiniones de usuarios</h2>
        <p className="text-gray-300 max-w-2xl mx-auto mb-12">
          Profesionales y equipos optimizan su flujo de trabajo con BriefMind.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            { name: "Ana Martínez", role: "Brand Strategist", text: "BriefMind me ahorra horas. Los briefs son claros, organizados y listos para el cliente." },
            { name: "Carlos Gómez", role: "Consultor de Marketing", text: "Mis clientes notaron la diferencia desde el primer brief. Herramienta imprescindible." },
            { name: "Laura Ríos", role: "Agencia Boutique", text: "Colaborar en equipo nunca fue tan fácil. Todo el equipo genera briefs claros y consistentes." },
          ].map((op, idx) => (
            <blockquote
              key={op.name}
              className={`bg-gradient-to-tr from-[#1e2a47]/80 via-[#16223b]/60 to-[#0c1a33]/80 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-white/10 text-gray-300 transition-transform duration-300 hover:scale-[1.02] animate-fade-in-up delay-${idx * 100}`}
            >
              <p className="italic mb-4">“{op.text}”</p>
              <div className="font-semibold text-white">{op.name}</div>
              <div className="text-sm text-gray-400">{op.role}</div>
            </blockquote>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="relative z-10 py-20 px-6 md:px-20 lg:px-40 text-center bg-gradient-to-tr from-[#071b2e] via-[#0c2a4a] to-[#061827]">
        <h2 className="text-4xl md:text-5xl font-bold mb-6 animate-fade-in-up">¿Listo para comenzar?</h2>
        <p className="max-w-xl mx-auto text-gray-300 mb-8 animate-fade-in-up delay-200">
          Comienza a generar briefs potentes con IA. Sin complicaciones.
        </p>
        <a
          href="/LoginRegister"
          className="bg-cyan-500 hover:bg-cyan-600 text-gray-900 font-semibold rounded-full px-12 py-4 shadow-xl hover:shadow-cyan-400 transition-all duration-300 animate-pulse"
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
