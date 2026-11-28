from pathlib import Path
from playwright.sync_api import sync_playwright
from fractions import Fraction
from decimal import Decimal
P=Path(__file__).resolve().parent; H=(P/'So_Nong_Dan_UI009.html').read_text(); log=[]
def note(s):log.append(s);print(s,flush=True)
def text(f,sel):return f.locator(sel).inner_text()
def click(f,s):f.locator(s+':visible').first.click(timeout=3500)
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'],timeout=7000);p=b.new_page(viewport={'width':390,'height':844});p.set_default_timeout(3500);errors=[];p.on('pageerror',lambda e:errors.append(str(e)));p.set_content(H,wait_until='load',timeout=7000);p.wait_for_function('UI008.idle');p.evaluate("UI008.navigate('rice',{},true)");p.wait_for_function('UI008.current==="rice"&&UI008.idle');f=p.frame_locator('#screen-rice');f.locator('#grid').wait_for()
 # Independent fixture arithmetic: gross 2803.1 kg, 63 bags, 1kg/10 bags.
 assert '2.796,8 kg' in text(f,'#financial') and '2.797 kg' in text(f,'#financial') and '20.557.950' in text(f,'#financial'),text(f,'#financial')
 click(f,'[data-act=review]');assert f.locator('dialog[open] button.solid').is_disabled();assert 'Chưa ghi nhận' in text(f,'#dbody');assert 'D08 chưa xác nhận' not in text(f,'#dbody');p.screenshot(path=str(P/'Rice_Review_390.png'));click(f,'[data-act=close]');note('63 bags: gross 2803.1 kg, tare 6.3 kg, net 2796.8 kg, rounded 2797 kg, exact preview 20,557,950 VND; finalization disabled PASS')
 click(f,'[data-act=group]');assert 'Còn phiếu thiếu dữ liệu' in text(f,'#dbody');click(f,'[data-act=close]');note('Incomplete group does not display full amount PASS')
 f.locator('#sheetSelect').select_option('1');assert '—' in text(f,'#financial');click(f,'[data-act=deduct]');assert f.locator('#imp').count()==0;assert f.locator('#tareType option').count()==2;f.locator('#tareType').select_option('ratio');f.locator('#tg').fill('1');f.locator('#tb').fill('0');click(f,'#dedform button[type=submit]');assert 'lớn hơn 0' in text(f,'#formError');f.locator('#tb').fill('10');f.locator('#tg').fill('10000');click(f,'#dedform button[type=submit]');assert 'vượt tổng gộp' in text(f,'#formError');f.locator('#tg').fill('1');p.screenshot(path=str(P/'Rice_Tare_390.png'));click(f,'#dedform button[type=submit]');assert f.locator('dialog[open]').count()==0
 # Use observed separate gross from independent display with Python Fraction to calculate expected total.
 s=f.locator('#metrics .metric strong').all_inner_texts();gross=Fraction(Decimal(s[1].replace('.','').replace(',','.')));n=int(s[0]);net=gross-Fraction(n,10);roundkg=(net+Fraction(1,2)).numerator//(net+Fraction(1,2)).denominator;expected=20557950+roundkg*7200
 click(f,'[data-act=group]');assert f'{expected:,}'.replace(',','.') in text(f,'#dbody');assert 'không làm tròn lại' in text(f,'#dbody');p.screenshot(path=str(P/'Rice_Group_390.png'));click(f,'[data-act=new-sheet]');note('Ratio inputs, invalid denominator and excessive tare rejection, two sheet group sum without re-rounding PASS')
 # Half-up at 0.5 kg, exact money preview (not an authoritative engine test).
 for d in '015':click(f,f'[data-key="{d}"]')
 click(f,'[data-act=deduct]');f.locator('#tareType').select_option('ratio');f.locator('#tg').fill('1');f.locator('#tb').fill('1');f.locator('#price').fill('7351');click(f,'#dedform button[type=submit]');assert '0,5 kg' in text(f,'#financial') and '1 kg' in text(f,'#financial') and '7.351' in text(f,'#financial');assert not errors,errors;note('Half kg tie in draft preview: 1.5 kg gross - 1 kg tare => 0.5 kg net => 1 kg settlement, 7351 VND retained PASS')
 p.close();b.close()
(P/'UI-009_Rice_Profile_QA.txt').write_text('\n'.join(log)+'\n',encoding='utf-8')
