#!/usr/bin/env python3
"""
Whisper transcription script for NestJS backend
Usage: python transcribe.py <audio_file_path> <output_txt_path>
"""
import sys
import os
import whisper

def transcribe_audio(audio_path, output_path):
    try:
        # Verify audio file exists
        if not os.path.exists(audio_path):
            print(f"Error: Audio file not found: {audio_path}", file=sys.stderr)
            return 1
        
        print(f"Audio file verified: {audio_path}", file=sys.stderr)
        print(f"File size: {os.path.getsize(audio_path)} bytes", file=sys.stderr)
        
        # Ensure output directory exists
        output_dir = os.path.dirname(output_path)
        if output_dir and not os.path.exists(output_dir):
            os.makedirs(output_dir, exist_ok=True)
            print(f"Created output directory: {output_dir}", file=sys.stderr)
        
        # Load the Whisper model (base model for balance of speed/accuracy)
        print("Loading Whisper model...", file=sys.stderr)
        model = whisper.load_model("base")
        
        # Transcribe the audio with FP32 explicitly for CPU and show progress
        print(f"Transcribing {audio_path}...", file=sys.stderr)
        print("This may take a while. Progress will be shown below:", file=sys.stderr)
        
        # Custom progress callback
        def progress_callback(progress_dict):
            if 'progress' in progress_dict:
                progress = progress_dict['progress'] * 100
                print(f"Progress: {progress:.1f}%", file=sys.stderr, flush=True)
        
        result = model.transcribe(
            audio_path, 
            language="en",
            fp16=False,  # Use FP32 for CPU to avoid warnings
            verbose=True  # Show progress in console
        )
        
        # Write transcript to file
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(result["text"])
        
        print(f"Transcription completed: {output_path}", file=sys.stderr)
        print(f"Transcript length: {len(result['text'])} characters", file=sys.stderr)
        return 0
    except Exception as e:
        import traceback
        print(f"Error: {str(e)}", file=sys.stderr)
        print(f"Traceback:", file=sys.stderr)
        traceback.print_exc(file=sys.stderr)
        return 1

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python transcribe.py <audio_file> <output_txt>", file=sys.stderr)
        sys.exit(1)
    
    audio_file = sys.argv[1]
    output_file = sys.argv[2]
    
    exit_code = transcribe_audio(audio_file, output_file)
    sys.exit(exit_code)
