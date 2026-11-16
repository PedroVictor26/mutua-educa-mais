'use strict';
(() => {
  const data=window.EDUCA,{money,icon,card,observeMotion}=data.ui,esc=data.escape;
  const stored=data.readPublications();
  let published=stored.courses;
  const base=data.operatingCourses().filter(c=>c.institution===data.institution);
  const main=document.querySelector('#main');
  const field=(name,label,type,value,limits='')=>`<div class="form-field"><label for="${name}">${label}</label><input id="${name}" name="${name}" type="${type}" value="${value}" required ${limits} aria-describedby="${name}-error"><p class="field-error" id="${name}-error"></p></div>`;
  main.innerHTML=`<section class="portal-heading"><div><p class="eyebrow">${data.institution} · Coordenação de Pós-graduação</p><h1>Portal da instituição parceira</h1><p>Vagas ociosas, turmas de associados e repasses no mesmo lugar.</p></div><span class="line-icon">${icon('school')}</span></section>
  <section id="resumo" class="portal-section"><h2>Resumo das suas turmas</h2><div id="institution-metrics" class="metrics"></div></section>
  <section id="publicar" class="portal-section"><div class="section-heading"><div><p class="eyebrow">Vagas que já existem</p><h2>Publicar turma com vagas ociosas</h2></div><p>O desconto é aplicado quando a turma atinge o mínimo de associados.</p></div><div class="publish-layout"><form id="publish-form" class="panel" novalidate><div class="form-grid">
  ${field('name','Curso','text','', 'maxlength="120" autocomplete="off"')}
  <div class="form-field"><label for="type">Tipo</label><select id="type" name="type"><option>Pós-graduação</option><option>Especialização</option><option>Mestrado profissional</option></select></div>
  ${field('seats','Vagas ociosas','number','20','min="1" max="1000" step="1"')}
  ${field('minimum','Mínimo para fechar','number','15','min="1" max="1000" step="1"')}
  ${field('months','Meses','number','18','min="1" max="60" step="1"')}
  ${field('before','Mensalidade de tabela (R$)','number','800','min="1" max="100000" step="0.01"')}
  ${field('discount','Desconto para turma Mútua (%)','number','30','min="15" max="90" step="0.5"')}
  ${field('fee','Taxa à Mútua (%)','number','3','min="1" max="3" step="0.5"')}
  </div><p class="source-note">Prazo para fechar: 21 dias após a publicação. Início das aulas: mês seguinte ao prazo, sujeito ao fechamento.</p><p id="storage-status" role="status">${stored.available?'Os dados ficam salvos somente neste navegador.':'O navegador não permitiu ler as turmas salvas. Permita o armazenamento local para publicar.'}</p><button class="button" type="submit">Publicar turma</button><p id="form-status" role="status"></p></form>
  <aside class="preview-column"><p class="eyebrow">Como o associado vai ver</p><div id="course-preview"></div><div class="panel institution-account" aria-live="polite" aria-atomic="true"><h3>A conta da instituição</h3><dl id="publication-account"></dl><p>Receita de vagas que ficariam vazias, antes dos custos da instituição.</p></div></aside></div></section>
  <section id="turmas" class="portal-section"><div class="section-heading"><h2>Suas turmas</h2><span id="class-count" class="badge"></span></div><div id="institution-classes"></div></section>
  <section id="repasses" class="portal-section"><div class="section-heading"><div><p class="eyebrow">Previsão de recebimento</p><h2>Repasses da Mútua</h2></div><p>A Mútua paga por mensalidade, a partir do início das aulas.</p></div><p class="source-note">Turmas em formação entram na previsão se atingirem o mínimo. Valores líquidos da taxa à Mútua, com base nos inscritos atuais.</p><div id="transfers" class="transfer-grid"></div></section>`;
  const form=document.querySelector('#publish-form');
  const touched=new Set();
  function values(){const v=Object.fromEntries(new FormData(form));for(const key of ['seats','minimum','months','before','discount','fee'])v[key]=Number(v[key]);v.name=v.name.trim();return v;}
  function validate(all=false){
    const errors={};
    for(const input of form.querySelectorAll('input')){
      const key=input.name;
      if(!input.value.trim())errors[key]='Preencha este campo para publicar a turma.';
      else if(key==='name'&&!input.value.trim())errors[key]='Informe o nome do curso.';
      else if(input.validity.rangeUnderflow||input.validity.rangeOverflow)errors[key]=`Informe um valor entre ${input.min} e ${input.max}.`;
      else if(input.validity.stepMismatch||input.validity.badInput)errors[key]=input.step==='1'?'Informe um número inteiro.':`Use intervalos de ${input.step.replace('.',',')}.`;
    }
    const v=values();
    if(!v.name)errors.name='Informe o nome do curso.';
    if(v.minimum>v.seats)errors.minimum='O mínimo para fechar não pode ser maior que as vagas ociosas. Reduza o mínimo ou aumente as vagas.';
    if(form.elements.discount.value && v.discount<15)errors.discount='Com desconto abaixo de 15%, os juros do crédito comem a vantagem do associado';
    for(const input of form.querySelectorAll('input')){
      const error=(all||touched.has(input.name))?errors[input.name]||'':'';
      input.setAttribute('aria-invalid',String(!!error));document.getElementById(`${input.name}-error`).textContent=error;
    }
    return errors;
  }
  function dates(){const deadline=new Date();deadline.setDate(deadline.getDate()+21);const starts=new Date(deadline.getFullYear(),deadline.getMonth()+1,1);const iso=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;return {deadline:iso(deadline),starts:iso(starts)};}
  function candidate(){const v=values();return {...v,...dates(),id:'local-preview',institution:data.institution,enrolled:0,price:Math.round(v.before*(1-v.discount/100)*100)/100,image:'curso-obras.jpg',hours:360,mode:'Aulas ao vivo'};}
  function preview(){
    const c=candidate(),valid=Object.keys(validate()).length===0;
    if(!valid){
      document.querySelector('#course-preview').innerHTML='<div class="panel preview-empty"><span class="line-icon">'+icon('school')+'</span><h3>Sua turma, vista pelo associado</h3><p>Preencha os campos para ver o card e conferir a receita da turma.</p></div>';
      document.querySelector('#publication-account').innerHTML='<div><dt>Receita, taxa e valor líquido</dt><dd>Aguardando campos válidos</dd></div>';return;
    }
    document.querySelector('#course-preview').innerHTML=card(c);
    // Preview uses the real course card, without a link to an unpublished course.
    const link=document.querySelector('#course-preview .button');link.replaceWith(Object.assign(document.createElement('span'),{className:'preview-label',textContent:`Fecha com ${c.minimum} associados`}));
    const revenue=c.seats*c.price*c.months,fee=revenue*c.fee/100;
    document.querySelector('#publication-account').innerHTML=`<div><dt>Receita da turma cheia</dt><dd>${money(revenue)}</dd></div><div><dt>Taxa à Mútua (${c.fee}%)</dt><dd>${money(fee)}</dd></div><div><dt>Receita de vagas que ficariam vazias</dt><dd>${money(revenue-fee)}</dd></div>`;
  }
  function render(){
    const courses=[...base,...published],sum=fn=>courses.reduce((n,c)=>n+fn(c),0);
    const metrics=[['Vagas ociosas publicadas',sum(c=>c.seats)],['Associados em turma',sum(c=>c.enrolled)],['Receita prevista das turmas',money(sum(c=>c.enrolled*c.price*c.months))],['Taxa à Mútua prevista',money(sum(c=>c.enrolled*c.price*c.months*c.fee/100))]];
    document.querySelector('#institution-metrics').innerHTML=metrics.map(([label,value])=>`<article class="metric"><p>${label}</p><strong>${value}</strong></article>`).join('');
    document.querySelector('#class-count').textContent=`${courses.length} turmas`;
    const date=value=>new Date(value+'T12:00:00').toLocaleDateString('pt-BR');
    document.querySelector('#institution-classes').innerHTML=`<div class="table-scroll" tabindex="0" role="region" aria-label="Suas turmas, tabela com rolagem"><table class="portal-table"><caption>Inscrições e receita prevista por turma</caption><thead><tr><th scope="col">Curso / status</th><th scope="col" class="numeric">Inscritos / vagas</th><th scope="col">Prazo para fechar</th><th scope="col" class="numeric">Receita prevista</th><th scope="col" class="numeric">Taxa à Mútua</th><th scope="col">Ação</th></tr></thead><tbody>${courses.map(c=>`<tr><th scope="row">${esc(c.name)}<small>${esc(c.type)}</small><span class="status-pill">${c.enrolled>=c.minimum?'Fechada':'Em formação'}</span></th><td class="numeric occupancy"><strong>${c.enrolled} / ${c.seats}</strong><div class="track" role="progressbar" aria-label="Ocupação de ${esc(c.name)}" aria-valuenow="${c.enrolled}" aria-valuemin="0" aria-valuemax="${c.seats}"><span style="width:${c.enrolled/c.seats*100}%"></span></div><small>Mínimo: ${c.minimum}</small></td><td>${date(c.deadline)}</td><td class="numeric">${money(c.enrolled*c.price*c.months)}</td><td class="numeric">${money(c.enrolled*c.price*c.months*c.fee/100)}</td><td>${c.id.startsWith('local-')?`<button class="button secondary remove-course" data-remove="${esc(c.id)}" aria-label="Remover turma ${esc(c.name)}">Remover</button>`:'<span class="source-note">Turma parceira</span>'}</td></tr>`).join('')}</tbody></table></div>`;
    const firstStart=new Date(Math.max(new Date(new Date().getFullYear(),new Date().getMonth(),1).getTime(),Math.min(...courses.map(c=>new Date(c.starts+'T12:00:00').getTime()))));
    document.querySelector('#transfers').innerHTML=Array.from({length:3},(_,i)=>{
      const month=new Date(firstStart.getFullYear(),firstStart.getMonth()+i,1);
      const active=courses.filter(c=>{const start=new Date(c.starts+'T12:00:00'),delta=(month.getFullYear()-start.getFullYear())*12+month.getMonth()-start.getMonth();return delta>=0&&delta<c.months;});
      const gross=active.reduce((n,c)=>n+c.enrolled*c.price,0),fee=active.reduce((n,c)=>n+c.enrolled*c.price*c.fee/100,0);
      return `<article class="panel transfer-card"><span class="line-icon">${icon('account_balance')}</span><h3>${month.toLocaleDateString('pt-BR',{month:'long',year:'numeric'})}</h3><strong>${money(gross-fee)}</strong><p>Repasse líquido previsto</p><small>Mensalidades: ${money(gross)}<br>Taxa à Mútua: ${money(fee)}</small></article>`;
    }).join('');
    observeMotion();
  }
  function persist(next){try{localStorage.setItem(data.partnerKey,JSON.stringify(next));published=next;return true;}catch{document.querySelector('#storage-status').textContent='Não foi possível salvar a turma. Permita o armazenamento local neste navegador e tente novamente.';return false;}}
  form.addEventListener('input',event=>{touched.add(event.target.name);preview();});
  form.addEventListener('focusout',event=>{if(event.target.name){touched.add(event.target.name);validate();}});
  form.addEventListener('submit',event=>{
    event.preventDefault();const errors=validate(true);
    if(Object.keys(errors).length){document.querySelector('#form-status').textContent='Revise os campos indicados antes de publicar.';form.elements[Object.keys(errors)[0]].focus();return;}
    if(published.length>=100){document.querySelector('#form-status').textContent='Você atingiu 100 turmas publicadas neste navegador. Remova uma turma para publicar outra.';return;}
    const c={...candidate(),id:`local-${crypto.randomUUID()}`};
    if(!persist([...published,c]))return;
    render();document.querySelector('#form-status').textContent='Turma publicada. Veja a inscrição em Suas turmas.';
    const modal=document.querySelector('#modal');modal.innerHTML=`<button class="modal-close icon-button" aria-label="Fechar modal">×</button><span class="line-icon">${icon('check')}</span><h2 id="modal-title" tabindex="-1">Turma publicada</h2><p>${esc(c.name)} já aparece em Suas turmas com status Em formação. Os dados foram salvos neste navegador.</p><button class="button modal-dismiss">Continuar</button>`;modal.showModal();modal.querySelector('h2').focus();
  });
  document.querySelector('#modal').addEventListener('close',()=>form.querySelector('[type="submit"]').focus());
  document.querySelector('#institution-classes').addEventListener('click',event=>{
    const button=event.target.closest('[data-remove]');if(!button)return;
    if(persist(published.filter(c=>c.id!==button.dataset.remove))){render();document.querySelector('#class-count').setAttribute('tabindex','-1');document.querySelector('#class-count').focus();document.querySelector('#storage-status').textContent='Turma removida deste navegador.';}
  });
  preview();render();
})();
