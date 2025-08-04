'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

async function loginUser(name: string, password: string) {
  const res = await fetch('http://localhost:5000/api/users/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, password }),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || 'Error en login');
  }
  return res.json();
}

async function registerUser(name: string, email: string, password: string) {
  const res = await fetch('http://localhost:5000/api/users/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || 'Error en registro');
  }
  return res.json();
}

export default function LoginRegister() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!isLogin && password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    try {
      if (isLogin) {
        const data = await loginUser(name, password);
        setMessage(`Bienvenido ${data.user.name}`);

        localStorage.setItem('token', data.token);
        localStorage.setItem('user_id', data.user.id.toString());
        localStorage.setItem('user_name', data.user.name);
        localStorage.setItem('user_brief', data.user.briefs_available.toString());
        localStorage.setItem('subscription_plan', data.user.subscription_plan);

        // Lógica para redirigir según estado del plan y briefs
        if (data.user.isExpired) {
          // Plan expirado → debe pagar mes nuevo
          router.push('/Checkout');
        } else if (data.user.briefsRemaining > 0) {
          // Plan vigente y briefs disponibles → puede usar briefs
          router.push('/BriefForm');
        } else {
          // Plan vigente pero sin briefs → comprar briefs extra
          router.push('/BuyBrief');
        }
      } else {
        const data = await registerUser(name, email, password);
        setMessage('Usuario registrado con éxito. Ahora puedes iniciar sesión.');
        setIsLogin(true);
        setName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <main className="relative min-h-screen bg-[#0F172A] text-white font-sans flex items-center justify-center px-4">
      <AnimatedBackground />

      <form
        onSubmit={handleSubmit}
        className="relative z-10 bg-[#1e2a47] w-full max-w-lg p-10 rounded-2xl shadow-2xl backdrop-blur-xl border border-cyan-600/30 transition-all duration-300"
      >
        <h2 className="text-4xl font-extrabold text-center mb-8 select-none text-cyan-400">
          {isLogin ? 'Iniciar sesión' : 'Crear cuenta'}
        </h2>

        <div className="space-y-5">
          <input
            type="text"
            placeholder="Usuario"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            className="w-full text-lg px-5 py-4 bg-[#0F172A] text-white border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all duration-200"
          />

          {!isLogin && (
            <>
              <input
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full text-lg px-5 py-4 bg-[#0F172A] text-white border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all duration-200"
              />
              <input
                type="password"
                placeholder="Confirmar contraseña"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                className="w-full text-lg px-5 py-4 bg-[#0F172A] text-white border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all duration-200"
              />
            </>
          )}

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="w-full text-lg px-5 py-4 bg-[#0F172A] text-white border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all duration-200"
          />
        </div>

        {error && (
          <p className="text-red-500 mt-4 text-sm animate-shake">{error}</p>
        )}
        {message && (
          <p className="text-green-400 mt-4 text-sm animate-fadeIn">{message}</p>
        )}

        <button
          type="submit"
          className="w-full mt-8 bg-cyan-500 hover:bg-cyan-600 text-gray-900 text-lg font-semibold py-4 rounded-xl shadow-md transition-transform hover:scale-105 duration-300"
        >
          {isLogin ? 'Iniciar sesión' : 'Registrarse'}
        </button>

        <p className="text-center mt-6 text-gray-400 text-sm">
          {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}{' '}
          <button
            type="button"
            onClick={() => {
              setError('');
              setMessage('');
              setConfirmPassword('');
              setIsLogin(!isLogin);
            }}
            className="text-cyan-400 hover:underline font-medium"
          >
            {isLogin ? 'Regístrate aquí' : 'Inicia sesión'}
          </button>
        </p>
      </form>

      <style jsx>{`
        @keyframes shake {
          0% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          50% { transform: translateX(4px); }
          75% { transform: translateX(-4px); }
          100% { transform: translateX(0); }
        }

        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
      `}</style>
    </main>
  );
}

function AnimatedBackground() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 -z-10 bg-gradient-to-tr from-cyan-900 via-blue-900 to-indigo-900 animate-gradient-x"
      style={{
        backgroundSize: '400% 400%',
        animation: 'gradientMove 15s ease infinite',
      }}
    />
  );
}
