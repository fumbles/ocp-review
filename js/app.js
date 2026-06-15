// ─── THEME ───────────────────────────────────────────────────────────────────
function toggleTheme(){
  const html=document.documentElement;
  const dark=html.getAttribute('data-theme')==='dark';
  html.setAttribute('data-theme',dark?'light':'dark');
  document.querySelector('.theme-toggle').textContent=dark?'🌙 Dark':'☀️ Light';
}

// ─── NAVIGATION ──────────────────────────────────────────────────────────────
function showPage(id){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(l=>l.classList.remove('active'));
  document.getElementById('page-'+id).classList.add('active');
  const idx=['home','learn','flashcards','walkthroughs','glossary'].indexOf(id);
  document.querySelectorAll('.nav-link')[idx].classList.add('active');
  document.getElementById('progress').style.width=((idx/3)*100)+'%';
  window.scrollTo(0,0);
  if(id==='learn' && !learnInit) initLearn();
  if(id==='flashcards' && !fcInit) initFlashcards();
  if(id==='walkthroughs' && !wtInit) initWalkthroughs();
  if(id==='glossary' && !glossaryInit) initGlossary();
}


// ─── LEARN INIT ──────────────────────────────────────────────────────────────
let learnInit=false, currentTopic=0;
function initLearn(){
  learnInit=true;
  renderTopicList(topics);
  showTopic(0);
}
function renderTopicList(list){
  const el=document.getElementById('topic-list');
  el.innerHTML=list.map((t,i)=>`
    <div class="topic-item ${i===0?'active':''}" onclick="showTopic(${topics.indexOf(t)})" data-id="${t.id}">
      <div class="dot"></div>${t.label}
    </div>`).join('');
}
function showTopic(idx){
  currentTopic=idx;
  document.querySelectorAll('.topic-item').forEach(el=>{
    el.classList.toggle('active', el.dataset.id===topics[idx].id);
  });
  document.getElementById('topic-content').innerHTML=topics[idx].content;
}
function filterTopics(val){
  const filtered=topics.filter(t=>t.label.toLowerCase().includes(val.toLowerCase()));
  renderTopicList(filtered);
  if(filtered.length) showTopic(topics.indexOf(filtered[0]));
}


// ─── FLASHCARD LOGIC (Multiple Choice) ────────────────────────────────────────
let fcInit=false, filteredCards=[], fcIndex=0, fcCorrectCount=0, fcWrongCount=0;
const LETTERS=['A','B','C','D'];

