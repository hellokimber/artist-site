"""Check the deployable static site using only Python's standard library."""
import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
from xml.etree import ElementTree

ROOT = Path(__file__).resolve().parents[1] / 'public'
ORIGIN = 'https://kimberillo.com'
errors = []

class Document(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.tags = []
        self.ids = set()
        self.duplicates = set()
        self.json_blocks = []
        self.in_json = False
        self.block = ''

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        self.tags.append((tag, attrs))
        if 'id' in attrs:
            if attrs['id'] in self.ids:
                self.duplicates.add(attrs['id'])
            self.ids.add(attrs['id'])
        if tag == 'script' and attrs.get('type') == 'application/ld+json':
            self.in_json = True
            self.block = ''

    def handle_data(self, data):
        if self.in_json:
            self.block += data

    def handle_endtag(self, tag):
        if tag == 'script' and self.in_json:
            self.json_blocks.append(self.block)
            self.in_json = False

    def select(self, tag):
        return [attrs for name, attrs in self.tags if name == tag]


def check(condition, message):
    if not condition:
        errors.append(message)


def resolve(url):
    path = unquote(urlsplit(url).path)
    target = ROOT / path.lstrip('/')
    if path.endswith('/'):
        target /= 'index.html'
    return target


pages = {}
for path in ROOT.rglob('*.html'):
    doc = Document()
    doc.feed(path.read_text())
    pages[path] = doc

for path, doc in pages.items():
    label = str(path.relative_to(ROOT))
    check(len(doc.select('h1')) == 1, f'{label}: expected one h1')
    check(len(doc.select('main')) == 1, f'{label}: expected one main')
    check(len(doc.select('title')) == 1, f'{label}: expected one title')
    check(doc.select('html')[0].get('lang') == 'en-CA', f'{label}: missing language')
    check(not doc.duplicates, f'{label}: duplicate IDs {doc.duplicates}')
    meta = {a.get('name', a.get('property')): a.get('content') for a in doc.select('meta')}
    check(bool(meta.get('description')), f'{label}: missing description')
    check(meta.get('og:url', '').startswith(ORIGIN), f'{label}: bad OG URL')
    canonical = [a['href'] for a in doc.select('link') if a.get('rel') == 'canonical']
    check(len(canonical) == 1 and canonical[0] == meta.get('og:url'), f'{label}: canonical and OG mismatch')
    og_image = meta.get('og:image', '')
    check(og_image.startswith(ORIGIN) and resolve(og_image).exists(), f'{label}: missing social image')
    for attrs in doc.select('img'):
        check(bool(attrs.get('alt')), f'{label}: missing alt')
        check(all(attrs.get(v, '').isdigit() for v in ('width', 'height')), f'{label}: missing dimensions')
        check(attrs.get('loading') in ('eager', 'lazy'), f'{label}: missing loading policy')
        for candidate in attrs.get('srcset', '').split(','):
            if candidate.strip():
                check(resolve(candidate.strip().split()[0]).is_file(), f'{label}: missing srcset asset {candidate}')
    for tag, attrs in doc.tags:
        for key in ('href', 'src'):
            url = attrs.get(key, '')
            if not url or urlsplit(url).scheme or url.startswith('//'):
                continue
            target = resolve(url) if urlsplit(url).path else path
            check(target.is_file(), f'{label}: broken local {key}: {url}')
            fragment = urlsplit(url).fragment
            if fragment and target in pages:
                check(fragment in pages[target].ids, f'{label}: broken anchor {url}')
    check(bool(doc.json_blocks), f'{label}: missing JSON-LD')
    for block in doc.json_blocks:
        try:
            data = json.loads(block)
            graph = data['@graph']
            ids = {node['@id'] for node in graph if '@id' in node}
            check(all(n.get('@type') != 'FAQPage' for n in graph), f'{label}: unwanted FAQPage')
            for node in graph:
                for key in ('creator', 'publisher', 'isPartOf', 'about'):
                    if key in node:
                        check(node[key].get('@id') in ids, f'{label}: undefined entity reference')
                if node.get('@type') == 'VisualArtwork':
                    check(node['url'].split('#')[-1] in doc.ids, f'{label}: artwork not visible')
                    check(resolve(node['image']).is_file(), f'{label}: missing artwork image')
        except (ValueError, KeyError, TypeError) as error:
            errors.append(f'{label}: invalid JSON-LD: {error}')
    check(not [a for a in doc.select('script') if a.get('type') != 'application/ld+json' and a.get('src') != '/sketchbook.js'], f'{label}: unexpected executable script')

sitemap = ElementTree.parse(ROOT / 'sitemap.xml')
ns = {'s': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
urls = [n.text for n in sitemap.findall('s:url/s:loc', ns)]
check(set(urls) == {ORIGIN + p for p in ('/', '/bio/', '/contact/')}, 'Unexpected sitemap URLs')
for url in urls:
    check(resolve(url).is_file(), f'Sitemap target missing: {url}')
check(ORIGIN + '/sitemap.xml' in (ROOT / 'robots.txt').read_text(), 'Missing sitemap in robots.txt')
css = (ROOT / 'style.css').read_text()
for asset in re.findall(r'url\([\'\"]?([^\)\'\"]+)', css):
    check(resolve(asset).is_file(), f'Missing CSS asset: {asset}')
if errors:
    print('\n'.join(errors))
    sys.exit(1)
print(f'PASS: {len(pages)} pages, {len(urls)} sitemap routes, local links, image metadata, CSS assets, and JSON-LD entity references.')
