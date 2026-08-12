import React, { useState } from "react";
import { Edit, Sparkles, Copy, Check } from 'lucide-react';
import axios from 'axios';
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";
import Markdown from 'react-markdown';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const WriteArticle = () => {
  const articleLength = [
    { length: 1500, text: 'Short (500-800 words)' },
    { length: 2500, text: 'Medium (800-1200 words)' },
    { length: 3000, text: 'Long (1200+ words)' }
  ];

  const [selectedLength, setSelectedLength] = useState(articleLength[0]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');
  const [copied, setCopied] = useState(false);

  const { getToken } = useAuth();

  const handleCopy = () => {
    if (!content) return;
    navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success("Article copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const prompt = input;
      
      const { data } = await axios.post('/api/ai/generate-article', {
        prompt,
        length: selectedLength.length
      }, {
        headers: { Authorization: `Bearer ${await getToken()}` }
      });
      if (data.success) {
        setContent(data.content);
        toast.success("Article generated successfully!");
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
          <Sparkles className='w-6 h-6 text-[#4A7AFF]' />
          <h1 className="text-xl font-semibold">Article Configuration</h1>
        </div>
        <p className="mt-6 text-sm font-medium">Article Topic</p>

        <input
          onChange={(e) => setInput(e.target.value)}
          value={input}
          type='text'
          className="w-full p-2.5 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300 focus:border-blue-500 transition"
          placeholder="e.g. The future of artificial intelligence in healthcare..."
          required
        />

        <p className="mt-4 text-sm font-medium">Article Length</p>

        <div className="mt-3 flex gap-2 flex-wrap">
          {articleLength.map((item, index) => (
            <span
              onClick={() => setSelectedLength(item)}
              className={`text-xs px-3 py-1.5 border rounded-full cursor-pointer transition ${
                selectedLength.text === item.text
                  ? 'bg-blue-50 text-blue-700 border-blue-300 font-medium'
                  : 'text-gray-600 border-gray-200 hover:border-gray-300'
              }`}
              key={index}
            >
              {item.text}
            </span>
          ))}
        </div>

        <button
          disabled={loading}
          className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#226BFF] to-[#65ADFF] text-white px-4 py-2.5 mt-6 text-sm font-medium rounded-lg cursor-pointer hover:opacity-95 transition disabled:opacity-50"
        >
          {loading ? (
            <span className="w-4 h-4 my-1 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
          ) : (
            <Edit className="w-5 h-5" />
          )}
          Generate Article
        </button>
      </form>

      {/* right side */}
      <div className="w-full flex-1 p-6 bg-white rounded-xl flex flex-col border border-gray-200 min-h-96">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <Edit className="w-5 h-5 text-[#4A7AFF]" />
            <h1 className="text-xl font-semibold">Generated Article</h1>
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
              <Edit className="w-8 h-8 text-gray-300" />
              <p>Enter a topic and click &quot;Generate Article&quot; to get started</p>
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

export default WriteArticle;