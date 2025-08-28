'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CheckoutSuccess() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [briefsUpdated, setBriefsUpdated] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('user_id');

    if (!token || !userId) {
      router.push('/LoginRegister');
      return;
    }

    // Refrescar datos del usuario
    fetch(`http://localhost:5000/api/users/${userId}/info-plan`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Error al cargar datos');
        return res.json();
      })
      .then((data) => {
        setBriefsUpdated(data.briefs_available - data.briefs_used);
      })
      .catch(() => {
        setBriefsUpdated(null);
      })
      .finally(() => setLoading(false));
  }, [router]);

  return (
    <main className="flex flex-col items-center justify-center h-screen text-center p-4 bg-gradient-to-br from-[#0F172A] to-[#1a1f36] text-white">
      <h1 className="text-4xl font-bold mb-4 text-cyan-400">¡Pago Exitoso! 🎉</h1>
      {loading ? (
        <p className="text-lg">Cargando información de tu cuenta...</p>
      ) : (
        <p className="text-lg mb-6">
          Gracias por tu compra. Ahora tienes{' '}
          <span className="font-bold text-green-400">{briefsUpdated ?? 'desconocido'}</span> briefs disponibles.
        </p>
      )}
      <button
        onClick={() => router.push('/')}
        className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl shadow-md transition"
      >
        Ir al Inicio
      </button>
    </main>
  );
}
