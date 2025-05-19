
import Navbar from "@/components/layout/navbar";
import Sidebar from "@/components/layout/sidebar";
import ProjectOverview from "@/components/projectoverview/project";



export default function Home() {
  return (
    <div className="flex">
      {/* Sidebar - Fixed */}
      <div className="w-1/6 h-screen fixed top-0 left-0 bg-gray-100 border-r">
        <Sidebar />
      </div>

      {/* Main Content Area (Right Section) */}
      <div className="ml-[16.6667%] w-5/6">
        {/* Navbar - Fixed */}
        <div className="fixed top-0 right-0 w-5/6 z-10">
          <Navbar />
        </div>

        {/* Project Overview Content - Add padding to avoid overlapping navbar */}
        <div className="pt-20 px-6">
          <ProjectOverview />
        </div>
      </div>
    </div>
  );
}
