"""Edit the public, practice-led product walkthrough from real UI capture.

The released app and APK are read-only inputs. All render intermediates stay on D:.
Usage: python tools/render_product_demo.py --preview | --render | --verify
"""
from __future__ import annotations
import argparse, hashlib, json, math, os, subprocess, sys
from pathlib import Path
from functools import lru_cache
sys.dont_write_bytecode=True
ROOT=Path(__file__).resolve().parents[1]
WORK=ROOT/'work/video_v3'; OUT=ROOT/'outputs/video_v3'; CAP=Path(os.environ.get('GENYIN_VIDEO_CAPTURE',str(WORK/'capture2x')))
for p in (WORK,OUT,WORK/'render_cache'):p.mkdir(parents=True,exist_ok=True)
for key in ('TEMP','TMP','TMPDIR','XDG_CACHE_HOME'):os.environ[key]=str(WORK/'render_cache')
import numpy as np
from PIL import Image,ImageDraw,ImageFont,ImageFilter
FF=Path(r'D:\ffmpeg-2025-03-31-git-35c091f4b7-full_build\bin\ffmpeg.exe')
FP=FF.with_name('ffprobe.exe')
W,H,FPS=1920,1080,15
VIDEO=OUT/'源音五十音_小音陪你练_1080p.mp4'
PAPER='#F7F5EF';INK='#203C36';RED='#D88B72';WHITE='#F6F7EE';MUTED='#ADC4B6'
SX,SY,SW,SH=88,94,430,900
LX,LY,LW,LH=620,154,1220,756
ORDER=['02_confusable','01_kana','03_listening','04_cross','09_origin','05_typing','06_trace','07_memory','08_course']
TITLES={'02_confusable':'认错了？再练一次','01_kana':'记不住，就点开字卡','03_listening':'只凭声音，选出假名','04_cross':'平假名 ↔ 片假名','09_origin':'从汉字，找回假名','05_typing':'拿掉选项，自己输入','06_trace':'跟着底稿，完整写一遍','07_memory':'藏起提示，再写一次','08_course':'照着课程学，也能自己选'}
SHORT={'02_confusable':'辨形与错题','01_kana':'字卡与来源','03_listening':'听音辨字','04_cross':'平片对应','09_origin':'书源配对','05_typing':'输入读音','06_trace':'临摹','07_memory':'默写','08_course':'课程与定制'}

def run(args,**kw):return subprocess.run([str(x) for x in args],check=True,capture_output=True,**kw)
def probe(p):return json.loads(run([FP,'-v','error','-show_format','-show_streams','-of','json',p]).stdout)
@lru_cache(maxsize=40)
def font(size,bold=False,jp=False):
    return ImageFont.truetype(str(Path(r'C:\Windows\Fonts')/('YuGothM.ttc' if jp else 'msyhbd.ttc' if bold else 'msyh.ttc')),size)
def load_scene(sid):return json.loads((CAP/(sid+'.json')).read_text('utf-8'))
def mark(scene,name):return next(e['time'] for e in scene['events'] if e.get('name')==name)
def source_time(scene,t):
    for p in scene['parts']:
        if p['local']<=t<p['local']+p['duration']-1e-7:
            return p['start'] if p.get('freeze') else min(p['end'],p['start']+t-p['local'])
    return scene['parts'][-1]['end']
def mapped(scene,t):
    for p in scene['parts']:
        if not p.get('freeze') and not p.get('external') and p['start']-.01<=t<=p['end']+.01:return p['local']+t-p['start']
    return None

