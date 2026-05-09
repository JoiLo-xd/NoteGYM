import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { apiService } from "../services/api";

export default function LoginNoteGym() {

  const [formData, setFormData] = React.useState({ username: "", password: "" });
  const navigate = useNavigate();
  const [status, setStatus] = React.useState("idle");
  const [serverMessage, setServerMessage] = React.useState("");
  const [isBlocked, setIsBlocked] = React.useState(false);
  const [errors, setErrors] = React.useState<{ username?: string; password?: string; global?: string }>({});

  // Help ticket modal
  const [showHelp, setShowHelp] = React.useState(false);
  const [helpMessage, setHelpMessage] = React.useState("");
  const [helpStatus, setHelpStatus] = React.useState<"idle" | "loading" | "success" | "error">("idle");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors.global) { setErrors({}); setServerMessage(""); }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setStatus("loading");
    setServerMessage("");
    setIsBlocked(false);

    try {
      const token = await apiService.login(formData);
      setStatus("success");
      setServerMessage("¡Inicio de sesión exitoso!");
      localStorage.setItem('token', token);
      localStorage.setItem('username', formData.username);
      try {
        const perfilData = await apiService.getProfile();
        localStorage.setItem('role', perfilData.role ? perfilData.role.toLowerCase() : 'user');
      } catch {
        localStorage.setItem('role', 'user');
      }
      setTimeout(() => { navigate('/dashboard'); }, 1500);
    } catch (error) {
      console.error("Error en el login:", error);
      setStatus("error");
      const raw = (error as Error).message || "";
      let msg = "Usuario o contraseña incorrectos.";
      if (raw === "ACCOUNT_BLOCKED") {
        msg = "🔒 Tu cuenta está bloqueada por demasiados intentos fallidos. Contacta con un administrador.";
        setIsBlocked(true);
      } else if (raw.startsWith("WRONG_PASSWORD:")) {
        const remaining = raw.split(":")[1];
        msg = `❌ Contraseña incorrecta. Te quedan ${remaining} intento${remaining === "1" ? "" : "s"} antes de que tu cuenta sea bloqueada.`;
      } else if (raw === "USER_NOT_FOUND") {
        msg = "No existe ninguna cuenta con ese nombre de usuario.";
      }
      setServerMessage(msg);
      setErrors({ global: msg });
    }
  };

  const handleSendHelp = async () => {
    if (!helpMessage.trim() || !formData.username.trim()) return;
    setHelpStatus("loading");
    try {
      await apiService.sendSupportTicket(formData.username, helpMessage);
      setHelpStatus("success");
      setHelpMessage("");
    } catch {
      setHelpStatus("error");
    }
  };

  return (
    <div className="relative w-full max-w-md">
      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4 p-8 bg-white shadow-2xl rounded-lg">
        <h2 className="text-2xl font-semibold text-center mb-4 text-gray-800">Log in</h2>

        {status === "success" && (
          <div className="p-3 rounded bg-green-100 border border-green-400 text-green-700 text-sm text-center">✅ {serverMessage}</div>
        )}
        {(status === "error" || errors.global) && (
          <div className="p-3 rounded bg-red-100 border border-red-400 text-red-700 text-sm text-center animate-pulse">⚠️ {serverMessage}</div>
        )}

        <div className="flex flex-col gap-2">
          <Label htmlFor="username" className="text-gray-700 text-black">UserName</Label>
          <Input id="username" name="username" placeholder="Introduce tu nombre de usuario" type="text" value={formData.username} onChange={handleChange} required />
          {errors.username && <span className="text-red-500 text-sm">{errors.username}</span>}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="password" className="text-gray-700 text-black">Password</Label>
          <Input id="password" name="password" placeholder="Introduce tu contraseña" type="password" value={formData.password} onChange={handleChange} required />
          {errors.password && <span className="text-red-500 text-sm">{errors.password}</span>}
        </div>

        <div className="flex gap-2 mt-4">
          <Button className={`flex-1 text-black ${status === 'loading' ? 'opacity-70 cursor-not-allowed' : ''}`} style={{ backgroundColor: "#ed8147ff" }} type="submit" disabled={status === 'loading'}>
            {status === 'loading' ? "Cargando..." : "Enviar"}
          </Button>
          <Button className="flex-1 text-black" type="reset" variant="outline" style={{ backgroundColor: "#bbbfbfff" }}
            onClick={() => { setFormData({ username: "", password: "" }); setStatus("idle"); setErrors({}); setServerMessage(""); setIsBlocked(false); }}>
            Borrar
          </Button>
        </div>

        <div className="mt-4 text-center">
          <span className="text-gray-600">¿No tienes una cuenta? </span><br/>
          <Link to="/newUserGym" className="text-blue-500 hover:underline">Regístrate aquí</Link>
        </div>
      </form>

      {/* Botón flotante de ayuda — solo visible si la cuenta está bloqueada */}
      {isBlocked && (
        <button
          onClick={() => setShowHelp(true)}
          className="fixed bottom-8 right-8 w-14 h-14 bg-[#FF5722] hover:bg-[#F4511E] text-white rounded-full shadow-[0_4px_20px_0_rgba(255,87,34,0.5)] flex items-center justify-center transition-all duration-300 hover:-translate-y-1 z-50 animate-bounce"
          title="Pedir ayuda al administrador"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      )}

      {/* Modal de ayuda */}
      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-end justify-end p-6 bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 animate-in slide-in-from-bottom-4 duration-300">
            {helpStatus === "success" ? (
              <div className="text-center py-4">
                <span className="text-5xl mb-4 block">✅</span>
                <h3 className="text-lg font-bold text-gray-800 mb-2">¡Mensaje enviado!</h3>
                <p className="text-gray-500 text-sm mb-5">Un administrador revisará tu solicitud y desbloqueará tu cuenta pronto.</p>
                <button onClick={() => { setShowHelp(false); setHelpStatus("idle"); }} className="w-full py-2.5 bg-[#FF5722] text-white font-bold rounded-xl hover:bg-[#F4511E] transition">Cerrar</button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">¿Necesitas ayuda?</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Escribe un mensaje al administrador</p>
                  </div>
                  <button onClick={() => setShowHelp(false)} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>
                </div>
                <p className="text-xs text-gray-400 mb-3">Usuario: <span className="font-semibold text-gray-700">{formData.username || "desconocido"}</span></p>
                <textarea
                  value={helpMessage}
                  onChange={e => setHelpMessage(e.target.value)}
                  placeholder="Explica tu situación brevemente..."
                  rows={4}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#FF5722] text-sm font-medium text-gray-800 resize-none mb-3"
                />
                {helpStatus === "error" && <p className="text-red-500 text-xs mb-2">Error al enviar. Inténtalo de nuevo.</p>}
                <button
                  onClick={handleSendHelp}
                  disabled={helpStatus === "loading" || !helpMessage.trim()}
                  className="w-full py-3 bg-[#FF5722] text-white font-bold rounded-xl hover:bg-[#F4511E] transition disabled:opacity-50 shadow-md"
                >
                  {helpStatus === "loading" ? "Enviando..." : "Enviar mensaje"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}