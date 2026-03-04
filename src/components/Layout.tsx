import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

const Layout = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className={isHomePage ? "pt-20" : ""}>{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
