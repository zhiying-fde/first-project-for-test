#!/usr/bin/env python3
"""Make a plugin ZIP with basic bounds; host/server remain the full validator."""
import hashlib
import json
from pathlib import Path
import sys
from zipfile import ZIP_DEFLATED, ZipFile, ZipInfo


def pack(source, destination):
    root = Path(source).resolve(strict=True)
    target = Path(destination).resolve()
    if not root.is_dir() or target == root or root in target.parents:
        raise ValueError('output_must_be_outside_plugin')
    manifest = json.loads((root / 'plugin.json').read_text(encoding='utf-8'))
    if manifest.get('manifestVersion') != 1:
        raise ValueError('unsupported_manifest_version')
    entries = sorted(root.rglob('*'))
    if len(entries) > 2048:
        raise ValueError('plugin_entry_limit')
    files, total = [], 0
    for item in entries:
        name = item.relative_to(root).as_posix()
        if item.is_symlink() or '.git' in item.parts or any(part.startswith('.') for part in item.relative_to(root).parts):
            raise ValueError('hidden_files_or_links_forbidden: ' + name)
        if item.is_dir():
            continue
        if not item.is_file() or any(char in name for char in '\\:%?#'):
            raise ValueError('invalid_package_file: ' + name)
        data = item.read_bytes()
        total += len(data)
        if len(data) > 16 * 1024 * 1024 or total > 1024 * 1024 * 1024:
            raise ValueError('plugin_file_limit')
        files.append((name, data))
    names = {name for name, _ in files}
    declared = ([manifest['ui']['entry']] if manifest.get('ui') else [])
    declared += [script['entry'] for script in manifest.get('scripts', {}).values()]
    declared += manifest.get('skills', [])
    if not declared or any(name not in names for name in declared):
        raise ValueError('plugin_entry_missing')
    # Memory buffer prevents a failed size check from leaving a partial destination.
    from io import BytesIO
    buffer = BytesIO()
    with ZipFile(buffer, 'w', compression=ZIP_DEFLATED) as archive:
        for name, data in files:
            info = ZipInfo(name, date_time=(2020, 1, 1, 0, 0, 0))
            info.compress_type = ZIP_DEFLATED
            info.external_attr = 0o100644 << 16
            archive.writestr(info, data)
    data = buffer.getvalue()
    if len(data) > 1024 * 1024 * 1024:
        raise ValueError('plugin_archive_limit')
    with target.open('xb') as output:
        output.write(data)
    return {'id': manifest.get('id'), 'version': manifest.get('version'),
            'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data)}


if __name__ == '__main__':
    if len(sys.argv) != 3:
        raise SystemExit('usage: python3 pack-plugin.py <source-directory> <output.zip>')
    print(json.dumps(pack(*sys.argv[1:]), ensure_ascii=False))
