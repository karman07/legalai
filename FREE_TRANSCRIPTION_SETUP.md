# Free Audio Transcription Setup Guide

## 3 Transcription Options

### Option 1: Local Whisper (100% FREE) ⭐ RECOMMENDED

**Pros:**
- ✅ Completely free, no API costs
- ✅ Works offline
- ✅ No usage limits
- ✅ High accuracy (same model as OpenAI Whisper)
- ✅ Privacy - data stays on your server

**Cons:**
- ⚠️ Requires Python and some disk space (~1-3GB for model)
- ⚠️ Slower than cloud APIs (but runs in background)
- ⚠️ Needs some CPU/GPU resources

**Setup:**

1. **Install Python** (if not already installed):
   ```bash
   # Check if Python is installed
   python --version
   
   # If not, download from: https://www.python.org/downloads/
   ```

2. **Install OpenAI Whisper CLI:**
   ```bash
   pip install openai-whisper
   ```

3. **Install FFmpeg** (required by Whisper):
   
   **Windows:**
   ```bash
   # Using Chocolatey
   choco install ffmpeg
   
   # Or download from: https://ffmpeg.org/download.html
   ```
   
   **Linux:**
   ```bash
   sudo apt update
   sudo apt install ffmpeg
   ```
   
   **Mac:**
   ```bash
   brew install ffmpeg
   ```

4. **Test Whisper:**
   ```bash
   whisper --help
   ```

5. **Configure Backend:**
   Add to `.env`:
   ```env
   TRANSCRIPTION_METHOD=whisper-local
   ```

6. **Done!** Upload audio and transcription happens automatically.

**Model Sizes:**
- `tiny` - 39MB, fastest (lower accuracy)
- `base` - 74MB, good balance ⭐ (default)
- `small` - 244MB, better accuracy
- `medium` - 769MB, high accuracy
- `large` - 1550MB, best accuracy (slow)

---

### Option 2: AssemblyAI (FREE Tier)

**Pros:**
- ✅ 100 hours FREE per month (enough for most use cases!)
- ✅ Fast cloud processing
- ✅ No local setup required
- ✅ High accuracy

**Cons:**
- ⚠️ Requires internet
- ⚠️ Free tier has 100 hours/month limit
- ⚠️ After limit: $0.00025/second ($0.015/minute)

**Setup:**

1. **Sign up for free:**
   Go to: https://www.assemblyai.com/
   
2. **Get API Key:**
   - After signup, go to dashboard
   - Copy your API key

3. **Configure Backend:**
   Add to `.env`:
   ```env
   TRANSCRIPTION_METHOD=assemblyai
   ASSEMBLYAI_API_KEY=your-api-key-here
   ```

4. **Done!** Free tier gives you 100 hours/month.

**Pricing After Free Tier:**
- $0.00025/second = $0.015/minute = $0.90/hour

---

### Option 3: OpenAI Whisper API (PAID)

**Pros:**
- ✅ Very fast
- ✅ Excellent accuracy
- ✅ No setup required

**Cons:**
- ❌ NOT FREE
- ❌ $0.006 per minute ($0.36/hour)

**Setup:**

1. Get API key: https://platform.openai.com/api-keys

2. Add to `.env`:
   ```env
   TRANSCRIPTION_METHOD=openai
   OPENAI_API_KEY=sk-your-key-here
   ```

---

## Recommendation by Use Case

### Small to Medium Projects (< 100 hours/month)
**Use: AssemblyAI Free Tier**
- No setup hassle
- Fast processing
- Completely free for typical usage

### Large Projects or Offline Use
**Use: Local Whisper**
- Unlimited transcription
- No recurring costs
- One-time setup

### High Volume + Budget Available
**Use: OpenAI Whisper API**
- Best for high-volume commercial use
- Fastest processing
- Reliable infrastructure

---

## Cost Comparison

**Example: 50 hours of audio/month**

| Method | Cost | Setup Time | Speed |
|--------|------|------------|-------|
| Local Whisper | $0 | 15 mins | Medium |
| AssemblyAI | $0 (within free tier) | 2 mins | Fast |
| OpenAI | $108/month | 2 mins | Very Fast |

**Example: 200 hours of audio/month**

| Method | Cost | Setup Time | Speed |
|--------|------|------------|-------|
| Local Whisper | $0 | 15 mins | Medium |
| AssemblyAI | $90/month | 2 mins | Fast |
| OpenAI | $432/month | 2 mins | Very Fast |

---

## Performance Benchmarks

**Processing 1 hour of audio:**

- **Local Whisper (base model):** ~5-10 minutes on CPU
- **Local Whisper (with GPU):** ~1-2 minutes
- **AssemblyAI:** ~2-3 minutes
- **OpenAI Whisper:** ~1-2 minutes

---

## Switching Methods

You can change transcription method anytime by updating `.env`:

```env
# Change from one method to another
TRANSCRIPTION_METHOD=whisper-local  # or 'assemblyai' or 'openai'
```

Restart server after changing:
```bash
npm run start:dev
```

---

## Troubleshooting

### Local Whisper Issues:

**Error: "whisper: command not found"**
```bash
# Ensure Python and pip are in PATH
pip install --upgrade openai-whisper
```

**Error: "FFmpeg not found"**
```bash
# Install FFmpeg (see setup instructions above)
ffmpeg -version  # Test if installed
```

**Slow transcription:**
- Use smaller model: Edit service code to use `--model tiny` instead of `base`
- Or use GPU: Install `torch` with CUDA support

### AssemblyAI Issues:

**Error: "Invalid API key"**
- Check API key in .env file
- Regenerate key from AssemblyAI dashboard

**Error: "Rate limit exceeded"**
- Free tier: 100 hours/month limit reached
- Wait for next month or upgrade plan

---

## Disable Transcription

To disable transcription completely:

```env
TRANSCRIPTION_METHOD=none
```

Audio lessons will upload but won't have transcripts.

---

## Summary

**For most users:** Start with **AssemblyAI free tier** (easiest setup, 100 hours/month free).

**For unlimited free:** Use **Local Whisper** (one-time 15-min setup, works forever).

**For high volume + budget:** Use **OpenAI Whisper API** (fastest, most reliable).
