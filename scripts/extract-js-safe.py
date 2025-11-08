#!/usr/bin/env python3
"""
Safe JavaScript extraction from index.html
"""
import os

# Paths
html_file = r"public\index.html"
js_file = r"src\js\game.js"

print("📖 Reading index.html...")
with open(html_file, 'r', encoding='utf-8') as f:
    content = f.read()

# Find the main script module
start_marker = '<script type="module">'
end_marker = '</script>'

# Find the position
start_pos = content.find(start_marker)
if start_pos == -1:
    print("❌ Could not find <script type='module'>")
    exit(1)

# Move to after the tag
script_start = start_pos + len(start_marker)

# Find the corresponding </script> (skip EmailJS scripts before)
temp_pos = script_start
end_pos = -1
script_count = 1

while temp_pos < len(content):
    next_script_open = content.find('<script', temp_pos)
    next_script_close = content.find(end_marker, temp_pos)
    
    if next_script_close == -1:
        break
    
    # If there's an opening script before this closing, increment counter
    if next_script_open != -1 and next_script_open < next_script_close:
        script_count += 1
        temp_pos = next_script_open + 7
    else:
        script_count -= 1
        if script_count == 0:
            end_pos = next_script_close
            break
        temp_pos = next_script_close + len(end_marker)

if end_pos == -1:
    print("❌ Could not find closing </script>")
    exit(1)

# Extract JavaScript
js_content = content[script_start:end_pos].strip()

print(f"✅ Found JavaScript block: {len(js_content)} characters")
print(f"   Lines: ~{js_content.count(chr(10))} lines")

# Write JavaScript file
print(f"💾 Writing to {js_file}...")
os.makedirs(os.path.dirname(js_file), exist_ok=True)
with open(js_file, 'w', encoding='utf-8') as f:
    f.write(js_content)

# Create new HTML with reference
new_html = (
    content[:start_pos] +
    '    <script type="module" src="../src/js/game.js"></script>\n' +
    content[end_pos + len(end_marker):]
)

# Backup original
backup_file = html_file + '.backup'
print(f"💾 Creating backup: {backup_file}")
with open(backup_file, 'w', encoding='utf-8') as f:
    f.write(content)

# Write updated HTML
print(f"💾 Updating {html_file}...")
with open(html_file, 'w', encoding='utf-8') as f:
    f.write(new_html)

print("\n✅ DONE!")
print(f"   JavaScript: {js_file} ({len(js_content):,} chars)")
print(f"   HTML updated: {html_file} ({len(new_html):,} chars)")
print(f"   Reduction: {len(content) - len(new_html):,} chars ({100 * (len(content) - len(new_html)) / len(content):.1f}%)")
print(f"\n🔒 Backup saved: {backup_file}")
print("\n🧪 TEST NOW:")
print("   cd scripts")
print("   .\\run-local.bat")
print("   Open: http://localhost:8080")
