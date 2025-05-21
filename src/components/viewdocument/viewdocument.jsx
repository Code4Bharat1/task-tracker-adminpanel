'use client';
import React, { useState, useEffect } from 'react';
import { MdDelete, MdDownload, MdVisibility } from 'react-icons/md';
import { Toaster, toast } from 'react-hot-toast';
import { Plus, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ViewDocument() {
  const [search, setSearch] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const router = useRouter();

  // Fetch documents from the backend
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await fetch('http://localhost:4110/api/adddocument/admingetDocuments', {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch documents: ${response.status}`);
        }
        
        const data = await response.json();
        setDocuments(data);
        setFilteredDocuments(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching documents:', error);
        setError(error.message);
        setLoading(false);
        toast.error('Failed to load documents');
      }
    };

    fetchDocuments();
  }, []);

  // Filter documents by date and search term
  useEffect(() => {
    let filtered = [...documents];

    // Apply date filter if selected
    if (selectedDate) {
      filtered = filtered.filter(doc => {
        const docDate = new Date(doc.createdAt).toISOString().split('T')[0];
        return docDate === selectedDate;
      });
    }

    // Apply search filter if search term exists
    if (search) {
      const searchTerm = search.toLowerCase();
      filtered = filtered.filter(doc => 
        doc.firstName.toLowerCase().includes(searchTerm) ||
        doc.lastName.toLowerCase().includes(searchTerm) ||
        doc.documentName.toLowerCase().includes(searchTerm)
      );
    }

    setFilteredDocuments(filtered);
  }, [selectedDate, search, documents]);

  // Handle document deletion
  const handleDelete = async (documentId) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        const response = await fetch(`http://localhost:4110/api/adddocument/admindeleteDocument/${documentId}`, {
          method: 'DELETE',
          credentials: 'include'
        });

        if (response.ok) {
          toast.success('Document deleted successfully');
          setDocuments(documents.filter(doc => doc._id !== documentId));
        } else {
          const errorData = await response.json();
          toast.error(errorData.message || 'Failed to delete document');
        }
      } catch (error) {
        console.error('Error deleting document:', error);
        toast.error('Server error, please try again');
      }
    }
  };

  // Handle document download
  const handleDownload = async (documentUrl, documentName) => {
    try {
      const response = await fetch(documentUrl, {
        credentials: 'include',
        headers: {
          'Accept': 'application/pdf,application/octet-stream'
        }
      });
      if (!response.ok) {
        throw new Error('Failed to download file');
      }
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      const fileName = documentName || documentUrl.split('/').pop();
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file');
    }
  };

  // Clear date filter
  const clearDateFilter = () => {
    setSelectedDate('');
  };

  return (
    <div className="min-h-screen bg-white px-4 py-8">
      <Toaster />
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">
          <span className="border-b-4 border-red-500 pb-1">View Document</span>
        </h1>
        <div className='flex justify-between items-center gap-4'>
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="flex items-center gap-2 bg-white border-none rounded-full px-4 py-2 shadow">
              <Search className="w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search by name or document"
                className="outline-none w-48 text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Add Document Button */}
          <button
            onClick={() => router.push('/adddocument')}
            className="bg-[#018ABE] cursor-pointer hover:bg-[#0176a1] text-white px-4 py-2 rounded shadow flex items-center gap-2 text-sm font-medium"
          >
            <Plus size={16} />
            Add Document
          </button>

          <div className="flex items-center">
            <input 
              type="date" 
              className="border border-gray-300 rounded-md px-3 py-1 mr-2"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              placeholder="dd-mm-yyyy"
            />
            {selectedDate && (
              <button 
                className="text-gray-500 hover:text-gray-700 ml-1"
                onClick={clearDateFilter}
                title="Clear filter"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-xl shadow">
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
            <p className="mt-2">Loading documents...</p>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">
            <p>Error: {error}</p>
            <button 
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            {filteredDocuments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No documents found</p>
                {(search || selectedDate) && (
                  <button 
                    className="mt-2 text-blue-500 hover:text-blue-700"
                    onClick={() => {
                      setSearch('');
                      setSelectedDate('');
                    }}
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th className="py-3 px-4 text-center text-white bg-[#0095c7] rounded-tl-lg">Sr No.</th>
                      <th className="py-3 px-4 text-center text-white bg-[#0095c7]">First Name</th>
                      <th className="py-3 px-4 text-center text-white bg-[#0095c7]">Last Name</th>
                      <th className="py-3 px-4 text-center text-white bg-[#0095c7]">Document Name</th>
                      <th className="py-3 px-4 text-center text-white bg-[#0095c7]">Upload Date</th>
                      <th className="py-3 px-4 text-center text-white bg-[#0095c7]">Download</th>
                      <th className="py-3 px-4 text-center text-white bg-[#0095c7] rounded-tr-lg">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDocuments.map((doc, index) => (
                      <tr key={doc._id || index} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 text-center">{index + 1}</td>
                        <td className="py-3 px-4 text-center">{doc.firstName}</td>
                        <td className="py-3 px-4 text-center">{doc.lastName}</td>
                        <td className="py-3 px-4 text-center">{doc.documentName}</td>
                        <td className="py-3 px-4 text-center">
                          {new Date(doc.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {doc.documentFileUrl && (
                            <button 
                              onClick={() => handleDownload(doc.documentFileUrl, doc.documentName)}
                              className="text-blue-600 hover:text-blue-800"
                              title="Download"
                            >
                              <MdDownload size={22} />
                            </button>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center space-x-3">
                            <button 
                              className="text-blue-600 hover:text-blue-800"
                              title="View"
                              onClick={() => window.open(doc.documentFileUrl, '_blank')}
                            >
                              <MdVisibility size={22} />
                            </button>
                            <button 
                              className="text-red-600 hover:text-red-800"
                              title="Delete"
                              onClick={() => handleDelete(doc._id)}
                            >
                              <MdDelete size={22} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}