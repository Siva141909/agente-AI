#!/usr/bin/env python3
"""
Fix all remaining agent files to call client.connect()
"""

import os

# List of all agent files to fix (excluding pattern_agent.py which is already fixed)
agent_files = [
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
    """Add client.connect() after ClaudeSDKClient instantiation"""
    if not os.path.exists(filepath):
        print(f"  X File not found: {filepath}")
        return False

    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    modified = False
    new_lines = []
    i = 0

    while i < len(lines):
        line = lines[i]
        new_lines.append(line)

        # Look for "client = ClaudeSDKClient(self.agent_options)"
        if 'client = ClaudeSDKClient(self.agent_options)' in line:
            # Check if next few lines already have connect()
            next_5_lines = ''.join(lines[i:min(i+6, len(lines))])
            if 'await client.connect()' not in next_5_lines:
                # Find the try: block
                j = i + 1
                while j < len(lines) and 'try:' not in lines[j]:
                    new_lines.append(lines[j])
                    j += 1

                if j < len(lines):
                    # Add try: line
                    new_lines.append(lines[j])
                    j += 1

                    # Add connect() call with proper indentation
                    indent = '            '  # 12 spaces to match try block content
                    new_lines.append(f'{indent}# Connect to MCP servers\n')
                    new_lines.append(f'{indent}await client.connect()\n')
                    new_lines.append('\n')

                    i = j
                    modified = True
                    continue

        i += 1

    if modified:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.writelines(new_lines)
        print(f"  + Fixed: {filepath}")
        return True
    else:
        print(f"  - No changes needed: {filepath}")
        return False

def main():
    print("Adding client.connect() to remaining agent files...\n")

    fixed_count = 0
    for filepath in agent_files:
        if fix_file(filepath):
            fixed_count += 1

    print(f"\n{'='*60}")
    print(f"Fixed {fixed_count} out of {len(agent_files)} files")
    print(f"{'='*60}\n")

    if fixed_count > 0:
        print("+ All agents updated successfully!")
        print("\nRestart backend to test:")
        print("  python main.py")
    else:
        print("All files already have connect() calls.")

if __name__ == '__main__':
    main()
