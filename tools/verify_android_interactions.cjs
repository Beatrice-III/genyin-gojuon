/**
 * Real Android keyboard, Back and touch smoke test for a development APK.
 * Requires Node 22+ (fetch/WebSocket), Android platform-tools, a running Android
 * emulator with software keyboard enabled, and the app's --debug build installed.
 * This writes quiz/writing progress in the development app. Never use production
 * user data. Screenshots and the report are written to outputs/v3.
 *
 * Build: python android/build_apk.py --debug
 * Install its dev APK with adb, then open com.genyin.gojuon.dev.
 * Run: node tools/verify_android_interactions.cjs
 * Optional env: ADB_PATH, ANDROID_HOME, ANDROID_SERIAL, GENYIN_CDP_PORT.
 * The script forwards the running WebView's debug socket automatically.
 * The app's release build deliberately does not expose that socket.
 */
const fs=require('node:fs');
const path=require('node:path');
const cp=require('node:child_process');
const ROOT=path.resolve(__dirname,'..');
const OUT=path.join(ROOT,'outputs/v3');
const WORK=path.join(ROOT,'work/mobile_v3');
fs.mkdirSync(WORK,{recursive:true});
process.env.TEMP=process.env.TMP=WORK;
const sdk=process.env.ANDROID_HOME||process.env.ANDROID_SDK_ROOT;
const ADB=process.env.ADB_PATH||(sdk?path.join(sdk,'platform-tools',process.platform==='win32'?'adb.exe':'adb'):'adb');
const SERIAL=process.env.ANDROID_SERIAL||'emulator-5554';
const PORT=Number(process.env.GENYIN_CDP_PORT||9223);
fs.mkdirSync(OUT,{recursive:true});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const adb=(...args)=>cp.execFileSync(ADB,['-s',SERIAL,...args],{encoding:'utf8',windowsHide:true});
let ws,n=0,pending=new Map(),screenY=0;
async function cdp(method,params={}){const id=++n;return new Promise((resolve,reject)=>{pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});}
async function ev(expression){const r=await cdp('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw new Error(JSON.stringify(r.exceptionDetails));return r.result.value;}
async function snap(name){const file=path.join(OUT,`android-${name}.png`);fs.writeFileSync(file,cp.execFileSync(ADB,['-s',SERIAL,'exec-out','screencap','-p'],{windowsHide:true}));return file;}
async function rect(selector){return ev(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,visible:!!e.offsetParent,dpr:devicePixelRatio,scrollY,innerHeight,viewHeight:visualViewport.height};})()`);}
async function tap(selector){let r=await rect(selector);if(!r.visible)throw new Error('not visible '+selector);if(r.y<0||r.y+r.height>r.viewHeight){await ev(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:"center",behavior:"instant"})`);await sleep(300);r=await rect(selector);}adb('shell','input','tap',String(Math.round((r.x+r.width/2)*r.dpr)),String(Math.round(screenY+(r.y+r.height/2)*r.dpr)));await sleep(650);return r;}
const state=()=>ev('({tab:app.currentTab,index:app.activeQuiz?.index,answered:app.activeQuiz?.answeredCurrent,answeredCount:app.activeQuiz?.answeredCount,question:app.activeQuiz?.currentQ?.promptMain,queue:app.activeQuiz?.queue?.length,keyboard:document.body.classList.contains("mobile-keyboard-open"),focus:document.activeElement.id,innerHeight,viewHeight:visualViewport.height,pause:document.getElementById("mobile-pause-sheet").classList.contains("open"),dojoIndex:app.dojoIndex,writingSource:app.writingSource,scrollY})');
async function until(test){for(let i=0;i<20;i++){const s=await state();if(test(s))return s;await sleep(250);}throw new Error('State did not settle: '+JSON.stringify(await state()));}
function check(value,message){if(!value)throw new Error(message);}
async function main(){
const pid=adb('shell','pidof','com.genyin.gojuon.dev').trim();check(/^\d+$/.test(pid),'Open the development app com.genyin.gojuon.dev first');
adb('forward',`tcp:${PORT}`,`localabstract:webview_devtools_remote_${pid}`);
const tabs=await(await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
const target=tabs.find(t=>t.url==='file:///android_asset/www/index.html');check(target,'App WebView is unavailable; use a debug APK');
screenY=JSON.parse(target.description).screenY||0;
ws=new WebSocket(target.webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r,{once:true}));
ws.addEventListener('message',m=>{const data=JSON.parse(m.data);if(data.id&&pending.has(data.id)){const t=pending.get(data.id);pending.delete(data.id);data.error?t.reject(data.error):t.resolve(data.result);}});
const errors=[];ws.addEventListener('message',m=>{const d=JSON.parse(m.data);if(d.method==='Runtime.exceptionThrown')errors.push(d.params);});await cdp('Runtime.enable');
const report={status:'running',device:adb('shell','getprop','ro.build.version.release').trim(),physicalSize:adb('shell','wm','size').trim(),app:await ev('JSON.parse(AndroidApp.getInfo())'),flows:[],snapshots:{},errors};
await ev('document.activeElement.blur();while(mobileNavigation.closeTopSheet()){};document.querySelectorAll(".modal-backdrop.open").forEach(e=>e.classList.remove("open"));app.switchTab("tab-gojuon");app.launchCustomQuiz({title:"Android 键盘实测",mode:"typing-blitz",kanaIds:["a","i","u","e","o"],count:15})');await until(s=>!s.keyboard);await sleep(700);
await tap('#quiz-typing-input');const keyboardState=await until(s=>s.keyboard);await sleep(600);
const keyboardInput=await rect('#quiz-typing-input');const keyboardSubmit=await rect('#btn-submit-typing');
report.snapshots.keyboard=keyboardState;report.snapshots.keyboardInput=keyboardInput;report.snapshots.keyboardSubmit=keyboardSubmit;
report.snapshots.keyboardDumpsys=adb('shell','dumpsys','input_method').split(/\r?\n/).filter(x=>/mInputShown|mIsInputViewShown/.test(x));
check(keyboardState.keyboard,'Keyboard viewport flag did not activate');check(keyboardSubmit.y>=0&&keyboardSubmit.y+keyboardSubmit.height<=keyboardSubmit.viewHeight+1,'submit hidden by keyboard');check(keyboardInput.y>=0&&keyboardInput.y+keyboardInput.height<=keyboardInput.viewHeight+1,'input hidden by keyboard');
await snap('typing-keyboard');
const answer=await ev('app.activeQuiz.currentQ.correctAnswer');adb('shell','input','text',answer);await sleep(300);await tap('#btn-submit-typing');await sleep(600);
const submitted=await until(s=>s.answered&&!s.keyboard);report.snapshots.submitted=submitted;check(submitted.focus!=='quiz-typing-input','typing input still focused after answer');await snap('typing-feedback');report.flows.push('Native Android keyboard input, visible submit, tap submit, blur and keyboard dismiss');
await tap('#btn-next-question');await tap('#quiz-typing-input');await until(s=>s.keyboard);adb('shell','input','keyevent','4');const back1=await until(s=>!s.keyboard);report.snapshots.firstBack=back1;check(!back1.pause,'First back should dismiss keyboard only');adb('shell','input','keyevent','4');const back2=await until(s=>s.pause);report.snapshots.secondBack=back2;await snap('pause-native-back');
const before=await state();await tap('#mobile-pause-sheet .secondary-btn');const away=await state();check(away.tab==='tab-gojuon','Pause return did not return to chart source');check(away.index===before.index&&away.queue===before.queue&&away.question===before.question,'Pause modified question queue');await snap('paused-source');await tap('#mobile-resume-quiz');const resumed=await state();report.snapshots.pause={before,away,resumed};check(resumed.tab==='tab-arena'&&resumed.index===before.index&&resumed.question===before.question&&resumed.queue===before.queue,'Resume did not preserve exact question');report.flows.push('Native Back first hides keyboard; second opens pause; return to source and resume preserves queue and current question');
await tap('#quiz-typing-input');await until(s=>s.keyboard);const enterAnswer=await ev('app.activeQuiz.currentQ.correctAnswer');adb('shell','input','text',enterAnswer);adb('shell','input','keyevent','66');const enter=await until(s=>s.answered&&!s.keyboard);report.snapshots.enter=enter;report.flows.push('Native Enter submits typing answer and dismisses keyboard');
await ev('app.finishQuizSession(true);app.switchTab("tab-gojuon")');await sleep(500);await ev('window.scrollTo({top:450,behavior:"instant"})');await sleep(400);const sourceScroll=await ev('scrollY');await ev('app.openKanaDetailModal("ka")');await sleep(600);await tap('#modal-btn-go-write');const write=await state();check(write.tab==='tab-writing'&&write.dojoIndex===5,'Detail to writing selected incorrect character');await snap('writing-from-card');
const writesBefore=await ev('masteryEngine.state.totalWriteCount');const canvas=await rect('#calligraphy-canvas');
const swipe=(x1,y1,x2,y2)=>adb('shell','input','touchscreen','swipe',String(Math.round((canvas.x+x1*canvas.width)*canvas.dpr)),String(Math.round(screenY+(canvas.y+y1*canvas.height)*canvas.dpr)),String(Math.round((canvas.x+x2*canvas.width)*canvas.dpr)),String(Math.round(screenY+(canvas.y+y2*canvas.height)*canvas.dpr)),'420');
swipe(.22,.29,.57,.26);swipe(.49,.20,.27,.78);swipe(.71,.30,.82,.48);await snap('writing-native-strokes');
const strokeState=await ev('({length:app.calligraphyPad.strokes.length})').catch(()=>null);report.snapshots.nativeStrokes=strokeState;
await tap('#dojo-btn-complete');const writesAfter=await ev('masteryEngine.state.totalWriteCount');check(writesAfter===writesBefore+1,'Native touch strokes did not record a writing practice');
adb('shell','input','keyevent','4');await sleep(600);const returned=await state();const detail=await ev('({open:document.getElementById("kana-detail-modal").classList.contains("open"),text:document.getElementById("kana-modal-body").innerText})');report.snapshots.writing={write,returned,detail,sourceScroll,writesBefore,writesAfter};check(returned.tab==='tab-gojuon'&&detail.open&&detail.text.includes('か'),'Native Back did not return to original kana card');check(Math.abs(returned.scrollY-sourceScroll)<2,'Return from writing did not restore source scroll');await snap('writing-return-card');report.flows.push('Kana card to selected handwriting character; real native touch strokes are recorded; Native Back returns to original kana card and source scroll');
check(!errors.length,'CDP reported runtime errors');report.status='passed';fs.writeFileSync(path.join(OUT,'Android交互验证.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
ws.close();
}
main().catch(async e=>{console.error(e);try{console.error(JSON.stringify(await state(),null,2));await snap('failure');}catch{}ws?.close();process.exitCode=1});
