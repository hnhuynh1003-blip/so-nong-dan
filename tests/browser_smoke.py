from pathlib import Path
from playwright.sync_api import sync_playwright, expect
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from functools import partial
from threading import Thread
import unittest
BASE=Path(__file__).resolve().parents[1]
OUT=BASE/'evidence/CP-001'
class Smoke(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.server=ThreadingHTTPServer(('127.0.0.1',0),partial(SimpleHTTPRequestHandler,directory=str(BASE/'dist')))
  Thread(target=cls.server.serve_forever,daemon=True).start()
  cls.url=f'http://127.0.0.1:{cls.server.server_port}/'
  cls.p=sync_playwright().start(); cls.browser=cls.p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'],headless=True)
 @classmethod
 def tearDownClass(cls):
  cls.browser.close(); cls.p.stop(); cls.server.shutdown(); cls.server.server_close()
 def setUp(self):
  self.page=self.browser.new_page(viewport={'width':390,'height':844}); self.errors=[]; self.page.on('pageerror',lambda e:self.errors.append(str(e)))
 def tearDown(self):
  self.page.close(); self.assertEqual(self.errors,[])
 def test_home_mobile(self):
  self.page.goto(self.url); expect(self.page.locator('.module')).to_have_count(6); expect(self.page.locator('html')).to_have_attribute('lang','vi'); self.assertTrue(self.page.evaluate('document.documentElement.scrollWidth <= innerWidth')); self.page.screenshot(path=str(OUT/'ui-mobile.png'),full_page=True)
 def test_all_routes_and_reload(self):
  self.page.goto(self.url)
  for label in ['Cân lúa','Bán tôm/cua','Chi phí','Đất','Quyết toán','Nhập dữ liệu']:
   self.page.get_by_role('navigation').get_by_role('link',name=label,exact=True).click(); expect(self.page.get_by_role('heading',name=label,exact=True)).to_be_visible(); expect(self.page.locator('main')).to_contain_text('Chưa triển khai'); self.page.reload(); expect(self.page.get_by_role('heading',name=label,exact=True)).to_be_visible()
  self.page.get_by_role('navigation').get_by_role('link',name='Trang chủ').click(); expect(self.page.locator('.module')).to_have_count(6)
 def test_unknown_route(self):
  self.page.goto(self.url+'#/unknown'); expect(self.page.get_by_role('heading',name='Không tìm thấy phân hệ')).to_be_visible()
 def test_desktop(self):
  self.page.set_viewport_size({'width':1280,'height':900}); self.page.goto(self.url); expect(self.page.locator('.module')).to_have_count(6); self.page.screenshot(path=str(OUT/'ui-desktop.png'),full_page=True)
if __name__=='__main__': unittest.main(verbosity=2)
