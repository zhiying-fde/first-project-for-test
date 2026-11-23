"""Use only the virtual inputs supplied to this plugin run."""
import json
import os
from pathlib import Path

source = Path(os.environ['AIGV_INPUT_DIR'])
output = Path(os.environ['AIGV_OUTPUT_DIR'])
output.mkdir(parents=True, exist_ok=True)
items = [{'name': item.name, 'bytes': item.stat().st_size} for item in sorted(source.iterdir()) if item.is_file()]
(output / 'materials.json').write_text(json.dumps(items, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps({'files': len(items)}, ensure_ascii=False))

config = json.loads(os.environ.get('AIGV_PLUGIN_CONFIG', '{}'))
label = str(config.get('prefix', '素材清单'))
(output / 'summary.txt').write_text(label + '\n' + '\n'.join(item['name'] for item in items), encoding='utf-8')
