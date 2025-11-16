"""
Pydantic schemas for AI Editor endpoints
Provides request validation with type safety and constraints
"""

from pydantic import BaseModel, Field, field_validator
from typing import Optional, List


class GenerateSceneRequest(BaseModel):
    """Schema for scene generation requests"""
    project_id: str = Field(..., min_length=1, max_length=100, description="Project ID")
    scene_id: Optional[str] = Field(None, max_length=100, description="Optional scene ID for context")
    prompt: str = Field(..., min_length=1, max_length=2000, description="Generation prompt")
    tone: str = Field(default="neutral", description="Tone of the scene")
    length: str = Field(default="medium", description="Length of generation")
    characters: Optional[List[str]] = Field(default=None, description="Character IDs to include")
    location_id: Optional[str] = Field(None, max_length=100, description="Location ID")

    @field_validator('tone')
    @classmethod
    def validate_tone(cls, v: str) -> str:
        valid_tones = ['neutral', 'dramatic', 'lighthearted', 'dark', 'action', 'contemplative']
        if v not in valid_tones:
            raise ValueError(f'Tone must be one of: {", ".join(valid_tones)}')
        return v

    @field_validator('length')
    @classmethod
    def validate_length(cls, v: str) -> str:
        valid_lengths = ['short', 'medium', 'long']
        if v not in valid_lengths:
            raise ValueError(f'Length must be one of: {", ".join(valid_lengths)}')
        return v

    @field_validator('prompt')
    @classmethod
    def validate_prompt(cls, v: str) -> str:
        if not v.strip():
            raise ValueError('Prompt cannot be empty or whitespace only')
        return v.strip()


class GenerateDialogueRequest(BaseModel):
    """Schema for dialogue generation requests"""
    project_id: str = Field(..., min_length=1, max_length=100)
    characters: List[str] = Field(..., min_length=1, max_length=10, description="Character names")
    situation: str = Field(..., min_length=1, max_length=1000, description="Dialogue situation")

    @field_validator('characters')
    @classmethod
    def validate_characters(cls, v: List[str]) -> List[str]:
        if len(v) < 1:
            raise ValueError('At least one character is required')
        if len(v) > 10:
            raise ValueError('Maximum 10 characters allowed')
        return v

    @field_validator('situation')
    @classmethod
    def validate_situation(cls, v: str) -> str:
        if not v.strip():
            raise ValueError('Situation cannot be empty')
        return v.strip()


class RewriteTextRequest(BaseModel):
    """Schema for text rewriting requests"""
    text: str = Field(..., min_length=1, max_length=10000, description="Text to rewrite")
    instruction: str = Field(..., min_length=1, max_length=500, description="Rewrite instruction")
    project_id: Optional[str] = Field(None, max_length=100)

    @field_validator('text', 'instruction')
    @classmethod
    def validate_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError('Field cannot be empty or whitespace only')
        return v.strip()


class ExpandTextRequest(BaseModel):
    """Schema for text expansion requests"""
    text: str = Field(..., min_length=1, max_length=10000, description="Text to expand")
    project_id: Optional[str] = Field(None, max_length=100)

    @field_validator('text')
    @classmethod
    def validate_text(cls, v: str) -> str:
        if not v.strip():
            raise ValueError('Text cannot be empty')
        return v.strip()


class SummarizeTextRequest(BaseModel):
    """Schema for text summarization requests"""
    text: str = Field(..., min_length=10, max_length=50000, description="Text to summarize")

    @field_validator('text')
    @classmethod
    def validate_text(cls, v: str) -> str:
        if not v.strip():
            raise ValueError('Text cannot be empty')
        if len(v.strip()) < 10:
            raise ValueError('Text must be at least 10 characters for summarization')
        return v.strip()


class ContinueWritingRequest(BaseModel):
    """Schema for continue writing requests"""
    text: str = Field(..., min_length=1, max_length=10000, description="Existing text")
    direction: Optional[str] = Field(default="", max_length=500, description="Direction for continuation")
    project_id: str = Field(..., min_length=1, max_length=100)
    scene_id: Optional[str] = Field(None, max_length=100)

    @field_validator('text')
    @classmethod
    def validate_text(cls, v: str) -> str:
        if not v.strip():
            raise ValueError('Text cannot be empty')
        return v.strip()
