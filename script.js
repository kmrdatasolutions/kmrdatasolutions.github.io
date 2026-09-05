const C = SITE_CONFIG;
document.querySelectorAll(".year").forEach(e=>e.textContent=new Date().getFullYear());

function serviceCard(s){return `<article class="service"><div class="icon">${s.icon}</div><h3>${s.title}</h3><p>${s.text}</p></article>`}
function projectCard(p,i){return `<article class="project"><span class="num">PROJECT 0${i+1}</span><h3>${p.name}</h3><p>${p.text||p.description||"Analytics project and practical business insights."}</p><div class="tags">${(p.tags||["Data Analytics"]).map(t=>`<span class="tag">${t}</span>`).join("")}</div><a href="${p.url||"#"}" target="_blank" rel="noopener">View on GitHub →</a></article>`}

const sg=document.getElementById("servicesGrid"); if(sg) sg.innerHTML=C.services.map(serviceCard).join("");
const hsg=document.getElementById("homeServices"); if(hsg) hsg.innerHTML=C.services.slice(0,4).map(serviceCard).join("");
const pg=document.getElementById("projectsGrid"); if(pg) pg.innerHTML=C.projects.slice(0,6).map(projectCard).join("");
const hpg=document.getElementById("homeProjects"); if(hpg) hpg.innerHTML=C.projects.slice(0,3).map(projectCard).join("");

const sk=document.getElementById("skillsGrid"); if(sk) sk.innerHTML=C.skills.map(s=>`<div class="skill"><b>${s[0]}</b>${s[1]}</div>`).join("");
const pr=document.getElementById("processGrid"); if(pr) pr.innerHTML=C.process.map(s=>`<article class="step"><b>${s[0]}</b><h3>${s[1]}</h3><p>${s[2]}</p></article>`).join("");

const eb=document.getElementById("emailBtn"); if(eb) eb.href=`mailto:${C.email}`;
const wb=document.getElementById("whatsappBtn"); if(wb) wb.href=`https://wa.me/${C.whatsapp}`;

async function githubProjects(){
  const target=document.getElementById("projectsGrid");
  if(!target || !C.githubUsername || C.githubUsername==="your-github-username") return;
  try{
    const r=await fetch(`https://api.github.com/users/${C.githubUsername}/repos?sort=updated&per_page=6`);
    if(!r.ok) return;
    const repos=await r.json();
    const live=repos.filter(x=>!x.fork).map(x=>({name:x.name.replace(/[-_]/g," "),text:x.description||"GitHub analytics project.",tags:x.language?[x.language,"GitHub"]:["GitHub","Project"],url:x.html_url}));
    if(live.length) target.innerHTML=live.map(projectCard).join("");
  }catch(e){}
}
githubProjects();

const menu=document.querySelector(".menu-btn"), links=document.querySelector(".nav-links");
if(menu) menu.addEventListener("click",()=>links.classList.toggle("open"));
document.querySelectorAll(".nav-links a").forEach(a=>a.addEventListener("click",()=>links.classList.remove("open")));
