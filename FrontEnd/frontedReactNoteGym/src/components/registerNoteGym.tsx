import { colors, useLabelPlacement } from "@heroui/react";
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterNoteGym () {
  const [formData, setFormData] = React.useState({
    username: "",
    password: "",
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

  return (
    <form  className="formRegister"  onSubmit={handleSubmit}>
       <Label htmlFor="username" className="text-gray-700 text-black">
          UserName
        </Label>
        <Input type="text" name="username"   placeholder="Usuario" value={formData.username} onChange={handleChange} />

       <Label htmlFor="password" className="text-gray-700 text-black">
          Create Password
        </Label>
      <Input type="password" name="password" placeholder="Contraseña" value={formData.password} onChange={handleChange} />
      
      <Label htmlFor="name" className="text-gray-700 text-black">
          Name
        </Label>
      <Input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} />

      <Label htmlFor="email" className="text-gray-700 text-black">
          Email
        </Label>
      <Input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} />

      <Label htmlFor="sexo" className="text-gray-700 text-black">
          Sex
        </Label>
      <div className="flex gap-4">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="sexo"
            value="HOMBRE"
            checked={formData.sexo === "HOMBRE"}
            onChange={handleChange}
            required
          />
          Hombre
        </label>

        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="sexo"
            value="MUJER"
            checked={formData.sexo == "MUJER"}
            onChange={handleChange}
            required
          />
          Mujer
        </label>
      </div>
      <Button
          className="flex-1 text-black"
          style={{ backgroundColor: "#ed8147ff" }}
          type="submit"
        >
          Enviar
      </Button>
      </form>


  );  
   
}



