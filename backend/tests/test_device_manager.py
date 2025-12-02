"""
Tests for Device ID Management
"""

import pytest
import os
import tempfile
import shutil
from utils.device import DeviceManager


class TestDeviceManager:
    """Test device ID persistence and metadata"""

    def setup_method(self):
        """Create temp directory for tests"""
        self.test_dir = tempfile.mkdtemp()
        # Override device dir for tests
        DeviceManager.DEVICE_DIR = self.test_dir
        DeviceManager.DEVICE_FILE = os.path.join(self.test_dir, 'device_id.txt')
        DeviceManager.DEVICE_INFO_FILE = os.path.join(self.test_dir, 'device_info.json')

    def teardown_method(self):
        """Clean up temp directory"""
        if os.path.exists(self.test_dir):
            shutil.rmtree(self.test_dir)

    def test_get_or_create_device_id_first_run(self):
        """First run should create new device ID"""
        device_id = DeviceManager.get_or_create_device_id()

        assert device_id is not None
        assert len(device_id) > 0
        assert os.path.exists(DeviceManager.DEVICE_FILE)

        # Read from file
        with open(DeviceManager.DEVICE_FILE, 'r') as f:
            saved_id = f.read().strip()

        assert saved_id == device_id

    def test_get_or_create_device_id_persistence(self):
        """Device ID should persist across "restarts" """
        # First run
        device_id_1 = DeviceManager.get_or_create_device_id()

        # Second run (simulated restart)
        device_id_2 = DeviceManager.get_or_create_device_id()

        # Should be same
        assert device_id_1 == device_id_2

    def test_device_name_retrieval(self):
        """Should get device hostname"""
        device_name = DeviceManager.get_device_name()

        assert device_name is not None
        assert len(device_name) > 0
        assert device_name != "Unknown Device"  # Should get actual hostname

    def test_app_version_retrieval(self):
        """Should get app version"""
        app_version = DeviceManager.get_app_version()

        assert app_version is not None
        # Should be semantic version or fallback
        assert app_version == "1.0.0" or "-" in app_version

    def test_save_device_info(self):
        """Should save device info to JSON"""
        device_id = DeviceManager.get_or_create_device_id()
        device_name = DeviceManager.get_device_name()
        app_version = DeviceManager.get_app_version()

        DeviceManager.save_device_info(device_id, device_name, app_version)

        assert os.path.exists(DeviceManager.DEVICE_INFO_FILE)

        # Load and verify
        info = DeviceManager.load_device_info()
        assert info['device_id'] == device_id
        assert info['device_name'] == device_name
        assert info['app_version'] == app_version
        assert 'created_at' in info
        assert 'last_updated' in info

    def test_load_device_info_missing_file(self):
        """Should return empty dict if file doesn't exist"""
        info = DeviceManager.load_device_info()
        assert info == {}

    def test_device_directory_creation(self):
        """Should create device directory if missing"""
        # Remove directory
        if os.path.exists(self.test_dir):
            shutil.rmtree(self.test_dir)

        # Should recreate
        DeviceManager.ensure_device_dir()
        assert os.path.exists(self.test_dir)
