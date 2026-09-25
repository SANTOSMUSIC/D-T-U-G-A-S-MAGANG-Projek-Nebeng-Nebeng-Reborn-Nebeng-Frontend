import sys

def replace_in_file(filepath, old_str, new_str):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    if old_str in content:
        content = content.replace(old_str, new_str)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")
    else:
        print(f"Not found in {filepath}")

replace_in_file(
    'src/features/regional/components/RegionalTopbar.jsx',
    'w-8\n              h-8',
    'w-10\n              md:w-8\n              h-10\n              md:h-8'
)
