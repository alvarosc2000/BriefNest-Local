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

const briefs = [
  { icon: "🎯", title: "Brief Estratégico", desc: "Define objetivos, KPIs y consumer insights con enfoque claro." },
  { icon: "✨", title: "Brief Creativo", desc: "Inspiración para campañas con narrativa, tono y dirección visual." },
  { icon: "🌐", title: "Brief Digital", desc: "Enfocado en campañas online, funnels y activaciones de performance." },
  { icon: "🎨", title: "Brief de Diseño", desc: "Lineamientos visuales y creativos para piezas gráficas o branding." },
  { icon: "📢", title: "Brief de Comunicación", desc: "Mensajes clave, tono de voz y storytelling para conectar con la audiencia." },
  { icon: "📝", title: "Brief de Contenidos", desc: "Plan editorial, formatos y calendario para redes o inbound marketing." },
];

export default function Landing() {
  return (
    <main className="relative min-h-screen bg-[#0f172a] text-white font-inter overflow-x-hidden">
      <AnimatedBackground />

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center text-center min-h-screen md:min-h-[105vh] px-6 md:px-20 lg:px-40 overflow-hidden bg-gradient-to-br from-[#071b2e] via-[#0c2a4a] to-[#061827]">
        {/* Título principal */}
        <h1 className="text-6xl md:text-7xl font-extrabold mb-6 leading-tight bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent animate-fade-in-up shadow-glow">
          BriefMind
        </h1>

        {/* Subtítulo */}
        <p className="max-w-3xl text-lg md:text-xl text-gray-300 mb-12 animate-fade-in-up delay-200 leading-relaxed">
          Genera briefs estratégicos en minutos con IA, en Inglés o Español. 
          Documentos claros, profesionales y listos para tu equipo o clientes.
        </p>

        {/* Beneficios */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-12 animate-fade-in-up delay-400">
          <FeatureCard
            title="⏱️ Ahorra tiempo"
            text="Genera briefs completos en minutos con nuestro formulario inteligente y plantillas premium."
          />
          <FeatureCard
            title="📑 Profesionalismo"
            text="Entrega documentos claros y bien estructurados que impresionan a tus clientes y equipo."
          />
          <FeatureCard
            title="🚀 Escalabilidad"
            text="Ideal para freelancers, profesionales y agencias. Usa tantos briefs como necesites."
          />
          <FeatureCard
            title="🎯 Enfoque estratégico"
            text="Incluye matriz táctica con KPIs para que cada proyecto esté alineado con objetivos medibles."
          />
          <FeatureCard
            title="🌍 Multilenguaje"
            text="Genera briefs bilingües (EN/ES) y amplía tu alcance con clientes internacionales."
          />
          <FeatureCard
            title="📂 Exportación premium"
            text="Descarga tus briefs en PDF profesional, listo para presentar sin necesidad de ediciones extras."
          />
        </div>


        {/* CTA */}
        <a
          href="/LoginRegister"
          className="bg-cyan-500 hover:bg-cyan-600 text-gray-900 font-semibold rounded-full px-16 py-5 shadow-xl hover:shadow-cyan-400 transition-all duration-300 transform hover:scale-105 animate-pulse"
        >
          Comenzar ahora
        </a>
      </section>

      {/* Sección de Briefs */}
      <section className="relative z-10 py-20 px-6 md:px-20 lg:px-40 text-center bg-[#16223B] border-t border-white/10">
        <h2 className="text-3xl md:text-4xl font-bold mb-8 text-cyan-300">
          Tipos de Briefs que puedes generar
        </h2>
        <p className="text-gray-300 max-w-3xl mx-auto mb-12">
          Diseñados para diferentes necesidades de marketing, creatividad y negocio.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {briefs.map((b, idx) => (
            <div key={idx} className="bg-[#0c1a33]/70 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/10 text-left transition-transform duration-300 hover:scale-[1.02]">
              <h3 className="text-xl font-bold text-cyan-300 mb-2">
                {b.icon} {b.title}
              </h3>
              <p className="text-gray-300 text-sm">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Diferenciadores */}
      <section className="relative z-10 py-20 px-6 md:px-20 lg:px-40 text-center bg-[#0f172a] border-t border-white/10">
        <h2 className="text-3xl md:text-4xl font-bold mb-8 text-cyan-300">
          ¿Por qué elegir BriefMind?
        </h2>
        <p className="text-gray-300 max-w-3xl mx-auto mb-12">
          Otros generadores producen briefs genéricos o de SEO. BriefMind es distinto: crea <span className="font-semibold text-white">documentos estratégicos completos</span>, listos para ejecución real.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <FeatureCard title="🧠 Enfoque Estratégico" text="Incluye insights de consumidor, narrativa creativa, diferenciación y matriz táctica." />
          <FeatureCard title="📊 Operativo y Accionable" text="Cada deliverable tiene rol en el funnel. Incluye KPIs, riesgos y benchmarking competitivo." />
          <FeatureCard title="🌍 Bilingüe y Premium" text="Genera briefs en inglés o español, con tono ejecutivo y estándar internacional." />
        </div>
      </section>

        {/* Comparativa */}
        <section className="relative z-10 py-20 px-6 md:px-20 lg:px-40 bg-[#16223B] text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">Comparativa</h2>
          <p className="text-gray-300 max-w-2xl mx-auto mb-12">
            Mira cómo se diferencia BriefMind de otras herramientas.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#0c1a33] text-cyan-300">
                  <th className="p-4 text-left">Características</th>
                  <th className="p-4 text-center">Otras apps</th>
                  <th className="p-4 text-center">BriefMind</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Plantillas genéricas", "✅", "❌"],
                  ["Insight consumidor", "❌", "✅"],
                  ["Matriz táctica con KPIs", "❌", "✅"],
                  ["Función de cada deliverable", "❌", "✅"],
                  ["Brief bilingüe (EN/ES)", "❌", "✅"],
                  ["Exportación profesional en PDF", "❌", "✅"],
                ].map(([feature, others, ours], i) => (
                  <tr
                    key={i}
                    className="border-b border-gray-700 text-gray-300 text-sm"
                  >
                    <td className="p-4 text-left">{feature}</td>
                    <td className="p-4 text-center">{others}</td>
                    <td className="p-4 text-center font-bold text-cyan-300">
                      {ours}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>


      {/* Planes */}
      <section className="relative z-10 py-20 px-6 md:px-20 lg:px-40 text-center bg-[#1e2a47]">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Planes y precios</h2>
        <p className="text-gray-300 max-w-xl mx-auto mb-12">
          Todos los planes incluyen acceso al formulario inteligente y exportación en PDF.
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
              <p className="text-gray-200 text-sm mb-6">{plan.description}</p>
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
            {
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
              text: "Colaborar en equipo nunca fue tan fácil. Todo el equipo genera briefs consistentes.",
            },
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
        <h2 className="text-4xl md:text-5xl font-bold mb-6 animate-fade-in-up">
          ¿Listo para comenzar?
        </h2>
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

function FeatureCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="bg-[#0c1a33]/70 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/10">
      <h3 className="text-xl font-bold text-cyan-300 mb-2">{title}</h3>
      <p className="text-gray-300 text-sm">{text}</p>
    </div>
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
