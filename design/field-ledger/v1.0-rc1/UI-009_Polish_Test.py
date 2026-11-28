from pathlib import Path
from playwright.sync_api import sync_playwright
import json,re,hashlib
P=Path(__file__).resolve().parent
A=(P/'baseline/So_Nong_Dan_UI008.html').read_text();H=(P/'So_Nong_Dan_UI009.html').read_text()
notes=[]
def note(s): notes.append(s);print(s,flush=True)
def fixture(s):return json.loads(re.search(r'const fixtures=(.*?);function freeze',s,re.S)[1])
assert fixture(A)==fixture(H)
assert A.split('function freeze',1)[1]==H.split('function freeze',1)[1]
note('Shared fixture and parent navigation engine byte-identical after function freeze: PASS')
def contrast(a,b):
 def lum(x):
  x=[int(x[i:i+2],16)/255 for i in (0,2,4)];return sum(k*(v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4) for k,v in zip((.2126,.7152,.0722),x))
 x,y=sorted([lum(a),lum(b)]);return (y+.05)/(x+.05)
for a,b in [('1d3025','f5f6ee'),('53665a','f5f6ee'),('8a4d11','f5f6ee'),('ffffff','205b40'),('205b40','e2ede1'),('1267c5','f5f6ee')]:
 r=contrast(a,b);assert r>=4.5,(a,b,r);note(f'Token contrast #{a} / #{b}: {r:.2f}:1 PASS')
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'],timeout=7000)
 note('Chromium '+b.version+'; set_content, no dependency installation.')
 for w,h in [(320,700),(390,844),(900,900),(1000,800),(1001,800),(1050,800),(1280,720),(1440,900)]:
  page=b.new_page(viewport={'width':w,'height':h},device_scale_factor=1,reduced_motion='reduce');page.set_default_timeout(3500);errs=[];page.on('pageerror',lambda e:errs.append(str(e)))
  page.set_content(H,wait_until='load',timeout=7000)
  for r in ['home','farm','finance','vault','analytics']:
   page.evaluate('(r)=>UI008.navigate(r,{},false)',r);page.wait_for_function('(r)=>UI008.current===r&&UI008.idle',arg=r)
   f=page.frame_locator('#screen-'+r);f.locator('main header.p-header').wait_for();assert f.locator('main header .p-brand').count()==1
   assert f.locator('main header .p-demo').inner_text()=='Dữ liệu giả lập'
   assert f.locator('main header #year').count()==1
   assert not f.locator('html').evaluate('e=>e.scrollWidth>innerWidth'),(w,r,'overflow')
   assert f.locator('.bottom').is_visible()==(w<=1000),(w,r,'bottom')
   assert f.locator('.rail').is_visible()==(w>1000),(w,r,'rail')
   if w<=1000:
    assert f.locator('.p-brand').is_visible(),(w,r,'brand')
    sizes=f.locator('.bottom button').evaluate_all('els=>els.map(e=>[e.getBoundingClientRect().width,e.getBoundingClientRect().height])')
    assert all(x>=48 and y>=48 for x,y in sizes),(r,w,sizes)
    # Header controls cannot collide at any tested width.
    left=f.locator('.p-left').bounding_box();right=f.locator('main header #year').bounding_box();assert left['x']+left['width']<=right['x']+2,(w,r,left,right)
   else: assert not f.locator('.p-brand').is_visible(),(r,'duplicate brand desktop')
   assert not errs,errs
  note(f'{w}x{h}: five top-level screens; correct rail/bottom switch, one brand, no overflow, mobile nav >=48x48 PASS')
  if w==390:
   page.evaluate("UI008.navigate('home',{},false)");page.wait_for_function('UI008.current==="home"&&UI008.idle');f=page.frame_locator('#screen-home');f.locator('#year').focus();f.locator('#year').press('Tab');focus=f.locator(':focus');assert focus.count()==1
   page.keyboard.press('Shift+Tab');assert f.locator('#year').evaluate("e=>document.activeElement===e")
   # Keyboard open/close of global menu and focus restoration.
   q=f.locator('.bottom [data-nav=quick]');q.focus();page.keyboard.press('Enter');page.locator('#global[open]').wait_for();page.keyboard.press('Escape');page.locator('#global').wait_for(state='hidden');page.wait_for_function("document.querySelector('#screen-home').contentDocument.activeElement.dataset.nav==='quick'");note('Keyboard year/Tab and quick menu Enter/Escape focus restoration PASS')
  page.close()
 b.close()
(P/'UI-009_Polish_QA.txt').write_text('\n'.join(notes)+'\n',encoding='utf-8')
