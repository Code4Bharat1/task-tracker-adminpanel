'use client'
import { useState, useEffect } from 'react';

export default function AttendanceTable({ selectedDate, selectedRemark }) {
    // Sample data with dates
    const allData = [/* ... your provided data ... */];

    const [sortedGroupedData, setSortedGroupedData] = useState([]);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB'); // DD/MM/YYYY format
    };

    const sortDatesDescending = (a, b) => {
        return new Date(b.date) - new Date(a.date);
    };

    useEffect(() => {
        let result = [...allData];

        if (selectedDate) {
            result = result.filter(item => item.date === selectedDate);
        } else {
            const today = new Date();
            const currentMonth = today.getMonth() + 1;
            const currentYear = today.getFullYear();
            result = result.filter(item => {
                const itemDate = new Date(item.date);
                return itemDate.getFullYear() === currentYear &&
                    (itemDate.getMonth() + 1) === currentMonth;
            });
        }

        if (selectedRemark) {
            result = result.filter(item => item.remark === selectedRemark);
        }

        const grouped = result.reduce((acc, item) => {
            const date = item.date;
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(item);
            return acc;
        }, {});

        const sorted = Object.entries(grouped)
            .map(([date, records]) => ({ date, records }))
            .sort((a, b) => sortDatesDescending(a, b));

        setSortedGroupedData(sorted);
    }, [selectedDate, selectedRemark]);

    const getColor = (remark) => {
        if (remark === 'Present') return 'text-green-500 font-bold';
        if (remark === 'Late') return 'text-orange-500 font-bold';
        if (remark === 'Absent') return 'text-red-500 font-bold';
        return '';
    };

    return (
        <div className='space-y-8'>
            {sortedGroupedData.length > 0 ? (
                sortedGroupedData.map(({ date, records }) => (
                    <div key={date} className='mb-8'>
                        <div className='text-xl font-bold mb-3'>{formatDate(date)}</div>
                        <table className='w-full p-4 shadow-xl border-collapse rounded-2xl overflow-hidden'>
                            <thead>
                                <tr className='bg-cyan-600 text-white'>
                                    <th className='border py-4'>Sr. No</th>
                                    <th className='border px-4 py-2'>Name</th>
                                    <th className='border px-1 py-2'>In Time</th>
                                    <th className='border px-1 py-2'>Out Time</th>
                                    <th className='border py-2'>Remark</th>
                                </tr>
                            </thead>
                            <tbody>
                                {records.map((row, index) => (
                                    <tr key={`${row.id}-${index}`} className='text-center'>
                                        <td className='border py-2'>{index + 1}.</td>
                                        <td className='border font-bold px-4 py-2'>{row.name}</td>
                                        <td className='border px-4 py-2'>{row.inTime}</td>
                                        <td className='border px-4 py-2'>{row.outTime}</td>
                                        <td className={`border px-4 py-2 ${getColor(row.remark)}`}>{row.remark}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ))
            ) : (
                <div className="text-center text-gray-500 font-semibold text-lg py-10">
                    No attendance records found.
                </div>
            )}
        </div>
    );
}
