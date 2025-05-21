// "use client";

// import { useEffect, useState, useRef } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   IoClose,
//   IoPaperPlaneOutline,
//   IoDocumentTextOutline,
//   IoHeartOutline,
//   IoChatbubbleOutline,
//   IoBookmarkOutline,
// } from "react-icons/io5";
// import gsap from "gsap";
// import { useGSAP } from "@gsap/react";
// import { Document, Page, pdfjs } from "react-pdf";

// pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

// export default function ClientPostHistory() {
//   const [posts, setPosts] = useState([]);
//   const [isViewModalOpen, setIsViewModalOpen] = useState(false);
//   const [selectedPost, setSelectedPost] = useState(null);
//   const [noteText, setNoteText] = useState("");
//   const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
//   const [notingPostId, setNotingPostId] = useState(null);
//   const [showToast, setShowToast] = useState(false);
//   const [toastMessage, setToastMessage] = useState("");
//   const [numPages, setNumPages] = useState(null);
//   const [pageNumber, setPageNumber] = useState(1);

//   const underlineRef = useRef(null);

//   useGSAP(() => {
//     gsap.fromTo(
//       underlineRef.current,
//       { scaleX: 0, transformOrigin: "left" },
//       { scaleX: 1, duration: 0.8, ease: "power2.out" }
//     );
//   }, []);

//   useEffect(() => {
//     const storedPosts = JSON.parse(localStorage.getItem("posts") || "[]");
//     setPosts(storedPosts.sort((a, b) => new Date(b.date) - new Date(a.date)));
//   }, []);

//   const openViewModal = (post) => {
//     setSelectedPost(post);
//     setIsViewModalOpen(true);
//   };

//   const closeViewModal = () => {
//     setIsViewModalOpen(false);
//     setSelectedPost(null);
//     setNumPages(null);
//     setPageNumber(1);
//   };

//   const openNoteModal = (postId) => {
//     setNotingPostId(postId);
//     setIsNoteModalOpen(true);
//   };

//   const closeNoteModal = () => {
//     setIsNoteModalOpen(false);
//     setNotingPostId(null);
//     setNoteText("");
//   };

//   const showToastNotification = (message) => {
//     setToastMessage(message);
//     setShowToast(true);
//     setTimeout(() => setShowToast(false), 3000);
//   };

//   const submitNote = () => {
//     if (!noteText.trim()) return;

//     const post = posts.find((p) => p.id === notingPostId);
//     if (!post) return;

//     const adminMessages = JSON.parse(
//       localStorage.getItem("adminMessages") || "[]"
//     );

//     adminMessages.push({
//       type: "note",
//       postId: notingPostId,
//       postDate: post.date,
//       note: noteText.trim(),
//       timestamp: new Date().toISOString(),
//       user: "User",
//     });

//     localStorage.setItem("adminMessages", JSON.stringify(adminMessages));
//     showToastNotification("Note sent to admin!");
//     closeNoteModal();
//   };

//   const formatDate = (dateString) => {
//     const date = new Date(dateString);
//     const now = new Date();
//     const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

//     if (diffDays === 0) return "Today";
//     if (diffDays === 1) return "Yesterday";
//     if (diffDays < 7) return `${diffDays} days ago`;
//     return date.toLocaleDateString();
//   };

//   const onDocumentLoadSuccess = ({ numPages }) => {
//     setNumPages(numPages);
//   };

//   const changePage = (offset) => {
//     setPageNumber((prev) => Math.min(Math.max(prev + offset, 1), numPages));
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
//       {/* Header */}
//       <div className="relative mb-6">
//         <h2 className="text-3xl font-bold text-black">Your Posts</h2>
//         <span
//           ref={underlineRef}
//           className="absolute left-0 bottom-0 h-1 bg-[#018ABE] w-32 scale-x-0"
//         />
//       </div>

//       {/* Instagram-style Posts Feed */}
//       <div
//         className={`space-y-8 ${
//           isViewModalOpen || isNoteModalOpen
//             ? "blur-sm pointer-events-none"
//             : ""
//         }`}
//       >
//         {posts.length === 0 ? (
//           <div className="flex flex-col items-center justify-center bg-white rounded-xl shadow-md p-12 border border-gray-300">
//             <div className="text-7xl mb-4 animate-pulse">📷</div>
//             <p className="text-center text-gray-600 text-lg font-medium">
//               No posts yet. Start sharing your moments!
//             </p>
//           </div>
//         ) : (
//           posts.map((post) => (
//             <div
//               key={post.id}
//               className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden"
//             >
//               {/* Post Header: Avatar + Username + Date */}
//               <div className="flex items-center px-4 py-3 space-x-3 border-b border-gray-200">
//                 <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold select-none text-lg">
//                   {post.id.toString().charAt(0).toUpperCase()}
//                 </div>
//                 <div>
//                   <p className="font-semibold text-gray-800">
//                     User{post.id} {/* You can replace with actual username */}
//                   </p>
//                   <p className="text-xs text-gray-500">
//                     {formatDate(post.date)}
//                   </p>
//                 </div>
//               </div>

//               {/* Post Media */}
//               <div
//                 onClick={() => openViewModal(post)}
//                 className="cursor-pointer bg-gray-100 flex items-center justify-center relative overflow-hidden max-h-[500px]"
//               >
//                 {post.image ? (
//                   post.image.toLowerCase().endsWith(".pdf") ? (
//                     <div className="flex flex-col items-center justify-center w-full h-64 p-6 text-gray-500">
//                       <IoDocumentTextOutline className="text-7xl mb-2" />
//                       <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold select-none">
//                         PDF Document
//                       </span>
//                     </div>
//                   ) : (
//                     <img
//                       src={post.image}
//                       alt={`Post ${post.id}`}
//                       className="w-full max-h-[500px] object-cover transition-transform duration-500 hover:scale-105"
//                       onError={(e) => {
//                         e.target.src = "/placeholder-image.jpg";
//                         e.target.classList.add("object-contain", "p-6");
//                       }}
//                     />
//                   )
//                 ) : (
//                   <p className="text-center text-gray-500 p-12">
//                     No image available
//                   </p>
//                 )}
//               </div>

