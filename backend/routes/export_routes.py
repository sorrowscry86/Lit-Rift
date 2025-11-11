"""
Export Routes
API endpoints for multi-format export
"""

from flask import Blueprint, request, jsonify, send_file
from services.export_service import ExportService
import io

bp = Blueprint('export', __name__)
export_service = ExportService()

@bp.route('/pdf/<project_id>', methods=['POST'])
def export_pdf(project_id):
    """Export project to PDF"""
    try:
        data = request.json or {}
        options = data.get('options', {})

        # Generate PDF
        pdf_buffer = export_service.export_to_pdf(project_id, options)

        # Return PDF file
        return send_file(
            pdf_buffer,
            mimetype='application/pdf',
            as_attachment=True,
            download_name=f'novel-{project_id}.pdf'
        )
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/epub/<project_id>', methods=['POST'])
def export_epub(project_id):
    """Export project to EPUB"""
    try:
        data = request.json or {}
        options = data.get('options', {})

        # Generate EPUB
        epub_buffer = export_service.export_to_epub(project_id, options)

        # Return EPUB file
        return send_file(
            epub_buffer,
            mimetype='application/epub+zip',
            as_attachment=True,
            download_name=f'novel-{project_id}.epub'
        )
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/markdown/<project_id>', methods=['GET'])
def export_markdown(project_id):
    """Export project to Markdown"""
    try:
        markdown = export_service.export_to_markdown(project_id)

        buffer = io.BytesIO(markdown.encode('utf-8'))
        buffer.seek(0)

        return send_file(
            buffer,
            mimetype='text/markdown',
            as_attachment=True,
            download_name=f'novel-{project_id}.md'
        )
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/text/<project_id>', methods=['GET'])
def export_text(project_id):
    """Export project to plain text"""
    try:
        text = export_service.export_to_text(project_id)

        buffer = io.BytesIO(text.encode('utf-8'))
        buffer.seek(0)

        return send_file(
            buffer,
            mimetype='text/plain',
            as_attachment=True,
            download_name=f'novel-{project_id}.txt'
        )
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/audio/<project_id>', methods=['POST'])
def export_audio(project_id):
    """Export project to audiobook"""
    data = request.json
    voice = data.get('voice', 'default')
    
    # Placeholder for audio export
    return jsonify({
        'success': True,
        'format': 'audio',
        'download_url': f'/api/export/download/{project_id}/audio',
        'voice': voice
    })

@bp.route('/formats', methods=['GET'])
def list_formats():
    """List available export formats"""
    return jsonify({
        'formats': [
            {'id': 'pdf', 'name': 'PDF', 'description': 'Portable Document Format'},
            {'id': 'epub', 'name': 'EPUB', 'description': 'Electronic Publication'},
            {'id': 'mobi', 'name': 'MOBI', 'description': 'Kindle Format'},
            {'id': 'audio', 'name': 'Audio', 'description': 'MP3 Audiobook'}
        ]
    })
