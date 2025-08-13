import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { FaSignOutAlt } from "react-icons/fa";

interface BriefFormData {
  clientName: string;
  projectName: string;
  startDate: string;
  deliveryDate: string;
  website: string;
  mainGoal: string;
  secondaryGoals: string;
  currentSituation: string;
  challenges: string;
  targetAudience: string;
  audienceNeeds: string;
  mainMessage: string;
  differentiation: string;
  tone: string;
  channels: string[];
  deliverableFormats: string[];
  expectedDeliverables: string;
  limitations: string;
  competitors: string;
  references: string;
  budget: string;
  resources: string;
  milestones: string;
  deadlines: string;
  restrictions: string;
  notes: string;
  brandingLinks: string;
  finalFormat: string;
}

const tonesOptions = ["Formal", "Cercano", "Inspirador", "Técnico", "Divertido"];
const channelsOptions = [
  "Instagram",
  "Facebook",
  "Email",
  "Google Ads",
  "LinkedIn",
  "Web",
  "TikTok",          // para video viral
  "WhatsApp",        // comunicación directa
  "YouTube",         // canal de video largo
];

const deliverablesOptions = [
  "Posts",
  "Videos",
  "Newsletters",
  "Infografías",
  "Stories",         // contenido temporal
  "Reels / Shorts",  // videos cortos
  "Carruseles",      // posts deslizables
  "Blogs",           // contenido escrito largo
  "Landing Pages"    // páginas de destino para campañas
];


const initialData: BriefFormData = {
  clientName: "",
  projectName: "",
  startDate: "",
  deliveryDate: "",
  website: "",
  mainGoal: "",
  secondaryGoals: "",
  currentSituation: "",
  challenges: "",
  targetAudience: "",
  audienceNeeds: "",
  mainMessage: "",
  differentiation: "",
  tone: "",
  channels: [],
  deliverableFormats: [],
  expectedDeliverables: "",
  limitations: "",
  competitors: "",
  references: "",
  budget: "",
  resources: "",
  milestones: "",
  deadlines: "",
  restrictions: "",
  notes: "",
  brandingLinks: "",
  finalFormat: "",
};

