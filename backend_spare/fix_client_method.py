#!/usr/bin/env python3
"""
Fix all agent files to use client.query() instead of client.run()
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
    """Fix the agent file to use client.query() instead of client.run()"""
    if not os.path.exists(filepath):
        print(f"  X File not found: {filepath}")
        return False

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    # Replace client.run( with client.query(
    content = content.replace('await client.run(', 'await client.query(')
    content = content.replace('client.run(', 'client.query(')

    # Replace agent.run( with agent.query( (if any)
    content = content.replace('await agent.run(', 'await agent.query(')
    content = content.replace('agent.run(', 'agent.query(')

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
    print("Fixing client.run() -> client.query() in all agent files...\n")

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
        print("  - client.run() -> client.query()")
        print("\nRestart the backend to test:")
        print("  python main.py")
    else:
        print("No files needed updating.")

if __name__ == '__main__':
    main()
