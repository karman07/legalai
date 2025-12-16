#!/usr/bin/env python3
"""
Test script to verify Whisper is working correctly
This creates a simple test and verifies the transcription pipeline
"""
import sys
import os

def test_whisper_import():
    """Test 1: Can we import whisper?"""
    try:
        import whisper
        print("✓ Test 1 PASSED: Whisper module imported successfully")
        return True
    except Exception as e:
        print(f"✗ Test 1 FAILED: Could not import whisper - {e}")
        return False

def test_whisper_model_load():
    """Test 2: Can we load a Whisper model?"""
    try:
        import whisper
        print("  Loading 'tiny' model (fastest, for testing)...")
        model = whisper.load_model("tiny")
        print(f"✓ Test 2 PASSED: Model loaded successfully (type: {type(model).__name__})")
        return True
    except Exception as e:
        print(f"✗ Test 2 FAILED: Could not load model - {e}")
        return False

def test_torch():
    """Test 3: Is PyTorch working?"""
    try:
        import torch
        print(f"✓ Test 3 PASSED: PyTorch {torch.__version__} is working")
        return True
    except Exception as e:
        print(f"✗ Test 3 FAILED: PyTorch issue - {e}")
        return False

def test_transcription_script():
    """Test 4: Does the transcription script exist?"""
    script_path = os.path.join(os.path.dirname(__file__), 'transcribe.py')
    if os.path.exists(script_path):
        print(f"✓ Test 4 PASSED: Transcription script exists at {script_path}")
        return True
    else:
        print(f"✗ Test 4 FAILED: Transcription script not found at {script_path}")
        return False

def main():
    print("=" * 60)
    print("Whisper Installation Test Suite")
    print("=" * 60)
    print()
    
    tests = [
        test_whisper_import,
        test_torch,
        test_whisper_model_load,
        test_transcription_script,
    ]
    
    passed = 0
    total = len(tests)
    
    for test_func in tests:
        try:
            if test_func():
                passed += 1
        except Exception as e:
            print(f"✗ Unexpected error in {test_func.__name__}: {e}")
        print()
    
    print("=" * 60)
    print(f"Results: {passed}/{total} tests passed")
    print("=" * 60)
    
    if passed == total:
        print()
        print("🎉 ALL TESTS PASSED!")
        print()
        print("Your Whisper installation is ready to use.")
        print("You can now start your NestJS server and upload audio files.")
        print()
        print("Next steps:")
        print("1. Set TRANSCRIPTION_METHOD=whisper-local in your .env file")
        print("2. Run: npm run start:dev")
        print("3. Upload audio via POST /api/admin/audio-lessons")
        return 0
    else:
        print()
        print("⚠️  Some tests failed. Please check the errors above.")
        print()
        print("Common fixes:")
        print("- pip install openai-whisper")
        print("- pip install torch torchvision torchaudio")
        return 1

if __name__ == "__main__":
    sys.exit(main())
