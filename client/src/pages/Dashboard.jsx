import React, { useEffect, useState } from "react";
import { Gem, Sparkles, PlusCircle } from "lucide-react";
import { Protect, useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import CreationItem from "../components/CreationItem";
import axios from "axios";
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const Dashboard = () => {
  const [creations, setCreations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { getToken } = useAuth();

  const getDashboardData = async () => {
    try {
      const { data } = await axios.get("/api/user/get-user-creations", {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });
      if (data.success) {
        setCreations(data.creations || []);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    getDashboardData();
  }, []);

  return (
    <div className="h-full overflow-y-scroll p-6">
      <div className="flex justify-start gap-4 flex-wrap">
        {/* Total Creations Card */}
        <div className="flex justify-between items-center w-72 p-4 px-6 bg-white rounded-xl border border-gray-200">
          <div className="text-slate-600">
            <p className="text-sm">Total Creations</p>
            <h2 className="text-xl font-semibold">{creations.length}</h2>
          </div>

          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#3588F2] to-[#0BB0D7] text-white flex justify-center items-center">
            <Sparkles className="w-5 text-white" />
          </div>
        </div>

        {/* Active Plan Card */}
        <div className="flex justify-between items-center w-72 p-4 px-6 bg-white rounded-xl border border-gray-200">
          <div className="text-slate-600">
            <p className="text-sm">Active Plan</p>
            <h2 className="text-xl font-semibold">
              <Protect plan="premium" fallback="Free">
                Premium
              </Protect>
            </h2>
          </div>

          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#FF61C5] to-[#9E53EE] text-white flex justify-center items-center">
            <Gem className="w-5 text-white" />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-3/4">
          <div className="animate-spin rounded-full h-11 w-11 border-3 border-purple-500 border-t-transparent"></div>
        </div>
      ) : creations.length === 0 ? (
        <div className="mt-12 flex flex-col items-center justify-center p-8 bg-white border border-gray-200 rounded-2xl max-w-xl text-center">
          <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-primary mb-4">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">No creations yet</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-sm">
            Start generating articles, images, or analyzing resumes using our powerful AI tools.
          </p>
          <button
            onClick={() => navigate("/ai/write-article")}
            className="mt-5 flex items-center gap-2 bg-primary text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:opacity-90 transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" /> Create Your First Content
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="mt-6 mb-4 font-medium text-slate-700">Recent Creations</p>
          {creations.map((item) => (
            <CreationItem key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
