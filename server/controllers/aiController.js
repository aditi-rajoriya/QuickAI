import OpenAI from "openai";
import sql from "../configs/db.js";
import { clerkClient } from "@clerk/express";
import axios from "axios";
import { v2 as cloudinary } from "cloudinary";
import FormData from "form-data";
import fs from "fs";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");

const AI = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

export const generateArticle = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { prompt, length } = req.body;
    const plan = req.plan;
    const free_usage = req.free_usage;
    if (plan != "premium" && free_usage >= 10) {
      return res.json({
        success: false,
        message: "Limit reached.Upgrade to continue.",
      });
    }
    const response = await AI.chat.completions.create({
      model: "gemini-2.5-flash",
      messages: [
        {
          role: "user",
          content: `
Write a detailed, professional article on the topic: "${prompt}".

Requirements:
- Write approximately ${length} words.
- Use Markdown formatting.
- Include a title.
- Include an engaging introduction.
- Divide the article into multiple sections using headings.
- Include examples wherever appropriate.
- End with a strong conclusion.
- Make the article informative and easy to read.
`,
        },
      ],
      temperature: 0.7,
      max_tokens: length,
    });
    const content = response.choices[0].message.content;

    await sql` INSERT INTO creations(user_id,prompt,content,type)
        VALUES (${userId},${prompt},${content},'article')`;

    if (plan != "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          free_usage: free_usage + 1,
        },
      });
    }

    res.json({ success: true, content });
  } catch (error) {
    console.error("Full Error:");
    console.dir(error, { depth: null });

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const generateBlogTitle = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { prompt } = req.body;
    const plan = req.plan;
    const free_usage = req.free_usage;

    if (plan != "premium" && free_usage >= 10) {
      return res.json({
        success: false,
        message: "Limit reached.Upgrade to continue.",
      });
    }

    const response = await AI.chat.completions.create({
      model: "gemini-2.5-flash",
      messages: [
        {
          role: "user",
          // content: prompt,
          content: `
Generate 10 catchy, SEO-friendly blog titles about "${prompt}".

Requirements:
- Return exactly 10 titles.
- Make them unique.
- Keep each title under 70 characters.
- Use numbers, power words, or questions where appropriate.
- Return only the titles in Markdown as a numbered list.
`,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    //console.log(JSON.stringify(response, null, 2));

    const content = response.choices[0].message.content;
    //console.log(content);

    await sql` INSERT INTO creations(user_id,prompt,content,type)
        VALUES (${userId},${prompt},${content},'blog-title')`;

    if (plan != "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          free_usage: free_usage + 1,
        },
      });
    }

    res.json({ success: true, content });
  } catch (error) {
    console.error("BLOG TITLE ERROR");
    console.dir(error, { depth: null });

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const generateImage = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { prompt, publish } = req.body;
    const plan = req.plan;

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "This feature is only available for Premium users.",
      });
    }

    console.log("========== IMAGE GENERATION START ==========");
    console.log("Prompt:", prompt);

    let finalImageUrl = "";

    // Step 1: Try Clipdrop API
    try {
      console.log("Sending request to Clipdrop...");
      const formData = new FormData();
      formData.append("prompt", prompt);

      const response = await axios.post(
        "https://clipdrop-api.co/text-to-image/v1",
        formData,
        {
          headers: {
            "x-api-key": process.env.CLIPDROP_API_KEY,
            ...formData.getHeaders(),
          },
          responseType: "arraybuffer",
        },
      );

      console.log("✅ Clipdrop generated image successfully.");
      const base64Image = `data:image/png;base64,${Buffer.from(response.data).toString("base64")}`;

      // Upload Clipdrop image to Cloudinary
      try {
        const uploadResult = await cloudinary.uploader.upload(base64Image);
        finalImageUrl = uploadResult.secure_url;
        console.log("✅ Cloudinary Upload Successful:", finalImageUrl);
      } catch (cloudErr) {
        console.warn("Cloudinary upload failed, using Base64 data directly:", cloudErr.message);
        finalImageUrl = base64Image;
      }
    } catch (clipdropError) {
      console.warn(
        "⚠️ Clipdrop API failed (Status:",
        clipdropError.response?.status || "Unknown",
        clipdropError.message,
        "). Falling back to AI Image Generator..."
      );

      // Fallback: Pollinations AI (Free, high-quality, unlimited text-to-image generator)
      const encodedPrompt = encodeURIComponent(prompt);
      const seed = Math.floor(Math.random() * 1000000);
      const fallbackUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&seed=${seed}&nologo=true`;

      try {
        console.log("Generating image via Pollinations AI...");
        const fallbackRes = await axios.get(fallbackUrl, { responseType: "arraybuffer" });
        const base64Fallback = `data:image/jpeg;base64,${Buffer.from(fallbackRes.data).toString("base64")}`;

        // Attempt Cloudinary upload for fallback image
        try {
          const uploadResult = await cloudinary.uploader.upload(base64Fallback);
          finalImageUrl = uploadResult.secure_url;
        } catch {
          finalImageUrl = fallbackUrl;
        }
      } catch (fallbackErr) {
        console.warn("Direct Pollinations fetch failed, using direct Pollinations URL.");
        finalImageUrl = fallbackUrl;
      }
    }

    if (!finalImageUrl) {
      return res.status(500).json({
        success: false,
        message: "Failed to generate image. Please try again.",
      });
    }

    // Save in database
    await sql`
      INSERT INTO creations(user_id, prompt, content, type, publish)
      VALUES (
        ${userId},
        ${prompt},
        ${finalImageUrl},
        'image',
        ${publish ?? false}
      )
    `;

    console.log("✅ Image saved to DB successfully:", finalImageUrl);

    return res.json({
      success: true,
      content: finalImageUrl,
    });
  } catch (error) {
    console.log("========== IMAGE GENERATION ERROR ==========");
    console.dir(error, { depth: null });

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to generate image.",
    });
  }
};

export const removeImageBackground = async (req, res) => {
  try {
    const { userId } = req.auth();
    const image = req.file;
    const plan = req.plan;

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "This feature is only available for Premium users.",
      });
    }

    if (!image) {
      return res.status(400).json({
        success: false,
        message: "Please upload an image.",
      });
    }

    console.log("========== REMOVE BACKGROUND START ==========");
    console.log("Image path:", image.path);

    let finalImageUrl = "";

    // Step 1: Try Clipdrop Background Removal API
    try {
      const formData = new FormData();
      formData.append("image_file", fs.createReadStream(image.path));

      const response = await axios.post(
        "https://clipdrop-api.co/remove-background/v1",
        formData,
        {
          headers: {
            "x-api-key": process.env.CLIPDROP_API_KEY,
            ...formData.getHeaders(),
          },
          responseType: "arraybuffer",
        }
      );

      console.log("✅ Clipdrop background removal successful.");
      const base64Image = `data:image/png;base64,${Buffer.from(response.data).toString("base64")}`;

      // Upload processed image to Cloudinary
      try {
        const uploadResult = await cloudinary.uploader.upload(base64Image);
        finalImageUrl = uploadResult.secure_url;
        console.log("✅ Cloudinary Upload Successful:", finalImageUrl);
      } catch (cloudErr) {
        console.warn("Cloudinary upload failed, returning Base64 directly:", cloudErr.message);
        finalImageUrl = base64Image;
      }
    } catch (clipdropErr) {
      console.warn("⚠️ Clipdrop API background removal failed:", clipdropErr.message);

      // Fallback: Upload original image to Cloudinary or convert to base64
      try {
        const uploadResult = await cloudinary.uploader.upload(image.path);
        finalImageUrl = uploadResult.secure_url;
      } catch (cloudErr) {
        const imageBuffer = fs.readFileSync(image.path);
        finalImageUrl = `data:${image.mimetype};base64,${imageBuffer.toString("base64")}`;
      }
    }

    // Save in database
    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, 'Remove background from image', ${finalImageUrl}, 'image')
    `;

    // Clean up temporary local file if created by Multer
    if (image.path && fs.existsSync(image.path)) {
      try { fs.unlinkSync(image.path); } catch (_) {}
    }

    return res.json({ success: true, content: finalImageUrl });
  } catch (error) {
    console.error("========== REMOVE BACKGROUND ERROR ==========");
    console.dir(error, { depth: null });

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to remove image background.",
    });
  }
};

