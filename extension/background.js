const TRUSTED_ORIGINS = new Set(['https://save-sift.onrender.com', 'https://saved-posts-lab-nithin.tanglednoodles.chatgpt.site', 'http://localhost:8000']);
function postUrl(id) {
  if (typeof id !== 'string' || !/^\d{10,25}$/.test(id)) throw new Error('Invalid activity ID.');
  return `https://www.linkedin.com/feed/update/urn:li:activity:${id}/`;
}
async function findOrOpen(url) {
  const tabs = await chrome.tabs.query({url: 'https://www.linkedin.com/*'});
  const existing = tabs.find(t => t.url?.split('?')[0] === url);
  if (existing) { await chrome.tabs.update(existing.id, {active: true}); return existing; }
  return chrome.tabs.create({url, active: true});
}
// Runs only on the LinkedIn tab opened for this explicit request.
function extractPost(expectedId) {
  const path = location.pathname;
  if (/login|authwall|checkpoint|uas\//i.test(path)) return {status: 'login_required'};
  if (!path.includes(`urn:li:activity:${expectedId}`)) return {status: 'not_ready'};
  const selectors = [
    '.feed-shared-update-v2__description .update-components-text',
    '.feed-shared-update-v2__description',
    '.update-components-text',
    '[data-test-id="main-feed-activity-card__commentary"]',
    '.main-feed-activity-card__commentary'
  ];
  // Prefer the activity container matching this ID, avoiding suggested posts.
  const root = document.querySelector(`[data-urn="urn:li:activity:${expectedId}"]`) || document.querySelector('main');
  let text = '';
  if (root) for (const selector of selectors) {
    const el = root.querySelector(selector);
    if (el?.innerText?.trim()) { text = el.innerText.trim(); break; }
  }
  if (!text) return {status: 'not_ready'};
  const author = root?.querySelector('.update-components-actor__title, .feed-shared-actor__name, .base-main-card__title')?.innerText?.trim().split('\n')[0] || '';
  const title = text.split('\n').find(s => s.trim())?.trim().slice(0, 160) || document.title;
  return {status: 'ok', title, text: text.slice(0, 50000), author, url: location.href, possiblyTruncated: /…see more|\.\.\.see more|…more/i.test(text)};
}

// Runs in an isolated LinkedIn tab context. Parses inert HTML; executes no response scripts.
async function fetchPostHTML(expectedId) {
  const url = 'https://www.linkedin.com/feed/update/urn:li:activity:' + expectedId + '/';
  try {
    const response = await fetch(url, {credentials:'omit', signal:AbortSignal.timeout(8000)});
    if (!response.ok || new URL(response.url).origin !== 'https://www.linkedin.com' ||
        /\/(login|authwall|checkpoint|uas\/)/i.test(new URL(response.url).pathname)) return null;
    if (!(response.headers.get('content-type') || '').includes('text/html')) return null;
    const html = await response.text();
    if (html.length > 5000000) return null;
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const canonical = doc.querySelector('link[rel="canonical"]')?.getAttribute('href') || response.url;
    if (!canonical.includes('urn:li:activity:' + expectedId) &&
        !canonical.includes('activity-' + expectedId)) return null;
    const root = doc.querySelector('[data-urn="urn:li:activity:' + expectedId + '"]') || doc.querySelector('main');
    const selectors = ['[data-test-id="main-feed-activity-card__commentary"]',
      '.main-feed-activity-card__commentary', '.feed-shared-update-v2__description'];
    let text = '';
    if (root) for (const selector of selectors) {
      const element = root.querySelector(selector);
      if (!element) continue;
      element.querySelectorAll('script,style,noscript').forEach(node => node.remove());
      element.querySelectorAll('br').forEach(node => node.replaceWith('\n'));
      text = element.textContent.trim();
      if (text) break;
    }
    if (!text) return null; // Metadata alone is not proof of complete post content.
    return {status:'ok', title:text.split('\n').find(line=>line.trim()).trim().slice(0,160),
      text:text.slice(0,50000), url, author:'', method:'html',
      possiblyTruncated:/…|\.{3}|see more/i.test(text)};
  } catch { return null; }
}

let pending = false;
function handleCapture(message, sender, sendResponse) {
  let origin;
  try { origin = new URL(sender.url).origin; } catch { return false; }
  if (!TRUSTED_ORIGINS.has(origin) || message?.type !== 'SAVESIFT_FETCH_POST') return false;
  if (pending) { sendResponse({status: 'error', error: 'Another post is being fetched. Please wait.'}); return false; }
  let url;
  try { url = postUrl(message.activityId); } catch (e) { sendResponse({status: 'error', error: e.message}); return false; }
  pending = true;
  (async () => {
    const tab = await findOrOpen(url);
    let result;
    // Wait for a LinkedIn origin before attempting an HTML request in that context.
    for (let ready = 0; ready < 8; ready++) {
      const info = await chrome.tabs.get(tab.id);
      if (info.status === 'complete') {
        try {
          const parsed = await chrome.scripting.executeScript({target:{tabId:tab.id}, func:fetchPostHTML, args:[message.activityId]});
          if (parsed[0]?.result?.status === 'ok') return parsed[0].result;
        } catch {}
        break;
      }
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    for (let attempt = 0; attempt < 24; attempt++) {
      await new Promise(r => setTimeout(r, 1000));
      try {
        const tabInfo = await chrome.tabs.get(tab.id);
        if (tabInfo.url && /linkedin\.com\/(login|authwall|checkpoint|uas\/)/i.test(tabInfo.url)) return {status: 'login_required', error: 'Sign in to LinkedIn in the opened tab, then return and click Fetch again.'};
        if (tabInfo.status !== 'complete') continue;
        const injected = await chrome.scripting.executeScript({target: {tabId: tab.id}, func: extractPost, args: [message.activityId]});
        result = injected[0]?.result;
        if (result?.status === 'ok') return result;
        if (result?.status === 'login_required') return {status: 'login_required', error: 'Sign in to LinkedIn, then retry.'};
      } catch (e) {
        if (/No tab|closed/i.test(e.message)) return {status: 'error', error: 'LinkedIn tab was closed. Retry to reopen it.'};
      }
    }
    return {status: 'unavailable', error: 'Could not identify this post’s text. Check the LinkedIn tab: sign in, expand the post if needed, then retry. You can also paste the text manually.'};
  })().then(sendResponse).catch(e => sendResponse({status: 'error', error: e.message})).finally(() => {pending = false;});
  return true;
}
chrome.runtime.onMessageExternal.addListener(handleCapture);
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (sender.id !== chrome.runtime.id) return false;
  return handleCapture(message, sender, sendResponse);
});
