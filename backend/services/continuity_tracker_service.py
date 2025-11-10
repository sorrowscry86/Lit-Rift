"""
Continuity Tracker Service
AI-powered continuity checking for manuscripts
"""

import google.generativeai as genai
from typing import List, Dict, Optional

class ContinuityTrackerService:
    """Service for tracking and checking story continuity"""
    
    def __init__(self, db):
        self.db = db
        self.model = None
        try:
            self.model = genai.GenerativeModel('gemini-pro')
        except:
            print("Warning: Gemini model not initialized for continuity tracking")
    
    def _get_collection(self, project_id: str):
        """Get continuity issues collection"""
        if self.db:
            return self.db.collection('projects').document(project_id).collection('continuity_issues')
        return None
    
    def check_character_continuity(self, project_id: str, story_bible_service) -> List[Dict]:
        """Check for character continuity issues"""
        issues = []
        
        characters = story_bible_service.list_characters(project_id)
        scenes = story_bible_service.list_scenes(project_id)
        
        for character in characters:
            char_id = character['id']
            char_name = character['name']
            
            # Get all scenes featuring this character
            char_scenes = [s for s in scenes if char_id in s.get('characters', [])]
            
            if not char_scenes:
                continue
            
            # Check for inconsistencies in character portrayal
            if self.model and len(char_scenes) > 1:
                try:
                    # Build context for AI analysis
                    character_description = f"""
Character Profile:
Name: {char_name}
Description: {character.get('description', '')}
Traits: {', '.join(character.get('traits', []))}
Backstory: {character.get('backstory', '')}
"""
                    
                    scene_contents = "\n\n---\n\n".join([
                        f"Scene: {s['title']}\n{s['content'][:500]}"
                        for s in char_scenes[:5]  # Limit to first 5 scenes
                    ])
                    
                    prompt = f"""Analyze the following character and their appearances in scenes for continuity issues.

{character_description}

Scene Appearances:
{scene_contents}

Identify any inconsistencies in:
1. Character personality or behavior
2. Physical descriptions
3. Character knowledge or memories
4. Relationships with other characters

List only clear inconsistencies. Be concise. Format as:
- Issue: [brief description]
- Location: Scene "[scene title]"
- Severity: Low/Medium/High
"""
                    
                    response = self.model.generate_content(prompt)
                    
                    if response.text and "Issue:" in response.text:
                        issues.append({
                            'type': 'character_inconsistency',
                            'character_id': char_id,
                            'character_name': char_name,
                            'description': response.text,
                            'severity': 'medium',
                            'status': 'open'
                        })
                
                except Exception as e:
                    print(f"Error checking character continuity: {e}")
        
        return issues
    
    def check_timeline_continuity(self, project_id: str, story_bible_service) -> List[Dict]:
        """Check for timeline inconsistencies"""
        issues = []
        
        scenes = story_bible_service.list_scenes(project_id)
        
        # Sort scenes by sequence
        sorted_scenes = sorted(scenes, key=lambda s: s.get('sequence', 0))
        
        if self.model and len(sorted_scenes) > 2:
            try:
                # Analyze timeline progression
                scene_summaries = "\n".join([
                    f"{i+1}. {s['title']}: {s['content'][:200]}..."
                    for i, s in enumerate(sorted_scenes[:10])
                ])
                
                prompt = f"""Analyze this story's timeline for continuity issues:

{scene_summaries}

Identify any timeline problems such as:
1. Events happening out of logical order
2. Characters knowing things they shouldn't yet know
3. Contradictory references to past or future events
4. Impossible time spans between events

List only clear issues. Format as:
- Issue: [brief description]
- Scenes: [affected scene numbers]
- Severity: Low/Medium/High
"""
                
                response = self.model.generate_content(prompt)
                
                if response.text and "Issue:" in response.text:
                    issues.append({
                        'type': 'timeline_inconsistency',
                        'description': response.text,
                        'severity': 'medium',
                        'status': 'open'
                    })
            
            except Exception as e:
                print(f"Error checking timeline continuity: {e}")
        
        return issues
    
    def check_location_continuity(self, project_id: str, story_bible_service) -> List[Dict]:
        """Check for location description inconsistencies"""
        issues = []
        
        locations = story_bible_service.list_locations(project_id)
        scenes = story_bible_service.list_scenes(project_id)
        
        for location in locations:
            loc_id = location['id']
            loc_name = location['name']
            loc_description = location.get('description', '')
            
            # Get scenes at this location
            loc_scenes = [s for s in scenes if s.get('location_id') == loc_id]
            
            if len(loc_scenes) > 1 and self.model:
                try:
                    scene_descriptions = "\n\n".join([
                        f"In '{s['title']}':\n{s['content'][:300]}"
                        for s in loc_scenes[:3]
                    ])
                    
                    prompt = f"""Check if these scene descriptions match the location profile:

Location: {loc_name}
Official Description: {loc_description}

Scene Descriptions:
{scene_descriptions}

Identify any contradictions in:
1. Physical layout or features
2. Atmosphere or ambiance
3. Objects or elements present

List only clear contradictions. Format as:
- Issue: [brief description]
- Scene: "[scene title]"
"""
                    
                    response = self.model.generate_content(prompt)
                    
                    if response.text and "Issue:" in response.text:
                        issues.append({
                            'type': 'location_inconsistency',
                            'location_id': loc_id,
                            'location_name': loc_name,
                            'description': response.text,
                            'severity': 'low',
                            'status': 'open'
                        })
                
                except Exception as e:
                    print(f"Error checking location continuity: {e}")
        
        return issues
    
    def perform_full_check(self, project_id: str, story_bible_service) -> Dict:
        """Perform a comprehensive continuity check"""
        all_issues = []
        
        # Run all checks
        all_issues.extend(self.check_character_continuity(project_id, story_bible_service))
        all_issues.extend(self.check_timeline_continuity(project_id, story_bible_service))
        all_issues.extend(self.check_location_continuity(project_id, story_bible_service))
        
        # Save issues to database
        collection = self._get_collection(project_id)
        if collection:
            # Clear old issues
            docs = collection.stream()
            for doc in docs:
                doc.reference.delete()
            
            # Save new issues
            for i, issue in enumerate(all_issues):
                issue['id'] = f'issue_{i}'
                collection.document(issue['id']).set(issue)
        
        return {
            'total_issues': len(all_issues),
            'by_severity': {
                'high': len([i for i in all_issues if i['severity'] == 'high']),
                'medium': len([i for i in all_issues if i['severity'] == 'medium']),
                'low': len([i for i in all_issues if i['severity'] == 'low'])
            },
            'by_type': {
                'character': len([i for i in all_issues if i['type'] == 'character_inconsistency']),
                'timeline': len([i for i in all_issues if i['type'] == 'timeline_inconsistency']),
                'location': len([i for i in all_issues if i['type'] == 'location_inconsistency'])
            },
            'issues': all_issues
        }
    
    def get_issues(self, project_id: str) -> List[Dict]:
        """Get all continuity issues for a project"""
        collection = self._get_collection(project_id)
        if collection:
            docs = collection.stream()
            return [doc.to_dict() for doc in docs]
        return []
    
    def resolve_issue(self, project_id: str, issue_id: str) -> bool:
        """Mark an issue as resolved"""
        collection = self._get_collection(project_id)
        if collection:
            doc_ref = collection.document(issue_id)
            doc_ref.update({'status': 'resolved'})
            return True
        return False
