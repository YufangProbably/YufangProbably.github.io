run=lambda x,d=0,q=1:(k:=-1,i:=";",s:=[],v:={},b:=[1],o:="",G:=lambda y:s.append(y),P:=lambda:s.pop(),[(k:=(k+1)%len(x),i:=x[k],G("")if i=="Z"else G(int(getattr(s.pop(-2),f"__{i.lower()+n[i]}__")(P())))if i in(n:=dict(A="dd",S="ub",M="ul",F="loordiv",L="e",G="e",E="q"))else n[i]()if i in(n:=dict(C=lambda:G(f"{s.pop(-2)}{P()}"),P=lambda:v.update({s.pop(-2):P()}),T=lambda:G(v.get(P(),0)),B=lambda:b.pop(),Q=lambda:P()))else(s:=s+(lambda y:([chr(y)]if type(y)==int else[ord(j)for j in y]))(P()))if i=="U"else(k:=(k+P())%len(x)if P()else(P(),k)[-1])if i=="J"else(o:=o+str(P()))if i=="O"else(G(P()+i)if s>[]and type(s[-1])==str else G(i))if(A:=lambda y:96[]and type(s[-1])==int else(P()if s>[]and""==s[-1]else 0,G(int(i))))if i in(n:="0123456789")else 0,print(k,i,s,v)if d else 0)for _ in iter(lambda:b>[],0)],print(o)if q else 0,(o,s,v))[-1]

