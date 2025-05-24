"use client";
import React, { useState } from 'react';
import { Download, Printer, Calendar, User, Building2, Mail, Phone, Save, Eye, EyeOff } from 'lucide-react';

const SalarySlip = () => {
  const handleSubmit = () => {
    setShowPreview(true);
  };const [showPreview, setShowPreview] = useState(false);
  const [formData, setFormData] = useState({
    // Employee Info
    name: "",
    employeeId: "",
    designation: "",
    department: "",
    email: "",
    phone: "",
    payPeriod: "",
    payDate: "",
    
    // Company Info
    companyName: "TechCorp Solutions",
    
    // Salary Components
    basicSalary: 0,
    allowances: {
      houseRent: 0,
      transport: 0,
      medical: 0,
      meal: 0
    },
    deductions: {
      tax: 0,
      providentFund: 0,
      insurance: 0,
      loan: 0
    }
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value === '' ? 0 : parseFloat(value) || 0
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'basicSalary' ? (value === '' ? 0 : parseFloat(value) || 0) : value
      }));
    }
  };

  const totalEarnings = formData.basicSalary + 
    Object.values(formData.allowances).reduce((sum, val) => sum + val, 0);
  
  const totalDeductions = Object.values(formData.deductions).reduce((sum, val) => sum + val, 0);
  
  const netSalary = totalEarnings - totalDeductions;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     setShowPreview(true);
