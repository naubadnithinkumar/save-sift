/* Packaged helpers shared by the popup and checks. */
(function(root) {
  function activityId(value) {
    const match = String(value || '').match(/urn:li:activity:(\d{10,25})(?!\d)|(?:^|[_-])activity-(\d{10,25})(?!\d)/);
    return match ? match[1] || match[2] : null;
  }
  function savedIds(value) {
    const ids = new Set();
    function walk(item) {
      if (!item || typeof item !== 'object') return;
      if (item.saved === true && item.$type === 'com.linkedin.voyager.dash.feed.SaveState') {
        const id = activityId(item.entityUrn);
        if (id) ids.add(id);
      }
      for (const child of Object.values(item)) {
        if (child && typeof child === 'object') walk(child);
      }
    }
    walk(value);
    return [...ids];
  }
  function url(id) { return 'https://www.linkedin.com/feed/update/urn:li:activity:' + id + '/'; }
  const api = {activityId, savedIds, url};
  if (typeof module !== 'undefined') module.exports = api;
  else root.SaveSiftCollection = api;
})(globalThis);
