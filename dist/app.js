const $=id=>document.getElementById(id);let user='demo-user',filter='All',records=[];
const groups={'LLM inference':['quantization','inference','kv cache','batching','gpu','temperature','decoding'],'RAG & retrieval':['rag','retrieval','embedding','vector','rerank','semantic'],'AI evaluation':['evaluation','evals','judge','groundedness','precision','recall'],'Career & learning':['interview','career','certification','resume','learning']};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function activity(v){const s=String(v).trim();return /^\d{10,25}$/.test(s)?s:(s.match(/urn:li:activity:(\d{10,25})/)||[])[1]||null}
function topic(r){if(!r.text)return 'Needs content';let best='Other',score=0;for(const [k,words]of Object.entries(groups)){const n=words.filter(w=>(r.title+' '+r.text).toLowerCase().includes(w)).length;if(n>score){best=k;score=n}}return best}
function persist(){localStorage.setItem('savedlab:'+user,JSON.stringify(records));render()}
function load(){try{records=JSON.parse(localStorage.getItem('savedlab:'+user)||'[]')}catch{records=[]}filter='All';render()}
function upsert(r){const old=records.find(x=>x.activityId===r.activityId);if(old){if(r.text)old.text=r.text;if(r.title)old.title=r.title;return false}records.unshift({activityId:r.activityId,title:r.title||'',text:r.text||'',sample:!!r.sample});return true}
function render(){const ts=[...new Set(records.map(topic))];$('count').textContent=records.length;$('topics').textContent=ts.length;$('ready').textContent=records.filter(r=>r.text).length;$('filters').innerHTML=['All',...ts].map(t=>`<button class="topic ${filter===t?'active':''}" data-topic="${esc(t)}">${esc(t)}</button>`).join('');const q=$('search').value.toLowerCase();const shown=records.filter(r=>(filter==='All'||topic(r)===filter)&&(r.title+' '+r.text+' '+r.activityId).toLowerCase().includes(q));const content=shown.filter(r=>r.text);$('digest').innerHTML=content.length?`<div class="banner"><b>${esc(filter==='All'?'Collection highlights':filter)}</b><p class="muted">Extracted opening sentences · ${content.length} sources · not fact-checked</p>${content.slice(0,5).map(r=>`<p>${esc((r.text.match(/[^.!?]+[.!?]*/)||[r.text])[0].slice(0,500))} <a href="https://www.linkedin.com/feed/update/urn:li:activity:${r.activityId}/" target="_blank" rel="noopener">Source ↗</a></p>`).join('')}</div>`:'';$('posts').innerHTML=shown.length?shown.map(r=>`<article class="card"><div class="row"><span class="badge">${esc(topic(r))}</span>${r.sample?'<span class="badge">Synthetic demo</span>':''}</div><h3>${esc(r.title||'Content pending')}</h3><p>${esc(r.text||'URL imported. Add content to enable grouping and highlights.')}</p><div class="row"><a target="_blank" rel="noopener" href="https://www.linkedin.com/feed/update/urn:li:activity:${r.activityId}/">Open original ↗</a><button data-fetch="${r.activityId}">Fetch content</button><button data-edit="${r.activityId}">Edit content</button><button data-remove="${r.activityId}">Remove</button></div></article>`).join(''):'<p class="muted">Your shelf is empty here. Add a post, import JSON, or load the clearly labeled demo.</p>'}
$('add').onsubmit=e=>{e.preventDefault();const id=activity($('url').value);if(!id){$('notice').textContent='Enter a valid activity ID or activity URL.';return}const added=upsert({activityId:id,title:$('title').value.trim(),text:$('text').value.trim()});persist();$('add').reset();$('notice').textContent=added?'Post saved.':'Existing post updated; no duplicate created.'};
$('filters').onclick=e=>{if(e.target.dataset.topic){filter=e.target.dataset.topic;render()}};$('search').oninput=render;
$('posts').onclick=async e=>{
  if(e.target.dataset.fetch){await fetchCard(e.target.dataset.fetch,e.target);return}
  const id=e.target.dataset.remove||e.target.dataset.edit;if(!id)return;if(e.target.dataset.remove){records=records.filter(r=>r.activityId!==id);persist()}else{const r=records.find(r=>r.activityId===id);$('url').value=id;$('title').value=r.title;$('text').value=r.text;$('text').focus()}};