def make_plan():
    voices={x['id']:x for x in voice_clips()}
    scenes=[];cursor=0
    for sid in ORDER:
        sc=load_scene(sid);sc['parts']=[]
        ranges=[(0,sc['duration'],False,0)]
        if sid=='02_confusable':
            q=max(0,mark(sc,'question')-.15)
            end=mark(sc,'retry_correct')+2.1
            result=max(end,mark(sc,'session_results')-.15)
            ranges=[(q,q,True,voices['hook']['duration']+.6),(q,end,False,0),(result,sc['duration'],False,0)]
        if sid=='03_listening':
            slow=next(e['time'] for e in sc['media'] if e['type']=='play' and e.get('rate')==.75)
            pause=max(0,slow-.15)
            ranges=[(0,0,True,voices['listening']['duration']+.7),(0,pause,False,0),(pause,pause,True,voices['slow']['duration']+.7),(pause,sc['duration'],False,0)]
        if sid=='08_course':ranges.append((sc['duration']-.07,sc['duration']-.07,True,voices['outro']['duration']+.8))
        if sid=='07_memory':ranges.append((sc['duration']-.07,sc['duration']-.07,True,1.5))
        local=0
        for start,end,freeze,hold in ranges:
            dur=hold if freeze else end-start
            dur=math.ceil(dur*FPS)/FPS
            sc['parts'].append({'start':start,'end':end,'freeze':freeze,'duration':dur,'local':local})
            local+=dur
        if sid=='02_confusable' and (CAP/'10_explanation.json').exists():
            explanation=load_scene('10_explanation');explanation['camera_cues']=[(0,607,290)]
            insert=mark(sc,'wrong_feedback')+1.05
            first=sc['parts'][1];old_end=first['end'];old_duration=first['duration']
            first['end']=insert;first['duration']=math.ceil((insert-first['start'])*FPS)/FPS
            ext_start=mark(explanation,'full_explanation')
            extra={'start':ext_start,'end':ext_start+3.6,'duration':3.6,'freeze':False,'external':True,'path':explanation['path']}
            tail={'start':insert,'end':old_end,'duration':math.ceil((old_end-insert)*FPS)/FPS,'freeze':False}
            sc['parts'][2:2]=[extra,tail];sc['externalMeta']=explanation
            local=0
            for part in sc['parts']:part['local']=local;local+=part['duration']
        sc['start']=cursor;sc['edited_duration']=local;cursor+=local
        scenes.append(sc)
    return scenes,cursor

@lru_cache(maxsize=1)
def voice_clips():
    raw=json.loads((OUT/'配音工程/synthesis.json').read_text('utf-8'))
    clips=[]
    import re
    for item in raw:
        chunks=[x for x in re.findall(r'[^。！？]+[。！？]?',item['text']) if x]
        weights=[len(x)+2 for x in chunks];total=sum(weights);at=.06;boundaries=[]
        for text,weight in zip(chunks,weights):
            length=(item['duration']-.12)*weight/total
            boundaries.append({'text':text,'start':at,'end':at+length});at+=length
        path=OUT/'配音工程'/(item['id']+'.wav')
        clips.append({**item,'path':str(path),'boundaries':boundaries})
    return clips

def voice_plan(scenes):
    clips={v['id']:v for v in voice_clips()};schedule=[]
    def add(sc,key,t):
        c=clips[key];t=max(0,min(t,sc['edited_duration']-c['duration']-.1))
        schedule.append({**c,'start':sc['start']+t,'scene':sc['id']})
    for sc in scenes:
        sid=sc['id']
        if sid=='02_confusable':
            add(sc,'hook',.1)
            wrong=mapped(sc,mark(sc,'wrong_feedback'))
            retry=mapped(sc,mark(sc,'retry_question'))
            result=mapped(sc,mark(sc,'session_results'))
            add(sc,'wrong',wrong+.05)
            add(sc,'retry_explain',wrong+clips['wrong']['duration']+.35)
            add(sc,'retry',retry-.2)
            add(sc,'results',result+.2)
        elif sid=='01_kana':
            add(sc,'intro',.15)
            add(sc,'lookup',clips['intro']['duration']+.5)
        elif sid=='03_listening':
            add(sc,'listening',.15)
            add(sc,'slow',sc['parts'][2]['local']+.15)
        elif sid=='04_cross':add(sc,'cross',.2)
        elif sid=='09_origin':add(sc,'origin',.2)
        elif sid=='05_typing':add(sc,'typing',.15)
        elif sid=='06_trace':add(sc,'trace',.1)
        elif sid=='07_memory':
            add(sc,'memory',.15)
            add(sc,'reveal',mapped(sc,mark(sc,'memory_revealed'))+.1)
        elif sid=='08_course':
            add(sc,'course',.2)
            add(sc,'outro',sc['edited_duration']-clips['outro']['duration']-.4)
    schedule.sort(key=lambda x:x['start'])
    for a,b in zip(schedule,schedule[1:]):
        if a['start']+a['duration']>b['start']+.05:raise ValueError('Overlapping narration: '+a['id']+' / '+b['id'])
    return schedule

