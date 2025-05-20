"use client";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { FaTrashAlt, FaTimes } from "react-icons/fa";

const PostConfirmationModal = ({
  onClose,
  onConfirm,
  preview,
  fileType,
  message,
  note,
}) => (
  <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40">
    <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md text-center relative">
      <h2 className="text-lg font-semibold mb-4 text-[#6B1A2C]">
        Confirm Post
      </h2>
      <p className="mb-2 text-sm text-gray-600">
        Are you sure you want to post this?
      </p>

      {preview && fileType === "image" && (
        <img
          src={preview}
          alt="Image Preview"
          className="w-full h-40 object-cover rounded-md mb-4"
        />
      )}
      {preview && fileType === "pdf" && (
        <iframe
          src={preview}
          className="w-full h-40 rounded-md mb-4"
          title="PDF Preview"
        />
      )}

      <p className="text-sm text-gray-800 mb-2">
        <strong>Message:</strong> {message}
      </p>
      <p className="text-sm text-gray-800">
        <strong>Note:</strong> {note}
      </p>

      <div className="flex justify-center gap-4 mt-4">
        <button
          className="bg-[#82334D] text-white px-4 py-2 rounded hover:bg-[#a6526b]"
          onClick={onConfirm}
        >
          Post
        </button>
        <button
          className="bg-pink-200 text-black px-4 py-2 rounded hover:bg-pink-300"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
);

const FullFileModal = ({ src, type, onClose }) => (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
    <div className="relative bg-white p-4 rounded-xl max-w-4xl max-h-[90vh] overflow-auto w-full">
      <button
        onClick={onClose}
        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded hover:bg-red-600"
      >
        <FaTimes size={16} />
      </button>
      {type === "image" ? (
        <img
          src={src}
          alt="Full Preview"
          className="w-full h-auto object-contain"
        />
      ) : (
        <iframe
          src={src}
          className="w-full h-[80vh] rounded"
          title="PDF Full Preview"
        />
      )}
    </div>
  </div>
);

const Toast = ({ message, show }) => (
  <div
    className={`fixed top-10 left-1/2 transform -translate-x-1/2 z-[9999] transition-opacity duration-500 ${
      show ? "opacity-100" : "opacity-0"
    }`}
  >
    <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg text-sm">
      {message}
    </div>
  </div>
);

export default function PostUpload() {
  const [filePreview, setFilePreview] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [showFullModal, setShowFullModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState("");
  const [note, setNote] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const router = useRouter();

  const underlineRef = useRef(null);

  useGSAP(() => {
    gsap.fromTo(
      underlineRef.current,
      { scaleX: 0, transformOrigin: "left" },
      { scaleX: 1, duration: 0.8, ease: "power2.out" }
    );
  }, []);
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();

      reader.onloadend = () => {
        const base64data = reader.result; // base64 string

        if (file.type.startsWith("image/")) {
          setFileType("image");
        } else if (file.type === "application/pdf") {
          setFileType("pdf");
        } else {
          alert("Unsupported file type. Please upload an image or PDF.");
          return;
        }

        setFilePreview(base64data); // store base64 instead of blob URL
      };

      reader.readAsDataURL(file);
    }
  };

  const handleDelete = () => {
    setFilePreview(null);
    setFileType(null);
  };

  const handleSubmit = () => {
    if (!message || !note || !filePreview) {
      alert("Please fill all fields and upload a file.");
      return;
    }
    setShowConfirm(true);
  };

  const confirmPost = () => {
    const newPost = {
      id: Date.now(),
      message,
      note,
      fileType,
      filePreview,
      date: new Date().toISOString(),
    };

    const existingPosts = JSON.parse(localStorage.getItem("posts") || "[]");
    existingPosts.push(newPost);
    localStorage.setItem("posts", JSON.stringify(existingPosts));

    // Reset form
    setMessage("");
    setNote("");
    setFilePreview(null);
    setFileType(null);
    setShowConfirm(false);

    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  return (
    <>
      <Toast show={toastVisible} message="Post submitted successfully!" />

      <div className="relative ml-4 mt-4 mb-4 w-max">
        <h2 className="text-2xl font-bold text-black">CREATE POST</h2>
        <span
          ref={underlineRef}
          className="absolute left-0 bottom-0 h-[2px] bg-[#018ABE] w-full scale-x-0"
        ></span>
      </div>

      <div className="flex items-center justify-center bg-white p-4 mt-4 z-10 w-full">
        <div className="bg-white rounded-xl w-full max-w-5xl p-6 border-2 border-gray-300 shadow-lg">
          <div className="flex justify-between items-center mx-20 mb-6">
            <button className="bg-white px-4 py-2 text-xl rounded-md shadow-md border border-gray-300">
              {new Date().toLocaleDateString()}
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
                  rows={3}
                  placeholder="Enter your message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2 w-1/2">
                <label className="text-lg">Note</label>
                <textarea
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows={3}
                  placeholder="Enter a note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
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
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>

              {!filePreview && (
                <p className="mt-2 text-sm text-gray-500">No File chosen</p>
              )}

              {filePreview && (
                <div className="mt-4 flex flex-col items-center">
                  {fileType === "image" ? (
                    <img
                      src={filePreview}
                      alt="Preview"
                      onClick={() => setShowFullModal(true)}
                      className="max-w-xs max-h-64 rounded-md border cursor-pointer"
                    />
                  ) : (
                    <div
                      onClick={() => setShowFullModal(true)}
                      className="w-full max-w-sm h-64 border rounded-md overflow-hidden cursor-pointer bg-white hover:shadow-md transition"
                    >
                      <img
                        src="/pdfimage.webp"
                        alt="PDF Thumbnail"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                  <button
                    className="mt-2 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    onClick={handleDelete}
                  >
                    <FaTrashAlt className="inline mr-2" /> Delete File
                  </button>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-center">
              <button
                onClick={handleSubmit}
                className="bg-[#058CBF] text-white px-6 py-3 rounded-md hover:bg-[#4ea2c3]"
              >
                Submit Post
              </button>
            </div>
          </div>
        </div>
      </div>

      {showFullModal && (
        <FullFileModal
          src={filePreview}
          type={fileType}
          onClose={() => setShowFullModal(false)}
        />
      )}

      {showConfirm && (
        <PostConfirmationModal
          preview={filePreview}
          fileType={fileType}
          onClose={() => setShowConfirm(false)}
          onConfirm={confirmPost}
          message={message}
          note={note}
        />
      )}
    </>
  );
}
