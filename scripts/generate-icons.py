#!/usr/bin/env python3
import sys, os
from PIL import Image, ImageDraw, ImageFilter

def generate_icons():
    source_path = 'logo-icon-lumen.png'
    if not os.path.exists(source_path):
        print('[IconGen] Error: ' + source_path + ' not found!')
        return

    print('[IconGen] Processing source logo image: ' + source_path)
    img = Image.open(source_path).convert('RGBA')
    w, h = img.size

    crop_cx = 1110
    crop_cy = 960
    crop_size = 1520

    x_start = max(0, crop_cx - crop_size // 2)
    y_start = max(0, crop_cy - crop_size // 2)
    x_end = min(w, crop_cx + crop_size // 2)
    y_end = min(h, crop_cy + crop_size // 2)

    cropped = img.crop((x_start, y_start, x_end, y_end))

    mask = Image.new('L', cropped.size, 0)
    draw = ImageDraw.Draw(mask)
    r = int(crop_size * 0.22)
    margin = int(crop_size * 0.04)
    draw.rounded_rectangle(
        [margin, margin, crop_size - margin, crop_size - margin],
        radius=r,
        fill=255
    )

    mask = mask.filter(ImageFilter.GaussianBlur(radius=1.5))
    cropped.putalpha(mask)

    master_icon_1024 = cropped.resize((1024, 1024), Image.Resampling.LANCZOS)
    master_icon_512 = cropped.resize((512, 512), Image.Resampling.LANCZOS)

    os.makedirs('public', exist_ok=True)
    master_icon_512.save('public/icon.png')
    master_icon_512.save('public/logo.png')
    master_icon_1024.save('public/logo-1024.png')
    print('[IconGen] Generated public/icon.png, public/logo.png')

    os.makedirs('electron', exist_ok=True)
    master_icon_512.save('electron/icon.png')
    print('[IconGen] Generated electron/icon.png')

    os.makedirs('src-tauri/icons', exist_ok=True)
    
    tauri_sizes = {
        '32x32.png': (32, 32),
        '64x64.png': (64, 64),
        '128x128.png': (128, 128),
        '128x128@2x.png': (256, 256),
        'icon.png': (512, 512),
        'Square30x30Logo.png': (30, 30),
        'Square44x44Logo.png': (44, 44),
        'Square71x71Logo.png': (71, 71),
        'Square89x89Logo.png': (89, 89),
        'Square107x107Logo.png': (107, 107),
        'Square142x142Logo.png': (142, 142),
        'Square150x150Logo.png': (150, 150),
        'Square284x284Logo.png': (284, 284),
        'Square310x310Logo.png': (310, 310),
        'StoreLogo.png': (50, 50),
    }

    for filename, size in tauri_sizes.items():
        resized = cropped.resize(size, Image.Resampling.LANCZOS)
        resized.save(os.path.join('src-tauri/icons', filename))
    print('[IconGen] Generated ' + str(len(tauri_sizes)) + ' Tauri PNG icon sizes')

    ico_sizes = [(16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
    master_icon_512.save('public/favicon.ico', format='ICO', sizes=ico_sizes)
    master_icon_512.save('src-tauri/icons/icon.ico', format='ICO', sizes=ico_sizes)
    master_icon_512.save('electron/icon.ico', format='ICO', sizes=ico_sizes)
    print('[IconGen] Generated Windows icon.ico')

    if os.path.exists('test_icon_preview.png'):
        os.remove('test_icon_preview.png')

    print('[IconGen] Finished successfully!')

if __name__ == '__main__':
    generate_icons()
