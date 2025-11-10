"""
AI Editor Service
Context-aware text generation using Gemini AI
"""

import google.generativeai as genai
from typing import Dict, List, Optional

class AIEditorService:
    """Service for AI-powered text generation"""
    
    def __init__(self):
        self.model = None
        try:
            self.model = genai.GenerativeModel('gemini-pro')
        except Exception as e:
            print(f"Warning: Gemini model not initialized: {e}")
    
    def _build_context_prompt(self, context: Dict, request_type: str) -> str:
        """Build a context-aware prompt from Story Bible data"""
        prompt_parts = []
        
        # Add project context
        if 'project' in context:
            project = context['project']
            prompt_parts.append(f"Story: {project.get('title', 'Untitled')}")
            prompt_parts.append(f"Genre: {project.get('genre', 'Unknown')}")
            if project.get('description'):
                prompt_parts.append(f"Summary: {project.get('description')}")
        
        # Add character context
        if context.get('characters'):
            prompt_parts.append("\nCharacters:")
            for char in context['characters']:
                char_info = f"- {char.get('name', 'Unknown')}: {char.get('description', '')}"
                if char.get('traits'):
                    char_info += f" Traits: {', '.join(char.get('traits', []))}"
                prompt_parts.append(char_info)
        
        # Add location context
        if context.get('location'):
            loc = context['location']
            prompt_parts.append(f"\nLocation: {loc.get('name', 'Unknown')}")
            prompt_parts.append(f"Description: {loc.get('description', '')}")
        
        # Add plot context
        if context.get('plot_points'):
            prompt_parts.append("\nPlot Points:")
            for pp in context['plot_points']:
                prompt_parts.append(f"- {pp.get('title', '')}: {pp.get('description', '')}")
        
        # Add lore context
        if context.get('related_lore'):
            prompt_parts.append("\nRelevant Lore:")
            for lore in context['related_lore']:
                content = lore.get('content', '')[:200]
                prompt_parts.append(f"- {lore.get('title', '')}: {content}...")
        
        # Add existing scene content
        if context.get('scene') and context['scene'].get('content'):
            prompt_parts.append(f"\nExisting scene content:\n{context['scene'].get('content', '')}")
        
        return "\n".join(prompt_parts)
    
    def generate_scene(self, context: Dict, prompt: str, tone: str = "neutral", 
                      length: str = "medium") -> Dict:
        """Generate a new scene with context awareness"""
        if not self.model:
            return {
                'success': False,
                'error': 'AI model not initialized',
                'content': ''
            }
        
        try:
            context_prompt = self._build_context_prompt(context, 'scene')
            
            length_guidance = {
                'short': 'Write a brief scene (200-300 words)',
                'medium': 'Write a scene (400-600 words)',
                'long': 'Write a detailed scene (800-1000 words)'
            }
            
            tone_guidance = {
                'neutral': '',
                'dramatic': 'Use dramatic, intense prose.',
                'lighthearted': 'Keep the tone light and humorous.',
                'dark': 'Use dark, atmospheric prose.',
                'action': 'Focus on action and movement.',
                'contemplative': 'Use introspective, thoughtful prose.'
            }
            
            full_prompt = f"""You are a creative writing assistant. Using the following story context, generate a scene.

{context_prompt}

{length_guidance.get(length, length_guidance['medium'])}
{tone_guidance.get(tone, '')}

Writer's request: {prompt}

Write the scene in a narrative format, maintaining consistency with the established characters, locations, and lore."""

            response = self.model.generate_content(full_prompt)
            
            return {
                'success': True,
                'content': response.text,
                'context_used': context_prompt
            }
        
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'content': ''
            }
    
    def generate_dialogue(self, context: Dict, characters: List[str], 
                         situation: str) -> Dict:
        """Generate dialogue between characters"""
        if not self.model:
            return {
                'success': False,
                'error': 'AI model not initialized',
                'content': ''
            }
        
        try:
            context_prompt = self._build_context_prompt(context, 'dialogue')
            
            char_names = ", ".join(characters)
            full_prompt = f"""You are a creative writing assistant. Using the following story context, generate dialogue.

{context_prompt}

Generate a dialogue scene between {char_names} in this situation: {situation}

Write natural, character-consistent dialogue that advances the plot. Include minimal action beats and descriptions."""

            response = self.model.generate_content(full_prompt)
            
            return {
                'success': True,
                'content': response.text
            }
        
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'content': ''
            }
    
    def rewrite_text(self, text: str, instruction: str, context: Dict = None) -> Dict:
        """Rewrite existing text with specific instructions"""
        if not self.model:
            return {
                'success': False,
                'error': 'AI model not initialized',
                'content': text
            }
        
        try:
            context_prompt = ""
            if context:
                context_prompt = self._build_context_prompt(context, 'rewrite')
            
            full_prompt = f"""You are a creative writing assistant. Rewrite the following text according to the instruction.

{context_prompt if context_prompt else ''}

Original text:
{text}

Instruction: {instruction}

Provide only the rewritten text, maintaining the core meaning while applying the requested changes."""

            response = self.model.generate_content(full_prompt)
            
            return {
                'success': True,
                'content': response.text,
                'original': text
            }
        
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'content': text
            }
    
    def expand_text(self, text: str, context: Dict = None) -> Dict:
        """Expand text with more detail"""
        return self.rewrite_text(
            text, 
            "Expand this text with more detail, sensory descriptions, and narrative depth.",
            context
        )
    
    def summarize_text(self, text: str) -> Dict:
        """Summarize text"""
        return self.rewrite_text(text, "Summarize this text concisely.")
    
    def continue_writing(self, existing_text: str, context: Dict, 
                        direction: str = "") -> Dict:
        """Continue writing from existing text"""
        if not self.model:
            return {
                'success': False,
                'error': 'AI model not initialized',
                'content': ''
            }
        
        try:
            context_prompt = self._build_context_prompt(context, 'continue')
            
            full_prompt = f"""You are a creative writing assistant. Continue the following text naturally.

{context_prompt}

Existing text:
{existing_text}

{f'Continue in this direction: {direction}' if direction else 'Continue the narrative naturally.'}

Write 2-3 paragraphs that flow seamlessly from the existing text."""

            response = self.model.generate_content(full_prompt)
            
            return {
                'success': True,
                'content': response.text
            }
        
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'content': ''
            }
