import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";

import { apiService } from "../services/api";

export default function LoginNoteGym() {

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
    global?: string; 
  }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (errors.global) {
        setErrors({});
        setServerMessage("");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setErrors({});
    setStatus("loading");
    setServerMessage("");

    try {
      // Usando el nuevo servicio centralizado
      const token = await apiService.login(formData);

      setStatus("success");
      setServerMessage("¡Inicio de sesión exitoso!");
      
      localStorage.setItem('token', token);
      localStorage.setItem('username', formData.username);

      // Obtener el perfil para saber el rol
      try {
          const perfilData = await apiService.getProfile();
          localStorage.setItem('role', perfilData.role ? perfilData.role.toLowerCase() : 'user');
      } catch {
          localStorage.setItem('role', 'user');
      }

      setTimeout(() => {
          navigate('/dashboard'); 
      }, 1500);
        
    } catch (error) {
      console.error("Error en el login:", error);
      setStatus("error");
      const errorMessage = (error as Error).message || "Usuario o contraseña incorrectos.";
      setServerMessage(errorMessage);
      setErrors({ global: errorMessage }); 
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