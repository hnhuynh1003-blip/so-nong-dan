#!/usr/bin/env python3
"""Independent synthetic reference: stdlib Fraction, no candidate import.
JSONL is a trusted test envelope, not a raw wire endpoint. Exact fields are strings.
"""
import argparse
from fractions import Fraction
import json
import math
import random
import sys

SEED = 0x5A4E4432
MAX = 10**256 - 1
TIES = ('positive', 'negative', 'toward_zero', 'away_from_zero', 'even')

def w(f):
    return {'numerator': str(f.numerator), 'denominator': str(f.denominator)}

def expected(f):
    if abs(f.numerator) > MAX or f.denominator > MAX:
        return {'error': 'RESOURCE_LIMIT'}
    return {'value': w(f)}

def rounded(x, q, method, tie=None):
    # Use Python Fraction floor/ceil and distances, not candidate quotient logic.
    lo, hi = math.floor(x/q), math.ceil(x/q)
    if method == 'floor': return lo*q
    if method == 'ceil': return hi*q
    a, b = lo*q, hi*q
    da, db = abs(x-a), abs(x-b)
    if da != db: return a if da < db else b
    if tie == 'positive': return max(a,b)
    if tie == 'negative': return min(a,b)
    if tie == 'toward_zero': return min((a,b), key=abs)
    if tie == 'away_from_zero': return max((a,b), key=abs)
    if tie == 'even': return a if lo % 2 == 0 else b
    raise AssertionError(tie)

def gen():
    rng = random.Random(SEED)
    def emit(op, args, result, variant='AR09-seeded'):
        return dict(variant=variant, op=op, args=args, **result)
    def rational(digits):
        top = 10**digits
        return Fraction(rng.randrange(-top+1, top), rng.randrange(1,top))
    # Small, medium and near-profile-limit operands, including cancellation and over-bound outputs.
    for digits, count in ((1,120),(8,180),(32,100),(128,80),(256,80)):
        for _ in range(count):
            a,b = rational(digits),rational(digits)
            pair=[w(a),w(b)]
            for op,f in [('add',a+b),('subtract',a-b),('multiply',a*b)]:
                yield emit(op,pair,expected(f))
            yield emit('divide',pair,expected(a/b) if b else {'error':'DIV_ZERO'})
            yield emit('compare',pair,{'value': (a>b)-(a<b)})
            yield emit('parseRational',[w(a)],expected(a))
            factor = rng.choice((2,3,5,-2,-3))
            n,d=a.numerator*factor,a.denominator*factor
            if abs(n)<=MAX and abs(d)<=MAX:
                yield emit('normalizeRational',[{'numerator':str(n),'denominator':str(d)}],expected(a))
            yield emit('convertMass',[w(a),'g','kg'],expected(a/1000))
            yield emit('convertMass',[w(a),'kg','g'],expected(a*1000))
            q=abs(rational(min(digits,32))) or Fraction(1,3)
            yield emit('round',[w(a),{'method':'exact'}],expected(a))
            for method in ('floor','ceil'):
                yield emit('round',[w(a),{'method':method,'quantum':w(q)}],expected(rounded(a,q,method)))
            for tie in TIES:
                yield emit('round',[w(a),{'method':'nearest','quantum':w(q),'tie':tie}],expected(rounded(a,q,'nearest',tie)))
    # Deliberate exact ties with both signs, both parities, several rational quanta.
    for q in (Fraction(1),Fraction(1000),Fraction(3,7),Fraction(1,1000)):
        for k in range(-20,21):
            x=(Fraction(k)+Fraction(1,2))*q
            for tie in TIES:
                yield emit('round',[w(x),{'method':'nearest','quantum':w(q),'tie':tie}],expected(rounded(x,q,'nearest',tie)),'AR07-ties')
    # Same quantum and ordered inputs: independent monotonicity pairs.
    for j in range(120):
        x,y=sorted((rational(12),rational(12)))
        q=abs(rational(8)) or Fraction(1,3)
        for method in ('floor','ceil'):
            for side,v in (('lower',x),('upper',y)):
                row=emit('round',[w(v),{'method':method,'quantum':w(q)}],expected(rounded(v,q,method)),'AR09-monotonic')
                row.update(monotonicGroup=f'{j}:{method}',side=side)
                yield row
    # Wide intermediate quantum index but bounded final result (no premature reduced limit).
    n=10**255+1; x=Fraction(n); q=Fraction(1,n)
    for method in ('floor','ceil','nearest'):
        opts={'method':method,'quantum':w(q)}
        if method=='nearest': opts['tie']='even'
        yield emit('round',[w(x),opts],expected(x),'AR02-wide-index')
    yield emit('multiply',[w(Fraction(n)),w(Fraction(n))],{'error':'RESOURCE_LIMIT'},'AR02-reduced-overflow')
    yield emit('multiply',[w(Fraction(n,n-1)),w(Fraction(n-1,n))],expected(Fraction(1)),'AR02-cross-cancel')
    yield emit('divide',[w(Fraction(n,n-1)),w(Fraction(n,n-1))],expected(Fraction(1)),'AR02-cross-cancel')

def main():
    parser=argparse.ArgumentParser(); parser.add_argument('--output',required=True); args=parser.parse_args()
    count=0
    with open(args.output,'w',encoding='utf-8',newline='\n') as f:
        for v in gen():
            line=json.dumps(v,ensure_ascii=True,separators=(',',':'))
            if len(line.encode('utf-8')) > 4096: raise AssertionError('test envelope exceeds byte budget')
            f.write(line+'\n'); count+=1
    print(f'Python Fraction oracle seed={SEED} vectors={count}',file=sys.stderr)
if __name__=='__main__': main()