@lru_cache(maxsize=64)
def background(title,short,chapter):
    bg=Image.new('RGB',(W,H),INK);d=ImageDraw.Draw(bg)
    for x in range(570,1910,35):
        for y in range(130,945,35):d.ellipse((x,y,x+1,y+1),fill='#2A463F')
    d.text((90,31),'源音 · 五十音',font=font(24,True),fill=WHITE)
    d.text((620,61),title,font=font(38,True),fill=WHITE)
    d.text((1838,34),f'{chapter:02d}  /  {short}',font=font(21),fill=MUTED,anchor='ra')
    d.line((620,121,1838,121),fill='#547165',width=1)
    # App and magnifier are the only large visual surfaces.
    d.rounded_rectangle((SX-9,SY-9,SX+SW+9,SY+SH+9),radius=31,fill='#112B26',outline='#668377',width=2)
    d.rounded_rectangle((LX-2,LY-2,LX+LW+2,LY+LH+2),radius=19,fill=PAPER,outline='#668377',width=2)
    d.text((SX+SW/2,1025),'跟着听 · 跟着选 · 动手写',font=font(20),fill=MUTED,anchor='mm')
    return bg

def camera_cues(sc):
    cues=[(0,500.,440.)];sid=sc['id']
    if sid=='01_kana':cues=[(0,650.,280.)]
    if sid=='08_course':cues=[(0,360.,280.)]
    for e in sc['events']:
        t=e['time'];typ=e['type'];name=e.get('name','');label=e.get('label','')
        center=None;height=280.;rects=e.get('rects',{})
        if typ=='mark':
            if name in ('home',):center=650
            elif name in ('detail',):center=355
            elif name=='origin' and sid=='01_kana':center=465
            elif name=='comparison':center=420
            elif 'question' in name:
                r=rects.get('#quiz-q-main');choices=rects.get('#quiz-choices-container')
                if r and r['visible'] and choices and choices['visible']:
                    top=r['y']-32;bottom=min(817,choices['y']+choices['height']+20)
                    center=(top+bottom)/2;height=max(340,bottom-top)
                else:center=(r['y']+r['height']/2+80) if r and r['visible'] else 440;height=380
            elif 'feedback' in name or 'correct' in name:
                r=rects.get('#quiz-feedback-container');center=(r['y']+145) if r and r['visible'] else 630
            elif 'results' in name:center=370
            elif name.startswith('setup'):center=470
            elif name=='course':center=400
        elif typ=='tap':
            if label=='下一题':center=500;height=440
            elif label in ('提交罗马字','罗马字输入框'):center=e['y']-10
            elif '.quiz-choice' in label or ('（' in label):center=e['y']-5
            elif label in ('重听发音','慢速发音'):center=e['y']
            elif label=='重练本局错题':center=e['y']
            elif label.startswith('选择'):center=e['y']
        elif typ=='answer':
            r=rects.get('#quiz-feedback-container');center=(r['y']+145) if r and r['visible'] else 620
        if center is not None:cues.append((max(0,t-.15),min(710,max(180,center)),height))
    return sorted(cues)

def camera_y(sc,source_t):
    cues=sc['camera_cues'];old=cues[0][1:]
    for at,cy,ch in cues[1:]:
        new=(cy,ch)
        if source_t<at:return old
        if source_t<at+.65:
            p=(source_t-at)/.65;p=p*p*(3-2*p)
            return tuple(a+(b-a)*p for a,b in zip(old,new))
        old=new
    return old

