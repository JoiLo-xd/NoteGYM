import React, { useMemo } from "react";

// Nombres de días y meses en español
const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const monthNames = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export default function CalendarWidget() {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const currentDayOfMonth = today.getDate();

  const { daysInMonth, firstDayOfMonth } = useMemo(() => {
    const dim = new Date(currentYear, currentMonth + 1, 0).getDate();
    const first = new Date(currentYear, currentMonth, 1).getDay();
    return { daysInMonth: dim, firstDayOfMonth: first };
  }, [currentYear, currentMonth]);

  const calendarDays = [];

  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(<div key={`empty-${i}`} className="h-12 rounded-xl" />);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const isToday = day === currentDayOfMonth;

    calendarDays.push(
      <button
        key={day}
        type="button"
        className={[
          "h-12 w-full rounded-xl flex items-center justify-center font-semibold",
          // ✅ SOLO CAMBIO: mejor hover/microinteracciones
          "transition-all duration-150",
          "border border-transparent hover:border-gray-300 hover:bg-gray-50 hover:scale-105 active:scale-95",
          "focus:outline-none focus:ring-2 focus:ring-[#FF5722]/40",
          isToday
            ? "bg-[#FF5722] text-white shadow-md hover:bg-[#F4511E]"
            : "text-gray-800",
        ].join(" ")}
      >
        {day}
      </button>
    );
  }

  return (
    <div className="w-full rounded-2xl border border-gray-200 bg-white p-6 shadow-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {monthNames[currentMonth]} {currentYear}
        </h2>

        <div className="text-sm text-gray-500">
          Hoy:{" "}
          <span className="font-medium text-gray-700">
            {dayNames[today.getDay()]} {currentDayOfMonth}
          </span>
        </div>
      </div>

      {/* Week days */}
      <div className="grid grid-cols-7 gap-2 border-b pb-3 mb-3">
        {dayNames.map((d) => (
          <div key={d} className="text-center text-sm font-semibold text-[#FF5722]">
            {d}
          </div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-2">{calendarDays}</div>

      {/* Hint */}
      <p className="mt-4 text-xs text-gray-500">
        *Más adelante, al hacer click en un día, se mostrará la rutina y las notas en el panel de la derecha.
      </p>
    </div>
  );
}