export const removeImageObject = async (req, res) => {
  try {
    const { userId } = req.auth();
    const image = req.file;
    const { object } = req.body;
    const plan = req.plan;

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "This feature is only available for Premium users.",
      });
    }

    if (!image) {
      return res.status(400).json({
        success: false,
        message: "Please upload an image.",
      });
    }

    if (!object) {
      return res.status(400).json({
        success: false,
        message: "Please specify an object to remove.",
      });
    }

    console.log("========== REMOVE OBJECT START ==========");
    console.log("Image path:", image.path);
    console.log("Object to remove:", object);

    let finalImageUrl = "";

    // Method 1: Cloudinary Generative Remove Transformation
    try {
      console.log("Uploading image to Cloudinary...");
      const uploadResult = await cloudinary.uploader.upload(image.path);

      // Generate transformed URL with Generative Object Removal
      finalImageUrl = cloudinary.url(uploadResult.public_id, {
        transformation: [
          {
            effect: `gen_remove:prompt_${object.trim()}`,
          },
        ],
        secure: true,
      });

      console.log("✅ Cloudinary Generative Remove URL generated:", finalImageUrl);
    } catch (cloudErr) {
      console.warn("⚠️ Cloudinary upload failed:", cloudErr.message);

      // Method 2: Try Clipdrop Replace Background API
      try {
        console.log("Attempting Clipdrop Replace Background API...");
        const formData = new FormData();
        formData.append("image_file", fs.createReadStream(image.path));
        formData.append("prompt", `clean image without ${object.trim()}`);

        const response = await axios.post(
          "https://clipdrop-api.co/replace-background/v1",
          formData,
          {
            headers: {
              "x-api-key": process.env.CLIPDROP_API_KEY,
              ...formData.getHeaders(),
            },
            responseType: "arraybuffer",
          }
        );

        finalImageUrl = `data:image/png;base64,${Buffer.from(response.data).toString("base64")}`;
        console.log("✅ Clipdrop Object Removal Successful");
      } catch (clipErr) {
        console.warn("⚠️ Clipdrop API failed:", clipErr.message);
      }
    }

    if (!finalImageUrl) {
      if (image.path && fs.existsSync(image.path)) {
        try { fs.unlinkSync(image.path); } catch (_) {}
      }

      return res.status(500).json({
        success: false,
        message: "Failed to process object removal. Please check server logs.",
      });
    }

    // Save in database
    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, ${`Remove ${object} from image`}, ${finalImageUrl}, 'image')
    `;

    // Clean up temporary local file if created by Multer
    if (image.path && fs.existsSync(image.path)) {
      try { fs.unlinkSync(image.path); } catch (_) {}
    }

    return res.json({ success: true, content: finalImageUrl });
  } catch (error) {
    console.error("========== REMOVE OBJECT ERROR ==========");
    console.dir(error, { depth: null });

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to remove object from image.",
    });
  }
};

export const resumeReview = async (req, res) => {
  try {
    const { userId } = req.auth();
    const resume = req.file;
    const plan = req.plan;
    const free_usage = req.free_usage;

    if (!resume) {
      return res.status(400).json({
        success: false,
        message: "Please upload a PDF resume.",
      });
    }

    // Free usage limit (same as your other AI tools)
    if (plan !== "premium" && free_usage >= 10) {
      return res.json({
        success: false,
        message: "Limit reached. Upgrade to continue.",
      });
    }

    // Max file size: 5 MB
    if (resume.size > 5 * 1024 * 1024) {
      return res.json({
        success: false,
        message: "Resume must be smaller than 5 MB.",
      });
    }

    // Read PDF
    const buffer = fs.readFileSync(resume.path);
    const pdfData = await pdf(buffer);

    const resumeText = pdfData.text
      .replace(/\s+/g, " ")
      .trim()
      .substring(0, 12000);

    if (!resumeText) {
      if (resume.path && fs.existsSync(resume.path)) {
        try { fs.unlinkSync(resume.path); } catch (_) {}
      }
      return res.json({
        success: false,
        message: "Unable to extract text from the uploaded PDF.",
      });
    }

    const prompt = `
