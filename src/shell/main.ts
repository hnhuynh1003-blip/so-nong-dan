import { routes, resolveRoute } from './routes.js';
const root = document.getElementById('app');
if (!root) throw new Error('Missing app root');
function element<K extends keyof HTMLElementTagNameMap>(tag: K, text?: string): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag); if (text !== undefined) el.textContent = text; return el;
}
function render() {
  const page = resolveRoute(location.hash);
  const header = element('header'); header.append(element('p','SỔ NÔNG DÂN · CP-001'), element('h1', 'Sổ nông dân'));
  const nav = element('nav'); nav.setAttribute('aria-label','Phân hệ');
  for (const r of [{route:'',label:'Trang chủ'},...routes]) {
    const a = element('a',r.label); a.href = '#/'+r.route;
    if ((page.kind==='home' && !r.route) || (page.kind==='module' && page.route.route===r.route)) a.setAttribute('aria-current','page');
    nav.append(a);
  }
  const main = element('main'); main.id='main-content';
  const notice = element('p','Bản nền tảng kỹ thuật · Chưa nhập, lưu hoặc đồng bộ dữ liệu thật.'); notice.className='notice'; main.append(notice);
  if(page.kind==='home') {
    main.append(element('h2','Các phân hệ')); const grid=element('div'); grid.className='grid';
    for(const r of routes){const a=element('a');a.href='#/'+r.route;a.className='module';a.append(element('h3',r.label),element('p',r.description),element('small','Chưa triển khai · '+r.checkpoint));grid.append(a);} main.append(grid);
  } else if(page.kind==='module') { main.append(element('h2',page.route.label),element('p',page.route.description),element('p','Chưa triển khai · '+page.route.checkpoint)); }
  else {main.append(element('h2','Không tìm thấy phân hệ'),element('p','Chọn một phân hệ trong thanh điều hướng.'));}
  const footer=element('footer','Chỉ dùng thử nền tảng · Không phải hệ thống lưu sổ thực tế.');
  root!.replaceChildren(header,nav,main,footer);
}
window.addEventListener('hashchange',render);render();
