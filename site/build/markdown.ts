/**
 * The little Markdown the legal texts are written in, turned into HTML:
 * headings (`#`, `##`, `###`), paragraphs, lists (`- `), tables (`| a | b |`
 * with a `|---|` line under the head), and inside a line `**bold**` and
 * `[links](address)`. Nothing else is understood — and nothing of the source
 * reaches the page unescaped.
 */
const escape = (text: string): string => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function inline(text: string): string {
  return escape(text)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_all, label: string, href: string) => `<a href="${href}"${/^https?:/.test(href) ? ' rel="noopener"' : ''}>${label}</a>`);
}

const cells = (row: string): string[] => row.trim().replace(/^\||\|$/g, '').split('|').map((cell) => cell.trim());

/** A heading's anchor: `#s3` for the third `##` of the page, so a section can be linked to. */
export function markdownToHtml(source: string): string {
  const out: string[] = [];
  const lines = source.replace(/\r\n/g, '\n').split('\n');
  let section = 0;
  for (let i = 0; i < lines.length; ) {
    const line = lines[i];
    if (line.trim() === '') {
      i += 1;
      continue;
    }
    const heading = /^(#{1,3}) (.+)$/.exec(line);
    if (heading) {
      const level = heading[1].length;
      out.push(level === 2 ? `<h2 id="s${++section}">${inline(heading[2])}</h2>` : `<h${level}>${inline(heading[2])}</h${level}>`);
      i += 1;
    } else if (line.startsWith('- ')) {
      const items: string[] = [];
      for (; i < lines.length && lines[i].startsWith('- '); i += 1) items.push(`<li>${inline(lines[i].slice(2))}</li>`);
      out.push(`<ul>${items.join('')}</ul>`);
    } else if (line.startsWith('|')) {
      const rows: string[][] = [];
      for (; i < lines.length && lines[i].startsWith('|'); i += 1) rows.push(cells(lines[i]));
      const [head, , ...body] = rows;
      const row = (tag: string, row: string[]): string => `<tr>${row.map((cell) => `<${tag}>${inline(cell)}</${tag}>`).join('')}</tr>`;
      // A table scrolls sideways by itself on a phone instead of pushing the page wide.
      out.push(`<div class="table"><table><thead>${row('th', head)}</thead><tbody>${body.map((cells) => row('td', cells)).join('')}</tbody></table></div>`);
    } else {
      const text: string[] = [];
      for (; i < lines.length && lines[i].trim() !== '' && !/^(#{1,3} |- |\|)/.test(lines[i]); i += 1) text.push(lines[i].trim());
      out.push(`<p>${inline(text.join(' '))}</p>`);
    }
  }
  return out.join('\n');
}
