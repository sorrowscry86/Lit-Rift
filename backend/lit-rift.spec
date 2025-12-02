# -*- mode: python ; coding: utf-8 -*-
# PyInstaller spec file for Lit-Rift Flask backend

import sys
from PyInstaller.utils.hooks import collect_all, collect_submodules

block_cipher = None

# Collect all submodules for key dependencies
firebase_admin_all = collect_all('firebase_admin')
google_genai_all = collect_all('google.generativeai')
flask_all = collect_all('flask')
flask_cors_all = collect_all('flask_cors')

# Collect hidden imports
hiddenimports = [
    # Flask and extensions
    'flask',
    'flask_cors',
    'werkzeug',
    'werkzeug.security',
    'jinja2',
    'click',

    # Firebase
    'firebase_admin',
    'firebase_admin.credentials',
    'firebase_admin.firestore',
    'firebase_admin._http_client',
    'google.cloud',
    'google.cloud.firestore',
    'google.cloud.firestore_v1',
    'google.api_core',
    'google.auth',

    # Google Generative AI
    'google.generativeai',
    'google.ai',
    'google.ai.generativelanguage',

    # Application modules
    'routes',
    'routes.auth',
    'routes.story_bible',
    'routes.editor',
    'routes.visual_planning',
    'routes.continuity',
    'routes.inspiration',
    'routes.assets',
    'routes.export_routes',
    'models',
    'services',
    'utils',
    'schemas',

    # Other dependencies
    'dotenv',
    'PIL',
    'PIL.Image',
    'pydub',
    'pypdf',
    'ebooklib',
    'markdown',
    'reportlab',
    'pydantic',
    'pythonjsonlogger',
    'requests',

    # Standard library (sometimes needed)
    'json',
    'os',
    'sys',
    'logging',
]

# Extend with collected submodules
hiddenimports.extend(firebase_admin_all[1])
hiddenimports.extend(google_genai_all[1])
hiddenimports.extend(flask_all[1])
hiddenimports.extend(flask_cors_all[1])

# Data files to include
datas = [
    ('.env.example', '.'),
]

# Add collected data files
datas.extend(firebase_admin_all[0])
datas.extend(google_genai_all[0])
datas.extend(flask_all[0])
datas.extend(flask_cors_all[0])

# Binary files
binaries = []
binaries.extend(firebase_admin_all[2])
binaries.extend(google_genai_all[2])

a = Analysis(
    ['app.py'],
    pathex=[],
    binaries=binaries,
    datas=datas,
    hiddenimports=hiddenimports,
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[
        'tkinter',
        'matplotlib',
        'numpy',
        'pandas',
        'scipy',
        'IPython',
        'jupyter',
    ],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name='lit-rift-backend',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    console=False,  # Hide console for logging
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)

coll = COLLECT(
    exe,
    a.binaries,
    a.zipfiles,
    a.datas,
    strip=False,
    upx=True,
    upx_exclude=[],
    name='lit-rift-backend',
)
