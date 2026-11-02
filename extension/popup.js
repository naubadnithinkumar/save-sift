const status=document.getElementById('status');async function all(){return (await chrome.storage.local.get('posts')).posts||[]}async function refresh(){status.textContent=(await all()).length+' URLs collected locally.'}document.getElementById('save').onclick=async()=>{const [t]=await chrome.tabs.query({active:true,currentWindow:true});let u;try{u=new URL(t.url)}catch{}const id=u&&u.hostname==='www.linkedin.com'&&(u.pathname.match(/urn:li:activity:(\d{10,25})/)||[])[1];if(!id){status.textContent='Open a LinkedIn activity post URL first.';return}const posts=await all();if(!posts.some(p=>p.activityId===id)){posts.push({activityId:id});await chrome.storage.local.set({posts})}refresh()};document.getElementById('export').onclick=async()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify({posts:await all()},null,2)],{type:'application/json'}));a.download='extension-saved-posts.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)};document.getElementById('clear').onclick=async()=>{if(confirm('Clear collected URLs?')){await chrome.storage.local.set({posts:[]});refresh()}};refresh();
document.getElementById('extension-id').textContent = 'Extension ID: ' + chrome.runtime.id;

const collection = SaveSiftCollection;
async function mergeIds(ids) {
  const posts = await all();
  const known = new Set(posts.map(p => p.activityId));
  let added = 0;
  for (const id of ids) {
    if (!known.has(id)) { posts.push({activityId:id}); known.add(id); added++; }
  }
  await chrome.storage.local.set({posts});
  return {added, total: posts.length};
}
document.getElementById('collect-page').onclick = async () => {
  try {
    const [tab] = await chrome.tabs.query({active:true,currentWindow:true});
    const page = new URL(tab.url);
    if (page.origin !== 'https://www.linkedin.com' ||
        !/^\/my-items\/saved-posts\/?$/.test(page.pathname)) {
      throw new Error('Open LinkedIn My Items → Saved posts first.');
    }
    const results = await chrome.scripting.executeScript({
      target:{tabId:tab.id},
      func:() => {
        const main = document.querySelector('main');
        if (!main) return [];
        return [...main.querySelectorAll('a[href]')].map(a => a.href);
      }
    });
    const ids = [...new Set((results[0]?.result || []).flatMap(href => {
      try {
        const link = new URL(href);
        if (link.origin !== 'https://www.linkedin.com') return [];
        const id = collection.activityId(decodeURIComponent(link.pathname));
        return id ? [id] : [];
      } catch { return []; }
    }))];
    const result = await mergeIds(ids);
    status.textContent = result.added + ' new URLs; ' + result.total +
      ' total. Loaded list only: scroll LinkedIn and collect again. Completeness is not verified.';
  } catch (error) { status.textContent = error.message; }
};
document.getElementById('responses').onchange = async event => {
  try {
    const ids = new Set();
    // Validate every file before changing local storage.
    for (const file of event.target.files) {
      if (file.size > 20 * 1024 * 1024) throw new Error('Each JSON file must be under 20 MB.');
      for (const id of collection.savedIds(JSON.parse(await file.text()))) ids.add(id);
    }
    const result = await mergeIds([...ids]);
    status.textContent = result.added + ' new saved IDs; ' + result.total +
      ' total. Import every pagination response for full coverage.';
  } catch (error) { status.textContent = 'Import failed: ' + error.message; }
  finally { event.target.value = ''; }
};
document.getElementById('export-urls').onclick = async () => {
  const text = (await all()).map(p => collection.url(p.activityId)).join('\n');
  const href = URL.createObjectURL(new Blob([text], {type:'text/plain'}));
  const link = document.createElement('a');
  link.href = href; link.download = 'linkedin-saved-post-urls.txt'; link.click();
  setTimeout(() => URL.revokeObjectURL(href), 1000);
};
