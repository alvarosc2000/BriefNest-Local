'use client';

import React, { JSX, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaSignOutAlt } from 'react-icons/fa';
import DownloadingView from "./DownloadingView"; // ajusta la ruta según tu estructura

/** Tipado del formulario */
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

/** Opciones reutilizables */


const getToneOptions = (plan: string | null) => {
  // Basic: solo español
  if (!plan || plan.toLowerCase() === 'basic') {
    return ['Español'];
  }

  // Pro
  if (plan.toLowerCase() === 'pro') {
    return ['Español', 'Inglés'];
  }

  // Equipo
  if (plan.toLowerCase() === 'equipo') {
    return ['Español', 'Inglés'];
  }

  // fallback → solo español
  return ['Español'];
};



const channelsOptions = [
  'Instagram',
  'Facebook',
  'Email',
  'Google Ads',
  'LinkedIn',
  'Web',
  'TikTok',
  'WhatsApp',
  'YouTube',
];
const deliverablesOptions = [
  'Posts',
  'Videos',
  'Newsletters',
  'Infografías',
  'Stories',
  'Reels / Shorts',
  'Carruseles',
  'Blogs',
  'Landing Pages',
];


/** Estado inicial */
const initialData: BriefFormData = {
  clientName: '',
  projectName: '',
  startDate: '',
  deliveryDate: '',
  website: '',
  mainGoal: '',
  secondaryGoals: '',
  currentSituation: '',
  challenges: '',
  targetAudience: '',
  audienceNeeds: '',
  mainMessage: '',
  differentiation: '',
  tone: '',
  channels: [],
  deliverableFormats: [],
  expectedDeliverables: '',
  limitations: '',
  competitors: '',
  references: '',
  budget: '',
  resources: '',
  milestones: '',
  deadlines: '',
  restrictions: '',
  notes: '',
  brandingLinks: '',
  finalFormat: '',
};

/** Required fields per step for validation */
const requiredPerStep: Record<number, (keyof BriefFormData)[]> = {
  0: ['clientName', 'projectName', 'startDate', 'deliveryDate'],
  1: ['mainGoal'],
  2: ['mainMessage'],
  3: [],
  4: [],
};