export default function ProjectBriefForm() {
  const [form, setForm] = useState<BriefFormData>(initialData);
  const [userName, setUserName] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [userBrief, setUserBrief] = useState<number | null>(null);
  const [userPlan, setUserPlan] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    // Carga borrador si existe
    const saved = localStorage.getItem("briefmind_draft");
    if (saved) setForm(JSON.parse(saved));

    // Carga usuario y id (ajusta a tu lógica de sesión)
    const loggedUserName = localStorage.getItem("user_name");
    if (loggedUserName) setUserName(loggedUserName);

    const savedUserId = localStorage.getItem("user_id");
    if (savedUserId) setUserId(Number(savedUserId));

    const savedUserBrief = localStorage.getItem("user_brief");
    if (savedUserBrief) setUserBrief(Number(savedUserBrief));

    const savedUserBriefPlan = localStorage.getItem("subscription_plan");
    if (savedUserBriefPlan) setUserPlan(savedUserBriefPlan);

  }, []);

  useEffect(() => {
    // Guarda borrador localmente
    localStorage.setItem("briefmind_draft", JSON.stringify(form));
  }, [form]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked } = e.target as any;
    if (type === "checkbox") {
      const arr = form[name as keyof BriefFormData] as string[];
      if (checked) {
        setForm({ ...form, [name]: [...arr, value] });
      } else {
        setForm({ ...form, [name]: arr.filter((v) => v !== value) });
      }
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const nextStep = () => {
    if (step < steps.length - 1) {
      setAnimating(true);
      setTimeout(() => {
        setStep((s) => s + 1);
        setAnimating(false);
      }, 300);
    }
  };

  const prevStep = () => {
    if (step > 0) {
      setAnimating(true);
      setTimeout(() => {
        setStep((s) => s - 1);
        setAnimating(false);
      }, 300);
    }
  };

  const handleSaveDraft = () => {
    localStorage.setItem("briefmind_draft", JSON.stringify(form));
    alert("Borrador guardado localmente.");
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!userId) {
    alert("Debes iniciar sesión para enviar el brief.");
    return;
  }

  const payload = {
    user_id: userId,
    client_name: form.clientName,
    project_name: form.projectName,
    start_date: form.startDate,
    delivery_date: form.deliveryDate,
    website: form.website,
    main_goal: form.mainGoal,
    secondary_goals: form.secondaryGoals,
    current_situation: form.currentSituation,
    challenges: form.challenges,
    target_audience: form.targetAudience,
    audience_needs: form.audienceNeeds,
    main_message: form.mainMessage,
    differentiation: form.differentiation,
    tone: form.tone,
    channels: form.channels,
    deliverable_formats: form.deliverableFormats,
    expected_deliverables: form.expectedDeliverables,
    limitations: form.limitations,
    competitors: form.competitors,
    reference_links: form.references,
    budget: form.budget,
    resources: form.resources,
    milestones: form.milestones,
    deadlines: form.deadlines,
    restrictions: form.restrictions,
    notes: form.notes,
    branding_links: form.brandingLinks,
    final_format: form.finalFormat,
  };

  try {
    const response = await fetch("http://localhost:5000/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      // Espera el PDF como blob
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "briefmind.pdf"; // Nombre por defecto
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      alert("Brief enviado y PDF descargado.");
      localStorage.removeItem("briefmind_draft");
      setForm(initialData);
      setStep(0);
    } else {
      const err = await response.json();
      alert(err.message || "Error al enviar el brief.");
    }
  } catch (error) {
    alert("Error de conexión. Intenta de nuevo.");
  }
};


  const router = useRouter();

   const handleLogout = () => {
    localStorage.clear();
    router.push('/Index');
  };

  // Pasos del formulario
  const steps = [
    {
      title: "Información General",
      content: (
        <>
          <Input
            label="Nombre del cliente"
            name="clientName"
            value={form.clientName}
            onChange={handleChange}
            required
          />
          <Input
            label="Nombre del proyecto"
            name="projectName"
            value={form.projectName}
            onChange={handleChange}
            required
          />
          <Input
            label="Fecha de inicio"
            name="startDate"
            type="date"
            value={form.startDate}
            onChange={handleChange}
            required
          />
          <Input
            label="Fecha de entrega"
            name="deliveryDate"
            type="date"
            value={form.deliveryDate}
            onChange={handleChange}
            required
          />
          <Input
            label="Sitio web"
            name="website"
            type="url"
            value={form.website}
            onChange={handleChange}
          />
        </>
      ),
    },
    {
      title: "Objetivos y situación",
      content: (
        <>
          <Textarea
            label="Objetivo principal"
            name="mainGoal"
            value={form.mainGoal}
            onChange={handleChange}
            required
          />
          <Textarea
            label="Objetivos secundarios"
            name="secondaryGoals"
            value={form.secondaryGoals}
            onChange={handleChange}
          />
          <Textarea
            label="Situación actual"
            name="currentSituation"
            value={form.currentSituation}
            onChange={handleChange}
          />
          <Textarea
            label="Desafíos"
            name="challenges"
            value={form.challenges}
            onChange={handleChange}
          />
        </>
      ),
    },
    {
      title: "Audiencia y mensaje",
      content: (
        <>
          <Textarea
            label="Audiencia objetivo"
            name="targetAudience"
            value={form.targetAudience}
            onChange={handleChange}
          />
          <Textarea
            label="Necesidades de la audiencia"
            name="audienceNeeds"
            value={form.audienceNeeds}
            onChange={handleChange}
          />
          <Textarea
            label="Mensaje principal"
            name="mainMessage"
            value={form.mainMessage}
            onChange={handleChange}
          />
          <Textarea
            label="Diferenciación"
            name="differentiation"
            value={form.differentiation}
            onChange={handleChange}
          />
        </>
      ),
    },
    {
      title: "Canales y entregables",
      content: (
        <>
          <CheckboxGroup
            label="Canales"
            name="channels"
            options={channelsOptions}
            selected={form.channels}
            onChange={handleChange}
          />
          <CheckboxGroup
            label="Formatos de entregables"
            name="deliverableFormats"
            options={deliverablesOptions}
            selected={form.deliverableFormats}
            onChange={handleChange}
          />
          <Textarea
            label="Entregables esperados"
            name="expectedDeliverables"
            value={form.expectedDeliverables}
            onChange={handleChange}
          />
          <Textarea
            label="Limitaciones"
            name="limitations"
            value={form.limitations}
            onChange={handleChange}
          />
        </>
      ),
    },
    {
      title: "Otros detalles",
      content: (
        <>
          <Textarea
            label="Competidores"
            name="competitors"
            value={form.competitors}
            onChange={handleChange}
          />
          <Textarea
            label="Enlaces de referencia"
            name="references"
            value={form.references}
            onChange={handleChange}
          />
          <Input
            label="Presupuesto"
            name="budget"
            value={form.budget}
            onChange={handleChange}
          />
          <Textarea
            label="Recursos"
            name="resources"
            value={form.resources}
            onChange={handleChange}
          />
          <Textarea
            label="Hitos"
            name="milestones"
            value={form.milestones}
            onChange={handleChange}
          />
          <Input
            label="Fechas límite"
            name="deadlines"
            value={form.deadlines}
            onChange={handleChange}
          />
          <Textarea
            label="Restricciones"
            name="restrictions"
            value={form.restrictions}
            onChange={handleChange}
          />
          <Textarea
            label="Notas"
            name="notes"
            value={form.notes}
            onChange={handleChange}
          />
          <Input
            label="Enlaces de branding"
            name="brandingLinks"
            value={form.brandingLinks}
            onChange={handleChange}
          />
          <Input
            label="Formato final"
            name="finalFormat"
            value={form.finalFormat}
            onChange={handleChange}
          />
        </>
      ),
    },
  ];

  return (


    
    <div className="min-h-screen bg-[#0F172A] p-4">
      {/* Navbar */}
      <nav className="w-full flex justify-between items-center px-8 py-4 bg-[#111827] border-b border-gray-700">
        <div className="text-2xl font-bold text-blue-400 cursor-pointer" onClick={() => router.push('/Index')}>
          BriefMind
        </div>
        <div className="flex gap-6 items-center">
          <Link href="/" className="hover:text-blue-300 text-sm">Inicio</Link>
          <Link href="/BriefForm" className="hover:text-blue-300 text-sm">Crear Brief</Link>
          <Link href="/ChangePlan" className="hover:text-blue-300 text-sm">Cambiar Plan</Link>
          <Link href="/BuyBrief" className="hover:text-blue-300 text-sm">Comprar Brief</Link>
          <button onClick={handleLogout} className="flex items-center gap-2 text-red-400 hover:text-red-500 text-sm">
            <FaSignOutAlt /> Cerrar sesión
          </button>
        </div>
      </nav>

      <header className="max-w-4xl mx-auto mt-16 mb-12 text-center text-white px-4">
        <h1 className="text-5xl font-extrabold mb-4 leading-tight">
          {userName ? `¡Bienvenido, ${userName}!` : "¡Hola! Comienza a crear tu brief"}
        </h1>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 text-lg text-gray-800 mt-4">
          {typeof userBrief !== "undefined" && (
            <div className="bg-[#1e2a47] px-5 py-3 rounded-xl shadow-md border border-cyan-500 text-white">
              <span className="font-semibold text-white">Briefs restantes:</span>{" "}
              {userBrief}
            </div>
          )}

          {userPlan && (
            <div className="bg-[#1e2a47] px-5 py-3 rounded-xl shadow-md border border-cyan-500 text-white">
              <span className="font-semibold text-white">Plan actual:</span>{" "}
              {userPlan}
            </div>
          )}
        </div>

        <p className="mt-6 text-xl text-gray-8000 leading-relaxed max-w-2xl mx-auto">
          Completa el formulario a continuación para generar un brief profesional,
          claro y personalizado para tu próximo proyecto.
        </p>
      </header>

      <main className="flex-1 max-w-4xl mx-auto bg-white rounded-xl p-8 shadow-2xl transition-all duration-300">
        <h2 className="text-gray-800 text-2xl font-bold mb-6">
          Paso {step + 1} de {steps.length}: {steps[step].title}
        </h2>
        
        {/* Barra de progreso visual */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-6 overflow-hidden">
          <div
            className="bg-blue-600 h-full transition-all duration-500"
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          ></div>
        </div>

        <form
          onSubmit={handleSubmit}
          className={`flex flex-col gap-6 ${
            animating ? "opacity-50 pointer-events-none" : ""
          }`}
        >
          {steps[step].content}
          <div className="flex justify-between mt-4">
            {step > 0 && (
              <button
                type="button"
                onClick={prevStep}
                className="bg-gray-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded transition"
              >
                Anterior
              </button>
            )}
            <div className="flex gap-4 ml-auto">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-6 rounded transition"
              >
                Guardar borrador
              </button>
              {step < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded transition"
                >
                  Siguiente
                </button>
              ) : (
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded transition"
                >
                  Enviar brief
                </button>
              )}
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}

