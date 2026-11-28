#!/usr/bin/env python3
"""Independent CP-002C remediation reference. No candidate imports.
Uses original Python canonicalizer and accepted B Fraction oracle. Expected classifications
are computed from structural cases, independent time comparisons, or explicit hand anchors.
"""
import copy, datetime as dt, hashlib, importlib.util, json, random, sys
from pathlib import Path
from fractions import Fraction as F
import oracle as base
SEED=202611280315
rng=random.Random(SEED)
AUTH='FIXTURE_ONLY'; T0='2026-01-01T00:00:00.000Z';T1='2026-02-01T00:00:00.000Z';T2='2026-03-01T00:00:00.000Z';T3='2026-04-01T00:00:00.000Z'; T4='2026-05-01T00:00:00.000Z'
def hash_domain(x,domain):return hashlib.sha256(('SND/C-P1/'+domain.upper()+'/v1\0').encode()+base.data(x)).hexdigest()
def emit(kind,case,**kw):base.emit(dict(kind=kind,case=case,**kw))
def context(f,at=T3,change=None):
    rs=[]
    for kind,k,i in [('POLICY','policies','policyId'),('APPROVAL','approvals','approvalId'),('EFFECTIVITY','effectivities','effectivityId')]:
        for r in f[k]:rs.append(dict(kind=kind,ownerId=r['ownerId'],recordId=r[i],sha256=hash_domain(r,'fixture')))
    return dict(authority=AUTH,decisionTime=at,records=rs,changeEvidenceSha256=None if change is None else hash_domain(change,'change'))
def refs(pid='p1',ver=1,aid='a1',eid='e1',start=T0,end=None,retirement=None):
    f=base.fixtures();p,a,e=f['policies'][0],f['approvals'][0],f['effectivities'][0]
    p.update(policyId=pid,policyVersion=ver,sourceRef='fixture:'+pid);a.update(policyId=pid,approvalId=aid,evidenceRef='fixture:'+aid);e.update(policyId=pid,approvalId=aid,effectivityId=eid,start=start,end=end,evidenceRef='fixture:'+eid)
    if retirement:
        r={k:v for k,v in e.items() if k not in ('start','end')};r.update(kind='RETIREMENT',effectivityId='retire-'+pid,retiredAt=retirement,evidenceRef='fixture:retire-'+pid);f['effectivities'].append(r)
    return f
def merge(a,b):return dict(authority=AUTH,**{k:a[k]+b[k] for k in ('policies','approvals','effectivities')})
def canon_cases():
    # Exact permitted paths; Python type distinctions separate integer array index and string object key.
    for i in range(96):
        n=rng.randrange(1000001);j=i%8
        options=[{'policyVersion':n},{'policy':{'definitionSchemaVersion':n}},{'policies':[{'policyVersion':n}]},{'policies':{str(i%4):{'policyVersion':n}}},{'policies':[[{'policyVersion':n}]]},{'policy':[{'policyVersion':n}]},{'policies':[{'other':{'definitionSchemaVersion':n}}]},{'policies':[{'snapshotSchemaVersion':n}]}]
        v=options[j];valid=j<3
        emit('canonical_path',str(i),value=v,raw=json.dumps(v,separators=(',',':')),expected='PASS' if valid else 'INVALID_NUMBER',canonicalHex=base.data(v).hex() if valid else None,sha256=base.digest(v) if valid else None)
    for name,raw,code in [('bom',b'\xef\xbb\xbf{}','INVALID_JSON'),('bom-invalid',b'\xef\xbb\xbf\xff','INVALID_UTF8'),('bom-invalid-surrogate',b'\xef\xbb\xbf\xed\xa0\x80','INVALID_UTF8'),('invalid',b'\xff','INVALID_UTF8'),('escaped-index',b'{"policies":{"\\u0030":{"policyVersion":1}}}','INVALID_NUMBER'),('escaped-duplicate',b'{"a":"a","\\u0061":"b"}','DUPLICATE_KEY')]:emit('raw',name,hex=raw.hex(),expected=code)
    valid={'policies':[{'policyVersion':1}]};emit('canonical_path','escaped-valid',value=valid,raw='{"poli\\u0063ies":[{"policy\\u0056ersion":1}]}',expected='PASS',canonicalHex=base.data(valid).hex(),sha256=base.digest(valid))