//   };

  const resetForm = () => {
    setFormData({
      name: "",
      employeeId: "",
      designation: "",
      department: "",
      email: "",
      phone: "",
      payPeriod: "",
      payDate: "",
      companyName: "TechCorp Solutions",
      basicSalary: 0,
      allowances: {
        houseRent: 0,
        transport: 0,
        medical: 0,
        meal: 0
      },
      deductions: {
        tax: 0,
        providentFund: 0,
        insurance: 0,
        loan: 0
      }
    });
    setShowPreview(false);
  };

  const downloadPDF = () => {
  window.print();
};

  if (showPreview) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header Actions */}
          <div className="flex justify-between items-center mb-6">
            <button 
              onClick={() => setShowPreview(false)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <EyeOff size={18} />
              Back to Form
            </button>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors" 
              onClick={downloadPDF}>
                <Download size={18} />
                Download PDF
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              onClick={() => window.print()}>
                <Printer size={18} />
                Print
              </button>
            </div>
          </div>

          {/* Salary Slip Preview */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Building2 size={32} />
                  <div>
                    <h1 className="text-2xl font-bold">{formData.companyName}</h1>
                    <p className="text-blue-100">Salary Statement</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar size={20} />
                    <span className="text-lg font-semibold">{formData.payPeriod}</span>
                  </div>
                  <p className="text-blue-100">Pay Date: {formData.payDate}</p>
                </div>
              </div>
            </div>

            {/* Employee Information */}
            <div className="p-8 border-b border-gray-200">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <User size={24} className="text-blue-600" />
                    Employee Information
                  </h2>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-semibold">{formData.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Employee ID:</span>
                      <span className="font-semibold">{formData.employeeId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Designation:</span>
                      <span className="font-semibold">{formData.designation}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Department:</span>
                      <span className="font-semibold">{formData.department}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Contact Details</h2>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Mail size={18} className="text-blue-600" />
                      <span className="text-gray-700">{formData.email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone size={18} className="text-blue-600" />
                      <span className="text-gray-700">{formData.phone}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Salary Breakdown */}
            <div className="p-8">
              <div className="grid md:grid-cols-3 gap-8">
                {/* Earnings */}
                <div className="bg-green-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-green-800 mb-4">Earnings</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Basic Salary</span>
                      <span className="font-semibold text-green-700">
                        {formatCurrency(formData.basicSalary)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">House Rent</span>
                      <span className="font-semibold text-green-700">
                        {formatCurrency(formData.allowances.houseRent)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Transport</span>
                      <span className="font-semibold text-green-700">
                        {formatCurrency(formData.allowances.transport)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Medical</span>
                      <span className="font-semibold text-green-700">
                        {formatCurrency(formData.allowances.medical)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Meal</span>
                      <span className="font-semibold text-green-700">
                        {formatCurrency(formData.allowances.meal)}
                      </span>
                    </div>
                    <div className="border-t border-green-200 pt-3">
                      <div className="flex justify-between font-bold text-green-800">
                        <span>Total Earnings</span>
                        <span>{formatCurrency(totalEarnings)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Deductions */}
                <div className="bg-red-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-red-800 mb-4">Deductions</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Income Tax</span>
                      <span className="font-semibold text-red-700">
                        {formatCurrency(formData.deductions.tax)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Provident Fund</span>
                      <span className="font-semibold text-red-700">
                        {formatCurrency(formData.deductions.providentFund)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Insurance</span>
                      <span className="font-semibold text-red-700">
                        {formatCurrency(formData.deductions.insurance)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Loan EMI</span>
                      <span className="font-semibold text-red-700">
                        {formatCurrency(formData.deductions.loan)}
                      </span>
                    </div>
                    <div className="border-t border-red-200 pt-3">
                      <div className="flex justify-between font-bold text-red-800">
                        <span>Total Deductions</span>
                        <span>{formatCurrency(totalDeductions)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Net Salary */}
                <div className="bg-blue-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-blue-800 mb-4">Net Salary</h3>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-800 mb-2">
                        {formatCurrency(netSalary)}
                      </div>
                      <p className="text-blue-600">Amount Payable</p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 border border-blue-200">
                      <div className="text-sm text-gray-600 mb-2">Breakdown:</div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Gross Earnings</span>
                        <span className="text-green-600">+{formatCurrency(totalEarnings)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Total Deductions</span>
                        <span className="text-red-600">-{formatCurrency(totalDeductions)}</span>
                      </div>
                      <div className="border-t border-gray-200 mt-2 pt-2">
                        <div className="flex justify-between font-semibold">
                          <span>Net Pay</span>
                          <span className="text-blue-700">{formatCurrency(netSalary)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 p-6 text-center text-sm text-gray-600">
              <p>This is a computer-generated salary slip and does not require a signature.</p>
              <p className="mt-2">For any queries, please contact HR at hr@{formData.companyName.toLowerCase().replace(/\s/g, '')}.com</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Form Header */}
          <div className="bg-gradient-to-r from-blue-400 to-indigo-700 text-white p-8">
            <div className="flex items-center gap-3 mb-4">
              <Building2 size={32} />
              <div>
                <h1 className="text-2xl font-bold">Salary Slip Generator</h1>
                <p className="text-blue-100">Fill in the details to generate salary slip</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            {/* Company Information */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Company Information</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Employee Information */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Employee Information</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Employee ID</label>
                  <input
                    type="text"
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Designation</label>
                  <input
                    type="text"
                    name="designation"
                    value={formData.designation}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pay Period</label>
                  <input
                    type="text"
                    name="payPeriod"
                    value={formData.payPeriod}
                    onChange={handleInputChange}
                    placeholder="e.g., March 2024"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pay Date</label>
                  <input
                    type="date"
                    name="payDate"
                    value={formData.payDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Salary Components */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* Earnings */}
              <div className="bg-green-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-800 mb-4">Earnings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Basic Salary ($)</label>
                    <input
                      type="number"
                      name="basicSalary"
                      value={formData.basicSalary || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">House Rent Allowance ($)</label>
                    <input
                      type="number"
                      name="allowances.houseRent"
                      value={formData.allowances.houseRent || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Transport Allowance ($)</label>
                    <input
                      type="number"
                      name="allowances.transport"
                      value={formData.allowances.transport || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Medical Allowance ($)</label>
                    <input
                      type="number"
                      name="allowances.medical"
                      value={formData.allowances.medical || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Meal Allowance ($)</label>
                    <input
                      type="number"
                      name="allowances.meal"
                      value={formData.allowances.meal || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="border-t border-green-200 pt-3">
                    <div className="flex justify-between font-bold text-green-800">
                      <span>Total Earnings:</span>
                      <span>{formatCurrency(totalEarnings)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Deductions */}
              <div className="bg-red-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-red-800 mb-4">Deductions</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Income Tax ($)</label>
                    <input
                      type="number"
                      name="deductions.tax"
                      value={formData.deductions.tax || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Provident Fund ($)</label>
                    <input
                      type="number"
                      name="deductions.providentFund"
                      value={formData.deductions.providentFund || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Insurance ($)</label>
                    <input
                      type="number"
                      name="deductions.insurance"
                      value={formData.deductions.insurance || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Loan EMI ($)</label>
                    <input
                      type="number"
                      name="deductions.loan"
                      value={formData.deductions.loan || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="border-t border-red-200 pt-3">
                    <div className="flex justify-between font-bold text-red-800">
                      <span>Total Deductions:</span>
                      <span>{formatCurrency(totalDeductions)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Net Salary Summary */}
            <div className="bg-blue-50 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-blue-800 mb-4">Net Salary Summary</h3>
              <div className="grid md:grid-cols-3 gap-4 text-center">
                <div className="bg-white rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-600">{formatCurrency(totalEarnings)}</div>
                  <div className="text-sm text-gray-600">Total Earnings</div>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="text-2xl font-bold text-red-600">{formatCurrency(totalDeductions)}</div>
                  <div className="text-sm text-gray-600">Total Deductions</div>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="text-3xl font-bold text-blue-600">{formatCurrency(netSalary)}</div>
                  <div className="text-sm text-gray-600">Net Salary</div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-center gap-4">
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Reset Form
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Eye size={20} />
                Generate Salary Slip
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalarySlip;