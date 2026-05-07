#!/usr/bin/env python3
"""Test Claude SDK to see correct usage"""

from claude_agent_sdk import ClaudeAgentOptions, ClaudeSDKClient
import inspect

print("="*60)
print("ClaudeAgentOptions Signature:")
print("="*60)
sig = inspect.signature(ClaudeAgentOptions.__init__)
print(f"Parameters: {list(sig.parameters.keys())}\n")

for param_name, param in sig.parameters.items():
    if param_name != 'self':
        print(f"  - {param_name}: {param.annotation if param.annotation != inspect.Parameter.empty else 'Any'}")
        if param.default != inspect.Parameter.empty:
            print(f"    Default: {param.default}")

print("\n" + "="*60)
print("Testing ClaudeAgentOptions creation:")
print("="*60)

try:
    # Test 1: With model only
    print("\nTest 1: Basic options with model")
    options = ClaudeAgentOptions(model="claude-sonnet-4-5")
    print("✓ Success with just model")
except Exception as e:
    print(f"✗ Failed: {e}")

try:
    # Test 2: With mcp_config_path
    print("\nTest 2: With mcp_config_path")
    options = ClaudeAgentOptions(
        model="claude-sonnet-4-5",
        mcp_config_path=".mcp.json"
    )
    print("✓ Success with model and mcp_config_path")
except Exception as e:
    print(f"✗ Failed: {e}")

try:
    # Test 3: With system_prompt
    print("\nTest 3: With system_prompt")
    options = ClaudeAgentOptions(
        model="claude-sonnet-4-5",
        system_prompt="You are a helpful assistant"
    )
    print("✓ Success with model and system_prompt")
except Exception as e:
    print(f"✗ Failed: {e}")

print("\n" + "="*60)
print("Available attributes on ClaudeAgentOptions:")
print("="*60)
options = ClaudeAgentOptions(model="claude-sonnet-4-5")
attrs = [attr for attr in dir(options) if not attr.startswith('_')]
for attr in attrs:
    print(f"  - {attr}")

print("\n" + "="*60)
print("Checking ClaudeSDKClient:")
print("="*60)
sig = inspect.signature(ClaudeSDKClient.__init__)
print(f"Parameters: {list(sig.parameters.keys())}")
