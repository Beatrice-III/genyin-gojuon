import hashlib,json,subprocess,concurrent.futures
from pathlib import Path
files=list(Path('assets/audio/kana').glob('*.mp3'))
def check(p):
 r=subprocess.run(['ffmpeg','-v','error','-i',str(p),'-f','null','-'],capture_output=True)
 return {'id':p.stem,'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'decode':r.returncode==0}
rows=list(concurrent.futures.ThreadPoolExecutor(4).map(check,files))
assert len(rows)==46 and all(r['decode'] for r in rows)
assert len(set(r['sha256'] for r in rows))>=45
Path('outputs/内置音频验证.json').write_text(json.dumps({'count':46,'full_decode':'passed','uniqueStreams':len(set(r['sha256'] for r in rows)),'clips':rows,'boundary':'Synthetic single-kana examples; automated decoding does not establish human phonetic review.'},ensure_ascii=False,indent=2),encoding='utf-8')
print('46 embedded clips decoded; distinct streams:',len(set(r['sha256'] for r in rows)))
