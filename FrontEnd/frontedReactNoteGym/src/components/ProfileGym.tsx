import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HeaderGym from "./headerGym";
import Sidebar from "./Sidebar";
import { apiService } from "../services/api";

interface UserData {
  name: string;
  username: string;
  email: string;
  sexo: string;
}

const initialData: UserData = {
  name: localStorage.getItem("name") || "",
  username: localStorage.getItem("username") || "",
  email: localStorage.getItem("email") || "",
  sexo: localStorage.getItem("sexo") || "",
};

type UserRole = 'admin' | 'user' | 'trainer';

export default function ProfileGym() {
  const userRole = (localStorage.getItem('role') as UserRole) || "user";
  const navigate = useNavigate();

  const [formData, setFormData] = useState<UserData>(initialData);
  const [originalData, setOriginalData] = useState<UserData>(initialData);

  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await apiService.getProfile();
        // Mapear de nombres de backend (mail, sex) a nombres de frontend (email, sexo)
        const mappedData: UserData = {
          name: profile.name || "",
          username: profile.username || "",
          email: profile.mail || "", // Backend: mail -> Frontend: email
          sexo: profile.sex || "OTRO", // Backend: sex -> Frontend: sexo
        };
        setFormData(mappedData);
        setOriginalData(mappedData);
        
        // Mantener localStorage sincronizado con lo que espera la app
        localStorage.setItem("name", mappedData.name);
        localStorage.setItem("username", mappedData.username);
        localStorage.setItem("email", mappedData.email);
        localStorage.setItem("sexo", mappedData.sexo);
      } catch (error) {
        console.error("Error fetching profile:", error);
        // Si hay error, al menos tenemos los datos del localStorage inicial
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const startEditing = () => {
    setMessage(null);
    setOriginalData(formData);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setMessage(null);
    setFormData(originalData);
    setNewPassword("");
    setConfirmPassword("");
  };

  const hasProfileChanged = () => {
    const sameData =
      formData.name === originalData.name &&
      formData.username === originalData.username &&
      formData.email === originalData.email &&
      formData.sexo === originalData.sexo;

    const noPasswordChange = newPassword === "" && confirmPassword === "";

    return !(sameData && noPasswordChange);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!hasProfileChanged()) {
      setMessage({ type: "error", text: "No has modificado ningún dato." });
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Las contraseñas no coinciden." });
      return;
    }

    const dataToSave = {
      name: formData.name,
      mail: formData.email, // Mapeo para el backend
      sex: formData.sexo, // Mapeo para el backend
      ...(newPassword && { password: newPassword }),
    };

    try {
      console.log("Datos enviados al servidor:", dataToSave);
      await apiService.updateProfile(dataToSave);

      setMessage({ type: "success", text: "¡Perfil actualizado correctamente!" });
      setOriginalData(formData);
      setIsEditing(false);

      setNewPassword("");
      setConfirmPassword("");
      
      // Actualizar localStorage con los nombres correctos
      localStorage.setItem("name", formData.name);
      localStorage.setItem("email", formData.email);
      localStorage.setItem("sexo", formData.sexo);
    } catch (error) {
      console.error("Error al actualizar el perfil:", error);
      setMessage({ type: "error", text: "Error al actualizar el perfil en el servidor." });
    }
  };

  return (
    <div className="min-h-screen gym-bg flex flex-col">
      <HeaderGym />
      <Sidebar userRole={userRole} />

      <main className="flex-grow pt-24 px-6 pb-10 flex flex-col justify-start items-center">
        
        <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl p-8 border border-gray-200 profile-card text-center mb-6 mt-4">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 border-b pb-3 text-[#FF5722]">Mi Perfil</h1>

          {message && (
            <div
              className={`p-3 rounded mb-4 text-sm text-center font-medium ${
                message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}
            >
              {message.text}
            </div>
          )}

          {!isEditing && (
            <div className="flex justify-end mb-6">
              <button
                type="button"
                onClick={startEditing}
                className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-5 rounded-lg transition duration-200 shadow-md"
              >
                Editar Perfil
              </button>
            </div>
          )}

          <form onSubmit={handleSave}>
            <div className="space-y-6">
              <ProfileInput
                label="Nombre Completo"
                name="name"
                value={formData.name}
                onChange={handleChange}
                isEditing={isEditing}
              />

              <ProfileInput
                label="Email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                isEditing={isEditing}
                type="email"
              />

              <ProfileInput
                label="Nombre de Usuario"
                name="username"
                value={formData.username}
                onChange={handleChange}
                isEditing={isEditing}
                disabled={true} // El username no se puede modificar
              />

              <div className="flex flex-col md:flex-row justify-between items-start md:items-center py-2 border-b border-gray-300">
                <label className="text-lg font-medium text-gray-600 mb-1 md:mb-0">Sexo</label>

                {isEditing ? (
                  <select
                    value={formData.sexo}
                    onChange={(e) => setFormData({ ...formData, sexo: e.target.value })}
                    className="w-full md:w-2/3 p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FF5722] transition duration-150 text-lg text-gray-800"
                  >
                    <option value="HOMBRE">HOMBRE</option>
                    <option value="MUJER">MUJER</option>
                    <option value="OTRO">OTRO</option>
                    <option value="PREFIERO_NO_DECIRLO">PREFIERO NO DECIRLO</option>
                  </select>
                ) : (
                  <span className="text-lg text-gray-800 font-semibold md:w-2/3 md:text-right">{formData.sexo}</span>
                )}
              </div>

              {isEditing && (
                <div className="pt-6 border-t border-gray-300 space-y-4">
                  <h3 className="text-xl font-bold text-[#FF5722] mb-4">Cambiar Contraseña</h3>

                  <ProfileInput
                    label="Nueva Contraseña"
                    name="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    isEditing={true}
                    type="password"
                    placeholder="Deja vacío si no quieres cambiar"
                  />

                  <ProfileInput
                    label="Confirmar Contraseña"
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    isEditing={true}
                    type="password"
                  />
                </div>
              )}
            </div>

            {isEditing && (
              <div className="mt-10 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-5 rounded-lg transition duration-200 shadow-sm"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="bg-[#FF5722] hover:bg-[#F4511E] text-white font-semibold py-2 px-5 rounded-lg transition duration-200 shadow-md"
                >
                  Aplicar cambios
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Botón Flotante Volver */}
        <button 
            onClick={() => navigate('/dashboard')}
            className="fixed bottom-8 right-8 bg-[#FF5722] hover:bg-[#F4511E] text-white p-4 rounded-full shadow-[0_4px_20px_0_rgba(255,87,34,0.4)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_25px_0_rgba(255,87,34,0.5)] z-40 group flex items-center justify-center transform active:scale-95"
            title="Volver al Dashboard"
        >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </button>

      </main>
    </div>
  );
}

interface ProfileInputProps {
  label: string;
  name: keyof UserData | string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isEditing: boolean;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
}

const ProfileInput: React.FC<ProfileInputProps> = ({ 
  label, name, value, onChange, isEditing, type = "text", placeholder, disabled = false 
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center py-2 border-b border-gray-300">
      <label htmlFor={name.toString()} className="text-lg font-medium text-gray-600 mb-1 md:mb-0">
        {label}
      </label>

      {isEditing ? (
        <input
          id={name.toString()}
          name={name.toString()}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder || label}
          disabled={disabled}
          className={`w-full md:w-2/3 p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FF5722] transition duration-150 text-lg text-gray-800 ${
            disabled ? "bg-gray-100 cursor-not-allowed text-gray-500" : ""
          }`}
          required={type !== "password"}
        />
      ) : (
        <span className="text-lg text-gray-800 font-semibold md:w-2/3 md:text-right">{value}</span>
      )}
    </div>
  );
};