def caption(schedule,t):
    for c in schedule:
        if c['start']<=t<=c['start']+c['duration']+.12:
            local=t-c['start']
            for b in c['boundaries']:
                if b['start']-.1<=local<=b['end']+.15:return b['text']
    return ''
def wrap(text,count=24):
    rows=[]
    while len(text)>count:
        cut=count
        for p in range(count,max(8,count-8),-1):
            if text[p-1] in '，。；？！，、':cut=p;break
        rows.append(text[:cut]);text=text[cut:]
    if text:rows.append(text)
    return rows[:2]

def composite(sc,local,shot,schedule,total,chapter):
    sid=sc['id'];st=source_time(sc,local);t=sc['start']+local
    title=TITLES[sid]
    active=next((p for p in sc['parts'] if p['local']<=local<p['local']+p['duration']-1e-7),sc['parts'][-1])
    camera_sc=sc['externalMeta'] if active.get('external') else sc
    if sid=='02_confusable' and st>=mark(sc,'retry_question') and st<mark(sc,'retry_correct')+2:title='刚才的错题，又回来了'
    if sid=='08_course' and local>sc['edited_duration']-6.5:title='从第一个假名，开始练'
    if active.get('external'):title='选错，马上看解释'
    img=background(title,SHORT[sid],chapter).copy();pixel_scale=shot.width/430
    phone=shot.resize((SW,SH),Image.Resampling.LANCZOS)
    mask=Image.new('L',(SW,SH));ImageDraw.Draw(mask).rounded_rectangle((0,0,SW,SH),radius=23,fill=255)
    img.paste(phone,(SX,SY),mask)
    writing=sid in ('06_trace','07_memory')
    if writing:
        events=[e for e in sc['events'] if e['time']<=st and e.get('rects',{}).get('#calligraphy-canvas',{}).get('visible')]
        r=events[-1]['rects']['#calligraphy-canvas'] if events else {'x':54,'y':260,'width':320,'height':320}
        box=(r['x']-17,r['y']-17,r['x']+r['width']+17,r['y']+r['height']+17)
        crop=shot.crop(tuple(round(v*pixel_scale) for v in box));scale=min(LW/crop.width,LH/crop.height)
        size=(round(crop.width*scale),round(crop.height*scale));crop=crop.resize(size,Image.Resampling.LANCZOS)
        px=LX+(LW-size[0])//2;py=LY+(LH-size[1])//2
        img.paste(crop,(px,py));lens=(box,px,py,scale*pixel_scale)
    else:
        cy,ch=camera_y(camera_sc,st)
        if sid=='02_confusable' and active.get('freeze') and active['local']==0:
            event=next(e for e in sc['events'] if e.get('name')=='question')
            main=event['rects']['#quiz-q-main'];choices=event['rects']['#quiz-choices-container']
            top=main['y']-32;bottom=choices['y']+choices['height']+20
            cy=(top+bottom)/2;ch=max(340,bottom-top)
        y=max(0,min(900-ch,cy-ch/2))
        box=(0,y,430,y+ch);crop=shot.crop(tuple(round(v*pixel_scale) for v in box))
        scale=min(LW/430,LH/ch);size=(round(430*scale),round(ch*scale))
        crop=crop.resize(size,Image.Resampling.LANCZOS);px=LX+(LW-size[0])//2;py=LY+(LH-size[1])//2
        m=Image.new('L',size);ImageDraw.Draw(m).rounded_rectangle((0,0,size[0],size[1]),radius=14,fill=255)
        img.paste(crop,(px,py),m);lens=(box,px,py,scale)
        d=ImageDraw.Draw(img)
        # Show where the detail window comes from without re-drawing any UI.
        d.rounded_rectangle((SX+3,SY+y,SX+SW-3,SY+y+ch),radius=8,outline=RED,width=2)
        d.line((SX+SW+14,SY+y+ch/2,LX-18,LY+LH/2),fill='#668377',width=2)
    # Tap and pen cues come from the real interaction event coordinates.
    overlay=Image.new('RGBA',(W,H));od=ImageDraw.Draw(overlay)
    for e in camera_sc['events']:
        if e['type'] not in ('tap','draw'):continue
        age=st-e['time'];life=.65 if e['type']=='tap' else .12
        if not 0<=age<life:continue
        rad=7+age*18 if e['type']=='tap' else 4
        alpha=round(220*(1-age/life));x,y=e['x'],e['y']
        od.ellipse((SX+x-rad,SY+y-rad,SX+x+rad,SY+y+rad),outline=(204,111,83,alpha),width=3)
        b,px,py,scale=lens
        if b[0]<=x<=b[2] and b[1]<=y<=b[3]:
            cx=px+(x-b[0])*scale;cy=py+(y-b[1])*scale;rr=rad*1.7
            od.ellipse((cx-rr,cy-rr,cx+rr,cy+rr),outline=(204,111,83,alpha),width=4)
    img=Image.alpha_composite(img.convert('RGBA'),overlay)
    d=ImageDraw.Draw(img);text=caption(schedule,t)
    if text:
        lines=wrap(text)
        for i,line in enumerate(lines):d.text((1230,954+i*47),line,font=font(35),fill=WHITE,anchor='mt')
    d.line((620,1051,1840,1051),fill='#48675A',width=3)
    d.line((620,1051,620+1220*min(1,t/total),1051),fill=RED,width=3)
    return img.convert('RGB')

