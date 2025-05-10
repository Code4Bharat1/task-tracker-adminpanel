import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const calendarData = [
    ['', '', '', '', 1, 2, 3],
    [4, 5, 6, 7, 8, 9, 10],
    [11, 12, 13, 14, 15, 16, 17],
    [18, 19, 20, 21, 22, 23, 24],
    [25, 26, 27, 28, 29, 30, 31],
];

const eventIndicators = {
    1: 'bg-orange-400',
    2: 'bg-black text-white',
    3: 'bg-blue-500 after:content-[""] after:absolute after:-right-1 after:-bottom-1 after:w-1.5 after:h-1.5 after:bg-red-500 after:rounded-full',
    5: 'after:content-[""] after:w-1.5 after:h-1.5 after:bg-purple-500 after:absolute after:top-1 after:right-1 after:rounded-full',
};

const CalendarWidget = () => {
    return (
        <div className="max-w-xl rounded-lg overflow-hidden w-full shadow-[0px_3px_4px_rgba(0,0,0,0.4)]">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-white">
                <h2 className="text-lg font-bold">May 2025</h2>
                <div className="flex space-x-2">
                    <button className="p-1 rounded hover:bg-gray-200">
                        <ChevronLeft size={16} />
                    </button>
                    <button className="p-1 rounded hover:bg-gray-200">
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            <hr />

            {/* Days of Week */}
            <div className="grid grid-cols-7 text-center text-sm font-semibold p-2">
                {daysOfWeek.map((day) => (
                    <div key={day} className="text-gray-600">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Dates */}
            <div className="grid grid-cols-7 text-center p-2 gap-y-2">
                {calendarData.flat().map((date, idx) => {
                    const isSunday = idx % 7 === 0;
                    const isEmpty = date === '';
                    const baseClasses =
                        'h-16 w-16 flex items-center justify-center rounded-lg text-sm shadow-md relative transition-all';

                    let styleClasses = 'bg-[#ECEEFD] text-gray-800';

                    if (isEmpty) {
                        return <div key={idx}></div>;
                    }

                    if (isSunday) {
                        styleClasses = 'bg-[#67B2CF] text-white';
                    }

                    if (eventIndicators[date]) {
                        styleClasses = `${eventIndicators[date]} ${baseClasses}`;
                    }

                    return (
                        <div key={idx} className={`${baseClasses} ${styleClasses}`}>
                            {date}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CalendarWidget;
