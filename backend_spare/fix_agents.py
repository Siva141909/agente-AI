#!/usr/bin/env python3
"""
Fix all agent files to use correct Claude SDK imports
"""

import os

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
    """Fix imports and class usage in a single file"""
    if not os.path.exists(filepath):
        print(f"  ✗ File not found: {filepath}")
        return False

    with open(filepath, 'r') as f:
        content = f.read()

    # Track if any changes were made
    original_content = content

    # Replace imports
    content = content.replace(
        'from claude_agent_sdk import Agent, AgentOptions',
        'from claude_agent_sdk import ClaudeSDKClient, ClaudeAgentOptions'
    )

    # Replace return type hints
    content = content.replace(
        ') -> AgentOptions:',
        ') -> ClaudeAgentOptions:'
    )

    # Replace class instantiation in return statements
    content = content.replace(
        'return AgentOptions(',
        'return ClaudeAgentOptions('
    )

    # Replace agent variable assignment
    content = content.replace(
        'agent = Agent(self.agent_options)',
        'client = ClaudeSDKClient(self.agent_options)'
    )

    # Replace standalone Agent( calls
    content = content.replace(
        'agent = Agent(AgentOptions',
        'client = ClaudeSDKClient(ClaudeAgentOptions'
    )

    # Replace agent.run calls
    content = content.replace(
        'await agent.run(',
        'await client.run('
    )

    # Write back if changes were made
    if content != original_content:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"  ✓ Fixed: {filepath}")
        return True
    else:
        print(f"  ○ No changes needed: {filepath}")
        return False

def main():
    print("Fixing Claude SDK imports in all agent files...\n")

    fixed_count = 0
    for filepath in agent_files:
        if fix_file(filepath):
            fixed_count += 1

    print(f"\n{'='*60}")
    print(f"Fixed {fixed_count} out of {len(agent_files)} files")
    print(f"{'='*60}\n")

    if fixed_count > 0:
        print("✓ All agents updated successfully!")
        print("\nYou can now run:")
        print("  python main.py")
    else:
        print("No files needed updating.")

if __name__ == '__main__':
    main()
