import React, { useRef, useState } from 'react';
import { Eye, EyeOff, Lock, User, ArrowRight, CheckCircle2, Link2Off, MailCheck, Mail } from 'lucide-react';
import { AnimatedEco, AnimatedEcoHandle } from './AnimatedEco';

/**
 * Pantalla de ingreso a ECO (usuario + contraseña asignados por Administración, §16.1.1).
 *
 * Paso 1 «Ingresar»: usuario y contraseña. «¿Olvidaste tu contraseña?» lleva a pedir un enlace por
 * correo (como en producción); si no llega, Administración asigna una contraseña temporal.
 * Paso 2 «Crea tu contraseña»: solo cuando la cuenta tiene `must_change_password` (primer ingreso o
 * contraseña temporal). Mínimo 8 caracteres y confirmación.
 *
 * Prototipo: cualquier usuario entra; la contraseña «temporal» muestra el paso 2.
 */
interface LoginScreenProps {
  onSignedIn: () => void;
  /**
   * Paso inicial. 'link-expired' = el enlace de crear/recuperar contraseña ya se usó o venció (pantalla
   * de producción «Este enlace ya no sirve»). En el prototipo: `?login=enlace-vencido`.
   */
  initialStep?: 'login' | 'link-expired';
}

type LoginStep = 'login' | 'new-password' | 'link-expired' | 'request-link' | 'link-sent';

const inputBase =
  'w-full pl-10 pr-3 py-3 rounded-xl border bg-white/90 text-sm text-[#0f172a] placeholder:text-[#94a3b8] shadow-[0_1px_2px_rgba(80,31,146,0.06)] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#501f92]/25 focus:border-[#501f92] transition-colors';