@lru_cache(maxsize=30)
def dimensions(path):
    p=probe(path);v=next(s for s in p['streams'] if s['codec_type']=='video');return v['width'],v['height']
def frame_at(path,t):
    data=run([FF,'-v','error','-ss',f'{t:.4f}','-i',path,'-frames:v','1','-f','rawvideo','-pix_fmt','rgb24','pipe:1']).stdout
    return Image.frombytes('RGB',dimensions(str(path)),data)

def preview():
    fake={'id':'02_confusable','events':[],'parts':[{'start':0,'end':5,'local':0,'duration':5}],
          'start':0,'edited_duration':5,'camera_cues':[(0,500,440)]}
    def fake_mark(sc,name):return 100
    # A provisional preview can be made while raw capture is still running.
    path=CAP/'02_confusable_question.png'
    if not path.exists():path=WORK/'capture/02_confusable_question.png'
    shot=Image.open(path).convert('RGB')
    fake['events']=[{'time':100,'type':'mark','name':'retry_question'},{'time':100,'type':'mark','name':'retry_correct'}]
    img=composite(fake,1,shot,[],150,1)
    img.save(WORK/'composition_preview.jpg',quality=95)
    print(WORK/'composition_preview.jpg')

def storyboard():
    scenes,total=make_plan();schedule=voice_plan(scenes)
    for sc in scenes:sc['camera_cues']=camera_cues(sc)
    for idx,sc in enumerate(scenes):
        sid=sc['id']
        wanted={'02_confusable':'wrong_feedback','01_kana':'detail','03_listening':'listen_question','04_cross':'cross_question','09_origin':'origin_question','05_typing':'typing_feedback','06_trace':'trace_complete','07_memory':'memory_revealed','08_course':'setup_selection'}[sid]
        st=mark(sc,wanted)+.35;t=mapped(sc,st)
        if t is None:t=2
        shot=frame_at(sc['path'],st)
        composite(sc,t,shot,schedule,total,idx+1).save(WORK/f'story_{sid}.jpg',quality=96)
    print('Storyboard frames ready',flush=True)

def decode_audio(path,rate=1):
    args=[FF,'-v','error','-i',path]
    if rate!=1:args+=['-af',f'atempo={rate}']
    args+=['-f','f32le','-ar','48000','-ac','1','pipe:1']
    return np.frombuffer(run(args).stdout,dtype='<f4').copy()
def sound_tone(name,args):
    sr=48000;dur=.5;a=np.zeros(round(dur*sr),np.float32)
    if name=='playWrongSfx':notes=[(220,0),(196,.13)]
    else:
        combo=args[0] if args else 1;base=min(523.25*1.05946**min(combo-1,8),987.77)
        notes=[(base,0),(base*1.25,.065)]
    for freq,offset in notes:
        t=np.arange(round(.23*sr))/sr;env=.075*np.exp(-t*23)
        wave=np.sin(2*np.pi*freq*t)
        if name=='playWrongSfx':wave=2/np.pi*np.arcsin(wave)
        start=round(offset*sr);a[start:start+len(t)]+=wave*env
    return a

