import { readFileSync, writeFileSync, statSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { inflateRawSync } from 'zlib';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const docxPath = resolve(root, 'public', 'Resume.docx');
const outPath = resolve(root, 'src', 'data', 'resume.json');

const SECTION_HEADERS = new Set([
  'PROFESSIONAL SUMMARY',
  'EXPERIENCE',
  'TECHNICAL SKILLS',
  'EDUCATION',
  'CERTIFICATIONS',
  'AWARDS',
  'PROJECTS',
  'PUBLICATIONS',
  'REFERENCES',
]);

function readZipEntry(buf, entryName) {
  let eocd = -1;
  for (let i = buf.length - 22; i >= 0; i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) throw new Error('Invalid zip: no end of central directory record');

  const cdSize = buf.readUInt32LE(eocd + 12);
  const cdOffset = buf.readUInt32LE(eocd + 16);
  let offset = cdOffset;
  const cdEnd = cdOffset + cdSize;

  while (offset < cdEnd) {
    if (buf.readUInt32LE(offset) !== 0x02014b50) break;
    const method = buf.readUInt16LE(offset + 10);
    const compSize = buf.readUInt32LE(offset + 20);
    const nameLen = buf.readUInt16LE(offset + 28);
    const extraLen = buf.readUInt16LE(offset + 30);
    const commentLen = buf.readUInt16LE(offset + 32);
    const localOffset = buf.readUInt32LE(offset + 42);
    const name = buf.toString('utf8', offset + 46, offset + 46 + nameLen);

    if (name === entryName) {
      const localNameLen = buf.readUInt16LE(localOffset + 26);
      const localExtraLen = buf.readUInt16LE(localOffset + 28);
      const dataStart = localOffset + 30 + localNameLen + localExtraLen;
      const data = buf.subarray(dataStart, dataStart + compSize);
      if (method === 0) return data;
      if (method === 8) return inflateRawSync(data);
      throw new Error(`Unsupported compression method ${method} for ${entryName}`);
    }

    offset += 46 + nameLen + extraLen + commentLen;
  }

  throw new Error(`Zip entry not found: ${entryName}`);
}

function xmlDecode(s) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

function extractParagraphs(buf) {
  const xml = readZipEntry(buf, 'word/document.xml').toString('utf8');
  const paragraphs = [];
  const pRe = /<w:p\b[^>]*>([\s\S]*?)<\/w:p>/g;
  let m;
  while ((m = pRe.exec(xml))) {
    const body = m[1]
      .replace(/<w:br\b[^>]*\/?>/g, ' ')
      .replace(/<w:tab\b[^>]*\/?>/g, ' ');
    const normalizedBody = body.replaceAll('<w:cr/>', ' ');
    const text = [];
    const tRe = /<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/g;
    let tm;
    while ((tm = tRe.exec(normalizedBody))) {
      text.push(xmlDecode(tm[1]));
    }
    paragraphs.push(text.join(''));
  }
  return paragraphs;
}

function parseContact(line) {
  const contact = {};
  for (const part of line.split('|').map((s) => s.trim()).filter(Boolean)) {
    if (/^[\d\s()+-]+$/.test(part)) continue; // keep phone numbers out of generated site data
    if (part.includes('@')) contact.email = part;
    else if (/linkedin/i.test(part)) contact.linkedin = part;
    else if (/^[\w.-]+\.[a-z]{2,}$/i.test(part)) contact.website = part;
    else contact.other = (contact.other || []).concat(part);
  }
  return contact;
}

function isSectionHeader(line) {
  if (SECTION_HEADERS.has(line)) return true;
  return /^[A-Z][A-Z &()'-]{3,}$/.test(line) && !line.endsWith(':');
}

function normalizeDates(s) {
  return s.replace(/\s*[-–—]\s*/g, ' - ');
}

function parseResume(paragraphs) {
  const nonEmpty = paragraphs.map((p) => p.trim()).filter(Boolean);

  const data = {
    name: nonEmpty[0] || '',
    headline: nonEmpty[1] || '',
    contact: {},
    summary: '',
    experience: [],
    skills: [],
    education: [],
    other: [],
    updatedAt: '',
  };

  let start = 2;
  if (start < nonEmpty.length && (nonEmpty[start].includes('|') || nonEmpty[start].includes('@'))) {
    data.contact = parseContact(nonEmpty[start]);
    start++;
  }

  const content = nonEmpty.slice(start);
  let section = null;
  let company = null;
  let role = null;
  let edu = null;

  const pushBullet = (text) => {
    if (role) role.bullets.push(text);
    else if (company) company.bullets.push(text);
  };

  for (const line of content) {
    if (isSectionHeader(line)) {
      section = SECTION_HEADERS.has(line) ? line : null;
      company = null;
      role = null;
      edu = null;
      if (!SECTION_HEADERS.has(line)) {
        data.other.push({ heading: line, items: [] });
      }
      continue;
    }

    if (!section) {
      if (data.other.length === 0) data.other.push({ heading: '', items: [] });
      data.other[data.other.length - 1].items.push(line);
      continue;
    }

    if (section === 'PROFESSIONAL SUMMARY') {
      data.summary = data.summary ? `${data.summary} ${line}` : line;
      continue;
    }

    if (section === 'TECHNICAL SKILLS') {
      const idx = line.indexOf(':');
      if (idx > 0) {
        const label = line.slice(0, idx).trim();
        const items = line.slice(idx + 1).split(',').map((s) => s.trim()).filter(Boolean);
        data.skills.push({ label, items });
      } else {
        data.skills.push({ label: '', items: line.split(',').map((s) => s.trim()).filter(Boolean) });
      }
      continue;
    }

    if (section === 'EDUCATION') {
      const educationLine = line
        .replace(/TX(?=Rawls|Whitacre)/, 'TX | ')
        .replace(/Mathematics(?=Whitacre)/, 'Mathematics | ');
      if (/^(Master|Bachelor|Doctor|Associate|MBA|BBA|MS|BS|MA|PhD)\b/i.test(educationLine)) {
        const m = educationLine.match(/^(.+?)\s*\|\s*(.+)$/);
        edu = m
          ? { title: m[1].trim(), year: m[2].trim(), detail: '' }
          : { title: educationLine.trim(), year: '', detail: '' };
        data.education.push(edu);
      } else if (edu) {
        edu.detail = edu.detail ? `${edu.detail} | ${educationLine.trim()}` : educationLine.trim();
      } else {
        data.education.push({ title: educationLine.trim(), year: '', detail: '' });
      }
      continue;
    }

    if (section === 'EXPERIENCE') {
      const parts = line.split('|').map((s) => s.trim());
      const yearCount = (line.match(/\b(?:19|20)\d{2}\b/g) || []).length;
      if (parts.length >= 3 && yearCount >= 2) {
        company = {
          company: parts[0],
          location: parts[1],
          dates: parts.slice(2).join(' | '),
          roles: [],
          bullets: [],
        };
        data.experience.push(company);
        role = null;
        continue;
      }

      const roleMatch = line.match(/^(.+?)\s*\(\s*(\d{4}(?:\s*[-–—]\s*(?:\d{4}|present|current))?)\s*\)\s*$/);
      const looksLikeRole = roleMatch || (line.length <= 45 && !/[.,!?]$/.test(line) && !line.includes(','));

      if (looksLikeRole) {
        if (!company) {
          company = { company: 'Experience', location: '', dates: '', roles: [], bullets: [] };
          data.experience.push(company);
        }
        const title = roleMatch ? roleMatch[1].trim() : line.trim();
        const dates = roleMatch ? normalizeDates(roleMatch[2]) : '';
        role = { title, dates, bullets: [] };
        company.roles.push(role);
        continue;
      }

      pushBullet(line);
    }
  }

  if (existsSync(docxPath)) {
    const st = statSync(docxPath);
    data.updatedAt = st.mtime.toISOString();
  }

  return data;
}

function main() {
  if (!existsSync(docxPath)) {
    console.warn('⚠ Skipping resume extraction: public/Resume.docx not found');
    return;
  }

  const buf = readFileSync(docxPath);
  const paragraphs = extractParagraphs(buf);
  const data = parseResume(paragraphs);

  writeFileSync(outPath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
  console.log(`Fetched resume content → src/data/resume.json`);
}

main();
