import React from "react";
import { Link, useNavigate } from "react-router-dom";

// 1. FUNCIÓN DE VALIDACIÓN DE CONTRASEÑA
const validatePassword = (password: string): boolean => {
    // Criterios:
    // ^                 # Inicio
    // (?=.*[0-9])       # Debe contener al menos un dígito (número)
    // (?=.*[A-Z])       # Debe contener al menos una mayúscula
    // (?=.*[a-z])       # Debe contener al menos una minúscula
    // (?=.*[$;._*-])    # Debe contener al menos uno de los símbolos especificados: $ ; . _ - *
    // .+                # Permite cualquier carácter (cumpliendo los anteriores)
    // $                 # Fin
    
    // NOTA: No se impone una longitud mínima en el regex, solo los caracteres requeridos.
    const passwordRegex = new RegExp("^(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])(?=.*[$;._*-]).+$");
    
    return passwordRegex.test(password);
};

export default function RegisterNoteGym () {
    const [formData, setFormData] = React.useState({
        username: "",
        password: "",
        passwordRep: "",
        name: "",
        mail: "", // <-- Usando 'mail'
        sex: ""   // <-- Usando 'sex'
    });

    const navigate = useNavigate();

    const [status, setStatus] = React.useState("idle"); 
    const [serverMessage, setServerMessage] = React.useState("");
    // Estado para el mensaje de error de validación de la contraseña
    const [passwordValidationMessage, setPasswordValidationMessage] = React.useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

            const res = await fetch("http://localhost:8080/api/user/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(dataToSend) // Enviamos solo los datos del registro
            });

            const data = await res.json();

            if (res.ok) {
                setStatus("success");
                setServerMessage(data.message || "¡Usuario registrado correctamente!");
                
                setTimeout(() => {
                    navigate('/loginUserGym'); 
                }, 1500); 

                // Limpiar el formulario
                setFormData({ username: "", password: "", passwordRep: "", name: "", mail: "", sex: "" });
            } else {
                setStatus("error");
                setServerMessage(data.message || "Error desconocido al registrar.");
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
        
        <form 
            className="formRegister w-full max-w-md p-8 rounded-3xl shadow-2xl border border-gray-800 mx-auto" 
            onSubmit={handleSubmit}
        >
            <h2 className="text-4xl font-bold text-center mb-8 text-black tracking-tight">
                Sign in
            </h2>

            <div className="flex flex-col gap-5">
                
                <div className="flex flex-col">
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

                {/* CAMPO PASSWORD */}
                <div className="flex flex-col">
                    <label htmlFor="password" className="block text-sm text-black ml-1 transition-colors group-focus-within:text-[#FF5722]">
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

                {/* MENSAJE DE VALIDACIÓN DE CONTRASEÑA */}
                {passwordValidationMessage && (
                    <span className="text-xs text-red-500 left-1 animate-pulse -mt-4">
                        ❌ {passwordValidationMessage}
                    </span>
                )}
                
                {/* CAMPO REPEAT PASSWORD */}
                <div className="flex flex-col relative">
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
                                    ? "border-red-500 text-red-100 focus:border-red" // Estilo Error
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
                    
                    {/* Checkmark condicional: Contraseñas coinciden Y pasan validación */}
                    {passwordsMatch && formData.password.length > 0 && validatePassword(formData.password) && (
                        <span className="absolute right-2 top-8 text-green-500">
                            ✓
                        </span>
                    )}
                </div>

                {/* CAMPO NAME */}
                <div className="flex flex-col">
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

                {/* CAMPO EMAIL */}
                <div className="flex flex-col">
                    <label htmlFor="email" className="block text-sm text-black mb-1 ml-1 transition-colors group-focus-within:text-[#FF5722]">
                        Email
                    </label>
                    <input
                        type="email"
                        name="mail" // <-- Usando 'mail' aquí para que coincida con formData
                        placeholder="example@gmail.com"
                        value={formData.mail}
                        onChange={handleChange}
                        className="w-full bg-transparent border-b border-gray-600 text-black py-2 px-1 focus:outline-none focus:border-[#FF5722] transition-colors placeholder-gray-600"
                        required
                    />
                </div>

                {/* CAMPO SEX */}
                <div className="flex flex-col">
                    <label className="block text-sm text-black mb-3 ml-1">Sex</label>
                    <div className="flex gap-6">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="radio"
                                name="sex" // <-- Usando 'sex' aquí para que coincida con formData
                                value="HOMBRE"
                                checked={formData.sex === "HOMBRE"}
                                onChange={handleChange}
                                className="appearance-none w-4 h-4 border border-gray-500 rounded-full checked:bg-[#FF5722] checked:border-[#FF5722] transition-colors focus:ring-1 focus:ring-[#FF5722] ring-offset-0 bg-[#2b2b2b]"
                                required
                            />
                            <span className="text-black transition-colors">Man</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="radio"
                                name="sex" // <-- Usando 'sex' aquí para que coincida con formData
                                value="MUJER"
                                checked={formData.sex === "MUJER"}
                                onChange={handleChange}
                                className="appearance-none w-4 h-4 border border-gray-500 rounded-full checked:bg-[#FF5722] checked:border-[#FF5722] transition-colors focus:ring-1 focus:ring-[#FF5722] ring-offset-0 bg-[#2b2b2b]"
                                required
                            />
                            <span className="text-black transition-colors">Woman</span>
                        </label>
                    </div>
                </div>

                {/* MENSAJES DE STATUS DEL SERVIDOR */}
                {status === "error" && serverMessage && (
                    <div className="p-3 rounded bg-red-100 border border-red-400 text-red-700 text-sm text-center animate-pulse">
                        ⚠️ {serverMessage}
                    </div>
                )}

                {status === "success" && (
                    <div className="p-3 rounded bg-green-100 border border-green-400 text-green-700 text-sm text-center">
                        ✅ {serverMessage}
                    </div>
                )}

                <button
                    className={`w-full mt-6 bg-[#FF5722] hover:bg-[#F4511E] text-black font-bold py-3 rounded-xl shadow-[0_4px_14px_0_rgba(255,87,34,0.39)] hover:shadow-[0_6px_20px_rgba(255,87,34,0.34)] hover:-translate-y-0.5 transition-all duration-200 
                        ${status === 'loading' ? 'opacity-70 cursor-not-allowed' : ''}`}
                    type="submit"
                    disabled={status === 'loading'}
                >
                    {status === 'loading' ? "Registrando..." : "Send"}
                </button>
                
                {/* ENLACE PARA VOLVER AL LOGIN */}
                <div className="mt-4 text-center">
                    <span className="text-gray-600">
                        ¿Ya tienes una cuenta?
                    </span>
                    <Link 
                        to="/loginUserGym"
                        className="ml-2 text-[#FF5722] hover:text-[#F4511E] hover:underline font-semibold transition-colors duration-200"
                    >
                        Inicia Sesión aquí
                    </Link>
                </div>

            </div>
        </form>
    ); 
}