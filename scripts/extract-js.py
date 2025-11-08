#!/usr/bin/env python3
"""
Script to extract JavaScript from index.html into separate file
"""

import re
import os

# Paths
html_path = r"c:\Users\ehgli\OneDrive\Documentos\- Projects\DungeonScoundrel\public\index.html"
js_output = r"c:\Users\ehgli\OneDrive\Documentos\- Projects\DungeonScoundrel\src\js\game.js"

print("📖 Reading index.html...")
with open(html_path, 'r', encoding='utf-8') as f:
    html_content = f.read()

# Find the main game script block (starts at line ~1402, ends at line ~8384)
# Pattern: Find the large script block between Firebase init and closing </script>
pattern = r'(<script>\s*/\*\s*={40,}\s*GAME SCRIPT.*?</script>)'
match = re.search(pattern, html_content, re.DOTALL)

if not match:
    print("❌ Could not find main game script block")
    # Try alternative: find script after firebase config
    lines = html_content.split('\n')
    
    # Find where main game logic starts (after firebase config)
    start_idx = None
    end_idx = None
    
    for i, line in enumerate(lines):
        if '<!-- GAME SCRIPT' in line or 'MAIN GAME LOGIC' in line:
            # Find next <script> tag
            for j in range(i, len(lines)):
                if '<script>' in lines[j] and 'emailjs' not in lines[j]:
                    start_idx = j + 1  # Start after <script>
                    break
            break
    
    if start_idx:
        # Find the corresponding </script>
        script_depth = 0
        for i in range(start_idx, len(lines)):
            if '<script>' in lines[i]:
                script_depth += 1
            if '</script>' in lines[i]:
                if script_depth == 0:
                    end_idx = i
                    break
                script_depth -= 1
        
        if end_idx:
            print(f"✅ Found JavaScript: lines {start_idx} to {end_idx}")
            js_content = '\n'.join(lines[start_idx:end_idx])
            
            # Write to file
            print(f"💾 Writing to {js_output}")
            with open(js_output, 'w', encoding='utf-8') as f:
                f.write(js_content)
            
            # Now update HTML to reference external JS
            # Remove the script block and add reference
            new_lines = lines[:start_idx-1] + [
                '    <script src="../src/js/game.js"></script>',
                ''
            ] + lines[end_idx+1:]
            
            # Write updated HTML
            print(f"💾 Updating index.html...")
            with open(html_path, 'w', encoding='utf-8') as f:
                f.write('\n'.join(new_lines))
            
            print("✅ Done! JavaScript extracted successfully")
            print(f"   - Game logic: {len(js_content)} characters")
            print(f"   - Lines extracted: {end_idx - start_idx}")
        else:
            print("❌ Could not find end of script block")
    else:
        print("❌ Could not find start of main game script")
else:
    print("✅ Found main script block using regex")
    
print("\n✅ Script extraction complete!")