function Input({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  name: keyof BriefFormData;
  value: string;
  onChange: (e: React.ChangeEvent<any>) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col">
      <label
        htmlFor={name}
        className="mb-1 text-gray-700 font-semibold"
      >
        {label}
      </label>
      <input
        className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 text-black"
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
      />
    </div>
  );
}

function Textarea({
  label,
  name,
  value,
  onChange,
  required = false,
}: {
  label: string;
  name: keyof BriefFormData;
  value: string;
  onChange: (e: React.ChangeEvent<any>) => void;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col">
      <label
        htmlFor={name}
        className="mb-1 text-gray-700 font-semibold"
      >
        {label}
      </label>
      <textarea
        className="border border-gray-300 rounded px-3 py-2 resize-y focus:outline-none focus:ring-2 focus:ring-blue-600 text-black"
        id={name}
        name={name}
        rows={4}
        value={value}
        onChange={onChange}
        required={required}
      />
    </div>
  );
}

function Select({
  label,
  name,
  value,
  onChange,
  options,
}: {
  label: string;
  name: keyof BriefFormData;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
}) {
  return (
    <div className="flex flex-col">
      <label
        htmlFor={name}
        className="mb-1 text-gray-700 font-semibold"
      >
        {label}
      </label>
      <select
        id={name}
        name={name}
        className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 text-black"
        value={value}
        onChange={onChange}
      >
        <option value="">Selecciona</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

function CheckboxGroup({
  label,
  name,
  options,
  selected,
  onChange,
}: {
  label: string;
  name: keyof BriefFormData;
  options: string[];
  selected: string[];
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-2 font-semibold text-black">{label}</legend>
      <div className="flex flex-wrap gap-4">
        {options.map((opt) => (
          <label
            key={opt}
            className="inline-flex items-center cursor-pointer select-none"
          >
            <input
              type="checkbox"
              name={name}
              value={opt}
              checked={selected.includes(opt)}
              onChange={onChange}
              className="form-checkbox h-5 w-5 text-blue-600"
            />
            <span className="ml-2 text-black">{opt}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
