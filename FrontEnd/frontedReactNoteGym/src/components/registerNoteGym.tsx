import { colors, useLabelPlacement } from "@heroui/react";
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterNoteGym () {
  const [formData, setFormData] = React.useState({
    username: "",
    password: "",
    passwordRep: "",
    name: "",
    email: "",
    sexo: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("http://localhost:5174/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(formData)
    });

    const data = await res.json();
    console.log("Respuesta del backend:", data);
  };

  const passwordsMatch = formData.password === formData.passwordRep;
  const showPasswordError = formData.passwordRep.length > 0 && !passwordsMatch;

  return (
    
    <form 
  className="formRegister w-full max-w-md p-8 rounded-3xl shadow-2xl border border-gray-800 mx-auto" 
  onSubmit={handleSubmit}
>
  <h2 className="text-4xl font-bold text-center mb-8 text-black tracking-tight">
    Sign in
  </h2>

  <div className="flex flex-col gap-5">
    
    <div className="flex flex-col gap-2">
      <label htmlFor="username" className="block text-sm text-black mb-1 ml-1">
        Username
      </label>
      <input
        type="text"
        name="username"
        placeholder="Username"
        value={formData.username}
        onChange={handleChange}
        className="w-full bg-transparent border-b border-gray-600 focus:outline-none focus:border-[#FF5722] text-black py-2 px-1 placeholder-gray-600"
        required
      />
    </div>

    <div className="flex flex-col gap-2">
      <label htmlFor="password" className="block text-sm text-black mb-1 ml-1 transition-colors group-focus-within:text-[#FF5722]">
        Password
      </label>
      <input
        type="password"
        name="password"
        placeholder="******"
        value={formData.password}
        onChange={handleChange}
        className="w-full bg-transparent border-b border-gray-600 text-black py-2 px-1 focus:outline-none focus:border-[#FF5722] transition-colors placeholder-gray-600"
        required
      />
    </div>

    <div className="flex flex-col gap-2 relative">
      <label 
        htmlFor="passwordRep" 
        className={`block text-sm mb-1 ml-1 transition-colors ${
          showPasswordError ? "text-red-500" : "text-black group-focus-within:text-[#FF5722]"
        }`}
      >
        Repeat Password
      </label>
      
      <input
        type="password"
        name="passwordRep"
        placeholder="******"
        value={formData.passwordRep} 
        onChange={handleChange}
        className={`w-full bg-transparent border-b py-2 px-1 focus:outline-none transition-colors placeholder-gray-600
          ${
            showPasswordError 
              ? "border-red-500 text-red-100 focus:border-red-500" // Estilo Error
              : "border-gray-600 text-black focus:border-[#FF5722]" // Estilo Normal
          }
        `}
        required
      />

      {showPasswordError && (
        <span className="text-xs text-red-500 absolute -bottom-5 left-1 animate-pulse">
          Las contraseñas no coinciden
        </span>
      )}
      
      {passwordsMatch && formData.password.length > 0 && (
        <span className="absolute right-2 top-8 text-green-500">
          ✓
        </span>
      )}
    </div>

    <div className="flex flex-col gap-2">
      <label htmlFor="name" className="block text-sm text-black mb-1 ml-1 transition-colors group-focus-within:text-[#FF5722]">
        Name
      </label>
      <input
        type="text"
        name="name"
        placeholder="Full name"
        value={formData.name}
        onChange={handleChange}
        className="w-full bg-transparent border-b border-gray-600 text-black py-2 px-1 focus:outline-none focus:border-[#FF5722] transition-colors placeholder-gray-600"
        required
      />
    </div>

    <div className="flex flex-col gap-2">
      <label htmlFor="email" className="block text-sm text-black mb-1 ml-1 transition-colors group-focus-within:text-[#FF5722]">
        Email
      </label>
      <input
        type="email"
        name="email"
        placeholder="example@gmail.com"
        value={formData.email}
        onChange={handleChange}
        className="w-full bg-transparent border-b border-gray-600 text-black py-2 px-1 focus:outline-none focus:border-[#FF5722] transition-colors placeholder-gray-600"
        required
      />
    </div>

    <div className="flex flex-col gap-2">
      <label className="block text-sm text-black mb-3 ml-1">Sex</label>
      <div className="flex gap-6">
        <label className="flex items-center gap-2 cursor-pointer group">
          <input
            type="radio"
            name="sexo"
            value="HOMBRE"
            checked={formData.sexo === "HOMBRE"}
            onChange={handleChange}
            className="appearance-none w-4 h-4 border border-gray-500 rounded-full checked:bg-[#FF5722] checked:border-[#FF5722] focus:ring-1 focus:ring-[#FF5722] ring-offset-0 bg-[#2b2b2b]"
            required
          />
          <span className="text-black transition-colors">Man</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer group">
          <input
            type="radio"
            name="sexo"
            value="MUJER"
            checked={formData.sexo === "MUJER"}
            onChange={handleChange}
            className="appearance-none w-4 h-4 border border-gray-500 rounded-full checked:bg-[#FF5722] checked:border-[#FF5722] focus:ring-1 focus:ring-[#FF5722] ring-offset-0 bg-[#2b2b2b]"
            required
          />
          <span className="text-black transition-colors">Woman</span>
        </label>
      </div>
    </div>

    <button
      className="w-full mt-6 bg-[#FF5722] hover:bg-[#F4511E] text-black font-bold py-3 rounded-xl shadow-[0_4px_14px_0_rgba(255,87,34,0.39)] hover:shadow-[0_6px_20px_rgba(255,87,34,0.34)] hover:-translate-y-0.5 transition-all duration-200"
      type="submit"
    >
      Enviar
    </button>
    
  </div>
</form>

  );  
   
}



