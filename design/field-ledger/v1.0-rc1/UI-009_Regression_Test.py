from pathlib import Path
from playwright.sync_api import sync_playwright
import json
P=Path(__file__).resolve().parent
HTML=(P/'So_Nong_Dan_UI009.html').read_text()
log=[]
def note(s): log.append(s); print(s,flush=True)
def frame(page,r): return page.frame_locator('#screen-'+r)
def ready(page,r):
 page.locator('#screen-'+r).wait_for(state='visible',timeout=5000)
 f=frame(page,r);f.locator('main').wait_for(state='visible');page.wait_for_function('(r)=>UI008.current===r&&UI008.idle',arg=r);return f
def nav(page,r,target): frame(page,r).locator(f'[data-nav="{target}"]:visible').first.click();return ready(page,'vault' if target=='data' else target)
def click(f,sel): f.locator(sel+':visible').first.click(timeout=3500)
def back(page,r,target):
 f=frame(page,r);sel='dialog[open] .u-dialog-back' if f.locator('dialog[open]').count() else '.u-main-back';click(f,sel);return ready(page,target)
def close(f):
 d=f.locator('dialog[open]'); d.locator('[data-act=close],[data-close]').first.click();d.wait_for(state='hidden')
def text(f,s='body'):return f.locator(s).inner_text()
def check(page,errors,r):
 f=frame(page,r);assert not errors,errors
 assert not f.locator('html').evaluate('el=>el.scrollWidth>innerWidth'),r+' overflow'
 assert page.locator('iframe:visible').count()==1

