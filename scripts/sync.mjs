/** Daily refresh of an explicitly approved shortlist; never auto-publish unknown sites. */
import fs from 'node:fs/promises';
const root = new URL('../public/data.json', import.meta.url);
const endpoint = 'https://raw.githubusercontent.com/laoma528/awesome-zhuiju-free/main/resources/resources.json';
const normalize = s => String(s ?? '').trim().toLowerCase().replace(/\s+/g, '');
const host = value => { try { const u = new URL(value); return /^https?:$/.test(u.protocol) ? u.hostname.toLowerCase().replace(/^www\./,'') : ''; } catch { return ''; } };
const text = (...args) => args.find(x => typeof x === 'string' && x.trim()) || '';
const existing = JSON.parse(await fs.readFile(root, 'utf8'));
const response = await fetch(endpoint, {headers:{'User-Agent':'MovieHub-Shortlist-Sync/1.0'},signal:AbortSignal.timeout(20000)});
if (!response.ok) throw new Error(`上游请求失败: HTTP ${response.status}`);
const body = await response.json();
const records = Array.isArray(body) ? body : Array.isArray(body.resources) ? body.resources : Array.isArray(body.data) ? body.data : [];
if (records.length < 1) throw new Error('上游资源列表为空，保留旧数据');
const candidates = records.map(x => ({raw:x,name:text(x.name,x.title,x.site_name,x.siteName),url:text(x.url,x.link,x.website,x.site_url,x.siteUrl,x.homepage)})).filter(x=>host(x.url));
if (!candidates.length) throw new Error('上游数据格式不匹配，保留旧数据');
let changed = 0, matched = 0;
const updated = existing.resources.map(site => {
  // Match by approved site name first, then by its previous hostname.
  const found = candidates.find(x => normalize(x.name) === normalize(site.name)) || candidates.find(x => host(x.url) === host(site.url));
  if (!found) return {...site, syncStatus:'not_found_in_upstream'}; // retain old URL, do not delete
  matched++;
  const nextUrl = found.url;
  if (nextUrl !== site.url) changed++;
  return {...site, url:nextUrl, ...(host(nextUrl)!==host(site.url)?{searchVerified:false,searchTemplate:null,searchHost:null}:{}), syncStatus:'listed_in_upstream', lastSyncedAt:new Date().toISOString()};
});
// A major schema change must not silently mark every resource missing.
if (!matched) throw new Error('未匹配任何精选站点，保留旧数据，请检查上游格式');
const result = {...existing, updatedAt:new Date().toISOString(), syncSource:endpoint, resources:updated};
await fs.writeFile(root,JSON.stringify(result,null,2)+'\n','utf8');
console.log(`同步完成：上游 ${records.length} 条；匹配 ${matched}/${existing.resources.length}；网址变化 ${changed} 条。`);
