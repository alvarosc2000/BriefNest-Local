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
      "Perfecto para freelancers que buscan eficiencia y resultados inmediatos. Incluye 3 briefs profesionales listos para entregar en PDF con estructura premium y jerarquía estratégica.",
  },
  {
    name: "Pro",
    price: "$30 USD / mes",
    briefsIncluded: 10,
    pricePerExtraBrief: "$5 USD",
    description:
      "Diseñado para profesionales activos. Genera hasta 10 briefs mensuales con insights profundos, narrativa creativa y formatos listos para clientes exigentes, en Español e Inglés.",
  },
  {
    name: "Premium",
    price: "$80 USD / mes",
    briefsIncluded: 30,
    pricePerExtraBrief: "$3 USD",
    description:
      "Optimizado para agencias y equipos. Hasta 30 briefs mensuales con IA avanzada, KPIs, entregables estratégicos y documentos listos para presentaciones ejecutivas y clientes de alto nivel.",
  },
];

const briefs = [
  { icon: "🎯", title: "Brief Estratégico", desc: "Define objetivos claros, KPIs medibles y insights de consumidor accionables para decisiones estratégicas precisas." },
  { icon: "✨", title: "Brief Creativo", desc: "Inspiración narrativa y visual, tono de voz y storytelling alineados con la identidad de tu marca." },
  { icon: "🌐", title: "Brief Digital", desc: "Optimizado para campañas online, funnels de conversión y activaciones de alto impacto en cada canal digital." },
  { icon: "🎨", title: "Brief de Diseño", desc: "Guías visuales premium para branding, piezas gráficas y consistencia total en tu comunicación visual." },
  { icon: "📢", title: "Brief de Comunicación", desc: "Mensajes clave y storytelling estratégico que conectan, fidelizan y persuaden a tu audiencia." },
  { icon: "📝", title: "Brief de Contenidos", desc: "Plan editorial completo, formatos y calendario optimizados para redes, blogs y estrategias inbound." },
];

