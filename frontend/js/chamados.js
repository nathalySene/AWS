/* ============================================================
   chamados.js — dados mock, novo chamado, listagem e detalhe
   ============================================================ */
/* Estado do módulo */
let nid=1046,prio="Média",files=[],f={q:"",st:"",c:"",d:30,p:1};
const updL=t=>t.upd||(t.age==0?"Hoje":t.age==1?"Ontem":dt(t.age));
/* DADOS (mock — substituir por chamadas à API) */
const T=[
{id:1045,s:"Sistema de vendas fora do ar",c:"Sistemas",p:"Urgente",st:"Aberto",r:"Marina Alves",a:"",sla:"0h40",age:0},
{id:1044,s:"Falha ao enviar notas fiscais",c:"Sistemas",p:"Alta",st:"Em andamento",r:"João Pedro",a:"Carlos Mendes",sla:"2h10",age:0},
{id:1042,s:"Não consigo acessar o e-mail corporativo",c:"Acesso",p:"Alta",st:"Em andamento",r:"Nathaly Sene",a:"Carlos Mendes",sla:"3h05",age:0,mine:1,upd:"Hoje, 10:42",times:["09:03","09:15","10:42","—"],due:"Hoje, 13:00",open:"20 out 2026, 09:03",
 hist:[{w:"Carlos Mendes · Suporte",t:"Hoje, 10:42",x:"Estamos verificando as permissões da sua conta. Retorno em até 1 hora.",c:"#8b5cf6"},{w:"Sistema",t:"Hoje, 09:15",x:"Chamado atribuído a Carlos Mendes. Status alterado para Em análise.",c:"#b8a8cc"},{w:"Você",t:"Hoje, 09:03",x:"Desde hoje cedo recebo erro de senha incorreta no e-mail corporativo, mesmo após redefinir a senha.",c:"#10b981"}]},
{id:1038,s:"Impressora do 2º andar não imprime",c:"Hardware",p:"Média",st:"Aguardando",r:"Paulo Reis",a:"Ana Souza",sla:"1d",age:1,mine:1},
{id:1031,s:"Solicitação de novo notebook",c:"Equipamentos",p:"Baixa",st:"Aberto",r:"Nathaly Sene",a:"Rafael Lima",sla:"2d",age:2,mine:1},
{id:1027,s:"VPN desconecta a cada 10 minutos",c:"Rede",p:"Alta",st:"Em andamento",r:"Nathaly Sene",a:"Julia Costa",sla:"4h",age:3,mine:1},
{id:1019,s:"Erro ao emitir relatório no ERP",c:"Sistemas",p:"Média",st:"Resolvido",r:"Nathaly Sene",a:"Ana Souza",sla:"—",age:5,mine:1},
{id:1012,s:"Redefinição de senha do sistema",c:"Acesso",p:"Baixa",st:"Resolvido",r:"Nathaly Sene",a:"Carlos Mendes",sla:"—",age:8,mine:1}];
const SP=[["Planilha compartilhada não abre","Sistemas"],["Teclado sem resposta","Hardware"],["Wi-Fi instável na sala de reuniões","Rede"],["Acesso à pasta financeira","Acesso"],["Notebook com bateria viciada","Equipamentos"],["Sistema lento no fechamento","Sistemas"]],PP=["Baixa","Média","Alta","Média"],SS=["Resolvido","Resolvido","Aguardando","Aberto"];
for(let i=0;i<18;i++){const[s,c]=SP[i%6];T.push({id:1011-i,s,c,p:PP[i%4],st:SS[i%4],r:"Nathaly Sene",a:"Ana Souza",sla:"—",age:10+Math.floor(i*1.7),mine:1})}
/* NOVO */
function vNovo(){prio="Média";files=[];render(shell(0,`<div><h1>Conta pra gente o que houve 📝</h1><p class="sub">Quanto mais detalhes, mais rápido conseguimos te ajudar 💜</p></div><div class="two"><form class="card form" id="nf" novalidate>
<div><label class="l" for="as">Assunto</label><input class="in" id="as" placeholder="Resuma o problema em uma frase" maxlength="120"></div>
<div class="r2"><div><label class="l" for="ct">Categoria</label><span class="sel"><select class="in" id="ct"><option value="" disabled selected>Selecione uma categoria</option>${["Acesso","Hardware","Rede","Sistemas","Equipamentos"].map(c=>`<option>${c}</option>`).join("")}</select></span></div>
<div><label class="l">Prioridade</label><div class="prs">${["Baixa","Média","Alta","Urgente"].map(p=>`<button type="button" class="pr${p=="Média"?" on":""}">${p}</button>`).join("")}</div></div></div>
<div><label class="l" for="ds">Descrição detalhada</label><textarea class="in" id="ds" placeholder="O que aconteceu? Quando começou? Já tentou alguma solução?"></textarea></div>
<div><label class="l">Anexos (opcional)</label><div class="drop" id="dz" tabindex="0"><span id="dzt">Arraste arquivos aqui ou clique para enviar</span><small id="dzs">PNG, JPG ou PDF · até 10 MB</small></div><input type="file" id="fi" multiple accept=".png,.jpg,.jpeg,.pdf" hidden></div>
<p class="err" id="ne"></p><div class="acts"><button type="button" class="btn2" id="cn">Cancelar</button><button class="btn">Enviar chamado 🚀</button></div></form>
<aside class="tips" style="position:static;height:auto;border:0;width:320px"><h3>💡 Dicas para um bom chamado</h3>${["Informe a mensagem de erro exatamente como aparece.","Diga desde quando o problema acontece.","Anexe prints ou arquivos que ajudem a entender.","Descreva o que você já tentou fazer."].map(x=>`<p><b>♡</b><span>${x}</span></p>`).join("")}<div class="t">Tempo médio de primeira resposta<b>2 horas</b></div></aside></div>`));bindOut();
document.querySelectorAll(".pr").forEach(b=>b.onclick=()=>{document.querySelectorAll(".pr").forEach(x=>x.classList.remove("on"));b.classList.add("on");prio=b.textContent});
const dz=$("#dz"),fi=$("#fi"),add=l=>{const ok=[...l].filter(x=>/\.(png|jpe?g|pdf)$/i.test(x.name)&&x.size<=10485760);if(ok.length<l.length)$("#ne").textContent="Alguns arquivos foram ignorados (apenas PNG, JPG ou PDF até 10 MB).";files=files.concat(ok);if(files.length){$("#dzt").textContent="📎 "+files.map(x=>x.name).join(", ");$("#dzs").textContent=files.length+" arquivo(s) selecionado(s)"}};
dz.onclick=()=>fi.click();dz.onkeydown=e=>{if(e.key=="Enter"||e.key==" "){e.preventDefault();fi.click()}};fi.onchange=()=>add(fi.files);
dz.ondragover=e=>{e.preventDefault();dz.classList.add("ov")};dz.ondragleave=()=>dz.classList.remove("ov");dz.ondrop=e=>{e.preventDefault();dz.classList.remove("ov");add(e.dataTransfer.files)};
$("#cn").onclick=()=>location.hash="#/chamados";
$("#nf").onsubmit=e=>{e.preventDefault();const s=$("#as").value.trim(),c=$("#ct").value,d=$("#ds").value.trim();if(!s||!c||!d){$("#ne").textContent="Preencha assunto, categoria e descrição para enviar 💜";return}
const t={id:nid++,s,c,p:prio,st:"Aberto",r:"Nathaly Sene",a:"",sla:"—",age:0,mine:1,upd:"Hoje, "+now(),times:[now(),"—","—","—"],open:"20 out 2026, "+now(),hist:[{w:"Você",t:"Hoje, "+now(),x:d+(files.length?" (anexos: "+files.map(x=>x.name).join(", ")+")":""),c:"#10b981"}]};T.unshift(t);toast("Chamado #"+t.id+" enviado 🚀");location.hash="#/chamado/"+t.id}}
/* LISTA */
function vList(){render(shell(1,`<div class="hd"><div><h1>Meus chamados 📬</h1><p class="sub">Consulte e filtre todos os chamados que você abriu.</p></div><a class="btn" href="#/novo">+ Novo chamado ✨</a></div>
<div class="filt"><input class="in s" id="q" placeholder="🔍  Buscar por número ou assunto" value="${esc(f.q)}" aria-label="Buscar"><span class="sel"><select class="in" id="fs"><option value="">Status: Todos</option>${Object.keys(SC).map(s=>`<option ${f.st==s?"selected":""}>${s}</option>`).join("")}</select></span><span class="sel"><select class="in" id="fc"><option value="">Categoria: Todas</option>${["Acesso","Hardware","Rede","Sistemas","Equipamentos"].map(s=>`<option ${f.c==s?"selected":""}>${s}</option>`).join("")}</select></span><span class="sel"><select class="in" id="fd">${[[7,"7 dias"],[30,"30 dias"],[90,"90 dias"],[9999,"Todo o período"]].map(x=>`<option value="${x[0]}" ${f.d==x[0]?"selected":""}>Período: ${x[1]}</option>`).join("")}</select></span></div><div id="lt"></div>`));bindOut();
const up=()=>{f.q=$("#q").value;f.st=$("#fs").value;f.c=$("#fc").value;f.d=+$("#fd").value;f.p=1;draw()};
["q","fs","fc","fd"].forEach(i=>$("#"+i).oninput=up);draw()}
function draw(){const q=f.q.trim().toLowerCase().replace("#",""),L=T.filter(t=>t.mine&&t.age<=f.d&&(!f.st||t.st==f.st)&&(!f.c||t.c==f.c)&&(!q||String(t.id).includes(q)||t.s.toLowerCase().includes(q))),n=L.length,pp=Math.max(1,Math.ceil(n/6));if(f.p>pp)f.p=pp;const pg=L.slice((f.p-1)*6,f.p*6),C="--cols:90px 1fr 130px 100px 140px 120px";
$("#lt").innerHTML=`<div class="card tbl"><div class="tin"><div class="row th" style="${C}"><span>Nº</span><span>ASSUNTO</span><span>CATEGORIA</span><span>PRIORIDADE</span><span>STATUS</span><span>ATUALIZADO</span></div>${pg.map(t=>`<a class="row" href="#/chamado/${t.id}" style="${C}"><span class="id">#${t.id}</span><span class="sb">${esc(t.s)}</span><span style="color:var(--mn)">${t.c}</span><span style="font-weight:600;font-size:13px;color:${PC[t.p]}">${t.p}</span><span>${pill(t.st)}</span><span class="mu">${updL(t)}</span></a>`).join("")||`<div class="empty">Nenhum chamado encontrado 🔍</div>`}</div></div>
<div class="pg" style="margin-top:28px"><span>${n?`Mostrando ${(f.p-1)*6+1}–${(f.p-1)*6+pg.length} de ${n} chamados`:"0 chamados"}</span><div class="pgs"><button ${f.p==1?"disabled":""} data-p="${f.p-1}" aria-label="Anterior">‹</button>${Array.from({length:pp},(_,i)=>`<button class="${i+1==f.p?"on":""}" data-p="${i+1}">${i+1}</button>`).join("")}<button ${f.p==pp?"disabled":""} data-p="${f.p+1}" aria-label="Próxima">›</button></div></div>`;
document.querySelectorAll("[data-p]").forEach(b=>b.onclick=()=>{f.p=+b.dataset.p;draw()})}
/* TICKET */
function vTicket(){const t=T.find(x=>x.id==cur);if(!t){location.hash=role=="agent"?"#/painel":"#/chamados";return}
if(!t.hist)t.hist=[{w:"Você",t:updL(t),x:"Relato inicial: "+t.s+".",c:"#10b981"}];
const ag=role=="agent",k={Aberto:0,Aguardando:1,"Em andamento":2,Resolvido:3}[t.st],res=t.st=="Resolvido",N=["Aberto","Em análise","Em andamento","Resolvido"];
const steps=N.map((n,i)=>{const d=i<k||res,c=i==k&&!res;return(i?`<div class="cn${i<=k&&(i<k||res)?" d":""}"></div>`:"")+`<div class="step${!d&&!c?" f":""}"><div class="mk${d?" d":c?" c":""}">${d?"✓":""}</div>${n}<small>${t.times&&t.times[i]||"—"}</small></div>`}).join("");
render(shell(ag?1:2,`<div class="hd"><div><h1>Chamado #${t.id} 🎫</h1><p class="sub">${esc(t.s)}</p></div>${pill(t.st)}</div>
<div class="card prog"><h3>🌱 Progresso do atendimento</h3><div class="steps">${steps}</div></div>
<div class="two"><div class="card box" style="flex:1;min-width:0"><h3 style="margin-bottom:22px">💬 Histórico de atendimento</h3>${t.hist.map(e=>`<div class="ev"><i style="background:${e.c}"></i><div><b>${esc(ag&&e.w=="Você"?t.r:e.w)}</b><small>${e.t}</small><p>${esc(e.x)}</p></div></div>`).join("")}
<form id="rf" style="margin-top:32px"><textarea class="in" id="rt" style="height:84px" placeholder="Escreva uma resposta ou adicione informações…"></textarea><div class="rep"><span>📎 Anexar arquivo</span><button class="btn">Enviar resposta 💌</button></div></form></div>
<div class="card box det" style="width:320px;flex:none"><h3 style="margin:0">📌 Detalhes do chamado</h3>
<div><small>Categoria</small><b>${t.c}</b></div><div><small>Prioridade</small><b style="color:${PC[t.p]}">${t.p}</b></div><div><small>Responsável</small><b>${t.a||"Não atribuído"}</b></div><div><small>Aberto em</small><b>${t.open||dt(t.age)+" 2026"}</b></div><div><small>Previsão (SLA)</small><b>${t.due||"—"}</b></div>
<button class="btn2" id="rs" style="margin-top:auto" ${res?"disabled":""}>${res?"Chamado resolvido ✅":"Marcar como resolvido 🎉"}</button></div></div>`));bindOut();
$("#rf").onsubmit=e=>{e.preventDefault();const x=$("#rt").value.trim();if(!x)return;t.hist.unshift({w:ag?"Carlos Mendes · Suporte":"Você",t:"Hoje, "+now(),x,c:ag?"#8b5cf6":"#10b981"});t.upd="Hoje, "+now();t.age=0;vTicket()};
$("#rs").onclick=()=>{t.st="Resolvido";t.sla="—";t.times=t.times||["","","",""];t.times[3]=now();t.hist.unshift({w:"Sistema",t:"Hoje, "+now(),x:"Chamado marcado como resolvido.",c:"#b8a8cc"});t.upd="Hoje, "+now();toast("Chamado resolvido 🎉");vTicket()}}
