import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";

export default function LoginNoteGym() {
  const [errors, setErrors] = React.useState<{
    username?: string;
    email?: string;
  }>({});

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Validación básica
    const newErrors: typeof errors = {};
    setErrors(newErrors);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-xs flex flex-col gap-4 p-6 bg-white shadow-2xl rounded-lg"
    >
      <h2 className="text-2xl font-semibold text-center mb-4 text-gray-800">
        Iniciar Sesión
      </h2>

      <div className="flex flex-col gap-2">
        <Label htmlFor="username" className="text-gray-700 text-black">
          Nombre de usuario
        </Label>
        <Input
          id="username"
          name="username"
          placeholder="Introduce tu nombre de usuario"
          type="text"
          required
        />
        {errors.username && (
          <span className="text-red-500 text-sm">{errors.username}</span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="email" className="text-gray-700 text-black">
          Email
        </Label>
        <Input
          id="email"
          name="email"
          placeholder="Introduce tu email"
          type="email"
          required
        />
        {errors.email && (
          <span className="text-red-500 text-sm">{errors.email}</span>
        )}
      </div>

      <div className="flex gap-2 mt-4">
        <Button
          className="flex-1 text-black"
          style={{ backgroundColor: "#ed8147ff" }}
          type="submit"
        >
          Enviar
        </Button>
        <Button className="flex-1 text-black" type="reset" variant="outline"
        style={{ backgroundColor: "#bbbfbfff" }}>
          
          Borrar
        </Button>
      </div>

      <div className="mt-4 text-center">
          <Button
            className="w-full"
            style={{ backgroundColor: "#59f26bff" }}
            
          >
            <Link to="/newUserGym" className="text-black">Registro Nuevo Usuario</Link>
          </Button>
      </div>

    </form>
  );
}