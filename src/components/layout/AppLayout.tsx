
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import BottomNav from "./navigation/BottomNav";
import { useAuth } from "@/hooks/auth";

const AppLayout = () => {
  const { user } = useAuth();
  const isAuthenticated = !!user;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50 pt-16 pb-16">
        <Outlet />
      </main>
      <BottomNav isAuthenticated={isAuthenticated} />
    </>
  );
};

export default AppLayout;
