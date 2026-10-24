document.documentElement.classList.add('js');
const menu=document.querySelector('.menu');
const navigation=document.querySelector('#navigation');
function closeMenu(){menu.setAttribute('aria-expanded','false');navigation.classList.remove('open');}
menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));navigation.classList.toggle('open',open);});
navigation.querySelectorAll('a').forEach(link=>link.addEventListener('click',closeMenu));
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&menu.getAttribute('aria-expanded')==='true'){closeMenu();menu.focus();}});
const filterButtons=document.querySelectorAll('[data-filter]');
filterButtons.forEach(button=>button.addEventListener('click',()=>{const filter=button.dataset.filter;filterButtons.forEach(item=>{const active=item===button;item.classList.toggle('selected',active);item.setAttribute('aria-pressed',String(active));});let count=0;document.querySelectorAll('[data-category]').forEach(project=>{project.hidden=filter!=='all'&&project.dataset.category!==filter;if(!project.hidden)count++;});document.querySelector('#filter-status').textContent=`Showing ${count} ${count===1?'project':'projects'}.`;}));
document.querySelector('#copy-email').addEventListener('click',async()=>{const status=document.querySelector('#copy-status');try{await navigator.clipboard.writeText('ssybz5@nottingham.edu.cn');status.textContent='Email address copied.';}catch{status.textContent='Please select and copy the email address above, or click it to open your email app.';}});
