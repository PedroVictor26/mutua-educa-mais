'use strict';
(() => {
  const {courses, rate} = window.EDUCA;
  const money = n => n.toLocaleString('pt-BR', {style:'currency',currency:'BRL'});
  const pmt = (principal, months) => Math.round(principal * rate / (1 - Math.pow(1 + rate, -months)) * 100) / 100;
  // Shared, local line icons. No icon font or remote JavaScript.
  const paths = {
    home:'M3 10 12 3l9 7M5 9v12h5v-7h4v7h5V9',
    school:'m2 9 10-5 10 5-10 5L2 9Zm4 2v6l6 3 6-3v-6M22 9v8',
    groups:'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M16 4a4 4 0 0 1 0 8m6 9v-2a4 4 0 0 0-3-4M13 8a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
    account_balance:'m3 8 9-5 9 5H3Zm2 3v7m7-7v7m7-7v7M3 21h18',
    calculate:'M5 3h14v18H5V3Zm3 4h8M8 12h2m4 0h2m-8 5h2m4 0h2',
    menu_book:'M12 5v16M3 4h5l4 2 4-2h5v15h-5l-4 2-4-2H3V4Z',
    person:'M20 21v-2a6 6 0 0 0-6-6h-4a6 6 0 0 0-6 6v2M16 6a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
    search:'m21 21-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',
    schedule:'M12 7v5l3 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
    arrow_forward:'M4 12h16m-6-6 6 6-6 6', arrow_back:'M20 12H4m6-6-6 6 6 6',
    chevron_right:'m9 5 7 7-7 7', check:'m5 12 4 4L19 6',
    verified:'m8 12 3 3 5-6M12 2l8 4v6c0 5-8 10-8 10S4 17 4 12V6l8-4Z',
    help:'M9 8a3 3 0 1 1 5 2c-2 1-2 2-2 3m0 3v1M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
    computer:'M3 3h18v14H3V3Zm5 18h8m-4-4v4',
    calendar_month:'M3 5h18v16H3V5Zm4-3v6m10-6v6M3 10h18',
    trending_up:'m3 17 6-6 4 4 8-10m-6 0h6v6',
    live_tv:'M3 7h18v14H3V7Zm5-5 4 5 4-5m-6 12 5-3-5-3v6Z',
    qr_code_2:'M3 3h6v6H3V3Zm12 0h6v6h-6V3ZM3 15h6v6H3v-6Zm12 0h3v3h3v3h-6v-6Z',
    support_agent:'M4 15v-3a8 8 0 0 1 16 0v3m-16-3H2v6h4v-6H4Zm16 0h2v6h-4v-6h2Zm0 6v3h-7',
    workspace_premium:'M8 14 6 22l6-3 6 3-2-8M19 8A7 7 0 1 1 5 8a7 7 0 0 1 14 0',
    monitoring:'M4 20V10m8 10V4m8 16v-7M2 22h20',
    route:'M6 5h12v7H6v7h12M8 5a2 2 0 1 1-4 0 2 2 0 0 1 4 0m12 14a2 2 0 1 1-4 0 2 2 0 0 1 4 0'
  };
  const aliases={account_circle:'person',account_balance_wallet:'account_balance',cast_for_education:'live_tv',radio_button_checked:'check',search_off:'search'};
  const icon = name => `<svg class="material-symbols-outlined" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[aliases[name] || name] || paths.school}"/></svg>`;
  const page = document.body.dataset.page;
  const params = new URLSearchParams(location.search);
  const storageKey='educaMais.v1';
  let state={};
  let storageAvailable=true;
  const validDate=value=>typeof value==='string' && Number.isFinite(Date.parse(value));
  try {
    const saved=JSON.parse(localStorage.getItem(storageKey) || '{}');
    if(saved && courses.some(c=>c.id===saved.curso)) {
      state={curso:saved.curso};
      if(validDate(saved.entrouEm)){state.entrouEm=saved.entrouEm;state.turmaFechada=!!saved.turmaFechada;}
      const cr=saved.credito;
      if(cr && Number.isFinite(cr.valor) && cr.valor>=1000 && cr.valor<=courses.find(c=>c.id===saved.curso).price*courses.find(c=>c.id===saved.curso).months && [12,24,36].includes(cr.n) && /^EDU-2026-\d{6}$/.test(cr.protocolo) && validDate(cr.enviadoEm)) {
        state.credito={valor:cr.valor,n:cr.n,parcela:pmt(cr.valor,cr.n),protocolo:cr.protocolo,enviadoEm:cr.enviadoEm};
      }
    }
  } catch {storageAvailable=false;}
  function persist(){try{localStorage.setItem(storageKey,JSON.stringify(state));}catch{storageAvailable=false;}}
  const storageNote=()=>storageAvailable?'':'<p role="status">O navegador não permitiu salvar. Você pode continuar nesta página; para acompanhar ao voltar, permita o armazenamento local.</p>';
  const course = courses.find(c => c.id === params.get('c')) || courses.find(c=>c.id===state.curso) || courses[0];
  const reserved=c=>state.curso===c.id && !!state.entrouEm;
  const enrolled=c=>({...c,enrolled:Math.min(c.seats,c.enrolled+(reserved(c)?1:0))});
  const date=value=>new Date(value).toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'});
  const deadline=()=>{const d=new Date(state.entrouEm);d.setDate(d.getDate()+21);return date(d);};
  const reservationStatus=()=>enrolled(course).enrolled>=course.seats?'Turma fechada':enrolled(course).enrolled>=course.minimum?'Turma confirmada':`Prazo para confirmar: ${deadline()}`;

  const main = document.querySelector('#main');
  const portal=page==='institution'||page==='mutua';
  const viewLinks=()=>[['index.html','Associado'],['instituicao.html','Instituição'],['painel-mutua.html','Mútua']].map(([url,label])=>`<a href="${url}"${(page==='institution'?label==='Instituição':page==='mutua'?label==='Mútua':label==='Associado')?' aria-current="page"':''}>${label}</a>`).join('');
  const routes = portal?(page==='institution'?[['summary','#resumo','Resumo','monitoring'],['publish','#publicar','Publicar','school'],['classes','#turmas','Turmas','groups'],['payments','#repasses','Repasses','account_balance']]:[['summary','#resumo','Resumo','monitoring'],['scenario','#cenario','Cenário','calculate'],['health','#carteira','Carteira','verified'],['funnel','#funil','Funil','groups']]):[['home','index.html','Início','home'],['catalog','cursos.html','Cursos','school'],['simulator','simulador.html','Simulador','calculate'],['dashboard','meu-curso.html','Meu curso','menu_book']];
  const navLinks = mobile => routes.map(([key,url,label,symbol]) => `<a href="${url}"${(page===key || (page==='course' && key==='catalog'))?' aria-current="page"':''}>${mobile?icon(symbol):''}${label}</a>`).join('');
  document.querySelector('#header').innerHTML = `<div class="container header-inner"><a class="brand" href="index.html" aria-label="Mútua Educa+, início"><img src="assets/img/mutua-educa-logo-branca.png" width="162" height="35" alt="Mútua Educa+"></a><nav class="desktop-nav" aria-label="Navegação principal">${navLinks(false)}</nav><nav class="view-switch" aria-label="Trocar visão"><span>Visão:</span>${viewLinks()}</nav><div class="account"><details class="profile-menu"><summary class="icon-button" aria-label="Abrir menu do perfil">${icon('person')}</summary><div class="profile-popover"><strong>${page==='institution'?'Coordenação de Pós-graduação':page==='mutua'?'Gestão Mútua':'Eng. Conrado Pires'}</strong><span>Visão:</span>${viewLinks()}${portal?'':'<button class="button secondary" data-modal="profile">Meu perfil</button>'}</div></details></div></div>`;
  document.querySelector('#mobile-nav').innerHTML = `${navLinks(true)}`;
  // One card renderer keeps the inline entry and role dialog in sync.
  const roleCards=()=>[
    ['person','Associado','Conrado, engenheiro civil. Curso em andamento, parcelas e a próxima turma.','meu-curso.html','Entrar como associado'],
    ['school','Instituição parceira','Centro Universitário do Planalto. Publica turmas e acompanha repasses.','instituicao.html','Entrar como instituição'],
    ['account_balance','Mútua','Gestão do benefício. Turmas, cenário de 3 anos e saúde da carteira.','painel-mutua.html','Entrar como Mútua']
  ].map(([symbol,name,description,url,label])=>`<article class="role-card"><span class="line-icon">${icon(symbol)}</span><h3>${name}</h3><p>${description}</p><a class="button secondary" href="${url}">${label}</a></article>`).join('');
  const viewNavigation=()=>`<nav class="view-navigation" aria-label="Navegação entre visões"><a href="index.html">Início</a><button type="button" data-role-picker aria-haspopup="dialog" aria-controls="role-dialog">Trocar de visão</button></nav>`;
  const roleDialog=document.createElement('dialog');
  roleDialog.id='role-dialog';
  roleDialog.setAttribute('aria-labelledby','role-dialog-title');
  roleDialog.innerHTML=`<h2 id="role-dialog-title">Entrar como</h2><div class="role-cards">${roleCards()}</div><button type="button" class="modal-close icon-button" aria-label="Fechar escolha de visão">×</button>`;
  document.body.append(roleDialog);
  let roleOpener;
  document.addEventListener('click',event=>{
    const trigger=event.target.closest('[data-role-picker]');
    if(!trigger)return;
    roleOpener=trigger;
    roleDialog.showModal();
    roleDialog.querySelector('.role-card a').focus();
  });
  roleDialog.querySelector('.modal-close').addEventListener('click',()=>roleDialog.close());
  roleDialog.addEventListener('close',()=>{if(roleOpener?.isConnected)roleOpener.focus();});
  roleDialog.addEventListener('click',event=>{
    if(event.target!==roleDialog)return;
    const rect=roleDialog.getBoundingClientRect();
    if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)roleDialog.close();
  });
  if(page==='home'){
    document.querySelector('#platform-roles').innerHTML=roleCards();
    document.querySelector('.account').innerHTML=`<button type="button" class="icon-button" data-role-picker aria-label="Entrar na plataforma" aria-haspopup="dialog" aria-controls="role-dialog">${icon('person')}</button>`;
  }

  const disclaimer = 'Parcela fixa pela Tabela Price, sem correção.';
  let simulation={};
  const meta = c => `${c.months} meses · ${c.hours} h · ${c.mode}`;
  const vacancies = n => n <= 0 ? 'Turma fechada' : `<strong>${n} ${n === 1 ? 'vaga disponível' : 'vagas disponíveis'}</strong> na turma.`;
  const bar = original => {const c=enrolled(original);return `<div class="enrollment"><div class="enrollment-row"><span><span class="dot"></span>${c.enrolled} de ${c.seats} ${c.seats === 1 ? 'inscrito' : 'inscritos'}</span><span>${Math.round(c.enrolled/c.seats*100)}%</span></div><div class="track" role="progressbar" aria-label="Inscrições na turma" aria-valuenow="${c.enrolled}" aria-valuemin="0" aria-valuemax="${c.seats}"><span style="width:${c.enrolled/c.seats*100}%"></span></div><p class="source-note">${c.enrolled>=c.seats?'Turma fechada':c.enrolled>=c.minimum?'Turma confirmada':'Turma em formação'} · Mínimo para confirmar a turma: ${c.minimum} · ${c.seats} vagas</p></div>`;};
  const terms = (selected, large=false) => `<div class="term-row${large?' large-terms':''}" role="group" aria-label="Prazo de pagamento">${[12,24,36].map(n => `<button class="term" data-term="${n}" aria-pressed="${selected===n}">${large?`PLANO ${n} MESES<strong>${n}x de <span data-term-price="${n}"></span></strong><small>Taxa 0,75% a.m.</small>`:`${n}x`}</button>`).join('')}</div>`;
  const card = c => `<article class="course-card"><div class="course-photo"><img src="assets/img/${c.image}" width="600" height="360" loading="lazy" alt="Área de atuação: ${window.EDUCA.escape(c.name)}"><span class="badge">${window.EDUCA.escape(c.type.toLocaleUpperCase('pt-BR'))}</span><div class="photo-bottom"><span>${icon('groups')} Turma Mútua</span><span>Turma 2026.2</span></div></div><div class="course-content"><div class="partner">${window.EDUCA.escape(c.institution || 'Instituição parceira')}</div><h3>${window.EDUCA.escape(c.name)}</h3><div class="meta">${icon('schedule')}<span>${meta(c)}</span></div><div class="price-box"><div><del>De ${money(c.before)}/mês</del><div class="price">${money(c.price)}<small>/mês</small></div></div><span class="badge green">-${c.discount || 30}% turma Mútua</span></div>${bar(c)}<a class="button" href="curso.html?c=${c.id}">Ver curso ${icon('arrow_forward')}</a></div></article>`;
  window.EDUCA.ui={money,icon,card,bar,observeMotion,viewNavigation};
  document.addEventListener('keydown',event=>{if(event.key==='Escape')document.querySelector('.profile-menu')?.removeAttribute('open');});
  if(portal){
    const modal=document.querySelector('#modal');
    modal.addEventListener('click',event=>{if(event.target.closest('.modal-close,.modal-dismiss'))modal.close();});
    return;
  }
  function catalog() {
    main.innerHTML = `<section class="panel hero"><div class="eyebrow">${icon('verified')} Mútua Educa+ · edição 2026</div><h1>Sua pós com desconto de turma e crédito da Mútua</h1><p>Compare mensalidades, vagas e modalidades. Escolha uma turma de associados, simule o crédito e acompanhe sua formação.</p><form class="search" role="search">${icon('search')}<input id="search" type="search" aria-label="Buscar cursos" placeholder="Buscar curso, área ou modalidade…"><button class="button" type="submit">Buscar</button></form><div class="chips" role="group" aria-label="Filtrar cursos">${['Todos','Pós-graduação','Especialização','Mestrado','EAD','Híbrido','Presencial'].map((f,i)=>`<button class="chip" data-filter="${f}" aria-pressed="${!i}">${f}</button>`).join('')}</div></section><div class="catalog-layout"><section aria-labelledby="catalog-title"><div class="section-line"><h2 id="catalog-title"><span class="dot"></span>Cursos com turma aberta</h2><span id="result-count" role="status"></span></div><div class="course-grid" id="course-grid"></div></section><aside class="sidebar"><section class="panel mini" aria-labelledby="mini-title"><div class="eyebrow">${icon('account_balance')} Crédito educacional</div><h2 id="mini-title">Crédito Mútua Educa+</h2><p>Planeje o investimento na sua formação.</p><div class="rate-box"><div class="eyebrow">Taxa de juros</div><strong>0,75%</strong> <small>ao mês</small></div><label class="field-label" for="mini-value">VALOR FINANCIADO <output id="mini-value-output"></output></label><input id="mini-value" type="range" min="2000" max="20000" step="500" value="10000"><div class="range-labels"><span>R$ 2.000</span><span>R$ 20.000</span></div><div style="margin-top:20px" class="field-label">Prazo</div>${terms(24)}<div class="estimate" aria-live="polite"><p>Parcela estimada</p><strong id="mini-payment"></strong></div><a class="button" id="mini-link" href="simulador.html">Simular completo ${icon('arrow_forward')}</a><p class="disclaimer">${disclaimer}</p></section><section class="panel faq"><h2>${icon('help')} Dúvidas frequentes</h2><details><summary>Como funciona o desconto de turma?</summary><p>Quando a turma atinge o número de associados previsto, a instituição parceira aplica o desconto de turma combinado nas mensalidades.</p></details><details><summary>Como pago o curso?</summary><p>Você paga à vista com a instituição parceira ou simula o parcelamento com o crédito educacional da Mútua.</p></details><details><summary>O que acontece depois da matrícula?</summary><p>A plataforma acompanha seu progresso, a próxima aula, a aprovação contínua e as parcelas do seu crédito.</p></details></section></aside></div><section class="panel accompany"><div class="eyebrow">${icon('route')} Da escolha ao certificado</div><h2>Aulas, progresso e parcelas em Meu curso</h2><p>Consulte a próxima aula, os módulos concluídos e o vencimento do crédito.</p><div class="steps">${[['school','Escolha a turma','Encontre o curso que faz sentido para sua carreira.'],['groups','Desconto de turma','Associados juntos para uma formação com desconto.'],['account_balance','Crédito Mútua','Simule o valor e escolha seu prazo.'],['monitoring','Acompanhamento','Seu curso, progresso e crédito no mesmo lugar.']].map(([i,t,d],n)=>`<div><div class="step-icon">${icon(i)}</div><h3>${n+1}. ${t}</h3><p>${d}</p></div>`).join('')}</div><a class="button" href="meu-curso.html">Conhecer o acompanhamento ${icon('arrow_forward')}</a></section>`;
    let filter = 'Todos';
    const search = document.querySelector('#search');
    const normalize = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
    function render() {
      const query = normalize(search.value.trim());
      const found = courses.filter(c => (filter==='Todos'||c.type===filter||c.mode.includes(filter)) && normalize(`${c.name} ${c.type} ${c.mode} Instituição parceira`).includes(query));
      document.querySelector('#course-grid').innerHTML = found.length ? found.map(card).join('') : `<div class="panel empty">${icon('search_off')}<h3>Nenhum curso encontrado</h3><p>Tente outro termo ou veja todas as turmas disponíveis.</p><button class="button" id="reset-filters">Ver todos</button></div>`;
      document.querySelector('#result-count').textContent = `${found.length} de 6 cursos`;
      document.querySelectorAll('[data-filter]').forEach(b => b.setAttribute('aria-pressed', b.dataset.filter === filter));
      const reset = document.querySelector('#reset-filters');
      if(reset) reset.addEventListener('click',()=>{filter='Todos';search.value='';render();search.focus();});
    }
    document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{filter=b.dataset.filter;render();}));
    search.addEventListener('input',render);
    document.querySelector('.search').addEventListener('submit', e=>{e.preventDefault();render();document.querySelector('#catalog-title').scrollIntoView({block:'start'});});
    let months=24;
    const slider=document.querySelector('#mini-value');
    function updateMini(){const value=Number(slider.value);document.querySelector('#mini-value-output').textContent=money(value);document.querySelector('#mini-payment').textContent=`${months}x de ${money(pmt(value,months))}`;document.querySelector('#mini-link').href=`simulador.html?valor=${value}&prazo=${months}`;slider.setAttribute('aria-valuetext',money(value));}
    document.querySelectorAll('[data-term]').forEach(b=>b.addEventListener('click',()=>{months=Number(b.dataset.term);document.querySelectorAll('[data-term]').forEach(t=>t.setAttribute('aria-pressed',t===b));updateMini();}));
    slider.addEventListener('input',updateMini);render();updateMini();
  }
  function detail() {
    const c=course,total=c.price*c.months;
    main.innerHTML=`<a class="back" href="cursos.html">${icon('arrow_back')} Voltar aos cursos</a><div class="split"><div class="stack"><section class="panel course-title"><img class="course-banner" src="assets/img/${c.image}" width="900" height="500" alt="Área de atuação: ${window.EDUCA.escape(c.name)}" fetchpriority="high"><span class="badge">${c.type}</span><div class="partner">Instituição parceira</div><h1>${c.name}</h1><div class="details-meta"><span>${icon('schedule')} ${c.months} meses</span><span>${icon('menu_book')} ${c.hours} h</span><span>${icon('computer')} ${c.mode}</span></div><span class="badge">${icon('calendar_month')} Início: Turma 2026.2</span></section><section class="panel"><div class="eyebrow">Seu percurso de aprendizagem</div><h2>Conteúdo do curso</h2><ol class="module-list">${c.modules.map(m=>`<li>${m}</li>`).join('')}</ol></section></div><aside class="stack"><section class="panel offer"><span class="badge green">-30% turma Mútua</span><h2 style="margin-top:18px">Mensalidade com desconto de turma</h2><del>De ${money(c.before)}/mês</del><div class="price">${money(c.price)}<small>/mês</small></div><p>Total do curso: <strong>${money(total)}</strong> · ${c.months} meses</p>${bar(c)}<p>${vacancies(c.seats-enrolled(c).enrolled)}</p>${reserved(c)?'<span class="badge green">Você está nesta turma</span><a class="button" href="meu-curso.html">Ver meu curso</a>':'<button class="button" data-modal="reserve">Entrar na turma</button>'}<a class="button secondary" href="simulador.html?c=${c.id}">Simular crédito para este curso</a></section><section class="panel"><div class="eyebrow">Escolha como se planejar</div><h2>Como pagar</h2><div class="payment-options"><div class="payment-option"><h3>À vista</h3><p>${money(total)} com a instituição parceira.</p></div><div class="payment-option"><h3>Crédito Mútua</h3><p><strong>24x de ${money(pmt(total,24))}</strong>.</p></div></div><p class="disclaimer">${disclaimer}</p></section></aside></div>`;
  }
  function simulator() {
    const c=course,total=c.price*c.months;
    const rawValue=Number(params.get('valor'));
    const custom=params.has('valor') && Number.isFinite(rawValue) && rawValue>0;
    const max=total;
    let principal=custom?Math.max(1000,Math.min(max,rawValue)):total;
    const rawTerm=Number(params.get('prazo'));
    let months=[12,24,36].includes(rawTerm)?rawTerm:24;
    main.innerHTML=`<a class="back" href="curso.html?c=${c.id}">${icon('arrow_back')} Voltar ao curso</a><section class="panel page-heading"><div class="eyebrow">${icon('account_balance')} Crédito Mútua Educa+</div><h1>Simulador de crédito Mútua</h1><p>Simule o parcelamento do curso antes de pedir o crédito.</p></section><section class="panel course-summary"><div><span class="badge">${c.type} · Turma 2026.2</span><div class="partner" style="margin-top:12px">Instituição parceira</div><h2>${c.name}</h2><p class="meta">${meta(c)}</p><a class="back" href="curso.html?c=${c.id}">Ver detalhes do curso ${icon('arrow_forward')}</a></div><div class="total-course"><div class="eyebrow">${icon('groups')} Desconto de turma aplicado</div><p>${money(c.price)}/mês × ${c.months} meses</p><strong>${money(total)}</strong><p>Valor total do curso</p></div></section><div class="split simulator-layout"><div class="stack"><section class="panel"><div class="eyebrow">Parâmetro 01</div><h2>Valor financiado</h2><label class="sim-amount" for="sim-value"><span>Valor selecionado</span><output id="sim-value-output"></output></label><input id="sim-value" type="range" min="1000" max="${max}" step="1" value="${principal}"><div class="range-labels"><span>${money(1000)}</span><span>${money(max)}</span></div><div class="quick-actions" role="group" aria-label="Percentual do curso"><button class="button secondary" data-percent="0.5">50% do curso</button><button class="button secondary" data-percent="1">100% do curso</button></div></section><section class="panel"><div class="eyebrow">Parâmetro 02 · taxa 0,75% a.m.</div><h2>Prazo de pagamento</h2>${terms(months,true)}</section></div><section class="panel simulator-summary" aria-labelledby="summary-title"><div class="eyebrow">Sua simulação</div><h2 id="summary-title">Resumo da simulação</h2><div class="summary-list" aria-live="polite" aria-atomic="true"><div class="summary-row"><span>Taxa de juros</span><strong>0,75% a.m.</strong></div><div class="summary-row"><span>Valor financiado</span><strong id="summary-principal"></strong></div><div class="summary-row"><span>Prazo escolhido</span><strong id="summary-months"></strong></div><div class="summary-row big"><span>Parcela fixa</span><strong id="summary-payment"></strong></div><div class="summary-row"><span>Juros no período</span><strong id="summary-interest"></strong></div></div><div class="total-box"><div class="eyebrow">Total a pagar</div><strong id="summary-total"></strong><p id="total-description"></p></div><div class="capital-labels"><span id="capital-label"></span><span id="interest-label"></span></div><div class="capital-track" role="img" id="capital-bar"><span></span></div><button class="button" data-modal="credit">Pedir crédito ${icon('arrow_forward')}</button><p class="disclaimer">${disclaimer}</p></section></div>`;
    main.insertAdjacentHTML('beforeend','<section class="comparison-section finance-comparison panel"><h2>Turma + crédito Mútua contra preço de tabela</h2><div class="comparison-grid" id="sim-comparison"></div><p class="saving" id="sim-saving" aria-live="polite"></p></section>');
    const slider=document.querySelector('#sim-value');
    function update(){
      const payment=pmt(principal,months),paid=payment*months,interest=paid-principal,capital=principal/paid*100;
      simulation={valor:principal,n:months,parcela:payment};
      updateComparison(c,principal,months);
      const values={'sim-value-output':money(principal),'summary-principal':money(principal),'summary-months':`${months} meses`,'summary-payment':money(payment),'summary-interest':money(interest),'summary-total':money(paid),'total-description':`${months} parcelas de ${money(payment)}, já arredondadas para centavos.`,'capital-label':`${Math.round(capital)}% Capital`,'interest-label':`${Math.round(100-capital)}% Juros`};
      Object.entries(values).forEach(([id,value])=>document.getElementById(id).textContent=value);
      slider.value=principal;slider.setAttribute('aria-valuetext',money(principal));
      document.querySelectorAll('[data-term]').forEach(b=>b.setAttribute('aria-pressed',Number(b.dataset.term)===months));
      document.querySelectorAll('[data-term-price]').forEach(el=>el.textContent=money(pmt(principal,Number(el.dataset.termPrice))));
      document.querySelectorAll('[data-percent]').forEach(b=>b.setAttribute('aria-pressed',principal===Math.max(1000,Math.min(max,total*Number(b.dataset.percent)))));
      document.querySelector('#capital-bar span').style.width=`${capital}%`;
      document.querySelector('#capital-bar').setAttribute('aria-label',`${Math.round(capital)}% capital e ${Math.round(100-capital)}% juros`);
    }
    slider.addEventListener('input',()=>{principal=Number(slider.value);update();});
    document.querySelectorAll('[data-term]').forEach(b=>b.addEventListener('click',()=>{months=Number(b.dataset.term);update();}));
    document.querySelectorAll('[data-percent]').forEach(b=>b.addEventListener('click',()=>{principal=Math.max(1000,Math.min(max,total*Number(b.dataset.percent)));update();}));
    update();
  }
  function updateComparison(c,principal,n){
    const table=c.months*c.before,total=c.months*c.price;
    const payment=Math.round(pmt(principal,n)*100)/100,paid=n*payment;
    const own=Math.max(0,total-principal),combined=paid+own,saving=table-combined;
    let limit=0;
    for(let term=1;term<=36;term++)if(term*Math.round(pmt(principal,term)*100)/100+own<=table)limit=term;
    document.querySelector('#sim-comparison').innerHTML=`<article><span class="eyebrow">Sozinho, preço de tabela</span><p>${c.months} x ${money(c.before)}</p><strong>${money(table)}</strong><small>Total sozinho</small></article><article class="collective-price"><span class="eyebrow">Com a turma e o crédito Mútua</span><p>${n}x de ${money(payment)}</p><strong>${money(paid)}</strong><small>Total do crédito${own!==0?` · ${money(own)} de recursos próprios · ${money(combined)} ao todo`:''}</small></article>`;
    document.querySelector('#sim-saving').textContent=saving>=0?`Você economiza ${money(saving)} mesmo pagando juros.`:`Neste prazo, os juros passam o desconto. ${limit?`Prefira até ${limit} parcelas.`:'Reduza o valor financiado.'}`;
  }
  function dashboard(){
    main.innerHTML=`${viewNavigation()}<section class="panel dashboard-heading"><div class="welcome"><p>Olá, Eng. Conrado</p><span class="badge">Associado</span></div><h1>Engenharia de Pavimentos</h1><p>Instituição parceira · Pós-graduação · Turma 2026.2</p></section><div class="dashboard-grid"><div class="stack"><div class="student-photo"><img src="assets/img/aluno-pavimento.jpg" width="900" height="500" alt="Profissional acompanhando uma obra de pavimentação" fetchpriority="high"><div class="photo-bottom"><span class="badge">${icon('groups')} Turma 2026.2</span><span>EAD · aulas ao vivo</span></div></div><section class="panel"><div class="panel-title"><h2>${icon('trending_up')} Progresso do curso</h2><strong>50%</strong></div><div class="track blue" style="height:10px" role="progressbar" aria-label="Progresso do curso" aria-valuenow="50" aria-valuemin="0" aria-valuemax="100"><span style="width:50%"></span></div><div class="progress-details"><div><small>Mês 9 de 18 · início em 31/03/2026</small><small>Módulo 3 de 6</small>3 de 6 concluídos</div><div><small>Carga horária</small><strong>210 h de 420 h</strong></div></div></section><section class="panel next-class"><div class="panel-title"><h2>${icon('live_tv')} Próxima aula</h2><span class="badge">QUI, 19H</span></div><h3>Dimensionamento de pavimento flexível</h3><p>${icon('cast_for_education')} Instituição parceira · aula ao vivo</p><button class="button" data-modal="classroom">Acessar sala virtual ${icon('arrow_forward')}</button></section><section class="panel support">${icon('support_agent')}<div><h3>Dúvidas acadêmicas?</h3><p>Instituição parceira</p></div><button class="button secondary" data-modal="support">Abrir ${icon('chevron_right')}</button></section></div><div class="stack"><section class="panel"><div class="panel-title"><h2>${icon('account_balance_wallet')} Meu crédito Mútua</h2><span class="badge green"><span class="dot"></span>Em dia</span></div><div class="credit-details"><div><small>Parcela 8 de 24</small><strong>R$ 394,72</strong></div><div><small>Vencimento</small><strong>30/11/2026</strong></div></div><p class="source-note">7 parcelas pagas · Saldo de 17 parcelas: R$ 6.710,24. A primeira venceu em 30/04/2026, 30 dias após o início.</p><button class="text-button" data-modal="payment"><span>${icon('qr_code_2')} Ver boleto ou Pix</span>${icon('chevron_right')}</button></section><section class="panel approval"><div class="step-icon">${icon('workspace_premium')}</div><div><h2>Aprovação contínua</h2><p>Média atual de aproveitamento: <strong>9,2</strong></p></div></section><section class="panel"><div class="eyebrow">Sua formação, passo a passo</div><h2>Etapas da formação</h2><ol class="journey">${[['done','check','Matrícula confirmada','Matrícula na instituição parceira','Concluído'],['done','check','Desconto de turma 30%','Turma Mútua fechada','Concluído'],['current','radio_button_checked','Curso em andamento','Progresso acadêmico e crédito acompanhados','Você está aqui'],['','4','Certificado','Emitido pela instituição parceira','Previsto'],['','5','Pedido ao Crea com o certificado','Próxima etapa após a conclusão do curso','Final']].map(([status,symbol,title,desc,badge])=>`<li class="${status}"><span class="stage">${status?icon(symbol):symbol}</span><div><h3>${title}</h3><p>${desc}</p><span class="badge${status==='done'?' green':''}">${badge}</span></div></li>`).join('')}</ol></section></div></div>`;
  }
  function nextClass(){
    if(!state.curso || (!state.entrouEm && !state.credito))return;
    const c=courses.find(c=>c.id===state.curso),cr=state.credito;
    const steps=cr?[
      ['Pedido enviado',`${date(cr.enviadoEm)} · Protocolo ${cr.protocolo}`],
      ['Análise de crédito','Até 5 dias úteis'],
      ['Aprovação',enrolled(c).enrolled>=c.minimum?'Turma confirmada. Aprovação logo após a análise de crédito.':'Quando a turma atingir o mínimo para confirmar'],
      ['Pagamento à instituição','A Mútua paga direto, por mensalidade, a partir do início das aulas'],
      ['Sua 1ª parcela',`30 dias depois do início, ${cr.n}x de ${money(cr.parcela)}`]
    ]:[['Pedido de crédito pendente','Simule para escolher seu prazo e pedir o crédito.']];
    main.querySelector('.view-navigation').insertAdjacentHTML('afterend',`<section class="panel next-reservation"><p class="eyebrow">Seu próximo passo</p><h2>Sua próxima turma</h2><div class="reservation-card"><div class="partner">Instituição parceira</div><h3>${c.name}</h3>${bar(c)}<p>${state.entrouEm?reservationStatus():'Reserva ainda não realizada'}</p>${!state.entrouEm?`<a class="inline-link" href="curso.html?c=${c.id}">Entrar na turma</a>`:''}</div><h3>Seu crédito, passo a passo</h3><ol class="credit-timeline">${steps.map(([title,text],i)=>`<li${i===0?' class="current" aria-current="step"':''}><span class="timeline-stage">${i+1}</span><div><h3>${title}</h3><p>${i===2 && enrolled(c).enrolled>=c.minimum?`<span class="condition-met">${icon('check')}<span class="sr-only">Condição da turma cumprida. </span></span>`:''}${text}</p>${!cr?`<a class="button" href="simulador.html?c=${c.id}">Simular meu crédito</a>`:''}</div>${i<steps.length-1?icon('chevron_right'):''}</li>`).join('')}</ol><button class="text-button cancel-reservation" data-modal="cancel">Cancelar reserva</button></section><h2 class="ongoing-title">Em andamento</h2>`);
  }
  function home() {
    const c=courses.find(c=>c.id==='pavimentos');
    const principal=c.price*c.months, table=c.before*c.months;
    // The comparison totals the displayed installments, rounded to cents.
    const payment=Math.round(pmt(principal,24)*100)/100, paid=payment*24;
    document.querySelector('#hero-enrollment').innerHTML=`<span class="eyebrow">${enrolled(c).enrolled>=c.minimum?'Turma confirmada':'Turma em formação'}</span><strong>${c.name}</strong><p>${enrolled(c).enrolled} inscritos · ${c.seats} vagas · ${c.seats-enrolled(c).enrolled} disponíveis</p>${bar(c)}`;
    document.querySelector('#hero-payment').innerHTML=`${icon('account_balance')}<div><strong>24x de ${money(payment)}</strong><p>parcela fixa</p></div>`;
    document.querySelector('#comparison-course').textContent=`${c.name} · ${c.months} meses`;
    document.querySelector('#comparison').innerHTML=`<article><span class="eyebrow">Sozinho, preço de tabela</span><p>${c.months} x ${money(c.before)}</p><strong>${money(table)}</strong><small>Valor total do curso</small></article><article class="collective-price"><span class="eyebrow">Com a turma e o crédito Mútua</span><p>${c.months} x ${money(c.price)} = ${money(principal)} de curso</p><strong>24x de ${money(payment)}</strong><small>${money(paid)} com juros</small></article>`;
    document.querySelector('#saving').textContent=`Você economiza ${money(table-paid)} mesmo pagando juros.`;
    document.querySelector('#formation-courses').innerHTML=[...courses].sort((a,b)=>(a.seats-a.enrolled)-(b.seats-b.enrolled)).slice(0,3).map(card).join('');
    document.querySelectorAll('[data-icon]').forEach(el=>el.innerHTML=icon(el.dataset.icon));
    observeMotion();
  }
  function observeMotion(){
    const targets=document.querySelectorAll('.number-reveal,.landing .track>span,.portal .track>span:not(.motion-ready)');
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
    if(reduced.matches || !('IntersectionObserver' in window))return;
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(!entry.isIntersecting)return;
      const target=entry.target.classList.contains('track')?entry.target.firstElementChild:entry.target;
      target.classList.remove('motion-pending');
      observer.unobserve(entry.target);
    }),{threshold:0.25});
    targets.forEach(el=>{el.classList.add('motion-ready','motion-pending');observer.observe(el.parentElement.classList.contains('track')?el.parentElement:el);});
    reduced.addEventListener('change',()=>{if(reduced.matches){targets.forEach(el=>el.classList.remove('motion-pending'));observer.disconnect();}});
  }
  ({home,catalog,course:detail,simulator,dashboard}[page] || catalog)();
  if(page==='dashboard')nextClass();
  function updateAvatar(){const avatar=document.querySelector('.account .icon-button');avatar.classList.toggle('has-reservation',!!state.entrouEm);avatar.setAttribute('aria-label',`Perfil de Eng. Conrado Pires${state.entrouEm?', turma reservada':''}`);}
  if(page!=='home')updateAvatar();
  const modal=document.querySelector('#modal');
  let opener;
  function showDialog(title,body,step=''){
    modal.innerHTML=`<button class="modal-close icon-button" aria-label="Fechar modal">×</button>${step?`<p class="dialog-step">${step}</p>`:''}<h2 id="modal-title" tabindex="-1">${title}</h2><div class="dialog-body">${body}</div>`;
    if(!modal.open)modal.showModal();
    modal.querySelector('#modal-title').focus();
  }
  function eligibility(step=0){
    const questions=['Você é associado contribuinte da Mútua?','Está em dia com a anuidade do Crea?','Tem graduação concluída na área do curso?'];
    showDialog('Quem pode participar?',`<p>Responda 3 perguntas</p><h3>${questions[step]}</h3><div class="eligibility-actions"><button class="button" data-answer="yes" data-step="${step}">Sim</button><button class="button secondary" data-answer="no" data-step="${step}">Não</button></div>`,`Passo ${step+1} de 3`);
  }
  function join(){
    if(!reserved(course))state={curso:course.id,entrouEm:new Date().toISOString(),turmaFechada:course.enrolled+1>=course.seats,...(state.curso===course.id && state.credito?{credito:state.credito}:{})};
    persist();updateAvatar();detail();
    const c=course,count=enrolled(c).enrolled;
    showDialog('Você entrou na turma',`<p class="badge green">${state.turmaFechada?`Turma fechada. O desconto de 30% está garantido para os ${c.seats} associados.`:count>=c.minimum?'Turma confirmada. Sua reserva está confirmada.':'Sua reserva está confirmada'}</p><h3>${c.name}</h3>${bar(c)}<p>${count} de ${c.seats} associados. ${vacancies(c.seats-count)}</p><p>Prazo para confirmar: <strong>${deadline()}</strong></p><p>Se a turma não atingir o mínimo até essa data, a reserva é cancelada e nada é cobrado</p><button class="button secondary" data-invite>Convidar colegas</button><p id="invite-status" role="status"></p><a class="button" href="simulador.html?c=${c.id}">Simular meu crédito</a>${storageNote()}`);
  }
  function requestCredit(step=0){
    const cr=simulation;
    if(step===0)showDialog('Revisar pedido',`<h3>${course.name}</h3><p>Instituição parceira</p><dl class="request-summary"><div><dt>Valor financiado</dt><dd>${money(cr.valor)}</dd></div><div><dt>Parcelas</dt><dd>${cr.n}x de ${money(cr.parcela)}</dd></div><div><dt>Total pago</dt><dd>${money(cr.n*cr.parcela)}</dd></div><div><dt>Juros</dt><dd>0,75% a.m.</dd></div></dl><p>Sem taxa para o associado</p><button class="button" data-credit-step="1">Continuar</button>`,'Passo 1 de 3');
    if(step===1)showDialog('Declarações',`<form id="credit-declarations"><label class="declaration"><input type="checkbox" required name="regulamento"> <span>Li o regulamento do crédito educacional</span></label><label class="declaration"><input type="checkbox" required name="analise"> <span>Autorizo a análise de crédito e a consulta à minha situação na Mútua</span></label><p>A parcela não pode passar de 30% da sua renda líquida familiar, como nos demais benefícios reembolsáveis.</p><p>Se trancar ou desistir, o repasse para no mês seguinte; você reembolsa só o que já foi pago à instituição, nas mesmas parcelas, sem multa da Mútua, e a vaga volta para a turma.</p><button class="button" type="submit" disabled>Enviar pedido</button><button class="button secondary" type="button" data-credit-step="0">Voltar à revisão</button></form>`,'Passo 2 de 3');
  }
  function sendCredit(){
    const cr=simulation;
    let hash=0;for(const char of `${course.id}:${cr.valor.toFixed(2)}`)hash=(hash*31+char.charCodeAt(0))%1000000;
    const protocolo=`EDU-2026-${String(hash).padStart(6,'0')}`;
    state={...(state.curso===course.id?state:{}),curso:course.id,credito:{...cr,protocolo,enviadoEm:new Date().toISOString()}};
    persist();updateAvatar();
    showDialog('Pedido enviado',`<p>Seu pedido foi registrado neste navegador.</p><p>Protocolo <strong>${protocolo}</strong></p><a class="button" href="meu-curso.html">Acompanhar em Meu curso</a>${storageNote()}`,'Passo 3 de 3');
  }

  const modalContent={
    profile:['Meu perfil','Eng. Conrado Pires · Associado. Aqui ficam seus dados, documentos e preferências de contato.'],
    classroom:['Sala virtual','Aula: Dimensionamento de pavimento flexível · quinta-feira, 19h. A sala é aberta pela instituição parceira no horário da aula.'],
    payment:['Boleto ou Pix','Parcela 8 de 24 · R$ 394,72 · vencimento 30/11/2026 · em dia. O boleto e o Pix aparecem aqui quando a parcela é emitida.'],
    support:['Apoio acadêmico','Suas dúvidas sobre o curso vão para a coordenação da instituição parceira, e a resposta chega aqui.']
  };
  document.addEventListener('click',event=>{
    const button=event.target.closest('[data-modal]');if(!button)return;
    opener=button;
    if(button.dataset.modal==='reserve')return eligibility();
    if(button.dataset.modal==='credit')return requestCredit();
    if(button.dataset.modal==='cancel')return showDialog('Cancelar reserva?', '<p>Ao confirmar, a reserva e o pedido de crédito salvos neste navegador serão apagados.</p><button class="button secondary" data-confirm-cancel>Confirmar cancelamento</button><button class="button modal-dismiss">Manter reserva</button>');
    const [title,text]=modalContent[button.dataset.modal];
    showDialog(title,`<p>${text}</p><button class="button modal-dismiss">Voltar à página</button>`);
  });
  modal.addEventListener('click',async event=>{
    const b=event.target.closest('button');if(!b)return;
    if(b.matches('.modal-close,.modal-dismiss'))return modal.close();
    if(b.hasAttribute('data-answer')){
      const step=Number(b.dataset.step);
      if(b.dataset.answer==='yes')return step===2?join():eligibility(step+1);
      const responses=[['O crédito educacional é para sócio contribuinte.','Seja mutualista','https://associe.mutua.com.br/'],['Regularize a anuidade e volte; a turma guarda sua vaga por 7 dias.','Regularizar anuidade','https://www.mutua.com.br/negociacao/'],['Este curso pede graduação na área. Veja outras turmas.','Ver outras turmas','cursos.html']];
      const [text,label,url]=responses[step];
      return showDialog('Como seguir',`<p>${text}</p><a class="button" href="${url}"${step<2?' target="_blank" rel="noopener"':''}>${label}</a><button class="button secondary" data-restart>Recomeçar</button>`,`Passo ${step+1} de 3`);
    }
    if(b.hasAttribute('data-restart'))return eligibility();
    if(b.hasAttribute('data-credit-step'))return requestCredit(Number(b.dataset.creditStep));
    if(b.hasAttribute('data-confirm-cancel')){
      state={};try{localStorage.removeItem(storageKey);}catch{storageAvailable=false;}
      modal.close();updateAvatar();dashboard();main.focus();return;
    }
    if(b.hasAttribute('data-invite')){
      const url=new URL(`curso.html?c=${course.id}`,location.href).href;
      try{await navigator.clipboard.writeText(url);document.querySelector('#invite-status').textContent='Link copiado';}
      catch{const status=document.querySelector('#invite-status');status.innerHTML='<label for="invite-link">Copie o link do curso</label><input id="invite-link" readonly>';const input=status.querySelector('input');input.value=url;input.focus();input.select();}
    }
  });
  modal.addEventListener('change',()=>{const form=modal.querySelector('#credit-declarations');if(form)form.querySelector('[type="submit"]').disabled=!form.checkValidity();});
  modal.addEventListener('submit',event=>{event.preventDefault();if(event.target.id==='credit-declarations' && event.target.checkValidity())sendCredit();});
  modal.addEventListener('close',()=>{if(opener?.isConnected)opener.focus();else if(page==='course')main.querySelector('.offer .button')?.focus();});
  modal.addEventListener('click',event=>{if(event.target!==modal)return;const rect=modal.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)modal.close();});
})();
