#!/usr/bin/env python3
"""
Fix all agent files to call client.connect() before client.query()
"""

import os
import re

# List of all agent files to fix
agent_files = [
    'agents/pattern_agent.py',
    'agents/budget_agent.py',
    'agents/context_agent.py',
    'agents/volatility_agent.py',
    'agents/knowledge_agent.py',
    'agents/tax_agent.py',
    'agents/recommendation_agent.py',
    'agents/risk_agent.py',
    'agents/action_agent.py'
]

def fix_file(filepath):
    """Add client.connect() before client.query()"""
    if not os.path.exists(filepath):
        print(f"  X File not found: {filepath}")
        return False

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    # Pattern: Find "client = ClaudeSDKClient(...)" and add connect() after it
    # Look for the pattern where we create client and then immediately use it
    pattern = r'(client = ClaudeSDKClient\(self\.agent_options\)\s*\n\s*try:)'
    replacement = r'client = ClaudeSDKClient(self.agent_options)\n\n        try:\n            # Connect to MCP servers\n            await client.connect()'

    content = re.sub(pattern, replacement, content)

    # Write back if changes were made
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  + Fixed: {filepath}")
        return True
    else:
        print(f"  - No changes needed: {filepath}")
        return False

def main():
    print("Adding client.connect() to all agent files...\n")

    fixed_count = 0
    for filepath in agent_files:
        if fix_file(filepath):
            fixed_count += 1

    print(f"\n{'='*60}")
    print(f"Fixed {fixed_count} out of {len(agent_files)} files")
    print(f"{'='*60}\n")

    if fixed_count > 0:
        print("+ All agents updated successfully!")
        print("\nChanges made:")
        print("  - Added await client.connect() before client.query()")
        print("\nRestart the backend to test:")
        print("  python main.py")
    else:
        print("No files needed updating.")

if __name__ == '__main__':
    main()
