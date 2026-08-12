import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { X, Menu } from "lucide-react";
import Sidebar from "../components/Sidebar";
import { useUser, SignIn } from '@clerk/clerk-react';


const Layout = () => {
  const navigate = useNavigate();
  const [sidebar, setSidebar] = useState(false);
  const { user } = useUser()

  return user ? (
    <div className="flex flex-col items-start justify-start h-screen w-full overflow-hidden">
      <nav className="w-full px-6 sm:px-8 h-14 min-h-[3.5rem] flex items-center justify-between border-b border-gray-200 bg-white z-30">
        <img className='cursor-pointer w-32 sm:w-40' src={assets.logo} alt="logo" onClick={() => navigate("/")} />
        {
          sidebar ? (
            <X onClick={() => setSidebar(false)}
              className="w-6 h-6 text-gray-600 sm:hidden cursor-pointer" />
          ) : (
            <Menu onClick={() => setSidebar(true)} className="w-6 h-6 text-gray-600 sm:hidden cursor-pointer" />
          )}
      </nav>
      <div className="flex-1 w-full flex h-[calc(100vh-3.5rem)] overflow-hidden relative">
        {sidebar && (
          <div
            onClick={() => setSidebar(false)}
            className="fixed inset-0 bg-black/30 z-30 sm:hidden top-14"
          />
        )}
        <Sidebar sidebar={sidebar} setSidebar={setSidebar} />
        <div className="flex-1 h-full overflow-hidden bg-gray-50/50">
          <Outlet />
        </div>
      </div>
    </div>
  ) :
    (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <SignIn />
      </div>
    )
};

export default Layout;
