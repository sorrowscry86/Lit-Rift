"""
Story Bible Models
Central data structures for tracking story elements
"""

from dataclasses import dataclass, asdict
from typing import List, Dict, Optional
from datetime import datetime

@dataclass
class Character:
    """Character entity in the story"""
    id: str
    name: str
    description: str
    traits: List[str]
    backstory: str
    relationships: Dict[str, str]  # {character_id: relationship_description}
    appearances: List[str]  # List of scene/chapter IDs where character appears
    notes: str
    created_at: str
    updated_at: str
    
    def to_dict(self):
        return asdict(self)
    
    @classmethod
    def from_dict(cls, data):
        return cls(**data)

@dataclass
class Location:
    """Location entity in the story"""
    id: str
    name: str
    description: str
    type: str  # e.g., city, building, natural, fictional
    parent_location_id: Optional[str]  # For nested locations
    attributes: Dict[str, str]  # Custom attributes
    scenes: List[str]  # List of scene IDs that take place here
    notes: str
    created_at: str
    updated_at: str
    
    def to_dict(self):
        return asdict(self)
    
    @classmethod
    def from_dict(cls, data):
        return cls(**data)

@dataclass
class LoreEntry:
    """Lore/worldbuilding entry"""
    id: str
    title: str
    category: str  # e.g., magic_system, history, culture, technology
    content: str
    related_entries: List[str]  # IDs of related lore entries
    related_characters: List[str]
    related_locations: List[str]
    tags: List[str]
    created_at: str
    updated_at: str
    
    def to_dict(self):
        return asdict(self)
    
    @classmethod
    def from_dict(cls, data):
        return cls(**data)

@dataclass
class PlotPoint:
    """Plot point/story beat"""
    id: str
    title: str
    description: str
    act: int  # Which act of the story
    sequence: int  # Order within the act
    status: str  # planned, in_progress, completed
    related_characters: List[str]
    related_locations: List[str]
    related_lore: List[str]
    notes: str
    created_at: str
    updated_at: str
    
    def to_dict(self):
        return asdict(self)
    
    @classmethod
    def from_dict(cls, data):
        return cls(**data)

@dataclass
class Scene:
    """Individual scene in the manuscript"""
    id: str
    title: str
    content: str
    chapter_id: Optional[str]
    sequence: int
    characters: List[str]  # Character IDs present in scene
    location_id: Optional[str]
    plot_points: List[str]  # Plot point IDs addressed
    word_count: int
    status: str  # draft, revision, final
    notes: str
    created_at: str
    updated_at: str
    
    def to_dict(self):
        return asdict(self)
    
    @classmethod
    def from_dict(cls, data):
        return cls(**data)

@dataclass
class Project:
    """Novel project metadata"""
    id: str
    title: str
    author: str
    genre: str
    description: str
    status: str  # planning, drafting, revision, complete
    target_word_count: int
    current_word_count: int
    created_at: str
    updated_at: str
    
    def to_dict(self):
        return asdict(self)
    
    @classmethod
    def from_dict(cls, data):
        return cls(**data)
