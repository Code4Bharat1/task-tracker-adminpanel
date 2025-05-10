'use client'
import { useState, useEffect } from 'react';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';

export default function PasswordResetForm() {
    const router = useRouter();
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [email, setEmail] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Move useEffect here to set the email on component mount
    useEffect(() => {
        const storedEmail = localStorage.getItem("email");
        if (storedEmail) {
            setEmail(storedEmail); // Set email from localStorage
        }
    }, []);

    const handleSubmit = async () => {
        if (!otp || !password || !confirmPassword) {
            toast.error('Please fill all the fields');
            return;
        }

        if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
            toast.error('OTP must be exactly 6 digits');
            return;
        }

        const passwordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

        if (!passwordRegex.test(password)) {
            toast.error(
                'Password must be at least 8 characters and include uppercase, lowercase, number, and special character'
            );
            return;
        }

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_API}/forgotpassword/verify-otp`, {
                email: email,
                otp: otp,
                newPassword: password,
            });


            // If the response is successful
            if (response.status === 200) {
                toast.success('Password updated successfully!');
                router.push('/');
            } else {
                toast.error('Failed to update password. Please try again.');
            }


            // Clear fields after submission
            setOtp('');
            setPassword('');
            setConfirmPassword('');

            // Optionally, redirect the user to a login page or another relevant page
            // router.push('/login'); // Add this line if using next.js router or similar routing
        } catch (error) {
            // If there's an error in the API request
            toast.error('Error updating password. Please try again later.');
            console.error('Error updating password:', error);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-300 to-blue-600 relative">
            <Toaster position="top-center" reverseOrder={false} />

            <div
                className="absolute inset-0 z-0 bg-cover bg-center"
                style={{ backgroundImage: "url('/loginbg.png')", opacity: 0.6 }}
            ></div>

            <div className="absolute left-0 bottom-1/4 w-24 h-24 bg-teal-800 opacity-20 transform rotate-45 -translate-x-8"></div>

            <div className="w-full max-w-3xl bg-white rounded-lg p-8 shadow-lg z-10">
                <h1 className="text-3xl font-bold text-center text-[#018ABE] mb-4">Forget Password</h1>
                <h2 className="text-2xl font-extrabold text-center text-gray-900 mb-6">Request OTP</h2>

                <div className="pr-40 pl-40">
                    <div className="mb-4">
                        <label htmlFor="otp" className="block text-gray-700 font-semibold mb-1">Enter OTP</label>
                        <input
                            type="text"
                            id="otp"
                            value={otp}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (/^\d{0,6}$/.test(val)) {
                                    setOtp(val);
                                }
                            }}
                            className="w-full p-3 bg-[#EBE7E7] rounded-xl"
                            placeholder="Enter 6-digit OTP"
                            required
                        />
                    </div>

                    <div className="mb-4 relative">
                        <label htmlFor="password" className="block text-gray-700 font-semibold mb-1">Password</label>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 bg-[#EBE7E7] rounded-xl pr-10"
                            required
                        />
                        <div
                            className="absolute top-11 right-3 cursor-pointer text-gray-700"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                        </div>
                    </div>

                    <div className="mb-6 relative">
                        <label htmlFor="confirmPassword" className="block text-gray-900 font-semibold mb-1">Confirm Password</label>
                        <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full p-3 bg-[#EBE7E7] rounded-xl pr-10"
                            required
                        />
                        <div
                            className="absolute top-11 right-3 cursor-pointer text-gray-900"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                            {showConfirmPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                        </div>
                    </div>

                    <div className="flex row items-center justify-center">
                        <button
                            onClick={handleSubmit}
                            className="w-70 bg-[#018ABE] font-bold hover:bg-cyan-700 text-white py-3 rounded-xl transition-colors cursor-pointer"
                        >
                            Submit
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
