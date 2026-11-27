import {useEffect,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {routes,resolveRoute} from '../src/shell/routes.js';
import '../public/style.css';
function App(){
 const [hash,setHash]=useState(location.hash);
 useEffect(()=>{const update=()=>setHash(location.hash);window.addEventListener('hashchange',update);return()=>window.removeEventListener('hashchange',update)},[]);
 const page=resolveRoute(hash);
 return <><header><p>SỔ NÔNG DÂN · CP-001</p><h1>Sổ nông dân</h1></header><nav aria-label="Phân hệ">{[{route:'',label:'Trang chủ'},...routes].map(r=><a key={r.route} href={'#/'+r.route} aria-current={(page.kind==='home'&&!r.route)||(page.kind==='module'&&page.route.route===r.route)?'page':undefined}>{r.label}</a>)}</nav><main><p className="notice">Bản nền tảng kỹ thuật · Chưa nhập, lưu hoặc đồng bộ dữ liệu thật.</p>{page.kind==='home'?<><h2>Các phân hệ</h2><div className="grid">{routes.map(r=><a className="module" key={r.route} href={'#/'+r.route}><h3>{r.label}</h3><p>{r.description}</p><small>Chưa triển khai · {r.checkpoint}</small></a>)}</div></>:page.kind==='module'?<><h2>{page.route.label}</h2><p>{page.route.description}</p><p>Chưa triển khai · {page.route.checkpoint}</p></>:<h2>Không tìm thấy phân hệ</h2>}</main><footer>Chỉ dùng thử nền tảng · Không phải hệ thống lưu sổ thực tế.</footer></>;
}
createRoot(document.getElementById('app')!).render(<App/>);
