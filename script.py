from PIL import Image

def crop_transparent_columns(image_path, output_path):
    img = Image.open(image_path)
    img = img.convert("RGBA")  # Ensure image is in RGBA format

    width, height = img.size
    pixels = img.load()

    # Identify non-transparent columns
    non_transparent_columns = []
    for x in range(width):
        for y in range(height):
            _, _, _, alpha = pixels[x, y]
            if alpha != 0:  # Non-transparent pixel found
                non_transparent_columns.append(x)
                break

    if not non_transparent_columns:
        print("No non-transparent pixels found.")
        return

    # Create a new image with only non-transparent columns
    new_width = len(non_transparent_columns)
    new_img = Image.new("RGBA", (new_width, height))

    for new_x, old_x in enumerate(non_transparent_columns):
        for y in range(height):
            new_img.putpixel((new_x, y), pixels[old_x, y])

    new_img.save(output_path)
    print(f"Cropped image saved as {output_path}")

# Usage
crop_transparent_columns('img.png', 'output_image.png')
