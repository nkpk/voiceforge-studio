const express = require('express');
const multer  = require('multer');
const cors    = require('cors');
const path    = require('path');
const fs      = require('fs');
const { v4: uuid } = require('uuid');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Storage setup ─────────────────────────────
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// Multer: accept audio blobs up to 20MB
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename:    (req, file, cb) => cb(null, uuid() + '.webm'),
});
const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } });

// ── Middleware ────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Allow mic/camera in browsers that check headers
app.use((req, res, next) => {
  res.setHeader('Permissions-Policy', 'microphone=*, camera=*');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  next();
});

// ── In-memory voice profiles (persists while server runs) ────
// In production you'd use a DB. For a personal app this is fine.
const voiceProfiles = {};   // id → { name, files: [filename], createdAt }

// ── API: Upload one audio recording ──────────
// POST /api/voices/upload
// Body: multipart form with field "audio" + field "voiceId"
app.post('/api/voices/upload', upload.single('audio'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No audio file' });

  const voiceId = req.body.voiceId || uuid();
  if (!voiceProfiles[voiceId]) {
    voiceProfiles[voiceId] = { id: voiceId, name: req.body.name || 'My Voice', files: [], createdAt: Date.now() };
  }
  voiceProfiles[voiceId].files.push(req.file.filename);
  if (req.body.name) voiceProfiles[voiceId].name = req.body.name;

  res.json({ voiceId, filename: req.file.filename, total: voiceProfiles[voiceId].files.length });
});

// ── API: Save/finalise a voice profile ───────
// POST /api/voices/save
app.post('/api/voices/save', (req, res) => {
  const { voiceId, name } = req.body;
  if (!voiceId || !voiceProfiles[voiceId]) return res.status(404).json({ error: 'Voice not found' });
  voiceProfiles[voiceId].name = name || voiceProfiles[voiceId].name;
  res.json({ ok: true, voice: voiceProfiles[voiceId] });
});

// ── API: List all voice profiles ─────────────
app.get('/api/voices', (req, res) => {
  const list = Object.values(voiceProfiles).map(v => ({
    id: v.id, name: v.name, samples: v.files.length, createdAt: v.createdAt,
  }));
  res.json(list);
});

// ── API: Get a specific voice profile ─────────
app.get('/api/voices/:id', (req, res) => {
  const v = voiceProfiles[req.params.id];
  if (!v) return res.status(404).json({ error: 'Not found' });
  res.json({ id: v.id, name: v.name, samples: v.files.length, files: v.files });
});

// ── API: Play back a voice sample ─────────────
// GET /api/voices/:id/sample/:index
app.get('/api/voices/:id/sample/:index', (req, res) => {
  const v = voiceProfiles[req.params.id];
  if (!v) return res.status(404).json({ error: 'Not found' });
  const idx = parseInt(req.params.index) || 0;
  const filename = v.files[idx % v.files.length];
  if (!filename) return res.status(404).json({ error: 'No samples' });
  const filePath = path.join(UPLOADS_DIR, filename);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File missing' });
  res.setHeader('Content-Type', 'audio/webm');
  res.sendFile(filePath);
});

// ── API: Delete a voice ───────────────────────
app.delete('/api/voices/:id', (req, res) => {
  const v = voiceProfiles[req.params.id];
  if (!v) return res.status(404).json({ error: 'Not found' });
  // Remove audio files
  v.files.forEach(f => {
    try { fs.unlinkSync(path.join(UPLOADS_DIR, f)); } catch(e) {}
  });
  delete voiceProfiles[req.params.id];
  res.json({ ok: true });
});

// ── Catch-all: serve frontend ─────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── Start ─────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n✅ VoiceForge Studio running at http://localhost:${PORT}\n`);
});
