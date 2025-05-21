"use client"
import { useState, useEffect } from 'react';
import axios from 'axios';

const PostHistory = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  const [sortOption, setSortOption] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get('http://localhost:4110/api/admin/getAllPosts', {
          withCredentials: true
        });
        setPosts(response.data.posts);
      } catch (err) {
        setError(err.message || 'Failed to fetch posts');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const formatDate = (dateString) => {
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const isImageFile = (fileName) => {
    const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
    return imageExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
  };

  // Modified downloadFile function to fix CORS issue
  const downloadFile = async (fileUrl, fileName, e) => {
    e.stopPropagation();
    try {
      // Create a server-side proxy route to handle the download instead of direct client-side request
      const response = await axios.post('http://localhost:4110/api/admin/proxyDownload', {
        fileUrl,
        fileName
      }, {
        withCredentials: true,
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();

      // Clean up the URL object
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading file:', err);
      alert('Failed to download file. Please try again later.');
    }
  };

  // Alternative downloadFile option if you can't create a proxy route
  const directDownloadFile = async (fileUrl, fileName, e) => {
    e.stopPropagation();
    try {
      // Create a hidden iframe for download rather than axios with credentials
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = fileUrl;
      document.body.appendChild(iframe);

      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 5000); // Remove iframe after 5 seconds
    } catch (err) {
      console.error('Error downloading file:', err);
      alert('Failed to download file. Please try again later.');
    }
  };

  const getDateRange = (range) => {
    const today = new Date();
    switch (range) {
      case 'today':
        return new Date(today.setHours(0, 0, 0, 0));
      case 'week':
        return new Date(today.setDate(today.getDate() - 7));
      case 'month':
        return new Date(today.setMonth(today.getMonth() - 1));
      case 'year':
        return new Date(today.setFullYear(today.getFullYear() - 1));
      default:
        return null;
    }
  };

  const filteredPosts = posts.filter(post => {
    // Filter by tab
    if (activeTab === 'withAttachments' && (!post.attachments || post.attachments.length === 0)) {
      return false;
    }
    if (activeTab === 'withImages' && (!post.attachments || !post.attachments.some(att => isImageFile(att.fileName)))) {
      return false;
    }
    if (activeTab === 'withDocuments' && (!post.attachments || !post.attachments.some(att => !isImageFile(att.fileName)))) {
      return false;
    }

    // Filter by search
    if (searchQuery && !post.message.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !(post.note && post.note.toLowerCase().includes(searchQuery.toLowerCase()))) {
      return false;
    }

    // Filter by date range
    if (selectedDateRange !== 'all') {
      const rangeDate = getDateRange(selectedDateRange);
      if (rangeDate && new Date(post.createdAt) < rangeDate) {
        return false;
      }
    }

    return true;
  });

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    switch (sortOption) {
      case 'newest':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'oldest':
        return new Date(a.createdAt) - new Date(b.createdAt);
      case 'attachmentsDesc':
        return (b.attachments?.length || 0) - (a.attachments?.length || 0);
      default:
        return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-48 p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading posts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded shadow-md">
        <div className="flex items-center">
          <div className="text-red-500 text-lg mr-2">⚠️</div>
          <div>
            <p className="font-medium text-red-800">Error loading posts</p>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
        <button
          className="mt-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  const renderPostModal = () => {
    if (!selectedPost) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedPost(null)}>
        <div className="bg-white rounded-lg max-w-3xl w-full max-h-screen overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold">{selectedPost.message}</h2>
              <button
                className="text-gray-500 hover:text-gray-700 text-2xl"
                onClick={() => setSelectedPost(null)}
              >
                ×
              </button>
            </div>

            {selectedPost.note && (
              <div className="mb-6">
                <h3 className="font-medium text-gray-700 mb-2">Note:</h3>
                <p className="text-gray-600 bg-gray-50 p-3 rounded">{selectedPost.note}</p>
              </div>
            )}

            {selectedPost.attachments?.length > 0 && (
              <div className="mb-6">
                <h3 className="font-medium text-gray-700 mb-2">Attachments:</h3>
                <div className="space-y-4">
                  {selectedPost.attachments.map((attachment, index) => (
                    <div key={index} className="flex flex-col">
                      {isImageFile(attachment.fileName) ? (
                        <>
                          <img
                            src={attachment.fileUrl}
                            alt={attachment.fileName}
                            className="max-w-full h-auto rounded-lg border mb-2"
                          />
                          <button
                            onClick={(e) => downloadFile(attachment.fileUrl, attachment.fileName, e)}
                            className="text-blue-600 hover:text-blue-800 hover:underline text-sm self-start flex items-center"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Download Image
                          </button>
                        </>
                      ) : (
                        <div className="flex items-center gap-2 bg-gray-50 p-3 rounded">
                          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <button
                            onClick={(e) => downloadFile(attachment.fileUrl, attachment.fileName, e)}
                            className="text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            {attachment.fileName}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="text-sm text-gray-500 mt-4 pt-4 border-t">
              Posted on: {formatDate(selectedPost.createdAt)}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderEmptyState = () => (
    <div className="text-center py-12">
      <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
      <h3 className="text-lg font-medium text-gray-700 mb-2">No posts found</h3>
      <p className="text-gray-500 max-w-md mx-auto">
        {searchQuery ?
          `No posts matching "${searchQuery}" were found. Try adjusting your filters or search term.` :
          "There are no posts available with the current filters. Try changing your filter settings."
        }
      </p>
    </div>
  );

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sortedPosts.map((post) => (
        <div
          key={post._id}
          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => setSelectedPost(post)}
        >
          {post.attachments?.some(att => isImageFile(att.fileName)) && (
            <div className="h-40 overflow-hidden bg-gray-100">
              <img
                src={post.attachments.find(att => isImageFile(att.fileName)).fileUrl}
                alt="Post thumbnail"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/placeholder-image.jpg"; // Fallback image
                }}
              />
            </div>
          )}
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-2 line-clamp-2">{post.message}</h2>
            {post.note && <p className="text-gray-600 mb-3 line-clamp-2 text-sm">{post.note}</p>}

            {post.attachments?.length > 0 && (
              <div className="flex items-center text-sm text-gray-500 mb-2">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                {post.attachments.length} {post.attachments.length === 1 ? 'attachment' : 'attachments'}
              </div>
            )}

            <div className="text-xs text-gray-400 mt-2">
              {formatDate(post.createdAt)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="space-y-4">
      {sortedPosts.map((post) => (
        <div
          key={post._id}
          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => setSelectedPost(post)}
        >
          <div className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h2 className="text-lg font-semibold mb-2">{post.message}</h2>
                {post.note && <p className="text-gray-600 mb-3 line-clamp-2">{post.note}</p>}
              </div>
              {post.attachments?.length > 0 && (
                <div className="ml-4 flex items-center text-sm text-gray-500">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  {post.attachments.length}
                </div>
              )}
            </div>

            {post.attachments?.some(att => isImageFile(att.fileName)) && (
              <div className="flex -mx-1 mt-3 overflow-x-auto pb-2">
                {post.attachments.filter(att => isImageFile(att.fileName)).slice(0, 3).map((attachment, idx) => (
                  <div className="px-1" key={idx}>
                    <img
                      src={attachment.fileUrl}
                      alt={attachment.fileName}
                      className="h-20 w-20 object-cover rounded"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/placeholder-image.jpg"; // Fallback image
                      }}
                    />
                  </div>
                ))}
                {post.attachments.filter(att => isImageFile(att.fileName)).length > 3 && (
                  <div className="px-1 flex items-center justify-center h-20 w-20 bg-gray-100 rounded text-sm text-gray-600">
                    +{post.attachments.filter(att => isImageFile(att.fileName)).length - 3} more
                  </div>
                )}
              </div>
            )}

            <div className="text-xs text-gray-400 mt-3">
              {formatDate(post.createdAt)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      {selectedPost && renderPostModal()}

      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Post History</h1>
        <p className="text-gray-600">Browse and manage all your posts</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <select
              value={selectedDateRange}
              onChange={(e) => setSelectedDateRange(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Past Week</option>
              <option value="month">Past Month</option>
              <option value="year">Past Year</option>
            </select>

            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="attachmentsDesc">Most Attachments</option>
            </select>

            <div className="flex border border-gray-300 rounded-md overflow-hidden">
              <button
                className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'}`}
                onClick={() => setViewMode('grid')}
                title="Grid view"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                className={`px-3 py-2 ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'}`}
                onClick={() => setViewMode('list')}
                title="List view"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 border-b">
        <nav className="flex space-x-6">
          <button
            className={`py-3 border-b-2 font-medium ${activeTab === 'all' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('all')}
          >
            All Posts
          </button>
          <button
            className={`py-3 border-b-2 font-medium ${activeTab === 'withAttachments' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('withAttachments')}
          >
            With Attachments
          </button>
          <button
            className={`py-3 border-b-2 font-medium ${activeTab === 'withImages' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('withImages')}
          >
            With Images
          </button>
          <button
            className={`py-3 border-b-2 font-medium ${activeTab === 'withDocuments' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('withDocuments')}
          >
            With Documents
          </button>
        </nav>
      </div>

      <div className="mb-4">
        <div className="text-sm text-gray-500">
          Showing {sortedPosts.length} {sortedPosts.length === 1 ? 'post' : 'posts'}
          {selectedDateRange !== 'all' && ` from ${selectedDateRange}`}
          {activeTab !== 'all' && ` with ${activeTab.replace('with', '').toLowerCase()}`}
          {searchQuery && ` matching "${searchQuery}"`}
        </div>
      </div>

      {sortedPosts.length === 0 ? (
        renderEmptyState()
      ) : (
        viewMode === 'grid' ? renderGridView() : renderListView()
      )}
    </div>
  );
};

export default PostHistory;