def mix_audio(scenes,schedule,total):
    sr=48000;n=math.ceil(total*sr);voice=np.zeros(n,np.float32);native=np.zeros(n,np.float32);sfx=np.zeros(n,np.float32)
    def place(track,samples,at,gain=1):
        start=max(0,round(at*sr));end=min(len(track),start+len(samples));track[start:end]+=samples[:end-start]*gain
    for c in schedule:
        a=decode_audio(c['path']);active=a[np.abs(a)>.004]
        gain=min(3,.115/(np.sqrt(np.mean(active**2))+1e-9)) if len(active) else 1
        place(voice,a,c['start'],gain)
    native_log=[]
    for sc in scenes:
        media=sc.get('media',[])
        for i,e in enumerate(media):
            local=mapped(sc,e['time'])
            if local is None:continue
            at=sc['start']+local
            if e['type']=='play':
                p=ROOT/e['path']
                if not p.is_file():raise FileNotFoundError(p)
                rate=e.get('rate',1);a=decode_audio(p,rate)
                limit=len(a)/sr
                for after in media[i+1:]:
                    if after['type'] in ('pause','play') and after['time']>e['time']+.005:
                        limit=min(limit,after['time']-e['time']);break
                a=a[:round(limit*sr)];active=a[np.abs(a)>.004]
                gain=min(4,.12/(np.sqrt(np.mean(active**2))+1e-9)) if len(active) else 1
                place(native,a,at,gain)
                native_log.append({'scene':sc['id'],'time':at,'path':e['path'],'rate':rate,'duration':len(a)/sr})
            elif e['type']=='sfx':place(sfx,sound_tone(e['name'],e.get('args',[])),at,.65)
    # Sparse, original plucks. Listening practice is left completely music-free.
    bg=np.zeros(n,np.float32)
    for at in np.arange(0,total,2.8):
        freq=[220,293.665,329.628,440,391.995][int(at/2.8)%5]
        t=np.arange(round(1.9*sr))/sr
        a=(np.sin(2*np.pi*freq*t)+.2*np.sin(2*np.pi*freq*2*t))*np.exp(-t*2.5)*.008
        a*=np.minimum(1,t/.018);place(bg,a,float(at))
    env=np.ones(n,np.float32)
    for c in schedule:
        s=max(0,round((c['start']-.1)*sr));e=min(n,round((c['start']+c['duration']+.2)*sr));env[s:e]=.3
    for sc in scenes:
        if sc['id']=='03_listening':bg[round(sc['start']*sr):round((sc['start']+sc['edited_duration'])*sr)]=0
    # Narration is intentionally absent over all listening examples.
    for item in native_log:
        s=max(0,round(item['time']*sr));e=min(n,round((item['time']+item['duration'])*sr))
        if item['scene']=='03_listening' and np.max(np.abs(voice[s:e]),initial=0)>.005:
            raise ValueError('Narration obscures listening example')
    duck=np.where(np.abs(voice)>.006,.5,1).astype(np.float32)
    # Smooth speech-dependent gain over 80 ms without a slow full convolution.
    step=480;blocks=np.array([duck[i:i+step].min() for i in range(0,n,step)])
    duck=np.interp(np.arange(n),np.arange(len(blocks))*step,blocks).astype(np.float32)
    mixed=voice+native*duck+sfx+bg*env
    mixed[:round(.12*sr)]*=np.linspace(0,1,round(.12*sr));mixed[-round(.5*sr):]*=np.linspace(1,0,round(.5*sr))
    raw=WORK/'mix.f32';mixed.astype('<f4').tofile(raw)
    run([FF,'-y','-v','error','-f','f32le','-ar',str(sr),'-ac','1','-i',raw,'-af','loudnorm=I=-16:TP=-1.5:LRA=10','-ar','48000','-ac','2','-c:a','aac','-b:a','192k',WORK/'mix.m4a'])
    (OUT/'声音与操作时间线.json').write_text(json.dumps({'nativeAudio':native_log,'voice':[{'id':c['id'],'text':c['text'],'time':c['start'],'duration':c['duration']} for c in schedule]},ensure_ascii=False,indent=2),'utf-8')

