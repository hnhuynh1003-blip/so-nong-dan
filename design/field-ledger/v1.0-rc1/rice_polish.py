"""Only synthetic preview alignment to recorded D08.1-6, not product engine."""
def align(v):
 def rep(a,b):
  nonlocal v
  assert a in v, a[:100]
  v=v.replace(a,b,1)
 rep('D08, D10 chưa xác nhận.','D10: chưa xác minh app cũ.')
 # No alternative deduction rules in the currently confirmed restricted profile.
 rep("[['unknown','Chưa xác định'],['none','Không trừ'],['fixed','Bì cố định (kg)'],['ratio','Số bao / kg bì'],['perbag','Kg bì / bao']]","[['unknown','Chưa xác định'],['ratio','Theo tỷ lệ bao / kg bì']]")
 rep('<label for="imp">Tạp chất (kg)</label><input id="imp" inputmode="decimal" placeholder="Chưa xác định" value="${s.impurity===null?\'\':plainKg(BigInt(s.impurity))}">','')
 rep('Trừ bì (một phương thức / phiếu)','Trừ bì · toàn phiếu')
 rep('Chỉ tính trước làm tròn; không chốt tiền.','Tính thử theo D08 · Chưa chốt phiếu.')
 start=v.index('function totals(s)');end=v.index('function rstr(',start)
 v=v[:start]+'''function totals(s){const n=sc(s),g=sg(s);const missing={g:n?g:null,t:null,p:null,settle:null,amount:null};if(!n||s.tare.type!=='ratio')return missing;const tn=BigInt(s.tare.g)*BigInt(n),td=BigInt(s.tare.bags);if(tn<=0n||td<=0n||tn>g*td)return missing;const pn=g*td-tn,q=td*1000n;const settle=pn/q+(2n*(pn%q)>=q?1n:0n);return {g,t:[tn,td],p:[pn,td],settle,amount:s.price===null?null:settle*BigInt(s.price)}}
// Independent UI fixture preview only. Production must use reviewed CP-002 engine and approved policy.
function previewAmount(t){return t.amount===null?'—':money(t.amount)}
function previewSettlement(t){return t.settle===null?'—':nf(t.settle)+' kg'}
function groupPreview(){const a=sheets.map(totals);return a.every(t=>t.amount!==null)?money(a.reduce((n,t)=>n+t.amount,0n)):'—'}
'''+v[end:]
 start=v.index("$('#financial').innerHTML=`");end=v.index(';renderEntry()',start)
 v=v[:start]+'''$('#financial').innerHTML=`<div class="head"><h2>Tạm tính · Phiếu ${sheet().id}</h2><button data-act="review">Chi tiết ›</button></div>${kv('Trừ bì',rstr(t.t))}${kv('Sau bì',rstr(t.p))}${kv('KL tính tiền (thử)',previewSettlement(t))}${kv('Đơn giá',sheet().price===null?'—':money(sheet().price)+'/kg')}${kv('Tiền tính thử',previewAmount(t))}<p class="priceend">${sc(sheet())&&sheet().tare.type==='ratio'&&t.t===null?'Bì vượt gộp · kiểm tra lại.':'Mẫu D08 · Chưa chốt phiếu.'}</p>`'''+v[end:]
 start=v.index('function preview(s)');end=v.index('function act(a)',start)
 v=v[:start]+'''function preview(s){let t=totals(s);return kv('Số bao',sc(s))+kv('Tổng gộp',t.g===null?'—':kg(t.g))+kv('Trừ bì',rstr(t.t))+kv('Sau bì (chính xác)',rstr(t.p))+kv('KL tính tiền (thử)',previewSettlement(t))+kv('Đơn giá',s.price===null?'—':money(s.price)+'/kg')+kv('Tiền tính thử',previewAmount(t))+kv('Thanh toán','Chưa ghi nhận')}
'''+v[end:]
 rep("${kv('Tiền chốt nhóm','—')}","${kv('Tiền tính thử · nhóm',groupPreview())}<p class=\"notice\">${groupPreview()==='—'?'Còn phiếu thiếu dữ liệu.':'Cộng từng phiếu, không làm tròn lại.'}</p>")
 rep('Chưa thể chốt · D08 chưa xác nhận.','Chưa thể chốt · Chưa tích hợp engine và quy tắc đã duyệt vào ứng dụng.')
 start=v.index('function tareFields(t={})');end=v.index('function plainKg',start)
 v=v[:start]+'''function tareFields(t={}){let v=$('#tareType').value;$('#tareFields').innerHTML=v==='ratio'?`<label for="tg">Khối lượng bì quy ước (kg)</label><input id="tg" inputmode="decimal" required value="${t.g?plainKg(BigInt(t.g)):''}"><label for="tb">Số bao quy ước</label><input id="tb" inputmode="numeric" required value="${t.bags||''}">`:''}
'''+v[end:]
 start=v.index("document.addEventListener('submit',e=>{if(e.target.id!=='dedform')");end=v.index("document.addEventListener('change'",start)
 v=v[:start]+'''document.addEventListener('submit',e=>{if(e.target.id!=='dedform')return;e.preventDefault();let type=$('#tareType').value,t={type},p=$('#price').value.trim(),pv=p===''?null:readInt(p);const fail=t=>$('#formError').textContent=t;if(!['unknown','ratio'].includes(type)||p!==''&&(pv===null||pv<=0n)){fail('Kiểm tra đơn giá hoặc cách trừ bì.');return}if(type==='ratio'){const g=gram($('#tg').value),b=readInt($('#tb').value);if(g===null||g<=0n||b===null||b<=0n){fail('Khối lượng bì và số bao phải lớn hơn 0.');return}t.g=String(g);t.bags=String(b)}let s=sheet(),draft={...s,tare:t,price:pv===null?null:String(pv)},x=totals(draft);if(sc(s)&&type==='ratio'&&x.t===null){fail('Bì không được vượt tổng gộp.');return}snapshot();s.tare=t;s.price=draft.price;modal.close();msg='Đã áp dụng thử trong phiên';err=false;render()});
'''+v[end:]
 # Current fixture raw bag weights, agreement, and one price/sheet preserved; drop obsolete non-current UI field.
 v=v.replace(",impurity:'0'",'').replace(',impurity:null','')
 assert 'D08 chưa xác nhận' not in v and 'id="imp"' not in v
 return v
