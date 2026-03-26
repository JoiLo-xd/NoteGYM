import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";

export default function LoginNoteGym() {

  const API_BASE_URL = "http://localhost:8080";

  const [formData, setFormData] = React.useState({
    username: "",
    password: "",
  });

  const navigate = useNavigate();

  const [status, setStatus] = React.useState("idle"); 
  const [serverMessage, setServerMessage] = React.useState("");

  const [errors, setErrors] = React.useState<{
    username?: string;
    password?: string;
    global?: string; // Usaremos 'global' para el mensaje del servidor
  }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // limpiar errores al escribir
    if (errors.global) {
        setErrors({});
        setServerMessage("");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Resetear estados antes de enviar
    setErrors({});
    setStatus("loading");
    setServerMessage("");

    try {
      const LOGIN_URL = API_BASE_URL + "/auth/login";

      const res = await fetch(LOGIN_URL, { 
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const dataText = await res.text();

      if (res.ok) {
        // Código HTTP 200-299: Éxito
        setStatus("success");
        setServerMessage("¡Inicio de sesión exitoso!");
        
        // Asignar rol por defecto a 'user'. Para admin temporalmente usamos el botón Bypass inferior
        localStorage.setItem('role', 'user');

        // Aquí guardamos el token devuelto
        localStorage.setItem('token', dataText);
        localStorage.setItem('username', formData.username);

        setTimeout(() => {
            navigate('/dashboard'); // Redirige al dashboard
        }, 1500); 
        
      } else {
        setStatus("error");
        const errorMessage = dataText || "Usuario o contraseña incorrectos.";
        setServerMessage(errorMessage);
        setErrors({ global: errorMessage }); 
      }
    } catch (error) {
      console.error("Error en la conexión:", error);
      setStatus("error");
      setServerMessage("Error de conexión con el servidor. Inténtalo de nuevo.");
      setErrors({ global: "Error de conexión con el servidor." }); 
    }
  };

  const handleAdminBypass = () => {
    setStatus("success");
    setServerMessage("¡Modo Admin activo (Bypass)!");
    localStorage.setItem('role', 'admin');
    localStorage.setItem('token', 'token-admin-prueba');
    localStorage.setItem('username', 'Admin-Test');
    
    setTimeout(() => {
        navigate('/dashboard'); 
    }, 1000);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-xs flex flex-col gap-4 p-6 bg-white shadow-2xl rounded-lg"
    >
      <h2 className="text-2xl font-semibold text-center mb-4 text-gray-800">
        Log in
      </h2>

      {/* 4. MENSAJES DE FEEDBACK GLOBAL */}
      {status === "success" && (
        <div className="p-3 rounded bg-green-100 border border-green-400 text-green-700 text-sm text-center">
          ✅ {serverMessage}
        </div>
      )}
      
      {(status === "error" || errors.global) && (
        <div className="p-3 rounded bg-red-100 border border-red-400 text-red-700 text-sm text-center animate-pulse">
          ⚠️ {serverMessage}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="username" className="text-gray-700 text-black">
          UserName
        </Label>
        <Input
          id="username"
          name="username"
          placeholder="Introduce tu nombre de usuario"
          type="text"
          value={formData.username} // VINCULAR ESTADO
          onChange={handleChange}     // MANEJADOR DE CAMBIO
          required
        />
        {errors.username && (
          <span className="text-red-500 text-sm">{errors.username}</span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="password" className="text-gray-700 text-black">
          Password
        </Label>
        <Input
          id="password"
          name="password"
          placeholder="Introduce tu contraseña"
          type="password"
          value={formData.password} // VINCULAR ESTADO
          onChange={handleChange}     // MANEJADOR DE CAMBIO
          required
        />
        {errors.password && (
          <span className="text-red-500 text-sm">{errors.password}</span>
        )}
      </div>

      <div className="flex gap-2 mt-4">
        <Button
          className={`flex-1 text-black ${status === 'loading' ? 'opacity-70 cursor-not-allowed' : ''}`}
          style={{ backgroundColor: "#ed8147ff" }}
          type="submit"
          disabled={status === 'loading'} // Deshabilita durante la carga
        >
          {status === 'loading' ? "Cargando..." : "Enviar"}
        </Button>
        <Button 
          className="flex-1 text-black" 
          type="reset" 
          variant="outline"
          style={{ backgroundColor: "#bbbfbfff" }}
          onClick={() => { // Limpia estados al resetear
            setFormData({ username: "", password: "" });
            setStatus("idle");
            setErrors({});
            setServerMessage("");
          }}
        >
          Borrar
        </Button>
      </div>

      <div className="mt-2">
        <Button
          type="button"
          className="w-full text-white bg-gray-800 hover:bg-gray-900"
          onClick={handleAdminBypass}
        >
          Entrar como Admin (Prueba)
        </Button>
      </div>

      <div className="mt-4 text-center">
    <span className="text-gray-600">  ¿No tienes una cuenta? </span><br/>
    <Link to="/newUserGym" className="text-blue-500 hover:underline">
      Regístrate aquí
    </Link>
      </div>

    </form>
  );
}