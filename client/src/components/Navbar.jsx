import React from "react";
import { assets } from "../assets/assets";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useClerk, UserButton, useUser } from '@clerk/clerk-react';

const Navbar = () => {
  const navigate = useNavigate()
  const { user } = useUser()
  const { openSignIn } = useClerk()

  return (
    <div className="fixed top-0 left-0 w-full z-50 backdrop-blur-2xl flex justify-between items-center py-3 px-4 sm:px-20 xl:px-32 ">
      <img
        src={assets.logo}
        alt="logo"
        className="w-32 sm:w-44 cursor-pointer"
        onClick={() => navigate("/")}
      />
      {
        user ? (
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/ai")}
              className="text-sm font-medium text-primary hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-full transition cursor-pointer"
            >
              Dashboard
            </button>
            <UserButton />
          </div>
        ) : (
          <button onClick={openSignIn} className="flex items-center gap-2 rounded-full text-sm cursor-pointer bg-primary text-white px-8 py-2.5 hover:opacity-90 transition">
            Get started <ArrowRight className="w-4 h-4" />
          </button>
        )
      }

    </div>
  );
};

export default Navbar;
