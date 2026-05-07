"""
Test script for Transaction Parser
===================================

This script demonstrates how to use the transaction parser for both
image and voice inputs.

Usage:
    python test_transaction_parser.py
"""

import json
from transaction_parser import TransactionParser

def test_image_parsing():
    """Test image parsing with a sample receipt."""
    print("\n" + "="*60)
    print("TESTING IMAGE PARSING")
    print("="*60)
    
    parser = TransactionParser()
    
    # Replace with your actual image path
    image_path = "sample_receipt.jpg"  # Change this to your image path
    
    try:
        result = parser.parse_image(image_path)
        print("\nResult:")
        print(json.dumps(result, indent=2))
        
        if "error" in result:
            print(f"\n❌ Error: {result['error']}")
        else:
            print(f"\n✅ Success! Confidence: {result.get('confidence', 0):.2%}")
            print(f"   Amount: ₹{result.get('amount', 'N/A')}")
            print(f"   Type: {result.get('transaction_type', 'N/A')}")
            print(f"   Category: {result.get('category', 'N/A')}")
    except FileNotFoundError:
        print(f"\n❌ Image file not found: {image_path}")
        print("   Please provide a valid image path")
    except Exception as e:
        print(f"\n❌ Error: {e}")


def test_voice_parsing():
    """Test voice parsing with a sample audio file."""
    print("\n" + "="*60)
    print("TESTING VOICE PARSING")
    print("="*60)
    
    parser = TransactionParser()
    
    # Replace with your actual audio path
    audio_path = "sample_recording.wav"  # Change this to your audio path
    
    try:
        result = parser.parse_voice(audio_path)
        print("\nResult:")
        print(json.dumps(result, indent=2))
        
        if "error" in result:
            print(f"\n❌ Error: {result['error']}")
        else:
            print(f"\n✅ Success! Confidence: {result.get('confidence', 0):.2%}")
            print(f"   Amount: ₹{result.get('amount', 'N/A')}")
            print(f"   Type: {result.get('transaction_type', 'N/A')}")
            print(f"   Category: {result.get('category', 'N/A')}")
    except FileNotFoundError:
        print(f"\n❌ Audio file not found: {audio_path}")
        print("   Please provide a valid audio path")
    except Exception as e:
        print(f"\n❌ Error: {e}")


def test_text_parsing_directly():
    """Test text parsing directly (for debugging)."""
    print("\n" + "="*60)
    print("TESTING TEXT PARSING (DIRECT)")
    print("="*60)
    
    parser = TransactionParser()
    
    # Sample texts to test
    test_texts = [
        "I spent 500 rupees on food at McDonald's today",
        "Received 2000 from Uber delivery",
        "Paid 1500 for fuel at Indian Oil",
        "Bought groceries worth 800 rupees from Big Bazaar",
        "₹1200 debited from account for rent payment"
    ]
    
    for i, text in enumerate(test_texts, 1):
        print(f"\n--- Test {i} ---")
        print(f"Input text: {text}")
        
        try:
            result = parser._parse_text_to_transaction(text)
            print(f"Amount: ₹{result.get('amount', 'N/A')}")
            print(f"Type: {result.get('transaction_type', 'N/A')}")
            print(f"Category: {result.get('category', 'N/A')}")
            print(f"Merchant: {result.get('merchant_name', 'N/A')}")
            print(f"Confidence: {result.get('confidence', 0):.2%}")
        except Exception as e:
            print(f"❌ Error: {e}")


if __name__ == "__main__":
    print("\n" + "="*60)
    print("TRANSACTION PARSER - TEST SCRIPT")
    print("="*60)
    print("\nThis script tests the transaction parser functionality.")
    print("Make sure you have:")
    print("  1. Installed all requirements (pip install -r transaction_parser_requirements.txt)")
    print("  2. Set your Hugging Face token in transaction_parser.py")
    print("  3. Have sample image/audio files ready (or use text parsing test)")
    print("\n" + "-"*60)
    
    # Uncomment the test you want to run:
    
    # Test 1: Image parsing (requires image file)
    # test_image_parsing()
    
    # Test 2: Voice parsing (requires audio file)
    # test_voice_parsing()
    
    # Test 3: Direct text parsing (no files needed, good for quick testing)
    test_text_parsing_directly()
    
    print("\n" + "="*60)
    print("Testing complete!")
    print("="*60 + "\n")

