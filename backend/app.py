import io, json
import pandas as pd
import streamlit as st
from backend.core import profile, quality, duplicates, propose, apply_changes

st.set_page_config(page_title="Enterprise Data Preparation & Quality AI",layout="wide")
st.title("Enterprise Data Preparation & Quality AI")
st.caption("MVP auditable · original preservado · humano en el circuito")
files=st.file_uploader("Cargue CSV o Excel",type=["csv","xlsx"],accept_multiple_files=True)
if not files:
    st.info("Use los datasets sintéticos de /data para ejecutar la demostración.")
    st.stop()
names=[f.name for f in files]; selected=st.selectbox("Dataset",names); f=files[names.index(selected)]
df=pd.read_csv(f) if selected and selected.lower().endswith(".csv") else pd.read_excel(f)
st.session_state.setdefault("original",df.copy())
q=quality(df); c1,c2,c3,c4=st.columns(4)
c1.metric("Score global",q["global"]); c2.metric("Completitud",q["completeness"]); c3.metric("Unicidad",q["uniqueness"]); c4.metric("Validez",q["validity"])
tabs=st.tabs(["Datos","Perfil","Duplicados","Cambios y aprobación","Reporte"])
with tabs[0]: st.dataframe(df,use_container_width=True)
with tabs[1]: st.dataframe(pd.DataFrame(profile(df)),use_container_width=True)
with tabs[2]: st.dataframe(pd.DataFrame(duplicates(df)),use_container_width=True)
changes=propose(df)
with tabs[3]:
    st.dataframe(pd.DataFrame(changes),use_container_width=True)
    accepted=set(st.multiselect("Cambios a aceptar (índice)",list(range(len(changes))),default=[]))
    clean,audit=apply_changes(df,changes,accepted)
    st.download_button("Descargar base limpia",clean.to_csv(index=False).encode(),"clean.csv","text/csv")
    st.download_button("Descargar bitácora",audit.to_csv(index=False).encode(),"audit.csv","text/csv")
with tabs[4]:
    after=quality(clean)
    report={"dataset":selected,"before":q,"after":after,"rows":len(df),"proposed_changes":len(changes),"accepted_changes":len(accepted),"duplicate_candidates":len(duplicates(df))}
    st.json(report)
    st.download_button("Descargar reporte JSON",json.dumps(report,ensure_ascii=False,indent=2).encode(),"report.json","application/json")

