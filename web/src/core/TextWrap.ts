export function toAscii(tabWidth: number, text: string): string {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '\t') {
      result += ' '.repeat(tabWidth);
    } else if (c === '‘' || c === '’') {
      result += "'";
    } else if (c === '“' || c === '”') {
      result += '"';
    } else if (c === '–' || c === '—') {
      result += '-';
    } else if (c === '…') {
      result += '...';
    } else {
      const code = c.charCodeAt(0);
      if (code < 128) {
        if ((code >= 32 && code <= 126) || c === '\n') {
          result += c;
        }
      }
    }
  }
  return result;
}

export function trimEmptyLines(text: string): string {
  // Trims leading and trailing newlines, then adds a single trailing newline
  let start = 0;
  while (start < text.length && text[start] === '\n') {
    start++;
  }
  let end = text.length;
  while (end > start && text[end - 1] === '\n') {
    end--;
  }
  return text.slice(start, end) + '\n';
}

export function wrapLine(width: number, line: string): string[] {
  if (line.length <= width) {
    return [line];
  }

  // Preserve leading indentation
  let indentLen = 0;
  while (indentLen < line.length && line[indentLen] === ' ') {
    indentLen++;
  }
  const indent = line.slice(0, indentLen);
  const content = line.slice(indentLen);

  if (content.length === 0) {
    return [line];
  }

  const words = content.split(' ');
  const lines: string[] = [];
  let currentLine = indent;

  for (let i = 0; i < words.length; i++) {
    let word = words[i];

    // If word is empty (consecutive spaces in content)
    if (word === '') {
      if (currentLine.length + 1 <= width) {
        currentLine += ' ';
      } else {
        lines.push(currentLine);
        currentLine = indent + ' ';
      }
      continue;
    }

    // Break long words if a single word exceeds width
    while (word.length > width) {
      const availableSpace = Math.max(1, width - currentLine.length);
      const piece = word.slice(0, availableSpace);
      word = word.slice(availableSpace);
      if (currentLine.length > 0) {
        lines.push(currentLine + piece);
        currentLine = '';
      } else {
        lines.push(piece);
        currentLine = '';
      }
    }

    const isAtStart = currentLine.length === 0 || currentLine === indent;
    const spaceNeeded = isAtStart ? 0 : 1;
    if (currentLine.length + spaceNeeded + word.length <= width) {
      currentLine += (spaceNeeded ? ' ' : '') + word;
    } else {
      if (currentLine.length > 0) {
        lines.push(currentLine);
      }
      currentLine = word;
    }
  }

  if (currentLine.length > 0) {
    lines.push(currentLine);
  }

  return lines.length > 0 ? lines : [''];
}

export function wrapText(width: number, text: string): string {
  const inputLines = text.split('\n');
  const wrappedLines: string[] = [];

  for (let i = 0; i < inputLines.length; i++) {
    const l = inputLines[i];
    const wrapped = wrapLine(width, l);
    wrappedLines.push(...wrapped);
  }

  return wrappedLines.join('\n');
}
