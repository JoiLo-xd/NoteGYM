import React, { useEffect, useMemo, useRef, useState } from 'react';

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

interface ContinuousCalendarProps {
  onClick?: (_day: number, _month: number, _year: number) => void;
}

export const ContinuousCalendar: React.FC<ContinuousCalendarProps> = ({ onClick }) => {
  const today = new Date();
  const dayRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(today.getMonth());
  const monthOptions = monthNames.map((month, index) => ({ name: month, value: `${index}` }));

  const scrollToDay = (monthIndex: number, dayIndex: number) => {
    const targetDayIndex = dayRefs.current.findIndex(
      (ref) => ref && ref.getAttribute('data-month') === `${monthIndex}` && ref.getAttribute('data-day') === `${dayIndex}`,
    );

    const targetElement = dayRefs.current[targetDayIndex];

    if (targetDayIndex !== -1 && targetElement) {
      const container = document.querySelector('.calendar-container');
      if (container) {
        const containerRect = container.getBoundingClientRect();
        const elementRect = targetElement.getBoundingClientRect();
        const offset = elementRect.top - containerRect.top - (containerRect.height / 3) + (elementRect.height / 2);

        container.scrollTo({
          top: container.scrollTop + offset,
          behavior: 'smooth',
        });
      }
    }
  };

  const handlePrevYear = () => setYear((prevYear) => prevYear - 1);
  const handleNextYear = () => setYear((prevYear) => prevYear + 1);

  const handleMonthChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const monthIndex = parseInt(event.target.value, 10);
    setSelectedMonth(monthIndex);
    scrollToDay(monthIndex, 1);
  };

  const handleTodayClick = () => {
    setYear(today.getFullYear());
    setTimeout(() => scrollToDay(today.getMonth(), today.getDate()), 10);
  };

  const handleDayClick = (day: number, month: number, year: number) => {
    if (!onClick) return;
    onClick(day, month < 0 ? 11 : month, month < 0 ? year - 1 : year);
  }

  const generateCalendar = useMemo(() => {
    const today = new Date();

    const daysInYear = () => {
      const days = [];
      const startDayOfWeek = new Date(year, 0, 1).getDay();

      if (startDayOfWeek > 0) {
        for (let i = 0; i < startDayOfWeek; i++) {
          days.push({ month: -1, day: 32 - startDayOfWeek + i });
        }
      }

      for (let month = 0; month < 12; month++) {
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        for (let day = 1; day <= daysInMonth; day++) {
          days.push({ month, day });
        }
      }

      const lastWeekDayCount = days.length % 7;
      if (lastWeekDayCount > 0) {
        for (let day = 1; day <= (7 - lastWeekDayCount); day++) {
          days.push({ month: 0, day, isNextYear: true });
        }
      }
      return days;
    };

    const calendarDays = daysInYear();

    return (
      <div className="grid grid-cols-7 w-full gap-2 bg-white">
        {calendarDays.map(({ month, day }, index) => {
          const isNewMonth = index === 0 || (calendarDays[index - 1].month !== month && month >= 0);
          const isToday = today.getMonth() === month && today.getDate() === day && today.getFullYear() === year;

          return (
            <div
              key={`${month}-${day}-${index}`}
              ref={(el) => { dayRefs.current[index] = el; }}
              data-month={month}
              data-day={day}
              onClick={() => handleDayClick(day, month, year)}
              className={`relative z-10 group aspect-square w-full cursor-pointer rounded-xl border-2 transition-all hover:z-20 hover:border-[#FF5722] bg-white
                ${isToday ? 'border-[#FF5722] bg-orange-50/20' : 'border-gray-50'}
                ${month < 0 ? 'opacity-20' : ''}`}
            >
              {/* Número del día */}
              <span className={`absolute left-2 top-2 flex size-6 items-center justify-center rounded-full text-xs sm:size-7 sm:text-sm font-bold
                ${isToday ? 'bg-[#FF5722] text-white shadow-sm' : 'text-gray-600'}`}>
                {day}
              </span>

              {/* Botón de añadir (Sin fondo negro, solo icono naranja) */}
              <button 
                type="button" 
                className="absolute right-1.5 top-1.5 opacity-0 transition-opacity group-hover:opacity-100 p-0 bg-transparent border-none outline-none"
              >
                <svg className="size-6 sm:size-7 text-[#FF5722] hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                </svg>
              </button>

              {/* Nombre del mes */}
              {isNewMonth && (
                <span className="absolute bottom-2 left-2 text-[9px] font-bold uppercase tracking-widest text-gray-300">
                  {monthNames[month]}
                </span>
              )}
            </div>
          );
        })}
      </div>
    );
  }, [year]);

  useEffect(() => {
    const calendarContainer = document.querySelector('.calendar-container');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const month = parseInt(entry.target.getAttribute('data-month')!, 10);
            if (month >= 0) setSelectedMonth(month);
          }
        });
      },
      { root: calendarContainer, rootMargin: '-50% 0px -50% 0px', threshold: 0 }
    );

    dayRefs.current.forEach((ref) => {
      if (ref && ref.getAttribute('data-day') === '1') observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [year]);

  return (
    <div className="flex flex-col rounded-2xl bg-white border border-gray-100 overflow-hidden shadow-sm">
      {/* Header Estilo Naranja/Blanco */}
      <div className="bg-white px-5 pt-7 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Select name="month" value={`${selectedMonth}`} options={monthOptions} onChange={handleMonthChange} />
            <button 
              onClick={handleTodayClick} 
              className="px-5 py-2 rounded-xl bg-[#FF5722] text-white text-[10px] font-bold hover:bg-[#F4511E] transition-all uppercase tracking-widest shadow-sm"
            >
              Today
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={handlePrevYear} className="p-2 text-gray-300 hover:text-[#FF5722] transition-colors bg-transparent border-none">
              <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="m15 19-7-7 7-7"/></svg>
            </button>
            <span className="text-xl font-extrabold text-gray-800 tabular-nums">{year}</span>
            <button onClick={handleNextYear} className="p-2 text-gray-300 hover:text-[#FF5722] transition-colors bg-transparent border-none">
              <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="m9 5 7 7-7 7"/></svg>
            </button>
          </div>
        </div>

        {/* Días de la semana */}
        <div className="grid grid-cols-7 mt-8 border-b border-gray-50 pb-2">
          {daysOfWeek.map((day) => (
            <div key={day} className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 text-center">
              {day}
            </div>
          ))}
        </div>
      </div>

      {/* Contenedor del Calendario */}
      <div className="calendar-container no-scrollbar h-[450px] overflow-y-auto px-5 py-4 bg-white">
        {generateCalendar}
      </div>
    </div>
  );
};

// --- Select Estilizado ---
interface SelectProps {
  name: string;
  value: string;
  options: { name: string, value: string }[];
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const Select = ({ name, value, options, onChange }: SelectProps) => (
  <div className="relative">
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="appearance-none cursor-pointer rounded-xl border border-gray-100 bg-white py-2 pl-4 pr-10 text-[11px] font-bold uppercase tracking-wider text-gray-600 hover:border-gray-200 focus:outline-none transition-all"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.name}</option>
      ))}
    </select>
    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-300">
      <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"/></svg>
    </div>
  </div>
);