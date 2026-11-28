"""Independent B-P1 reference: Python Fraction, no candidate imports.
Valid input vectors and controlled single-fault variants; not a raw JSON validator.
"""
import json, random, sys
from fractions import Fraction as F
from collections import defaultdict
SEED=2026112802
METRICS=('tareGram','physicalNetGram','commercialNetGram','settlementGram','residualGram','amountVnd')

def wire(x):
    if x is None:return None
    v=F(x);return {'numerator':str(v.numerator),'denominator':str(v.denominator)}
def value(w):return F(int(w['numerator']),int(w['denominator']))
def batch(s):return dict(ownerId=s['ownerId'],sheetId=s['sheetId'],batchId='batch-'+s['sheetId'])
def make_sheet(sid,raws=(),ratio=F(10),price='7350',group='g',positions=None,mode='gram'):
    s=dict(ownerId='o',sheetId=sid,groupId=group,batches=[],slots=[],tare=None if ratio is None else dict(method='proportional',scope='sheet',bagsPerKg=wire(ratio)),priceVndPerKg=price,saleScope='whole-sheet')
    b=batch(s);s['batches']=[b]
    for i,raw in enumerate(raws):
        pos=positions[i] if positions is not None else i+1
        s['slots'].append(dict(position=str(pos),bag=raw if raw is None or raw=='' else dict(**b,bagId=f'{sid}-bag-{i+1}',mode=mode,raw=str(raw))))
    return s

def sheet(s):
    slots=[];buckets=[defaultdict(list) for _ in range(3)];gross=[]
    for slot in sorted(s['slots'],key=lambda a:int(a['position'])):
        p=int(slot['position']);col,row=divmod(p-1,5);board,col_local=divmod(col,5);page,board_local=divmod(board,3)
        layout=dict(row=str(row+1),column=str(col+1),columnInBoard=str(col_local+1),board=str(board+1),boardInPage=str(board_local+1),page=str(page+1));b=slot['bag'];trace=None
        if b is not None and b!='':
            g=int(b['raw'])*(100 if b['mode']=='three-digit' else 1);gross.append(g)
            for group,i in zip(buckets,(col+1,board+1,page+1)):group[i].append(g)
            trace={**b,'grossGram':wire(g)}
        slots.append(dict(position=str(p),layout=layout,bag=trace))
    def bucket_stats(b):return [dict(index=str(i),count=str(len(v)),grossGram=wire(sum(v))) for i,v in sorted(b.items())]
    n=len(gross);g=sum(gross);r=None if s['tare'] is None else value(s['tare']['bagsPerKg']);t=p=z=res=a=None;price=s['priceVndPerKg'];status='EMPTY'
    if n:
        status='MISSING_TARE'
        if r is not None:
            t=F(1000*n)/r
            if t>g:raise ValueError('EXCESS_TARE')
            p=g-t
            # Nonnegative nearest kg, half toward positive, independent integer floor.
            shifted=p/1000+F(1,2);z=1000*(shifted.numerator//shifted.denominator);res=z-p
            status='MISSING_PRICE'
            if price is not None:a=F(z,1000)*int(price);status='COMPLETE'
    return dict(status='PREVIEW',profile='B-P1 v1.0',ownerId=s['ownerId'],sheetId=s['sheetId'],groupId=s['groupId'],saleScope='whole-sheet',slotSpan=slots[-1]['position'] if slots else '0',slots=slots,columns=bucket_stats(buckets[0]),boards=bucket_stats(buckets[1]),pages=bucket_stats(buckets[2]),count=str(n),grossGram=wire(g),tareRatio=wire(r),tareGram=wire(t),physicalNetGram=wire(p),commercialNetGram=wire(p),settlementGram=wire(z),residualGram=wire(res),priceVndPerKg=price,amountVnd=wire(a),completeness=status)

def group(g):
    ss=[sheet(s) for s in sorted(g['sheets'],key=lambda x:x['sheetId'])];cov={}
    for m in METRICS:
        known=[value(s[m]) for s in ss if s[m] is not None];n=len(known);missing=len(ss)-n;total=sum(known,F(0));complete=bool(ss) and missing==0
        cov[m]=dict(knownSubtotal=wire(total),completeValue=wire(total) if complete else None,knownSheetCount=str(n),missingSheetCount=str(missing),completeness='EMPTY' if not ss else 'COMPLETE' if complete else 'UNKNOWN' if not known else 'PARTIAL')
    return dict(status='PREVIEW',profile='B-P1 v1.0',ownerId=g['ownerId'],groupId=g['groupId'],sheets=ss,count=str(sum(int(s['count']) for s in ss)),grossGram=wire(sum(value(s['grossGram']) for s in ss)),coverage=cov)

def cases():
    rng=random.Random(SEED)
    def random_sheet(sid):
        n=rng.randint(0,48);pos=rng.sample(range(1,401),n);mode=rng.choice(['gram','three-digit']);raws=[]
        for _ in pos:
            if rng.randrange(7)==0:raws.append(rng.choice([None,'']))
            else:raws.append(str(rng.randint(3000,99999)) if mode=='gram' else str(rng.randint(30,999)).zfill(3))
        ratio=rng.choice([None,F(1,2),F(1),F(3,2),F(7,3),F(3),F(10),F(11,10),F(99,7)])
        price=rng.choice([None,'1','7351','7350',str(rng.randrange(1,999999)),'9007199254740993'])
        s=make_sheet(sid,raws,ratio,price,positions=pos,mode=mode);rng.shuffle(s['slots']);return s
    for i in range(320):
        s=random_sheet(f's{i}');yield dict(id=f'sheet-{i}',op='sheet',input=s,expected=sheet(s))
    for i in range(160):
        g=dict(ownerId='o',groupId='g',sheets=[random_sheet(f'g{i}s{j}') for j in range(rng.randint(0,5))]);rng.shuffle(g['sheets']);yield dict(id=f'group-{i}',op='group',input=g,expected=group(g))
    # Deliberately isolated invalid variants with independently assigned codes.
    for i in range(120):
        s=make_sheet(f'bad{i}',[rng.randint(3000,99999),rng.randint(3000,99999)]);typ=i%12
        if typ==0:s['slots'][0]['bag']['raw']='-1';code='DOMAIN'
        elif typ==1:s['slots'][0]['bag']['raw']='01';code='NONCANONICAL'
        elif typ==2:s['slots'][1]['position']=s['slots'][0]['position'];code='DUPLICATE_POSITION'
        elif typ==3:s['slots'][1]['bag']['bagId']=s['slots'][0]['bag']['bagId'];code='DUPLICATE_ID'
        elif typ==4:s['slots'][0]['bag']['ownerId']='wrong';code='PARENT_MISMATCH'
        elif typ==5:s['slots'][0]['bag']['batchId']='missing';code='PARENT_MISMATCH'
        elif typ==6:s['tare']['scope']='batch';code='UNSUPPORTED_PROFILE'
        elif typ==7:s['priceVndPerKg']=['7350','7200'];code='INVALID_TYPE'
        elif typ==8:s['tare']['bagsPerKg']=wire(0);code='DOMAIN'
        elif typ==9:s['tare']['bagsPerKg']=wire(F(1,1000000));code='EXCESS_TARE'
        elif typ==10:s['slots'][0]['position']='1000001';code='RESOURCE_LIMIT'
        else:s['saleScope']='partial';code='UNSUPPORTED_PROFILE'
        yield dict(id=f'error-{i}',op='sheet',input=s,error=code)

if __name__=='__main__':
    for c in cases():print(json.dumps(c,separators=(',',':'),ensure_ascii=True))
