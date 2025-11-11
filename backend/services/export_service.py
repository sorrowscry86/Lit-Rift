"""
Export service for multi-format book generation
"""
from io import BytesIO
from datetime import datetime
import markdown
from typing import List, Dict, Any


class ExportService:
    """Service for exporting projects to various formats"""

    def __init__(self):
        self.db = None

    def _get_project_content(self, project_id: str) -> Dict[str, Any]:
        """Fetch all project content for export"""
        from services.story_bible_service import StoryBibleService

        service = StoryBibleService()

        # Get project metadata
        project = service.get_project(project_id)
        if not project:
            return None

        # Get all scenes
        scenes = service.list_scenes(project_id)

        # Sort scenes by order
        scenes.sort(key=lambda x: x.get('order', 0))

        return {
            'project': project,
            'scenes': scenes
        }

    def export_to_pdf(self, project_id: str, options: Dict = None) -> BytesIO:
        """
        Export project to PDF

        Args:
            project_id: Project ID
            options: Export options (font_size, page_size, etc.)

        Returns:
            BytesIO: PDF file buffer
        """
        try:
            from reportlab.lib.pagesizes import letter
            from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
            from reportlab.lib.units import inch
            from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
            from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY

            content = self._get_project_content(project_id)
            if not content:
                raise ValueError("Project not found")

            project = content['project']
            scenes = content['scenes']

            # Create PDF buffer
            buffer = BytesIO()

            # Create PDF document
            doc = SimpleDocTemplate(
                buffer,
                pagesize=letter,
                rightMargin=72,
                leftMargin=72,
                topMargin=72,
                bottomMargin=18,
            )

            # Container for the 'Flowable' objects
            elements = []

            # Define styles
            styles = getSampleStyleSheet()

            # Title style
            title_style = ParagraphStyle(
                'CustomTitle',
                parent=styles['Heading1'],
                fontSize=24,
                textColor='black',
                spaceAfter=30,
                alignment=TA_CENTER,
            )

            # Author style
            author_style = ParagraphStyle(
                'CustomAuthor',
                parent=styles['Normal'],
                fontSize=14,
                textColor='black',
                spaceAfter=12,
                alignment=TA_CENTER,
            )

            # Chapter style
            chapter_style = ParagraphStyle(
                'CustomChapter',
                parent=styles['Heading2'],
                fontSize=18,
                textColor='black',
                spaceAfter=20,
                spaceBefore=20,
                alignment=TA_CENTER,
            )

            # Body text style
            body_style = ParagraphStyle(
                'CustomBody',
                parent=styles['Normal'],
                fontSize=12,
                textColor='black',
                alignment=TA_JUSTIFY,
                spaceAfter=12,
                leading=16,
            )

            # Add title page
            elements.append(Spacer(1, 2 * inch))
            elements.append(Paragraph(project.get('title', 'Untitled'), title_style))
            elements.append(Spacer(1, 0.3 * inch))
            elements.append(Paragraph(f"by {project.get('author', 'Unknown')}", author_style))
            elements.append(Spacer(1, 0.2 * inch))
            elements.append(Paragraph(project.get('genre', ''), author_style))
            elements.append(PageBreak())

            # Add scenes
            for i, scene in enumerate(scenes):
                # Chapter/Scene title
                scene_title = scene.get('title', f'Chapter {i + 1}')
                elements.append(Paragraph(scene_title, chapter_style))
                elements.append(Spacer(1, 0.2 * inch))

                # Scene content
                content_text = scene.get('content', '')
                # Split into paragraphs
                paragraphs = content_text.split('\n\n')
                for para in paragraphs:
                    if para.strip():
                        elements.append(Paragraph(para.strip(), body_style))

                # Page break between scenes if not last
                if i < len(scenes) - 1:
                    elements.append(PageBreak())

            # Build PDF
            doc.build(elements)

            # Get PDF bytes
            buffer.seek(0)
            return buffer

        except ImportError:
            # Fallback if reportlab not available
            return self._export_to_text(project_id, 'pdf')

    def export_to_epub(self, project_id: str, options: Dict = None) -> BytesIO:
        """
        Export project to EPUB

        Args:
            project_id: Project ID
            options: Export options

        Returns:
            BytesIO: EPUB file buffer
        """
        try:
            from ebooklib import epub

            content = self._get_project_content(project_id)
            if not content:
                raise ValueError("Project not found")

            project = content['project']
            scenes = content['scenes']

            # Create EPUB book
            book = epub.EpubBook()

            # Set metadata
            book.set_identifier(f"litrift-{project_id}")
            book.set_title(project.get('title', 'Untitled'))
            book.set_language('en')
            book.add_author(project.get('author', 'Unknown'))

            # Add chapters
            chapters = []
            spine = ['nav']

            for i, scene in enumerate(scenes):
                # Create chapter
                chapter = epub.EpubHtml(
                    title=scene.get('title', f'Chapter {i + 1}'),
                    file_name=f'chap_{i+1}.xhtml',
                    lang='en'
                )

                # Format content
                content_html = f"<h1>{scene.get('title', f'Chapter {i + 1}')}</h1>"

                # Convert paragraphs to HTML
                paragraphs = scene.get('content', '').split('\n\n')
                for para in paragraphs:
                    if para.strip():
                        content_html += f"<p>{para.strip()}</p>"

                chapter.content = content_html

                # Add chapter to book
                book.add_item(chapter)
                chapters.append(chapter)
                spine.append(chapter)

            # Define Table of Contents
            book.toc = tuple(chapters)

            # Add navigation files
            book.add_item(epub.EpubNcx())
            book.add_item(epub.EpubNav())

            # Define spine
            book.spine = spine

            # Add default CSS
            style = '''
            @namespace epub "http://www.idpf.org/2007/ops";
            body {
                font-family: Georgia, serif;
                line-height: 1.6;
                margin: 5%;
                text-align: justify;
            }
            h1 {
                text-align: center;
                margin-top: 2em;
                margin-bottom: 1em;
            }
            p {
                margin-bottom: 1em;
                text-indent: 1.5em;
            }
            '''
            nav_css = epub.EpubItem(
                uid="style_nav",
                file_name="style/nav.css",
                media_type="text/css",
                content=style
            )
            book.add_item(nav_css)

            # Write to buffer
            buffer = BytesIO()
            epub.write_epub(buffer, book, {})
            buffer.seek(0)
            return buffer

        except ImportError:
            # Fallback if ebooklib not available
            return self._export_to_text(project_id, 'epub')

    def export_to_markdown(self, project_id: str) -> str:
        """Export project to Markdown"""
        content = self._get_project_content(project_id)
        if not content:
            raise ValueError("Project not found")

        project = content['project']
        scenes = content['scenes']

        # Build markdown
        md = f"# {project.get('title', 'Untitled')}\n\n"
        md += f"**Author:** {project.get('author', 'Unknown')}  \n"
        md += f"**Genre:** {project.get('genre', 'Unknown')}  \n\n"

        if project.get('description'):
            md += f"## Synopsis\n\n{project['description']}\n\n"

        md += "---\n\n"

        # Add scenes
        for i, scene in enumerate(scenes):
            md += f"## {scene.get('title', f'Chapter {i + 1}')}\n\n"
            md += f"{scene.get('content', '')}\n\n"
            md += "---\n\n"

        return md

    def export_to_text(self, project_id: str) -> str:
        """Export project to plain text"""
        content = self._get_project_content(project_id)
        if not content:
            raise ValueError("Project not found")

        project = content['project']
        scenes = content['scenes']

        # Build text
        text = f"{project.get('title', 'Untitled').upper()}\n"
        text += f"by {project.get('author', 'Unknown')}\n\n"
        text += "=" * 60 + "\n\n"

        # Add scenes
        for i, scene in enumerate(scenes):
            text += f"\n{scene.get('title', f'Chapter {i + 1}').upper()}\n\n"
            text += f"{scene.get('content', '')}\n\n"
            text += "-" * 60 + "\n"

        return text

    def _export_to_text(self, project_id: str, format_type: str) -> BytesIO:
        """Fallback text export"""
        text = self.export_to_text(project_id)
        buffer = BytesIO(text.encode('utf-8'))
        buffer.seek(0)
        return buffer
