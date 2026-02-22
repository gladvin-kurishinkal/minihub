# MiniHub Deployment Guide

## Stack
| Part | Technology | Host |
|---|---|---|
| Frontend | React + Vite | Vercel |
| Backend | Express + Mongoose | Render |
| Database | MongoDB | Atlas |

---

## Step 1 — Push Code to GitHub

Make sure `.env` files are in `.gitignore` (never commit secrets), then:

```bash
git add .
git commit -m "your message"
git push origin main
```

> If the push is rejected (remote has newer commits):
> ```bash
> git pull --rebase origin main
> git push origin main
> ```

---

## Step 2 — Deploy Backend to Render

1. Go to [render.com](https://render.com) → **New → Web Service**
2. Connect your GitHub repo
3. Set **Root Directory** → `server`
4. Set the two fields **separately**:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`

> ⚠️ Do NOT combine them into one field — the server will get stuck in "Building" forever.

5. Add **Environment Variables**:

| Key | Value |
|---|---|
| `MONGO_URI` | Your Atlas connection string |
| `PORT` | `3001` |
| `FRONTEND_URL` | *(set after Step 3)* |

6. Click **Deploy** — note your URL, e.g. `https://minihub-server.onrender.com`

---

## Step 3 — Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project** → Import your GitHub repo
2. **Root Directory:** `/` (project root)
3. Framework: **Vite** (auto-detected)
4. Add **Environment Variables**:

| Key | Value |
|---|---|
| `VITE_API_URL` | `https://minihub-server.onrender.com` |
| `GEMINI_API_KEY` | Your Gemini API key |

5. Click **Deploy** — note your URL, e.g. `https://minihub.vercel.app`

---

## Step 4 — Update CORS on Render

Go to Render → **minihub-server → Environment** and set:

| Key | Value |
|---|---|
| `FRONTEND_URL` | `https://minihub.vercel.app` |

Then trigger a **Manual Deploy → Deploy Latest Commit**.

---

## Step 5 — MongoDB Atlas Network Access

In Atlas → **Network Access** → **Add IP Address** → **Allow Access from Anywhere (`0.0.0.0/0`)**

This is needed because Render uses dynamic IPs.

---

## ✅ Final Checklist

- [ ] Code pushed to GitHub
- [ ] Backend deployed on Render with correct Build/Start commands
- [ ] `MONGO_URI`, `PORT`, `FRONTEND_URL` set on Render
- [ ] Frontend deployed on Vercel
- [ ] `VITE_API_URL`, `GEMINI_API_KEY` set on Vercel
- [ ] `FRONTEND_URL` updated on Render after getting Vercel URL
- [ ] Atlas Network Access set to allow all IPs
