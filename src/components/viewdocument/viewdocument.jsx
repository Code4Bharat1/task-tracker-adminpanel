'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { MdDelete, MdDownload, MdVisibility, MdClose } from 'react-icons/md';
import { Toaster, toast } from 'react-hot-toast';
import { Plus, Search, Calendar, FileText, User, Eye, Download, Trash2, RefreshCw, Filter, X, ZoomIn, ZoomOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function ViewDocument() {
  const [search, setSearch] = useState('');
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [documentTypeFilter, setDocumentTypeFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [viewModal, setViewModal] = useState({ isOpen: false, document: null, zoom: 1 });
  const router = useRouter();

  // Get unique document types for filter
  const documentTypes = useMemo(() => {
    const types = [...new Set(documents.map(doc => doc.documentName))];
    return types.sort();
  }, [documents]);

  // Fetch documents from the backend using axios
  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        'http://localhost:4110/api/adddocument/admingetDocuments',
        {
          withCredentials: true,
          timeout: 10000,
        }
      );
      
      setDocuments(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching documents:', error);
      
      if (error.response) {
        setError(`Server error: ${error.response.status}`);
      } else if (error.request) {
        setError('Network error - please check your connection');
      } else {
        setError('Failed to load documents');
      }
      
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  // Advanced filtering and sorting
  const filteredAndSortedDocuments = useMemo(() => {
    let filtered = [...documents];

    // Apply search filter
    if (search) {
      const searchTerm = search.toLowerCase();
      filtered = filtered.filter(doc => 
        doc.firstName.toLowerCase().includes(searchTerm) ||
        doc.lastName.toLowerCase().includes(searchTerm) ||
        doc.documentName.toLowerCase().includes(searchTerm)
      );
    }

    // Apply date filter
    if (selectedDate) {
      filtered = filtered.filter(doc => {
        const docDate = new Date(doc.createdAt).toISOString().split('T')[0];
        return docDate === selectedDate;
      });
    }

    // Apply document type filter
    if (documentTypeFilter) {
      filtered = filtered.filter(doc => doc.documentName === documentTypeFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'createdAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [documents, search, selectedDate, documentTypeFilter, sortBy, sortOrder]);

  // Pagination
  const paginatedDocuments = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedDocuments.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedDocuments, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedDocuments.length / itemsPerPage);

  // Handle document deletion
  const handleDelete = async (documentId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      setIsDeleting(true);
      await axios.delete(
        `http://localhost:4110/api/adddocument/admindeleteDocument/${documentId}`,
        { withCredentials: true }
      );

      toast.success('Document deleted successfully');
      setDocuments(documents.filter(doc => doc._id !== documentId));
    } catch (error) {
      console.error('Error deleting document:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete document';
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle document download
  const handleDownload = async (documentUrl, documentName) => {
    try {
      const response = await axios.get(documentUrl, {
        responseType: 'blob',
        withCredentials: true,
        headers: {
          'Accept': 'application/pdf,application/octet-stream'
        }
      });

      const blob = response.data;
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      const fileName = documentName || documentUrl.split('/').pop();
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      
      toast.success('Download started');
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file');
    }
  };

  // Handle view document in modal
  const handleViewDocument = (doc) => {
    setViewModal({
      isOpen: true,
      document: doc,
      zoom: 1
    });
  };

  // Close modal
  const closeModal = () => {
    setViewModal({ isOpen: false, document: null, zoom: 1 });
  };

  // Handle zoom
  const handleZoom = (action) => {
    setViewModal(prev => ({
      ...prev,
      zoom: action === 'in' ? Math.min(prev.zoom + 0.2, 3) : Math.max(prev.zoom - 0.2, 0.5)
    }));
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearch('');
    setSelectedDate('');
    setDocumentTypeFilter('');
    setSortBy('createdAt');
    setSortOrder('desc');
    setCurrentPage(1);
    toast.success('Filters cleared');
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#333',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          },
        }}
      />

      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className=" bg-[#0179a4] p-3 rounded-xl">
            <FileText className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-700">View Documents</h1>
            <p className="text-gray-500 mt-1">{filteredAndSortedDocuments.length} documents found</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-sm min-w-64">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search documents..."
              className="outline-none flex-1 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-gray-400 hover:text-gray-600">
                <MdClose size={16} />
              </button>
            )}
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all duration-200 ${
              showFilters 
                ? ' bg-[#0179a4] text-white border-bg-[#0179a4]' 
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
            }`}
          >
            <Filter size={16} />
            Filters
          </button>

          {/* Add Document Button */}
          <button
            onClick={() => router.push('/adddocument')}
            className=" bg-[#0179a4] hover:bg-[#0179a4] text-white px-6 py-2 rounded-xl shadow-sm flex items-center gap-2 font-medium transition-all duration-200"
          >
            <Plus size={16} />
            Add Document
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Date Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Filter by Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  type="date" 
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
            </div>

            {/* Document Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Document Type</label>
              <select
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                value={documentTypeFilter}
                onChange={(e) => setDocumentTypeFilter(e.target.value)}
              >
                <option value="">All Types</option>
                {documentTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Sort By</label>
              <select
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="createdAt">Upload Date</option>
                <option value="firstName">First Name</option>
                <option value="lastName">Last Name</option>
                <option value="documentName">Document Type</option>
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Sort Order</label>
              <select
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>
          </div>

          <div className="flex justify-left items-center mt-4 pt-4 border-t border-gray-100">
            <button
              onClick={clearAllFilters}
              className="text-gray-500 hover:text-gray-700 text-sm font-medium"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-400 border-t-transparent"></div>
            <p className="mt-4 text-gray-600 font-medium">Loading documents...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-red-600 font-medium mb-4">Error: {error}</p>
              <button 
                onClick={fetchDocuments}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 mx-auto"
              >
                <RefreshCw size={16} />
                Retry
              </button>
            </div>
          </div>
        ) : filteredAndSortedDocuments.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="mx-auto text-gray-300 mb-4" size={64} />
            <p className="text-gray-500 text-lg font-medium mb-2">No documents found</p>
            {(search || selectedDate || documentTypeFilter) ? (
              <button 
                onClick={clearAllFilters}
                className="text-[#0179a4] hover:text-[#0179a4] font-medium"
              >
                Clear filters to see all documents
              </button>
            ) : (
              <button
                onClick={() => router.push('/adddocument')}
                className=" bg-[#0179a4] hover: bg-[#0179a4] text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 mx-auto mt-4"
              >
                <Plus size={18} />
                Add Your First Document
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-200">
                    <th className="py-4 px-4 text-left text-gray-700 font-semibold">Sr No.</th>
                    <th className="py-4 px-4 text-left text-gray-700 font-semibold">Name</th>
                    <th className="py-4 px-4 text-left text-gray-700 font-semibold">Document Type</th>
                    <th className="py-4 px-4 text-left text-gray-700 font-semibold">Upload Date</th>
                    <th className="py-4 px-4 text-center text-gray-700 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedDocuments.map((doc, index) => (
                    <tr key={doc._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150">
                      <td className="py-4 px-4 text-gray-600 font-medium">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-100 p-2 rounded-lg">
                            <User className="text-blue-500" size={16} />
                          </div>
                          <div>
                            <p className="font-medium text-gray-700">{doc.firstName} {doc.lastName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                          {doc.documentName}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-600">
                        {new Date(doc.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center gap-2">
                          {doc.documentFileUrl && (
                            <>
                              <button 
                                onClick={() => handleViewDocument(doc)}
                                className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors duration-150"
                                title="View document"
                              >
                                <Eye size={18} />
                              </button>
                              <button 
                                onClick={() => handleDownload(doc.documentFileUrl, doc.documentName)}
                                className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-colors duration-150"
                                title="Download document"
                              >
                                <Download size={18} />
                              </button>
                            </>
                          )}
                          <button 
                            onClick={() => handleDelete(doc._id)}
                            disabled={isDeleting}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-150 disabled:opacity-50"
                            title="Delete document"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedDocuments.length)} of {filteredAndSortedDocuments.length} results
                  </p>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    
                    {[...Array(totalPages)].map((_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1 rounded-lg border ${
                          currentPage === page
                            ? ' bg-[#0179a4] text-white border-blue-500'
                            : 'border-gray-300 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Document View Modal */}
      {viewModal.isOpen && viewModal.document && (
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-full flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">
                  {viewModal.document.firstName} {viewModal.document.lastName}
                </h3>
                <p className="text-gray-500">{viewModal.document.documentName}</p>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Zoom Controls */}
                <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => handleZoom('out')}
                    className="p-2 hover:bg-white rounded-md transition-colors duration-150"
                    title="Zoom out"
                  >
                    <ZoomOut size={16} />
                  </button>
                  <span className="text-sm font-medium px-2">
                    {Math.round(viewModal.zoom * 100)}%
                  </span>
                  <button
                    onClick={() => handleZoom('in')}
                    className="p-2 hover:bg-white rounded-md transition-colors duration-150"
                    title="Zoom in"
                  >
                    <ZoomIn size={16} />
                  </button>
                </div>
                
                {/* Download Button */}
                <button
                  onClick={() => handleDownload(viewModal.document.documentFileUrl, viewModal.document.documentName)}
                  className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-colors duration-150"
                  title="Download"
                >
                  <Download size={20} />
                </button>
                
                {/* Close Button */}
                <button
                  onClick={closeModal}
                  className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors duration-150"
                  title="Close"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-auto p-6">
              <div className="flex justify-center">
                <div 
                  className="border border-gray-200 rounded-lg overflow-hidden shadow-sm"
                  style={{ transform: `scale(${viewModal.zoom})`, transformOrigin: 'top center' }}
                >
                  {viewModal.document.documentFileUrl.toLowerCase().endsWith('.pdf') ? (
                    <iframe
                      src={`${viewModal.document.documentFileUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                      className="w-full"
                      style={{ height: '600px', minHeight: '400px' }}
                      title="Document Preview"
                    />
                  ) : (
                    <img
                      src={viewModal.document.documentFileUrl}
                      alt="Document"
                      className="max-w-full h-auto"
                      style={{ maxHeight: '600px' }}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}