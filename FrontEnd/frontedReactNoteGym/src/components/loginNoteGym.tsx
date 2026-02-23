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
      const LOGIN_URL = API_BASE_URL + "/api/user/login";

      const res = await fetch(LOGIN_URL, { 
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      console.log("Respuesta del backend (Login):", data);

      if (res.ok) {
        // Código HTTP 200-299: Éxito
        setStatus("success");
        setServerMessage(data.message || "¡Inicio de sesión exitoso!");
        // Aquí debes guardar el token de autenticación (JWT) si lo hay
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.username);
        localStorage.setItem('password', data.password);
        localStorage.setItem('name', data.name);
        localStorage.setItem('role', data.role);


        //alert(localStorage.getItem('username') + " " + localStorage.getItem('password')); // PRUEBA DE ALMACENAMIENTO
        
        setTimeout(() => {
            navigate('/dashboard'); // Redirige al dashboard
        }, 1500); 
        
      } else {
        // Código HTTP 4xx o 5xx: Error (credenciales incorrectas, etc.)
        setStatus("error");
        
        // El backend debe enviar un mensaje de error claro (ej: 'Usuario o contraseña incorrectos')
        const errorMessage = data.message || data.error || "Usuario o contraseña incorrectos.";
        setServerMessage(errorMessage);
        setErrors({ global: errorMessage }); 
      }
    } catch (error) {
      // Error de red (servidor caído o problema de CORS)
      console.error("Error en la conexión:", error);
      setStatus("error");
      setServerMessage("Error de conexión con el servidor. Inténtalo de nuevo.");
      setErrors({ global: "Error de conexión con el servidor." }); 
    }
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

      <div className="mt-4 text-center">
    <span className="text-gray-600">  ¿No tienes una cuenta? </span><br/>
    <Link to="/newUserGym" className="text-blue-500 hover:underline">
      Regístrate aquí
    </Link>
      </div>

    </form>
  );
}