// ===== PIZZAMINATOR (crée ta pizza) =====
var PZM_BASE=10, PZM_MAX=6;
PZ['pizzaminator']={id:'pizzaminator',nom:'Pizzaminator',cat:'custom',px:PZM_BASE,desc:'Ta pizza, tes ingrédients.'};
CATN.custom='Création';
var PZM_GROUPS=[
 ['Fromages',[['m-chevre','Chèvre',1.5,'#F4F1E6'],['m-gorgo','Gorgonzola',1.5,'#DCE3C8'],['m-reblo','Reblochon',1.5,'#F2D79A'],['m-parm','Parmesan râpé',1.5,'#F6E7A8'],['m-dmozza','Mozzarella extra',2,'#FFFFFF'],['m-burrata','Burrata',3,'#FFFDF6']]],
 ['Viandes & poissons',[['m-jambon','Jambon',1.5,'#E9A3A3'],['m-jcru','Jambon cru',2,'#C2504F'],['m-lardons','Lardons',1.5,'#C97B5A'],['m-chorizo','Chorizo / Spianata',1.5,'#B3261E'],['m-copa','Copa',1.5,'#9E3B3B'],['m-kebab','Kebab (halal)',1.5,'#8A5A3B'],['m-poulet','Poulet',1.5,'#E8C48E'],['m-hache','Viande hachée',1.5,'#6B3E2E'],['m-figa','Figatelli',2,'#5C2A22'],['m-saumon','Saumon fumé',2,'#F08A5D'],['m-anchois','Anchois',1.5,'#7D6E63'],['m-oeuf','Œuf',1,'#FFC93C']]],
 ['Légumes',[['m-champi','Champignons',1,'#CBB59A'],['m-poiv','Poivrons',1,'#3E8E41'],['m-oignons','Oignons frits',0.5,'#D99A4E'],['m-olives','Olives',0.5,'#2A1A14'],['m-tsech','Tomates séchées',0.5,'#A3271F'],['m-arti','Artichaut',1.5,'#9DB36B'],['m-ptdt','Pommes de terre',1,'#EAD08A']]],
 ['Sauces & finitions',[['m-sblanche','Sauce blanche',0.5,null],['m-curry','Sauce curry',0.5,null],['m-miel','Sauce miel',0.5,null],['m-sburger','Sauce burger',0.5,null],['m-carti','Crème d’artichaut',0.5,null],['m-piment','Piment doux séché',0.5,'#D6452B'],['m-poivre','Poivre 5 baies',0.5,'#8B2F3C']]]
];
var PZM_COL={};
PZM_GROUPS.forEach(function(g){g[1].forEach(function(s){SP[s[0]]={id:s[0],nom:s[1],px:s[2],cats:['custom']};PZM_COL[s[0]]=s[3];});});
function pzmSvg(base,ing){
 var sauce=base==='crème'?'#F3E6C8':'#C9412E';
 var h='<svg viewBox="0 0 200 200" class="lso-pzm-svg" aria-hidden="true"><circle cx="100" cy="100" r="96" fill="#E2A75E" stroke="#2A1210" stroke-width="3"/><circle cx="100" cy="100" r="80" fill="'+sauce+'"/>';
 var seed=7;function rnd(){seed=(seed*9301+49297)%233280;return seed/233280;}
 for(var i=0;i<14;i++){var a=rnd()*6.283,r=Math.sqrt(rnd())*66;h+='<ellipse cx="'+(100+Math.cos(a)*r).toFixed(1)+'" cy="'+(100+Math.sin(a)*r).toFixed(1)+'" rx="9" ry="7" fill="#FFF8E7" opacity=".85"/>';}
 ing.forEach(function(id,k){
  var c=PZM_COL[id];seed=31*(k+3);
  if(!c){h+='<path d="M'+(48+k*6)+' '+(70+k*9)+' q26 -14 52 0 t52 0" fill="none" stroke="'+(id==='m-curry'?'#E0A526':id==='m-miel'?'#E8B22E':id==='m-sburger'?'#B5532B':id==='m-carti'?'#B9C48A':'#FFFFFF')+'" stroke-width="4" stroke-linecap="round" opacity=".9"/>';return;}
  for(var j=0;j<8;j++){var a=rnd()*6.283,r=10+Math.sqrt(rnd())*58,x=(100+Math.cos(a)*r).toFixed(1),y=(100+Math.sin(a)*r).toFixed(1);
   if(id==='m-poiv'||id==='m-oignons'||id==='m-jambon'||id==='m-jcru'||id==='m-saumon'||id==='m-copa'){h+='<rect x="'+x+'" y="'+y+'" width="13" height="6" rx="3" transform="rotate('+Math.round(rnd()*180)+' '+x+' '+y+')" fill="'+c+'" stroke="rgba(42,18,16,.35)" stroke-width=".8"/>';}
   else{h+='<circle cx="'+x+'" cy="'+y+'" r="'+(id==='m-olives'||id==='m-poivre'||id==='m-piment'?3.2:5.5)+'" fill="'+c+'" stroke="rgba(42,18,16,.35)" stroke-width=".8"/>';}
  }
 });
 return h+'</svg>';
}
function openPzm(){
 var sel={nom:'',base:'tomate',ing:[],sg:false,qty:1};
 var dlg=document.createElement('div');dlg.className='lso-modal';dlg.setAttribute('role','dialog');dlg.setAttribute('aria-modal','true');dlg.setAttribute('aria-label','Pizzaminator');
 function price(){var p=PZM_BASE;sel.ing.forEach(function(s){p+=SP[s].px;});if(sel.sg)p+=SG_PRIX;return p;}
 function draw(){
  var full=sel.ing.length>=PZM_MAX;
  var h='<div class="lso-sheet lso-pzm"><button type="button" class="lso-close" data-close aria-label="Fermer">×</button><span class="lso-tag">Création</span><h3>Pizza<i>minator</i></h3><p>Base + mozzarella : '+eur(PZM_BASE)+'. Ajoute jusqu’à '+PZM_MAX+' ingrédients.</p>';
  h+='<div class="lso-pzm-vis">'+pzmSvg(sel.base,sel.ing)+'<div class="lso-pzm-count"><b>'+sel.ing.length+'/'+PZM_MAX+'</b><span>ingrédients</span></div></div>';
  h+='<label class="lso-pzm-nom">Le nom de ta pizza (facultatif)<input id="lso-pzm-nom" maxlength="30" placeholder="La Kévinator 3000" value="'+esc(sel.nom)+'"></label>';
  h+='<h4>Ta base</h4><div class="lso-pzm-bases">'+[['tomate','Tomate'],['crème','Crème']].map(function(b){return '<button type="button" class="lso-sup'+(sel.base===b[0]?' on':'')+'" data-pzbase="'+b[0]+'" aria-pressed="'+(sel.base===b[0])+'"><span>Base '+b[1].toLowerCase()+' + mozzarella</span><b>inclus</b></button>';}).join('')+'</div>';
  PZM_GROUPS.forEach(function(g){
   h+='<h4>'+g[0]+'</h4><div class="lso-sups">'+g[1].map(function(s){var on=sel.ing.indexOf(s[0])>-1,dis=!on&&full;return '<button type="button" class="lso-sup'+(on?' on':'')+'" data-pzing="'+s[0]+'" aria-pressed="'+on+'"'+(dis?' disabled':'')+'><span>'+esc(s[1])+'</span><b>+'+eur(s[2])+'</b></button>';}).join('')+'</div>';
  });
  if(full)h+='<p class="lso-note lso-pzm-full">6 ingrédients, c’est le maximum : retire-en un pour en changer.</p>';
  h+='<h4>Pâte</h4>';
  if(sgAllowed())h+='<button type="button" class="lso-sup'+(sel.sg?' on':'')+'" data-pzsg aria-pressed="'+sel.sg+'"><span>Version sans gluten<small style="display:block;font-weight:400;font-size:12px;opacity:.7">format un peu plus petit, même prix</small></span><b>'+(SG_PRIX?'+'+eur(SG_PRIX):'')+'</b></button>';
  else h+='<p class="lso-note">Sans gluten : à commander avant 19h le jour même.</p>';
  h+='<div class="lso-add"><div class="lso-step"><button type="button" data-pzq="-1" aria-label="Moins">−</button><span>'+sel.qty+'</span><button type="button" data-pzq="1" aria-label="Plus">+</button></div><button type="button" class="lso-btn main" data-pzadd'+(sel.ing.length?'':' disabled')+'>'+(sel.ing.length?'Ajouter · '+eur(price()*sel.qty):'Choisis au moins 1 ingrédient')+'</button></div></div>';
  var st=dlg.querySelector('.lso-sheet');var y=st?st.scrollTop:0;
  dlg.innerHTML=h;
  var st2=dlg.querySelector('.lso-sheet');if(st2)st2.scrollTop=y;
 }
 draw();document.body.appendChild(dlg);document.documentElement.classList.add('lso-lock');
 function close(){dlg.remove();document.documentElement.classList.remove('lso-lock');}
 dlg.addEventListener('input',function(e){if(e.target.id==='lso-pzm-nom')sel.nom=e.target.value;});
 dlg.addEventListener('click',function(e){
  var b;
  if(e.target===dlg||e.target.closest('[data-close]')){close();return;}
  if((b=e.target.closest('[data-pzbase]'))){sel.base=b.getAttribute('data-pzbase');draw();return;}
  if((b=e.target.closest('[data-pzing]'))){if(b.disabled)return;var k=b.getAttribute('data-pzing'),i=sel.ing.indexOf(k);if(i>-1)sel.ing.splice(i,1);else if(sel.ing.length<PZM_MAX)sel.ing.push(k);draw();return;}
  if(e.target.closest('[data-pzsg]')){sel.sg=!sel.sg;draw();return;}
  if((b=e.target.closest('[data-pzq]'))){sel.qty=Math.max(1,sel.qty+parseInt(b.getAttribute('data-pzq'),10));draw();return;}
  if((b=e.target.closest('[data-pzadd]'))){if(!sel.ing.length)return;S.cart.push({key:'pzm|'+Date.now(),id:'pizzaminator',nom:(sel.nom||'').trim().slice(0,30),base:sel.base,sup:sel.ing.slice(),sg:sel.sg,qty:sel.qty});close();render();return;}
 });
 document.addEventListener('keydown',function k(e){if(e.key==='Escape'){close();document.removeEventListener('keydown',k);}});
}
function pzmLabel(l){if(l.id!=='pizzaminator')return PZ[l.id].nom;return 'Pizzaminator'+(l.nom?' « '+l.nom+' »':'');}
