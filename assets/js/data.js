'use strict';
window.EDUCA = {
  rate: 0.0075,
  courses: [
    {id:'pavimentos',name:'Engenharia de Pavimentos',type:'Pós-graduação',months:18,hours:420,mode:'EAD com aulas ao vivo',before:686,price:480,enrolled:18,seats:25,image:'curso-pavimentos.jpg',modules:['Fundamentos de infraestrutura viária','Materiais e ensaios de pavimentação','Dimensionamento de pavimento flexível','Pavimentos rígidos e soluções especiais','Manutenção e avaliação de pavimentos','Projeto aplicado de pavimentação']},
    {id:'obras',name:'Gestão de Obras de Infraestrutura',type:'Pós-graduação',months:24,hours:480,mode:'Híbrido',before:850,price:595,enrolled:21,seats:25,image:'curso-obras.jpg',modules:['Planejamento de obras de infraestrutura','Orçamento e gestão de custos','Gestão de contratos','Qualidade e produtividade no canteiro','Gestão de riscos e cronogramas','Projeto integrado de gestão de obras']},
    {id:'geotecnia',name:'Geotecnia Aplicada',type:'Pós-graduação',months:18,hours:390,mode:'Presencial',before:740,price:518,enrolled:14,seats:20,image:'curso-geotecnia.jpg',modules:['Mecânica dos solos','Investigação geotécnica','Fundações e contenções','Estabilidade de taludes','Obras de terra e monitoramento','Projeto geotécnico aplicado']},
    {id:'bim',name:'BIM para Infraestrutura',type:'Especialização',months:12,hours:360,mode:'EAD',before:620,price:434,enrolled:19,seats:20,image:'curso-bim.jpg',modules:['Fundamentos e processos BIM','Modelagem de infraestrutura','Coordenação e compatibilização','Planejamento e orçamento com BIM','Gestão da informação','Projeto integrado em BIM']},
    {id:'transportes',name:'Mestrado Profissional em Transportes',type:'Mestrado',months:24,hours:720,mode:'Híbrido',before:1150,price:805,enrolled:12,seats:15,image:'curso-transportes.jpg',modules:['Métodos de pesquisa em transportes','Planejamento e mobilidade','Modelagem de sistemas de transporte','Logística e operação de redes','Análise de dados aplicada','Pesquisa e projeto de conclusão']},
    {id:'seguranca',name:'Engenharia de Segurança do Trabalho',type:'Especialização',months:18,hours:450,mode:'EAD',before:580,price:406,enrolled:23,seats:25,image:'curso-seguranca.jpg',modules:['Fundamentos de segurança do trabalho','Identificação e análise de riscos','Higiene ocupacional','Prevenção e proteção em obras','Gestão de segurança e ergonomia','Projeto de prevenção aplicado']}
  ]
};

// Shared operating assumptions for the two partner views.
(() => {
  const data=window.EDUCA;
  data.institution='Centro Universitário do Planalto';
  data.escape=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  data.courses.forEach(c=>{
    c.institution=['pavimentos','geotecnia'].includes(c.id)?data.institution:'Instituto de Estudos em Engenharia';
    c.fee=3;
    c.minimum=c.seats;
    c.deadline='2026-12-07';
    c.starts='2027-02-01';
  });
  data.partnerKey='educaMais.instituicao.v1';
  data.validPublication=c=>c && typeof c.id==='string' && /^local-[a-z0-9-]+$/.test(c.id) && typeof c.name==='string' && c.name.trim().length>0 && c.name.length<=120 && ['Pós-graduação','Especialização','Mestrado profissional'].includes(c.type) && Number.isInteger(c.seats) && c.seats>=1 && c.seats<=1000 && Number.isInteger(c.minimum) && c.minimum>=1 && c.minimum<=c.seats && Number.isInteger(c.months) && c.months>=1 && c.months<=60 && Number.isFinite(c.before) && c.before>=1 && c.before<=100000 && Number.isFinite(c.discount) && c.discount>=15 && c.discount<=90 && Number.isFinite(c.fee) && c.fee>=1 && c.fee<=3 && Number.isFinite(Date.parse(c.deadline)) && Number.isFinite(Date.parse(c.starts));
  data.readPublications=()=>{
    try{
      const saved=JSON.parse(localStorage.getItem(data.partnerKey)||'[]');
      return {courses:Array.isArray(saved)?saved.filter(data.validPublication).slice(0,100).map(c=>({...c,institution:data.institution,enrolled:0,price:Math.round(c.before*(1-c.discount/100)*100)/100,image:'curso-obras.jpg',hours:360,mode:'Aulas ao vivo'})):[],available:true};
    }catch{return {courses:[],available:false};}
  };
  data.operatingCourses=()=>{
    let saved={};
    try{saved=JSON.parse(localStorage.getItem('educaMais.v1')||'{}')||{};}catch{ /* Base counts remain available when storage is blocked. */ }
    return data.courses.map(c=>({...c,enrolled:Math.min(c.seats,c.enrolled+(saved.curso===c.id && typeof saved.entrouEm==='string' && Number.isFinite(Date.parse(saved.entrouEm))?1:0))}));
  };
})();
