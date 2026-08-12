import { Hash, Sparkles, Copy, Check } from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";
import Markdown from "react-markdown";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const BlogTitles = () => {
  const blogCategories = [
    "General",
    "Technology",
    "Business",
    "Health",
    "Lifestyle",
    "Education",
    "Travel",
    "Food",
  ];

  const [selectedCategory, setSelectedCategory] = useState("General");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");
  const [copied, setCopied] = useState(false);

  const { getToken } = useAuth();

  const handleCopy = () => {
    if (!content) return;
    navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success("Titles copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const prompt = `Category: ${selectedCategory}, Topic: ${input}`;

      const { data } = await axios.post(
        "/api/ai/generate-blog-title",
        { prompt },
        {
          headers: { Authorization: `Bearer ${await getToken()}` },
        },
      );
      if (data.success) {
        setContent(data.content);
        toast.success("Titles generated successfully!");
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
      <form
        onSubmit={onSubmitHandler}
        className="w-full lg:max-w-md p-6 bg-white rounded-xl border border-gray-200 shrink-0"
      >
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-[#8E37EB]" />
          <h1 className="text-xl font-semibold">AI Title Generator</h1>
        </div>
        <p className="mt-6 text-sm font-medium">Keyword / Topic</p>

        <input
          onChange={(e) => setInput(e.target.value)}
          value={input}
          type="text"
          className="w-full p-2.5 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300 focus:border-purple-500 transition"
          placeholder="e.g. Remote work productivity hacks..."
          required
        />

        <p className="mt-4 text-sm font-medium">Category</p>

        <div className="mt-3 flex gap-2 flex-wrap">
          {blogCategories.map((item) => (
            <span
              onClick={() => setSelectedCategory(item)}
              className={`text-xs px-3 py-1.5 border rounded-full cursor-pointer transition ${
                selectedCategory === item
                  ? "bg-purple-50 text-purple-700 border-purple-300 font-medium"
                  : "text-gray-600 border-gray-200 hover:border-gray-300"
              }`}
              key={item}
            >
              {item}
            </span>
          ))}
        </div>

        <button
          disabled={loading}
          className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#C341F6] to-[#8E37EB] text-white px-4 py-2.5 mt-6 text-sm font-medium rounded-lg cursor-pointer hover:opacity-95 transition disabled:opacity-50"
        >
          {loading ? (
            <span className="w-4 h-4 my-1 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
          ) : (
            <Hash className="w-5 h-5" />
          )}
          Generate Titles
        </button>
      </form>

      {/* right side */}
      <div className="w-full flex-1 p-6 bg-white rounded-xl flex flex-col border border-gray-200 min-h-96">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <Hash className="w-5 h-5 text-[#8E37EB]" />
            <h1 className="text-xl font-semibold">Generated Titles</h1>
          </div>
          {content && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition cursor-pointer font-medium"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied!" : "Copy"}
            </button>
          )}
        </div>

        {!content ? (
          <div className="flex-1 flex justify-center items-center">
            <div className="text-sm flex flex-col items-center gap-3 text-gray-400">
              <Hash className="w-8 h-8 text-gray-300" />
              <p>Enter a topic, select a category, and click &quot;Generate Titles&quot;</p>
            </div>
          </div>
        ) : (
          <div className="mt-2 h-full overflow-y-scroll text-sm text-slate-700 leading-relaxed">
            <div className="reset-tw">
              <Markdown>{content}</Markdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogTitles;
