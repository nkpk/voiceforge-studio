# VoiceForge Studio — Deploy to Web (Free)

Deploy in ~5 minutes. Your app will get a live `https://` URL that works on
any phone or browser — and microphone access will work perfectly.

---

## Step 1 — Put the code on GitHub

1. Go to **github.com** → Sign up (free) or log in
2. Click **"New repository"** → name it `voiceforge-studio` → click **Create**
3. On your computer, open a terminal in this folder and run:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/voiceforge-studio.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

---

## Step 2 — Deploy on Railway (free)

1. Go to **railway.app** → click **"Start a New Project"**
2. Choose **"Deploy from GitHub repo"**
3. Select your `voiceforge-studio` repo
4. Railway auto-detects Node.js and deploys it — takes ~2 minutes
5. Click **"Generate Domain"** → you get a URL like `voiceforge-studio.up.railway.app`

That's it! 🎉

---

## Step 3 — Open on your phone

Visit your Railway URL in Chrome or Safari on your phone.
When it asks for microphone permission → tap **Allow**.

The Clone Voice feature will now work on your phone! 🎤

---

## Notes

- **Free tier**: Railway gives 500 hours/month free — plenty for personal use
- **Voice recordings**: stored on the server while it's running. For permanent
  storage you'd add a database (Railway offers free PostgreSQL too)
- **Updates**: just `git push` and Railway auto-redeploys

---

## Local development

```bash
npm install
node server.js
# Open http://localhost:3000
```