export default function Landing() {
  return (
    <main className="relative min-h-screen bg-[#0f172a] text-white font-inter overflow-x-hidden">
      <AnimatedBackground />

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center text-center min-h-screen md:min-h-[105vh] px-6 md:px-20 lg:px-40 overflow-hidden bg-gradient-to-br from-[#071b2e] via-[#0c2a4a] to-[#061827]">
        <h1 className="text-6xl md:text-7xl font-extrabold mb-6 leading-tight bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent animate-fade-in-up shadow-glow">
          BriefNest
        </h1>

        <p className="max-w-3xl text-lg md:text-xl text-gray-300 mb-12 animate-fade-in-up delay-200 leading-relaxed">
          Genera briefs estratégicos en minutos con IA. Profesional, bilingüe y listo para tu equipo o clientes más exigentes. Documentos que impactan desde la primera lectura.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-12 animate-fade-in-up delay-400">
          <FeatureCard title="⏱️ Tiempo optimizado" text="Crea briefs completos en minutos gracias a nuestro formulario inteligente y plantillas premium." />
          <FeatureCard title="📑 Profesionalismo asegurado" text="Entrega documentos claros, estructurados y visualmente impecables que impresionan a cualquier cliente." />
          <FeatureCard title="🚀 Escala sin límites" text="Desde freelancers hasta agencias, usa tantos briefs como necesites sin comprometer calidad." />
          <FeatureCard title="🎯 Estrategia integrada" text="Matriz táctica con KPIs y objetivos claros, cada brief es un roadmap de acción real." />
          <FeatureCard title="🌍 Multilenguaje premium" text="Genera briefs en Inglés y Español, ampliando tu alcance global con contenido ejecutivo y persuasivo." />
          <FeatureCard title="📂 PDF listo para entregar" text="Exporta briefs listos para presentación profesional, sin necesidad de ediciones adicionales." />
        </div>

        <a href="/LoginRegister" className="bg-cyan-500 hover:bg-cyan-600 text-gray-900 font-semibold rounded-full px-16 py-5 shadow-xl hover:shadow-cyan-400 transition-all duration-300 transform hover:scale-105 animate-pulse">
          Comenzar ahora
        </a>
      </section>

      {/* Sección de Briefs */}
      <section className="relative z-10 py-20 px-6 md:px-20 lg:px-40 text-center bg-[#16223B] border-t border-white/10">
        <h2 className="text-3xl md:text-4xl font-bold mb-8 text-cyan-300">Tipos de Briefs que puedes generar</h2>
        <p className="text-gray-300 max-w-3xl mx-auto mb-12">
          Cada tipo de brief está diseñado para maximizar resultados estratégicos, creativos y digitales.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {briefs.map((b, idx) => (
            <div key={idx} className="bg-[#0c1a33]/70 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/10 text-left transition-transform duration-300 hover:scale-[1.02]">
              <h3 className="text-xl font-bold text-cyan-300 mb-2">{b.icon} {b.title}</h3>
              <p className="text-gray-300 text-sm">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Diferenciadores */}
      <section className="relative z-10 py-20 px-6 md:px-20 lg:px-40 text-center bg-[#0f172a] border-t border-white/10">
        <h2 className="text-3xl md:text-4xl font-bold mb-8 text-cyan-300">¿Por qué elegir BriefNest?</h2>
        <p className="text-gray-300 max-w-3xl mx-auto mb-12">
          Otros generadores producen briefs genéricos. <span className="font-semibold text-white">BriefNest crea briefs estratégicos, accionables y premium</span>, listos para ejecución inmediata y decisiones ejecutivas.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <FeatureCard title="🧠 Enfoque Estratégico" text="Consumer insights, narrativa creativa y matriz táctica integrada en cada documento." />
          <FeatureCard title="📊 Operativo y Accionable" text="Cada deliverable está ligado a KPIs y resultados medibles para la toma de decisiones." />
          <FeatureCard title="🌍 Bilingüe y Premium" text="Briefs en Inglés o Español, con tono ejecutivo y formato listo para clientes globales." />
        </div>
      </section>

      {/* Comparativa */}
      <section className="relative z-10 py-20 px-6 md:px-20 lg:px-40 bg-[#16223B] text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-8">Comparativa</h2>
        <p className="text-gray-300 max-w-2xl mx-auto mb-12">Descubre cómo BriefNest supera cualquier generador genérico.</p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#0c1a33] text-cyan-300">
                <th className="p-4 text-left">Características</th>
                <th className="p-4 text-center">Otras apps</th>
                <th className="p-4 text-center">BriefNest</th>
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
                <tr key={i} className="border-b border-gray-700 text-gray-300 text-sm">
                  <td className="p-4 text-left">{feature}</td>
                  <td className="p-4 text-center">{others}</td>
                  <td className="p-4 text-center font-bold text-cyan-300">{ours}</td>
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
          Cada plan incluye acceso al formulario inteligente, exportación en PDF y soporte premium. Escoge según tus necesidades de productividad y volumen.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div key={plan.name} className="bg-gradient-to-tr from-[#0f172a]/80 via-[#16223b]/60 to-[#0c1a33]/80 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl animate-fade-in-up transition-transform duration-300 hover:scale-105 hover:shadow-cyan-500">
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
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Lo que dicen nuestros usuarios</h2>
        <p className="text-gray-300 max-w-2xl mx-auto mb-12">Profesionales y agencias optimizan su flujo de trabajo con BriefNest.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            { name: "Ana Martínez", role: "Brand Strategist", text: "BriefNest me ahorra horas. Los briefs son claros, organizados y listos para clientes exigentes." },
            { name: "Carlos Gómez", role: "Consultor de Marketing", text: "Desde el primer brief, mis clientes notaron la diferencia. Imprescindible para profesionales." },
            { name: "Laura Ríos", role: "Agencia Boutique", text: "Colaborar en equipo nunca fue tan fácil. Todos generamos briefs consistentes y estratégicos." },
          ].map((op, idx) => (
            <blockquote key={op.name} className={`bg-gradient-to-tr from-[#1e2a47]/80 via-[#16223b]/60 to-[#0c1a33]/80 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-white/10 text-gray-300 transition-transform duration-300 hover:scale-[1.02] animate-fade-in-up delay-${idx * 100}`}>
              <p className="italic mb-4">“{op.text}”</p>
              <div className="font-semibold text-white">{op.name}</div>
              <div className="text-sm text-gray-400">{op.role}</div>
            </blockquote>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="relative z-10 py-20 px-6 md:px-20 lg:px-40 text-center bg-gradient-to-tr from-[#071b2e] via-[#0c2a4a] to-[#061827]">
        <h2 className="text-4xl md:text-5xl font-bold mb-6 animate-fade-in-up">Listo para llevar tu productividad al siguiente nivel?</h2>
        <p className="max-w-xl mx-auto text-gray-300 mb-8 animate-fade-in-up delay-200">Genera briefs estratégicos y profesionales con IA en minutos. Sin complicaciones, sin pérdida de tiempo.</p>
        <a href="/LoginRegister" className="bg-cyan-500 hover:bg-cyan-600 text-gray-900 font-semibold rounded-full px-12 py-4 shadow-xl hover:shadow-cyan-400 transition-all duration-300 animate-pulse">Comenzar ahora</a>
      </section>

      <footer className="text-center py-6 text-gray-500 text-sm select-none">
        &copy; 2025 BriefNest. Todos los derechos reservados.
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
    <div aria-hidden="true" className="fixed inset-0 -z-10 bg-gradient-to-tr from-cyan-900 via-blue-900 to-indigo-900 animate-gradient-x" style={{ backgroundSize: "400% 400%" }} />
  );
}
