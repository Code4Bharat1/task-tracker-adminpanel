"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RiBankFill, RiMoneyRupeeCircleFill } from "react-icons/ri";
import { CheckCircle, Clock, Eye, EyeOff, Filter, X } from "lucide-react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";

export default function SalaryPage() {
    const router = useRouter();
    const [filterStatus, setFilterStatus] = useState("All");
    const [showPayModal, setShowPayModal] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const underlineRef = useRef(null);

    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");

    const [salaryData, setSalaryData] = useState([
        { id: "NXC101", name: "Shubham Prajapati", role: "Senior Software Developer", amount: "₹25,000", rawAmount: 25000, date: "10-05-2025", status: "Pending", accountNumber: "123456789012345678", ifscCode: "SBIN0012345" },
        { id: "NXC102", name: "Rohan Pawar", role: "Senior Software Developer", amount: "₹25,000", rawAmount: 25000, date: "15-03-2025", status: "Pending", accountNumber: "987654321098765432", ifscCode: "HDFC0012345" },
        { id: "NXC103", name: "Harsh Singh", role: "Junior Graphic Designer", amount: "₹22,000", rawAmount: 22000, date: "18-05-2025", status: "Pending", accountNumber: "456789012345678901", ifscCode: "ICIC0012345" },
        { id: "NXC104", name: "Henna", role: "Junior Software Developer", amount: "₹20,000", rawAmount: 20000, date: "23-05-2025", status: "Pending", accountNumber: "567890123456789012", ifscCode: "UTIB0012345" },
    ]);

    useGSAP(() => {
        gsap.fromTo(underlineRef.current, { scaleX: 0, transformOrigin: "left" }, { scaleX: 1, duration: 0.8, ease: "power2.out" });
    }, []);

    const [formData, setFormData] = useState({ fullName: "", accountNumber: "", confirmAccountNumber: "", ifscCode: "", amount: "", employeeId: "" });
    const [errors, setErrors] = useState({ fullName: "", accountNumber: "", confirmAccountNumber: "", ifscCode: "", amount: "", employeeId: "" });
    const [touched, setTouched] = useState({ fullName: false, accountNumber: false, confirmAccountNumber: false, ifscCode: false, amount: false, employeeId: false });
    const [searchTerm, setSearchTerm] = useState("");
    const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [isValid, setIsValid] = useState(false);
    const [ifscSuggestions, setIfscSuggestions] = useState([]);
    const [showIfscSuggestions, setShowIfscSuggestions] = useState(false);

    const sampleIfscCodes = [
        { code: "SBIN0001234", bank: "State Bank of India" },
        { code: "HDFC0001234", bank: "HDFC Bank" },
        { code: "ICIC0001234", bank: "ICICI Bank" },
        { code: "UTIB0001234", bank: "Axis Bank" },
        { code: "PUNB0001234", bank: "Punjab National Bank" },
    ];

    useEffect(() => { validateForm(); }, [formData]);
    useEffect(() => {
        if (searchTerm.length > 0) {
            const filtered = salaryData.filter((employee) => employee.name.toLowerCase().includes(searchTerm.toLowerCase()));
            setFilteredEmployees(filtered);
            setShowEmployeeDropdown(filtered.length > 0);
        } else {
            setFilteredEmployees([]);
            setShowEmployeeDropdown(false);
        }
    }, [searchTerm, salaryData]);

    useEffect(() => {
        if (showToast) {
            const timer = setTimeout(() => setShowToast(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [showToast]);

    const validateForm = () => {
        const newErrors = { ...errors };
        let formIsValid = true;

        if (formData.fullName.trim() === "") {
            newErrors.fullName = "Full name is required";
            formIsValid = false;
        } else if (formData.fullName.trim().length < 3) {
            newErrors.fullName = "Full name must be at least 3 characters";
            formIsValid = false;
        } else {
            newErrors.fullName = "";
        }

        if (formData.accountNumber.trim() === "") {
            newErrors.accountNumber = "Account number is required";
            formIsValid = false;
        } else if (!/^\d+$/.test(formData.accountNumber)) {
            newErrors.accountNumber = "Account number must contain only digits";
            formIsValid = false;
        } else if (formData.accountNumber.length < 9 || formData.accountNumber.length > 18) {
            newErrors.accountNumber = "Account number must be 9 to 18 digits";
            formIsValid = false;
        } else {
            newErrors.accountNumber = "";
        }

        if (formData.confirmAccountNumber.trim() === "") {
            newErrors.confirmAccountNumber = "Please confirm account number";
            formIsValid = false;
        } else if (formData.accountNumber !== formData.confirmAccountNumber) {
            newErrors.confirmAccountNumber = "Account numbers do not match";
            formIsValid = false;
        } else {
            newErrors.confirmAccountNumber = "";
        }

        if (formData.ifscCode.trim() === "") {
            newErrors.ifscCode = "IFSC code is required";
            formIsValid = false;
        } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifscCode)) {
            newErrors.ifscCode = "Invalid IFSC format (e.g., SBIN0001234)";
            formIsValid = false;
        } else {
            newErrors.ifscCode = "";
        }

        if (formData.amount.trim() === "") {
            newErrors.amount = "Amount is required";
            formIsValid = false;
        } else if (!/^\d+(\.\d{1,2})?$/.test(formData.amount) || parseFloat(formData.amount) <= 0) {
            newErrors.amount = "Amount must be greater than zero";
            formIsValid = false;
        } else {
            newErrors.amount = "";
        }

        setErrors(newErrors);
        setIsValid(formIsValid);
        return formIsValid;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setTouched({ ...touched, [name]: true });

        if (name === "fullName") {
            setSearchTerm(value);
            setFormData({ ...formData, [name]: value });
        } else if (name === "accountNumber" || name === "confirmAccountNumber") {
            if (/^\d*$/.test(value) && value.length <= 18) {
                setFormData({ ...formData, [name]: value });
            }
        } else if (name === "ifscCode") {
            const upperValue = value.toUpperCase();
            setFormData({ ...formData, [name]: upperValue });

            if (upperValue.length >= 4) {
                const filtered = sampleIfscCodes.filter(
                    (item) => item.code.startsWith(upperValue) || item.bank.toUpperCase().includes(upperValue)
                );
                setIfscSuggestions(filtered);
                setShowIfscSuggestions(filtered.length > 0);
            } else {
                setShowIfscSuggestions(false);
            }
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const selectEmployee = (employee) => {
        setFormData({
            ...formData,
            fullName: employee.name,
            employeeId: employee.id,
            accountNumber: employee.accountNumber,
            confirmAccountNumber: employee.accountNumber,
            ifscCode: employee.ifscCode || "",
            amount: employee.rawAmount.toString(),
        });
        setSearchTerm(employee.name);
        setShowEmployeeDropdown(false);
    };

    const selectIfsc = (code) => {
        setFormData({ ...formData, ifscCode: code });
        setShowIfscSuggestions(false);
    };

    const handlePaymentSubmit = (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setToastMessage("Payment Successful!");
        setShowToast(true);
        setShowPayModal(false);
    };
    const resetForm = () => {
        setFormData({
            fullName: "",
            accountNumber: "",
            confirmAccountNumber: "",
            ifscCode: "",
            amount: "",
            employeeId: "",
        });
        setErrors({
            fullName: "",
            accountNumber: "",
            confirmAccountNumber: "",
            ifscCode: "",
            amount: "",
            employeeId: "",
        });
        setTouched({
            fullName: false,
            accountNumber: false,
            confirmAccountNumber: false,
            ifscCode: false,
            amount: false,
            employeeId: false,
        });
        setSearchTerm("");
        setShowEmployeeDropdown(false);
        setShowPayModal(false);
    };

    // Filter data based on selected status
    const filteredData =
        filterStatus === "All"
            ? salaryData
            : salaryData.filter((item) => item.status === filterStatus);
    const navigateToBankInfo = () => {
        // In a real app, this would navigate to a bank info page
        router.push("/bankinformation");
    };

    return (
        <div className="min-h-screen p-6 bg-white font-sans">
            {/* Toast notification */}
            {showToast && (
                <div className="fixed top-6 right-6 bg-white shadow-lg rounded-lg p-4 flex items-center z-50 animate-fadeIn">
                    <div
                        className={`mr-3 ${toastMessage.includes("successfully")
                            ? "text-green-500"
                            : "text-red-500"
                            }`}
                    >
                        {toastMessage.includes("successfully") ? (
                            <CheckCircle className="w-6 h-6" />
                        ) : (
                            <X className="w-6 h-6" />
                        )}
                    </div>
                    <div>
                        <p
                            className={`font-medium ${toastMessage.includes("successfully")
                                ? "text-green-600"
                                : "text-red-600"
                                }`}
                        >
                            {toastMessage}
                        </p>
                    </div>
                </div>
            )}

            <h1 className="text-3xl font-bold mb-6 relative inline-block text-gray-800">
                <span
                    ref={underlineRef}
                    className="absolute left-0 top-10 h-[3px] bg-[#018ABE] w-full"
                ></span>
                Salary
            </h1>

            {/* Buttons */}
            <div className="mt-6 flex justify-between items-center flex-wrap gap-4">
                <button
                    onClick={navigateToBankInfo}
                    className="flex items-center gap-2 cursor-pointer px-4 py-2 text-lg bg-[#018ABE] text-white rounded shadow hover:bg-[#009BB5] transition-colors"
                >
                    <RiBankFill className="w-8 h-8" /> Bank Information
                </button>

                <button
                    onClick={() => setShowPayModal(true)}
                    className="flex items-center gap-2 px-4 py-2 cursor-pointer text-lg bg-[#018ABE] text-white rounded shadow hover:bg-[#009BB5] transition-colors"
                >
                    <RiMoneyRupeeCircleFill className="w-8 h-8" /> Pay salary
                </button>
            </div>

            {/* Salary History */}
            <div className="mt-10 flex justify-between items-center">
                <h2 className="text-xl font-semibold">Salary History</h2>

                {/* Filter */}
                <div className="relative">
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="pl-3 pr-8 py-2 rounded shadow-md appearance-none cursor-pointer"
                    >
                        <option value="All">Filter</option>
                        <option value="Paid">Paid</option>
                        <option value="Pending">Pending</option>
                    </select>
                    <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                </div>
            </div>

            {/* Table */}
            <div className="mt-4 bg-white shadow-lg rounded-lg overflow-hidden">
                <table className="min-w-full border-separate border-spacing-0">
                    <thead className="bg-[#018ABE] text-white">
                        <tr>
                            <th className="px-4 py-3 w-[10%] border-r border-gray-200 text-left">
                                Employee ID
                            </th>
                            <th className="px-4 py-3 w-[40%] border-r border-gray-200 text-left">
                                Employee Name
                            </th>
                            <th className="px-4 py-3 w-[10%] border-r border-gray-200 text-center">
                                Amount (₹)
                            </th>
                            <th className="px-4 py-3 w-[10%] border-r border-gray-200 text-center">
                                Date
                            </th>
                            <th className="px-4 py-3 w-[10%] border-r border-gray-200 text-center">
                                Status
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.map((item, idx) => (
                            <tr
                                key={idx}
                                className="border-t hover:bg-gray-50 transition-colors"
                            >
                                <td className="px-4 py-3 w-[10%] relative text-gray-700 font-medium">
                                    {" "}
                                    {item.id}
                                </td>
                                <td className="px-4 py-3 relative">
                                    <span className="custom-border-left"></span>
                                    <span className="font-medium w-[40%] ">
                                        {" "}
                                        {item.name}
                                    </span>{" "}
                                    <span className="text-gray-500 w-[10%]"> - {item.role}</span>
                                </td>
                                <td className="px-4 py-3 w-[10%] font-medium relative text-center">
                                    <span className="custom-border-left"></span>
                                    {item.amount}
                                </td>
                                <td className="px-4 py-3 text-center w-[10%] relative">
                                    <span className="custom-border-left"></span>
                                    {item.date}
                                </td>
                                <td className="px-4 py-3 w-[10%] text-center relative">
                                    <span className="custom-border-left"></span>
                                    {item.status === "Paid" ? (
                                        <span className="inline-flex items-center gap-1 font-medium text-green-600">
                                            <CheckCircle className="w-4 h-4" /> Paid
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 font-medium text-orange-500">
                                            <Clock className="w-4 h-4" /> Pending
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pay Salary Modal */}
            {showPayModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg w-full max-w-xl p-6 relative px-20">
                        <button
                            onClick={() => setShowPayModal(false)}
                            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
                            aria-label="Close modal"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <form
                            className="space-y-4"
                            onSubmit={handlePaymentSubmit}
                            noValidate
                        >
                            <div className="relative">
                                <label className="block text-lg font-medium mb-1">
                                    Employee Name:
                                </label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={searchTerm}
                                    onChange={handleInputChange}
                                    onBlur={() => {
                                        // Delay hiding the dropdown to allow click events to register
                                        setTimeout(() => {
                                            if (
                                                !document.activeElement?.closest(".employee-dropdown")
                                            ) {
                                                setShowEmployeeDropdown(false);
                                            }
                                        }, 200);
                                        setTouched({ ...touched, fullName: true });
                                    }}
                                    onFocus={() => {
                                        if (searchTerm.length > 0) {
                                            setShowEmployeeDropdown(filteredEmployees.length > 0);
                                        }
                                    }}
                                    className={`w-full p-2 border ${touched.fullName && errors.fullName
                                        ? "border-red-500"
                                        : "border-gray-300"
                                        } shadow-[0px_2px_0px_rgba(0,0,0,0.2)] rounded focus:outline-none focus:ring-2 focus:ring-blue-300`}
                                    placeholder="Type to search employee"
                                />
                                {showEmployeeDropdown && (
                                    <ul className="employee-dropdown absolute z-10 bg-white border border-gray-300 rounded shadow-lg w-full max-h-60 overflow-y-auto mt-1">
                                        {filteredEmployees.map((employee) => (
                                            <li
                                                key={employee.id}
                                                className="px-4 py-2 hover:bg-blue-50 cursor-pointer flex items-center justify-between"
                                                onClick={() => {
                                                    selectEmployee(employee);
                                                }}
                                                onMouseDown={(e) => {
                                                    // Prevent the blur event from hiding the dropdown before click
                                                    e.preventDefault();
                                                }}
                                            >
                                                <div>
                                                    <div className="font-medium">{employee.name}</div>
                                                    <div className="text-sm text-gray-500">
                                                        {employee.role}
                                                    </div>
                                                </div>
                                                <div className="text-sm font-medium text-gray-700">
                                                    {employee.amount}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                {touched.fullName && errors.fullName && (
                                    <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-lg font-medium mb-1">
                                    Account Number:{" "}
                                    <span className="text-sm text-gray-500">(9-18 digits)</span>
                                </label>
                                <input
                                    type="text"
                                    name="accountNumber"
                                    value={formData.accountNumber}
                                    onChange={handleInputChange}
                                    onBlur={() => setTouched({ ...touched, accountNumber: true })}
                                    className={`w-full p-2 border ${touched.accountNumber && errors.accountNumber
                                        ? "border-red-500"
                                        : "border-gray-300"
                                        } shadow-[0px_2px_0px_rgba(0,0,0,0.2)] rounded focus:outline-none focus:ring-2 focus:ring-blue-300`}
                                    placeholder="Enter 9-18 digit account number"
                                />
                                {touched.accountNumber && errors.accountNumber && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.accountNumber}
                                    </p>
                                )}
                                {!errors.accountNumber && formData.accountNumber.length > 0 && (
                                    <p className="text-green-600 text-sm mt-1">Looks good!</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-lg font-medium mb-1">
                                    Confirm Account Number:
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="confirmAccountNumber"
                                        value={formData.confirmAccountNumber}
                                        onChange={handleInputChange}
                                        onBlur={() =>
                                            setTouched({ ...touched, confirmAccountNumber: true })
                                        }
                                        className={`w-full p-2 border ${touched.confirmAccountNumber &&
                                            errors.confirmAccountNumber
                                            ? "border-red-500"
                                            : "border-gray-300"
                                            } shadow-[0px_2px_0px_rgba(0,0,0,0.2)] rounded focus:outline-none focus:ring-2 focus:ring-blue-300 pr-10`}
                                        placeholder="Re-enter your account number"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                                {touched.confirmAccountNumber &&
                                    errors.confirmAccountNumber && (
                                        <p className="text-red-500 text-sm mt-1">
                                            {errors.confirmAccountNumber}
                                        </p>
                                    )}
                            </div>

                            <div className="relative">
                                <label className="block text-lg font-medium mb-1">
                                    IFSC Code:
                                </label>
                                <input
                                    type="text"
                                    name="ifscCode"
                                    value={formData.ifscCode}
                                    onChange={handleInputChange}
                                    onBlur={() => setTouched({ ...touched, ifscCode: true })}
                                    className={`w-full p-2 border ${touched.ifscCode && errors.ifscCode
                                        ? "border-red-500"
                                        : "border-gray-300"
                                        } shadow-[0px_2px_0px_rgba(0,0,0,0.2)] rounded focus:outline-none focus:ring-2 focus:ring-blue-300`}
                                    maxLength={11}
                                    placeholder="e.g., SBIN0001234"
                                    autoComplete="off"
                                />
                                {showIfscSuggestions && (
                                    <ul className="absolute z-10 bg-white border border-gray-300 rounded shadow w-full max-h-40 overflow-auto mt-1">
                                        {ifscSuggestions.map((item) => (
                                            <li
                                                key={item.code}
                                                onClick={() => selectIfsc(item.code)}
                                                onMouseDown={(e) => e.preventDefault()}
                                                className="px-3 py-2 hover:bg-blue-50 cursor-pointer"
                                            >
                                                <strong>{item.code}</strong> - {item.bank}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                {touched.ifscCode && errors.ifscCode && (
                                    <p className="text-red-500 text-sm mt-1">{errors.ifscCode}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-lg font-medium mb-1">
                                    Amount:
                                </label>
                                <input
                                    type="number"
                                    name="amount"
                                    value={formData.amount}
                                    onChange={handleInputChange}
                                    onBlur={() => setTouched({ ...touched, amount: true })}
                                    className={`w-full p-2 border ${touched.amount && errors.amount
                                        ? "border-red-500"
                                        : "border-gray-300"
                                        } shadow-[0px_2px_0px_rgba(0,0,0,0.2)] rounded focus:outline-none focus:ring-2 focus:ring-blue-300`}
                                    min="0.01"
                                    step="0.01"
                                    placeholder="Enter amount to pay"
                                />
                                {touched.amount && errors.amount && (
                                    <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
                                )}
                            </div>

                            <div className="flex flex-col items-center mt-8">
                                <button
                                    type="submit"
                                    disabled={!isValid}
                                    className={`px-10 py-2 rounded-md text-lg font-medium text-white ${isValid
                                        ? "bg-[#018ABE] hover:bg-[#5e92a6]"
                                        : "bg-gray-400 cursor-not-allowed"
                                        } transition-colors`}
                                >
                                    Pay
                                </button>
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="bg-white underline text-gray-800 px-6 py-1 mt-1"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
