"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import { FaRegEdit, FaEye, FaTrash } from "react-icons/fa";
import toast from "react-hot-toast";
import axios from "axios";
import { Save, X, Check, Camera } from "lucide-react";
import FancyLoader from "./FancyLoader";
import Sidebar from "../layout/sidebar";
import Navbar from "../layout/navbar";

// Image Cropper Component
function ImageCropper({ imageSrc, onCrop, onCancel }) {
    const canvasRef = useRef(null);
    const [crop, setCrop] = useState({ x: 0, y: 0, size: 200 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
    const imageRef = useRef(null);
    const containerRef = useRef(null);
    const [isSquareImage, setIsSquareImage] = useState(false);

    useEffect(() => {
        const img = new window.Image();
        img.onload = () => {
            const maxWidth = 500;
            const maxHeight = 400;
            let { width, height } = img;

            const naturalRatio = width / height;
            const displayRatio = Math.min(maxWidth / width, maxHeight / height, 1);
            width = width * displayRatio;
            height = height * displayRatio;

            setImageSize({ width, height });

            const isSquare = Math.abs(img.naturalWidth - img.naturalHeight) < 5;
            setIsSquareImage(isSquare);

            const cropSize = isSquare
                ? Math.min(width, height)
                : Math.min(width, height, 200); // limit crop area for non-square

            setCrop({
                x: (width - cropSize) / 2,
                y: (height - cropSize) / 2,
                size: cropSize
            });
        };
        img.src = imageSrc;
    }, [imageSrc]);

    const handleMouseDown = (e) => {
        if (isSquareImage) return; // No drag for square images

        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (
            x >= crop.x && x <= crop.x + crop.size &&
            y >= crop.y && y <= crop.y + crop.size
        ) {
            setIsDragging(true);
            setDragStart({ x: x - crop.x, y: y - crop.y });
        }
    };

    const handleMouseMove = (e) => {
        if (!isDragging || isSquareImage) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left - dragStart.x;
        const y = e.clientY - rect.top - dragStart.y;

        const size = crop.size;
        setCrop({
            x: Math.max(0, Math.min(x, imageSize.width - size)),
            y: Math.max(0, Math.min(y, imageSize.height - size)),
            size
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleCrop = useCallback(() => {
        const canvas = canvasRef.current;
        const img = imageRef.current;

        if (!canvas || !img) return;

        const ctx = canvas.getContext('2d');
        const outputSize = 400;
        canvas.width = outputSize;
        canvas.height = outputSize;

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        ctx.beginPath();
        ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();

        const scaleX = img.naturalWidth / imageSize.width;
        const scaleY = img.naturalHeight / imageSize.height;

        const sourceX = crop.x * scaleX;
        const sourceY = crop.y * scaleY;
        const sourceSize = crop.size * scaleX;

        ctx.drawImage(
            img,
            sourceX,
            sourceY,
            sourceSize,
            sourceSize,
            0,
            0,
            outputSize,
            outputSize
        );

        canvas.toBlob((blob) => {
            onCrop(blob);
        }, 'image/jpeg', 0.95);
    }, [crop, imageSize, onCrop]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-lg w-full mx-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Crop Profile Picture</h3>
                    <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
                        <X size={24} />
                    </button>
                </div>

                <div className="mb-4 flex justify-center">
                    <div
                        ref={containerRef}
                        className="relative overflow-hidden"
                        style={{ width: imageSize.width, height: imageSize.height }}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                    >
                        <img
                            ref={imageRef}
                            src={imageSrc}
                            alt="Crop preview"
                            style={{
                                width: imageSize.width,
                                height: imageSize.height,
                                display: 'block'
                            }}
                            draggable={false}
                        />

                        {/* Dark Overlay with Circular Crop */}
                        <div
                            className="absolute inset-0"
                            style={{
                                background: 'rgba(0, 0, 0, 0.5)',
                                clipPath: `circle(${crop.size / 2}px at ${crop.x + crop.size / 2}px ${crop.y + crop.size / 2}px)`
                            }}
                        />

                        {/* Crop Circle Outline */}
                        <div
                            className="absolute border-2 border-white rounded-full pointer-events-none"
                            style={{
                                left: crop.x,
                                top: crop.y,
                                width: crop.size,
                                height: crop.size
                            }}
                        />
                    </div>
                </div>

                <div className="text-center mb-4">
                    <p className="text-sm text-gray-600">Drag the circle to position your image</p>
                </div>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleCrop}
                        className="px-4 py-2 bg-[#018ABE] text-white rounded-lg hover:bg-[#016a96] flex items-center gap-2"
                    >
                        <Check size={16} />
                        Crop & Upload
                    </button>
                </div>

                <canvas ref={canvasRef} style={{ display: 'none' }} />
            </div>
        </div>
    );
}


// Profile Image Modal Component
function ProfileImageModal({ imageUrl, onClose }) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-4xl w-full mx-4 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                >
                    <X size={24} />
                </button>
                <div className="flex justify-center">
                    <img
                        src={imageUrl}
                        alt="Profile Preview"
                        className="max-h-[80vh] max-w-full rounded-lg"
                    />
                </div>
            </div>
        </div>
    );
}

function Page() {
    const [profile, setProfile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [tempImageUrl, setTempImageUrl] = useState(null);
    const [showCropper, setShowCropper] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);
    const [selectedImageSrc, setSelectedImageSrc] = useState(null);
    const [showProfileActions, setShowProfileActions] = useState(false);
    const fileInputRef = useRef(null);
    const profileActionsRef = useRef(null);
    const [formData, setFormData] = useState({
        fullName: "",
        phone: "",
        email: "",
        position: "",
        gender: "",
        address: "",
        dateOfJoining: "",
        companyName: "",
        photoUrl: "",
    });
    const [originalFormData, setOriginalFormData] = useState(null);

    // Close profile actions when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileActionsRef.current && !profileActionsRef.current.contains(event.target)) {
                setShowProfileActions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/profile/getProfileAdmin`, {
                credentials: "include",
            });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Failed to fetch profile");
            }

            setProfile(data);
            const newFormData = {
                fullName: data.fullName || "",
                email: data.email || "",
                phone: data.phone || "",
                position: data.position || "Administrator",
                gender: data.gender || "",
                address: data.address || "",
                dateOfJoining: data.dateOfJoining || "",
                companyName: data.companyName || "",
                photoUrl: data.photoUrl || "",
            };
            setFormData(newFormData);
            setOriginalFormData(newFormData);
        } catch (error) {
            console.error("Failed to fetch profile:", error);
            toast.error(error.message || "Failed to fetch profile data");
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

    const handleImageSelect = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Please select a valid image file');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            toast.error('Image size should be less than 10MB');
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            setSelectedImageSrc(reader.result);
            setShowCropper(true);
        };
        reader.readAsDataURL(file);
        event.target.value = '';
    };

    const handleCropComplete = async (croppedBlob) => {
        setShowCropper(false);
        setIsUploadingImage(true);

        const toastId = toast.loading('Uploading your new profile picture...');

        try {
            const formDataUpload = new FormData();
            formDataUpload.append('file', croppedBlob, 'profile.jpg');

            const uploadResponse = await axios.post(
                `${process.env.NEXT_PUBLIC_BACKEND_API}/upload`,
                formDataUpload,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    withCredentials: true,
                }
            );

            if (uploadResponse.status === 200) {
                const imageUrl = uploadResponse.data.fileUrl;
                setTempImageUrl(imageUrl);
                setFormData(prev => ({
                    ...prev,
                    photoUrl: imageUrl
                }));
                toast.success('Profile picture updated successfully!', { id: toastId });
            }
        } catch (error) {
            console.error('Failed to upload image:', error);
            toast.error('Failed to upload image. Please try again.', { id: toastId });
        } finally {
            setIsUploadingImage(false);
        }
    };

    const handleCropCancel = () => {
        setShowCropper(false);
        setSelectedImageSrc(null);
    };

    const handleRemovePhoto = async () => {
        try {
            setIsUploadingImage(true);
            const toastId = toast.loading('Removing profile picture...');

            const res = await axios.delete(
                `${process.env.NEXT_PUBLIC_BACKEND_API}/profile/removePhotoAdmin`,
                { withCredentials: true }
            );

            if (res.status === 200) {
                setTempImageUrl(null);
                setFormData(prev => ({
                    ...prev,
                    photoUrl: ""
                }));
                toast.success('Profile picture removed successfully!', { id: toastId });
                setShowProfileActions(false);
            }
        } catch (error) {
            console.error('Failed to remove photo:', error);
            toast.error(error.response?.data?.message || 'Failed to remove photo. Please try again.');
        } finally {
            setIsUploadingImage(false);
        }
    };

    const handleViewPhoto = () => {
        setShowImageModal(true);
        setShowProfileActions(false);
    };

    const handleCancelEdit = () => {
        if (originalFormData) {
            setFormData(originalFormData);
        }
        setTempImageUrl(null);
        setIsEditing(false);
        toast.success('Changes discarded');
    };

    const validateForm = () => {
        if (!formData.fullName.trim()) {
            toast.error("Full name is required");
            return false;
        }
        if (!formData.email.trim()) {
            toast.error("Email is required");
            return false;
        } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
            toast.error("Please enter a valid email address");
            return false;
        }
        if (!formData.phone.trim()) {
            toast.error("Phone number is required");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            const toastId = toast.loading('Updating profile...');

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
                await fetchProfile();
                toast.success("Profile updated successfully!", { id: toastId });
                setIsEditing(false);
                setTempImageUrl(null);
                setOriginalFormData(formData);
            }
        } catch (error) {
            console.error("Failed to update profile", error);
            toast.error(
                error.response?.data?.message ||
                error.response?.data?.error ||
                "Failed to update profile. Please try again."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const getCurrentProfileImage = () => {
        if (tempImageUrl) return tempImageUrl;
        if (formData.photoUrl) return formData.photoUrl;
        if (profile?.photoUrl) return profile.photoUrl;
        return "/profile.png";
    };

    if (!profile) {
        return (
            <div className="p-6 text-xl h-screen flex items-center justify-center">
                <FancyLoader />
            </div>
        );
    }

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
                        <div className="flex gap-4">
                            {isEditing && (
                                <button
                                    type="button"
                                    onClick={handleCancelEdit}
                                    className="px-7 rounded-2xl h-12 text-lg font-semibold flex items-center gap-3 bg-gray-300 hover:bg-gray-400 cursor-pointer text-gray-800"
                                >
                                    <X size={20} /> Cancel
                                </button>
                            )}
                            <button
                                type="button"
                                className="px-7 rounded-2xl h-12 text-lg font-semibold flex items-center gap-3 bg-[#018ABE] cursor-pointer text-white disabled:opacity-70"
                                onClick={
                                    isEditing
                                        ? handleSubmit
                                        : () => {
                                            setIsEditing(true);
                                            setOriginalFormData(formData);
                                            toast.success("You are now in edit mode!");
                                        }
                                }
                                disabled={isSubmitting || isUploadingImage}
                            >
                                {isEditing ? (
                                    isSubmitting ? (
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    ) : (
                                        <>
                                            <Save /> Save
                                        </>
                                    )
                                ) : (
                                    <>
                                        <FaRegEdit /> Edit
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Profile Banner */}
                    <div className="w-full h-78 bg-gradient-to-b from-[#018ABE] to-[#004058] rounded-2xl relative shadow-xl mb-8">
                        <Image src="/profile/lock.png" alt="Lock Icon" width={107} height={107} className="absolute opacity-50 top-4 left-4 -rotate-[19.89deg]" />
                        <Image src="/profile/Vector92.png" alt="Vector" width={57} height={69} className="absolute opacity-50 bottom-8 left-8" />

                        {/* Profile Image with Upload Functionality */}
                        <div className="absolute top-10 left-[10%] group">
                            <div className="relative">
                                {/* Profile Picture */}
                                <div
                                    className="h-[220px] w-[235px] rounded-full border-4 border-white overflow-hidden cursor-pointer relative"
                                    onClick={() => setShowProfileActions(!showProfileActions)}
                                >
                                    <img
                                        src={getCurrentProfileImage()}
                                        alt="Profile Picture"
                                        className="h-full w-full object-cover"
                                        style={{ imageRendering: 'crisp-edges' }}
                                    />
                                </div>

                                {/* Camera Icon - outside the image, absolutely positioned */}
                                {isEditing && (
                                    <div
                                        className={`absolute bottom-2 right-0 bg-[#018ABE] hover:bg-[#016a96] rounded-full p-3 cursor-pointer shadow-lg transition-colors ${showProfileActions ? 'hidden' : 'group-hover:hidden'}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            fileInputRef.current?.click();
                                        }}
                                    >
                                        {isUploadingImage ? (
                                            <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                                        ) : (
                                            <Camera className="text-white" size={24} />
                                        )}
                                    </div>
                                )}

                                {/* Profile actions dropdown */}
                                {showProfileActions && (
                                    <div
                                        ref={profileActionsRef}
                                        className="absolute top-full left-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50"
                                    >
                                        <button
                                            onClick={handleViewPhoto}
                                            className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left"
                                        >
                                            <FaEye className="mr-2" /> View Photo
                                        </button>
                                        {isEditing && (
                                            <>
                                                <button
                                                    onClick={() => {
                                                        fileInputRef.current?.click();
                                                        setShowProfileActions(false);
                                                    }}
                                                    className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left"
                                                >
                                                    <Camera className="mr-2" /> Change Photo
                                                </button>
                                                {(getCurrentProfileImage() !== "/profile.png") && (
                                                    <button
                                                        onClick={handleRemovePhoto}
                                                        className="flex items-center px-4 py-2 text-red-600 hover:bg-gray-100 w-full text-left"
                                                        disabled={isUploadingImage}
                                                    >
                                                        <FaTrash className="mr-2" /> Remove Photo
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                )}

                                {/* Upload Overlay */}
                                {isEditing && (
                                    <div
                                        className={`absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer ${showProfileActions ? 'hidden' : ''}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            fileInputRef.current?.click();
                                        }}
                                    >
                                        <div className="text-white text-center">
                                            {isUploadingImage ? (
                                                <div className="flex flex-col items-center">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-2"></div>
                                                    <span className="text-sm">Uploading...</span>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center">
                                                    <Camera className="text-3xl mb-2" />
                                                    <span className="text-sm font-medium">Change Photo</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Hidden File Input */}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleImageSelect}
                                    accept="image/*"
                                    className="hidden"
                                    disabled={!isEditing || isUploadingImage}
                                />
                            </div>
                        </div>

                        <Image src="/profile/flagVector.png" alt="Flag Vector" width={49} height={71} className="absolute opacity-50 top-10 left-[33%]" />
                        <Image src="/profile/pencil.png" alt="Vector" width={113} height={147} className="absolute opacity-50 top-6 left-[45%]" />
                        <Image src="/profile/key.png" alt="Key Icon" width={151} height={150} className="absolute opacity-50 bottom-2 left-[35%]" />
                        <div className="absolute top-16 right-[5%] text-white">
                            <h1 className="text-4xl font-[700] mb-2">{profile.fullName}</h1>
                            <h2 className="text-3xl font-[400] mb-2">{profile.phone}</h2>
                            <h3 className="text-3xl font-[400] mb-2">{profile.email}</h3>
                            <h4 className="text-3xl font-[400] mb-2">{profile.position || "Administrator"}</h4>
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
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex justify-between w-full gap-28">
                            <div className="w-full flex flex-col">
                                <label htmlFor="phone" className="text-xl font-[400]">Mobile Number</label>
                                <input
                                    type="tel"
                                    id="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="px-4 py-2 rounded-xl shadow disabled:bg-gray-100 disabled:cursor-not-allowed focus:outline-none"
                                    required
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
                                    required
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
                                    value={formData.dateOfJoining ? formData.dateOfJoining.slice(0, 10) : ''}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="px-4 py-2 rounded-xl shadow disabled:bg-gray-100 disabled:cursor-not-allowed focus:outline-none"
                                />
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {/* Image Cropper Modal */}
            {showCropper && selectedImageSrc && (
                <ImageCropper
                    imageSrc={selectedImageSrc}
                    onCrop={handleCropComplete}
                    onCancel={handleCropCancel}
                />
            )}

            {/* Profile Image Modal */}
            {showImageModal && (
                <ProfileImageModal
                    imageUrl={getCurrentProfileImage()}
                    onClose={() => setShowImageModal(false)}
                />
            )}
        </div>
    );
}

export default Page;