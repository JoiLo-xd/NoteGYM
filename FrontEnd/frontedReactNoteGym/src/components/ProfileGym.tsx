import React, { useState, useEffect } from "react";

interface UserData {
  name: string;
  username: string;
  email: string;
  sexo: string;
}

const initialData: UserData = {
  name: "Juan Pérez García",
  username: "JuanPGym",
  email: "juan.perez@notegym.com",
  sexo: "HOMBRE",
};

export default function ProfileGym() {
  const [formData, setFormData] = useState<UserData>(initialData);
  const [originalData, setOriginalData] = useState<UserData>(initialData);

  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    // si cargas del backend: setFormData(data); setOriginalData(data);
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
      ...formData,
      ...(newPassword && { password: newPassword }),
    };

    try {
      console.log("Datos enviados al servidor:", dataToSave);

      setMessage({ type: "success", text: "¡Perfil actualizado correctamente!" });
      setOriginalData(formData);
      setIsEditing(false);

      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setMessage({ type: "error", text: "Error al conectar con el servidor." });
    }
  };

  return (
    <div className="pt-24">
      <div className="profile-page">
        <div className="profile-card">
          <h1 className="text-4xl font-bold text-gray-800 mb-6 text-center">Mi Perfil</h1>

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
      </div>
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
}

const ProfileInput: React.FC<ProfileInputProps> = ({ label, name, value, onChange, isEditing, type = "text", placeholder }) => {
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
          className="w-full md:w-2/3 p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FF5722] transition duration-150 text-lg text-gray-800"
          required={type !== "password"}
        />
      ) : (
        <span className="text-lg text-gray-800 font-semibold md:w-2/3 md:text-right">{value}</span>
      )}
    </div>
  );
};
