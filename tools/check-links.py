#!/usr/bin/env python3
"""Static audit. Run: python3 tools/check-links.py. No network or browser required."""
import json
import re
import sys
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote

ROOT = Path(__file__).resolve().parents[1]

class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.anchors, self.ids, self.resources, self.forms = [], [], [], []
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if 'id' in a: self.ids.append(a['id'])
        if tag == 'a': self.anchors.append(a)
        if tag == 'form': self.forms.append(a)
        if tag in ('img', 'script') and 'src' in a: self.resources.append(a['src'])
        if tag == 'link' and a.get('rel') in ('stylesheet', 'icon', 'shortcut icon', 'apple-touch-icon'): self.resources.append(a['href'])

page = Page()
page.feed((ROOT / 'index.html').read_text())
errors, counts = [], Counter()
for i, a in enumerate(page.anchors, 1):
    href = a.get('href', '').strip()
    parts = urlsplit(href)
    if not href or href == '#' or parts.scheme.lower() == 'javascript':
        counts['placeholder_links'] += 1; errors.append(f'Anchor {i}: placeholder href')
    elif parts.scheme in ('http', 'https') and parts.netloc:
        counts['web_links'] += 1
    elif href.startswith('#') and unquote(parts.fragment) in page.ids:
        counts['local_fragment_links'] += 1
    elif not parts.scheme and parts.path and (ROOT / unquote(parts.path)).is_file():
        counts['local_file_links'] += 1
    else: errors.append(f'Anchor {i}: unresolved href {href}')
    if a.get('target') == '_blank' and not {'noopener', 'noreferrer'} <= set(a.get('rel', '').split()):
        errors.append(f'Anchor {i}: missing external-link rel')

for value in page.resources:
    if urlsplit(value).scheme: errors.append(f'Automatic remote dependency: {value}')
    elif not (ROOT / value).is_file(): errors.append(f'Missing resource: {value}')
for css in (ROOT / 'css').glob('*.css'):
    for value in re.findall(r'url\([\'\"]?([^\)\'\"]+)', css.read_text()):
        if urlsplit(value).scheme: errors.append(f'Automatic remote CSS dependency: {value}')
        elif not (css.parent / value).is_file(): errors.append(f'Missing CSS resource: {value}')
for id, count in Counter(page.ids).items():
    if count > 1: errors.append(f'Duplicate id: {id}')
main = (ROOT / 'js/main.js').read_text()
for id in re.findall(r"\$\(['\"]([^'\"]+)['\"]\)", main):
    if id not in page.ids: errors.append(f'JS references missing id: {id}')
raw = (ROOT / 'js/article-data.js').read_text().split('window.articleData =', 1)[1].strip().removesuffix(';')
data = json.loads(raw)
for section in ('recommendations', 'news24h', 'hotNews'):
    for item in data[section]:
        if not item['url'].startswith('https://www.odaily.news/zh-CN/'):
            errors.append(f'Invalid {section} URL: {item["url"]}')
if any(token in main for token in ('fetch(', 'XMLHttpRequest', 'data-demo')):
    errors.append('Unexpected network data dependency or placeholder handler')
result = {
    'scope': 'Static HTML, data URLs and local resources; does not claim browser or remote availability testing',
    'anchor_total': len(page.anchors),
    'valid_href_total': counts['web_links'] + counts['local_fragment_links'] + counts['local_file_links'],
    'web_links': counts['web_links'],
    'local_fragment_links': counts['local_fragment_links'],
    'local_file_links': counts['local_file_links'],
    'placeholder_links': counts['placeholder_links'],
    'errors': errors,
    'status': 'passed' if not errors else 'failed'
}
print(json.dumps(result, ensure_ascii=False, indent=2))
if '--write' in sys.argv:
    (ROOT / 'checks/link-audit.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
sys.exit(bool(errors))
