import { Eraser, Sparkles, Download, Upload } from "lucide-react";
import React, { useState } from "react";
import axios from 'axios';
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const RemoveBackground = () => {
  const [input, setInput] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');

  const { getToken } = useAuth();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setInput(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(content);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `quickai-nobg-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Image downloaded!");
    } catch {
      window.open(content, "_blank");
    }
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (!input) {
      return toast.error("Please select an image first.");
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append('image', input);

      const { data } = await axios.post('/api/ai/remove-image-background', formData, {
        headers: { Authorization: `Bearer ${await getToken()}` }
      });

      if (data.success) {
        setContent(data.content);
        toast.success("Background removed successfully!");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }

    setLoading(false);
  };

  return (
    <div className="h-full overflow-y-scroll p-6 flex flex-col lg:flex-row items-start gap-6 text-slate-700">
      {/* left side*/}
      <form onSubmit={onSubmitHandler} className="w-full lg:max-w-md p-6 bg-white rounded-xl border border-gray-200 shrink-0">
        <div className="flex items-center gap-3">
          <Sparkles className='w-6 h-6 text-[#FF4938]' />
          <h1 className="text-xl font-semibold">Background Removal</h1>
        </div>
        <p className="mt-6 text-sm font-medium">Upload Image</p>

        <input
          onChange={handleImageChange}
          type='file'
          accept='image/*'
          className="w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300 text-gray-600 focus:border-red-400 transition"
          required
        />

        <p className="text-xs text-gray-500 font-light mt-1">Supports JPG, PNG and other image formats.</p>

        {preview && (
          <div className="mt-4">
            <p className="text-xs font-medium text-gray-500 mb-1">Selected image preview:</p>
            <img src={preview} alt="Upload preview" className="w-full max-h-40 object-contain rounded-lg border border-gray-200" />
          </div>
        )}

        <button
          disabled={loading}
          className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#F6AB41] to-[#FF4938] text-white px-4 py-2.5 mt-6 text-sm font-medium rounded-lg cursor-pointer hover:opacity-95 transition disabled:opacity-50"
        >
          {loading ? (
            <span className="w-4 h-4 my-1 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
          ) : (
            <Eraser className="w-5 h-5" />
          )}
          Remove Background
        </button>
      </form>

      {/* right side */}
      <div className="w-full flex-1 p-6 bg-white rounded-xl flex flex-col border border-gray-200 min-h-96">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <Eraser className="w-5 h-5 text-[#FF4938]" />
            <h1 className="text-xl font-semibold">Processed Image</h1>
          </div>
          {content && (
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition cursor-pointer font-medium"
            >
              <Download className="w-3.5 h-3.5" /> Download
            </button>
          )}
        </div>

        {!content ? (
          <div className="flex-1 flex justify-center items-center">
            <div className="text-sm flex flex-col items-center gap-3 text-gray-400">
              <Eraser className="w-8 h-8 text-gray-300" />
              <p>Upload an image and click &quot;Remove Background&quot; to get started</p>
            </div>
          </div>
        ) : (
          <div className="mt-2 flex-1 flex items-center justify-center bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] bg-gray-50 rounded-xl p-2 overflow-hidden">
            <img src={content} alt="Processed output" className="max-h-[500px] w-auto object-contain rounded-lg shadow-sm" />
          </div>
        )}
      </div>
    </div>
  );
};

export default RemoveBackground;