$('switch').onclick=()=>{const next=$('user').value.trim();if(!next)return;user=next;load()};
function importJSON(raw){try{const obj=JSON.parse(raw);let n=0;const found=[];function walk(o){if(!o||typeof o!=='object')return;if(o.activityId){const id=activity(o.activityId);if(id)found.push({activityId:id,title:typeof o.title==='string'?o.title:'',text:typeof o.text==='string'?o.text:'',sample:o.sample===true})}else if(o.saved===true&&typeof o.entityUrn==='string'){const id=activity(o.entityUrn);if(id)found.push({activityId:id})}Object.values(o).forEach(v=>{if(typeof v==='object')walk(v)})}walk(obj);found.forEach(r=>{if(upsert(r))n++});persist();$('notice').textContent=`${n} new posts imported; ${found.length-n} existing references. No unsave reconciliation performed.`}catch{$('notice').textContent='Invalid JSON. Nothing imported.'}}
$('import').onclick=()=>importJSON($('json').value);$('file').onchange=async e=>{if(e.target.files[0])importJSON(await e.target.files[0].text())};
$('export').onclick=()=>{const b=new Blob([JSON.stringify({schemaVersion:1,userId:user,posts:records},null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='saved-posts.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)};
$('clear').onclick=()=>{if(confirm('Delete this local workspace collection?')){records=[];persist()}};
$('demo').onclick=()=>{[['9000000000000000001','Making inference efficient','Quantization reduces model weight memory. Batching can increase inference throughput, while KV cache stores attention keys and values for reuse.'],['9000000000000000002','Understanding temperature','Temperature changes the next-token probability distribution. Lower values usually make sampling more concentrated.'],['9000000000000000003','Retrieval before reranking','RAG retrieval should first gather enough relevant candidates. Reranking cannot recover a document that retrieval never returned.'],['9000000000000000004','Evaluating an agent','Evaluation should measure tool selection and task completion. A judge can supplement human review using a reference dataset.']].forEach(([activityId,title,text])=>upsert({activityId,title,text,sample:true}));persist();$('notice').textContent='Synthetic demo loaded. Demo IDs do not identify real posts.'};load();

// Explicit browser-session capture; no cookies or LinkedIn tokens leave Chrome.
$('extension-id').value = localStorage.getItem('savesift:extension-id') || '';
function extensionRequest(type, activityId, timeout = 4000) {
  return new Promise((resolve, reject) => {
    const requestId = crypto.randomUUID();
    const listener = event => {
      if (event.source !== window || event.origin !== location.origin || event.data?.source !== 'savesift-extension' || event.data.requestId !== requestId) return;
      cleanup(); resolve(event.data.payload);
    };
    const cleanup = () => { clearTimeout(timer); window.removeEventListener('message', listener); };
    const timer = setTimeout(() => { cleanup(); reject(new Error('Extension not connected. Install/reload SaveSift v0.4.0, enable its site access, then reload this page in the same Chrome profile.')); }, timeout);
    window.addEventListener('message', listener);
    window.postMessage({source: 'savesift-page', requestId, type, activityId}, location.origin);
  });
}
$('connect-extension').onclick = async () => {
  $('fetch-status').textContent = 'Checking extension connection…';
  try {
    const result = await extensionRequest('SAVESIFT_PING');
    if (result.status !== 'connected') throw new Error('Extension did not respond correctly.');
    $('extension-id').value = result.extensionId;
    localStorage.setItem('savesift:extension-id', result.extensionId);
    $('fetch-status').textContent = 'Connected to extension v' + result.version + '. Ready to fetch.';
  } catch (e) { $('fetch-status').textContent = e.message; }
};
let fetching = false;
$('fetch-post').onclick = async () => {
  if (fetching) return;
  const id = activity($('url').value);
  const extensionId = $('extension-id').value.trim();
  if (!id) { $('fetch-status').textContent = 'Enter a valid LinkedIn activity URL or ID first.'; return; }
  fetching = true;
  const requestUser = user;
  $('fetch-post').disabled = true;
  $('fetch-status').textContent = 'Opening LinkedIn to read the post. If sign-in is required, log in there and retry here.';
  try {
    await extensionRequest('SAVESIFT_PING');
    const response = await extensionRequest('SAVESIFT_FETCH_POST', id, 50000);
    if (response?.status !== 'ok') throw new Error(response?.error || 'Post text unavailable. You can paste the text manually.');
    if (user !== requestUser || activity($('url').value) !== id) throw new Error('Workspace or URL changed during fetch. Retry for the current post.');
    if (typeof response.title !== 'string' || typeof response.text !== 'string' || !response.text.trim()) throw new Error('Extension returned no usable post content.');
    if (($('text').value.trim() || $('title').value.trim()) && !confirm('Replace the title and text currently in the form?')) {
      $('fetch-status').textContent = 'Existing form content kept.'; return;
    }
    $('title').value = response.title.slice(0, 200);
    $('text').value = response.text.slice(0, 50000);
    $('fetch-status').textContent = response.possiblyTruncated ? 'Text captured; it may be truncated. Expand the post in LinkedIn and retry, or review before saving.' : 'Post captured. Review the title and text, then click Save post.';
  } catch (e) { $('fetch-status').textContent = e.message; }
  finally { fetching = false; $('fetch-post').disabled = false; }
};


async function fetchCard(id, button) {
  if (fetching) { $('notice').textContent = 'Another fetch is in progress.'; return; }
  const record = records.find(r => r.activityId === id);
  if (!record) return;
  fetching = true;
  const requestUser = user;
  const originalText = record.text, originalTitle = record.title;
  button.disabled = true;
  button.textContent = 'Fetching…';
  $('notice').textContent = 'Fetching post HTML; browser capture will be used if necessary.';
  try {
    await extensionRequest('SAVESIFT_PING');
    const response = await extensionRequest('SAVESIFT_FETCH_POST', id, 50000);
    if (response?.status !== 'ok' || typeof response.text !== 'string' ||
        !response.text.trim() || typeof response.title !== 'string') {
      throw new Error(response?.error || 'Post content unavailable.');
    }
    if (user !== requestUser || !records.includes(record)) throw new Error('Workspace or post changed; result discarded.');
    if (record.text !== originalText || record.title !== originalTitle) throw new Error('Post edited during fetch; result discarded.');
    if ((record.text || record.title) && !confirm('Replace this post’s existing title and text?')) return;
    record.title = response.title.slice(0,200);
    record.text = response.text.slice(0,50000);
    persist();
    $('notice').textContent = response.possiblyTruncated
      ? 'Content saved; it may be truncated. Review or expand the LinkedIn post and retry.'
      : 'Title and content saved. Topic grouping updated.';
  } catch(error) { $('notice').textContent = error.message; }
  finally { fetching = false; button.disabled = false; button.textContent = 'Fetch content'; }
}