def shot(page,name):page.screenshot(path=str(P/name),animations='disabled',timeout=5000)
def make(b,w,h,direct=False):
 page=b.new_page(viewport={'width':w,'height':h},device_scale_factor=1);page.set_default_timeout(3500);errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 if direct:page.goto((P/'So_Nong_Dan_UI009.html').as_uri(),wait_until='load',timeout=6000)
 else:page.set_content(HTML,wait_until='load',timeout=7000)
 ready(page,'home');return page,errors
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'],timeout=7000)
 note('Chromium '+b.version+'; single HTML embedded local frame documents; no install.')
 # Actual file runtime if permitted. Do not substitute an unsupported file URL with unqualified PASS.
 try:
  page,errors=make(b,390,844,True);check(page,errors,'home');click(frame(page,'home'),'[data-action=rice]');ready(page,'rice');check(page,errors,'rice');note('Direct file:// open + home to rice PASS');page.close()
 except Exception as e:
  note('Direct file:// BLOCKED/FAIL: '+str(e).split('\n')[0]);
  for p in b.contexts:
   for pg in p.pages:pg.close()
 for w,h in [(390,844),(320,700),(768,1024),(1280,720),(1440,900)]:
  page,errors=make(b,w,h);home=frame(page,'home');check(page,errors,'home');assert '32.400.000' in text(home) and '26.400.000' in text(home)
  if w in (390,1440):shot(page,f'Home_{w}.png')
  click(home,'[data-action=rice]');rice=ready(page,'rice');check(page,errors,'rice')
  if w in (390,1440):shot(page,f'Rice_{w}.png')
  home=back(page,'rice','home');farm=nav(page,'home','farm');check(page,errors,'farm')
  if w in (390,1440):shot(page,f'Farm_{w}.png')
  finance=nav(page,'farm','finance');check(page,errors,'finance')
  if w in (390,1440):shot(page,f'Finance_{w}.png')
  click(finance,'[data-u-route=analytics]');analytics=ready(page,'analytics');check(page,errors,'analytics')
  if w in (390,1440):shot(page,f'Analytics_{w}.png')
  finance=back(page,'analytics','finance');vault=nav(page,'finance','data');check(page,errors,'vault')
  if w in (390,1440):shot(page,f'Vault_{w}.png')
  nav(page,'vault','home');check(page,errors,'home');note(f'{w}x{h}: six routes, shared navigation, one visible frame, no horizontal overflow or uncaught JS errors PASS');page.close()
 page,errors=make(b,390,844);home=frame(page,'home');click(home,'[data-action=rice]');rice=ready(page,'rice');
 # Start on an empty cell and check 5 entries follow columns; test route return preserves edits.
 click(rice,'[data-act=new-board]');
 for _ in range(5):
  for digit in '443':click(rice,f'[data-key="{digit}"]')
 assert rice.locator('#grid [data-cell="0"]').inner_text().find('44,3')>=0
 for ix in [0,5,10,15,20]:assert '44,3' in text(rice,f'[data-cell="{ix}"]')
 assert '44,3' not in text(rice,'[data-cell="1"]');saved=text(rice,'#grid');back(page,'rice','home');click(home,'[data-action=rice]');rice=ready(page,'rice');assert text(rice,'#grid')==saved;back(page,'rice','home');note('Rice: five bags per column, no overwrite; same in-session board retained across route leave/return PASS')
 # Home sale routes to actual farm form. Preserve a draft on close and navigation.
 click(home,'[data-action=sale]');farm=ready(page,'farm');farm.locator('#form').wait_for();farm.locator('#form [name=amount]').fill('1234567');close(farm);back(page,'farm','home');click(home,'[data-action=sale]');farm=ready(page,'farm');assert farm.locator('#form [name=amount]').input_value()=='1234567';close(farm);back(page,'farm','home');note('Home sale action opens actual UI-004 form; draft retained in same session PASS')
 # Global quick menu opens finance actual entry, then vault import.
 click(home,'[data-nav=quick]');page.locator('#global[open]').wait_for();shot(page,'Quick_390.png');page.locator('[data-quick="3"]').click();finance=ready(page,'finance');finance.locator('#entry').wait_for();assert 'Ghi thu' in text(finance,'#dtitle');close(finance);back(page,'finance','home');click(home,'[data-action=import]');vault=ready(page,'vault');vault.locator('#dialog[open]').wait_for();assert 'Sổ ghi chép tháng 11.csv' in text(vault,'#dbody');close(vault);back(page,'vault','home');note('Global quick menu + actual financial entry and import preview routes PASS')
 # Cross-module chain home record -> production -> source -> linked record; return to previous dialog.
 click(home,'[data-record=r1]');farm=ready(page,'farm');farm.locator('#dialog[open]').wait_for();assert '7.800.000' in text(farm,'#dbody');click(farm,'[data-act=source]');vault=ready(page,'vault');vault.locator('#dialog[open]').wait_for();assert 'Phiếu bán mẫu 025' in text(vault,'#dbody');shot(page,'Source_390.png');back(page,'vault','farm');assert '7.800.000' in text(farm,'#dbody');click(farm,'[data-u-related=r1]');finance=ready(page,'finance');finance.locator('#dialog[open]').wait_for();assert '7.800.000' in text(finance,'#dbody');back(page,'finance','farm');close(farm);back(page,'farm','home');note('Home record -> farm -> vault -> back to selected record -> finance payments -> back PASS')
 # Analytics drill across shared source id, then back preserving prior modal and tab.
 click(home,'[data-action=report]');a=ready(page,'analytics');click(a,'[data-drill=sale]');click(a,'[data-source=r6]');assert 'Phiếu bán mẫu 015' in text(a,'#dbody');click(a,'[data-u-source=r6]');v=ready(page,'vault');v.locator('#dialog[open]').wait_for();assert 'Phiếu bán mẫu 015' in text(v,'#dbody');click(v,'[data-act=linked]');farm=ready(page,'farm');farm.locator('#dialog[open]').wait_for();assert '18.000.000' in text(farm,'#dbody');back(page,'farm','vault');assert 'Phiếu bán mẫu 015' in text(v,'#dbody');back(page,'vault','analytics');assert 'Phiếu bán mẫu 015' in text(a,'#dbody');close(a);note('Analytics drill -> vault source -> farm linked record -> back twice, preserving source dialog PASS')
 # Shared year and explicit report-only scope, historical gap, rice sample scope confirmation.
 a.locator('#year').select_option('2025');assert 'Độ phủ chưa biết' in text(a);home=nav(page,'analytics','home');assert home.locator('#year').input_value()=='2025' and '32.400.000' not in text(home);click(home,'[data-action=rice]');assert 'Năm đang xem: 2025' in page.locator('#global-body').inner_text();page.locator('[data-confirm-rice]').click();rice=ready(page,'rice');back(page,'rice','home');assert home.locator('#year').input_value()=='2025';click(home,'[data-action=report]');a=ready(page,'analytics');a.locator('#year').select_option('2024');assert '39.000.000' in text(a);home=nav(page,'analytics','home');assert home.locator('#year').input_value()=='2024';assert 'Mẫu lịch sử 2024 chỉ có trong báo cáo' in text(home);assert '32.400.000' not in text(home);click(home,'[data-u-route=analytics]');a=ready(page,'analytics');assert a.locator('#year').input_value()=='2024';a.locator('#year').select_option('2026');check(page,errors,'analytics');note('Shared year 2025 and report-only 2024; no 2026 data leakage; rice explicit sample year switch and back restoration PASS')
 home=nav(page,'analytics','home');home.locator('#year').select_option('2025');v=nav(page,'home','data');v.locator('#year').select_option('Tất cả');click(v,'[data-item=s-r1]');click(v,'[data-act=linked]');farm=ready(page,'farm');assert farm.locator('#year').input_value()=='2026' and '7.800.000' in text(farm,'#dbody');back(page,'farm','vault');assert v.locator('#year').input_value()=='Tất cả' and 'Phiếu bán mẫu 025' in text(v,'#dbody');assert page.evaluate('UI008.year')=='2025';close(v);note('Vault all-years deep link opens correct 2026 scope and back restores all-years filter + 2025 shared scope PASS')
 # Nested repeat of a route: preserve the original vault instance exactly.
 v.locator('#year').select_option('2026');click(v,'[data-item=s-r3]');click(v,'[data-act=linked]');farm=ready(page,'farm');click(farm,'[data-act=source]');page.wait_for_function('UI008.current===\"vault\"&&UI008.idle');nested=page.frame_locator('iframe:visible');assert page.evaluate('UI008.frameId')!='screen-vault' and 'Phiếu bán mẫu 022' in text(nested,'#dbody');click(nested,'dialog[open] .u-dialog-back');farm=ready(page,'farm');assert '6.600.000' in text(farm,'#dbody');back(page,'farm','vault');assert 'Phiếu bán mẫu 022' in text(v,'#dbody') and page.locator('iframe:visible').count()==1;note('Nested route repetition vault -> farm -> vault uses temporary view; back restores both previous dialogs PASS')
 page.close();b.close()
(P/'UI-009_Regression_QA.txt').write_text('\n'.join(log)+'\n',encoding='utf-8')
