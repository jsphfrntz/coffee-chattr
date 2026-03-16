"""Agentic chat loop using the Anthropic SDK with tool use."""

import json
import os

import anthropic

from .tools import TOOL_DEFINITIONS, execute_tool

MODEL = "claude-sonnet-4-20250514"
MAX_TOOL_ROUNDS = 10


def build_system_prompt(user) -> str:
    """Build a context-rich system prompt for the agent."""
    from ..models.career_goal import CareerGoal

    goals = CareerGoal.query.filter_by(user_id=user.id, is_active=True).all()
    goals_text = ""
    if goals:
        goals_text = "\n\nActive career goals:\n"
        for g in goals:
            goals_text += f"- {g.label}"
            if g.target_industries:
                goals_text += f" | Industries: {', '.join(g.target_industries)}"
            if g.target_roles:
                goals_text += f" | Roles: {', '.join(g.target_roles)}"
            if g.narrative:
                goals_text += f"\n  Narrative: {g.narrative[:200]}"
            goals_text += "\n"

    return f"""You are CoffeeChattr, an AI recruiting assistant for Columbia Business School students. You help with job discovery, alumni outreach, resume management, and interview preparation.

Current user: {user.full_name or user.email}
Graduation year: {user.graduation_year or 'Not set'}
{goals_text}
Guidelines:
- Be concise, warm, and action-oriented. You're a knowledgeable career advisor who gets things done.
- When the user describes a career interest, proactively offer to create a career goal.
- When they mention a job or company, offer to add it to their pipeline.
- Use tools to actually do things — don't just describe what you could do.
- Reference their career narrative and goals when giving advice.
- If the user asks about their pipeline or stats, pull the data with tools before answering.
- Keep responses short and punchy — these are busy MBA students.
- Never fabricate data. If you don't have info, say so and offer to help find it.
"""


def run_chat(user, messages: list[dict]) -> dict:
    """Run the agentic chat loop. Returns the assistant's final response and tool actions taken.

    Args:
        user: The authenticated User model instance
        messages: List of {"role": "user"|"assistant", "content": "..."} messages

    Returns:
        {"response": str, "tool_actions": list[dict]}
    """
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        return {
            "response": "The Anthropic API key is not configured. Please add ANTHROPIC_API_KEY to your .env file.",
            "tool_actions": [],
        }

    client = anthropic.Anthropic(api_key=api_key)
    system_prompt = build_system_prompt(user)
    tool_actions = []

    # Convert simple message format to Anthropic format
    api_messages = []
    for msg in messages:
        api_messages.append({
            "role": msg["role"],
            "content": msg["content"],
        })

    for _round in range(MAX_TOOL_ROUNDS):
        response = client.messages.create(
            model=MODEL,
            max_tokens=2048,
            system=system_prompt,
            tools=TOOL_DEFINITIONS,
            messages=api_messages,
        )

        # Check if the model wants to use tools
        if response.stop_reason == "tool_use":
            # Collect all content blocks
            assistant_content = []
            tool_uses = []

            for block in response.content:
                if block.type == "text":
                    assistant_content.append({
                        "type": "text",
                        "text": block.text,
                    })
                elif block.type == "tool_use":
                    assistant_content.append({
                        "type": "tool_use",
                        "id": block.id,
                        "name": block.name,
                        "input": block.input,
                    })
                    tool_uses.append(block)

            # Add assistant message with tool use
            api_messages.append({
                "role": "assistant",
                "content": assistant_content,
            })

            # Execute tools and build tool results
            tool_results = []
            for tool_use in tool_uses:
                result = execute_tool(tool_use.name, tool_use.input, user.id)
                tool_actions.append({
                    "tool": tool_use.name,
                    "input": tool_use.input,
                    "result_preview": str(result)[:200],
                })
                tool_results.append({
                    "type": "tool_result",
                    "tool_use_id": tool_use.id,
                    "content": json.dumps(result) if not isinstance(result, str) else result,
                })

            api_messages.append({
                "role": "user",
                "content": tool_results,
            })

            # Continue the loop for the next Claude call
            continue

        # No more tool calls — extract final text
        final_text = ""
        for block in response.content:
            if block.type == "text":
                final_text += block.text

        return {
            "response": final_text,
            "tool_actions": tool_actions,
        }

    # Exhausted rounds
    return {
        "response": "I've hit my action limit for this turn. Could you break your request into smaller steps?",
        "tool_actions": tool_actions,
    }