def write_texts(scenes,schedule,total):
    def stamp(t):
        m=round(t*1000);h,m=divmod(m,3600000);mi,m=divmod(m,60000);s,ms=divmod(m,1000)
        return f'{h:02d}:{mi:02d}:{s:02d},{ms:03d}'
    subs=[]
    for c in schedule:
        for b in c['boundaries']:subs.append((c['start']+b['start'],c['start']+b['end'],b['text']))
    (OUT/'源音五十音_小音陪你练.srt').write_text('\n\n'.join(f'{i+1}\n{stamp(s)} --> {stamp(e)}\n'+ '\n'.join(wrap(t)) for i,(s,e,t) in enumerate(subs))+'\n','utf-8')
    (OUT/'旁白稿.txt').write_text('\n'.join(c['text'] for c in schedule),'utf-8')
    (OUT/'B站投稿文案.md').write_text('''# 投稿文案

标题：五十音总是认反？跟着做一轮听、认、写练习｜源音·五十音

简介：
给汉语母语者的五十音学习手帖。这次直接跟着实际练习，看看怎样辨形、听音选字、平片对照、输入读音，再亲手写一遍。

视频里完整展示了认错后的解释、三题后的自动复考，以及一轮结束后的错题重练；也能查汉字来源、选择课程，或自己设置题型与范围。

应用安装包见随附文件，手机本地保存学习进度。完整源码：https://github.com/Beatrice-III/genyin-gojuon

画面使用应用真实界面操作录制，配以局部放大；旁白为本机 Qwen3-TTS 合成的小音女声。日语示范使用应用内置发音，声音按实际播放事件同步。

标签：五十音、日语入门、假名、学习软件、安卓应用
''','utf-8')
    (WORK/'edit_plan.json').write_text(json.dumps({'duration':total,'scenes':scenes,'voice':schedule},ensure_ascii=False,indent=2),'utf-8')

def render():
    scenes,total=make_plan();schedule=voice_plan(scenes)
    for sc in scenes:sc['camera_cues']=camera_cues(sc)
    write_texts(scenes,schedule,total);mix_audio(scenes,schedule,total)
    picture=WORK/'picture.mp4';log=(WORK/'render.log').open('wb')
    encoder=subprocess.Popen([str(FF),'-y','-f','rawvideo','-pixel_format','rgb24','-video_size',f'{W}x{H}','-framerate',str(FPS),'-i','pipe:0','-an','-c:v','libx264','-preset','fast','-crf','18','-r','30','-pix_fmt','yuv420p',str(picture)],stdin=subprocess.PIPE,stderr=log,stdout=subprocess.DEVNULL)
    try:
        for index,sc in enumerate(scenes):
            print('Rendering',sc['id'],round(sc['edited_duration'],2),'seconds',flush=True)
            for part in sc['parts']:
                n=round(part['duration']*FPS);decoder=None
                source_path=part.get('path',sc['path'])
                if part.get('freeze'):shot=frame_at(source_path,part['start'])
                else:
                    decoder=subprocess.Popen([str(FF),'-v','error','-ss',str(part['start']),'-i',source_path,'-vf',f'fps={FPS}','-frames:v',str(n),'-f','rawvideo','-pix_fmt','rgb24','pipe:1'],stdout=subprocess.PIPE,stderr=subprocess.DEVNULL)
                for i in range(n):
                    if decoder:
                        dims=dimensions(source_path);size=dims[0]*dims[1]*3
                        data=decoder.stdout.read(size)
                        if len(data)==size:shot=Image.frombytes('RGB',dims,data)
                        elif i==0:raise RuntimeError('Missing capture frame')
                    local=part['local']+i/FPS
                    img=composite(sc,local,shot,schedule,total,index+1)
                    if i==min(n-1,round(2.0*FPS)):
                        img.save(WORK/f"preview_{sc['id']}_{part['local']:.1f}.jpg",quality=94)
                    encoder.stdin.write(img.tobytes())
                if decoder:decoder.stdout.close();decoder.wait()
            print('Finished',sc['id'],flush=True)
    finally:
        encoder.stdin.close();encoder.wait();log.close()
    if encoder.returncode:raise RuntimeError((WORK/'render.log').read_text(errors='replace')[-3000:])
    run([FF,'-y','-v','error','-i',picture,'-i',WORK/'mix.m4a','-map','0:v','-map','1:a','-c','copy','-t',f'{total:.4f}','-movflags','+faststart','-metadata','title=源音·五十音｜听、认、写、练',VIDEO])
    create_cover(scenes)
    print('Completed',VIDEO,total,flush=True)

