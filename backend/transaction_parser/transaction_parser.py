"""
Transaction Parser - Image and Voice Input Processing
=====================================================

This module processes image receipts/bills and voice recordings to extract
transaction details using Hugging Face free models.

Usage:
    # Image parsing
    parser = TransactionParser()
    result = parser.parse_image("receipt.jpg")
    
    # Voice parsing
    result = parser.parse_voice("recording.wav")
"""

import os
import json
import re
from typing import Dict, Optional, Any
from pathlib import Path
from PIL import Image
import torch
from transformers import (
    TrOCRProcessor,
    VisionEncoderDecoderModel,
    AutoProcessor,
    AutoModelForSpeechSeq2Seq,
    AutoTokenizer,
    AutoModelForCausalLM,
    pipeline
)
import librosa
import soundfile as sf

# Hugging Face token (get from environment variable)
HF_TOKEN = os.getenv("HUGGINGFACE_TOKEN", None)

class TransactionParser:
    """Main parser class for image and voice transaction input."""
    
    def __init__(self):
        """Initialize models (lazy loading on first use)."""
        self.ocr_processor = None
        self.ocr_model = None
        self.whisper_processor = None
        self.whisper_model = None
        self.llm_tokenizer = None
        self.llm_model = None
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"Using device: {self.device}")
    
    def _load_ocr_models(self):
        """Load OCR models (TrOCR) for image text extraction."""
        if self.ocr_processor is None:
            print("Loading OCR models...")
            try:
                self.ocr_processor = TrOCRProcessor.from_pretrained(
                    "microsoft/trocr-base-printed",
                    token=HF_TOKEN
                )
                self.ocr_model = VisionEncoderDecoderModel.from_pretrained(
                    "microsoft/trocr-base-printed",
                    token=HF_TOKEN
                ).to(self.device)
                print("OCR models loaded successfully")
            except Exception as e:
                print(f"Error loading OCR models: {e}")
                raise
    
    def _load_whisper_models(self):
        """Load Whisper models for speech-to-text."""
        if self.whisper_processor is None:
            print("Loading Whisper models...")
            try:
                self.whisper_processor = AutoProcessor.from_pretrained(
                    "openai/whisper-small",
                    token=HF_TOKEN
                )
                self.whisper_model = AutoModelForSpeechSeq2Seq.from_pretrained(
                    "openai/whisper-small",
                    token=HF_TOKEN
                ).to(self.device)
                print("Whisper models loaded successfully")
            except Exception as e:
                print(f"Error loading Whisper models: {e}")
                raise
    
    def _load_llm_models(self):
        """Load LLM models (Phi-3-mini) for text parsing."""
        if self.llm_tokenizer is None:
            print("Loading LLM models...")
            try:
                # Using Phi-3-mini for parsing
                model_name = "microsoft/Phi-3-mini-4k-instruct"
                self.llm_tokenizer = AutoTokenizer.from_pretrained(
                    model_name,
                    token=HF_TOKEN,
                    trust_remote_code=True
                )
                self.llm_model = AutoModelForCausalLM.from_pretrained(
                    model_name,
                    token=HF_TOKEN,
                    trust_remote_code=True,
                    torch_dtype=torch.float16 if self.device == "cuda" else torch.float32,
                    device_map="auto" if self.device == "cuda" else None
                )
                if self.device == "cpu":
                    self.llm_model = self.llm_model.to(self.device)
                print("LLM models loaded successfully")
            except Exception as e:
                print(f"Error loading LLM models: {e}")
                # Fallback to a simpler model if Phi-3 fails
                print("Trying fallback model...")
                try:
                    model_name = "microsoft/Phi-2"
                    self.llm_tokenizer = AutoTokenizer.from_pretrained(
                        model_name,
                        token=HF_TOKEN,
                        trust_remote_code=True
                    )
                    self.llm_model = AutoModelForCausalLM.from_pretrained(
                        model_name,
                        token=HF_TOKEN,
                        trust_remote_code=True,
                        torch_dtype=torch.float32,
                    ).to(self.device)
                    print("Fallback LLM models loaded successfully")
                except Exception as e2:
                    print(f"Fallback also failed: {e2}")
                    raise
    
    def _extract_text_from_image(self, image_path: str) -> str:
        """Extract text from image using TrOCR."""
        self._load_ocr_models()
        
        try:
            # Load and preprocess image
            image = Image.open(image_path).convert("RGB")
            
            # Process image
            pixel_values = self.ocr_processor(images=image, return_tensors="pt").pixel_values
            pixel_values = pixel_values.to(self.device)
            
            # Generate text
            generated_ids = self.ocr_model.generate(pixel_values)
            generated_text = self.ocr_processor.batch_decode(generated_ids, skip_special_tokens=True)[0]
            
            return generated_text.strip()
        except Exception as e:
            print(f"Error extracting text from image: {e}")
            raise
    
    def _transcribe_audio(self, audio_path: str) -> str:
        """Transcribe audio to text using Whisper."""
        self._load_whisper_models()
        
        try:
            # Load audio file
            audio, sr = librosa.load(audio_path, sr=16000)
            
            # Process audio
            inputs = self.whisper_processor(audio, sampling_rate=16000, return_tensors="pt")
            inputs = {k: v.to(self.device) for k, v in inputs.items()}
            
            # Generate transcription
            with torch.no_grad():
                generated_ids = self.whisper_model.generate(**inputs)
            
            transcription = self.whisper_processor.batch_decode(
                generated_ids, skip_special_tokens=True
            )[0]
            
            return transcription.strip()
        except Exception as e:
            print(f"Error transcribing audio: {e}")
            raise
    
    def _parse_text_to_transaction(self, text: str) -> Dict[str, Any]:
        """Parse extracted text to structured transaction data using LLM."""
        self._load_llm_models()
        
        # Create prompt for LLM
        prompt = f"""Extract transaction details from the following text and return ONLY a valid JSON object with these fields:
- amount (number, required)
- transaction_type ("income" or "expense", required)
- category (string, one of: Food, Fuel, Rent, Groceries, Maintenance, Phone, EMI, Misc, Delivery, Freelance, Salary, Other)
- merchant_name (string, optional)
- description (string, optional)
- payment_method (string, one of: UPI, Cash, Card, Bank Transfer, optional)
- location (string, optional)
- transaction_date (string in YYYY-MM-DD format, use today if not mentioned: 2024-01-15)
- transaction_time (string in HH:MM format, use current time if not mentioned: 14:30)

Text: {text}

Return ONLY the JSON object, no other text:"""
        
        try:
            # Tokenize input
            messages = [
                {"role": "system", "content": "You are a helpful assistant that extracts transaction information from text and returns only valid JSON."},
                {"role": "user", "content": prompt}
            ]
            
            # Format for Phi-3
            formatted_prompt = self.llm_tokenizer.apply_chat_template(
                messages, tokenize=False, add_generation_prompt=True
            )
            
            inputs = self.llm_tokenizer(formatted_prompt, return_tensors="pt").to(self.device)
            
            # Generate response
            with torch.no_grad():
                outputs = self.llm_model.generate(
                    **inputs,
                    max_new_tokens=256,
                    temperature=0.1,
                    do_sample=True,
                    pad_token_id=self.llm_tokenizer.eos_token_id
                )
            
            # Decode response
            response = self.llm_tokenizer.decode(outputs[0][inputs['input_ids'].shape[1]:], skip_special_tokens=True)
            
            # Extract JSON from response
            json_match = re.search(r'\{[^{}]*\}', response, re.DOTALL)
            if json_match:
                json_str = json_match.group(0)
                transaction_data = json.loads(json_str)
            else:
                # Fallback: try to parse the whole response
                transaction_data = json.loads(response.strip())
            
            # Validate and clean data
            return self._validate_and_clean_transaction(transaction_data, text)
            
        except json.JSONDecodeError as e:
            print(f"JSON parsing error: {e}")
            # Fallback: use regex-based extraction
            return self._regex_extract_transaction(text)
        except Exception as e:
            print(f"Error parsing text with LLM: {e}")
            # Fallback: use regex-based extraction
            return self._regex_extract_transaction(text)
    
    def _regex_extract_transaction(self, text: str) -> Dict[str, Any]:
        """Fallback: Extract transaction data using regex patterns."""
        from datetime import datetime
        
        result = {
            "amount": None,
            "transaction_type": "expense",
            "category": "Misc",
            "merchant_name": "",
            "description": text[:100],
            "payment_method": "",
            "location": "",
            "transaction_date": datetime.now().strftime("%Y-%m-%d"),
            "transaction_time": datetime.now().strftime("%H:%M"),
            "confidence": 0.5
        }
        
        # Extract amount (look for ₹, Rs, rupees, etc.)
        amount_patterns = [
            r'₹\s*(\d+(?:\.\d{2})?)',
            r'Rs\.?\s*(\d+(?:\.\d{2})?)',
            r'(\d+(?:\.\d{2})?)\s*(?:rupees|rs|₹)',
            r'(\d+(?:\.\d{2})?)\s*(?:paid|spent|received|earned)',
        ]
        
        for pattern in amount_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                try:
                    result["amount"] = float(match.group(1))
                    break
                except:
                    pass
        
        # Determine transaction type
        income_keywords = ["received", "earned", "income", "salary", "payment received"]
        expense_keywords = ["spent", "paid", "purchase", "bought", "expense"]
        
        text_lower = text.lower()
        if any(keyword in text_lower for keyword in income_keywords):
            result["transaction_type"] = "income"
        elif any(keyword in text_lower for keyword in expense_keywords):
            result["transaction_type"] = "expense"
        
        # Extract category keywords
        category_keywords = {
            "Food": ["food", "restaurant", "mcdonald", "pizza", "lunch", "dinner", "breakfast"],
            "Fuel": ["fuel", "petrol", "diesel", "gas", "gasoline"],
            "Groceries": ["grocery", "groceries", "supermarket", "big bazaar"],
            "Rent": ["rent", "rental"],
            "Maintenance": ["maintenance", "repair"],
            "Phone": ["phone", "mobile", "telecom"],
            "Delivery": ["delivery", "uber", "ola", "swiggy", "zomato"],
            "Freelance": ["freelance", "project", "client"],
        }
        
        for category, keywords in category_keywords.items():
            if any(keyword in text_lower for keyword in keywords):
                result["category"] = category
                break
        
        # Extract merchant name (look for common patterns)
        merchant_patterns = [
            r'(?:at|from|to)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)',
            r'([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:restaurant|store|shop)',
        ]
        
        for pattern in merchant_patterns:
            match = re.search(pattern, text)
            if match:
                result["merchant_name"] = match.group(1)
                break
        
        return result
    
    def _validate_and_clean_transaction(self, data: Dict[str, Any], original_text: str) -> Dict[str, Any]:
        """Validate and clean transaction data."""
        from datetime import datetime
        
        # Default values
        result = {
            "amount": None,
            "transaction_type": "expense",
            "category": "Misc",
            "merchant_name": "",
            "description": original_text[:100] if original_text else "",
            "payment_method": "",
            "location": "",
            "transaction_date": datetime.now().strftime("%Y-%m-%d"),
            "transaction_time": datetime.now().strftime("%H:%M"),
            "confidence": 0.7
        }
        
        # Validate amount
        if "amount" in data and data["amount"]:
            try:
                result["amount"] = float(data["amount"])
            except:
                pass
        
        # Validate transaction type
        if "transaction_type" in data:
            if data["transaction_type"].lower() in ["income", "expense"]:
                result["transaction_type"] = data["transaction_type"].lower()
        
        # Validate category
        valid_categories = [
            "Food", "Fuel", "Rent", "Groceries", "Maintenance", "Phone", 
            "EMI", "Misc", "Delivery", "Freelance", "Salary", "Other"
        ]
        if "category" in data and data["category"] in valid_categories:
            result["category"] = data["category"]
        
        # Copy other fields if present
        for field in ["merchant_name", "description", "payment_method", "location"]:
            if field in data and data[field]:
                result[field] = str(data[field])[:200]
        
        # Validate date
        if "transaction_date" in data and data["transaction_date"]:
            try:
                datetime.strptime(data["transaction_date"], "%Y-%m-%d")
                result["transaction_date"] = data["transaction_date"]
            except:
                pass
        
        # Validate time
        if "transaction_time" in data and data["transaction_time"]:
            try:
                datetime.strptime(data["transaction_time"], "%H:%M")
                result["transaction_time"] = data["transaction_time"]
            except:
                pass
        
        # Calculate confidence based on filled fields
        filled_fields = sum(1 for k, v in result.items() if v and k != "confidence")
        result["confidence"] = min(0.9, 0.5 + (filled_fields * 0.05))
        
        return result
    
    def parse_image(self, image_path: str) -> Dict[str, Any]:
        """
        Parse image (receipt/bill) to extract transaction details.
        
        Args:
            image_path: Path to the image file
            
        Returns:
            Dictionary with transaction fields:
            {
                "amount": float,
                "transaction_type": "income" | "expense",
                "category": str,
                "merchant_name": str,
                "description": str,
                "payment_method": str,
                "location": str,
                "transaction_date": "YYYY-MM-DD",
                "transaction_time": "HH:MM",
                "confidence": float (0-1)
            }
        """
        try:
            print(f"Processing image: {image_path}")
            
            # Step 1: Extract text from image
            extracted_text = self._extract_text_from_image(image_path)
            print(f"Extracted text: {extracted_text}")
            
            if not extracted_text or len(extracted_text.strip()) < 5:
                return {
                    "error": "Could not extract sufficient text from image. Please ensure the image is clear and contains readable text.",
                    "confidence": 0.0
                }
            
            # Step 2: Parse text to transaction data
            transaction_data = self._parse_text_to_transaction(extracted_text)
            
            print(f"Parsed transaction: {transaction_data}")
            return transaction_data
            
        except Exception as e:
            print(f"Error parsing image: {e}")
            return {
                "error": f"Failed to process image: {str(e)}",
                "confidence": 0.0
            }
    
    def parse_voice(self, audio_path: str) -> Dict[str, Any]:
        """
        Parse voice recording to extract transaction details.
        
        Args:
            audio_path: Path to the audio file (WAV, MP3, etc.)
            
        Returns:
            Dictionary with transaction fields (same format as parse_image)
        """
        try:
            print(f"Processing audio: {audio_path}")
            
            # Step 1: Transcribe audio to text
            transcribed_text = self._transcribe_audio(audio_path)
            print(f"Transcribed text: {transcribed_text}")
            
            if not transcribed_text or len(transcribed_text.strip()) < 5:
                return {
                    "error": "Could not transcribe audio. Please ensure the recording is clear.",
                    "confidence": 0.0
                }
            
            # Step 2: Parse text to transaction data
            transaction_data = self._parse_text_to_transaction(transcribed_text)
            
            print(f"Parsed transaction: {transaction_data}")
            return transaction_data
            
        except Exception as e:
            print(f"Error parsing voice: {e}")
            return {
                "error": f"Failed to process audio: {str(e)}",
                "confidence": 0.0
            }


# ============================================================================
# Example Usage
# ============================================================================

if __name__ == "__main__":
    parser = TransactionParser()
    
    # Example 1: Parse image
    # result = parser.parse_image("receipt.jpg")
    # print(json.dumps(result, indent=2))
    
    # Example 2: Parse voice
    # result = parser.parse_voice("recording.wav")
    # print(json.dumps(result, indent=2))

