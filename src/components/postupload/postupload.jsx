"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { FaTrashAlt, FaTimes } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";

// Load pdf.js dynamically (client-side only)
let pdfjsLib;
if (typeof window !== "undefined") {
  pdfjsLib = require("pdfjs-dist/build/pdf");
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js";
}

// Modal Component for Post Confirmation
const PostConfirmationModal = ({ isOpen, onClose, onConfirm, postContent }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md text-center">
        <h2 className="text-lg font-semibold mb-4 text-[#6B1A2C]">Confirm Post</h2>
        <p className="mb-2 text-sm text-gray-600">Are you sure you want to post this?</p>
        {postContent.image && (
          <img
            src={postContent.image}
            alt="Preview"
            className="w-full h-40 object-cover rounded-md mb-4"
          />
        )}
        <p className="text-sm text-gray-800 mb-2">
          <strong>Message:</strong> {postContent.message}
        </p>
        <p className="text-sm text-gray-800">
          <strong>Note:</strong> {postContent.note}
        </p>
        <div className="flex justify-center gap-4 mt-4">
          <button
            onClick={onConfirm}
            className="bg-[#82334D] text-white px-4 py-2 rounded hover:bg-[#a6526b]"
          >
            Post
          </button>
          <button
            onClick={onClose}
            className="bg-pink-200 text-black px-4 py-2 rounded hover:bg-pink-300"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// Modal Component for Full Image View
const FullImageModal = ({ isOpen, onClose, imageSrc }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="relative bg-white p-4 rounded-xl max-w-4xl max-h-[90vh] overflow-auto">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded hover:bg-red-600"
        >
          <FaTimes size={16} />
        </button>
        {imageSrc && (
          <img src={imageSrc} alt="Full Preview" className="w-full h-auto object-contain" />
        )}
      </div>
    </div>
  );
};

