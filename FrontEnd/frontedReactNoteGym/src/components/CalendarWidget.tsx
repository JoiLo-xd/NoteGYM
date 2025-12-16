import React, { useMemo } from 'react';

// Nombres de días y meses en español (adaptado a tu contexto)
const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

export default function CalendarWidget() {
    // Definimos la fecha de hoy
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const currentDayOfMonth = today.getDate();

    // useMemo para calcular los días del mes una sola vez por renderizado
    const { daysInMonth, firstDayOfMonth } = useMemo(() => {
        // Obtenemos el número total de días en el mes actual
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        // Obtenemos el día de la semana (0=Dom, 1=Lun...) del primer día del mes
        const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
        return { daysInMonth, firstDayOfMonth };
    }, [currentYear, currentMonth]);

    // Generar las celdas del calendario
    const calendarDays = [];
    
    // 1. Días vacíos (padding inicial)
    for (let i = 0; i < firstDayOfMonth; i++) {
        calendarDays.push(<div key={`empty-${i}`} className="text-gray-400 p-2 text-center"></div>);
    }

    // 2. Días del mes
    for (let day = 1; day <= daysInMonth; day++) {
        const isToday = day === currentDayOfMonth;

        calendarDays.push(
            <div
                key={day}
                className={`p-2 text-center font-semibold rounded-full w-10 h-10 flex items-center justify-center mx-auto transition-colors duration-200
                    ${isToday 
                        ? 'bg-[#FF5722] text-white shadow-lg transform scale-110' // Estilo para el día de hoy
                        : 'text-gray-800 hover:bg-gray-200 cursor-pointer' // Estilo para otros días
                    }`
                }
            >
                {day}
            </div>
        );
    }

    return (
        <div className="w-full max-w-lg mx-auto bg-white p-6 rounded-xl shadow-2xl border border-gray-200">
            {/* Encabezado del Mes */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                    {monthNames[currentMonth]} {currentYear}
                </h2>
                {/* Aquí podrías añadir botones para cambiar de mes */}
                <div className="text-sm text-gray-500">
                    Hoy: {dayNames[today.getDay()]} {currentDayOfMonth}
                </div>
            </div>

            {/* Grid de Días de la Semana */}
            <div className="grid grid-cols-7 gap-1 border-b pb-2 mb-2">
                {dayNames.map((dayName) => (
                    <div key={dayName} className="text-center font-medium text-sm text-[#FF5722]">
                        {dayName}
                    </div>
                ))}
            </div>

            {/* Grid de Días del Calendario */}
            <div className="grid grid-cols-7 gap-1">
                {calendarDays}
            </div>
        </div>
    );
}