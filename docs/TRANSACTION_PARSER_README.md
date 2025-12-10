# Transaction Parser - Implementation Guide

This module provides image and voice parsing capabilities for transaction entry using Hugging Face free models.

## Features

- **Image Parsing**: Extract transaction details from receipt/bill images using OCR
- **Voice Parsing**: Convert voice recordings to transaction data using speech-to-text
- **Smart Parsing**: Uses LLM to intelligently extract structured transaction fields
- **Fallback Support**: Regex-based extraction if LLM parsing fails

## Installation

1. Install required packages:
```bash
pip install -r transaction_parser_requirements.txt
```

2. Set your Hugging Face token as an environment variable:
```bash
# Linux/Mac
export HUGGINGFACE_TOKEN="your_token_here"

# Windows
set HUGGINGFACE_TOKEN=your_token_here
```

## Models Used

- **OCR**: `microsoft/trocr-base-printed` - For extracting text from images
- **Speech-to-Text**: `openai/whisper-small` - For transcribing audio
- **Text Parsing**: `microsoft/Phi-3-mini-4k-instruct` - For parsing text to structured data

All models are free and run locally (or via Hugging Face Inference API).

## Usage

### Basic Usage

```python
from transaction_parser import TransactionParser

parser = TransactionParser()

# Parse image
result = parser.parse_image("receipt.jpg")
print(result)

# Parse voice
result = parser.parse_voice("recording.wav")
print(result)
```

### Response Format

The parser returns a dictionary with the following structure:

```json
{
  "amount": 500.00,
  "transaction_type": "expense",
  "category": "Food",
  "merchant_name": "McDonald's",
  "description": "Lunch at McDonald's",
  "payment_method": "UPI",
  "location": "",
  "transaction_date": "2024-01-15",
  "transaction_time": "14:30",
  "confidence": 0.85
}
```

If there's an error, the response will include:
```json
{
  "error": "Error message here",
  "confidence": 0.0
}
```

## Testing

Run the test script to verify everything works:

```bash
python test_transaction_parser.py
```

This will test text parsing directly (no files needed). To test image/voice parsing, uncomment the respective test functions and provide sample files.

## Frontend Integration

### Step 1: Create API Endpoint (Optional)

You can create a simple FastAPI endpoint to call the parser:

```python
from fastapi import FastAPI, UploadFile, File
from transaction_parser import TransactionParser

app = FastAPI()
parser = TransactionParser()

@app.post("/api/parse-image")
async def parse_image(file: UploadFile = File(...)):
    # Save uploaded file temporarily
    with open("temp_image.jpg", "wb") as f:
        f.write(await file.read())
    
    # Parse image
    result = parser.parse_image("temp_image.jpg")
    
    # Clean up
    os.remove("temp_image.jpg")
    
    return result

@app.post("/api/parse-voice")
async def parse_voice(file: UploadFile = File(...)):
    # Save uploaded file temporarily
    with open("temp_audio.wav", "wb") as f:
        f.write(await file.read())
    
    # Parse audio
    result = parser.parse_voice("temp_audio.wav")
    
    # Clean up
    os.remove("temp_audio.wav")
    
    return result
```

### Step 2: Update Frontend Component

In `TransactionInputCard.tsx`, update the handlers:

```typescript
const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  toast.info("Processing image...");
  
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('http://localhost:8000/api/parse-image', {
      method: 'POST',
      body: formData,
    });
    
    const result = await response.json();
    
    if (result.error) {
      toast.error(result.error);
      return;
    }
    
    // Fill form with extracted data
    setFormData({
      ...formData,
      amount: result.amount?.toString() || "",
      transaction_type: result.transaction_type || "expense",
      category: result.category || "",
      merchant_name: result.merchant_name || "",
      description: result.description || "",
      payment_method: result.payment_method || "",
      location: result.location || "",
      transaction_date: result.transaction_date 
        ? new Date(result.transaction_date) 
        : new Date(),
      transaction_time: result.transaction_time || formData.transaction_time,
    });
    
    // Switch to manual tab for review
    setActiveMode("manual");
    toast.success(`Extracted transaction (confidence: ${(result.confidence * 100).toFixed(0)}%)`);
  } catch (error) {
    toast.error("Failed to process image");
    console.error(error);
  }
};

const handleVoiceRecord = async () => {
  // Start recording using MediaRecorder API
  // ... recording logic ...
  
  // After recording stops:
  const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
  const formData = new FormData();
  formData.append('file', audioBlob, 'recording.wav');
  
  toast.info("Processing voice...");
  
  try {
    const response = await fetch('http://localhost:8000/api/parse-voice', {
      method: 'POST',
      body: formData,
    });
    
    const result = await response.json();
    
    if (result.error) {
      toast.error(result.error);
      return;
    }
    
    // Fill form with extracted data (same as image)
    setFormData({
      ...formData,
      amount: result.amount?.toString() || "",
      transaction_type: result.transaction_type || "expense",
      category: result.category || "",
      merchant_name: result.merchant_name || "",
      description: result.description || "",
      payment_method: result.payment_method || "",
      location: result.location || "",
      transaction_date: result.transaction_date 
        ? new Date(result.transaction_date) 
        : new Date(),
      transaction_time: result.transaction_time || formData.transaction_time,
    });
    
    // Switch to manual tab for review
    setActiveMode("manual");
    toast.success(`Extracted transaction (confidence: ${(result.confidence * 100).toFixed(0)}%)`);
  } catch (error) {
    toast.error("Failed to process voice");
    console.error(error);
  }
};
```

## Direct Python File Usage (Without API)

If you prefer to call the Python script directly from the frontend (using a subprocess or similar), you can use:

```python
# In a separate script or directly in your backend
import subprocess
import json

def parse_image_direct(image_path):
    """Call the parser directly."""
    from transaction_parser import TransactionParser
    parser = TransactionParser()
    return parser.parse_image(image_path)
```

## Performance Notes

- **First run**: Models will be downloaded (~2-5 GB total)
- **Image parsing**: ~2-5 seconds per image
- **Voice parsing**: ~3-7 seconds per recording
- **Model loading**: ~10-30 seconds on first use (cached after)

## Error Handling

The parser includes comprehensive error handling:
- Invalid image/audio files
- Low-quality inputs
- Parsing failures (falls back to regex)
- Model loading errors

All errors return a structured response with an `error` field.

## Supported Formats

- **Images**: JPEG, PNG, BMP, TIFF
- **Audio**: WAV, MP3, FLAC (converted to 16kHz mono)

## Troubleshooting

1. **Out of memory**: Use smaller models or enable model quantization
2. **Slow processing**: Use GPU if available, or smaller models (whisper-tiny, trocr-small)
3. **Poor accuracy**: Ensure clear images/audio, or adjust the LLM prompt

## License

Uses Hugging Face models under their respective licenses. All models are free for use.

