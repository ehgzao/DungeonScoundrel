#!/usr/bin/env python3
"""
Script para modularizar index.html
Extrai CSS e JavaScript para arquivos separados
"""

import re
import os

# Caminhos
INDEX_PATH = r"c:\Users\ehgli\OneDrive\Documentos\- Projects\DungeonScoundrel\public\index.html"
CSS_DIR = r"c:\Users\ehgli\OneDrive\Documentos\- Projects\DungeonScoundrel\public\src\css"
JS_DIR = r"c:\Users\ehgli\OneDrive\Documentos\- Projects\DungeonScoundrel\public\src\js\modules"

def extract_css_from_html(html_content):
    """Extrai todo CSS inline do HTML"""
    # Encontrar todos os blocos <style>
    style_pattern = r'<style>(.*?)</style>'
    styles = re.findall(style_pattern, html_content, re.DOTALL)
    return '\n\n'.join(styles)

def extract_js_from_html(html_content):
    """Extrai todo JavaScript inline do HTML"""
    # Encontrar todos os blocos <script> (exceto src externos)
    script_pattern = r'<script(?!\s+src)(.*?)>(.*?)</script>'
    scripts = re.findall(script_pattern, html_content, re.DOTALL)
    return '\n\n'.join([script[1] for script in scripts])

def separate_css_by_concern(css_content):
    """Separa CSS por responsabilidade"""
    sections = {
        'modals.css': [],
        'forms.css': [],
        'buttons.css': [],
        'layout.css': []
    }
    
    # Regex patterns para identificar seções
    modal_pattern = r'\.modal.*?\{[^}]+\}'
    form_pattern = r'(input|textarea|select|form|label).*?\{[^}]+\}'
    button_pattern = r'(button|\.btn).*?\{[^}]+\}'
    
    # Separar por padrões
    for match in re.finditer(modal_pattern, css_content, re.DOTALL):
        sections['modals.css'].append(match.group())
    
    for match in re.finditer(form_pattern, css_content, re.DOTALL):
        sections['forms.css'].append(match.group())
    
    for match in re.finditer(button_pattern, css_content, re.DOTALL):
        sections['buttons.css'].append(match.group())
    
    return sections

def main():
    print("🚀 Iniciando modularização...")
    
    # Ler index.html
    with open(INDEX_PATH, 'r', encoding='utf-8') as f:
        html_content = f.read()
    
    print(f"📄 Arquivo lido: {len(html_content)} bytes")
    
    # Extrair CSS
    css_content = extract_css_from_html(html_content)
    print(f"🎨 CSS extraído: {len(css_content)} bytes")
    
    # Salvar CSS completo
    with open(os.path.join(CSS_DIR, 'inline-extracted.css'), 'w', encoding='utf-8') as f:
        f.write(css_content)
    print(f"✅ CSS salvo em: inline-extracted.css")
    
    # Extrair JavaScript
    js_content = extract_js_from_html(html_content)
    print(f"📜 JavaScript extraído: {len(js_content)} bytes")
    
    # Salvar JS completo
    with open(os.path.join(JS_DIR, 'inline-extracted.js'), 'w', encoding='utf-8') as f:
        f.write(js_content)
    print(f"✅ JavaScript salvo em: inline-extracted.js")
    
    print("🎉 Modularização completa!")

if __name__ == '__main__':
    main()
