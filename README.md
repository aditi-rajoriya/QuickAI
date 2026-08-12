# QuickAI - Full-Stack AI Content Generation & Productivity SaaS

![QuickAI Banner](https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop)

QuickAI is an all-in-one AI SaaS platform providing tools for ATS resume analysis, article generation, blog title ideation, image synthesis, background removal, and object elimination.

---

## 🚀 Features

- **📄 AI Resume Reviewer (ATS Scanner)**: Upload PDF resumes to receive comprehensive ATS compatibility scores, strengths, weaknesses, tech stack assessment, and actionable improvements.
- **✍️ AI Article Writer**: Generate structured, SEO-friendly, long-form articles in multiple lengths with custom Markdown formatting.
- **💡 Blog Title Generator**: Generate high-converting, category-specific blog titles.
- **🎨 AI Image Generation**: Multi-style image generation (Realistic, Anime, 3D, Ghibli) with automated Cloudinary CDN storage and Pollinations AI fallback.
- **✂️ Background & Object Removal**: AI-powered image editing to isolate subjects or remove unwanted objects seamlessly.
- **🌐 Public Community Showcase**: Share creations, view community creations, and like community posts.
- **🔐 Clerk Authentication & Tiered Access**: Role-based access control with token-metered free usage (10 generations) and premium plan integration.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 + Vite 8
- **Routing**: React Router DOM v7
- **Styling**: Tailwind CSS v4
- **Auth**: Clerk React SDK
- **Icons & UI**: Lucide React, React Hot Toast, React Markdown

### Backend
- **Runtime**: Node.js & Express.js (ES Modules)
- **Database**: Neon Serverless PostgreSQL (`@neondatabase/serverless`)
- **AI Models**: Google Gemini 2.5 Flash via OpenAI SDK & Clipdrop API
- **File Processing**: Multer & `pdf-parse`
- **Asset CDN**: Cloudinary v2

---

## 📁 Project Structure

```
QuickAI/
├── client/                 # React + Vite Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Application routes (Dashboard, Tools, Community)
│   │   ├── assets/         # Icons, images, metadata
│   │   └── App.jsx         # App router configuration
│   ├── public/             # Static public assets & SPA routing rules
│   └── vercel.json         # Vercel deployment rewrite configuration
│
└── server/                 # Express.js REST API
    ├── configs/            # Database (Neon), Cloudinary, and Multer configs
    ├── controllers/        # AI & User business logic controllers
    ├── middlewares/        # Clerk authentication & usage metering
    ├── routes/             # Express API routes
    └── server.js           # Server entry point & CORS configuration
```

---

## ⚙️ Environment Variables

### Client (`client/.env`)
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_key
VITE_BASE_URL=http://localhost:3000
```

### Server (`server/.env`)
```env
PORT=3000
DATABASE_URL=postgresql://user:password@endpoint.neon.tech/neondb?sslmode=require
CLERK_SECRET_KEY=sk_test_your_clerk_secret
CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key
GEMINI_API_KEY=your_gemini_api_key
CLIPDROP_API_KEY=your_clipdrop_api_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
CLIENT_URL=http://localhost:5173
```

---

## 💻 Local Development Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/<YOUR_USERNAME>/QuickAI.git
   cd QuickAI
   ```

2. **Setup Backend**:
   ```bash
   cd server
   npm install
   npm start
   ```

3. **Setup Frontend**:
   ```bash
   cd ../client
   npm install
   npm run dev
   ```

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