export default function PostUpload() {
  const [currentDate, setCurrentDate] = useState("");
  const [message, setMessage] = useState("");
  const [note, setNote] = useState(
    "This component uses 'use client' as it relies on client-side interactivity."
  );
  const [selectedFiles, setSelectedFiles] = useState([null]);
  const [fileNames, setFileNames] = useState(["No File chosen"]);
  const [filePreview, setFilePreview] = useState(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showFullImageModal, setShowFullImageModal] = useState(false);
  const [isAdmin] = useState(true); // Simulate admin status; replace with real auth check

  const underlineRef = useRef(null);
  const router = useRouter();

  // GSAP animation for the title underline
  useEffect(() => {
    if (underlineRef.current) {
      gsap.fromTo(
        underlineRef.current,
        { scaleX: 0, transformOrigin: "left" },
        { scaleX: 1, duration: 1, ease: "power3.out" }
      );
    }
  }, []);

  // Set current date
  useEffect(() => {
    const dateStr = new Date().toLocaleDateString("en-GB");
    setCurrentDate(dateStr);
  }, []);

  // Handle file selection and preview
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Update selectedFiles and fileNames
    const updatedFiles = [file];
    const updatedNames = [file.name];
    setSelectedFiles(updatedFiles);
    setFileNames(updatedNames);

    // Generate preview
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        setFilePreview(reader.result); // Base64 string
      };
      reader.readAsDataURL(file);
    } else if (file.type === "application/pdf") {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 1.0 });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;

        const pdfPreviewUrl = canvas.toDataURL("image/png");
        setFilePreview(pdfPreviewUrl);
      } catch (error) {
        console.error("Error rendering PDF preview:", error);
        setFilePreview(null);
        toast.error("Failed to render PDF preview.");
      }
    } else {
      toast.error("Unsupported file type. Please upload an image or PDF.");
      setSelectedFiles([null]);
      setFileNames(["No File chosen"]);
      setFilePreview(null);
    }
  };

  // Handle file deletion
  const handleFileDelete = () => {
    setSelectedFiles([null]);
    setFileNames(["No File chosen"]);
    setFilePreview(null);
  };

  // Handle preview click for admins
  const handlePreviewClick = () => {
    if (isAdmin) {
      setShowFullImageModal(true);
    }
  };

  // Get next sequential ID
  const getNextId = () => {
    const storedPosts = JSON.parse(localStorage.getItem("posts") || "[]");
    return storedPosts.length > 0 ? Math.max(...storedPosts.map((post) => post.id)) + 1 : 1;
  };

  // Handle post submission
  const handlePost = () => {
    if (!selectedFiles[0] && !message && !note) {
      toast.error("Please add a file, message, or note to post.");
      return;
    }
    setShowConfirmationModal(true);
  };

  // Confirm post submission
  const confirmPost = () => {
    // Save post to localStorage
    const posts = JSON.parse(localStorage.getItem("posts") || "[]");
    const newPost = {
      id: getNextId(), // Sequential ID
      image: filePreview, // Base64 string
      message,
      note,
      date: new Date().toISOString(),
    };
    posts.push(newPost);
    localStorage.setItem("posts", JSON.stringify(posts));

    // Reset form
    setSelectedFiles([null]);
    setFileNames(["No File chosen"]);
    setFilePreview(null);
    setMessage("");
    setNote("This component uses 'use client' as it relies on client-side interactivity.");
    setShowConfirmationModal(false);
    toast.success("Post submitted successfully!");
  };

  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <div className="relative ml-10 mt-4 w-max ">
        <h2 className="text-2xl font-bold text-black">Create Post</h2>
        <span
          ref={underlineRef}
          className="absolute left-0 bottom-0 h-[2px] bg-yellow-500 w-full scale-x-0"
        ></span>
      </div>

      <div className="flex items-center justify-center min-h-screen bg-white p-4 pt-10  -mt-16 ">
        <div className="bg-white rounded-xl w-full max-w-5xl p-6 border-2 border-gray-300 relative shadow-lg">
          <div className="flex justify-between items-center mx-20 mb-6">
            <button className="bg-white px-4 py-2 text-xl rounded-full shadow-md border border-gray-300">
              {currentDate}
            </button>
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <div className="w-[70px] h-[70px] rounded-full overflow-hidden border-2 border-gray-300">
                <Image src="/layout/profile.png" alt="avatar" width={70} height={70} />
              </div>
            </div>
            <button
              onClick={() => router.push("/posthistory")}
              className="ml-auto bg-[#058CBF] text-white px-4 py-2 rounded hover:bg-[#69b0c9]"
            >
              Post History
            </button>
          </div>

          <hr className="h-0.5 bg-gray-400 border-0" />

          <div className="mt-4 space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex flex-col gap-2 w-1/2">
                <label className="w-32 text-lg text-left">Message</label>
                <textarea
                  className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter your message..."
                  rows={3}
                />
              </div>
              <div className="flex flex-col gap-2 w-1/2">
                <label className="w-32 text-lg text-left">Note</label>
                <textarea
                  className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Enter your note..."
                  rows={3}
                />
              </div>
            </div>

            {/* Integrated file input div */}
            <div>
              <label className="block mb-1 font-medium text-black">Attachment</label>
              <div className="flex items-center w-full max-w-md">
                <div className="flex-grow flex items-center bg-gray-200 border border-gray-400 rounded-md px-2 py-2 shadow-sm">
                  <label className="cursor-pointer bg-white px-3 py-1 rounded shadow text-sm font-medium mr-2">
                    Choose File
                    <input
                      type="file"
                      id="file-input"
                      className="hidden"
                      accept="image/*,application/pdf"
                      onChange={handleFileChange}
                    />
                  </label>
                  <span className="text-sm text-gray-700">{fileNames[0]}</span>
                </div>
                {selectedFiles[0] && (
                  <FaTrashAlt
                    className="text-black cursor-pointer ml-2"
                    size={16}
                    onClick={handleFileDelete}
                  />
                )}
              </div>
            </div>

            {filePreview && (
              <div className="flex justify-start ml-4">
                <img
                  src={filePreview}
                  alt="Preview"
                  className={`mt-4 w-full max-w-md h-64 text-black object-contain rounded-md ${
                    isAdmin ? "cursor-pointer" : "cursor-default"
                  }`}
                  onClick={handlePreviewClick}
                />
              </div>
            )}

            <div className="flex justify-center mt-8">
              <button
                onClick={handlePost}
                className="flex items-center bg-[#058CBF] text-lg text-white px-6 py-2 rounded hover:bg-cyan-600"
              >
                Post
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Post Confirmation Modal */}
      <PostConfirmationModal
        isOpen={showConfirmationModal}
        onClose={() => setShowConfirmationModal(false)}
        onConfirm={confirmPost}
        postContent={{ image: filePreview, message, note }}
      />

      {/* Full Image Modal */}
      <FullImageModal
        isOpen={showFullImageModal}
        onClose={() => setShowFullImageModal(false)}
        imageSrc={filePreview}
      />
    </>
  );
}