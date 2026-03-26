import React from "react";
import { useNavigate } from "react-router-dom";
import HeaderGym from "../headerGym";
import Sidebar from "../Sidebar";

// 1. FUNCIÓN DE VALIDACIÓN DE CONTRASEÑA
const validatePassword = (password: string): boolean => {
    const passwordRegex = new RegExp("^(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])(?=.*[$;._*-]).+$");
    return passwordRegex.test(password);
};

export default function AdminRegisterGym () {
    const [formData, setFormData] = React.useState({
        username: "",
        password: "",
        passwordRep: "",
        name: "",
        mail: "", 
        sex: "",
        role: "USER" // Por defecto
    });

    const navigate = useNavigate();

    const [status, setStatus] = React.useState("idle"); 
    const [serverMessage, setServerMessage] = React.useState("");
    const [passwordValidationMessage, setPasswordValidationMessage] = React.useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

        // Limpiar el mensaje de validación al editar la contraseña
        if (e.target.name === 'password') {
            setPasswordValidationMessage('');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // 2. VALIDACIÓN DE REQUISITOS DE SEGURIDAD
        if (!validatePassword(formData.password)) {
            setStatus("error");
            setServerMessage("");
            setPasswordValidationMessage(
                "La contrasenya ha de contenir: número, majúscula, minúscula i un símbol: $ ; . _ - *."
            );
            return;
        }

        // Evitar enviar si las contraseñas no coinciden
        if (formData.password !== formData.passwordRep) {
            setStatus("error");
            setServerMessage("Las contraseñas no coinciden.");
            setPasswordValidationMessage("");
            return;
        }
        
        // Si todo es correcto, limpiamos el mensaje de validación
        setPasswordValidationMessage(""); 

        setStatus("loading");
        setServerMessage("");

        try {
            // Desestructuramos para NO enviar 'passwordRep' al servidor
            const { passwordRep, ...dataToSend } = formData; 

            const res = await fetch("http://localhost:8080/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(dataToSend) // Enviamos solo los datos del registro
            });

            const dataText = await res.text();

            if (res.ok) {
                setStatus("success");
                setServerMessage(dataText || "¡Usuario registrado correctamente!");
                
                setTimeout(() => {
                    navigate('/dashboard'); 
                }, 1500); 

                // Limpiar el formulario
                setFormData({ username: "", password: "", passwordRep: "", name: "", mail: "", sex: "", role: "USER" });
            } else {
                setStatus("error");
                setServerMessage(dataText || "Error desconocido al registrar.");
            }

        } catch (error) {
            console.error(error);
            setStatus("error");
            setServerMessage("Error de conexión con el servidor.");
        }
    };

    const passwordsMatch = formData.password === formData.passwordRep;
    const showPasswordError = formData.passwordRep.length > 0 && !passwordsMatch;

    return (
        <div className="min-h-screen gym-bg flex flex-col">
            <HeaderGym />
            <Sidebar userRole={(localStorage.getItem('role') as any) || "user"} />
            
            <main className="flex-grow pt-24 px-6 pb-10 flex flex-col justify-start items-center">

                <form 
                    className="formRegister w-full max-w-md rounded-3xl shadow-2xl border border-gray-800 bg-white p-8 mt-4" 
                    onSubmit={handleSubmit}
                >
                    <h2 className="text-4xl font-bold text-center mb-8 text-black tracking-tight">
                        Añadir Nuevo Usuario
                    </h2>

                    <div className="flex flex-col gap-5">
                        
                        <div className="flex flex-col">
                            <label htmlFor="username" className="block text-sm text-black mb-1 ml-1 font-semibold">
                                Username
                            </label>
                            <input
                                type="text"
                                name="username"
                                placeholder="Username"
                                value={formData.username}
                                onChange={handleChange}
                                className="w-full bg-transparent border-b border-gray-600 focus:outline-none focus:border-[#FF5722] text-black py-2 px-1 placeholder-gray-400"
                                required
                            />
                        </div>

                        {/* CAMPO PASSWORD */}
                        <div className="flex flex-col relative pb-4">
                            <label htmlFor="password" className="block text-sm text-black ml-1 transition-colors font-semibold">
                                Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                placeholder="******"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full bg-transparent border-b border-gray-600 text-black py-2 px-1 focus:outline-none focus:border-[#FF5722] transition-colors placeholder-gray-400"
                                required
                            />
                            {/* MENSAJE DE VALIDACIÓN DE CONTRASEÑA */}
                            {passwordValidationMessage && (
                                <span className="text-xs text-red-500 absolute -bottom-1 left-1 animate-pulse">
                                    ❌ {passwordValidationMessage}
                                </span>
                            )}
                        </div>

                        {/* CAMPO REPEAT PASSWORD */}
                        <div className="flex flex-col relative pb-4">
                            <label 
                                htmlFor="passwordRep" 
                                className={`block text-sm mb-1 ml-1 transition-colors font-semibold ${
                                    showPasswordError ? "text-red-500" : "text-black"
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
                                className={`w-full bg-transparent border-b py-2 px-1 focus:outline-none transition-colors placeholder-gray-400
                                    ${
                                        showPasswordError 
                                            ? "border-red-500 text-red-500 focus:border-red-500" // Estilo Error
                                            : "border-gray-600 text-black focus:border-[#FF5722]" // Estilo Normal
                                    }
                                `}
                                required
                            />

                            {showPasswordError && (
                                <span className="text-xs text-red-500 absolute -bottom-1 left-1 animate-pulse">
                                    Las contraseñas no coinciden
                                </span>
                            )}
                            
                            {passwordsMatch && formData.password.length > 0 && validatePassword(formData.password) && (
                                <span className="absolute right-2 top-8 text-green-500">
                                    ✓
                                </span>
                            )}
                        </div>

                        {/* CAMPO NAME */}
                        <div className="flex flex-col">
                            <label htmlFor="name" className="block text-sm text-black mb-1 ml-1 transition-colors font-semibold">
                                Full Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                placeholder="Full name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full bg-transparent border-b border-gray-600 text-black py-2 px-1 focus:outline-none focus:border-[#FF5722] transition-colors placeholder-gray-400"
                                required
                            />
                        </div>

                        {/* CAMPO EMAIL */}
                        <div className="flex flex-col">
                            <label htmlFor="email" className="block text-sm text-black mb-1 ml-1 transition-colors font-semibold">
                                Email
                            </label>
                            <input
                                type="email"
                                name="mail"
                                placeholder="example@gmail.com"
                                value={formData.mail}
                                onChange={handleChange}
                                className="w-full bg-transparent border-b border-gray-600 text-black py-2 px-1 focus:outline-none focus:border-[#FF5722] transition-colors placeholder-gray-400"
                                required
                            />
                        </div>

                        {/* CAMPO ROLE */}
                        <div className="flex flex-col mt-2">
                            <label htmlFor="role" className="block text-sm text-black mb-1 ml-1 font-semibold">
                                Role (Tipo de Usuario)
                            </label>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="w-full bg-transparent border-b border-gray-600 text-black py-2 px-1 focus:outline-none focus:border-[#FF5722] transition-colors cursor-pointer"
                                required
                            >
                                <option value="USER">Usuario Normal</option>
                                <option value="TRAINER">Entrenador</option>
                                <option value="ADMIN">Administrador</option>
                            </select>
                        </div>

                        {/* CAMPO SEX */}
                        <div className="flex flex-col mt-2">
                            <label className="block text-sm text-black mb-3 ml-1 font-semibold">Sex</label>
                            <div className="flex gap-6">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                        type="radio"
                                        name="sex" 
                                        value="HOMBRE"
                                        checked={formData.sex === "HOMBRE"}
                                        onChange={handleChange}
                                        className="appearance-none w-4 h-4 border border-gray-500 rounded-full checked:bg-[#FF5722] checked:border-[#FF5722] transition-colors focus:ring-1 focus:ring-[#FF5722] ring-offset-0 bg-[#2b2b2b]"
                                        required
                                    />
                                    <span className="text-black transition-colors font-medium">Man</span>
                                </label>

                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                        type="radio"
                                        name="sex" 
                                        value="MUJER"
                                        checked={formData.sex === "MUJER"}
                                        onChange={handleChange}
                                        className="appearance-none w-4 h-4 border border-gray-500 rounded-full checked:bg-[#FF5722] checked:border-[#FF5722] transition-colors focus:ring-1 focus:ring-[#FF5722] ring-offset-0 bg-[#2b2b2b]"
                                        required
                                    />
                                    <span className="text-black transition-colors font-medium">Woman</span>
                                </label>
                            </div>
                        </div>

                        {/* MENSAJES DE STATUS DEL SERVIDOR */}
                        {status === "error" && serverMessage && (
                            <div className="p-3 mt-2 rounded bg-red-100 border border-red-400 text-red-700 text-sm text-center animate-pulse">
                                ⚠️ {serverMessage}
                            </div>
                        )}

                        {status === "success" && (
                            <div className="p-3 mt-2 rounded bg-green-100 border border-green-400 text-green-700 text-sm text-center">
                                ✅ {serverMessage}
                            </div>
                        )}

                        <button
                            className={`w-full mt-6 bg-[#FF5722] hover:bg-[#F4511E] text-white font-bold py-3 rounded-xl shadow-[0_4px_14px_0_rgba(255,87,34,0.39)] hover:shadow-[0_6px_20px_rgba(255,87,34,0.34)] hover:-translate-y-0.5 transition-all duration-200 
                                ${status === 'loading' ? 'opacity-70 cursor-not-allowed' : ''}`}
                            type="submit"
                            disabled={status === 'loading'}
                        >
                            {status === 'loading' ? "Registrando..." : "Añadir Usuario"}
                        </button>
                    </div>
                </form>

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
