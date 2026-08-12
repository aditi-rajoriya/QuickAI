import React, { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { Heart, Sparkles, Users } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const Community = () => {
  const [creations, setCreations] = useState([]);
  const { user } = useUser();
  const [loading, setLoading] = useState(true);

  const { getToken } = useAuth();

  const fetchCreations = async () => {
    try {
      const { data } = await axios.get("/api/user/get-published-creations", {
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

  const imageLikeToggle = async (id) => {
    try {
      const { data } = await axios.post(
        "/api/user/toggle-like-creation",
        { id },
        {
          headers: { Authorization: `Bearer ${await getToken()}` },
        },
      );

      if (data.success) {
        toast.success(data.message);
        await fetchCreations();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCreations();
    }
  }, [user]);

  return !loading ? (
    <div className="flex-1 h-full flex flex-col gap-4 p-6 overflow-hidden">
      <div className="flex items-center gap-2">
        <Users className="w-6 h-6 text-primary" />
        <h1 className="text-xl font-semibold text-gray-800">Community Creations</h1>
      </div>

      {creations.length === 0 ? (
        <div className="bg-white h-full w-full rounded-xl border border-gray-200 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 mb-4">
            <Sparkles className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">No public creations yet</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-sm">
            Be the first to publish an AI image to the community feed by toggling &quot;Make this image public&quot;!
          </p>
        </div>
      ) : (
        <div className="bg-white h-full w-full rounded-xl border border-gray-200 overflow-y-scroll p-3 flex flex-wrap content-start">
          {creations.map((creation, index) => {
            const likesArray = Array.isArray(creation.likes) ? creation.likes : [];
            const isLiked = user ? likesArray.includes(user.id) : false;

            return (
              <div
                key={creation.id || index}
                className="relative group p-2 w-full sm:w-1/2 lg:w-1/3"
              >
                <div className="relative overflow-hidden rounded-xl bg-gray-100 aspect-square">
                  <img
                    src={creation.content}
                    alt={creation.prompt || "AI creation"}
                    className="w-full h-full object-cover rounded-xl transition duration-300 group-hover:scale-105"
                  />

                  <div className="absolute inset-0 flex flex-col justify-between p-4 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 text-white rounded-xl">
                    <div></div>
                    <div className="flex items-end justify-between gap-2">
                      <p className="text-xs line-clamp-3 leading-relaxed">
                        {creation.prompt}
                      </p>
                      <div className="flex items-center gap-1.5 shrink-0 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full">
                        <span className="text-xs font-medium">{likesArray.length}</span>
                        <Heart
                          onClick={() => imageLikeToggle(creation.id)}
                          className={`w-4 h-4 hover:scale-125 transition cursor-pointer ${
                            isLiked ? "fill-red-500 text-red-500" : "text-white"
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  ) : (
    <div className="flex justify-center items-center h-full flex-1">
      <span className="w-10 h-10 my-1 rounded-full border-3 border-primary border-t-transparent animate-spin"></span>
    </div>
  );
};

export default Community;
