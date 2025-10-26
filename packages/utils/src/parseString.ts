export const parseString = <T = unknown>(text: string): T => {
  // Handle empty string
  if (text === "") {
    return text as T;
  }

  // Handle integers (including negative)
  if (/^-?[0-9]+$/.test(text)) {
    return Number.parseInt(text, 10) as T;
  }

  // Handle floats (including negative)
  if (/^-?[0-9]+\.[0-9]+$/.test(text)) {
    return Number.parseFloat(text) as T;
  }

  // Handle scientific notation
  if (/^-?[0-9]*\.?[0-9]+[eE][+-]?[0-9]+$/.test(text)) {
    return Number.parseFloat(text) as T;
  }

  // Handle boolean values (case insensitive)
  if (/^true$/i.test(text)) {
    return true as T;
  }

  if (/^false$/i.test(text)) {
    return false as T;
  }

  // Handle null (case insensitive)
  if (/^null$/i.test(text)) {
    return null as T;
  }

  // Handle undefined (case insensitive)
  if (/^undefined$/i.test(text)) {
    return undefined as T;
  }

  // Handle arrays
  if (/^\[/.test(text) && /\]$/.test(text)) {
    return parseArray(text) as T;
  }

  // Handle objects
  if (/^\{/.test(text) && /\}$/.test(text)) {
    try {
      return JSON.parse(text) as T;
    } catch {
      return text as T;
    }
  }

  // Try JSON parsing as fallback
  try {
    const result = JSON.parse(text);

    // Handle special numeric values
    if (
      result === Number.POSITIVE_INFINITY ||
      result === Number.NEGATIVE_INFINITY ||
      Number.isNaN(result)
    ) {
      return text as T;
    }

    return result as T;
  } catch {
    // Return original string if nothing else works
    return text as T;
  }
};

const parseArray = (text: string): unknown[] => {
  // Remove outer brackets
  const content = text.slice(1, -1).trim();

  // Handle empty array
  if (content === "") {
    return [];
  }

  // Try JSON.parse first for properly formatted arrays
  try {
    const parsed = JSON.parse(text);
    // Check if we need special string processing for bracketed content
    if (Array.isArray(parsed)) {
      const processedArray = parsed.map((item) => {
        if (typeof item === "string") {
          if (item.startsWith("[") && item.endsWith("]")) {
            return item.slice(1, -1);
          }
        }
        return item;
      });
      // Flatten the array completely
      return flattenArray(processedArray);
    }
    return flattenArray(parsed);
  } catch {
    // Fall back to manual parsing for non-JSON arrays
    const elements = splitArrayElements(content).map((element) =>
      parseString(element.trim()),
    );
    return flattenArray(elements);
  }
};

const flattenArray = (arr: unknown[]): unknown[] => {
  const result: unknown[] = [];
  for (const item of arr) {
    if (Array.isArray(item)) {
      if (item.length === 0) {
        result.push("");
      } else {
        result.push(...flattenArray(item));
      }
    } else {
      result.push(item);
    }
  }
  return result;
};

const splitArrayElements = (content: string): string[] => {
  const elements: string[] = [];
  let current = "";
  let depth = 0;
  let inDoubleQuotes = false;
  let inSingleQuotes = false;
  let escapeNext = false;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];

    if (escapeNext) {
      current += char;
      escapeNext = false;
      continue;
    }

    if (char === "\\") {
      current += char;
      escapeNext = true;
      continue;
    }

    if (char === '"' && !inSingleQuotes) {
      inDoubleQuotes = !inDoubleQuotes;
      current += char;
      continue;
    }

    if (char === "'" && !inDoubleQuotes) {
      inSingleQuotes = !inSingleQuotes;
      current += char;
      continue;
    }

    if (!inDoubleQuotes && !inSingleQuotes) {
      if (char === "[" || char === "{") {
        depth++;
      } else if (char === "]" || char === "}") {
        depth--;
      } else if (char === "," && depth === 0) {
        elements.push(parseStringContent(current));
        current = "";
        continue;
      }
    }

    current += char;
  }

  if (current) {
    elements.push(parseStringContent(current));
  }

  return elements;
};

const parseStringContent = (text: string): string => {
  const trimmed = text.trim();

  // If it's a double-quoted string, parse it as JSON to handle escapes
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    try {
      const parsed = JSON.parse(trimmed);
      // Handle bracketed content - extract inner content for certain patterns
      if (typeof parsed === "string") {
        if (parsed.startsWith("[") && parsed.endsWith("]")) {
          return parsed.slice(1, -1);
        }
        if (parsed.startsWith("{") && parsed.endsWith("}")) {
          return parsed.slice(1, -1);
        }
      }
      return parsed;
    } catch {
      return trimmed;
    }
  }

  // For single quotes, preserve them as-is (don't parse)
  if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
    return trimmed;
  }

  return trimmed;
};