//               {/* Post Actions like Instagram */}
//               <div className="flex items-center justify-between px-4 py-2 border-t border-gray-200">
//                 <div className="flex space-x-4 text-gray-600">
//                   <button
//                     aria-label="Like"
//                     className="hover:text-red-500 transition"
//                   >
//                     <IoHeartOutline size={24} />
//                   </button>
//                   <button
//                     aria-label="Comment"
//                     onClick={() => openNoteModal(post.id)}
//                     className="hover:text-blue-600 transition"
//                   >
//                     <IoChatbubbleOutline size={24} />
//                   </button>
//                   <button
//                     aria-label="Share"
//                     className="hover:text-green-600 transition"
//                   >
//                     <IoPaperPlaneOutline size={24} />
//                   </button>
//                 </div>
//                 <button
//                   aria-label="Save"
//                   className="hover:text-yellow-600 transition"
//                 >
//                   <IoBookmarkOutline size={24} />
//                 </button>
//               </div>
//             </div>
//           ))
//         )}
//       </div>

//       {/* View Modal */}
//       <AnimatePresence>
//         {isViewModalOpen && selectedPost && (
//           <motion.div
//             initial={{ opacity: 0, scale: 0.8 }}
//             animate={{ opacity: 1, scale: 1 }}
//             exit={{ opacity: 0, scale: 0.8 }}
//             transition={{ duration: 0.3 }}
//             className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4"
//             onClick={closeViewModal}
//           >
//             <motion.div
//               className="relative max-w-4xl w-full max-h-[80vh] overflow-auto rounded-xl bg-white shadow-lg p-6"
//               onClick={(e) => e.stopPropagation()}
//             >
//               <button
//                 onClick={closeViewModal}
//                 className="absolute top-3 right-3 text-gray-600 hover:text-gray-900"
//                 aria-label="Close modal"
//               >
//                 <IoClose size={28} />
//               </button>

//               {selectedPost.image ? (
//                 selectedPost.image.toLowerCase().endsWith(".pdf") ? (
//                   <div className="flex flex-col items-center">
//                     <Document
//                       file={selectedPost.image}
//                       onLoadSuccess={onDocumentLoadSuccess}
//                       loading={<p>Loading PDF...</p>}
//                       error={<p>Failed to load PDF.</p>}
//                     >
//                       <Page pageNumber={pageNumber} width={600} />
//                     </Document>
//                     <div className="mt-4 flex space-x-3">
//                       <button
//                         onClick={() => changePage(-1)}
//                         disabled={pageNumber <= 1}
//                         className="px-4 py-2 rounded bg-blue-600 text-white disabled:bg-gray-400"
//                       >
//                         Previous
//                       </button>
//                       <p className="self-center text-gray-700">
//                         Page {pageNumber} / {numPages || "-"}
//                       </p>
//                       <button
//                         onClick={() => changePage(1)}
//                         disabled={pageNumber >= numPages}
//                         className="px-4 py-2 rounded bg-blue-600 text-white disabled:bg-gray-400"
//                       >
//                         Next
//                       </button>
//                     </div>
//                   </div>
//                 ) : (
//                   <img
//                     src={selectedPost.image}
//                     alt="Selected post"
//                     className="max-w-full max-h-[70vh] object-contain rounded-lg"
//                     onError={(e) => {
//                       e.target.src = "/placeholder-image.jpg";
//                     }}
//                   />
//                 )
//               ) : (
//                 <p className="text-center text-gray-500">No image available</p>
//               )}
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Note Modal */}
//       <AnimatePresence>
//         {isNoteModalOpen && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60"
//             onClick={closeNoteModal}
//           >
//             <motion.div
//               initial={{ y: 50, opacity: 0 }}
//               animate={{ y: 0, opacity: 1 }}
//               exit={{ y: 50, opacity: 0 }}
//               transition={{ duration: 0.3 }}
//               className="bg-white rounded-xl p-6 max-w-md w-full shadow-lg"
//               onClick={(e) => e.stopPropagation()}
//             >
//               <h3 className="text-lg font-semibold mb-3">
//                 Send a Note to Admin
//               </h3>
//               <textarea
//                 rows={4}
//                 className="w-full border border-gray-300 rounded-md p-2 resize-none focus:outline-blue-400"
//                 placeholder="Write your note here..."
//                 value={noteText}
//                 onChange={(e) => setNoteText(e.target.value)}
//               />
//               <div className="mt-4 flex justify-end space-x-3">
//                 <button
//                   onClick={closeNoteModal}
//                   className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100 transition"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={submitNote}
//                   disabled={!noteText.trim()}
//                   className={`px-4 py-2 rounded text-white ${
//                     noteText.trim()
//                       ? "bg-blue-600 hover:bg-blue-700"
//                       : "bg-blue-300 cursor-not-allowed"
//                   }`}
//                 >
//                   Send
//                 </button>
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Toast Notification */}
//       <AnimatePresence>
//         {showToast && (
//           <motion.div
//             initial={{ opacity: 0, y: 30 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: 30 }}
//             transition={{ duration: 0.3 }}
//             className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg"
//           >
//             {toastMessage}
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }
