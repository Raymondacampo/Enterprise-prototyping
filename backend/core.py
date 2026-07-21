from __future__ import annotations
import hashlib, json, re, unicodedata
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any
import pandas as pd
from difflib import SequenceMatcher

def ratio(a:str,b:str)->float:
    return 100*SequenceMatcher(None,a,b).ratio()

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

def norm_text(v: Any) -> str:
    if pd.isna(v): return ""
    s = unicodedata.normalize("NFKD", str(v)).encode("ascii", "ignore").decode().strip().lower()
    return re.sub(r"\s+", " ", s)

def normalize_phone(v: Any) -> str:
    d = re.sub(r"\D", "", str(v or ""))
    if len(d) == 10: d = "1" + d
    return "+" + d if len(d) == 11 else str(v or "").strip()

COUNTRY = {"rd":"República Dominicana","rep dom":"República Dominicana","republica dominicana":"República Dominicana","dominican republic":"República Dominicana","usa":"Estados Unidos","eeuu":"Estados Unidos","united states":"Estados Unidos"}
UNIT = {"und":"UN","unidad":"UN","unidades":"UN","ea":"UN","kg.":"KG","kilo":"KG","kilogramo":"KG","lbs":"LB","libra":"LB"}

def profile(df: pd.DataFrame) -> list[dict]:
    out=[]
    for c in df.columns:
        s=df[c]; non=s.dropna().astype(str).str.strip(); nulls=int(s.isna().sum()+(non=="").sum())
        out.append({"column":c,"dtype":str(s.dtype),"rows":len(s),"nulls":nulls,"completeness":round(100*(1-nulls/max(len(s),1)),2),"unique":int(non.nunique()),"cardinality":round(non.nunique()/max(len(non),1),3),"min_length":int(non.str.len().min()) if len(non) else 0,"max_length":int(non.str.len().max()) if len(non) else 0})
    return out

def quality(df: pd.DataFrame) -> dict:
    cells=max(df.size,1); blank=sum(int(df[c].isna().sum()+(df[c].fillna("").astype(str).str.strip()=="").sum()) for c in df)
    completeness=max(0,100*(1-blank/cells))
    dup=int(df.astype(str).apply(lambda r:"|".join(norm_text(x) for x in r),axis=1).duplicated().sum())
    uniqueness=100*(1-dup/max(len(df),1))
    invalid=0; checked=0
    for c in df.columns:
        if "email" in c.lower() or "correo" in c.lower():
            vals=df[c].dropna().astype(str); checked+=len(vals); invalid+=sum(not EMAIL_RE.match(x.strip()) for x in vals if x.strip())
    validity=100*(1-invalid/max(checked,1))
    global_score=.4*completeness+.3*uniqueness+.3*validity
    return {"global":round(global_score,2),"completeness":round(completeness,2),"uniqueness":round(uniqueness,2),"validity":round(validity,2),"duplicate_rows":dup,"invalid_values":invalid}

def duplicates(df: pd.DataFrame, threshold:int=82) -> list[dict]:
    cols=[c for c in df.columns if any(k in c.lower() for k in ("nombre","name","razon","correo","email","telefono","document","rnc"))]
    pairs=[]
    for i in range(len(df)):
        for j in range(i+1,len(df)):
            scores=[ratio(norm_text(df.iloc[i][c]),norm_text(df.iloc[j][c])) for c in cols if norm_text(df.iloc[i][c]) and norm_text(df.iloc[j][c])]
            if not scores: continue
            score=round(sum(sorted(scores,reverse=True)[:3])/min(3,len(scores)),1)
            if score>=threshold: pairs.append({"row_a":i,"row_b":j,"confidence":score,"evidence":cols,"master_suggestion":i})
    return pairs

def propose(df: pd.DataFrame) -> list[dict]:
    changes=[]
    for i,row in df.iterrows():
        for c,v in row.items():
            old="" if pd.isna(v) else str(v); new=old; rule=""
            lc=c.lower()
            if "telefono" in lc or "phone" in lc: new=normalize_phone(old); rule="PHONE_E164_RD"
            elif "pais" in lc or "country" in lc: new=COUNTRY.get(norm_text(old),old.strip()); rule="COUNTRY_MASTER"
            elif "unidad" in lc or "unit" in lc: new=UNIT.get(norm_text(old),old.strip().upper()); rule="UNIT_MASTER"
            elif any(k in lc for k in ("nombre","name","razon","direccion","address")): new=" ".join(x.capitalize() for x in old.split()); rule="TEXT_CASE"
            if new!=old: changes.append({"row":int(i),"column":c,"original":old,"proposed":new,"rule":rule,"confidence":1.0,"status":"pending","source":"deterministic"})
    return changes

def apply_changes(df:pd.DataFrame, changes:list[dict], accepted:set[int]) -> tuple[pd.DataFrame,pd.DataFrame]:
    clean=df.copy(); audit=[]
    dataset_hash=hashlib.sha256(df.to_csv(index=False).encode()).hexdigest()
    for n,ch in enumerate(changes):
        status="accepted" if n in accepted else "rejected"
        if status=="accepted": clean.at[ch["row"],ch["column"]]=ch["proposed"]
        audit.append({**ch,"status":status,"timestamp":datetime.now(timezone.utc).isoformat(),"dataset_hash":dataset_hash,"actor":"human-reviewer"})
    return clean,pd.DataFrame(audit)
