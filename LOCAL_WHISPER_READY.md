# Quick Start: Local Whisper Transcription

✅ **Whisper is now installed and configured!**

## What's Been Set Up

1. **Python Whisper Package**: Installed at `C:\Users\Dell\AppData\Local\Programs\Python\Python312`
2. **Transcription Script**: Created at `scripts/transcribe.py`
3. **Service Updated**: NestJS service now uses your local Whisper installation
4. **Default Method**: Set to `whisper-local` (100% FREE, unlimited usage)

## How It Works

When you upload an audio file:
1. File is saved to `./uploads/audio/`
2. NestJS spawns Python script: `python scripts/transcribe.py <audio_file> <output.txt>`
3. Whisper loads the 'base' model (74MB, good balance of speed/accuracy)
4. Audio is transcribed and saved to text file
5. Transcript is read and stored in MongoDB
6. Temporary transcript file is cleaned up

## Configuration in .env

```env
TRANSCRIPTION_METHOD=whisper-local
```

## Test Your Setup

### 1. Test Python Whisper
```bash
python -c "import whisper; print('✓ Whisper ready')"
```

### 2. Start Your Server
```bash
npm run start:dev
```

### 3. Upload Audio (Admin Endpoint)
```bash
curl -X POST "http://localhost:3000/api/admin/audio-lessons" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -F "file=@test-audio.mp3" \
  -F "title=Test Lesson" \
  -F "description=Testing transcription"
```

### 4. Check Transcription Status
```bash
curl -X GET "http://localhost:3000/api/admin/audio-lessons/:id" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

Watch the `transcriptionStatus` field change:
- `pending` → File uploaded, waiting to start
- `processing` → Whisper is transcribing
- `completed` → Transcript available in the `transcript` field
- `failed` → Error occurred (check `transcriptionError`)

## Transcription Speed

**Base Model Performance** (on typical hardware):
- 1 minute of audio = ~30-60 seconds processing time
- 10 minute lecture = ~5-10 minutes to transcribe
- 1 hour lecture = ~30-60 minutes to transcribe

**Tips for Faster Transcription:**
- Use `tiny` model (faster, less accurate): Edit `scripts/transcribe.py` line 18
  ```python
  model = whisper.load_model("tiny")  # 39MB, 5x faster
  ```
- Use `small` model (balanced): 
  ```python
  model = whisper.load_model("small")  # 244MB, good accuracy
  ```
- Use `medium` or `large` (slower, best accuracy):
  ```python
  model = whisper.load_model("medium")  # 769MB
  model = whisper.load_model("large")   # 1550MB
  ```

## Available Whisper Models

| Model  | Size | Speed | Accuracy | Best For |
|--------|------|-------|----------|----------|
| tiny   | 39MB | 5x    | Good     | Testing, quick previews |
| base   | 74MB | 3x    | Better   | **Default (recommended)** |
| small  | 244MB| 2x    | Great    | Production use |
| medium | 769MB| 1.5x  | Excellent| High-quality content |
| large  | 1550MB| 1x   | Best     | Professional work |

## Troubleshooting

### "Module not found" errors
```bash
pip install openai-whisper torch torchvision torchaudio
```

### Transcription takes too long
- Switch to `tiny` or `small` model in `scripts/transcribe.py`
- Models are cached after first use (faster subsequent runs)

### Memory issues
- Close other applications
- Use smaller model (tiny/base)
- Process shorter audio clips

### Check logs
- Backend logs show: "Loading Whisper model..." and "Transcribing..."
- Any Python errors will appear in the console

## Cost Comparison

| Method | Cost | Speed | Your Setup |
|--------|------|-------|------------|
| Local Whisper | **FREE** | Medium | ✅ **ACTIVE** |
| AssemblyAI | 100h/month free | Fast | Not configured |
| OpenAI | $0.006/min | Fastest | Not configured |

**Your current setup is 100% FREE with unlimited usage!** 🎉

## Next Steps

1. **Test with a sample audio file** (MP3, WAV, M4A, etc.)
2. **Monitor the first transcription** to see the process
3. **Adjust model size** if needed for your speed/accuracy requirements
4. **Scale to production** - works the same on Linux/Mac servers

## Advanced: FFmpeg Support (Optional)

For better audio format support, install FFmpeg:

### Windows (Administrator PowerShell)
```bash
choco install ffmpeg -y
```

### Or download manually
https://ffmpeg.org/download.html#build-windows

**Note:** Whisper works without FFmpeg for common formats (MP3, WAV, M4A). FFmpeg adds support for more exotic formats and improves processing speed.

## Need Help?

- Check `transcriptionError` field in the response if status is `failed`
- Look for Python errors in your server console
- Verify Python path: `C:\Users\Dell\AppData\Local\Programs\Python\Python312\python.exe`
- Test script manually: `python scripts/transcribe.py <audio_file> output.txt`
