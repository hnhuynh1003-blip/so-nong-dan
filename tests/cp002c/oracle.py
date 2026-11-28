#!/usr/bin/env python3
"""Independent UTF-16-order JCS-subset and SHA-256 oracle, plus accepted Fraction reference.
No imports of candidate TypeScript. Generated values are trusted test fixtures, not raw parser.
"""
import hashlib, json, random, sys, importlib.util
from pathlib import Path
from fractions import Fraction as F
SEED=2026112803
PREFIX={'definition':b'','input':b'SND/C-P1/INPUT/v1\0','result':b'SND/C-P1/RESULT/v1\0','snapshot':b'SND/C-P1/SNAPSHOT/v1\0'}
def canonical(x):
    if x is None:return 'null'
    if x is True:return 'true'
    if x is False:return 'false'
    if isinstance(x,int):return str(x)
    if isinstance(x,str):return json.dumps(x,ensure_ascii=False,separators=(',',':'))
    if isinstance(x,list):return '['+','.join(map(canonical,x))+']'
    if isinstance(x,dict):return '{'+','.join(canonical(k)+':'+canonical(x[k]) for k in sorted(x,key=lambda k:k.encode('utf-16-be')))+'}'
    raise ValueError(type(x))
def data(x):return canonical(x).encode('utf-8')
def digest(x,domain='definition'):return hashlib.sha256(PREFIX[domain]+data(x)).hexdigest()
def emit(x):print(json.dumps(x,ensure_ascii=True,separators=(',',':')))
def definition():
    return {'profile':'B-P1 v1.0','saleScope':'whole-sheet','price':'positive-integral-vnd-per-kg-sheet-input','groupRounding':'none','moneyRounding':'none','steps':[
        {'op':'gross-sum','unit':'g'},{'op':'proportional-tare','scope':'sheet','ratio':'sheet-input-bags-per-kg','unit':'g'},
        {'op':'physical-net','unit':'g'},{'op':'commercial-net','impurity':'none','additionalDeduction':'none','unit':'g'},
        {'op':'settlement','method':'nearest','quantum':{'numerator':'1000','denominator':'1'},'tie':'positive','unit':'g','scope':'sheet'}, {'op':'exact-amount','unit':'VND'}]}
def fixtures():
    p=dict(authority='FIXTURE_ONLY',ownerId='o',policyId='p1',policyKey='rice-sheet-single-price-v1',policyVersion=1,definitionSchemaVersion=1,definition=definition(),definitionSha256=digest({'definitionSchemaVersion':1,'definition':definition()}),canonicalizationVersion='SND-JCS-RESTRICTED-1',sourceRef='fixture:policy1')
    a=dict(authority='FIXTURE_ONLY',ownerId='o',approvalId='a1',policyId='p1',definitionSha256=p['definitionSha256'],scope='rice-sheet-whole',decisionTime='2026-01-01T00:00:00.000Z',evidenceRef='fixture:approval1')
    e=dict(authority='FIXTURE_ONLY',kind='INTERVAL',ownerId='o',effectivityId='e1',policyId='p1',approvalId='a1',definitionSha256=p['definitionSha256'],scope='rice-sheet-whole',start='2026-01-01T00:00:00.000Z',end=None,evidenceRef='fixture:effect1')
    return {'authority':'FIXTURE_ONLY','policies':[p],'approvals':[a],'effectivities':[e]}
def generate():
    rng=random.Random(SEED);keys=['z','a','1','10','2','\U0001f600','\ue000','\u00e9','e\u0301','\u2028','\u2029','\u0000','"','\\','__proto__','constructor','中','\U00010000','\u007f','\u0080']
    strings=keys+['line\nreturn\r\t\b\f','a/b','', '9007199254740993','0','-1','\u001f','\u0000\U0001f4a9']
    def value(depth):
        kinds=['null','bool','str']+(['array','object'] if depth<4 else [])
        k=rng.choice(kinds)
        if k=='null':return None
        if k=='bool':return rng.choice([True,False])
        if k=='str':return rng.choice(strings)
        if k=='array':return [value(depth+1) for _ in range(rng.randrange(5))]
        return {key:value(depth+1) for key in rng.sample(keys,rng.randrange(6))}
    for i in range(512):
        d={'definition':value(1),'definitionSchemaVersion':rng.randrange(1000001)}
        if i%2:d=dict(reversed(list(d.items())))
        emit(dict(kind='canonical',id=i,value=d,canonicalHex=data(d).hex(),sha256=digest(d)))
    # Separate accepted B-P1 Python reference: no production arithmetic import.
    p=Path(__file__).resolve().parents[1]/'cp002b/oracle.py';spec=importlib.util.spec_from_file_location('accepted_b_fraction',p);mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
    cases=[mod.make_sheet('zero',[1000],F(1),'7351',group=None),mod.make_sheet('half',[1500],F(1),'7351',group=None),mod.make_sheet('fraction',[50000],F(3),'7351',group=None),mod.make_sheet('unknown-tare',[44300],None,'7350',group=None),mod.make_sheet('unknown-price',[44300],F(10),None,group=None),mod.make_sheet('empty',[],None,None,group=None)]
    for i in range(128):
        n=rng.randrange(0,16);weights=[rng.randrange(2000,100000) if rng.random()>.18 else rng.choice([None,'']) for _ in range(n)]
        positions=rng.sample(range(1,500),n);s=mod.make_sheet('s'+str(i),weights,rng.choice([None,F(1),F(3),F(7,2),F(10)]),rng.choice([None,'7350','7351','9007199254740993']),group=None,positions=positions,revision='r'+str(i+1));rng.shuffle(s['slots']);cases.append(s)
    set_=fixtures()
    for i,s in enumerate(cases):
        r=mod.sheet(s);emit(dict(kind='snapshot',id=i,input=s,result=r,inputSha256=digest(s,'input'),resultSha256=digest(r,'result'),fixtures=set_,evaluationTime='2026-02-01T00:00:00.000Z',businessDate='2026-01-31'))
def verify(path):
    count=0
    for l in Path(path).read_text().splitlines():
        s=json.loads(l);h=s.pop('snapshotSha256');assert digest(s,'snapshot')==h;assert digest(s['input'],'input')==s['inputSha256'];assert digest(s['result'],'result')==s['resultSha256'];assert digest({'definitionSchemaVersion':s['policy']['definitionSchemaVersion'],'definition':s['policy']['definition']})==s['policy']['definitionSha256'];count+=1
    assert count==134,count
    print(json.dumps(dict(snapshotDigests=count,independentInputDigests=count,independentResultDigests=count,independentDefinitionDigests=count,seed=SEED)))
if __name__=='__main__':
    if len(sys.argv)==3 and sys.argv[1]=='--verify-snapshots':verify(sys.argv[2])
    elif len(sys.argv)==1:generate()
    else:raise SystemExit('usage: oracle.py [--verify-snapshots PATH]')
