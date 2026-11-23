"""Generate tiny owned fixtures using only the managed Python standard library."""
import os
import struct
import wave
import zlib
from pathlib import Path
output = Path(os.environ['AIGV_OUTPUT_DIR'])
output.mkdir(parents=True, exist_ok=True)
def chunk(kind, data):
    return struct.pack('>I', len(data)) + kind + data + struct.pack('>I', zlib.crc32(kind + data))
size = 512
rows = b''.join(b'\x00' + bytes([40, 130, 220]) * size for _ in range(size))
png = b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', size, size, 8, 2, 0, 0, 0)) + chunk(b'IDAT', zlib.compress(rows)) + chunk(b'IEND', b'')
(output / 'sample.png').write_bytes(png)
with wave.open(str(output / 'sample.wav'), 'wb') as audio:
    audio.setparams((1, 2, 16000, 16000, 'NONE', 'not compressed'))
    audio.writeframes(b'\x00\x00' * 16000)
print('Created sample.png and sample.wav')
