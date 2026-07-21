import pandas as pd
from backend.core import profile, quality, duplicates, propose, apply_changes
def sample(): return pd.DataFrame({"nombre":["ACME SRL","Acme Srl"],"telefono":["809-555-1212","8095551212"],"correo":["a@acme.com","malo"]})
def test_profile(): assert profile(sample())[0]["rows"]==2
def test_quality_bounds(): assert 0<=quality(sample())["global"]<=100
def test_duplicates(): assert duplicates(sample(),70)
def test_reversible():
 d=sample(); ch=propose(d); clean,audit=apply_changes(d,ch,set())
 assert clean.equals(d) and set(audit.status)=={"rejected"}