function initFlashcards(){
  fcInit=true;
  filteredCards=[...allCards];
  renderCard();
}
function setFilter(tag,btn){
  document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  filteredCards=tag==='all'?[...allCards]:allCards.filter(c=>c.tag===tag);
  fcIndex=0; fcCorrectCount=0; fcWrongCount=0;
  updateScoreboard();
  renderCard();
}
function updateScoreboard(){
  document.getElementById('fc-correct').textContent=fcCorrectCount;
  document.getElementById('fc-wrong').textContent=fcWrongCount;
}
function renderCard(){
  const card=filteredCards[fcIndex];
  document.getElementById('mc-q-label').textContent=`Question ${fcIndex+1}`;
  document.getElementById('mc-q-text').innerHTML=card.q;
  const tagNames={core:'K8s Core',ocp:'OpenShift',networking:'Networking',storage:'Storage',ha:'HA & Reliability',cli:'CLI'};
  document.getElementById('mc-q-tag').textContent=tagNames[card.tag]||card.tag;
  document.getElementById('fc-idx').textContent=fcIndex+1;
  document.getElementById('fc-total').textContent=filteredCards.length;
  document.getElementById('fc-progress-fill').style.width=((fcIndex+1)/filteredCards.length*100)+'%';
  // Render options
  const opts=document.getElementById('mc-options');
  opts.innerHTML=card.opts.map((o,i)=>`
    <button class="mc-opt" onclick="selectOption(${i})" id="opt-${i}">
      <span class="opt-letter">${LETTERS[i]}</span>
      <span class="opt-text">${o}</span>
      <span class="mc-opt-icon" id="opt-icon-${i}"></span>
    </button>`).join('');
  // Hide result
  const res=document.getElementById('mc-result');
  res.classList.remove('show');
  document.getElementById('mc-next-btn').disabled=true;
}
function selectOption(chosen){
  const card=filteredCards[fcIndex];
  // Disable all options
  document.querySelectorAll('.mc-opt').forEach(el=>el.classList.add('disabled'));
  document.querySelectorAll('.mc-opt').forEach(el=>el.onclick=null);
  const isCorrect=chosen===card.correct;
  if(isCorrect){fcCorrectCount++;} else {fcWrongCount++;}
  updateScoreboard();
  // Style chosen option
  const chosenEl=document.getElementById(`opt-${chosen}`);
  chosenEl.classList.add(isCorrect?'correct':'wrong');
  document.getElementById(`opt-icon-${chosen}`).textContent=isCorrect?'✓':'✗';
  // If wrong, highlight the correct answer
  if(!isCorrect){
    const correctEl=document.getElementById(`opt-${card.correct}`);
    correctEl.classList.add('reveal');
    document.getElementById(`opt-icon-${card.correct}`).textContent='✓';
  }
  // Show result panel
  const res=document.getElementById('mc-result');
  res.classList.add('show');
  const verdict=document.getElementById('mc-verdict');
  verdict.className='mc-result-verdict '+(isCorrect?'correct':'wrong');
  verdict.innerHTML=isCorrect
    ?`✓ Correct · ${card.opts[card.correct]}`
    :`✗ Incorrect · The correct answer is: ${card.opts[card.correct]}`;
  document.getElementById('mc-explanation').innerHTML=card.explanation;
  const docLink=document.getElementById('mc-doc-link');
  docLink.href=card.doc;
  docLink.textContent=`📖 ${card.docLabel} ↗`;
  document.getElementById('mc-spaced').textContent=`Next review: 1 day`;
  document.getElementById('mc-next-btn').disabled=false;
}
function nextCard(){
  fcIndex=(fcIndex+1)%filteredCards.length;
  if(fcIndex===0){fcCorrectCount=0;fcWrongCount=0;updateScoreboard();}
  renderCard();
}
function shuffleCards(){
  for(let i=filteredCards.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [filteredCards[i],filteredCards[j]]=[filteredCards[j],filteredCards[i]];
  }
  fcIndex=0; fcCorrectCount=0; fcWrongCount=0;
  updateScoreboard(); renderCard();
}

// ═══════════════════════════════════════════════════════════════════════════════

// ─── WALKTHROUGH LOGIC ───────────────────────────────────────────────────────
let wtInit=false;
function initWalkthroughs(){
  wtInit=true;
  const grid=document.getElementById('wt-grid');
  grid.innerHTML=walkthroughs.map(w=>`
    <div class="wt-card" onclick="showWalkthrough('${w.id}')">
      <div class="badge">Walkthrough</div>
      <h4>${w.title}</h4>
      <p>${w.desc}</p>
      <div class="steps-count">${w.steps.length} steps</div>
    </div>`).join('');
}
function showWalkthrough(id){
  const w=walkthroughs.find(x=>x.id===id);
  document.getElementById('wt-list').style.display='none';
  document.getElementById('wt-detail').classList.add('active');
  document.getElementById('wt-content').innerHTML=`
    <h3 style="font-size:1.5rem;margin-bottom:.5rem">${w.title}</h3>
    <p style="color:var(--text2);margin-bottom:1.75rem">${w.desc}</p>
    <div class="wt-steps">
      ${w.steps.map((s,i)=>`
        <div class="wt-step">
          <div class="step-num">${i+1}</div>
          <div class="step-body">
            <h4>${s.h}</h4>
            <p>${s.b}</p>
            <pre>${s.cmd}</pre>
          </div>
        </div>`).join('')}
    </div>`;
}
function showWtList(){
  document.getElementById('wt-list').style.display='block';
  document.getElementById('wt-detail').classList.remove('active');
}

// ═══════════════════════════════════════════════════════════════════════════════

// ─── GLOSSARY LOGIC ──────────────────────────────────────────────────────────
let glossaryInit=false;
const GL_CATS={
  all:'All',core:'K8s Core',ocp:'OpenShift',operators:'Operators & OLM',
  networking:'Networking',storage:'Storage',security:'Security',
  monitoring:'Monitoring',builds:'Builds & CI/CD',advanced:'Advanced / Platform',acronym:'Acronyms'
};

