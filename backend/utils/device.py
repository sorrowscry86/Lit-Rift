import os
import uuid
import socket
import json
import platform
from datetime import datetime

class DeviceManager:
    """Manage device ID and device info across app restarts"""

    @staticmethod
    def get_device_dir():
        """Get cross-platform device directory"""
        if platform.system() == 'Windows':
            base_path = os.getenv('APPDATA', os.path.expanduser('~'))
        else:
            # Linux/Mac: use XDG_DATA_HOME or ~/.local/share
            base_path = os.getenv('XDG_DATA_HOME', os.path.expanduser('~/.local/share'))

        return os.path.join(base_path, 'LitRift')

    DEVICE_DIR = None  # Will be set dynamically
    DEVICE_FILE = None
    DEVICE_INFO_FILE = None

    @staticmethod
    def _init_paths():
        """Initialize paths dynamically"""
        if DeviceManager.DEVICE_DIR is None:
            DeviceManager.DEVICE_DIR = DeviceManager.get_device_dir()
            DeviceManager.DEVICE_FILE = os.path.join(DeviceManager.DEVICE_DIR, 'device_id.txt')
            DeviceManager.DEVICE_INFO_FILE = os.path.join(DeviceManager.DEVICE_DIR, 'device_info.json')

    @staticmethod
    def ensure_device_dir():
        """Create LitRift app data directory if missing"""
        DeviceManager._init_paths()
        os.makedirs(DeviceManager.DEVICE_DIR, exist_ok=True)

    @staticmethod
    def get_or_create_device_id() -> str:
        """
        Get device ID from disk, or create new UUID if first run.
        Persists across app restarts.
        Returns: UUID string
        """
        DeviceManager.ensure_device_dir()

        if os.path.exists(DeviceManager.DEVICE_FILE):
            with open(DeviceManager.DEVICE_FILE, 'r') as f:
                device_id = f.read().strip()
                if device_id:
                    return device_id

        # First run: generate new device ID
        device_id = str(uuid.uuid4())
        with open(DeviceManager.DEVICE_FILE, 'w') as f:
            f.write(device_id)

        return device_id

    @staticmethod
    def get_device_name() -> str:
        """
        Get human-readable device name.
        Windows: hostname
        Linux/Mac: hostname
        Fallback: "Unknown Device"
        """
        try:
            return socket.gethostname()
        except:
            return "Unknown Device"

    @staticmethod
    def get_app_version() -> str:
        """Get app version from package or config"""
        try:
            version_file = os.path.join(os.path.dirname(__file__), '..', '..', 'VERSION')
            if os.path.exists(version_file):
                with open(version_file, 'r') as f:
                    return f.read().strip()
        except:
            pass
        return "1.0.0"

    @staticmethod
    def save_device_info(device_id: str, device_name: str, app_version: str):
        """Save device info to JSON for reference"""
        DeviceManager.ensure_device_dir()

        info = {
            'device_id': device_id,
            'device_name': device_name,
            'app_version': app_version,
            'platform': platform.system(),
            'created_at': datetime.utcnow().isoformat(),
            'last_updated': datetime.utcnow().isoformat()
        }

        with open(DeviceManager.DEVICE_INFO_FILE, 'w') as f:
            json.dump(info, f, indent=2)

    @staticmethod
    def load_device_info() -> dict:
        """Load stored device info"""
        DeviceManager.ensure_device_dir()

        if os.path.exists(DeviceManager.DEVICE_INFO_FILE):
            with open(DeviceManager.DEVICE_INFO_FILE, 'r') as f:
                return json.load(f)

        return {}