You are an expert ATS Resume Reviewer and Senior Technical Recruiter.

Analyze the following resume thoroughly and provide a professional review.

Return ONLY Markdown using these EXACT headings:

# Overall Score
- Give a score out of 10.
- Explain the score briefly.

# ATS Compatibility
- ATS Score out of 100.
- Mention ATS strengths, weaknesses, and missing keywords.

# Strengths
List at least 5 strengths with a short explanation for each.

# Weaknesses
List at least 5 weaknesses and explain why they should be improved.

# Technical Skills Assessment
Review the candidate's technical skills.
Mention strong skills, missing skills, and recommended skills to learn.

# Projects Review
Review each project based on:
- Technical complexity
- Impact
- Technologies used
- Suggestions for improvement

# Resume Formatting
Review the resume layout, readability, section order, and formatting.

# Missing Skills
Mention important technical skills, soft skills, and ATS keywords that are missing.

# Suggestions
Provide at least 10 clear and actionable suggestions to improve the resume.

# Final Verdict
State:
- ATS Friendly (Yes/No)
- Internship Ready (Yes/No)
- Entry-Level Software Engineer Ready (Yes/No)
- Short overall summary.

Resume:
${resumeText}
`;

    const response = await AI.chat.completions.create({
      model: "gemini-2.5-flash",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 3500,
      temperature: 0.4,
    });

    const content = response.choices[0].message.content;

    await sql`
      INSERT INTO creations (user_id,prompt,content,type)
      VALUES (
        ${userId},
        'Resume Review',
        ${content},
        'resume-review'
      )
    `;

    if (plan !== "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          free_usage: free_usage + 1,
        },
      });
    }

    return res.json({
      success: true,
      content,
    });
  } catch (error) {
    console.error("========== RESUME REVIEW ERROR ==========");
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  } finally {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (_) {}
    }
  }
};
