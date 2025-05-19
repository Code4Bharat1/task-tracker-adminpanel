"use client";
import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  LabelList,
  Cell
} from "recharts";
import {
  FiCalendar,
  FiClock,
  FiUser,
  FiCheckCircle,
  FiActivity,
} from "react-icons/fi";
import { useGSAP } from "@gsap/react";

// Sample data
const sampleDirectors = [
  { id: 1, name: "John Smith" },
  { id: 2, name: "Sarah Johnson" },
  { id: 3, name: "Robert Chen" },
];

const sampleEmployees = [
  { id: 1, name: "Alex Miller", directorId: 1 },
  { id: 2, name: "Emily Davis", directorId: 1 },
  { id: 3, name: "Michael Wilson", directorId: 2 },
  { id: 4, name: "Sofia Garcia", directorId: 2 },
  { id: 5, name: "David Kim", directorId: 3 },
];

const sampleProjects = [
  {
    id: 1,
    name: "Website Redesign",
    employeeId: 1,
    startDate: "2025-04-01",
    endDate: "2025-05-15",
    status: "completed",
    completion: 100,
  },
  {
    id: 2,
    name: "Mobile App Development",
    employeeId: 1,
    startDate: "2025-05-10",
    endDate: "2025-06-30",
    status: "in-progress",
    completion: 45,
  },
  // ... rest of your sample projects
];

const generateEnhancedChartData = (projects) => {
  if (!projects || !projects.length) return [];

  const statusGroups = projects.reduce((acc, project) => {
    const status = project.status;
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(project);
    return acc;
  }, {});

  const result = Object.entries(statusGroups).map(([status, projects]) => {
    const avgCompletion =
      projects.reduce((sum, p) => sum + p.completion, 0) / projects.length;

    const totalDays = projects.reduce((sum, p) => {
      const start = new Date(p.startDate);
      const end = new Date(p.endDate);
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      return sum + days;
    }, 0);

    return {
      name:
        status === "completed"
          ? "Completed"
          : status === "in-progress"
          ? "In Progress"
          : "Planned",
      count: projects.length,
      avgCompletion: Math.round(avgCompletion),
      totalDays,
      fill:
        status === "completed"
          ? "#22c55e"
          : status === "in-progress"
          ? "#0ea5e9"
          : "#f59e0b",
    };
  });

  return result;
};

