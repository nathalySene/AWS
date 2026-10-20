/* ============================================================
   app.js — núcleo: helpers, estado global, layout (shell) e rotas
   ============================================================ */
const $=s=>document.querySelector(s),esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const MS=["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"];
const dt=a=>{const d=new Date(2026,9,20-a);return d.getDate()+" "+MS[d.getMonth()]};
const PC={Urgente:"#9f1239",Alta:"#dc2626",Média:"#d97706",Baixa:"#8e7ba3"};
const SC={Aberto:["#dbeafe","#1d4ed8"],"Em andamento":["#fef3c7","#b45309"],Aguardando:["#ede9fe","#6d28d9"],Resolvido:["#d1fae5","#047857"]};
const pill=s=>`<span class="pill" style="background:${SC[s][0]};color:${SC[s][1]}">${s}</span>`;
const slaC=s=>/^0h/.test(s)?"#dc2626":/^2h/.test(s)?"#d97706":"var(--mut)";
/* Estado global compartilhado entre os módulos */
let role=null,cur=1042;
const toast=m=>{const e=$("#toast");e.textContent=m;e.classList.add("on");clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove("on"),2200)};
const now=()=>{const d=new Date();return String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0")};
const render=h=>{$("#app").innerHTML=h};
function shell(act,main){const ag=role=="agent";
const it=ag?[["#/painel","🌈","Painel"],["#/painel","🎀","Fila de chamados"],["#/painel","💌","Meus atendimentos"],["#/painel","👯","Equipe"],["#/painel","📊","Relatórios"]]:[["#/novo","✨","Novo chamado"],["#/chamados","📬","Meus chamados"],["#/chamado/"+cur,"🔍","Acompanhamento"]];
return `<div class="bub b1"></div><div class="bub b2"></div><div class="shell"><aside><div class="logo"><div class="ico">♥</div>SuporteHub</div><nav>${it.map((x,i)=>`<a href="${x[0]}" class="${i==act?"on":""}">${x[1]}  ${x[2]}</a>`).join("")}</nav><button class="user" id="out" title="Sair"><span class="av">${ag?"CM":"NS"}</span><span><b>${ag?"Carlos Mendes":"Nathaly Sene"}</b><small>${ag?"Agente de suporte":"Cliente"}</small></span></button></aside><main>${main}</main></div>`}
const bindOut=()=>$("#out").onclick=()=>{role=null;location.hash="#/login"};
/* ROTAS */
function route(){const h=location.hash.slice(2).split("/"),v=h[0]||"login";if(!role&&v!="login"){location.hash="#/login";return}
if(role&&v=="login"){location.hash=role=="agent"?"#/painel":"#/novo";return}
if(role=="client"&&v=="painel"){location.hash="#/novo";return}if(role=="agent"&&(v=="novo"||v=="chamados")){location.hash="#/painel";return}
if(v=="chamado"&&h[1])cur=+h[1];({login:vLogin,novo:vNovo,chamados:vList,chamado:vTicket,painel:vPanel}[v]||vLogin)();scrollTo(0,0)}
addEventListener("hashchange",route);
/* Os scripts usam defer e rodam em ordem; a rota inicial só dispara depois de todos carregarem */
addEventListener("DOMContentLoaded",route);
