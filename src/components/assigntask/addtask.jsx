"use client";
import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { AiFillDelete } from "react-icons/ai";

export default function AddTask() {
  const underlineRef = useRef(null);
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);

  useEffect(() => {
    gsap.fromTo(
      underlineRef.current,
      { width: "0%" },
      { width: "100%", duration: 1, ease: "power2.out" }
    );
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleDelete = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="h-auto p-8">
      {/* Heading */}
      <div className="flex justify-start items-center">
        <h1 className="text-2xl font-bold text-center mb-8 relative text-gray-800">
          <span
            ref={underlineRef}
            className="absolute left-0 bottom-0 h-[2px] bg-yellow-500 w-full"
          ></span>
          Add New
        </h1>
        <span className="text-2xl font-bold text-center ml-1 mb-8 relative text-gray-800">
          Task
        </span>
      </div>

      {/* Form Card */}
      <div className="mx-auto max-w-6xl bg-white border border-gray-300 rounded-xl shadow-[0px_2px_0px_rgba(0,0,0,0.2)] p-6">
        {/* Task Details */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold -ml-2 text-gray-700 mb-4">
            Task Details :
          </h2>
          <div className="space-y-4">
            {/* Title */}
            <div className="flex items-center gap-4">
              <label
                htmlFor="task-title"
                className="text-md font-medium text-gray-600 min-w-[100px]"
              >
                Task Title :
              </label>
              <input
                type="text"
                id="task-title"
                className="w-200 p-2 border border-gray-400 shadow rounded-md"
              />
            </div>

            {/* Description */}
            <div className="flex items-start gap-4">
              <label
                htmlFor="description"
                className="text-md font-medium text-gray-600 pt-2 min-w-[100px]"
              >
                Description :
              </label>
              <textarea
                id="description"
                rows="2"
                className="w-200 p-2 border border-gray-400 shadow rounded-md h-14 resize-none"
              />
            </div>

            <div className="flex space-x-20">
              {/* Due Date */}
              <div className="flex items-center gap-4">
                <label
                  htmlFor="due-date"
                  className="text-md font-medium text-gray-600 min-w-[100px]"
                >
                  Due Date :
                </label>
                <input
                  type="date"
                  id="due-date"
                  className="w-64 p-2 border border-gray-400 shadow rounded-md"
                />
              </div>

              {/* Due Time */}
              <div className="flex items-center gap-4">
                <label
                  htmlFor="due-time"
                  className="text-md font-medium text-gray-600 min-w-[100px]"
                >
                  Due Time :
                </label>
                <input
                  type="time"
                  id="due-time"
                  className="w-64 p-2 border border-gray-400 shadow rounded-md"
                />
              </div>
            </div>
          </div>
        </div>

        <hr />

        {/* Assignment Table */}
        <div className="grid grid-cols-3 gap-6 mx-auto mt-10 mb-10">
          {/* Assigned To */}
          <div className="flex flex-col">
            <label
              htmlFor="assigned-to"
              className="mb-1 text-lg font-medium text-gray-700"
            >
              Assigned to
            </label>
            <select
              id="assigned-to"
              className="border border-gray-400 rounded-md px-3 w-60 py-2 text-md shadow"
            >
              <option>Name</option>
            </select>
          </div>

          {/* Assign Date */}
          <div className="flex flex-col">
            <label
              htmlFor="assign-date"
              className="mb-1 text-lg font-medium text-gray-700"
            >
              Assign Date
            </label>
            <input
              type="text"
              id="assign-date"
              placeholder="DD-MM-YY"
              className="border border-gray-400 w-60 rounded-md px-3 py-2 text-md shadow"
            />
          </div>

          {/* Department */}
          <div className="flex flex-col">
            <label
              htmlFor="department"
              className="mb-1 text-lg font-medium text-gray-700"
            >
              Department
            </label>
            <input
              type="text"
              id="department"
              value="IT-Department"
              readOnly
              className="border border-gray-400 w-60 rounded-md px-3 py-2 text-md shadow bg-gray-100"
            />
          </div>

          {/* Priority */}
          <div className="flex flex-col">
            <label
              htmlFor="priority"
              className="mb-1 text-lg font-medium text-gray-700"
            >
              Priority
            </label>
            <select
              id="priority"
              className="border border-gray-400 rounded-md px-3 py-2 text-md w-60 shadow"
            >
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
              <option>Urgent</option>
            </select>
          </div>

          {/* Status */}
          <div className="flex flex-col">
            <label
              htmlFor="status"
              className="mb-1 text-lg font-medium text-gray-700"
            >
              Status
            </label>
            <select
              id="status"
              className="border border-gray-400 rounded-md px-3 py-2 w-60 text-md shadow"
            >
              <option>To Do</option>
              <option>In Progress</option>
              <option>Completed</option>
              <option>Deferred</option>
            </select>
          </div>

          {/* Tag Member */}
          <div className="flex flex-col">
            <label
              htmlFor="tag-member"
              className="mb-1 text-lg font-medium text-gray-700"
            >
              Tag Member
            </label>
            <select
              id="tag-member"
              className="border border-gray-400 rounded-md px-3 py-2 w-60 text-md shadow"
            >
              <option>Tag Member</option>
            </select>
          </div>
        </div>

        <hr />

        {/* File Upload and Recurring Task */}
        <div className="p-6">
          <div className="grid grid-cols-2 gap-6 items-start">
            {/* Attachment */}
            <div className="flex flex-col">
              <label
                htmlFor="attachment"
                className="mb-1 text-sm font-medium text-gray-700"
              >
                Attachment
              </label>
              <div className="flex items-center gap-2 w-60 bg-gray-300 shadow px-2 py-1 rounded">
                <input
                  id="attachment"
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="text-sm file:mr-4 file:py-1 file:px-3 file:border-0 file:bg-white file:shadow file:rounded file:cursor-pointer"
                />
                {file && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="text-black hover:text-red-600"
                  >
                    <AiFillDelete size={20} />
                  </button>
                )}
              </div>
            </div>

            {/* Recurring Tasks */}
            <div className="flex flex-col">
              <label
                htmlFor="recurring"
                className="mb-1 text-sm font-medium text-gray-700"
              >
                Recurring Tasks
              </label>
              <input
                id="recurring"
                type="text"
                placeholder="Yes/No"
                className="border border-gray-300 rounded-md px-3 w-40 py-2 text-sm shadow"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-6">
            {/* Row 1: Cancel and Save */}
            <div className="flex gap-4">
              <button className="px-4 py-2 font-medium text-xl border-2 border-[#018ABE] w-40 text-[#018ABE] rounded-md hover:bg-blue-50">
                Cancel
              </button>
              <button className="px-4 py-2 font-medium text-xl bg-[#018ABE] w-40 text-white rounded-md shadow hover:bg-[#0173a1]">
                Save
              </button>
            </div>

            {/* Row 2: Save & Add Another */}
            <div className="mt-4">
              <button className="px-4 py-2 text-xl font-medium border-2 w-85 border-[#018ABE] text-[#018ABE] rounded-md hover:bg-blue-50">
                Save & Add Another
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
