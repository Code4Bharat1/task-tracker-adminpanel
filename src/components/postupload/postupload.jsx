"use client";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { FaTrashAlt, FaTimes } from "react-icons/fa";
import axios from "axios";

// Configure Axios defaults
axios.defaults.withCredentials = true;
const API_BASE_URL = "http://localhost:4110/api";

const PostConfirmationModal = ({
  onClose,
  onConfirm,
  preview,
  fileType,
  message,
  note,
  isLoading
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
          className="bg-[#82334D] text-white px-4 py-2 rounded hover:bg-[#a6526b] disabled:opacity-50"
          onClick={onConfirm}
          disabled={isLoading}
        >
          {isLoading ? 'Posting...' : 'Post'}
        </button>
        <button
          className="bg-pink-200 text-black px-4 py-2 rounded hover:bg-pink-300 disabled:opacity-50"
          onClick={onClose}
          disabled={isLoading}
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
    className={`fixed top-10 left-1/2 transform -translate-x-1/2 z-[9999] transition-opacity duration-500 ${show ? "opacity-100" : "opacity-0"
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
  const [file, setFile] = useState(null);
  const [showFullModal, setShowFullModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState("");
  const [note, setNote] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
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
      // Validate file size (e.g., 5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError("File size exceeds 5MB limit");
        return;
      }

      setFile(file);
      setError(null);
      const reader = new FileReader();

      reader.onloadend = () => {
        const base64data = reader.result;

        if (file.type.startsWith("image/")) {
          setFileType("image");
        } else if (file.type === "application/pdf") {
          setFileType("pdf");
        } else {
          setError("Unsupported file type. Please upload an image or PDF.");
          return;
        }

        setFilePreview(base64data);
      };

      reader.readAsDataURL(file);
    }
  };

  const handleDelete = () => {
    setFilePreview(null);
    setFileType(null);
    setFile(null);
    setError(null);
  };

  const handleSubmit = () => {
    if (!message.trim()) {
      setError("Please enter a message");
      return;
    }
    if (!note.trim()) {
      setError("Please enter a note");
      return;
    }
    if (!file) {
      setError("Please upload a file");
      return;
    }

    setError(null);
    setShowConfirm(true);
  };

  const uploadFile = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Adjust based on actual response structure
      return response.data.fileUrl || response.data.url; // Ensure correct property
    } catch (err) {
      console.error('File upload error:', err);
      throw new Error(err.response?.data?.message || 'File upload failed');
    }
  };

  const createPost = async (postData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/create`, postData);
      return response.data;
    } catch (err) {
      console.error('Post creation error:', err);
      throw new Error(err.response?.data?.message || 'Post creation failed');
    }
  };

  const confirmPost = async () => {
    setIsLoading(true);
    try {
      let fileUrl = '';
      if (file) {
        fileUrl = await uploadFile(file);
      }

      const postData = [{
        message: message.trim(),
        note: note.trim(),
        attachments: fileUrl ? [{
          fileName: file.name,
          fileUrl: fileUrl
        }] : []
      }];

      await createPost(postData);

      // ✅ Reset all fields
      setMessage("");
      setNote("");
      setFile(null);
      setFilePreview(null);
      setFileType(null);

      // ✅ Close confirmation modal
      setShowConfirm(false);

      // ✅ Show success toast
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 3000); // Toast disappears after 3 seconds
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
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
            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
                <p>{error}</p>
              </div>
            )}

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
                Attachment (Max 5MB)
              </label>
              <label className="w-full max-w-md cursor-pointer">
                <div className="px-6 py-4 bg-white border-2 border-dashed border-gray-300 rounded-lg shadow-sm text-center hover:bg-gray-50 transition">
                  <p className="text-gray-600 font-medium">
                    Click to select a file (Image or PDF)
                  </p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept="image/*,.pdf"
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
                    disabled={isLoading}
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
                disabled={isLoading}
              >
                {isLoading ? 'Submitting...' : 'Submit Post'}
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
          isLoading={isLoading}
        />
      )}
    </>
  );
}