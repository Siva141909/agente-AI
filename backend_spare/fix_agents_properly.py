#!/usr/bin/env python3
"""
Fix all agent files to use correct Claude SDK parameters
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
    """Fix the agent file to use correct SDK parameters"""
    if not os.path.exists(filepath):
        print(f"  X File not found: {filepath}")
        return False

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    # Fix 1: Replace mcp_config_path parameter name with mcp_servers
    content = re.sub(
        r'def __init__\(self, mcp_config_path: str = "\.mcp\.json"\):',
        'def __init__(self, mcp_servers: str = ".mcp.json"):',
        content
    )

    # Fix 2: Replace self.mcp_config_path with self.mcp_servers
    content = content.replace(
        'self.mcp_config_path = mcp_config_path',
        'self.mcp_servers = mcp_servers'
    )

    # Fix 3: Replace mcp_config_path=self.mcp_config_path with mcp_servers=self.mcp_servers
    content = content.replace(
        'mcp_config_path=self.mcp_config_path',
        'mcp_servers=self.mcp_servers'
    )

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
    print("Fixing Claude SDK parameters in all agent files...\n")

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
        print("  - mcp_config_path -> mcp_servers")
        print("\nYou can now run:")
        print("  python main.py")
    else:
        print("No files needed updating.")

if __name__ == '__main__':
    main()
