
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import { useAuth } from "@/hooks/auth";

const AppLayout = () => {
  const { user } = useAuth();
  const isAuthenticated = !!user;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50 pt-16">
        <Outlet />
      </main>
    </>
  );
};

export default AppLayout;
