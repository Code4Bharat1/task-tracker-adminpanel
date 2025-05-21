'use client'
import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Search, Download, Filter, Eye, FileText, CheckCircle,
    XCircle, AlertTriangle, ChevronDown, ChevronUp,
    RefreshCcw, ArrowUpDown, Info, X, Printer, Loader2,
    Clock
} from 'lucide-react';

export default function EmployeeBankDetailsAdmin() {
    // State management
    const [employees, setEmployees] = useState([]);
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [sortConfig, setSortConfig] = useState({ key: 'accountHolderName', direction: 'asc' });
    const [filters, setFilters] = useState({
        status: 'all',
        bank: 'all',
        dateRange: { start: '', end: '' }
    });
    const [stats, setStats] = useState({
        total: 0,
        verified: 0,
        pending: 0,
        rejected: 0
    });
    const [showFilterPanel, setShowFilterPanel] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('all');
    const [uniqueBanks, setUniqueBanks] = useState([]);

    // Fetch employee bank details
    const fetchEmployeeBankDetails = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_API}/user/bank/getBankDetails`, {
                withCredentials: true
            });

            if (response.data && response.data.bankDetails) {
                // Add status and additional fields for demonstration
                // In a real app, these would come from the API
                const enrichedData = response.data.bankDetails.map((employee, index) => ({
                    ...employee,
                    id: `emp-${index + 1}`,
                    employeeId: `EMP${100000 + index}`,
                    email: `${employee.accountHolderName.split(' ')[0].toLowerCase()}@company.com`,
                    status: ['verified', 'pending', 'rejected'][Math.floor(Math.random() * 3)], // For demo only
                    createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(), // Random date in last 90 days
                    updatedAt: new Date().toISOString()
                }));

                setEmployees(enrichedData);
                setFilteredEmployees(enrichedData);

                // Extract unique banks for filter
                const banks = [...new Set(enrichedData.map(emp => emp.bankName))];
                setUniqueBanks(banks);

                // Calculate stats
                const stats = {
                    total: enrichedData.length,
                    verified: enrichedData.filter(emp => emp.status === 'verified').length,
                    pending: enrichedData.filter(emp => emp.status === 'pending').length,
                    rejected: enrichedData.filter(emp => emp.status === 'rejected').length
                };
                setStats(stats);
            } else {
                throw new Error('Invalid response format');
            }

            setError(null);
        } catch (err) {
            console.error('Failed to fetch bank details:', err);
            setError(err.response?.data?.message || 'Failed to load employee bank details. Please try again.');
            setEmployees([]);
            setFilteredEmployees([]);
        } finally {
            setLoading(false);
        }
    };

    // Initial data load
    useEffect(() => {
        fetchEmployeeBankDetails();
    }, []);

    // Handle search and filtering
    useEffect(() => {
        applyFiltersAndSearch();
    }, [searchTerm, filters, employees, activeTab, sortConfig]);

    const applyFiltersAndSearch = () => {
        let results = [...employees];

        // Apply tab filter first
        if (activeTab !== 'all') {
            results = results.filter(emp => emp.status === activeTab);
        }

        // Apply search term
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            results = results.filter(emp =>
                emp.accountHolderName.toLowerCase().includes(lowerTerm) ||
                emp.employeeId.toLowerCase().includes(lowerTerm) ||
                emp.email.toLowerCase().includes(lowerTerm) ||
                emp.accountNumber.includes(lowerTerm) ||
                emp.bankName.toLowerCase().includes(lowerTerm) ||
                emp.ifscCode.toLowerCase().includes(lowerTerm) ||
                emp.branchName.toLowerCase().includes(lowerTerm)
            );
        }

        // Apply additional filters
        if (filters.status !== 'all') {
            results = results.filter(emp => emp.status === filters.status);
        }

        if (filters.bank !== 'all') {
            results = results.filter(emp => emp.bankName === filters.bank);
        }

        if (filters.dateRange.start) {
            const startDate = new Date(filters.dateRange.start);
            results = results.filter(emp => new Date(emp.createdAt) >= startDate);
        }

        if (filters.dateRange.end) {
            const endDate = new Date(filters.dateRange.end);
            endDate.setHours(23, 59, 59, 999); // End of day
            results = results.filter(emp => new Date(emp.createdAt) <= endDate);
        }

        // Apply sorting
        if (sortConfig.key) {
            results.sort((a, b) => {
                // Handle different data types
                const valueA = a[sortConfig.key] !== undefined ? a[sortConfig.key] : '';
                const valueB = b[sortConfig.key] !== undefined ? b[sortConfig.key] : '';

                // String comparison
                if (typeof valueA === 'string' && typeof valueB === 'string') {
                    return sortConfig.direction === 'asc'
                        ? valueA.localeCompare(valueB)
                        : valueB.localeCompare(valueA);
                }

                // Numeric comparison
                if (valueA < valueB) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (valueA > valueB) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }

        setFilteredEmployees(results);
        // Reset to first page when filters change
        setCurrentPage(1);
    };

    // Sort handler
    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // Handle filter changes
    const handleFilterChange = (filterType, value) => {
        const newFilters = { ...filters };

        if (filterType === 'dateStart') {
            newFilters.dateRange.start = value;
        } else if (filterType === 'dateEnd') {
            newFilters.dateRange.end = value;
        } else {
            newFilters[filterType] = value;
        }

        setFilters(newFilters);
    };

    // Reset filters
    const resetFilters = () => {
        setFilters({
            status: 'all',
            bank: 'all',
            dateRange: { start: '', end: '' }
        });
        setSearchTerm('');
        setActiveTab('all');
    };

    // Pagination
    const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredEmployees.slice(indexOfFirstItem, indexOfLastItem);

    // Format date for display
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        }).format(date);
    };

    // View employee details
    const viewEmployeeDetails = (employee) => {
        setSelectedEmployee(employee);
        setIsViewModalOpen(true);
    };

    // Export to CSV
    const exportToCSV = () => {
        const headers = ['Employee ID', 'Name', 'Email', 'Bank Name', 'Account Number', 'IFSC Code', 'Branch', 'Status', 'Date Added'];
        const data = filteredEmployees.map(emp => [
            emp.employeeId,
            emp.accountHolderName,
            emp.email,
            emp.bankName,
            emp.accountNumber,
            emp.ifscCode,
            emp.branchName,
            emp.status,
            formatDate(emp.createdAt)
        ]);

        const csvContent = [headers, ...data].map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `employee_bank_details_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Print employee details
    const printEmployeeDetails = () => {
        if (!selectedEmployee) return;

        const printWindow = window.open('', '_blank');

        printWindow.document.write(`
      <html>
        <head>
          <title>Employee Bank Details</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #333; border-bottom: 2px solid #f0b90b; padding-bottom: 10px; }
            .detail-row { margin-bottom: 15px; }
            .label { font-weight: bold; color: #555; }
            .container { max-width: 800px; margin: 0 auto; }
            @media print {
              body { padding: 0; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Employee Bank Details</h1>
            <div class="detail-row">
              <span class="label">Name:</span>
              <span>${selectedEmployee.accountHolderName}</span>
            </div>
            <div class="detail-row">
              <span class="label">Employee ID:</span>
              <span>${selectedEmployee.employeeId}</span>
            </div>
            <div class="detail-row">
              <span class="label">Bank Name:</span>
              <span>${selectedEmployee.bankName}</span>
            </div>
            <div class="detail-row">
              <span class="label">Branch:</span>
              <span>${selectedEmployee.branchName}</span>
            </div>
            <div class="detail-row">
              <span class="label">Account Number:</span>
              <span>${selectedEmployee.accountNumber}</span>
            </div>
            <div class="detail-row">
              <span class="label">IFSC Code:</span>
              <span>${selectedEmployee.ifscCode}</span>
            </div>
            <div class="detail-row">
              <span class="label">Status:</span>
              <span>${selectedEmployee.status}</span>
            </div>
            <div class="detail-row">
              <span class="label">Date Added:</span>
              <span>${formatDate(selectedEmployee.createdAt)}</span>
            </div>
            <button onclick="window.print();" style="padding: 10px 20px; background: #f0b90b; border: none; border-radius: 4px; cursor: pointer; margin-top: 20px;">
              Print
            </button>
          </div>
        </body>
      </html>
    `);

        printWindow.document.close();
    };

    // Status badge component
    const StatusBadge = ({ status }) => {
        let bgColor, textColor, icon;

        switch (status) {
            case 'verified':
                bgColor = 'bg-green-100';
                textColor = 'text-green-800';
                icon = <CheckCircle size={14} className="mr-1 text-green-600" />;
                break;
            case 'pending':
                bgColor = 'bg-yellow-100';
                textColor = 'text-yellow-800';
                icon = <Clock size={14} className="mr-1 text-yellow-600" />;
                break;
            case 'rejected':
                bgColor = 'bg-red-100';
                textColor = 'text-red-800';
                icon = <XCircle size={14} className="mr-1 text-red-600" />;
                break;
            default:
                bgColor = 'bg-gray-100';
                textColor = 'text-gray-800';
                icon = <Info size={14} className="mr-1 text-gray-600" />;
        }

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
                {icon}
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    // Handle tab change
    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    return (
        <div className="w-full p-4 sm:p-6 bg-white rounded-lg shadow-md">
            {/* Header with stats */}
            <div className="mb-6">
                <h1 className="text-xl sm:text-2xl font-bold mb-2">
                    Employee Bank Details
                    <div className="h-1 w-40 sm:w-56 bg-yellow-400 mt-1"></div>
                </h1>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                    <div
                        className={`bg-white rounded-lg p-4 border ${activeTab === 'all' ? 'border-yellow-400 shadow-md' : 'border-gray-200'} cursor-pointer transition-all`}
                        onClick={() => handleTabChange('all')}
                    >
                        <span className="text-sm text-gray-500">Total Employees</span>
                        <span className="text-2xl font-bold text-gray-800 block">{stats.total}</span>
                    </div>
                    <div
                        className={`bg-white rounded-lg p-4 border ${activeTab === 'verified' ? 'border-green-400 shadow-md' : 'border-gray-200'} cursor-pointer transition-all`}
                        onClick={() => handleTabChange('verified')}
                    >
                        <span className="text-sm text-gray-500">Verified</span>
                        <div className="flex items-center">
                            <span className="text-2xl font-bold text-green-600 block">{stats.verified}</span>
                            <span className="ml-2 text-sm text-gray-500">
                                ({stats.total ? ((stats.verified / stats.total) * 100).toFixed(1) : 0}%)
                            </span>
                        </div>
                    </div>
                    <div
                        className={`bg-white rounded-lg p-4 border ${activeTab === 'pending' ? 'border-yellow-400 shadow-md' : 'border-gray-200'} cursor-pointer transition-all`}
                        onClick={() => handleTabChange('pending')}
                    >
                        <span className="text-sm text-gray-500">Pending</span>
                        <div className="flex items-center">
                            <span className="text-2xl font-bold text-yellow-600 block">{stats.pending}</span>
                            <span className="ml-2 text-sm text-gray-500">
                                ({stats.total ? ((stats.pending / stats.total) * 100).toFixed(1) : 0}%)
                            </span>
                        </div>
                    </div>
                    <div
                        className={`bg-white rounded-lg p-4 border ${activeTab === 'rejected' ? 'border-red-400 shadow-md' : 'border-gray-200'} cursor-pointer transition-all`}
                        onClick={() => handleTabChange('rejected')}
                    >
                        <span className="text-sm text-gray-500">Rejected</span>
                        <div className="flex items-center">
                            <span className="text-2xl font-bold text-red-600 block">{stats.rejected}</span>
                            <span className="ml-2 text-sm text-gray-500">
                                ({stats.total ? ((stats.rejected / stats.total) * 100).toFixed(1) : 0}%)
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                <div className="flex flex-wrap gap-4 items-center justify-between">
                    {/* Search */}
                    <div className="relative flex-grow max-w-md">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by name, ID, bank, account number..."
                            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-yellow-500 focus:border-yellow-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Filter controls */}
                    <div className="flex flex-wrap gap-2 items-center">
                        <button
                            onClick={() => setShowFilterPanel(!showFilterPanel)}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                            <Filter className="mr-2 h-4 w-4" />
                            Filters {showFilterPanel ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />}
                        </button>

                        <button
                            onClick={exportToCSV}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Export CSV
                        </button>

                        <button
                            onClick={fetchEmployeeBankDetails}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            title="Refresh data"
                        >
                            <RefreshCcw className="mr-2 h-4 w-4" />
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Expandable filter panel */}
                {showFilterPanel && (
                    <div className="mt-4 p-4 border border-gray-200 rounded-md bg-white">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {/* Status filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    className="w-full border border-gray-300 rounded-md p-2"
                                    value={filters.status}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                >
                                    <option value="all">All Statuses</option>
                                    <option value="verified">Verified</option>
                                    <option value="pending">Pending</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            </div>

                            {/* Bank filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Bank</label>
                                <select
                                    className="w-full border border-gray-300 rounded-md p-2"
                                    value={filters.bank}
                                    onChange={(e) => handleFilterChange('bank', e.target.value)}
                                >
                                    <option value="all">All Banks</option>
                                    {uniqueBanks.map((bank, idx) => (
                                        <option key={idx} value={bank}>{bank}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Date range filter - start */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                                <input
                                    type="date"
                                    className="w-full border border-gray-300 rounded-md p-2"
                                    value={filters.dateRange.start}
                                    onChange={(e) => handleFilterChange('dateStart', e.target.value)}
                                />
                            </div>

                            {/* Date range filter - end */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                                <input
                                    type="date"
                                    className="w-full border border-gray-300 rounded-md p-2"
                                    value={filters.dateRange.end}
                                    onChange={(e) => handleFilterChange('dateEnd', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={resetFilters}
                                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                                Reset All Filters
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Error message */}
            {error && (
                <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-400 text-red-700 flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    <p className="text-sm">{error}</p>
                    <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700">
                        <X className="h-5 w-5" />
                    </button>
                </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto shadow rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <button
                                    className="flex items-center focus:outline-none"
                                    onClick={() => requestSort('accountHolderName')}
                                >
                                    Employee Details
                                    <ArrowUpDown className="ml-1 h-4 w-4" />
                                </button>
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <button
                                    className="flex items-center focus:outline-none"
                                    onClick={() => requestSort('bankName')}
                                >
                                    Bank Details
                                    <ArrowUpDown className="ml-1 h-4 w-4" />
                                </button>
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <button
                                    className="flex items-center focus:outline-none"
                                    onClick={() => requestSort('branchName')}
                                >
                                    Branch Name
                                    <ArrowUpDown className="ml-1 h-4 w-4" />
                                </button>
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <button
                                    className="flex items-center focus:outline-none"
                                    onClick={() => requestSort('status')}
                                >
                                    Status
                                    <ArrowUpDown className="ml-1 h-4 w-4" />
                                </button>
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <button
                                    className="flex items-center focus:outline-none"
                                    onClick={() => requestSort('createdAt')}
                                >
                                    Date Added
                                    <ArrowUpDown className="ml-1 h-4 w-4" />
                                </button>
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                    <div className="flex justify-center">
                                        <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
                                    </div>
                                    <div className="mt-2">Loading employee bank details...</div>
                                </td>
                            </tr>
                        ) : filteredEmployees.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                    <FileText className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                                    <p>No bank details found matching your filters.</p>
                                    <button
                                        onClick={resetFilters}
                                        className="mt-3 text-sm text-yellow-600 hover:text-yellow-800 underline"
                                    >
                                        Reset filters
                                    </button>
                                </td>
                            </tr>
                        ) : (
                            currentItems.map((employee) => (
                                <tr key={employee.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{employee.accountHolderName}</div>
                                        <div className="text-xs text-gray-500">{employee.employeeId}</div>
                                        <div className="text-xs text-gray-500">{employee.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{employee.bankName}</div>
                                        <div className="text-xs text-gray-500">
                                            A/C: {employee.accountNumber.replace(/(\d{4})(\d{0,4})(\d{0,4})(\d*)/, (m, p1, p2, p3, p4) =>
                                                [p1, p2, p3, p4].filter(Boolean).join(' ')
                                            )}
                                        </div>
                                        <div className="text-xs text-gray-500">IFSC: {employee.ifscCode}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{employee.branchName}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <StatusBadge status={employee.status} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatDate(employee.createdAt)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end space-x-2">
                                            <button
                                                onClick={() => viewEmployeeDetails(employee)}
                                                className="text-blue-600 hover:text-blue-900 bg-blue-50 p-1 rounded-full"
                                                title="View Details"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </button>
                                            {employee.status === 'pending' && (
                                                <>
                                                    <button
                                                        className="text-green-600 hover:text-green-900 bg-green-50 p-1 rounded-full"
                                                        title="Approve"
                                                    >
                                                        <CheckCircle className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        className="text-red-600 hover:text-red-900 bg-red-50 p-1 rounded-full"
                                                        title="Reject"
                                                    >
                                                        <XCircle className="h-4 w-4" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {!loading && filteredEmployees.length > 0 && (
                <div className="flex flex-wrap items-center justify-between mt-4 px-2">
                    <div className="flex items-center mb-2 sm:mb-0">
                        <span className="text-sm text-gray-700">
                            Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
                            <span className="font-medium">
                                {Math.min(indexOfLastItem, filteredEmployees.length)}
                            </span> of{" "}
                            <span className="font-medium">{filteredEmployees.length}</span> results
                        </span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <select
                            className="border border-gray-300 rounded-md p-1 text-sm"
                            value={itemsPerPage}
                            onChange={(e) => setItemsPerPage(Number(e.target.value))}
                        >
                            <option value={10}>10 / page</option>
                            <option value={25}>25 / page</option>
                            <option value={50}>50 / page</option>
                            <option value={100}>100 / page</option>
                        </select>

                        <button
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className={`px-3 py-1 rounded-md text-sm ${currentPage === 1
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                                }`}
                        >
                            Previous
                        </button>

                        {totalPages <= 5 ? (
                            Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`px-3 py-1 rounded-md text-sm ${currentPage === page
                                        ? 'bg-yellow-600 text-white'
                                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                                        }`}
                                >
                                    {page}
                                </button>
                            ))
                        ) : (
                            <>
                                {currentPage > 2 && (
                                    <button
                                        onClick={() => setCurrentPage(1)}
                                        className="px-3 py-1 rounded-md text-sm bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                                    >
                                        1
                                    </button>
                                )}

                                {currentPage > 3 && <span className="px-2">...</span>}

                                {currentPage > 1 && (
                                    <button
                                        onClick={() => setCurrentPage(currentPage - 1)}
                                        className="px-3 py-1 rounded-md text-sm bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                                    >
                                        {currentPage - 1}
                                    </button>
                                )}

                                <button className="px-3 py-1 rounded-md text-sm bg-yellow-600 text-white">
                                    {currentPage}
                                </button>

                                {currentPage < totalPages && (
                                    <button
                                        onClick={() => setCurrentPage(currentPage + 1)}
                                        className="px-3 py-1 rounded-md text-sm bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                                    >
                                        {currentPage + 1}
                                    </button>
                                )}

                                {currentPage < totalPages - 2 && <span className="px-2">...</span>}

                                {currentPage < totalPages - 1 && (
                                    <button
                                        onClick={() => setCurrentPage(totalPages)}
                                        className="px-3 py-1 rounded-md text-sm bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                                    >
                                        {totalPages}
                                    </button>
                                )}
                            </>
                        )}

                        <button
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className={`px-3 py-1 rounded-md text-sm ${currentPage === totalPages
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                                }`}
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            {/* View Employee Modal */}
            {isViewModalOpen && selectedEmployee && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-xs bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-lg font-semibold">Employee Bank Details</h3>
                            <button
                                onClick={() => setIsViewModalOpen(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Employee ID</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{selectedEmployee.employeeId}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{selectedEmployee.accountHolderName}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{selectedEmployee.email}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Bank Name</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{selectedEmployee.bankName}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Account Number</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{selectedEmployee.accountNumber}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">IFSC Code</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{selectedEmployee.ifscCode}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Branch</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{selectedEmployee.branchName}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        <StatusBadge status={selectedEmployee.status} />
                                    </dd>
                                </div>
                            </div>

                            <div className="mt-4 flex justify-end space-x-3">
                                <button
                                    onClick={printEmployeeDetails}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center"
                                >
                                    <Printer className="h-4 w-4 mr-2" />
                                    Print
                                </button>
                                <button
                                    onClick={() => setIsViewModalOpen(false)}
                                    className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}