def fixture_cases():
    times=[T0,T1,T2,T3,T4];parse=lambda x:dt.datetime.fromisoformat(x.replace('Z','+00:00'))
    for i in range(160):
        # Distinct policy histories are independently generated; same-policy overlap not generated here.
        start1=rng.randrange(0,3);start2=rng.randrange(0,3);ends=[];rets=[]
        for start in [start1,start2]:
            ends.append(rng.choice([None,*times[start+1:]]));rets.append(rng.choice([None,*times[start+1:]]))
        a=refs(start=times[start1],end=ends[0],retirement=rets[0]);b=refs('p2',2,'a2','e2',times[start2],ends[1],rets[1]);f=merge(a,b)
        at=rng.choice(times);req=rng.choice([None,'p1','p2','missing']);x=parse(at);eligible=[]
        for j,start in enumerate([start1,start2]):
            if parse(times[start])<=x and (ends[j] is None or x<parse(ends[j])) and (rets[j] is None or x<parse(rets[j])):eligible.append('p'+str(j+1))
        chosen=None;reason=None
        if len(eligible)>1:status='AMBIGUOUS';reason='OVERLAPPING_APPLICABLE_POLICIES'
        elif req=='missing':status='REJECTED';reason='UNKNOWN_POLICY'
        elif not eligible:status='BLOCKED';reason='NO_ELIGIBLE_POLICY'
        elif req is not None and req!=eligible[0]:status='REJECTED';reason='REQUESTED_POLICY_INELIGIBLE'
        else:status='ELIGIBLE_FIXTURE';chosen=eligible[0]
        emit('selection',str(i),fixtures=f,trusted=context(f,T4),request=dict(authority=AUTH,ownerId='o',evaluationTime=at,requestedPolicyId=req),status=status,reason=reason,policyId=chosen)
        if i<12:
            altered=copy.deepcopy(f);altered['policies'][0]['sourceRef']='fixture:replacement'
            emit('selection','replacement-'+str(i),fixtures=altered,trusted=context(f,T4),request=dict(authority=AUTH,ownerId='o',evaluationTime=at,requestedPolicyId=req),status='REJECTED',reason='HASH_MISMATCH',policyId=None)
def build_snapshot(engine,mod,f,s):
    p,a,e=f['policies'][0],f['approvals'][0],f['effectivities'][0];r=mod.sheet(s)
    body=dict(authority=AUTH,kind='PREVIEW_EVIDENCE',snapshotSchemaVersion=1,canonicalizationVersion='SND-JCS-RESTRICTED-1',ownerId=s['ownerId'],sheetId=s['sheetId'],revisionId=s['revisionId'],input=s,inputSha256=base.digest(s,'input'),policy=p,approval=a,effectivity=e,evaluationTime=T1,businessDate='2026-01-31',engine=engine,result=r,resultSha256=base.digest(r,'result'));return {**body,'snapshotSha256':base.digest(body,'snapshot')}
def rehash(s):
    s.pop('snapshotSha256',None);s['snapshotSha256']=base.digest(s,'snapshot');return s
