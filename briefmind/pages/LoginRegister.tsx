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

async function resetPassword(name: string, email: string, newPassword: string) {
  const res = await fetch('http://localhost:5000/api/users/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, newPassword }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || 'Error al restablecer contraseña');
  }
  return res.json();
}

export default function LoginRegister() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [isReset, setIsReset] = useState(false);

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

    try {
      if (isReset) {
        // Validación de confirmación
        if (password !== confirmPassword) {
          setError('Las contraseñas no coinciden');
          return;
        }
        await resetPassword(name, email, password);
        setMessage('Contraseña restablecida con éxito. Ahora inicia sesión.');
        setIsReset(false);
        return;
      }

      if (!isLogin && password !== confirmPassword) {
        setError('Las contraseñas no coinciden');
        return;
      }

      if (isLogin) {
        const data = await loginUser(name, password);
        setMessage(`Bienvenido ${data.user.name}`);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user_id', data.user.id.toString());
        localStorage.setItem('user_name', data.user.name);
        localStorage.setItem('user_brief', data.user.briefs_available.toString());
        localStorage.setItem('subscription_plan', data.user.subscription_plan);

        if (data.user.isExpired == 'true') {
          router.push('/Checkout');
        } else if (data.user.briefs_available > 0) {
          router.push('/BriefForm');
        } else if (data.user.subscription_plan == "") {
          router.push('/Checkout');
        } else {
          router.push('/BuyBrief');
        }
      } else {
        const data = await registerUser(name, email, password);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user_id', data.user.id.toString());
        localStorage.setItem('user_name', data.user.name);
        localStorage.setItem('user_brief', data.user.briefs_available.toString());
        localStorage.setItem('subscription_plan', data.user.subscription_plan);
        setMessage('Usuario registrado con éxito.');
        router.push('/Checkout');
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
        className="relative z-10 bg-[#1e2a47] w-full max-w-lg p-10 rounded-2xl shadow-2xl backdrop-blur-xl border border-cyan-600/30"
      >
        <h2 className="text-4xl font-extrabold text-center mb-8 text-cyan-400">
          {isReset ? 'Restablecer contraseña' : isLogin ? 'Iniciar sesión' : 'Crear cuenta'}
        </h2>

        <div className="space-y-5">
          <input
            type="text"
            placeholder="Usuario"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            className="w-full text-lg px-5 py-4 bg-[#0F172A] text-white border border-gray-600 rounded-xl"
          />

          {(!isLogin || isReset) && (
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full text-lg px-5 py-4 bg-[#0F172A] text-white border border-gray-600 rounded-xl"
            />
          )}

          {!isReset && (
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full text-lg px-5 py-4 bg-[#0F172A] text-white border border-gray-600 rounded-xl"
            />
          )}

          {( (!isLogin && !isReset) || isReset ) && (
            <input
              type="password"
              placeholder="Confirmar contraseña"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              className="w-full text-lg px-5 py-4 bg-[#0F172A] text-white border border-gray-600 rounded-xl"
            />
          )}

          {isReset && (
            <input
              type="password"
              placeholder="Nueva contraseña"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full text-lg px-5 py-4 bg-[#0F172A] text-white border border-gray-600 rounded-xl"
            />
          )}
        </div>

        {error && <p className="text-red-500 mt-4 text-sm">{error}</p>}
        {message && <p className="text-green-400 mt-4 text-sm">{message}</p>}

        <button
          type="submit"
          className="w-full mt-8 bg-cyan-500 hover:bg-cyan-600 text-gray-900 text-lg font-semibold py-4 rounded-xl"
        >
          {isReset ? 'Restablecer contraseña' : isLogin ? 'Iniciar sesión' : 'Registrarse'}
        </button>

        {!isReset && (
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
        )}

        {isLogin && (
          <p className="text-center mt-4 text-sm">
            <button
              type="button"
              onClick={() => {
                setIsReset(true);
                setError('');
                setMessage('');
                setPassword('');
                setConfirmPassword('');
              }}
              className="text-yellow-400 hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </p>
        )}
      </form>
    </main>
  );
}

function AnimatedBackground() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 -z-10 bg-gradient-to-tr from-cyan-900 via-blue-900 to-indigo-900 animate-gradient-x"
      style={{ backgroundSize: '400% 400%', animation: 'gradientMove 15s ease infinite' }}
    />
  );
}
