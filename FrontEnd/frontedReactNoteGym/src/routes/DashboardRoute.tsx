import HeaderGym from "../components/headerGym";
import DashboardGym from "../components/dashboardGym";
import Sidebar from "@/components/Sidebar";

export default function DashboardRoute() {
  return (
    <div className="min-h-screen flex flex-col">
      <HeaderGym />
      <Sidebar />
      <main className="flex-grow flex items-center justify-center p-4">
        <DashboardGym />
      </main>
    </div>
  );
}