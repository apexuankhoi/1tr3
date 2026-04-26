from rembg import remove
from PIL import Image
import os

def ai_remove_bg(input_path, output_path):
    """Use AI (rembg/U2Net) to remove background, keeping the ENTIRE tree."""
    print(f"  AI processing {os.path.basename(input_path)}...")
    with open(input_path, 'rb') as f:
        input_data = f.read()
    
    output_data = remove(input_data)
    
    with open(output_path, 'wb') as f:
        f.write(output_data)
    
    print(f"  DONE -> {os.path.basename(output_path)}")

assets = "d:/1tr3/assets"

# Process ALL tree images - NO cropping, just background removal
files = [
    ("sprout_real.png", "sprout_clean.png"),
    ("tree_real.png", "tree_clean.png"),
    ("flowering_real.png", "flowering_clean.png"),
    ("sapling_no_pot.png", "sapling_clean.png"),
]

for src, dst in files:
    src_path = os.path.join(assets, src)
    dst_path = os.path.join(assets, dst)
    if os.path.exists(src_path):
        ai_remove_bg(src_path, dst_path)
    else:
        print(f"  SKIP: {src} not found")

print("\nALL DONE! All backgrounds removed with AI.")
