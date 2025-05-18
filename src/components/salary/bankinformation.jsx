"use client";
import { useRef } from "react";
import { MdOutlineFileDownload } from "react-icons/md";
import { FaFilePdf, FaFileImage } from "react-icons/fa";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
export default function EmployeeBankInfo() {
    const underlineRef = useRef(null);

    useGSAP(() => {
        gsap.fromTo(
            underlineRef.current,
            { scaleX: 0, transformOrigin: "left" },
            { scaleX: 1, duration: 0.8, ease: "power2.out" }
        );
    }, []);

    const data = [
        {
            sr: 1,
            name: "Shubham Prajapati",
            document: "Pass Book",
            date: "30-04-2025",
            type: "Pdf",
            fileUrl: "/layout/salary-slip.pdf", // Example path
        },
        {
            sr: 2,
            name: "Rohan Pawar",
            document: "Cheque Book",
            date: "28-04-2025",
            type: "Png",
            fileUrl: "/health.png",
        },
        {
            sr: 3,
            name: "Harsh Singh",
            document: "Pass Book",
            date: "10-04-2025",
            type: "Pdf",
            fileUrl: "/layout/salary-slip.pdf",
        },
        {
            sr: 4,
            name: "Henna",
            document: "Cheque Book",
            date: "09-04-2025",
            type: "Png",
            fileUrl: "/business.png",
        },
    ];

    const getTypeIcon = (type) =>
        type === "Pdf" ? (
            <FaFilePdf className="text-red-500" />
        ) : (
            <FaFileImage className="text-[#018ABE]" />
        );

    return (
        <div className="min-h-screen bg-white px-6 py-10">
            <h1 className="text-3xl font-bold mb-10 relative inline-block text-gray-800">
                <span
                    ref={underlineRef}
                    className="absolute left-0 top-10 h-[3px] bg-[#018ABE] w-full"
                ></span>
                Employee Bank Information
            </h1>

            <div className="overflow-x-auto bg-white rounded-lg shadow-lg">
                <table className="min-w-full text-sm text-left text-gray-700">
                    <thead className="bg-[#018ABE] text-white">
                        <tr>
                            <th className="px-4 w-[10%]  text-center border-r border-gray-300 py-2">
                                Sr No.
                            </th>
                            <th className="px-4 w-[20%] text-center border-r border-gray-300 py-2">
                                Name
                            </th>
                            <th className="px-4 w-[10%] text-center border-r border-gray-300 py-2">
                                Documents
                            </th>
                            <th className="px-4 w-[10%] text-center border-r border-gray-300 py-2">
                                Date
                            </th>
                            <th className="px-4 w-[10%] text-center border-r border-gray-300 py-2">
                                Type
                            </th>
                            <th className="px-4 w-[10%] text-center border-r border-gray-300 py-2">
                                Download
                            </th>
                            <th className="px-4 w-[10%] text-center py-2">Action</th>
                        </tr>
                    </thead>
                    <tbody className="text-center">
                        {data.map((emp) => (
                            <tr
                                key={emp.sr}
                                className="border-b border-gray-200 hover:bg-gray-100"
                            >
                                <td className="px-4 w-[10%] text-center py-2">{emp.sr}.</td>
                                <td className="px-4 w-[20%] text-center relative py-2">
                                    <span className="custom-border-left"></span>
                                    {emp.name}
                                </td>
                                <td className="px-4 w-[10%] text-center relative py-2 capitalize">
                                    <span className="custom-border-left"></span>
                                    {emp.document}
                                </td>
                                <td className="px-4 w-[10%] text-center relative py-2">
                                    <span className="custom-border-left"></span>
                                    {emp.date}
                                </td>
                                <td className="px-4 py-2 w-[10%] relative">
                                    <span className="custom-border-left"></span>
                                    <div className="flex justify-center items-center gap-2">
                                        {getTypeIcon(emp.type)}
                                        {emp.type}
                                    </div>
                                </td>

                                <td className="px-4 py-2 w-[10%] relative">
                                    <span className="custom-border-left"></span>
                                    <div className="flex justify-center">
                                        <a href={emp.fileUrl} download>
                                            <MdOutlineFileDownload className="text-black w-8 h-8 hover:text-[#018ABE] cursor-pointer" />
                                        </a>
                                    </div>
                                </td>
                                <td className="px-4 py-2 w-[10%] relative">
                                    <span className="custom-border-left"></span>
                                    <div className="flex justify-center items-center text-[#018ABE] hover:underline cursor-pointer">
                                        View
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