/** Componente principal */
export default function ProjectBriefForm(): JSX.Element {
  const [form, setForm] = useState<BriefFormData>(initialData);
  const [userName, setUserName] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [userBrief, setUserBrief] = useState<number | null>(null);
  const [userPlan, setUserPlan] = useState<string | null>(null);
  const [step, setStep] = useState<number>(0);
  const [animating, setAnimating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loadingPlan, setLoadingPlan] = useState<boolean>(false);
  const [loadingDownload, setLoadingDownload] = useState(false);


  const router = useRouter();

  useEffect(() => {
    // Cargar borrador y datos desde localStorage
    const saved = localStorage.getItem('briefnest');
    if (saved) {
      try {
        setForm(JSON.parse(saved));
      } catch {
        // ignore parse error
      }
    }

    const loggedUserName = localStorage.getItem('user_name');
    if (loggedUserName) setUserName(loggedUserName);

    const savedUserId = localStorage.getItem('user_id');
    if (savedUserId) setUserId(Number(savedUserId));

    const savedUserBrief = localStorage.getItem('user_brief');
    if (savedUserBrief) setUserBrief(Number(savedUserBrief));

    const savedUserPlan = localStorage.getItem('subscription_plan');
    if (savedUserPlan) setUserPlan(savedUserPlan);

    // Si hay token + userId, consultar info del plan en backend
    const token = localStorage.getItem('token');
    const userIdStr = localStorage.getItem('user_id');

    if (token && userIdStr) {
      fetchUserPlanAndBriefs(token, userIdStr);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUserPlanAndBriefs = async (token: string, userIdStr: string) => {
    setLoadingPlan(true);
    try {
      const res = await fetch(`http://localhost:5000/api/users/${userIdStr}/info-plan`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('No autorizado');
      const data = await res.json();
      if (data.subscription_plan) {
        setUserPlan(String(data.subscription_plan));
        localStorage.setItem('subscription_plan', String(data.subscription_plan));
      }
      const briefsCount =
        Number.isFinite(Number(data.briefs)) ? Number(data.briefs) :
        Number.isFinite(Number(data.briefs_remaining)) ? Number(data.briefs_remaining) :
        Number.isFinite(Number(data.briefs_left)) ? Number(data.briefs_left) :
        null;

      if (briefsCount !== null) {
        setUserBrief(briefsCount);
        localStorage.setItem('user_brief', String(briefsCount));
      }
    } catch (err) {
      // no hacemos nada, mantenemos lo que haya en localStorage
    } finally {
      setLoadingPlan(false);
    }
  };

  useEffect(() => {
    // Persistir borrador en localStorage
    try {
      localStorage.setItem('briefnest', JSON.stringify(form));
    } catch {
      // ignore
    }
  }, [form]);

  /** Validar los campos del paso actual. Devuelve true si OK */
  const validateStep = (s: number) => {
    const reqs = requiredPerStep[s] || [];
    const newErrors: Record<string, string> = {};
    reqs.forEach((k) => {
      if (!form[k] || (typeof form[k] === 'string' && (form[k] as string).trim() === '')) {
        newErrors[String(k)] = 'Este campo es obligatorio';
      }
    });
    setErrors((prev) => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  /** Validación completa al enviar */
  const validateAll = () => {
    const requiredAll: (keyof BriefFormData)[] = [
      ...requiredPerStep[0],
      ...requiredPerStep[1],
      ...requiredPerStep[2],
    ];
    const newErrors: Record<string, string> = {};
    requiredAll.forEach((k) => {
      if (!form[k] || (typeof form[k] === 'string' && (form[k] as string).trim() === '')) {
        newErrors[String(k)] = 'Este campo es obligatorio';
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /** Manejo universal de cambios (inputs, textarea, select y checkboxes) */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    const { name, value } = target;
    const type = (target as HTMLInputElement).type;
    const checked = (target as HTMLInputElement).checked;

    setErrors((prev) => ({ ...prev, [name]: '' })); // limpiar error al escribir

    if (type === 'checkbox') {
      const arr = (form[name as keyof BriefFormData] as unknown as string[]) || [];
      if (checked) {
        setForm((prev) => ({ ...prev, [name]: [...arr, value] } as unknown as BriefFormData));
      } else {
        setForm((prev) => ({ ...prev, [name]: arr.filter((v) => v !== value) } as unknown as BriefFormData));
      }
    } else {
      setForm((prev) => ({ ...prev, [name]: value } as unknown as BriefFormData));
    }
  };

  /** Navegación entre pasos con animación leve y validación */
  const nextStep = () => {
    if (!validateStep(step)) {
      const firstErrorKey = Object.keys(errors)[0];
      if (firstErrorKey) {
        const el = document.getElementsByName(firstErrorKey)[0] as HTMLElement | undefined;
        el?.focus();
      }
      return;
    }
    if (step < steps.length - 1) {
      setAnimating(true);
      setTimeout(() => {
        setStep((s) => s + 1);
        setAnimating(false);
      }, 220);
    }
  };
  const prevStep = () => {
    if (step > 0) {
      setAnimating(true);
      setTimeout(() => {
        setStep((s) => s - 1);
        setAnimating(false);
      }, 220);
    }
  };

  const handleSaveDraft = () => {
    localStorage.setItem('briefnest', JSON.stringify(form));
    toast('Borrador guardado');
  };

  /** Envío al backend y descarga del PDF retornado */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      alert('Debes iniciar sesión para enviar el brief.');
      return;
    }

    // Si sabemos que el usuario tiene 0 briefs, evitar el envío y sugerir compra
    if (userBrief !== null && userBrief <= 0) {
      if (confirm('No tienes briefs disponibles. ¿Quieres ir a Comprar Briefs?')) {
        router.push('/BuyBrief');
      }
      return;
    }

    if (!validateAll()) {
      const first = Object.keys(errors)[0];
      if (first) {
        const el = document.getElementsByName(first)[0] as HTMLElement | undefined;
        el?.focus();
      }
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

    setLoadingDownload(true)

    try {
      const response = await fetch('http://localhost:5000/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'briefnest.pdf';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);

        // If server doesn't decrement, update locally
        setUserBrief((prev) => {
          if (prev === null) return prev;
          const next = Math.max(0, prev - 1);
          localStorage.setItem('user_brief', String(next));
          return next;
        });

        alert('Brief enviado y PDF descargado.');
        localStorage.removeItem('briefnest');
        setForm(initialData);
        setStep(0);
        setErrors({});
      } else {
        const err = await response.json();
        alert(err?.message || 'Error al enviar el brief.');
      }
    } catch (error) {
      alert('Error de conexión. Intenta de nuevo.');
    } finally{
      setLoadingDownload(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push('/');
  };

  /** Pasos del formulario (mismos campos que tenías) */
  const steps = [
    {
      title: 'Información General',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Nombre del cliente" name="clientName" value={form.clientName} onChange={handleChange} required error={errors.clientName} />
          <Input label="Nombre del proyecto" name="projectName" value={form.projectName} onChange={handleChange} required error={errors.projectName} />
          <Input label="Fecha de inicio" name="startDate" type="date" value={form.startDate} onChange={handleChange} required error={errors.startDate} />
          <Input label="Fecha de entrega" name="deliveryDate" type="date" value={form.deliveryDate} onChange={handleChange} required error={errors.deliveryDate} />
          <Input label="Sitio web" name="website" type="url" value={form.website} onChange={handleChange} />
        </div>
      ),
    },

    {
      title: 'Objetivos y situación',
      content: (
        <div className="grid grid-cols-1 gap-4">
          <Textarea label="Objetivo principal" name="mainGoal" value={form.mainGoal} onChange={handleChange} required error={errors.mainGoal} />
          <Textarea label="Objetivos secundarios" name="secondaryGoals" value={form.secondaryGoals} onChange={handleChange} />
          <Textarea label="Situación actual" name="currentSituation" value={form.currentSituation} onChange={handleChange} />
          <Textarea label="Desafíos" name="challenges" value={form.challenges} onChange={handleChange} />
        </div>
      ),
    },
    {
      title: 'Audiencia y mensaje',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Textarea label="Audiencia objetivo" name="targetAudience" value={form.targetAudience} onChange={handleChange} />
          <Textarea label="Necesidades de la audiencia" name="audienceNeeds" value={form.audienceNeeds} onChange={handleChange} />
          <Textarea label="Mensaje principal" name="mainMessage" value={form.mainMessage} onChange={handleChange} required error={errors.mainMessage} />
          <Textarea label="Diferenciación" name="differentiation" value={form.differentiation} onChange={handleChange} />
          <Select label="Idioma" name="tone" value={form.tone} onChange={handleChange} options={getToneOptions(userPlan)} />
        </div>
      ),
    },
    {
      title: 'Canales y entregables',
      content: (
        <div className="grid grid-cols-1 gap-4">
          <CheckboxGroup label="Canales" name="channels" options={channelsOptions} selected={form.channels} onChange={handleChange} />
          <CheckboxGroup label="Formatos de entregables" name="deliverableFormats" options={deliverablesOptions} selected={form.deliverableFormats} onChange={handleChange} />
          <Textarea label="Entregables esperados" name="expectedDeliverables" value={form.expectedDeliverables} onChange={handleChange} />
          <Textarea label="Limitaciones" name="limitations" value={form.limitations} onChange={handleChange} />
        </div>
      ),
    },
    {
      title: 'Otros detalles',
      content: (
        <div className="grid grid-cols-1 gap-4">
          <Textarea label="Competidores" name="competitors" value={form.competitors} onChange={handleChange} />
          <Textarea label="Enlaces de referencia" name="references" value={form.references} onChange={handleChange} />
          <Input label="Presupuesto" name="budget" value={form.budget} onChange={handleChange} />
          <Textarea label="Recursos" name="resources" value={form.resources} onChange={handleChange} />
          <Textarea label="Hitos" name="milestones" value={form.milestones} onChange={handleChange} />
          <Input label="Fechas límite" name="deadlines" value={form.deadlines} onChange={handleChange} />
          <Textarea label="Restricciones" name="restrictions" value={form.restrictions} onChange={handleChange} />
          <Textarea label="Notas" name="notes" value={form.notes} onChange={handleChange} />
          <Input label="Enlaces de branding" name="brandingLinks" value={form.brandingLinks} onChange={handleChange} />
          <Input label="Formato final" name="finalFormat" value={form.finalFormat} onChange={handleChange} />
        </div>
      ),
    },
  ];

  /** ---------- Renderizado ---------- */
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

      {/* LAYOUT: form (prioridad) + preview (menos prominente) */}
      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* FORMULARIO: ocupa 2/3 en desktop */}
        <section className="lg:col-span-2">
          <div className="bg-white/6 border border-white/6 rounded-2xl p-6 shadow-xl">
            <header className="flex items-start justify-between mb-6 gap-4">
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-extrabold text-white">Crear Brief</h1>
                <p className="text-sm text-slate-300 mt-1">Completa el formulario paso a paso para generar tu brief en PDF.</p>
              </div>

              {/* Aquí muestro userPlan y userBrief — movidos desde la navbar */}
              <div className="flex flex-col items-end gap-2">
                <div className="flex gap-2 items-center">
                  <span className="text-xs text-slate-300">Usuario:</span>
                  <span className="px-2 py-1 rounded-full text-xs font-semibold bg-white/6">
                    {loadingPlan ? 'Cargando…' : userName ?? '—'}
                  </span>
                </div>
                <div className="flex gap-2 items-center">
                  <span className="text-xs text-slate-300">Plan:</span>
                  <span className="px-2 py-1 rounded-full text-xs font-semibold bg-white/6">
                    {loadingPlan ? 'Cargando…' : userPlan ?? '—'}
                  </span>
                </div>
                <div className="flex gap-2 items-center">
                  <span className="text-xs text-slate-300">Briefs restantes:</span>
                  <span className="px-2 py-1 rounded-full text-xs font-bold bg-white/6 text-white">
                    {userBrief ?? '—'}
                  </span>
                </div>
              </div>
            </header>

            <form onSubmit={handleSubmit} className={`space-y-6 ${animating ? 'opacity-60' : 'opacity-100'}`} noValidate>
              <div>
                <h2 className="text-lg font-semibold text-white/90 mb-3">{steps[step].title}</h2>
                <div className="bg-white rounded-lg p-5 border border-white/10">
                  {steps[step].content}
                </div>
              </div>

              {/* navegación y acciones */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-3">
                {/* Botón Guardar borrador */}
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="px-4 py-2 rounded-md bg-amber-400 text-slate-900 font-semibold hover:bg-amber-500 transition w-full md:w-auto"
                >
                  Guardar borrador
                </button>

                {/* Botones de navegación y envío */}
                <div className="flex gap-3 items-center w-full md:w-auto">
                  {step > 0 && (
                    <button
                      type="button"
                      onClick={prevStep}
                      className="px-4 py-2 rounded-md bg-gray-700 text-white hover:bg-gray-600 transition"
                    >
                      Anterior
                    </button>
                  )}

                  {step < steps.length - 1 ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      className="px-5 py-2 rounded-md bg-cyan-600 text-white font-semibold hover:bg-cyan-700 transition"
                    >
                      Siguiente
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-md bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition"
                      disabled={loadingDownload}
                    >
                      {loadingDownload ? 'Generando PDF…' : 'Enviar brief'}
                    </button>
                  )}
                </div>
              </div>

              {/* DownloadingView debajo del formulario, ocupando todo el ancho */}
              {loadingDownload && (
                <div className="mt-6 w-full">
                  <div className="w-full rounded-md border-2 border-gray-600 bg-gray-800 overflow-hidden shadow-lg">
                    <DownloadingView />
                  </div>
                </div>
              )}


            </form>
          </div>
        </section>

        {/* PREVIEW / PANEL DERECHO (menos prominente) */}
        <aside className="lg:col-span-1">
          <div className="bg-white/5 border border-white/6 rounded-2xl p-5 shadow-lg space-y-4">
            <div>
              <h3 className="text-sm text-slate-300">Resumen rápido</h3>
              <div className="mt-3">
                <div className="text-xs text-slate-400">Cliente</div>
                <div className="font-semibold text-white">{form.clientName || '—'}</div>

                <div className="text-xs text-slate-400 mt-3">Proyecto</div>
                <div className="font-semibold text-white">{form.projectName || '—'}</div>

                <div className="text-xs text-slate-400 mt-3">Objetivo principal</div>
                <div className="text-sm text-slate-200">{form.mainGoal ? truncate(form.mainGoal, 140) : '—'}</div>

                <div className="text-xs text-slate-400 mt-3">Mensaje principal</div>
                <div className="text-sm text-slate-200">{form.mainMessage ? truncate(form.mainMessage, 140) : '—'}</div>
              </div>
            </div>

            <div>
              <h4 className="text-sm text-slate-300 mb-2">Canales</h4>
              <div className="flex flex-wrap gap-2">
                {form.channels.length === 0 ? (
                  <span className="text-xs text-slate-400">—</span>
                ) : (
                  form.channels.map((c) => (
                    <span key={c} className="text-xs px-2 py-1 rounded-full bg-white/6">
                      {c}
                    </span>
                  ))
                )}
              </div>
            </div>

            <div>
              <h4 className="text-sm text-slate-300 mb-2">Entregables</h4>
              <div className="flex flex-wrap gap-2">
                {form.deliverableFormats.length === 0 ? (
                  <span className="text-xs text-slate-400">—</span>
                ) : (
                  form.deliverableFormats.map((d) => (
                    <span key={d} className="text-xs px-2 py-1 rounded-full bg-white/6">
                      {d}
                    </span>
                  ))
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-white/6">
              <div className="text-xs text-slate-400">Presupuesto</div>
              <div className="font-semibold text-white">{form.budget || '—'}</div>
              <div className="text-xs text-slate-400 mt-2">Fechas</div>
              <div className="text-sm text-slate-200">{formatRange(form.startDate, form.deliveryDate)}</div>
            </div>

            <div className="flex gap-2 mt-3">
              <button
                onClick={() => { navigator.clipboard?.writeText(JSON.stringify(form, null, 2)); toast('Brief copiado al portapapeles'); }}
                className="flex-1 text-center px-3 py-2 rounded-md bg-cyan-600 text-slate-900 font-semibold hover:opacity-95"
              >
                Copiar JSON
              </button>
              <button
                onClick={() => { setForm(initialData); localStorage.removeItem('briefnest'); toast('Formulario reiniciado'); }}
                className="px-3 py-2 rounded-md bg-white/5 text-white hover:bg-white/10"
              >
                Limpiar
              </button>
            </div>
          </div>

          <div className="mt-4 text-xs text-slate-400">
            {/* Ya no mostramos plan/briefs en la navbar; están en la tarjeta Crear Brief */}
            Acciones rápidas y resumen.
          </div>
        </aside>
      </div>
    </main>
  );
}

/** ---------- Helpers UI simples ---------- */
function toast(msg: string) {
  // minimal: usar alert para compatibilidad; cámbialo por tu toast si tienes
  setTimeout(() => alert(msg), 0);
}
function truncate(text: string, n = 100) {
  if (!text) return '';
  return text.length <= n ? text : text.slice(0, n - 1) + '…';
}
function formatRange(start: string, end: string) {
  if (!start && !end) return '—';
  if (start && end) return `${start} → ${end}`;
  return start || end || '—';
}

/** ---------- Componentes reutilizables (con soporte error) ---------- */

function Input({
  label,
  name,
  value,
  onChange,
  type = 'text',
  required = false,
  error,
}: {
  label: string;
  name: keyof BriefFormData;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  type?: string;
  required?: boolean;
  error?: string;
}) {
  return (
    <label className="flex flex-col">
      <span className="mb-2 text-sm font-medium text-slate-700">{label}{required && <span className="text-rose-500 ml-1">*</span>}</span>
      <input
        id={String(name)}
        name={String(name)}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        aria-invalid={!!error}
        className={`rounded-md border px-3 py-2 focus:outline-none bg-white text-slate-800 ${error ? 'border-rose-400 focus:ring-rose-300' : 'border-slate-200 focus:ring-cyan-400'}`}
      />
      {error && <div className="mt-1 text-xs text-rose-500">{error}</div>}
    </label>
  );
}

function Textarea({
  label,
  name,
  value,
  onChange,
  required = false,
  error,
}: {
  label: string;
  name: keyof BriefFormData;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  required?: boolean;
  error?: string;
}) {
  return (
    <label className="flex flex-col">
      <span className="mb-2 text-sm font-medium text-slate-700">{label}{required && <span className="text-rose-500 ml-1">*</span>}</span>
      <textarea
        id={String(name)}
        name={String(name)}
        rows={4}
        value={value}
        onChange={onChange as any}
        required={required}
        aria-invalid={!!error}
        className={`rounded-md border px-3 py-2 resize-y focus:outline-none bg-white text-slate-800 ${error ? 'border-rose-400 focus:ring-rose-300' : 'border-slate-200 focus:ring-cyan-400'}`}
      />
      {error && <div className="mt-1 text-xs text-rose-500">{error}</div>}
    </label>
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
    <label className="flex flex-col">
      <span className="mb-2 text-sm font-medium text-slate-700">{label}</span>
      <select
        id={String(name)}
        name={String(name)}
        value={value}
        onChange={onChange as any}
        className="rounded-md border px-3 py-2 focus:outline-none bg-white text-slate-800 border-slate-200 focus:ring-2 focus:ring-cyan-400"
      >
        <option value="">Selecciona</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </label>
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
      <legend className="mb-2 text-sm text-slate-700 font-medium">{label}</legend>
      <div className="flex flex-wrap gap-3">
        {options.map((opt) => {
          const id = `${String(name)}-${opt}`;
          return (
            <label
              key={opt}
              htmlFor={id}
              className={`flex items-center gap-2 px-3 py-2 rounded-md border ${selected.includes(opt) ? 'bg-cyan-600/10 border-cyan-500/20' : 'bg-white border-white/10'} cursor-pointer select-none`}
            >
              <input
                id={id}
                type="checkbox"
                name={String(name)}
                value={opt}
                checked={selected.includes(opt)}
                onChange={onChange as any}
                className="h-4 w-4"
              />
              <span className="text-sm text-slate-700">{opt}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
