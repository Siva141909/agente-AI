"""
Transaction Parser - Using Hugging Face Inference API
======================================================

This version uses Hugging Face Inference API instead of local models.
No PyTorch installation needed - perfect for avoiding DLL issues!

Usage:
    parser = TransactionParser()
    result = parser.parse_image("receipt.jpg")
    result = parser.parse_voice("recording.wav")
"""

import os
import json
import re
import base64
from typing import Dict, Optional, Any
from pathlib import Path
from PIL import Image
import requests

# Hugging Face token (get from environment variable)
HF_TOKEN = os.getenv("HUGGINGFACE_TOKEN", None)
HF_API_BASE = "https://api-inference.huggingface.co/models"

class TransactionParser:
    """Main parser class using Hugging Face Inference API."""
    
    def __init__(self):
        """Initialize with API endpoints."""
        self.headers = {"Authorization": f"Bearer {HF_TOKEN}"}
        print("Using Hugging Face Inference API (no local models needed)")
    
    def _call_inference_api(self, model: str, inputs: Any, task: str = None) -> Dict:
        """Call Hugging Face Inference API."""
        url = f"{HF_API_BASE}/{model}"
        if task:
            url += f"?task={task}"
        
        try:
            response = requests.post(url, headers=self.headers, json=inputs, timeout=60)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"API Error: {e}")
            if hasattr(e.response, 'text'):
                print(f"Response: {e.response.text}")
            raise
    
    def _extract_text_from_image(self, image_path: str) -> str:
        """Extract text from image using TrOCR via Inference API."""
        try:
            # Read and encode image
            with open(image_path, "rb") as f:
                image_data = base64.b64encode(f.read()).decode()
            
            # Call TrOCR API
            result = self._call_inference_api(
                "microsoft/trocr-base-printed",
                {"inputs": image_data}
            )
            
            # Extract text from response
            if isinstance(result, list) and len(result) > 0:
                text = result[0].get("generated_text", "")
            elif isinstance(result, dict):
                text = result.get("generated_text", "")
            else:
                text = str(result)
            
            return text.strip()
        except Exception as e:
            print(f"Error extracting text from image: {e}")
            raise
    
    def _transcribe_audio(self, audio_path: str) -> str:
        """Transcribe audio to text using Whisper via Inference API."""
        try:
            # Read audio file
            with open(audio_path, "rb") as f:
                audio_data = f.read()
            
            # Call Whisper API
            url = f"{HF_API_BASE}/openai/whisper-small"
            response = requests.post(
                url,
                headers=self.headers,
                data=audio_data,
                timeout=120
            )
            response.raise_for_status()
            result = response.json()
            
            # Extract transcription
            if isinstance(result, dict):
                text = result.get("text", "")
            else:
                text = str(result)
            
            return text.strip()
        except Exception as e:
            print(f"Error transcribing audio: {e}")
            raise
    
    def _parse_text_to_transaction(self, text: str) -> Dict[str, Any]:
        """Parse extracted text to structured transaction data using LLM via Inference API."""
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
            # Use a text generation model via Inference API
            # Using a smaller, faster model for parsing
            result = self._call_inference_api(
                "microsoft/Phi-3-mini-4k-instruct",
                {
                    "inputs": prompt,
                    "parameters": {
                        "max_new_tokens": 256,
                        "temperature": 0.1,
                        "return_full_text": False
                    }
                }
            )
            
            # Extract response text
            if isinstance(result, list) and len(result) > 0:
                response_text = result[0].get("generated_text", "")
            elif isinstance(result, dict):
                response_text = result.get("generated_text", "")
            else:
                response_text = str(result)
            
            # Extract JSON from response
            json_match = re.search(r'\{[^{}]*\}', response_text, re.DOTALL)
            if json_match:
                json_str = json_match.group(0)
                transaction_data = json.loads(json_str)
            else:
                # Fallback: try to parse the whole response
                transaction_data = json.loads(response_text.strip())
            
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
            Dictionary with transaction fields
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


