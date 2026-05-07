"""
Financial Coaching Agent System with Claude Agent SDK
Multi-agent orchestration for gig worker financial analysis
"""
import anyio
import yaml
from pathlib import Path
from rich.console import Console
from rich.panel import Panel
from rich.markdown import Markdown

from claude_agent_sdk import (
    AgentDefinition,
    ClaudeAgentOptions,
    ClaudeSDKClient,
    AssistantMessage,
    ResultMessage,
    UserMessage,
    SystemMessage,
    TextBlock,
    ToolUseBlock,
    ToolResultBlock
)


class FinancialAgent:
    def __init__(self, agent_config_path: str = "configs/agent_config.yaml", mcp_config_path: str = ".mcp.json"):
        self.console = Console()
        self.project_root = Path(__file__).parent.parent

        # Load agent configuration
        config_path = self.project_root / agent_config_path
        self.config = self._load_config(config_path)

        # Set up MCP path
        self.mcp_path = str(self.project_root / mcp_config_path)

        # Session state
        self.client = None
        self.session_active = False

        # Extract configuration
        self.model = self.config['agents']['main_agent']['model']
        self.orchestrator_system_prompt = self.config['agents']['main_agent']['system_prompt']

        # Sub-agent configurations
        pattern_config = self.config['agents']['sub_agents']['pattern_agent']
        self.pattern_model = pattern_config['model']
        self.pattern_system_prompt = pattern_config['system_prompt']

        recommendation_config = self.config['agents']['sub_agents']['recommendation_agent']
        self.recommendation_model = recommendation_config['model']
        self.recommendation_system_prompt = recommendation_config['system_prompt']

        risk_config = self.config['agents']['sub_agents']['risk_agent']
        self.risk_model = risk_config['model']
        self.risk_system_prompt = risk_config['system_prompt']

        # PostgreSQL tools for sub-agents
        self.db_tools = [
            'mcp__postgres__query',
            'mcp__postgres__list-tables',
            'mcp__postgres__describe-table'
        ]

        # Main agent tools
        main_allowed_tools_config = self.config['agents']['main_agent'].get('allowed_tools', ['Task', 'TodoWrite'])
        self.main_allowed_tools = main_allowed_tools_config if isinstance(main_allowed_tools_config, list) else ['Task', 'TodoWrite']

        self.agent_options = self.initialize_agent_options()

    def _load_config(self, config_path: Path) -> dict:
        """Load agent configuration from YAML file."""
        try:
            with open(config_path, 'r') as f:
                config = yaml.safe_load(f)
            self.console.print(f"[green]OK[/green] Loaded configuration from: {config_path}")
            return config
        except FileNotFoundError:
            self.console.print(f"[red]ERROR[/red] Configuration file not found: {config_path}")
            raise
        except yaml.YAMLError as e:
            self.console.print(f"[red]ERROR[/red] Error parsing YAML configuration: {e}")
            raise

    def initialize_agent_options(self):
        """Initialize Claude Agent options with sub-agent definitions."""
        pattern_agent_definition = AgentDefinition(
            model=self.pattern_model,
            prompt=self.pattern_system_prompt,
            description="Pattern recognition specialist for analyzing gig worker income and expenses",
            tools=self.db_tools
        )

        recommendation_agent_definition = AgentDefinition(
            model=self.recommendation_model,
            prompt=self.recommendation_system_prompt,
            description="Financial recommendation specialist for personalized advice to gig workers",
            tools=self.db_tools
        )

        risk_agent_definition = AgentDefinition(
            model=self.risk_model,
            prompt=self.risk_system_prompt,
            description="Financial risk assessment specialist for identifying and mitigating risks",
            tools=self.db_tools
        )

        agent_options = ClaudeAgentOptions(
            model=self.model,
            mcp_servers=self.mcp_path,
            agents={
                "pattern_agent": pattern_agent_definition,
                "recommendation_agent": recommendation_agent_definition,
                "risk_agent": risk_agent_definition
            },
            allowed_tools=self.main_allowed_tools,
            system_prompt=self.orchestrator_system_prompt,
            permission_mode="bypassPermissions"  # Auto-grant permissions for MCP tools
        )

        self.console.print(f"[green]OK[/green] Initialized main orchestrator with model: [cyan]{self.model}[/cyan]")
        self.console.print(f"[green]OK[/green] Pattern agent configured: [cyan]{self.pattern_model}[/cyan]")
        self.console.print(f"[green]OK[/green] Recommendation agent configured: [cyan]{self.recommendation_model}[/cyan]")
        self.console.print(f"[green]OK[/green] Risk agent configured: [cyan]{self.risk_model}[/cyan]")
        return agent_options

    async def start_session(self):
        """Start a new conversation session."""
        if self.session_active:
            self.console.print("[yellow]WARNING[/yellow] Session already active")
            return

        self.client = ClaudeSDKClient(options=self.agent_options)
        await self.client.connect()
        self.session_active = True
        self.console.print("[green]OK[/green] Session started")

    async def end_session(self):
        """End the current conversation session."""
        if not self.session_active:
            return

        if self.client:
            await self.client.__aexit__(None, None, None)
            self.client = None

        self.session_active = False
        self.console.print("\n[green]OK[/green] Session ended")

    async def interactive_session(self, show_tool_calls: bool = True):
        """Start an interactive multi-turn conversation session."""
        self.console.print("\n" + "="*60)
        self.console.print("[bold magenta]Financial Coaching Agent Session[/bold magenta]", justify="center")
        self.console.print("="*60)
        self.console.print("\n[dim]Commands:[/dim]")
        self.console.print("  [cyan]exit[/cyan] or [cyan]quit[/cyan] - End the session")
        self.console.print("  [cyan]clear[/cyan] - Clear the screen")
        self.console.print("")

        await self.start_session()

        try:
            while True:
                # Get user input
                try:
                    query = input("\n[You] > ").strip()
                except (EOFError, KeyboardInterrupt):
                    self.console.print("\n\n[yellow]Session interrupted[/yellow]")
                    break

                if not query:
                    continue

                # Handle special commands
                if query.lower() in ['exit', 'quit']:
                    break
                elif query.lower() == 'clear':
                    self.console.clear()
                    continue

                # Process the query
                try:
                    await self.run_query(query, show_system_messages=False, show_tool_calls=show_tool_calls, use_session=True)
                except Exception as e:
                    self.console.print(f"\n[bold red]ERROR:[/bold red] {str(e)}")
                    self.console.print("[yellow]You can continue the conversation or type 'exit' to quit[/yellow]")

        finally:
            await self.end_session()

    async def run_query(self, query: str, show_system_messages: bool = False, show_tool_calls: bool = True, use_session: bool = False):
        """Run a query through the agent and display formatted responses."""
        # Display query
        self.console.print(Panel(
            f"[bold cyan]{query}[/bold cyan]",
            title="[bold]Query[/bold]",
            border_style="cyan"
        ))

        if use_session:
            # Use existing session
            if not self.session_active:
                raise RuntimeError("No active session. Call start_session() first.")
            await self.client.query(prompt=query)
            async for message in self.client.receive_response():
                self._process_message(message, show_system_messages, show_tool_calls)
        else:
            # One-off query with temporary session
            async with ClaudeSDKClient(options=self.agent_options) as client:
                await client.query(prompt=query)
                async for message in client.receive_response():
                    self._process_message(message, show_system_messages, show_tool_calls)

    def _process_message(self, message, show_system_messages: bool, show_tool_calls: bool):
        """Process and display a single message from the agent."""
        if isinstance(message, SystemMessage):
            if show_system_messages:
                self._display_system_message(message)

        elif isinstance(message, AssistantMessage):
            self._display_assistant_message(message, show_tool_calls)

        elif isinstance(message, UserMessage):
            if show_tool_calls:
                self._display_tool_results(message)

        elif isinstance(message, ResultMessage):
            self._display_result_message(message)

        else:
            self.console.print(f"\n[dim]Unknown Message Type: {type(message).__name__}[/dim]")
            self.console.print(message)

    def _display_system_message(self, message: SystemMessage):
        """Display system initialization message."""
        info = f"Session: {message.data.get('session_id', 'N/A')[:8]}...\n"
        info += f"Model: {message.data.get('model', 'N/A')}\n"
        info += f"MCP Servers: {', '.join([s['name'] for s in message.data.get('mcp_servers', [])])}"

        self.console.print(Panel(
            info,
            title="[bold]System Initialized[/bold]",
            border_style="dim"
        ))

    def _display_assistant_message(self, message: AssistantMessage, show_tool_calls: bool):
        """Display assistant message with text and tool usage."""
        for block in message.content:
            if isinstance(block, TextBlock):
                md = Markdown(block.text)
                self.console.print(Panel(
                    md,
                    title="[bold]Agent Response[/bold]",
                    border_style="blue"
                ))

            elif isinstance(block, ToolUseBlock) and show_tool_calls:
                tool_info = f"[bold cyan]Tool:[/bold cyan] {block.name}\n"
                if block.input:
                    tool_info += f"[bold cyan]Input:[/bold cyan]\n"
                    for key, value in block.input.items():
                        # Truncate long values
                        val_str = str(value)
                        if len(val_str) > 100:
                            val_str = val_str[:100] + "..."
                        tool_info += f"  - {key}: {val_str}\n"

                self.console.print(Panel(
                    tool_info.strip(),
                    title="[bold]Tool Call[/bold]",
                    border_style="yellow"
                ))

    def _display_tool_results(self, message: UserMessage):
        """Display tool execution results."""
        for block in message.content:
            if isinstance(block, ToolResultBlock):
                result_text = ""

                for content_item in block.content:
                    if isinstance(content_item, dict) and content_item.get('type') == 'text':
                        text = content_item.get('text', '')
                        # Skip warnings
                        if 'WARNING:' not in text and 'untrusted-user-data' not in text:
                            result_text += text + '\n'

                if result_text.strip():
                    # Truncate long results
                    if len(result_text) > 500:
                        result_text = result_text[:500] + "\n... (truncated)"

                    self.console.print(Panel(
                        result_text.strip(),
                        title=f"[bold]Tool Result[/bold]",
                        border_style="magenta"
                    ))

    def _display_result_message(self, message: ResultMessage):
        """Display final result with performance statistics."""
        md = Markdown(message.result)
        self.console.print(Panel(
            md,
            title="[bold]Final Response[/bold]",
            border_style="green"
        ))

        # Display performance stats
        stats = f"[bold]Performance[/bold]\n"
        stats += f"Duration: {message.duration_ms}ms (API: {message.duration_api_ms}ms)\n"
        stats += f"Turns: {message.num_turns}\n"
        stats += f"Cost: ${message.total_cost_usd:.4f}\n"

        if hasattr(message, 'usage') and message.usage:
            stats += f"\n[bold]Tokens[/bold]\n"
            usage = message.usage
            stats += f"Input: {usage.get('input_tokens', 0):,}\n"
            stats += f"Output: {usage.get('output_tokens', 0):,}\n"

        self.console.print(Panel(
            stats.strip(),
            title="[bold]Statistics[/bold]",
            border_style="cyan"
        ))


if __name__ == "__main__":
    import sys
    console = Console()

    console.print("\n" + "="*60)
    console.print(" "*10 + "[bold magenta]Financial Coaching Agent System[/bold magenta]")
    console.print("="*60 + "\n")

    interactive_mode = "--interactive" in sys.argv or "-i" in sys.argv

    try:
        console.print("[yellow]Initializing Financial Coaching Agent...[/yellow]")
        agent = FinancialAgent()
        console.print("\n[bold green]OK Financial Coaching Agent initialized![/bold green]\n")

        if interactive_mode:
            anyio.run(agent.interactive_session)
        else:
            console.print("[dim]Tip: Use --interactive or -i flag for multi-turn conversation mode[/dim]\n")
            query = "Analyze my financial situation for user ID 153735c8-b1e3-4fc6-aa4e-7deb6454990b"
            anyio.run(agent.run_query, query)

    except Exception as e:
        console.print(f"\n[bold red]ERROR: {type(e).__name__}[/bold red]")
        console.print(f"[red]{str(e)}[/red]")
        import traceback
        traceback.print_exc()
