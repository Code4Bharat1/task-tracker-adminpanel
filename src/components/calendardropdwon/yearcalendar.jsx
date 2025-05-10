'use client';
import { useEffect, useRef } from "react";
import gsap from "gsap";

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const daysShort = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDay(year, month) {
  return new Date(year, month, 1).getDay();
}

const Yearcalendar = () => {
  const year = 2025;
  const today = new Date();

  const underlineRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      underlineRef.current,
      { width: "0%" },
      { width: "100%", duration: 1, ease: "power2.out" }
    );
  }, []);

  return (
    <div className="p-4 text-black max-w-screen-xl mx-auto">
      <h2 className="text-center font-semibold text-gray-800 text-2xl mb-6">
        <span className="relative inline-block">
          MyCalendar2025
          <span
            ref={underlineRef}
            className="absolute left-0 bottom-0 h-[2px] bg-red-500 w-full"
          ></span>
        </span>
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 text-xs mx-auto w-[1100px]">
        {months.map((month, monthIndex) => {
          const daysInMonth = getDaysInMonth(year, monthIndex);
          const firstDay = getFirstDay(year, monthIndex);

          const daysArray = Array(firstDay).fill(null).concat(
            Array.from({ length: daysInMonth }, (_, i) => i + 1)
          );

          return (
            <div key={month} className="rounded shadow-xl p-2 bg-white w-full max-w-[250px] mx-auto text-[11px]">
              <h2 className="text-center font-semibold mb-1 text-sm">{month.toUpperCase()}</h2>
              <div className="grid grid-cols-7 gap-1 text-center font-medium text-gray-700 mb-1">
                {daysShort.map((day) => (
                  <div key={day} className="shadow-sm rounded py-1">{day}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1 text-center">
                {daysArray.map((day, i) => {
                  const isToday =
                    day === today.getDate() &&
                    monthIndex === today.getMonth() &&
                    year === today.getFullYear();

                  return (
                    <div
                      key={i}
                      className={`rounded h-5 flex items-center justify-center
                        ${day === null ? '' : 'bg-[#ECEEFD] shadow-md'}
                        ${day === 1 ? 'bg-cyan-400 text-white shadow-lg' : ''}
                        ${isToday ? 'bg-black text-white shadow-lg' : ''}`}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Yearcalendar;