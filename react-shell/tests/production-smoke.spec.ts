import {test,expect} from '@playwright/test';
const labels=['Cân lúa','Bán tôm/cua','Chi phí','Đất','Quyết toán','Nhập dữ liệu'];
test.beforeEach(async({page})=>{const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400 && ['script','stylesheet','document'].includes(r.request().resourceType()))errors.push(`${r.status()} ${r.url()}`)});errorMap.set(page,errors);await page.goto('/');await expect(page.locator('html')).toHaveAttribute('lang','vi');await expect(page.locator('.module')).toHaveCount(6);test.info().annotations.push({type:'target',description:'React production Vite preview (react-shell/dist)'});await test.info().attach('target',{body:'React production Vite preview',contentType:'text/plain'});
 await expect(page.locator('main')).toContainText('Chưa nhập, lưu hoặc đồng bộ dữ liệu thật');

});
const errorMap=new WeakMap<object,string[]>();
test.afterEach(async({page})=>{expect(errorMap.get(page)??[]).toEqual([]);});
test('mobile home',async({page},info)=>{await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:info.outputPath('mobile.png'),fullPage:true});});
test('all six routes and reload',async({page})=>{for(const label of labels){await page.getByRole('navigation').getByRole('link',{name:label,exact:true}).click();await expect(page.getByRole('heading',{name:label,exact:true})).toBeVisible();await expect(page.locator('main')).toContainText('Chưa triển khai');await page.reload();await expect(page.getByRole('heading',{name:label,exact:true})).toBeVisible();}await page.getByRole('navigation').getByRole('link',{name:'Trang chủ'}).click();await expect(page.locator('.module')).toHaveCount(6);});
test('unknown route',async({page})=>{await page.goto('/#/unknown');await expect(page.getByRole('heading',{name:'Không tìm thấy phân hệ'})).toBeVisible();});
test('desktop home',async({page},info)=>{await page.setViewportSize({width:1280,height:900});await expect(page.locator('.module')).toHaveCount(6);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:info.outputPath('desktop.png'),fullPage:true});});