def replay_cases(engine,mod):
    f=refs();ctx=context(f);source=mod.make_sheet('s',[1500],F(1),'7351',group=None,revision='r1');s=build_snapshot(engine,mod,f,source);h=s['snapshotSha256']
    def out(name,snapshot,fixtures=f,trusted=ctx,anchor=h,status='MISMATCH',reason=None):emit('replay',name,snapshot=snapshot,fixtures=fixtures,trusted=trusted,anchor=anchor,status=status,reason=reason)
    out('verified',s,status='VERIFIED');out('absent',None,status='UNAVAILABLE',reason='SNAPSHOT_UNAVAILABLE');out('missing-anchor',s,anchor=None,status='UNAVAILABLE',reason='ANCHOR_UNAVAILABLE');out('missing-context',s,trusted=None,status='UNAVAILABLE',reason='FIXTURE_ANCHOR_UNAVAILABLE');out('missing-set',s,fixtures=None,status='UNAVAILABLE',reason='EVIDENCE_SET_UNAVAILABLE')
    for field in ['input','policy','approval','effectivity','engine','result']:
        x=copy.deepcopy(s);x[field]=None;out('null-'+field,x,reason='SNAPSHOT_HASH');rehash(x);out('rehashed-null-'+field,x,reason='SNAPSHOT_HASH');out('self-anchored-null-'+field,x,anchor=x['snapshotSha256'])
    for field,reason in [('policies','UNKNOWN_POLICY'),('approvals','APPROVAL_UNAVAILABLE'),('effectivities','EFFECTIVITY_UNAVAILABLE')]:
        t=copy.deepcopy(f);t[field]=[];out('absent-'+field,s,fixtures=t,status='UNAVAILABLE',reason=reason)
    for field,k in [('policies','sourceRef'),('approvals','evidenceRef'),('effectivities','evidenceRef')]:
        t=copy.deepcopy(f);t[field][0][k]='fixture:changed';
        for other in ['policies','approvals','effectivities']:
            if other!=field:t[other]=[]
        out('changed-and-missing-'+field,s,fixtures=t,reason='PINNED_REFERENCE')
    x=copy.deepcopy(s);x['engine']['sourceCommit']='f'*40;rehash(x);out('well-formed-unavailable-engine',x,anchor=x['snapshotSha256'],status='UNAVAILABLE',reason='ENGINE_UNAVAILABLE');x=copy.deepcopy(x);x['engine']['artifacts']=None;rehash(x);out('malformed-other-engine',x,anchor=x['snapshotSha256'],reason='INVALID_TYPE')
    x=copy.deepcopy(s);x['engine']['sourceCommit']='f'*40;x['result']['slots']=None;x['resultSha256']=base.digest(x['result'],'result');rehash(x);out('malformed-wire-missing-engine',x,anchor=x['snapshotSha256'],reason='INVALID_TYPE')
    x=copy.deepcopy(s);x['result']['amountVnd']={'numerator':'1','denominator':'1'};x['resultSha256']=base.digest(x['result'],'result');rehash(x);out('result-contradiction-missing-anchors',x,fixtures=None,trusted=None,anchor=None,reason='RESULT_FIELDS')
    hist=merge(refs(retirement=T2),refs('p2',2,'a2','e2',T2));out('retired-historical',s,fixtures=hist,trusted=context(hist),status='VERIFIED');out('unanchored-newer',s,fixtures=hist,trusted=ctx,reason='HASH_MISMATCH')
    change=dict(authority=AUTH,purpose='RULE_CHANGE_PLAN_ONLY',originalSnapshotSha256=h,ownerId=source['ownerId'],sheetId=source['sheetId'],fromRevisionId='r1',toRevisionId='r2',fromPolicyId='p1',fromDefinitionSha256=f['policies'][0]['definitionSha256'],toPolicyId='p2',toDefinitionSha256=hist['policies'][1]['definitionSha256'],approvalId='a2',decisionTime=T3,evidenceRef='fixture:change-independent')
    next_=mod.make_sheet('s',[2500],F(1),'7351',group=None,revision='r2');plan_req=lambda pc:dict(authority=AUTH,newInput=next_,policyChange=pc)
    emit('correction','original',snapshot=s,fixtures=hist,trusted=context(hist),anchor=h,request=plan_req(None),status='PLANNED_FIXTURE',reason=None,preview=mod.sheet(next_))
    emit('correction','unanchored-change',snapshot=s,fixtures=hist,trusted=context(hist),anchor=h,request=plan_req(change),status='BLOCKED',reason='POLICY_CHANGE_APPROVAL_REQUIRED')
    emit('correction','anchored-change',snapshot=s,fixtures=hist,trusted=context(hist,change=change),anchor=h,request=plan_req(change),status='BLOCKED',reason='POLICY_CHANGE_DEFERRED')
    for key,value in [('evidenceRef','fixture:invented'),('purpose','APPLY'),('fromDefinitionSha256','f'*64),('originalSnapshotSha256','f'*64)]:
        bad={**change,key:value};emit('correction','changed-'+key,snapshot=s,fixtures=hist,trusted=context(hist,change=change),anchor=h,request=plan_req(bad),status='BLOCKED',reason='POLICY_CHANGE_APPROVAL_REQUIRED')
def main():
    if len(sys.argv)!=2:raise SystemExit('usage: remediation_oracle.py TRUSTED_HISTORICAL_ENGINE_JSON')
    engine=json.loads(Path(sys.argv[1]).read_text());p=Path(__file__).resolve().parents[1]/'cp002b/oracle.py';spec=importlib.util.spec_from_file_location('accepted_b_fraction',p);mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
    canon_cases();fixture_cases();replay_cases(engine,mod)
if __name__=='__main__':main()