export const LoginScreen: React.FC<LoginScreenProps> = ({ onSignedIn, initialStep = 'login' }) => {
  const [step, setStep] = useState<LoginStep>(initialStep);
  const [linkIdentity, setLinkIdentity] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  // ECO grande en el panel (computador) y pequeño sobre el formulario (celular)
  const ecoPanel = useRef<AnimatedEcoHandle>(null);
  const ecoMobile = useRef<AnimatedEcoHandle>(null);
  const eco = { current: { wink: () => { ecoPanel.current?.wink(); ecoMobile.current?.wink(); }, look: () => { ecoPanel.current?.look(); ecoMobile.current?.look(); } } };
  // ECO guiña antes de entrar (con movimiento reducido entra de una)
  const signInWithWink = () => {
    eco.current?.wink();
    window.setTimeout(onSignedIn, 650);
  };
  const fail = (message: string) => {
    setError(message);
    eco.current?.look();
  };

  const handleLogin = (event: React.FormEvent) => {
    event.preventDefault();
    if (!username.trim() || !password) {
      fail('Escribe tu usuario y tu contraseña.');
      return;
    }
    setError(null);
    if (password.trim().toLowerCase() === 'temporal') {
      setStep('new-password');
      setPassword('');
      eco.current?.wink();
      return;
    }
    signInWithWink();
  };

  const handleNewPassword = (event: React.FormEvent) => {
    event.preventDefault();
    if (newPassword.length < 8) {
      fail('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      fail('Las contraseñas no coinciden.');
      return;
    }
    setError(null);
    signInWithWink();
  };

  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden bg-gradient-to-br from-[#f3eefe] via-[#faf8ff] to-[#ece4ff]">
      {/* Fondo degradado a pantalla completa en la paleta ECO */}
      <div aria-hidden="true" className="pointer-events-none absolute -top-48 -left-40 w-[620px] h-[620px] rounded-full bg-[#8a4dff]/25 blur-[140px]" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-48 -right-40 w-[560px] h-[560px] rounded-full bg-[#c9b7ff]/45 blur-[140px]" />

      <div className="relative min-h-[100dvh] w-full max-w-[1280px] mx-auto grid lg:grid-cols-2 gap-8 lg:gap-16 items-center px-4 py-8 sm:px-8 lg:px-12">
        {/* Panel de marca (computador): morado redondeado con ECO trabajando */}
        <aside className="hidden lg:flex relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#6a2fc0] via-[#501f92] to-[#2a0f52] text-white p-10 xl:p-12 flex-col h-[min(720px,calc(100vh-64px))] shadow-[0_40px_90px_-40px_rgba(80,31,146,0.6)]">
          <div aria-hidden="true" className="absolute -top-24 -right-16 w-80 h-80 rounded-full bg-[#a777ff]/40 blur-[100px]" />
          <div aria-hidden="true" className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-48 rounded-full bg-[#d4ff4a]/15 blur-[80px]" />
          <div className="relative space-y-3 max-w-md">
            <p className="text-[44px] xl:text-[50px] leading-none text-[#d4ff4a] italic tracking-tight" style={{ fontFamily: 'var(--font-family-accent)', fontWeight: 600 }}>
              ¡Hola, soy ECO!
            </p>
            <p className="text-[22px] xl:text-[26px] font-extrabold leading-tight tracking-tight">
              Somos el <span className="text-[#d4ff4a]">E</span>spacio de <span className="text-[#d4ff4a]">C</span>reación y <span className="text-[#d4ff4a]">O</span>peraciones de Uhura.
            </p>
            <p className="text-sm text-[#e4dcff]/90">Aquí planeas, ejecutas y ves avanzar el trabajo de todo el equipo.</p>
          </div>
          {/* ECO animado: entra caminando al panel, pasea, guiña y te mira si falta algo */}
          <div className="relative flex-1 min-h-0 flex items-end justify-center pt-6">
            <div aria-hidden="true" className="absolute bottom-3 left-1/2 -translate-x-1/2 w-56 h-6 rounded-[50%] bg-[#0d0718]/35 blur-md" />
            <AnimatedEco ref={ecoPanel} height={340} enterFrom={-420} />
          </div>
        </aside>

        {/* Formulario sobre el fondo, sin tarjeta */}
        <main className="flex flex-col items-center justify-center py-6">
        <div className="w-full max-w-sm space-y-7">
          <div className="flex items-center justify-center">
            <img src="/brand/eco-icon-128.png" alt="ECO" className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl shadow-sm" />
          </div>

          {/* ECO animado: entra caminando, guiña al ingresar y te mira si falta algo */}
          <div className="lg:hidden flex justify-center pb-2">
            <AnimatedEco ref={ecoMobile} height={128} />
          </div>

          {step === 'link-expired' ? (
            // Enlace de un solo uso ya usado o vencido (producción): pedir otro o volver a ingresar
            <div className="space-y-6 text-center" role="alert" aria-live="polite">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-[#fef3c7] text-[#92400e] flex items-center justify-center">
                <Link2Off className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h1 className="text-[26px] font-extrabold text-[#0f172a] tracking-tight">Este enlace ya no sirve</h1>
                <p className="text-sm text-[#64748b] leading-relaxed">El enlace ya se usó o venció. Pide uno nuevo y úsalo apenas te llegue.</p>
              </div>
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => { setError(null); setStep('request-link'); }}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-[#501f92] hover:bg-[#3d1572] active:scale-[0.99] text-white text-sm font-bold shadow-sm transition-all cursor-pointer"
                >
                  Pedir un enlace nuevo <ArrowRight className="w-4 h-4" />
                </button>
                <button type="button" onClick={() => { setError(null); setStep('login'); }} className="text-sm font-semibold text-[#501f92] hover:underline cursor-pointer">
                  Volver a ingresar
                </button>
              </div>
            </div>
          ) : step === 'request-link' ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!linkIdentity.trim()) { fail('Escribe tu correo o tu usuario.'); return; }
                setError(null);
                eco.current?.wink();
                setStep('link-sent');
              }}
              noValidate
              className="space-y-6"
              aria-label="Olvidaste tu contraseña"
            >
              <div className="space-y-1.5 text-center">
                <h1 className="text-[26px] font-extrabold text-[#0f172a] tracking-tight">¿Olvidaste tu contraseña?</h1>
                <p className="text-sm text-[#64748b] leading-relaxed">Escribe tu correo corporativo o tu usuario de ingreso y te enviamos un enlace para crear una contraseña nueva.</p>
              </div>
              <label className="block space-y-1.5">
                <span className="text-xs font-semibold text-[#334155]">Correo o usuario</span>
                <span className="relative block">
                  <Mail className="w-4 h-4 text-[#94a3b8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    autoComplete="username"
                    autoCapitalize="none"
                    spellCheck={false}
                    value={linkIdentity}
                    onChange={(e) => setLinkIdentity(e.target.value)}
                    placeholder="Correo o usuario"
                    className={`${inputBase} ${error ? 'border-[#dc2626]' : 'border-[#e4dcf5]'}`}
                  />
                </span>
              </label>
              {error && <p role="alert" className="text-xs font-semibold text-[#dc2626]">{error}</p>}
              <div className="space-y-3 text-center">
                <button type="submit" className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-[#501f92] hover:bg-[#3d1572] active:scale-[0.99] text-white text-sm font-bold shadow-sm transition-all cursor-pointer">
                  Enviar enlace <ArrowRight className="w-4 h-4" />
                </button>
                <button type="button" onClick={() => { setError(null); setStep('login'); }} className="text-sm font-semibold text-[#501f92] hover:underline cursor-pointer">
                  Volver a ingresar
                </button>
              </div>
            </form>
          ) : step === 'link-sent' ? (
            // Mismo mensaje exista o no la cuenta (no revelar usuarios)
            <div className="space-y-6 text-center" role="status">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-[#ecfdf5] text-[#047857] flex items-center justify-center">
                <MailCheck className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h1 className="text-[26px] font-extrabold text-[#0f172a] tracking-tight">Revisa tu correo</h1>
                <p className="text-sm text-[#64748b] leading-relaxed">
                  Si hay una cuenta con ese usuario, te enviamos un enlace nuevo. Sirve una sola vez y vence pronto: úsalo apenas te llegue.
                </p>
              </div>
              <div className="space-y-3">
                <button type="button" onClick={() => setStep('login')} className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-white border border-[#ddd6fe] hover:bg-[#faf5ff] text-[#501f92] text-sm font-bold transition-all cursor-pointer">
                  Volver a ingresar
                </button>
                <p className="text-xs text-[#94a3b8]">¿No te llegó? Revisa spam o pídeselo a Administración.</p>
              </div>
            </div>
          ) : step === 'login' ? (
            <form onSubmit={handleLogin} noValidate className="space-y-6" aria-label="Ingresar a ECO">
              <div className="space-y-1.5 text-center">
                <h1 className="text-[26px] font-extrabold text-[#0f172a] tracking-tight">Hola de nuevo 👋</h1>
              </div>

              <div className="space-y-4">
                <label className="block space-y-1.5">
                  <span className="text-xs font-semibold text-[#334155]">Usuario</span>
                  <span className="relative block">
                    <User className="w-4 h-4 text-[#94a3b8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      autoComplete="username"
                      autoCapitalize="none"
                      spellCheck={false}
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="ej. paola.monsalve"
                      className={`${inputBase} ${error && !username.trim() ? 'border-[#dc2626]' : 'border-[#e4dcf5]'}`}
                    />
                  </span>
                </label>

                <label className="block space-y-1.5">
                  <span className="text-xs font-semibold text-[#334155]">Contraseña</span>
                  <span className="relative block">
                    <Lock className="w-4 h-4 text-[#94a3b8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`${inputBase} pr-11 ${error && !password ? 'border-[#dc2626]' : 'border-[#e4dcf5]'}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-[#64748b] hover:bg-[#f1f5f9] cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </span>
                </label>

                <div className="flex items-start justify-between gap-3">
                  {error ? <p role="alert" className="text-xs font-semibold text-[#dc2626]">{error}</p> : <span />}
                  <button
                    type="button"
                    onClick={() => { setError(null); setStep('request-link'); }}
                    className="shrink-0 text-xs font-semibold text-[#501f92] hover:underline cursor-pointer"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-[#501f92] hover:bg-[#3d1572] active:scale-[0.99] text-white text-sm font-bold shadow-sm transition-all cursor-pointer"
                >
                  Ingresar <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleNewPassword} noValidate className="space-y-6" aria-label="Crear contraseña">
              <div className="space-y-1.5 text-center">
                <h1 className="text-[26px] font-extrabold text-[#0f172a] tracking-tight">Crea tu contraseña</h1>
                <p className="text-sm text-[#64748b]">
                  Entraste con una contraseña temporal. Elige una nueva para seguir; solo tú la conocerás.
                </p>
              </div>

              <div className="space-y-4">
                <label className="block space-y-1.5">
                  <span className="text-xs font-semibold text-[#334155]">Nueva contraseña</span>
                  <span className="relative block">
                    <Lock className="w-4 h-4 text-[#94a3b8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      autoComplete="new-password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={`${inputBase} border-[#e4dcf5]`}
                    />
                  </span>
                </label>
                <label className="block space-y-1.5">
                  <span className="text-xs font-semibold text-[#334155]">Confírmala</span>
                  <span className="relative block">
                    <Lock className="w-4 h-4 text-[#94a3b8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`${inputBase} border-[#e4dcf5]`}
                    />
                  </span>
                </label>
                <p className={`flex items-center gap-1.5 text-xs ${newPassword.length >= 8 ? 'text-[#047857]' : 'text-[#64748b]'}`}>
                  <CheckCircle2 className="w-3.5 h-3.5" /> Mínimo 8 caracteres
                </p>
                {error && <p role="alert" className="text-xs font-semibold text-[#dc2626]">{error}</p>}
              </div>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-[#501f92] hover:bg-[#3d1572] active:scale-[0.99] text-white text-sm font-bold shadow-sm transition-all cursor-pointer"
              >
                Guardar y entrar <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

        </div>
        <p className="mt-10 text-xs text-[#94a3b8]">By Uhura Group · ECO</p>
        </main>
      </div>
    </div>
  );
};
