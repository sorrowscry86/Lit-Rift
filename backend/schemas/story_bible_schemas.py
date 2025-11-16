"""
Pydantic schemas for Story Bible endpoints
Provides request validation for characters, locations, lore, etc.
"""

from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Dict


class CreateProjectRequest(BaseModel):
    """Schema for project creation"""
    title: str = Field(..., min_length=1, max_length=200, description="Project title")
    author: Optional[str] = Field(default="", max_length=100, description="Author name")
    genre: Optional[str] = Field(default="", max_length=50, description="Genre")
    description: Optional[str] = Field(default="", max_length=2000, description="Project description")
    target_word_count: Optional[int] = Field(default=50000, ge=1000, le=1000000, description="Target word count")

    @field_validator('title')
    @classmethod
    def validate_title(cls, v: str) -> str:
        if not v.strip():
            raise ValueError('Title cannot be empty')
        return v.strip()


class CreateCharacterRequest(BaseModel):
    """Schema for character creation"""
    name: str = Field(..., min_length=1, max_length=100, description="Character name")
    description: Optional[str] = Field(default="", max_length=2000, description="Character description")
    traits: Optional[List[str]] = Field(default_factory=list, max_length=20, description="Character traits")
    backstory: Optional[str] = Field(default="", max_length=5000, description="Character backstory")
    relationships: Optional[Dict[str, str]] = Field(default_factory=dict, description="Relationships")
    appearances: Optional[List[str]] = Field(default_factory=list, description="Scene IDs where character appears")
    notes: Optional[str] = Field(default="", max_length=2000, description="Additional notes")

    @field_validator('name')
    @classmethod
    def validate_name(cls, v: str) -> str:
        if not v.strip():
            raise ValueError('Character name cannot be empty')
        return v.strip()

    @field_validator('traits')
    @classmethod
    def validate_traits(cls, v: List[str]) -> List[str]:
        if v and len(v) > 20:
            raise ValueError('Maximum 20 traits allowed')
        return [trait.strip() for trait in v if trait.strip()]


class UpdateCharacterRequest(BaseModel):
    """Schema for character updates"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=2000)
    traits: Optional[List[str]] = Field(None, max_length=20)
    backstory: Optional[str] = Field(None, max_length=5000)
    relationships: Optional[Dict[str, str]] = None
    notes: Optional[str] = Field(None, max_length=2000)


class CreateLocationRequest(BaseModel):
    """Schema for location creation"""
    name: str = Field(..., min_length=1, max_length=100, description="Location name")
    description: Optional[str] = Field(default="", max_length=2000, description="Location description")
    type: Optional[str] = Field(default="", max_length=50, description="Location type")
    parent_location_id: Optional[str] = Field(None, max_length=100, description="Parent location ID")
    attributes: Optional[Dict[str, str]] = Field(default_factory=dict, description="Custom attributes")
    notes: Optional[str] = Field(default="", max_length=2000, description="Additional notes")

    @field_validator('name')
    @classmethod
    def validate_name(cls, v: str) -> str:
        if not v.strip():
            raise ValueError('Location name cannot be empty')
        return v.strip()


class UpdateLocationRequest(BaseModel):
    """Schema for location updates"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=2000)
    type: Optional[str] = Field(None, max_length=50)
    attributes: Optional[Dict[str, str]] = None
    notes: Optional[str] = Field(None, max_length=2000)


class CreateLoreRequest(BaseModel):
    """Schema for lore entry creation"""
    title: str = Field(..., min_length=1, max_length=200, description="Lore entry title")
    category: Optional[str] = Field(default="", max_length=50, description="Lore category")
    content: str = Field(..., min_length=1, max_length=10000, description="Lore content")
    related_entries: Optional[List[str]] = Field(default_factory=list, description="Related lore entry IDs")
    related_characters: Optional[List[str]] = Field(default_factory=list, description="Related character IDs")
    related_locations: Optional[List[str]] = Field(default_factory=list, description="Related location IDs")
    tags: Optional[List[str]] = Field(default_factory=list, max_length=10, description="Tags")

    @field_validator('title', 'content')
    @classmethod
    def validate_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError('Field cannot be empty')
        return v.strip()


class CreatePlotPointRequest(BaseModel):
    """Schema for plot point creation"""
    title: str = Field(..., min_length=1, max_length=200, description="Plot point title")
    description: str = Field(..., min_length=1, max_length=2000, description="Plot point description")
    act: Optional[int] = Field(default=1, ge=1, le=10, description="Act number")
    sequence: Optional[int] = Field(default=0, ge=0, description="Sequence number")
    status: Optional[str] = Field(default="planned", description="Plot point status")
    related_characters: Optional[List[str]] = Field(default_factory=list, description="Related character IDs")
    related_locations: Optional[List[str]] = Field(default_factory=list, description="Related location IDs")
    related_lore: Optional[List[str]] = Field(default_factory=list, description="Related lore IDs")
    notes: Optional[str] = Field(default="", max_length=2000)

    @field_validator('title', 'description')
    @classmethod
    def validate_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError('Field cannot be empty')
        return v.strip()

    @field_validator('status')
    @classmethod
    def validate_status(cls, v: str) -> str:
        valid_statuses = ['planned', 'in_progress', 'completed', 'abandoned']
        if v and v not in valid_statuses:
            raise ValueError(f'Status must be one of: {", ".join(valid_statuses)}')
        return v


class CreateSceneRequest(BaseModel):
    """Schema for scene creation"""
    title: str = Field(..., min_length=1, max_length=200, description="Scene title")
    content: Optional[str] = Field(default="", max_length=100000, description="Scene content")
    chapter_id: Optional[str] = Field(None, max_length=100, description="Chapter ID")
    sequence: Optional[int] = Field(default=0, ge=0, description="Scene sequence")
    characters: Optional[List[str]] = Field(default_factory=list, description="Character IDs in scene")
    location_id: Optional[str] = Field(None, max_length=100, description="Location ID")
    plot_points: Optional[List[str]] = Field(default_factory=list, description="Plot point IDs")
    status: Optional[str] = Field(default="draft", description="Scene status")
    notes: Optional[str] = Field(default="", max_length=2000)

    @field_validator('title')
    @classmethod
    def validate_title(cls, v: str) -> str:
        if not v.strip():
            raise ValueError('Scene title cannot be empty')
        return v.strip()

    @field_validator('status')
    @classmethod
    def validate_status(cls, v: str) -> str:
        valid_statuses = ['draft', 'in_progress', 'complete', 'needs_revision']
        if v and v not in valid_statuses:
            raise ValueError(f'Status must be one of: {", ".join(valid_statuses)}')
        return v


class UpdateSceneRequest(BaseModel):
    """Schema for scene updates"""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    content: Optional[str] = Field(None, max_length=100000)
    characters: Optional[List[str]] = None
    location_id: Optional[str] = Field(None, max_length=100)
    plot_points: Optional[List[str]] = None
    status: Optional[str] = None
    notes: Optional[str] = Field(None, max_length=2000)
