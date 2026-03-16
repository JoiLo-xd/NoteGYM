import React, { useMemo, useState } from 'react';

const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const monthNames = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

interface CalendarProps {
  onClick?: (_day: number, _month: number, _year: number, _createNote?: boolean) => void;
}

export const ContinuousCalendar: React.FC<CalendarProps> = ({ onClick }) => {
  const today = new Date();

  // Guardamos el mes y año que estamos visualizando
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  // Estado para un visual de selección rápida de día
  const [selectedDay, setSelectedDay] = useState<{ day: number, month: number, year: number } | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleTodayClick = () => {
    const now = new Date();
    setCurrentDate(new Date(now.getFullYear(), now.getMonth(), 1));
    handleDayClick(now.getDate(), now.getMonth(), now.getFullYear());
  };

  const handleDayClick = (day: number, monthIdx: number, yearValue: number, createNote: boolean = false) => {
    setSelectedDay({ day, month: monthIdx, year: yearValue });
    if (onClick) {
      onClick(day, monthIdx, yearValue, createNote);
    }
  };

  // Generar los días del mes actual en un grid de 42 celdas (6 semanas max)
  const calendarDays = useMemo(() => {
    const days = [];

    // Primer día del mes
    const firstDay = new Date(year, month, 1);
    const startDayOfWeek = firstDay.getDay(); // 0 is Sunday, 1 is Monday ...

    // Días del mes anterior
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      days.push({
        day: prevMonthLastDay - i,
        month: month - 1,
        year: month === 0 ? year - 1 : year,
        isCurrentMonth: false
      });
    }

    // Días del mes actual
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        day,
        month,
        year,
        isCurrentMonth: true
      });
    }

    // Días del mes siguiente para rellenar (hasta llegar a 42 celdas, 6 filas x 7 cols)
    const remainingCells = 42 - days.length;
    for (let day = 1; day <= remainingCells; day++) {
      days.push({
        day,
        month: month + 1,
        year: month === 11 ? year + 1 : year,
        isCurrentMonth: false
      });
    }

    return days;
  }, [month, year]);

  return (
    <div className="flex flex-col rounded-3xl bg-white border border-gray-100 shadow-sm h-auto max-w-2xl mx-auto w-full">
      {/* Header */}
      <div className="bg-white px-5 sm:px-6 pt-6 pb-2 rounded-t-3xl">
        <div className="flex flex-wrap items-center justify-between gap-4">

          {/* Navegación y mes actual */}
          <div className="flex items-center gap-1 sm:gap-3 bg-gray-50/80 p-1.5 rounded-2xl border border-gray-100/80">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 sm:p-2 text-gray-400 hover:text-[#FF5722] hover:bg-white rounded-xl transition-all shadow-sm hover:shadow"
            >
              <svg className="size-4 sm:size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <h2 className="text-base sm:text-lg font-extrabold text-gray-800 min-w-[110px] sm:min-w-[130px] text-center capitalize tracking-tight">
              {monthNames[month]} {year}
            </h2>
            <button
              onClick={handleNextMonth}
              className="p-1.5 sm:p-2 text-gray-400 hover:text-[#FF5722] hover:bg-white rounded-xl transition-all shadow-sm hover:shadow"
            >
              <svg className="size-4 sm:size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>

          <button
            onClick={handleTodayClick}
            className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-[#FF5722] text-white text-[10px] sm:text-[11px] font-bold hover:bg-[#F4511E] transition-all uppercase tracking-widest shadow-md hover:shadow-lg hover:-translate-y-0.5"
          >
            Today
          </button>
        </div>

        {/* Días de la semana */}
        <div className="grid grid-cols-7 mt-6 mb-1 w-full max-w-lg mx-auto">
          {daysOfWeek.map((day) => (
            <div key={day} className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-[0.1em] sm:tracking-[0.2em] text-gray-400 text-center">
              {day}
            </div>
          ))}
        </div>
      </div>

      {/* Grid del Calendario */}
      <div className="px-4 sm:px-6 pb-8 pt-2 bg-white rounded-b-3xl flex flex-col items-center">
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2 w-full max-w-lg">
          {calendarDays.map((cell, index) => {
            const isToday = today.getDate() === cell.day && today.getMonth() === (cell.month < 0 ? 11 : cell.month > 11 ? 0 : cell.month) && today.getFullYear() === cell.year;

            // Ajustar el mes (puede ser -1 que significa diciembre del año pasado, o 12 que es enero del año que viene)
            // Date() se encargará de esto si se lo pasamos en new Date(), pero aquí lo normalizamos para el onClick / selectedDay
            let finalMonth = cell.month;
            if (finalMonth < 0) finalMonth = 11;
            else if (finalMonth > 11) finalMonth = 0;

            const isSelected = selectedDay?.day === cell.day && selectedDay?.month === finalMonth && selectedDay?.year === cell.year;

            return (
              <div
                key={index}
                onClick={() => handleDayClick(cell.day, finalMonth, cell.year)}
                className={`relative group aspect-square cursor-pointer rounded-xl sm:rounded-2xl border-2 transition-all duration-200 w-full max-w-[3rem] sm:max-w-[3.5rem] mx-auto
                  ${!cell.isCurrentMonth ? 'border-transparent bg-transparent hover:border-gray-200' : 'bg-white hover:border-[#FF5722]/50'}
                  ${isToday && !isSelected ? 'border-[#FF5722]/30 bg-orange-50/30' : 'border-gray-50'}
                  ${isSelected ? 'border-[#FF5722] bg-orange-50/50 shadow-md scale-[1.03]' : ''}
                `}
              >
                {/* Número del día con el formato original */}
                <span className={`absolute left-1.5 top-1.5 flex size-5 sm:size-6 items-center justify-center rounded-full text-[10px] sm:text-xs font-bold
                  ${isSelected ? 'bg-[#FF5722] text-white shadow-sm' :
                    isToday ? 'bg-orange-200/50 text-[#FF5722]' :
                      !cell.isCurrentMonth ? 'text-gray-300' : 'text-gray-600'}`}
                >
                  {cell.day}
                </span>

                {/* Botón de añadir (Icono naranja en la esquina derecha, visible al hacer hover) */}
                {cell.isCurrentMonth && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation(); // Evitar click en toda la celda principal
                      handleDayClick(cell.day, finalMonth, cell.year, true);
                    }}
                    className="absolute right-1 bottom-1 z-10 opacity-0 transition-opacity group-hover:opacity-100 p-0 bg-transparent border-none outline-none"
                  >
                    <svg className="size-4 sm:size-5 text-[#FF5722] hover:scale-110 transition-transform cursor-pointer" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