def create_cover(scenes):
    sc=next(s for s in scenes if s['id']=='02_confusable')
    shot=frame_at(sc['path'],mark(sc,'question')+.2)
    img=Image.new('RGB',(1920,1080),INK);d=ImageDraw.Draw(img)
    d.text((105,65),'源音 · 五十音',font=font(33,True),fill=WHITE)
    d.text((105,245),'シ  ツ  ソ  ン',font=font(103,jp=True),fill=RED)
    d.text((105,420),'看着认识，',font=font(91,True),fill=WHITE)
    d.text((105,545),'一练就混？',font=font(91,True),fill=WHITE)
    d.text((110,765),'听音 · 对照 · 输入 · 默写',font=font(33),fill=MUTED)
    d.text((110,850),'跟着做一轮真实练习',font=font(35,True),fill=WHITE)
    device=shot.resize((430,900),Image.Resampling.LANCZOS);img.paste(device,(1320,88))
    d=ImageDraw.Draw(img);d.rounded_rectangle((1309,77,1761,999),radius=25,outline=MUTED,width=3)
    img.save(OUT/'源音五十音_实操版封面_1920x1080.png')

def verify():
    p=probe(VIDEO);run([FF,'-v','error','-i',VIDEO,'-f','null','-'])
    v=next(x for x in p['streams'] if x['codec_type']=='video');a=next(x for x in p['streams'] if x['codec_type']=='audio')
    assert (v['width'],v['height'],v['codec_name'],v['avg_frame_rate'])==(1920,1080,'h264','30/1')
    assert a['codec_name']=='aac'
    scs,total=make_plan()
    practice=sum(s['edited_duration'] for s in scs if s['id'] in ('02_confusable','03_listening','04_cross','09_origin','05_typing','06_trace','07_memory'))
    result={'file':VIDEO.name,'sha256':hashlib.sha256(VIDEO.read_bytes()).hexdigest(),'duration':float(p['format']['duration']),'bytes':VIDEO.stat().st_size,'video':{'width':1920,'height':1080,'fps':30,'codec':'h264'},'audio':{'codec':'aac','sampleRate':a['sample_rate'],'channels':a['channels']},'fullDecode':'passed','practiceSceneSeconds':practice,'practiceSceneRatio':practice/total,'appFilesModified':False,'recording':'Unmodified app UI captured in Chromium with isolated demo profile; local detail windows are crops from the same frame.','voice':'Local Qwen3-TTS-12Hz-1.7B-CustomVoice, Serena, BF16 SDPA; fictional study partner Xiaoyin','sourceAudio':'Original bundled kana audio, normal/0.75 speed, synchronized to observed app playback; UI tones reconstructed from engine parameters and recorded events.'}
    (OUT/'视频验证.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),'utf-8');print(json.dumps(result,ensure_ascii=False),flush=True)

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--preview',action='store_true');parser.add_argument('--storyboard',action='store_true');parser.add_argument('--render',action='store_true');parser.add_argument('--verify',action='store_true');args=parser.parse_args()
    if args.preview:preview()
    if args.storyboard:storyboard()
    if args.render:render()
    if args.verify:verify()
