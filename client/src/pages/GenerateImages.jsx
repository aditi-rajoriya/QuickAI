import React, { useState } from "react";
import { Image, Sparkles, Download } from "lucide-react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const GenerateImages = () => {
  const ImageStyle = [
    "Realistic",
    "Ghibli style",
    "Anime style",
    "Cartoon style",
    "Fantasy style",
    "3D style",
    "Portrait style",
  ];

  const [selectedStyle, setSelectedStyle] = useState("Realistic");
  const [input, setInput] = useState("");
  const [publish, setPublish] = useState(false);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");

  const { getToken } = useAuth();

  const handleDownload = async () => {
    try {
      const response = await fetch(content);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `quickai-image-${Date.now()}.png`;
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

    try {
      setLoading(true);

      const prompt = `Create a highly detailed ${selectedStyle} image of:${input}
Requirements:
- Ultra high quality
- Sharp focus
- Professional lighting
- Vibrant colors
- Realistic textures
- Highly detailed
- Beautiful composition
- 8K quality
- No watermark
- No text
`;
      const { data } = await axios.post(
        "/api/ai/generate-image",
        { prompt, publish },
        {
          headers: { Authorization: `Bearer ${await getToken()}` },
        },
      );

      if (data.success) {
        setContent(data.content);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to generate image."
      );
    }

    setLoading(false);
  };

  return (
    <div className="h-full overflow-y-scroll p-6 flex flex-col lg:flex-row items-start gap-6 text-slate-700">
      {/* left side*/}
      <form
        onSubmit={onSubmitHandler}
        className="w-full lg:max-w-md p-6 bg-white rounded-xl border border-gray-200 shrink-0"
      >
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-[#00AD25]" />
          <h1 className="text-xl font-semibold">AI Image Generator</h1>
        </div>
        <p className="mt-6 text-sm font-medium">Describe your Image</p>

        <textarea
          onChange={(e) => setInput(e.target.value)}
          value={input}
          rows={4}
          className="w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300 focus:border-green-500 transition"
          placeholder="Describe what you want to see in the image..."
          required
        />

        <p className="mt-4 text-sm font-medium">Style</p>

        <div className="mt-3 flex gap-2 flex-wrap">
          {ImageStyle.map((item) => (
            <span
              onClick={() => setSelectedStyle(item)}
              className={`text-xs px-3 py-1.5 border rounded-full cursor-pointer transition ${
                selectedStyle === item
                  ? "bg-green-50 text-green-700 border-green-300 font-medium"
                  : "text-gray-600 border-gray-200 hover:border-gray-300"
              }`}
              key={item}
            >
              {item}
            </span>
          ))}
        </div>
        <div className="my-6 flex items-center gap-2">
          <label className="relative cursor-pointer">
            <input
              type="checkbox"
              onChange={(e) => setPublish(e.target.checked)}
              checked={publish}
              className="sr-only peer"
            />

            <div className="w-9 h-5 bg-slate-300 rounded-full peer-checked:bg-green-500 transition"></div>

            <span className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition peer-checked:translate-x-4"></span>
          </label>
          <p className="text-sm">Make this image public</p>
        </div>

        <button
          disabled={loading}
          className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#00AD25] to-[#07c841] text-white px-4 py-2.5 mt-2 text-sm font-medium rounded-lg cursor-pointer hover:opacity-95 transition disabled:opacity-50"
        >
          {loading ? (
            <span className="w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin"></span>
          ) : (
            <Image className="w-5 h-5" />
          )}
          Generate Image
        </button>
      </form>

      {/* right side */}
      <div className="w-full flex-1 p-6 bg-white rounded-xl flex flex-col border border-gray-200 min-h-96">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <Image className="w-5 h-5 text-[#00AD25]" />
            <h1 className="text-xl font-semibold">Generated Image</h1>
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
              <Image className="w-8 h-8 text-gray-300" />
              <p>Describe an image and click &quot;Generate Image&quot; to get started</p>
            </div>
          </div>
        ) : (
          <div className="mt-2 flex-1 flex items-center justify-center bg-gray-50 rounded-xl p-2 overflow-hidden">
            <img
              src={content}
              alt="AI Output"
              className="max-h-[500px] w-auto object-contain rounded-lg shadow-sm"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default GenerateImages;