export default function ProjectOverview() {
  const [selectedDirector, setSelectedDirector] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [projectName, setProjectName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [viewMode, setViewMode] = useState("current");
  const [availableEmployees, setAvailableEmployees] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [chartMetric, setChartMetric] = useState("count");
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const underlineRef = useRef(null);

  useGSAP(() => {
    gsap.fromTo(
      underlineRef.current,
      { width: "0%" },
      { width: "100%", duration: 1, ease: "power2.out" }
    );
  }, []);

  // Fetch profile data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const res = await axios.get("/api/protected", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setProfileData(res.data);
        }
      } catch (err) {
        setError(err.message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter employees based on selected director
  useEffect(() => {
    if (selectedDirector) {
      const directorId = parseInt(selectedDirector);
      const employees = sampleEmployees.filter(
        (emp) => emp.directorId === directorId
      );
      setAvailableEmployees(employees);
    } else {
      setAvailableEmployees([]);
    }
    setSelectedEmployee("");
  }, [selectedDirector]);

  // Filter projects based on selected employee and view mode
  useEffect(() => {
    if (!selectedEmployee) {
      setFilteredProjects([]);
      setChartData([]);
      return;
    }

    const employeeId = parseInt(selectedEmployee);
    const employeeProjects = sampleProjects.filter(
      (proj) => proj.employeeId === employeeId
    );

    const today = new Date();
    let projectsToShow = [];

    if (viewMode === "history") {
      projectsToShow = employeeProjects.filter(
        (proj) =>
          proj.status === "completed" || new Date(proj.endDate) < today
      );
    } else if (viewMode === "current") {
      projectsToShow = employeeProjects.filter(
        (proj) =>
          proj.status === "in-progress" ||
          (new Date(proj.startDate) <= today && new Date(proj.endDate) >= today)
      );
    } else if (viewMode === "upcoming") {
      projectsToShow = employeeProjects.filter(
        (proj) =>
          proj.status === "planned" || new Date(proj.startDate) > today
      );
    }

    setFilteredProjects(projectsToShow);
    setChartData(generateEnhancedChartData(projectsToShow));
  }, [selectedEmployee, viewMode]);

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(
      `Project assigned: ${projectName} to Employee ID: ${selectedEmployee} from ${startDate} to ${endDate}`
    );
  };

  const getChartMetricLabel = () => {
    switch (chartMetric) {
      case "count":
        return "Number of Projects";
      case "avgCompletion":
        return "Average Completion (%)";
      case "totalDays":
        return "Total Project Days";
      default:
        return "";
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 shadow-lg rounded-lg">
          <p className="font-bold">{data.name}</p>
          <p className="text-sm">
            Projects: <span className="font-semibold">{data.count}</span>
          </p>
          <p className="text-sm">
            Avg. Completion:{" "}
            <span className="font-semibold">{data.avgCompletion}%</span>
          </p>
          <p className="text-sm">
            Total Days: <span className="font-semibold">{data.totalDays}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  if (error) {
    console.log(error);
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
       <h1 className="text-2xl font-bold mb-4 relative inline-block text-gray-800">
        <span
          ref={underlineRef}
          className="absolute left-0 top-9 h-[3px] bg-[#018ABE] w-full "
        ></span>
        Project Overview
      </h1>

      {/* Project Assignment Form */}
      <div className="bg-white rounded-xl  border border-gray-200 shadow-lg p-6 mb-6 ">
        <h2 className="text-xl font-semibold mb-4">Assign New Project</h2>
        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-lg font-medium text-gray-700">
              Director  
            </label>
            <select
              className="mt-1 block w-100 text-sm rounded-lg border border-gray-300 shadow-sm py-2 text-left p-3  "
              value={selectedDirector}
              onChange={(e) => setSelectedDirector(e.target.value)}
              required
            >
              <option value="">Select Director</option>
              {sampleDirectors.map((director) => (
                <option key={director.id} value={director.id}>
                  {director.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-lg font-medium text-gray-700">
              Employee
            </label>
            <select
              className="mt-1 block w-100 text-sm rounded-lg border border-gray-300 shadow-sm focus:border-gray-400 focus:ring-gray-400 py-2 text-left p-3"
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              disabled={!selectedDirector}
              required
            >
              <option value="">Select Employee</option>
              {availableEmployees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-lg font-medium text-gray-700">
              Project Name
            </label>
            <input
              type="text"
              className="mt-1 block w-100 text-sm rounded-md border border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 py-2 text-left p-3"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-lg font-medium text-gray-700">
                Start Date
              </label>
              <input
                type="date"
                className="mt-1 block w-50 rounded-md border border-gray-300 shadow-sm focus:border-gray-400 focus:ring-gray-400 py-2 text-left p-3 "
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-700">
                End Date
              </label>
              <input
                type="date"
                className="mt-1 block w-45 rounded-md border border-gray-300 shadow-sm focus:border-gray-400 focus:ring-gray-400 py-2 text-left p-3"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full md:w-auto px-4 py-2 bg-[#018ABE] text-white rounded-md hover:bg-[#018ABE] focus:outline-none focus:ring-2 focus:ring-[#018ABE]"
            >
              Assign Project
            </button>
          </div>
        </form>
      </div>

      {/* Project View Selection */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-6 mb-6">
        <div className="flex flex-wrap gap-4 mb-4">
          <button
            onClick={() => setViewMode("history")}
            className={`flex items-center px-4 py-2 rounded-md shadow-lg ${
              viewMode === "history"
                ? "bg-[#018ABE] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <FiCheckCircle className="mr-2" /> Project History
          </button>

          <button
            onClick={() => setViewMode("current")}
            className={`flex items-center px-4 py-2 rounded-md shadow-lg ${
              viewMode === "current"
                ? "bg-[#018ABE] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <FiActivity className="mr-2" /> Current Projects
          </button>

          <button
            onClick={() => setViewMode("upcoming")}
            className={`flex items-center px-4 py-2 rounded-md  shadow-lg ${
              viewMode === "upcoming"
                ? "bg-[#018ABE] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <FiCalendar className="mr-2" /> Upcoming Projects
          </button>
        </div>

        {/* Employee selection for viewing projects */}
        <div className="mb-6 mt-1">
          <div className="max-w-xs">
            <label className="block text-sm font-medium text-gray-700">
              Select Employee to View Projects
            </label>
            <div className="mt-1 flex">
              <select
                className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 py-1"
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
              >
                <option value="">Select Employee</option>
                {sampleEmployees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Project List */}
        <div>
          <h3 className="text-lg font-medium capitalize mb-4">
            {viewMode === "history"
              ? "Project History"
              : viewMode === "current"
              ? "Current Projects"
              : "Upcoming Projects"}
          </h3>

          {filteredProjects.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-[#018ABE]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#FFFFFF] uppercase tracking-wider">
                      Project
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#FFFFFF] uppercase tracking-wider">
                      Timeline
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#FFFFFF] uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#FFFFFF] uppercase tracking-wider">
                      Progress
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProjects.map((project) => (
                    <tr key={project.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {project.name}
                        </div>
                      </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap 
                 
                      "
                      >
                        <div className="text-sm text-gray-500">
                          <FiCalendar
                            className="inline mr-1
                          "
                          />
                          {new Date(project.startDate).toLocaleDateString()} -{" "}
                          {new Date(project.endDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${
                            project.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : project.status === "in-progress"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {project.status === "completed"
                            ? "Completed"
                            : project.status === "in-progress"
                            ? "In Progress"
                            : "Planned"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className={`h-2.5 rounded-full ${
                              project.status === "completed"
                                ? "bg-green-600"
                                : project.status === "in-progress"
                                ? "bg-[#018ABE]"
                                : "bg-yellow-400"
                            }`}
                            style={{ width: `${project.completion}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500">
                          {project.completion}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 italic">
              No projects found. Please select an employee or change the view
              mode.
            </p>
          )}
        </div>
      </div>

      {/* Enhanced Project Analytics */}
      <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-sky-500">
        <h2 className="text-xl font-semibold mb-4 text-sky-700">
          Project Analytics
        </h2>

        {/* Metric selectors */}
        <div className="flex flex-wrap justify-between mb-6">
          <div className="flex flex-wrap gap-2 mb-2">
            <button
              onClick={() => setChartMetric("count")}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                chartMetric === "count"
                  ? "bg-sky-600 text-white"
                  : "bg-sky-100 text-sky-700 hover:bg-sky-200"
              }`}
            >
              Project Count
            </button>

            <button
              onClick={() => setChartMetric("totalDays")}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                chartMetric === "totalDays"
                  ? "bg-sky-600 text-white"
                  : "bg-sky-100 text-sky-700 hover:bg-sky-200"
              }`}
            >
              Total Days
            </button>
          </div>
        </div>

        {chartData.length > 0 ? (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 30, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.6} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                  axisLine={{ stroke: "#9ca3af" }}
                />
                <YAxis
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                  axisLine={{ stroke: "#9ca3af" }}
                  allowDecimals={
                    chartMetric !== "totalDays" && chartMetric !== "count"
                  }
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="top"
                  height={36}
                  formatter={(value) => (
                    <span className="text-sm font-medium">
                      {getChartMetricLabel()}
                    </span>
                  )}
                />
                <ReferenceLine y={0} stroke="#000" />
                <Bar
                  dataKey={chartMetric}
                  name={getChartMetricLabel()}
                  radius={[4, 4, 0, 0]}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                  <LabelList
                    dataKey={chartMetric}
                    position="top"
                    fill="#4b5563"
                    fontSize={12}
                    fontWeight="bold"
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="bg-sky-50 border border-sky-200 text-sky-700 px-4 py-8 rounded-lg text-center">
            <p className="text-lg mb-2">No data available</p>
            <p className="text-sm text-sky-600">
              Select an employee to view project analytics.
            </p>
          </div>
        )}

        {chartData.length > 0 && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            {chartData.map((status, index) => (
              <div
                key={index}
                className="p-4 rounded-lg border"
                style={{
                  borderColor: status.fill,
                  backgroundColor: `${status.fill}10`,
                }}
              >
                <h3 className="font-medium mb-2" style={{ color: status.fill }}>
                  {status.name}
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-500">Projects</p>
                    <p className="font-bold text-lg">{status.count}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}