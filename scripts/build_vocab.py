# Build vocab from the official 2025 HSK syllabus list (krmanik/HSK-3.0-words-list), with
# meanings/segmentation from CC-CEDICT via drkameleon/complete-hsk-vocabulary.
import json, re, sys, unicodedata
from collections import defaultdict, Counter
syl_dir, cedict_json, out = sys.argv[1], sys.argv[2], sys.argv[3]
POS = {'名':'noun','动':'verb','形':'adjective','副':'adverb','介':'preposition','连':'conjunction','代':'pronoun','量':'measure word',
       '助':'particle','叹':'interjection','数':'numeral','拟声':'onomatopoeia','前缀':'prefix','后缀':'suffix','数量':'numeral'}
MARK = {}
for base, ms in {'a':'āáǎà','e':'ēéěè','i':'īíǐì','o':'ōóǒò','u':'ūúǔù','ü':'ǖǘǚǜ'}.items():
    for t, ch in enumerate(ms, 1): MARK[ch] = (base, t)
MARK.update({'ń':('n',2),'ň':('n',3),'ǹ':('n',4),'ḿ':('m',2)})
for ch,(b,t) in list(MARK.items()): MARK[ch.upper()] = (b.upper(), t)
def toneless(p): return ''.join(MARK.get(c, (c,))[0] for c in p).lower().replace('ü','v').replace('u:','v')
def to_numeric(syl):
    t = 5; s = ''
    for c in syl:
        if c in MARK: b, t = MARK[c]; s += b
        else: s += c
    return s.lower().replace('ü', 'u:') + str(t)
def clean_meaning(m): return not re.match(r'^(surname |variant of|old variant|unofficial variant|see [^ ]|used in |CL:)', m) and 'pr. [' not in m
ced = json.load(open(cedict_json)); forms = defaultdict(list)
for e in ced:
    for f in e['forms']: forms[e['simplified']].append(f)
INV = set()
for e in ced:
    for f in e['forms']:
        for x in f['transcriptions']['pinyin'].split(' '): INV.add(toneless(x))
INV |= {'r'}
def segment(py, nchars):
    s = py.replace(' ', '').replace("'", ''); tl = toneless(s); n = len(s)
    best = {0: []}
    for i in range(n):
        if i not in best: continue
        for j in range(i + 1, min(n, i + 6) + 1):
            if tl[i:j] in INV and j not in best: best[j] = best[i] + [s[i:j]]
    return best.get(n) or [s]
def html_blocks(html):
    out = []
    for m in re.finditer(r'pinYinWrapper">(.*?)</span></span>\s*<ul>(.*?)</ul>', html):
        out.append((re.sub(r'<[^>]+>', '', m.group(1)).strip(), [re.sub(r'<[^>]+>', '', x).strip() for x in re.findall(r'<li>(.*?)</li>', m.group(2))]))
    return out
rows = []
for lv in range(1, 6):
    for line in open(f'{syl_dir}/HSK_Level_{lv}.txt', encoding='utf-8'):
        c = line.rstrip('\n').split('\t')
        if len(c) < 7: continue
        rows.append(dict(h=c[0], py=c[2].strip(), lvl=lv, pos=c[5], freq=int(c[6] or 0), html=c[7] if len(c) > 7 else ''))
# merge same word+reading (keep lowest level)
merged = {}
for r in rows:
    k = (r['h'], r['py'].lower())
    if k in merged:
        m = merged[k]; m['pos'] += '、' + r['pos']; continue
    merged[k] = dict(r)
words = []; miss = 0; stats = Counter()
for (h, _), r in merged.items():
    py = r['py'].split('/')[0].replace('’', '').replace("'", '').replace('-', '').strip(); tl = toneless(py).replace(' ', '').replace("'", '')
    cands = forms.get(h, [])
    exact = [f for f in cands if f['transcriptions']['pinyin'].replace(' ', '').lower() == py.replace(' ', '').lower()]
    loose = [f for f in cands if toneless(f['transcriptions']['pinyin']).replace(' ', '') == tl]
    cap = lambda x: x['transcriptions']['pinyin'][:1].isupper()
    exact.sort(key=cap); loose.sort(key=cap)
    f = (exact or loose or [None])[0]
    stats['exact' if exact else 'loose' if loose else 'none'] += 1
    if f:
        seg_src = f['transcriptions']['pinyin'].split(' ')
        # split syllabus pinyin with the same syllable lengths as the CEDICT reading
        s = py.replace(' ', '').replace("'", ''); parts = []; i = 0
        for sp in seg_src:
            n = len(sp); parts.append(s[i:i+n]); i += n
        if i != len(s) or not all(parts): parts = seg_src
        if len([x for x in parts if x != 'r']) != len(h.replace('儿', '')) and '儿' not in h: parts = segment(py, len(h))
        spaced = ' '.join(parts)
        means = []
        for g in (exact or loose):
            means += [m for m in g['meanings'] if clean_meaning(m) and m not in means]
        if not means: means = f['meanings'][:2]
    else:
        miss += 1; spaced = ' '.join(segment(py, len(h))); means = []
    if not means:
        bl = html_blocks(r['html'])
        pick = [b for b in bl if b[0].replace(' ', '').lower() == py.replace(' ', '').lower()] or [b for b in bl if toneless(b[0]).replace(' ', '') == tl] or bl
        if pick: means = [m for m in pick[0][1] if clean_meaning(m)] or pick[0][1][:2]
    spaced = re.sub(r' r$', 'r', spaced).replace(' r ', 'r ')
    numeric = ' '.join(to_numeric(x) for x in spaced.split(' '))
    others = sorted({x['transcriptions']['pinyin'] for x in cands if toneless(x['transcriptions']['pinyin']).replace(' ','') != tl and not x['transcriptions']['pinyin'][:1].isupper()})
    pos = []
    for p in re.split(r'[、（）()，,]', r['pos']):
        p = p.strip()
        if p and POS.get(p, p) not in pos: pos.append(POS.get(p, p))
    words.append(dict(h=h, p=spaced, n=numeric, m=means[:4], l=r['lvl'], q=r['freq'], s=pos, **({'a': others[:3]} if others else {})))
for w in words:
    if w['h'] == '没法儿' and not w['m']: w['m'] = ["can't do anything about it", 'there is no way']
words.sort(key=lambda w: (w['l'], -w['q']))
for i, w in enumerate(words, 1): w['i'] = i; w['q'] = i
nomean = [w['h'] for w in words if not w['m']]
json.dump(words, open(out, 'w'), ensure_ascii=False, separators=(',', ':'))
print(len(words), Counter(w['l'] for w in words), stats, 'no meaning:', len(nomean), nomean[:30])
for h in ['说','要','个','也','着','为','好','一下','一会儿','看','都','还']:
    print([ (w['h'],w['p'],w['n'],w['l'],w['m'][:2],w['s']) for w in words if w['h']==h])
