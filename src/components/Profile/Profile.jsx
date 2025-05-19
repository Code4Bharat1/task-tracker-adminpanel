"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { FaRegEdit } from "react-icons/fa";
import toast from "react-hot-toast";
import axios from "axios";
import { Save } from "lucide-react";
import FancyLoader from "./FancyLoader";
import Sidebar from "../layout/sidebar";
import Navbar from "../layout/navbar";

function Page() {
    const [profile, setProfile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        fullName: "",
        phone: "",
        email: "",
        position: "",
        gender: "",
        address: "",
        dateOfJoining: "",
        companyName: "",
    });

    const fetchProfile = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/profile/getProfileAdmin`, {
                credentials: "include",
            });
            const data = await res.json();

            setProfile(data);
            setFormData({
                fullName: data.fullName || "",
                email: data.email || "",
                phone: data.phone || "",
                position: data.position || "Employee",
                gender: data.gender || "-",
                address: data.address || "-",
                dateOfJoining: data.dateOfJoining || "-",
                companyName: data.companyName || "-",
            });
            console.log("Profile data:", data);
        } catch (error) {
            console.error("Failed to fetch profile:", error);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.put(
                `${process.env.NEXT_PUBLIC_BACKEND_API}/profile/updateProfileAdmin`,
                formData,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                    withCredentials: true,
                }
            );

            if (res.status === 200) {
                fetchProfile();
                toast.success("Profile updated successfully!");
                setIsEditing(false);
                setProfile(res.data);
            }
        } catch (error) {
            console.error("Failed to update profile", error);
            toast.error(error.response?.data?.message || "Something went wrong");
        }
    };

    if (!profile)
        return (
            <div className="p-6 text-xl h-screen flex items-center justify-center">
                <FancyLoader />
            </div>
        );

    return (
        <div className="min-h-screen md:flex bg-white">
            <div className="md:w-1/6">
                <Sidebar />
            </div>

            <div className="w-full md:w-5/6 md:flex-1 h-screen bg-white">
                <Navbar />

                <div className="flex flex-col gap-6 py-4 px-12 pr-24">
                    {/* Header */}
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-[700]">My Profile</h1>
                            <div className="h-1 w-[70%] bg-[#FFB006] mt-1"></div>
                        </div>
                        <button
                            className="px-7 rounded-2xl h-12 text-lg font-semibold flex items-center gap-3 bg-[#018ABE] cursor-pointer text-white"
                            onClick={
                                isEditing
                                    ? handleSubmit
                                    : () => {
                                        setIsEditing(true);
                                        toast.success("You are now in edit mode!");
                                    }
                            }
                        >
                            {isEditing ? (
                                <>
                                    <Save /> Save
                                </>
                            ) : (
                                <>
                                    <FaRegEdit /> Edit
                                </>
                            )}
                        </button>
                    </div>

                    {/* Profile Banner */}
                    <div className="w-full h-78 bg-gradient-to-b from-[#018ABE] to-[#004058] rounded-2xl relative shadow-xl mb-8">
                        <Image src="/profile/lock.png" alt="Lock Icon" width={107} height={107} className="absolute opacity-50 top-4 left-4 -rotate-[19.89deg]" />
                        <Image src="/profile/Vector92.png" alt="Vector" width={57} height={69} className="absolute opacity-50 bottom-8 left-8" />
                        <Image src={profile.photoUrl || "/profile.png"} alt="Profile Picture" width={1000} height={1000} className="absolute top-10 left-[10%] h-[220px] w-[235px] object-cover rounded-full" />
                        <Image src="/profile/flagVector.png" alt="Flag Vector" width={49} height={71} className="absolute opacity-50 top-10 left-[33%]" />
                        <Image src="/profile/pencil.png" alt="Vector" width={113} height={147} className="absolute opacity-50 top-6 left-[45%]" />
                        <Image src="/profile/key.png" alt="Key Icon" width={151} height={150} className="absolute opacity-50 bottom-2 left-[35%]" />
                        <div className="absolute top-16 right-[5%] text-white">
                            <h1 className="text-4xl font-[700] mb-2">{profile.fullName}</h1>
                            <h2 className="text-3xl font-[400] mb-2">{profile.phone}</h2>
                            <h3 className="text-3xl font-[400] mb-2">{profile.email}</h3>
                            <h4 className="text-3xl font-[400] mb-2">{profile.position || "Employee"}</h4>
                        </div>
                        <Image src="/profile/flippedFlag.png" alt="Flipped Flag" width={68} height={125} className="absolute opacity-50 top-5 right-[5%]" />
                        <Image src="/profile/flippedPencil.png" alt="Flipped Pencil" width={113} height={147} className="absolute opacity-50 bottom-10 right-[10%]" />
                    </div>

                    {/* Form */}
                    <form className="flex flex-col gap-8 w-full mb-8" onSubmit={handleSubmit}>
                        <div className="flex justify-between w-full gap-28">
                            <div className="w-full flex flex-col">
                                <label htmlFor="companyName" className="text-xl font-[400]">Company Name</label>
                                <input
                                    type="text"
                                    id="companyName"
                                    value={formData.companyName}
                                    disabled
                                    className="px-4 py-2 rounded-xl shadow bg-gray-100 cursor-not-allowed focus:outline-none"
                                />
                            </div>
                            <div className="w-full flex flex-col">
                                <label htmlFor="fullName" className="text-xl font-[400]">Full Name</label>
                                <input
                                    type="text"
                                    id="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="px-4 py-2 rounded-xl shadow disabled:bg-gray-100 disabled:cursor-not-allowed focus:outline-none"
                                />
                            </div>
                        </div>

                        <div className="flex justify-between w-full gap-28">
                            <div className="w-full flex flex-col">
                                <label htmlFor="phoneNumber" className="text-xl font-[400]">Mobile Number</label>
                                <input
                                    type="text"
                                    id="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="px-4 py-2 rounded-xl shadow disabled:bg-gray-100 disabled:cursor-not-allowed focus:outline-none"
                                />
                            </div>
                            <div className="w-full flex flex-col">
                                <label htmlFor="email" className="text-xl font-[400]">Email Address</label>
                                <input
                                    type="email"
                                    id="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="px-4 py-2 rounded-xl shadow disabled:bg-gray-100 disabled:cursor-not-allowed focus:outline-none"
                                />
                            </div>
                        </div>

                        <div className="flex justify-between w-full gap-28">
                            <div className="w-full flex flex-col">
                                <label htmlFor="position" className="text-xl font-[400]">Designation</label>
                                <input
                                    type="text"
                                    id="position"
                                    value={formData.position}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="px-4 py-2 rounded-xl shadow disabled:bg-gray-100 disabled:cursor-not-allowed focus:outline-none"
                                />
                            </div>
                            <div className="w-full flex flex-col">
                                <label htmlFor="gender" className="text-xl font-[400]">Gender</label>
                                <select
                                    id="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="px-4 py-2 rounded-xl shadow disabled:bg-gray-100 disabled:cursor-not-allowed focus:outline-none"
                                >
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                        </div>

                        <div className="flex justify-between w-full gap-28">
                            <div className="w-full flex flex-col">
                                <label htmlFor="address" className="text-xl font-[400]">Address</label>
                                <textarea
                                    rows={3}
                                    id="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="px-4 py-2 rounded-xl shadow disabled:bg-gray-100 disabled:cursor-not-allowed focus:outline-none resize-none"
                                />
                            </div>
                            <div className="w-full flex flex-col">
                                <label htmlFor="dateOfJoining" className="text-xl font-[400]">Date of Joining</label>
                                <input
                                    type="date"
                                    id="dateOfJoining"
                                    value={formData.dateOfJoining?.slice(0, 10)} // ensure it's in yyyy-mm-dd format
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="px-4 py-2 rounded-xl shadow disabled:bg-gray-100 disabled:cursor-not-allowed focus:outline-none"
                                />
                            </div>

                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Page;
