"use client";
import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import axios from "axios";

export default function AssignTask() {
  const underlineRef = useRef(null);
  const [formData, setFormData] = useState({
    bucketName: "",
    assignedTo: "",
    assignedBy: "",
    assignDate: "",
    deadline: "",
    dueTime: "",
    priority: "Medium",
    status: "Open",
    tagMember: "",
    attachmentRequired: "No",
    recurring: false,
    taskDescription: "",
    remark: ""
  });

  useEffect(() => {
    gsap.fromTo(
      underlineRef.current,
      { width: "0%" },
      { width: "100%", duration: 1, ease: "power2.out" }
    );
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAssignDateChange = (e) => {
    const date = e.target.value;
    setFormData(prev => ({
      ...prev,
      assignDate: date,
      ...(prev.deadline && prev.deadline < date && { deadline: "" })
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:4110/api/tasks/createTask",
        {
          ...formData,
          attachmentRequired: formData.attachmentRequired === "Yes",
          assignDate: new Date(formData.assignDate),
          deadline: new Date(formData.deadline)
        },
        {
          withCredentials: true // ✅ Important: sends cookies with request
        }
      );
      console.log("Task created successfully:", response.data);
      // Reset form or show success message
    } catch (error) {
      console.error("Error creating task:", error);
      // Handle error (show error message)
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
          Task Assign
        </h1>
        <span className="text-2xl font-bold text-center mb-8 ml-1 relative text-gray-800">
          Details
        </span>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mx-auto max-w-6xl bg-white border border-gray-300 rounded-xl shadow-[0px_2px_0px_rgba(0,0,0,0.2)] p-6">
          <div className="flex items-center mb-4 gap-4">
            <label htmlFor="bucketName" className="text-md font-medium text-gray-600 min-w-[100px]">
              Bucket Name
            </label>
            <input
              type="text"
              id="bucketName"
              name="bucketName"
              value={formData.bucketName}
              onChange={handleInputChange}
              className="w-60 p-2 border border-gray-400 shadow-[0px_2px_0px_rgba(0,0,0,0.2)] rounded-sm"
              placeholder="Bucket Name"
              required
            />
          </div>

          {/* Assignment Table */}
          <div className="grid grid-cols-3 gap-6 mx-auto mt-10 mb-10">
            {/* Assigned To */}
            <div className="flex flex-col">
              <label htmlFor="assignedTo" className="mb-1 text-lg font-medium text-gray-700">
                Assigned to
              </label>
              <input
                type="text"
                id="assignedTo"
                name="assignedTo"
                value={formData.assignedTo}
                onChange={handleInputChange}
                placeholder="Enter name"
                className="border border-gray-400 rounded-md px-3 w-60 py-2 text-md shadow-[0px_2px_0px_rgba(0,0,0,0.2)]"
                required
              />
            </div>

            {/* Assign Date */}
            <div className="flex flex-col">
              <label htmlFor="assignDate" className="mb-1 text-lg font-medium text-gray-700">
                Assign Date
              </label>
              <input
                type="date"
                id="assignDate"
                name="assignDate"
                value={formData.assignDate}
                onChange={handleAssignDateChange}
                className="border border-gray-400 w-60 rounded-md px-3 py-2 text-md shadow-[0px_2px_0px_rgba(0,0,0,0.2)]"
                required
              />
            </div>

            {/* Deadline */}
            <div className="flex flex-col">
              <label htmlFor="deadline" className="mb-1 text-lg font-medium text-gray-700">
                Deadline
              </label>
              <input
                type="date"
                id="deadline"
                name="deadline"
                value={formData.deadline}
                onChange={handleInputChange}
                min={formData.assignDate}
                className="border border-gray-400 w-60 rounded-md px-3 py-2 text-md shadow-[0px_2px_0px_rgba(0,0,0,0.2)]"
                required
              />
            </div>
          </div>

          <hr />

          <div className="grid grid-cols-3 mx-auto mt-10 mb-10 gap-0">
            {/* Priority */}
            <div className="flex flex-col">
              <label htmlFor="priority" className="text-lg font-medium text-gray-700">
                Priority
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="border border-gray-400 rounded-md px-3 w-60 py-2 text-md shadow-[0px_2px_0px_rgba(0,0,0,0.2)]"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            {/* Due Time */}
            <div className="flex flex-col">
              <label htmlFor="dueTime" className="text-lg font-medium text-gray-700">
                Due Time
              </label>
              <input
                type="time"
                id="dueTime"
                name="dueTime"
                value={formData.dueTime}
                onChange={handleInputChange}
                className="border border-gray-400 rounded-md px-3 w-60 py-2 text-md shadow-[0px_2px_0px_rgba(0,0,0,0.2)]"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 mx-auto mt-10 mb-10">
            {/* Assigned By */}
            <div className="flex flex-col">
              <label htmlFor="assignedBy" className="mb-1 text-lg font-medium text-gray-700">
                Assigned by
              </label>
              <input
                type="text"
                id="assignedBy"
                name="assignedBy"
                value={formData.assignedBy}
                onChange={handleInputChange}
                placeholder="Name"
                className="border border-gray-400 rounded-md px-3 w-60 py-2 text-md shadow-[0px_2px_0px_rgba(0,0,0,0.2)]"
                required
              />
            </div>

            {/* Status */}
            <div className="flex flex-col">
              <label htmlFor="status" className="mb-1 text-lg font-medium text-gray-700">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="border border-gray-400 rounded-md px-3 py-2 w-60 text-md shadow-[0px_2px_0px_rgba(0,0,0,0.2)]"
              >
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Deferred">Deferred</option>
              </select>
            </div>

            {/* Tag Member */}
            <div className="flex flex-col">
              <label htmlFor="tagMember" className="mb-1 text-lg font-medium text-gray-700">
                Tag Member
              </label>
              <input
                type="text"
                id="tagMember"
                name="tagMember"
                value={formData.tagMember}
                onChange={handleInputChange}
                placeholder="Tag Member"
                className="border border-gray-400 rounded-md px-3 w-60 py-2 text-md shadow-[0px_2px_0px_rgba(0,0,0,0.2)]"
              />
            </div>
          </div>

          <hr />

          <div className="max-w-6xl mt-10 p-4">
            {/* Attachment & Recurring Fields in a Row */}
            <div className="flex flex-wrap gap-8 mb-6">
              {/* Attachment Required */}
              <div>
                <label className="block mb-1 text-lg font-medium">
                  Attachment is required for closing task?
                </label>
                <select
                  name="attachmentRequired"
                  value={formData.attachmentRequired}
                  onChange={handleInputChange}
                  className="border border-gray-400 rounded px-3 py-2 shadow-[0px_2px_0px_rgba(0,0,0,0.2)] w-52"
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>

              {/* Recurring */}
              <div>
                <label className="block mb-1 text-lg font-medium">Recurring</label>
                <select
                  name="recurring"
                  value={formData.recurring}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      recurring: e.target.value === "true"
                    }))
                  }
                  className="border border-gray-400 rounded px-3 py-2 shadow-[0px_2px_0px_rgba(0,0,0,0.2)] w-52"
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
            </div>

            {/* Task Description */}
            <div className="mb-6">
              <label className="block mb-1 font-medium">Task Description</label>
              <input
                type="text"
                name="taskDescription"
                value={formData.taskDescription}
                onChange={handleInputChange}
                className="border border-gray-400 rounded px-3 py-2 shadow-[0px_2px_0px_rgba(0,0,0,0.2)] w-full"
                required
              />
            </div>

            {/* Remark */}
            <div className="mb-6">
              <label className="block mb-1 font-medium">Remark</label>
              <input
                type="text"
                name="remark"
                value={formData.remark}
                onChange={handleInputChange}
                className="border border-gray-400 rounded px-3 py-2 shadow-[0px_2px_0px_rgba(0,0,0,0.2)] w-full"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-center">
              <button
                type="submit"
                className="bg-[#018ABE] hover:bg-[#0173a1] text-white font-medium text-lg px-6 py-2 rounded shadow-[0px_2px_0px_rgba(0,0,0,0.2)]"
              >
                Assign Task
              </button>
            </div>
          </div>

        </div>
      </form>
    </div>
  );
}