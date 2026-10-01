"""Build Part I sections from the retained Project Gutenberg Elwes source."""
import json, re
from pathlib import Path
root = Path(__file__).resolve().parents[1]
text = (root / 'data/elwes-source.txt').read_text()
part = text.split('PART I. CONCERNING GOD.', 1)[1].split('Part II.', 1)[0]
def roman(s):
    values = {'I':1,'V':5,'X':10,'L':50}
    return sum(-values[c] if i+1<len(s) and values[c]<values[s[i+1]] else values[c] for i,c in enumerate(s))
sections=[]
def add_chunks(block, pattern, prefix):
    matches=list(re.finditer(pattern, block, re.M))
    for i,m in enumerate(matches):
        end=matches[i+1].start() if i+1<len(matches) else len(block)
        sections.append({'id':prefix+f'{roman(m[1]):02}', 'text':block[m.start():end].strip()})
add_chunks(part.split('DEFINITIONS.',1)[1].split('AXIOMS.',1)[0],r'^([IVX]+)\.  ', '1D')
add_chunks(part.split('AXIOMS.',1)[1].split('PROPOSITIONS.',1)[0],r'^([IVX]+)\.  ', '1A')
add_chunks(part.split('PROPOSITIONS.',1)[1].split('APPENDIX:',1)[0],r'^PROP\. ([IVX]+)\. ', '1P')
for section in sections:
    section['paragraphs']=[' '.join(p.splitlines()) for p in section.pop('text').split('\n\n') if p.strip()]
    for i,p in enumerate(section['paragraphs']):
        m=re.match(r'^Coroll(?:ary|\.)\s*([IVX]+)?[.\-]',p)
        if m: section.setdefault('anchors',{})[str(i)] = section['id']+'C'+f'{roman(m[1]) if m[1] else 1:02}'
sections.append({'id':'appendix','paragraphs':[' '.join(p.splitlines()) for p in part.split('APPENDIX:',1)[1].strip().split('\n\n') if p.strip()]})
(root/'data/text.json').write_text(json.dumps(sections,ensure_ascii=False,indent=2)+'\n')
graph=json.loads((root/'data/graph.json').read_text())
anchors={s['id'] for s in sections}|{a for s in sections for a in s.get('anchors',{}).values()}
assert all(n['name'] in anchors for n in graph['nodes']), 'Unmapped graph node'
print(f'{len(sections)} reading sections; all {len(graph["nodes"])} nodes have text anchors')
