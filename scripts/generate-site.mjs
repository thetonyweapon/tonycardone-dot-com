import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync, statSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const blogpostsDir = resolve(root, 'src', 'blogposts');
const outDir = resolve(root, 'dist');

const BASE_URL = 'https://tonycardone.com';

const staticPages = [
  { path: '/', changefreq: 'monthly', priority: 1.0 },
  { path: '/resume', changefreq: 'monthly', priority: 0.8, lastmodFrom: 'public/Resume.pdf' },
  { path: '/blog', changefreq: 'weekly', priority: 0.9 },
  { path: '/photos', changefreq: 'monthly', priority: 0.6 },
  { path: '/overlapping-run', changefreq: 'weekly', priority: 0.8 },
];

function parseDate(mmddYyyy) {
  if (!mmddYyyy) return null;
  const m = mmddYyyy.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (!m) return null;
  return new Date(+m[3], +m[1] - 1, +m[2]);
}

function toRfc2822(date) {
  if (!date || isNaN(date.getTime())) return '';
  return date.toUTCString();
}

function isoDate(date) {
  if (!date || isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

function escapeXml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function loadBlogPosts() {
  const posts = [];
  if (!existsSync(blogpostsDir)) return posts;

  for (const file of readdirSync(blogpostsDir).filter(f => f.endsWith('.md'))) {
    const content = readFileSync(resolve(blogpostsDir, file), 'utf-8');
    const slug = file.replace('.md', '');

    const titleMatch = content.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1].trim() : '';

    const dateMatch = content.match(/^date:\s*(\d{2})-(\d{2})-(\d{4})$/m);
    const date = dateMatch ? parseDate(dateMatch[0].replace('date: ', '')) : null;

    const tagMatch = content.match(/^tag:\s*(.+)$/m);
    const tag = tagMatch ? tagMatch[1].trim() : '';

    const contentWithoutMeta = content.replace(/^(date|tag):.*$/gm, '').trim();
    const contentWithoutHeaders = contentWithoutMeta.replace(/^#+.*$/gm, '').trim();
    const firstParaMatch = contentWithoutHeaders.match(/^([^\n]+(?:\n[^\n]+)*)/);
    let excerpt = firstParaMatch ? firstParaMatch[1].trim() : '';
    if (excerpt.length > 300) excerpt = excerpt.slice(0, 300) + '...';

    posts.push({ slug, title, date, tag, excerpt });
  }

  posts.sort((a, b) => (b.date?.getTime() || 0) - (a.date?.getTime() || 0));
  return posts;
}

function generateSitemap(posts) {
  const now = new Date().toISOString().slice(0, 10);
  const lines = [];
  lines.push('<?xml version="1.0" encoding="UTF-8"?>');
  lines.push('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');

  for (const page of staticPages) {
    let lastmod = now;
    if (page.lastmodFrom) {
      const filePath = resolve(root, page.lastmodFrom);
      if (existsSync(filePath)) {
        lastmod = isoDate(statSync(filePath).mtime);
      }
    }
    lines.push('  <url>');
    lines.push(`    <loc>${BASE_URL}${page.path}</loc>`);
    lines.push(`    <lastmod>${lastmod}</lastmod>`);
    lines.push(`    <changefreq>${page.changefreq}</changefreq>`);
    lines.push(`    <priority>${page.priority.toFixed(1)}</priority>`);
    lines.push('  </url>');
  }

  for (const post of posts) {
    lines.push('  <url>');
    lines.push(`    <loc>${BASE_URL}/blog/${post.slug}</loc>`);
    lines.push(`    <lastmod>${post.date ? isoDate(post.date) : now}</lastmod>`);
    lines.push('    <changefreq>monthly</changefreq>');
    lines.push('    <priority>0.7</priority>');
    lines.push('  </url>');
  }

  lines.push('</urlset>');
  return lines.join('\n');
}

function generateRss(posts) {
  const now = new Date().toUTCString();
  const lines = [];
  lines.push('<?xml version="1.0" encoding="UTF-8"?>');
  lines.push('<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">');
  lines.push('  <channel>');
  lines.push('    <title>Tony Cardone</title>');
  lines.push(`    <link>${BASE_URL}</link>`);
  lines.push('    <description>Soccer person, traveler, and a software engineer / architect / manager based in Austin, TX.</description>');
  lines.push('    <language>en</language>');
  lines.push(`    <atom:link href="${BASE_URL}/rss.xml" rel="self" type="application/rss+xml"/>`);
  lines.push(`    <lastBuildDate>${now}</lastBuildDate>`);

  for (const post of posts) {
    lines.push('    <item>');
    lines.push(`      <title>${escapeXml(post.title)}</title>`);
    lines.push(`      <link>${BASE_URL}/blog/${post.slug}</link>`);
    lines.push(`      <guid isPermaLink="true">${BASE_URL}/blog/${post.slug}</guid>`);
    if (post.date) {
      lines.push(`      <pubDate>${toRfc2822(post.date)}</pubDate>`);
    }
    if (post.excerpt) {
      lines.push(`      <description>${escapeXml(post.excerpt)}</description>`);
    }
    if (post.tag) {
      lines.push(`      <category>${escapeXml(post.tag)}</category>`);
    }
    lines.push('    </item>');
  }

  lines.push('  </channel>');
  lines.push('</rss>');
  return lines.join('\n');
}

function main() {
  if (!existsSync(outDir)) {
    mkdirSync(outDir, { recursive: true });
  }

  const posts = loadBlogPosts();
  console.log(`Found ${posts.length} blog post(s)`);

  const sitemap = generateSitemap(posts);
  writeFileSync(resolve(outDir, 'sitemap.xml'), sitemap, 'utf-8');
  console.log('→ dist/sitemap.xml');

  const rss = generateRss(posts);
  writeFileSync(resolve(outDir, 'rss.xml'), rss, 'utf-8');
  console.log('→ dist/rss.xml');
}

main();
