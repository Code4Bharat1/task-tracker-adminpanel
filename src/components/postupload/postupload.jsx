"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { FaTrashAlt, FaTimes } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";

let pdfjsLib;
if (typeof window !== "undefined") {
  pdfjsLib = require("pdfjs-dist/build/pdf");
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js";
}

// Post Confirmation Modal
const PostConfirmationModal = ({ isOpen, onClose, onConfirm, postContent }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md text-center">
        <h2 className="text-lg font-semibold mb-4 text-[#6B1A2C]">
          Confirm Post
        </h2>
        <p className="mb-2 text-sm text-gray-600">
          Are you sure you want to post this?
        </p>
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

// Full Image Modal
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
          <img
            src={imageSrc}
            alt="Full Preview"
            className="w-full h-auto object-contain"
          />
        )}
      </div>
    </div>
  );
};

export default function PostUpload() {
  const [currentDate, setCurrentDate] = useState("");
  const [message, setMessage] = useState("");
  const [note, setNote] = useState("This component uses 'use client'.");
  const [selectedFiles, setSelectedFiles] = useState([null]);
  const [fileNames, setFileNames] = useState(["No File chosen"]);
  const [filePreview, setFilePreview] = useState(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showFullImageModal, setShowFullImageModal] = useState(false);
  const [isAdmin] = useState(true);

  const router = useRouter();
  const underlineRef = useRef(null);

  useEffect(() => {
    if (underlineRef.current) {
      gsap.fromTo(
        underlineRef.current,
        { scaleX: 0, transformOrigin: "left" },
        { scaleX: 1, duration: 1, ease: "power3.out" }
      );
    }
  }, []);

  useEffect(() => {
    const dateStr = new Date().toLocaleDateString("en-GB");
    setCurrentDate(dateStr);
  }, []);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFiles([file]);
    setFileNames([file.name]);

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => setFilePreview(reader.result);
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

        await page.render({ canvasContext: context, viewport }).promise;
        setFilePreview(canvas.toDataURL("image/png"));
      } catch (error) {
        console.error("PDF render error:", error);
        toast.error("Failed to render PDF preview.");
        setFilePreview(null);
      }
    } else {
      toast.error("Unsupported file type. Please upload image or PDF.");
      setSelectedFiles([null]);
      setFileNames(["No File chosen"]);
      setFilePreview(null);
    }
  };

  const handleFileDelete = () => {
    setSelectedFiles([null]);
    setFileNames(["No File chosen"]);
    setFilePreview(null);
  };

  const handlePreviewClick = () => {
    if (isAdmin) setShowFullImageModal(true);
  };

  const getNextId = () => {
    const storedPosts = JSON.parse(localStorage.getItem("posts") || "[]");
    return storedPosts.length > 0
      ? Math.max(...storedPosts.map((p) => p.id)) + 1
      : 1;
  };

  const handlePost = () => {
    if (!selectedFiles[0] && !message && !note) {
      toast.error("Please add a file, message, or note to post.");
      return;
    }
    setShowConfirmationModal(true);
  };

  const confirmPost = () => {
    const posts = JSON.parse(localStorage.getItem("posts") || "[]");
    const newPost = {
      id: getNextId(),
      image: filePreview,
      message,
      note,
      date: new Date().toISOString(),
    };
    posts.push(newPost);
    localStorage.setItem("posts", JSON.stringify(posts));

    setSelectedFiles([null]);
    setFileNames(["No File chosen"]);
    setFilePreview(null);
    setMessage("");
    setNote("This component uses 'use client'.");
    setShowConfirmationModal(false);
    toast.success("Post submitted successfully!");
  };

  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />

      <div className="relative ml-10 mt-4 w-max">
        <h2 className="text-2xl font-bold text-black">Create Post</h2>
        <span
          ref={underlineRef}
          className="absolute left-0 bottom-0 h-[2px] bg-[#018ABE] w-full scale-x-0"
        ></span>
      </div>

      <div className="flex items-center justify-center min-h-screen bg-white p-4 pt-10 -mt-16">
        <div className="bg-white rounded-xl w-full max-w-5xl p-6 border-2 border-gray-300 shadow-lg">
          <div className="flex justify-between items-center mx-20 mb-6">
            <button className="bg-white px-4 py-2 text-xl rounded-md shadow-md border border-gray-300">
              {currentDate}
            </button>
            <button
              onClick={() => router.push("/posthistory")}
              className="ml-auto bg-[#058CBF] text-white px-4 py-2 rounded hover:bg-[#69b0c9]"
            >
              Post History
            </button>
          </div>

          <hr className="h-0.5 bg-gray-200 border-0" />

          <div className="mt-4 space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex flex-col gap-2 w-1/2">
                <label className="text-lg">Message</label>
                <textarea
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="flex flex-col gap-2 w-1/2">
                <label className="text-lg">Note</label>
                <textarea
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            <div className="flex flex-col items-center justify-center w-full mt-6">
              <label className="text-lg font-semibold text-black mb-2">
                Attachment
              </label>

              <label className="w-full max-w-md cursor-pointer">
                <div className="px-6 py-4 bg-white border-2 border-dashed border-gray-300 rounded-lg shadow-sm text-center hover:bg-gray-50 transition">
                  <p className="text-gray-600 font-medium">
                    Click to select a file
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              <p className="mt-2 text-sm text-gray-500">{fileNames[0]}</p>

              {filePreview && (
                <div className="mt-4 flex flex-col items-center">
                  <img
                    src={filePreview}
                    alt="Preview"
                    onClick={handlePreviewClick}
                    className="max-w-xs max-h-64 rounded-md border cursor-pointer"
                  />
                  <button
                    onClick={handleFileDelete}
                    className="mt-2 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    <FaTrashAlt className="inline mr-2" /> Delete File
                  </button>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-center">
              <button
                onClick={handlePost}
                className="bg-[#058CBF] text-white px-6 py-3 rounded-md hover:bg-[#4ea2c3]"
              >
                Submit Post
              </button>
            </div>
          </div>
        </div>
      </div>

      <PostConfirmationModal
        isOpen={showConfirmationModal}
        onClose={() => setShowConfirmationModal(false)}
        onConfirm={confirmPost}
        postContent={{ image: filePreview, message, note }}
      />

      <FullImageModal
        isOpen={showFullImageModal}
        onClose={() => setShowFullImageModal(false)}
        imageSrc={filePreview}
      />
    </>
  );
}
