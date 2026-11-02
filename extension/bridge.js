// Isolated content script: a narrow bridge on the allowlisted SaveSift pages.
window.addEventListener('message', event => {
  if (event.source !== window || event.origin !== location.origin) return;
  const msg = event.data;
  if (msg?.source !== 'savesift-page' || typeof msg.requestId !== 'string') return;
  const reply = payload => window.postMessage({source: 'savesift-extension', requestId: msg.requestId, payload}, location.origin);
  if (msg.type === 'SAVESIFT_PING') {
    reply({status: 'connected', extensionId: chrome.runtime.id, version: chrome.runtime.getManifest().version});
    return;
  }
  if (msg.type !== 'SAVESIFT_FETCH_POST' || typeof msg.activityId !== 'string' || !/^\d{10,25}$/.test(msg.activityId)) return;
  chrome.runtime.sendMessage({type: msg.type, activityId: msg.activityId}, result => {
    if (chrome.runtime.lastError) reply({status: 'error', error: 'Extension restarted. Reload SaveSift and retry.'});
    else reply(result);
  });
});
