from pathlib import Path
import re,json,hashlib,urllib.parse
from rice_polish import align
P=Path(__file__).resolve().parent
base=P/'baseline'/'So_Nong_Dan_UI008.html'
s=base.read_text(encoding='utf-8')
m=re.search(r'const DOCS=(.*?);const fixtures=',s,re.S); docs=json.loads(m[1])
leaf='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect x="1" y="1" width="46" height="46" rx="9" fill="#205b40"/><path d="M12 34C12 14 25 8 39 7c0 17-6 29-22 29M10 40c7-12 14-19 23-27" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'
(P/'favicon.svg').write_text(leaf+'\n',encoding='utf-8')
css='''
/* UI-009: shell polish only; existing working regions retained. */
main header.p-header{display:flex;align-items:center;justify-content:space-between;gap:10px;min-height:60px;padding:0 0 14px;margin:0 0 18px;border-bottom:1px solid #d2dbd1}
.p-left{display:flex;align-items:center;gap:8px;min-width:0}.p-identity{min-width:0;display:grid;gap:3px}.p-brand{display:none;align-items:center;gap:8px;color:#1d3025;font-size:19px;font-weight:760;line-height:1.2;letter-spacing:-.035em;white-space:nowrap}.p-brand svg{width:29px;height:29px;flex:none;color:#205b40;stroke-width:1.4}.p-meta{display:flex;align-items:center;gap:10px;flex-wrap:wrap;min-height:22px}.p-demo{font-size:12px;color:#8a4d11;font-weight:600;white-space:nowrap}.p-header .u-report{min-height:44px;padding:0;font-size:13px}.p-header .year,.p-header .scope{display:grid;gap:3px;flex:none;text-align:left;font-size:12px;color:#53665a;white-space:nowrap;min-width:0}.p-header select{font-size:16px;font-weight:650;min-height:44px;min-width:94px;max-width:120px;background:white;border:1px solid #d2dbd1;border-radius:5px;padding:0 8px;color:#1d3025}.p-header .u-main-back{height:44px;flex:none}.p-header .p-h1{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap;margin:0;padding:0}.p-header .p-brand svg{border:1px solid #205b40;border-radius:5px;padding:4px}.railfooter,.railfoot{font-size:12px;line-height:1.5}
@media(min-width:1001px){.shell{grid-template-columns:208px minmax(0,1fr)}.rail{padding:24px 14px}.rail .brand{font-size:18px;margin:0 0 26px}.nav button{min-height:48px;font-size:15px}.nav button[data-nav=quick]{margin:12px 0 4px}}
@media(max-width:1000px){.main:has(> header.p-header){padding-top:12px}main header.p-header{min-height:58px;padding:0 0 10px;margin:0 0 12px;gap:8px}.p-brand{display:flex}.p-meta{gap:8px;min-height:18px}.p-header .u-report{min-height:44px}.p-header select{height:44px}.p-header .u-backicon{width:44px;min-width:44px}.bottom{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));min-height:64px;padding:5px 3px calc(5px + env(safe-area-inset-bottom,0px));background:#fff}.bottom button{min-height:54px;font-size:11px;line-height:1.15;gap:4px}.bottom button svg{flex:none}.bottom button[aria-current=page]{box-shadow:inset 0 2px #205b40;border-radius:3px}.bottom button[data-nav=quick] svg{box-sizing:border-box;background:#205b40;color:white;width:30px;height:30px;padding:5px;border-radius:6px}.main{padding-bottom:calc(86px + env(safe-area-inset-bottom,0px))}}
@media(max-width:360px){.p-header .p-brand{font-size:17px;gap:5px}.p-header .p-brand svg{width:25px;height:25px}.p-left{gap:5px}.p-left:has(.u-main-back:not([hidden])) .p-brand svg{display:none}.bottom button{font-size:10.5px}.p-header .year,.p-header .scope{font-size:11px}.p-header select{min-width:84px;max-width:100px}}
:focus-visible{outline:3px solid #1267c5;outline-offset:2px}.p-header .u-main-back[hidden]{display:none!important}
@media(prefers-reduced-motion:reduce){*,*::before,*::after{scroll-behavior:auto!important;animation-duration:.01ms!important;transition-duration:.01ms!important}}
'''
js=r'''
function uPolish(head,back){
 if(!head||route==='rice')return;
 if(!head.classList.contains('p-header')){
  const scope=head.querySelector('.year,.scope');if(!scope)return;
  const oldLink=head.querySelector('[data-u-route="analytics"]');
  const left=document.createElement('div');left.className='p-left';
  const ident=document.createElement('div');ident.className='p-identity';
  const brand=document.createElement('div');brand.className='p-brand';brand.setAttribute('aria-hidden','true');brand.innerHTML=ico('leaf')+'<span>Sổ Nông Dân</span>';
  const h=document.createElement('h1');h.className='p-h1';h.textContent=({home:'Sổ Nông Dân',farm:'Sản xuất',finance:'Tài chính',vault:'Dữ liệu',analytics:'Báo cáo'})[route];
  const meta=document.createElement('div');meta.className='p-meta';meta.innerHTML='<span class="p-demo">Dữ liệu giả lập</span>';
  if(route==='finance'){if(oldLink)meta.append(oldLink);else meta.insertAdjacentHTML('beforeend',uButton('Báo cáo ›','data-u-route="analytics"','u-report'))}
  ident.append(h,brand,meta);left.append(back,ident);head.replaceChildren(left,scope);head.classList.add('p-header');
 }
 document.querySelectorAll('main > .mobilebrand,main > .preview').forEach(n=>n.remove());
 for(const n of document.querySelectorAll('.railfooter,.railfoot'))n.textContent='Field Ledger · Prototype';
 const foot=document.querySelector('main .footer > span');if(foot)foot.textContent='Prototype · Không lưu dữ liệu thật';
}
'''
for k,v in docs.items():
 if k!='rice':
  if k=='home':v=v.replace('@media(max-width:900px)','@media(max-width:1000px)')
  if k=='analytics':v=v.replace('@media(min-width:1051px)','@media(min-width:1001px)').replace('@media(max-width:1050px)','@media(max-width:1000px)')
  start=v.index('function uChrome()');end=v.index('function uBefore()',start)
  part=v[start:end];idx=part.rfind('}');part=part[:idx]+' uPolish(head,b);\n'+part[idx:];v=v[:start]+part+js+v[end:]
  v=v.replace('</style>',css+'</style>',1)
 else:
  v=align(v)
  v=v.replace('</style>','''\n/* UI-009: preserve rice working surface. */\n:focus-visible{outline:3px solid #1267c5;outline-offset:2px}@media(prefers-reduced-motion:reduce){*,*::before,*::after{scroll-behavior:auto!important;animation-duration:.01ms!important;transition-duration:.01ms!important}}\n</style>''',1)
 docs[k]=v
pack=json.dumps(docs,ensure_ascii=False,separators=(',',':')).replace('<','\\u003c')
s=s[:m.start(1)]+pack+s[m.end(1):]
s=s.replace('<meta name="color-scheme" content="light">','<meta name="color-scheme" content="light"><link rel="icon" type="image/svg+xml" href="data:image/svg+xml,'+urllib.parse.quote(leaf,safe='')+'">',1)
s=s.replace('Sổ Nông Dân · Field Ledger</title>','Sổ Nông Dân · Field Ledger v1.0</title>',1)
out=P/'So_Nong_Dan_UI009.html';out.write_text(s,encoding='utf-8')
print('baseline',hashlib.sha256(base.read_bytes()).hexdigest());print('candidate',hashlib.sha256(out.read_bytes()).hexdigest());print(len(out.read_bytes()),'bytes')
