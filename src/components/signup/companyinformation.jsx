'use client';
import React, { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import Image from "next/image";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axios from 'axios';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const RegistrationForm = () => {
    const [formData, setFormData] = useState({
        companyName: "",
        websiteUrl: "",
        companyEmail: "",
        phoneNumber: "",
        country: "India", // Default set to India
        state: "",
        firstName: "",
        email: "",
        designation: "",
        phone: "",
        password: "",
        confirmPassword: "",
        desiredPlan: "",
        expectedStartDate: "",
        expectedUsers: "",
        planPhoneNumber: "",
        termsAccepted: true, // Added terms acceptance field
    });

    const router = useRouter();
    const texts = [
        "Reduces time spent remembering or searching for Tasks",
        "Improves task handling through simple, efficient tracking.",
        "Simplifies tracking and managing tasks efficiently every day."
    ];

    // Indian states array
    const indianStates = [
        "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
        "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
        "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
        "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
        "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh",
        "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir",
        "Ladakh", "Lakshadweep", "Puducherry"
    ];

    const [index, setIndex] = useState(0);
    const [animate, setAnimate] = useState(true);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setAnimate(false); // reset animation
            setTimeout(() => {
                setIndex((prev) => (prev + 1) % texts.length);
                setAnimate(true); // re-trigger animation
            }, 100); // short delay to reset class
        }, 3000); // every 3 seconds

        return () => clearInterval(interval);
    }, []);

    const registerCompany = async (formattedData) => {
        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_BACKEND_API}/compnayRegister/register`,
                formattedData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
            return response.data;
        } catch (error) {
            console.error("Company registration failed:", error.response?.data || error.message);
            throw error;
        }
    };

    const [step, setStep] = useState(1);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const validateEmail = (email) => {
        const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return re.test(email);
    };

    const validateIndianPhone = (phone) => {
        const re = /^[6-9]\d{9}$/;
        return re.test(phone);
    };

    const validatePassword = (password) => {
        // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
        const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return re.test(password);
    };

    const validateURL = (url) => {
        if (!url) return true; // Optional field
        const re = /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;
        return re.test(url);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({ 
            ...prev, 
            [name]: type === 'checkbox' ? checked : value 
        }));

        // Clear specific error when field is being edited
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: null }));
        }
    };

    const validateStep1 = () => {
        const newErrors = {};

        if (!formData.companyName.trim()) {
            newErrors.companyName = "Company name is required";
        }

        if (!formData.companyEmail.trim()) {
            newErrors.companyEmail = "Company email is required";
        } else if (!validateEmail(formData.companyEmail)) {
            newErrors.companyEmail = "Please enter a valid email address";
        }

        if (!formData.phoneNumber.trim()) {
            newErrors.phoneNumber = "Phone number is required";
        } else if (!validateIndianPhone(formData.phoneNumber)) {
            newErrors.phoneNumber = "Please enter a valid 10-digit Indian phone number";
        }

        if (!formData.country) {
            newErrors.country = "Country is required";
        }

        if (!formData.state) {
            newErrors.state = "State is required";
        }

        if (formData.websiteUrl && !validateURL(formData.websiteUrl)) {
            newErrors.websiteUrl = "Please enter a valid URL";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep2 = () => {
        const newErrors = {};

        if (!formData.firstName.trim()) {
            newErrors.firstName = "Full name is required";
        }

        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!validateEmail(formData.email)) {
            newErrors.email = "Please enter a valid email address";
        }

        if (!formData.designation.trim()) {
            newErrors.designation = "Designation is required";
        }

        if (!formData.phone.trim()) {
            newErrors.phone = "Phone number is required";
        } else if (!validateIndianPhone(formData.phone)) {
            newErrors.phone = "Please enter a valid 10-digit Indian phone number";
        }

        if (!formData.password) {
            newErrors.password = "Password is required";
        } else if (!validatePassword(formData.password)) {
            newErrors.password = "Password must be at least 8 characters with uppercase, lowercase, number, and special character";
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = "Please confirm your password";
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep3 = () => {
        const newErrors = {};

        if (!formData.desiredPlan) {
            newErrors.desiredPlan = "Please select a plan";
        }

        if (!formData.expectedStartDate) {
            newErrors.expectedStartDate = "Expected start date is required";
        }

        if (!formData.expectedUsers) {
            newErrors.expectedUsers = "Number of expected users is required";
        } else if (formData.expectedUsers <= 0) {
            newErrors.expectedUsers = "Number of users must be greater than 0";
        }

        if (!formData.planPhoneNumber.trim()) {
            newErrors.planPhoneNumber = "Phone number is required";
        } else if (!validateIndianPhone(formData.planPhoneNumber)) {
            newErrors.planPhoneNumber = "Please enter a valid 10-digit Indian phone number";
        }

        if (!formData.termsAccepted) {
            newErrors.termsAccepted = "You must accept the terms and conditions";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNextPage = () => {
        let isValid = false;

        if (step === 1) {
            isValid = validateStep1();
        } else if (step === 2) {
            isValid = validateStep2();
        }

        if (isValid) {
            setStep(step + 1);
            // Scroll to top when changing steps
            window.scrollTo(0, 0);
            toast.success(`Step ${step} completed successfully!`);
        } else {
            toast.error("Please fix the errors before proceeding.");
        }
    };

    const handlePreviousPage = () => {
        if (step > 1) {
            setStep(step - 1);
            // Scroll to top when changing steps
            window.scrollTo(0, 0);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); // prevent page reload
        
        const isValid = validateStep3();

        if (isValid) {
            setIsSubmitting(true);
            
            // Format data according to backend controller structure
            const formattedData = {
                companyInfo: {
                    companyName: formData.companyName,
                    websiteUrl: formData.websiteUrl,
                    companyEmail: formData.companyEmail,
                    phoneNumber: formData.phoneNumber,
                    country: formData.country,
                    state: formData.state,
                },
                adminInfo: {
                    fullName: formData.firstName,
                    officialEmail: formData.email,
                    designation: formData.designation,
                    phoneNumber: formData.phone,
                    password: formData.password,
                },
                planPreferences: {
                    desiredPlan: formData.desiredPlan,
                    expectedStartDate: formData.expectedStartDate,
                    expectedUsers: formData.expectedUsers,
                    supportPhoneNumber: formData.planPhoneNumber,
                },
                termsAccepted: formData.termsAccepted,
                status: "Pending"
            };

            try {
                const result = await registerCompany(formattedData);
                toast.success("Registration completed successfully! Redirecting to dashboard...");
                console.log("✅ Success:", result);
                
                // Redirect after short delay
                setTimeout(() => {
                    // router.push('/dashboard'); // Uncomment when route is ready
                }, 3000);
            } catch (err) {
                console.error("❌ Error submitting form", err);
                const errorMessage = err.response?.data?.message || "Registration failed. Please try again.";
                toast.error(errorMessage);
            } finally {
                setIsSubmitting(false);
            }
        } else {
            toast.error("Please fix the errors before submitting.");
            console.log("Errors:", errors);
        }
    };

    return (
        <div className="flex flex-row h-screen">
            {/* Toast Container */}
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />

            {/* Left Side */}
            <div
                className="w-2/5 h-full bg-cover bg-center relative flex items-center justify-center"
                style={{ backgroundImage: "url('/signup/bgleft.png')" }}
            >
                <div className="flex flex-col items-center gap-1">
                    <Image src="/signup/tasklogo.png" alt="Logo" width={300} height={150} />
                    <Image src="/signup/image1.png" alt="Image" width={300} height={150} className="-mt-20" />
                    <p
                        key={index} // ensures animation re-runs
                        className={`text-black text-2xl mx-30 text-center -mt-2 transition-all duration-700 ease-in-out ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
                            }`}
                    >
                        {texts[index]}
                    </p>
                </div>
            </div>

            {/* Right Section */}
            <div className="flex flex-col items-center justify-center min-h-screen bg-white px-4 w-full md:w-3/5 relative overflow-y-auto">
                {/* Decorative Vectors */}

                <div className="w-full max-w-xl z-10 py-8">
                    <h2 className="text-3xl font-bold text-black mb-6 text-center">Company Registration</h2>

                    {/* Progress Bar */}
                    <div className="w-full mb-8">
                        <div className="flex justify-between mb-2">
                            <span className={`text-sm ${step >= 1 ? 'text-cyan-600 font-medium' : 'text-gray-500'}`}>Company Info</span>
                            <span className={`text-sm ${step >= 2 ? 'text-cyan-600 font-medium' : 'text-gray-500'}`}>Admin Info</span>
                            <span className={`text-sm ${step >= 3 ? 'text-cyan-600 font-medium' : 'text-gray-500'}`}>Plan & Preferences</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div className="bg-cyan-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${(step / 3) * 100}%` }}></div>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-2xl shadow-lg w-full border border-gray-100">
                        {/* Step 1 */}
                        {step === 1 && (
                            <>
                                <h3 className="text-xl font-semibold mb-6 text-cyan-700">Company Information</h3>
                                <form className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block mb-1 font-medium text-gray-700">Company Name <span className="text-red-500">*</span></label>
                                        <input
                                            name="companyName"
                                            value={formData.companyName}
                                            onChange={handleChange}
                                            className={`w-full p-3 rounded-xl border ${errors.companyName ? 'border-red-500 bg-red-50' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                                            placeholder="Enter company name"
                                        />
                                        {errors.companyName && <p className="text-red-500 text-sm mt-1">{errors.companyName}</p>}
                                    </div>

                                    <div>
                                        <label className="block mb-1 font-medium text-gray-700">Website URL (Optional)</label>
                                        <input
                                            name="websiteUrl"
                                            value={formData.websiteUrl}
                                            onChange={handleChange}
                                            className={`w-full p-3 rounded-xl border ${errors.websiteUrl ? 'border-red-500 bg-red-50' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                                            placeholder="https://example.com"
                                        />
                                        {errors.websiteUrl && <p className="text-red-500 text-sm mt-1">{errors.websiteUrl}</p>}
                                    </div>

                                    <div>
                                        <label className="block mb-1 font-medium text-gray-700">Company Email <span className="text-red-500">*</span></label>
                                        <input
                                            type="email"
                                            name="companyEmail"
                                            value={formData.companyEmail}
                                            onChange={handleChange}
                                            className={`w-full p-3 rounded-xl border ${errors.companyEmail ? 'border-red-500 bg-red-50' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                                            placeholder="company@example.com"
                                        />
                                        {errors.companyEmail && <p className="text-red-500 text-sm mt-1">{errors.companyEmail}</p>}
                                    </div>

                                    <div>
                                        <label className="block mb-1 font-medium text-gray-700">Phone Number <span className="text-red-500">*</span></label>
                                        <div className="flex items-center">
                                            <span className="bg-gray-100 p-3 rounded-l-xl border border-r-0 border-gray-300">+91</span>
                                            <input
                                                type="tel"
                                                name="phoneNumber"
                                                value={formData.phoneNumber}
                                                onChange={handleChange}
                                                className={`w-full p-3 rounded-r-xl border ${errors.phoneNumber ? 'border-red-500 bg-red-50' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                                                placeholder="10-digit number"
                                                maxLength="10"
                                            />
                                        </div>
                                        {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>}
                                    </div>

                                    <div>
                                        <label className="block mb-1 font-medium text-gray-700">Country <span className="text-red-500">*</span></label>
                                        <select
                                            name="country"
                                            value={formData.country}
                                            onChange={handleChange}
                                            className={`w-full p-3 rounded-xl border ${errors.country ? 'border-red-500 bg-red-50' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                                            disabled
                                        >
                                            <option value="India">India</option>
                                        </select>
                                        {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country}</p>}
                                    </div>

                                    <div>
                                        <label className="block mb-1 font-medium text-gray-700">State <span className="text-red-500">*</span></label>
                                        <select
                                            name="state"
                                            value={formData.state}
                                            onChange={handleChange}
                                            className={`w-full p-3 rounded-xl border ${errors.state ? 'border-red-500 bg-red-50' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                                        >
                                            <option value="">Select State</option>
                                            {indianStates.map((state, idx) => (
                                                <option key={idx} value={state}>{state}</option>
                                            ))}
                                        </select>
                                        {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
                                    </div>
                                </form>
                            </>
                        )}

                        {/* Step 2 */}
                        {step === 2 && (
                            <>
                                <h3 className="text-xl font-semibold mb-6 text-cyan-700">Primary Admin (Owner) Information</h3>
                                <form className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block mb-1 font-medium text-gray-700">Full Name <span className="text-red-500">*</span></label>
                                        <input
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            className={`w-full p-3 rounded-xl border ${errors.firstName ? 'border-red-500 bg-red-50' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                                            placeholder="Enter your full name"
                                        />
                                        {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                                    </div>

                                    <div>
                                        <label className="block mb-1 font-medium text-gray-700">Official Email <span className="text-red-500">*</span></label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className={`w-full p-3 rounded-xl border ${errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                                            placeholder="name@company.com"
                                        />
                                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                                    </div>

                                    <div>
                                        <label className="block mb-1 font-medium text-gray-700">Designation <span className="text-red-500">*</span></label>
                                        <input
                                            name="designation"
                                            value={formData.designation}
                                            onChange={handleChange}
                                            className={`w-full p-3 rounded-xl border ${errors.designation ? 'border-red-500 bg-red-50' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                                            placeholder="e.g. CEO, Manager, Director"
                                        />
                                        {errors.designation && <p className="text-red-500 text-sm mt-1">{errors.designation}</p>}
                                    </div>

                                    <div>
                                        <label className="block mb-1 font-medium text-gray-700">Phone Number <span className="text-red-500">*</span></label>
                                        <div className="flex items-center">
                                            <span className="bg-gray-100 p-3 rounded-l-xl border border-r-0 border-gray-300">+91</span>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                className={`w-full p-3 rounded-r-xl border ${errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                                                placeholder="10-digit number"
                                                maxLength="10"
                                            />
                                        </div>
                                        {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                                    </div>

                                    <div>
                                        <label className="block mb-1 font-medium text-gray-700">Create Password <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                name="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                className={`w-full p-3 rounded-xl border ${errors.password ? 'border-red-500 bg-red-50' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                                                placeholder="Min. 8 characters"
                                            />
                                            <span onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3 cursor-pointer text-gray-500 hover:text-gray-700">
                                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                                            </span>
                                        </div>
                                        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                                        {!errors.password && (
                                            <p className="text-gray-500 text-xs mt-1">
                                                Password must contain at least 8 characters, including uppercase, lowercase, number and special character
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block mb-1 font-medium text-gray-700">Confirm Password <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                name="confirmPassword"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                className={`w-full p-3 rounded-xl border ${errors.confirmPassword ? 'border-red-500 bg-red-50' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                                                placeholder="Confirm your password"
                                            />
                                            <span onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-3 cursor-pointer text-gray-500 hover:text-gray-700">
                                                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                            </span>
                                        </div>
                                        {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                                    </div>
                                </form>
                            </>
                        )}

                        {/* Step 3: Plan & Preferences */}
                        {step === 3 && (
                            <>
                                <h3 className="text-xl font-semibold mb-6 text-cyan-700">Plan & Preferences</h3>
                                <form className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block mb-1 font-medium text-gray-700">Desired Plan <span className="text-red-500">*</span></label>
                                        <select
                                            name="desiredPlan"
                                            value={formData.desiredPlan}
                                            onChange={handleChange}
                                            className={`w-full p-3 rounded-xl border ${errors.desiredPlan ? 'border-red-500 bg-red-50' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                                        >
                                            <option value="">Select Plan</option>
                                            <option value="Basic">Basic (₹499/month)</option>
                                            <option value="Standard">Standard (₹999/month)</option>
                                            <option value="Premium">Premium (₹1999/month)</option>
                                        </select>
                                        {errors.desiredPlan && <p className="text-red-500 text-sm mt-1">{errors.desiredPlan}</p>}
                                    </div>

                                    <div>
                                        <label className="block mb-1 font-medium text-gray-700">Expected Start Date <span className="text-red-500">*</span></label>
                                        <input
                                            type="date"
                                            name="expectedStartDate"
                                            value={formData.expectedStartDate}
                                            onChange={handleChange}
                                            min={new Date().toISOString().split('T')[0]}
                                            className={`w-full p-3 rounded-xl border ${errors.expectedStartDate ? 'border-red-500 bg-red-50' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                                        />
                                        {errors.expectedStartDate && <p className="text-red-500 text-sm mt-1">{errors.expectedStartDate}</p>}
                                    </div>

                                    <div>
                                        <label className="block mb-1 font-medium text-gray-700">Number of Expected Users <span className="text-red-500">*</span></label>
                                        <input
                                            type="number"
                                            name="expectedUsers"
                                            value={formData.expectedUsers}
                                            onChange={handleChange}
                                            min="1"
                                            className={`w-full p-3 rounded-xl border ${errors.expectedUsers ? 'border-red-500 bg-red-50' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                                            placeholder="Enter number of users"
                                        />
                                        {errors.expectedUsers && <p className="text-red-500 text-sm mt-1">{errors.expectedUsers}</p>}
                                    </div>

                                    <div>
                                        <label className="block mb-1 font-medium text-gray-700">Support Phone Number <span className="text-red-500">*</span></label>
                                        <div className="flex items-center">
                                            <span className="bg-gray-100 p-3 rounded-l-xl border border-r-0 border-gray-300">+91</span>
                                            <input
                                                type="tel"
                                                name="planPhoneNumber"
                                                value={formData.planPhoneNumber}
                                                onChange={handleChange}
                                                className={`w-full p-3 rounded-r-xl border ${errors.planPhoneNumber ? 'border-red-500 bg-red-50' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                                                placeholder="10-digit number"
                                                maxLength="10"
                                            />
                                        </div>
                                        {errors.planPhoneNumber && <p className="text-red-500 text-sm mt-1">{errors.planPhoneNumber}</p>}
                                    </div>
                                </form>

                                <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
                                    <h4 className="text-blue-800 font-semibold mb-2">Plan Summary</h4>
                                    {formData.desiredPlan && (
                                        <div className="text-sm text-gray-700">
                                            <p><span className="font-medium">Selected Plan:</span> {formData.desiredPlan}</p>
                                            <p className="mt-1"><span className="font-medium">Features:</span></p>
                                            <ul className="list-disc pl-5 mt-1 space-y-1">
                                                {formData.desiredPlan === "Basic" && (
                                                    <>
                                                        <li>Up to 10 users</li>
                                                        <li>Basic task management</li>
                                                        <li>Email support</li>
                                                    </>
                                                )}
                                                {formData.desiredPlan === "Standard" && (
                                                    <>
                                                        <li>Up to 50 users</li>
                                                        <li>Advanced task management</li>
                                                        <li>Priority email & phone support</li>
                                                        <li>Reporting & analytics</li>
                                                    </>
                                                )}
                                                {formData.desiredPlan === "Premium" && (
                                                    <>
                                                        <li>Unlimited users</li>
                                                        <li>Complete task management suite</li>
                                                        <li>24/7 priority support</li>
                                                        <li>Advanced reporting & analytics</li>
                                                        <li>Custom integrations</li>
                                                        <li>Dedicated account manager</li>
                                                    </>
                                                )}
                                            </ul>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-6">
                                    <label className="flex items-center">
                                        <input type="checkbox" className="w-4 h-4 text-cyan-600 rounded focus:ring-cyan-500" required />
                                        <span className="ml-2 text-sm text-gray-700">I agree to the <a href="#" className="text-cyan-600 hover:underline">Terms of Service</a> and <a href="#" className="text-cyan-600 hover:underline">Privacy Policy</a></span>
                                    </label>
                                </div>
                            </>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex justify-between mt-8">
                            {step > 1 && (
                                <button
                                    onClick={handlePreviousPage}
                                    className="py-2.5 px-6 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium transition-colors duration-200 flex items-center gap-2"
                                    type="button"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                                    </svg>
                                    Back
                                </button>
                            )}
                            <button
                                onClick={step === 3 ? handleSubmit : handleNextPage}
                                className={`py-2.5 px-6 rounded-xl ${step === 3 ? 'bg-green-600 hover:bg-green-700' : 'bg-cyan-600 hover:bg-cyan-700'} text-white font-medium transition-colors duration-200 flex items-center gap-2 ml-auto`}
                                type="button"
                            >
                                {step === 3 ? 'Complete Registration' : 'Continue'}
                                {step !== 3 && (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                )}
                                {step === 3 && (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Help Section */}
                    <div className="mt-8 text-center">
                        <p className="text-gray-600 text-sm">
                            Need help? <a href="#" className="text-cyan-600 hover:underline">Contact Support</a> or call +91 1800-XXX-XXXX
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegistrationForm;