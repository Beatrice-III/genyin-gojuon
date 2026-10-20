from pathlib import Path
import urllib.request
import os
os.environ['TEMP']=os.environ['TMP']=str(Path('work').resolve())
p=Path('work/NotoSerifCJKjp-Regular.otf')
if not p.exists(): urllib.request.urlretrieve('https://raw.githubusercontent.com/notofonts/noto-cjk/main/Serif/OTF/Japanese/NotoSerifCJKjp-Regular.otf',p)
from fontTools import subset
chars=set(''.join(x.read_text(encoding='utf-8') for x in [Path('index.html'),*Path('js').glob('*.js')]))
options=subset.Options(); options.flavor='woff2'; options.name_IDs=['*']; options.name_legacy=True
font=subset.load_font(str(p),options);sub=subset.Subsetter(options);sub.populate(text=''.join(chars));sub.subset(font)
renames={1:'Source Kana',3:'SourceKana-Regular-2.0',4:'Source Kana Regular',6:'SourceKana-Regular',16:'Source Kana',17:'Regular'}
for record in font['name'].names:
 if record.nameID in renames: record.string=renames[record.nameID].encode(record.getEncoding(),errors='replace')
subset.save_font(font,'assets/fonts/SourceKana.woff2',options)
urllib.request.urlretrieve('https://raw.githubusercontent.com/notofonts/noto-cjk/main/Serif/LICENSE','assets/fonts/OFL.txt')
print('font subset',Path('assets/fonts/SourceKana.woff2').stat().st_size)
