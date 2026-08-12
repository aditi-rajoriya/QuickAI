import { FileText, Sparkles } from "lucide-react";
import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";
import Markdown from "react-markdown";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const ReviewResume = () => {
  const [input, setInput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");

  const { getToken } = useAuth();

  const getSection = (title) => {
    if (!content) return "";

    const regex = new RegExp(
      `#{1,6}\\s*${title}\\s*([\\s\\S]*?)(?=\\n#{1,6}\\s|$)`,
      "i"
    );

    return content.match(regex)?.[1]?.trim() || "";
  };

  const overallScore = getSection("Overall Score");
  const ats = getSection("ATS Compatibility");
  const strengths = getSection("Strengths");
  const weaknesses = getSection("Weaknesses");
  const technical = getSection("Technical Skills Assessment");
  const projects = getSection("Projects Review");
  const formatting = getSection("Resume Formatting");
  const missing = getSection("Missing Skills");
  const suggestions = getSection("Suggestions");
  const verdict = getSection("Final Verdict");

  const score =
    overallScore.match(/\d{1,3}(?=\s*\/\s*100)/)?.[0] ||
    overallScore.match(/\d+/)?.[0] ||
    "N/A";

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (!input) {
      toast.error("Please upload a resume.");
      return;
    }

    try {
      setLoading(true);
      setContent("");

      const formData = new FormData();
      formData.append("resume", input);

      const { data } = await axios.post("/api/ai/resume-review", formData, {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
        },
      });

      if (data.success) {
        setContent(data.content);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6 flex flex-col lg:flex-row gap-6 text-slate-700">
      {/* Left */}
      <form
        onSubmit={onSubmitHandler}
        className="w-full lg:w-[380px] bg-white rounded-xl border border-gray-200 p-6 shrink-0"
      >
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-[#00DA84]" />
          <h1 className="text-xl font-semibold">Resume Review</h1>
        </div>

        <p className="mt-8 font-medium text-sm">
          Upload Resume
        </p>

        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setInput(e.target.files[0])}
          required
          className="w-full mt-2 border rounded-lg p-3 text-sm"
        />

        <p className="text-xs text-gray-500 mt-2">
          Only PDF resumes are supported.
        </p>

        <button
          disabled={loading}
          className="w-full mt-8 bg-gradient-to-r from-[#00DA83] to-[#009BB3] text-white rounded-lg py-3 flex justify-center items-center gap-2"
        >
          {loading ? (
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          ) : (
            <>
              <FileText className="w-5 h-5" />
              Review Resume
            </>
          )}
        </button>
      </form>

      {/* Right */}

      <div className="flex-1 bg-white rounded-xl border border-gray-200 p-6 overflow-y-auto">

        <div className="flex items-center gap-3 mb-6">
          <FileText className="w-6 h-6 text-[#00DA84]" />
          <h1 className="text-xl font-semibold">
            Analysis Results
          </h1>
        </div>

        {!content ? (
          <div className="flex justify-center items-center h-96 text-gray-400">
            <div className="text-center">
              <FileText className="w-10 h-10 mx-auto mb-4" />
              Upload a resume to receive an AI-powered ATS review.
            </div>
          </div>
        ) : (
          <div className="space-y-6">

            <div className="rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white p-6">

              <h2 className="text-xl font-semibold">
                ⭐ Overall Score
              </h2>

              <div className="text-6xl font-bold mt-3">
                {score}
              </div>

              <div className="mt-4">
                <Markdown>
                  {overallScore.replace(score, "").trim()}
                </Markdown>
              </div>

            </div>

            <Section title="📊 ATS Compatibility" content={ats} color="yellow" />
            <Section title="💪 Strengths" content={strengths} color="green" />
            <Section title="⚠️ Weaknesses" content={weaknesses} color="red" />
            <Section title="💻 Technical Skills Assessment" content={technical} color="blue" />
            <Section title="🚀 Projects Review" content={projects} color="purple" />
            <Section title="🎨 Resume Formatting" content={formatting} color="orange" />
            <Section title="🛠 Missing Skills" content={missing} color="pink" />
            <Section title="💡 Suggestions" content={suggestions} color="indigo" />
            <Section title="🎯 Final Verdict" content={verdict} color="emerald" />

          </div>
        )}

      </div>

    </div>
  );
};

const colors = {
  green: "border-green-500",
  red: "border-red-500",
  yellow: "border-yellow-500",
  blue: "border-blue-500",
  purple: "border-purple-500",
  orange: "border-orange-500",
  pink: "border-pink-500",
  indigo: "border-indigo-500",
  emerald: "border-emerald-500",
};

function Section({ title, content, color }) {
  if (!content) return null;

  return (
    <div
      className={`border-l-4 rounded-xl shadow-sm hover:shadow-md transition bg-white p-5 ${colors[color]}`}
    >
      <h2 className="text-xl font-bold mb-4">
        {title}
      </h2>

      <div className="prose prose-sm max-w-none">
        <Markdown
          components={{
            p: ({ children }) => (
              <p className="leading-7 mb-3 text-gray-700">{children}</p>
            ),
            ul: ({ children }) => (
              <ul className="list-disc pl-6 space-y-2">{children}</ul>
            ),
            li: ({ children }) => (
              <li className="leading-7">{children}</li>
            ),
            strong: ({ children }) => (
              <strong className="font-semibold text-black">
                {children}
              </strong>
            ),
          }}
        >
          {content}
        </Markdown>
      </div>
    </div>
  );
}

export default ReviewResume;