function initGlossary(){
  glossaryInit=true;
  // Render filter pills
  const filters=document.getElementById('glossary-filters');
  filters.innerHTML=Object.entries(GL_CATS).map(([k,v])=>
    `<button class="gl-filter ${k==='all'?'active':''}" onclick="setGlFilter('${k}',this)">${v}</button>`
  ).join('');
  renderGlossary(glossaryTerms);
}

let glActiveFilter='all', glSearchVal='';

function setGlFilter(cat,btn){
  document.querySelectorAll('.gl-filter').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  glActiveFilter=cat;
  applyGlossaryFilters();
}
function filterGlossary(val){
  glSearchVal=val.toLowerCase();
  applyGlossaryFilters();
}
function applyGlossaryFilters(){
  let filtered=glossaryTerms;
  if(glActiveFilter!=='all') filtered=filtered.filter(t=>t.cat===glActiveFilter);
  if(glSearchVal) filtered=filtered.filter(t=>
    t.term.toLowerCase().includes(glSearchVal)||
    (t.abbr&&t.abbr.toLowerCase().includes(glSearchVal))||
    t.def.toLowerCase().includes(glSearchVal)
  );
  renderGlossary(filtered);
}
const ALL_LETTERS='ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
function renderGlossary(terms){
  document.getElementById('gl-count').textContent=`${terms.length} terms`;
  const grid=document.getElementById('glossary-grid');
  if(!terms.length){
    grid.innerHTML='<p style="color:var(--text3);padding:2rem;text-align:center">No terms match your search.</p>';
    updateGlSidebar(new Set());
    return;
  }
  // Group by first letter
  const byLetter={};
  [...terms].sort((a,b)=>a.term.localeCompare(b.term)).forEach(t=>{
    const l=t.term[0].toUpperCase();
    (byLetter[l]=byLetter[l]||[]).push(t);
  });
  grid.innerHTML=Object.keys(byLetter).sort().map(letter=>`
    <div class="gl-letter-group" id="gl-letter-${letter}">
      <div class="gl-letter">${letter}</div>
      ${byLetter[letter].map(t=>`
        <div class="gl-entry" onclick="toggleGlEntry(this)">
          <div class="gl-entry-header">
            <span class="gl-term">${t.term}</span>
            ${t.abbr?`<span class="gl-abbr">${t.term===t.abbr?'':t.abbr}</span>`:''}
            <span class="gl-cat-badge">${GL_CATS[t.cat]||t.cat}</span>
          </div>
          <div class="gl-def">
            ${t.def}
            ${t.doc?`<br><a class="gl-doc" href="${t.doc}" target="_blank" rel="noopener">📖 View documentation ↗</a>`:''}
          </div>
        </div>`).join('')}
    </div>`).join('');
  updateGlSidebar(new Set(Object.keys(byLetter)));
}
function updateGlSidebar(activeLetters){
  const sidebar=document.getElementById('gl-sidebar');
  sidebar.innerHTML=ALL_LETTERS.map(l=>`
    <a class="gl-letter-link ${activeLetters.has(l)?'has-terms':'inactive'}"
       href="#gl-letter-${l}"
       onclick="jumpToLetter(event,'${l}')"
       title="${l}">${l}</a>`
  ).join('');
}
function jumpToLetter(e,letter){
  e.preventDefault();
  const el=document.getElementById('gl-letter-'+letter);
  if(!el) return;
  // Offset for sticky header (~140px)
  const y=el.getBoundingClientRect().top+window.scrollY-160;
  window.scrollTo({top:y,behavior:'smooth'});
}
function toggleGlEntry(el){
  const isOpen=el.classList.contains('open');
  document.querySelectorAll('.gl-entry.open').forEach(e=>e.classList.remove('open'));
  if(!isOpen) el.classList.add('open');
}
function collapseAll(){
  document.querySelectorAll('.gl-entry.open').forEach(e=>e.classList.remove('open'));
}

// Keyboard nav for flashcards
document.addEventListener('keydown',e=>{
  if(document.getElementById('page-flashcards').classList.contains('active')){
    if(e.key==='ArrowRight'||e.key==='Enter'){
      const btn=document.getElementById('mc-next-btn');
      if(!btn.disabled) nextCard();
    }
    if(e.key>='1'&&e.key<='4'){
      const idx=parseInt(e.key)-1;
      const opt=document.getElementById(`opt-${idx}`);
      if(opt&&!opt.classList.contains('disabled')) selectOption(idx);
    }
  }
});
