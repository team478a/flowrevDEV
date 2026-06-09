import sanitizeHtml from "sanitize-html";

/**
 * LP の html_content をレンダリング前にサニタイズする。
 * allowlist 方式で安全なタグ・属性のみ許可し、Stored XSS を防ぐ。
 * script / iframe / on* 属性はすべて除去される。
 */
export function sanitizeLpHtml(dirty: string): string {
  return sanitizeHtml(dirty, {
    allowedTags: [
      "h1", "h2", "h3", "h4", "h5", "h6",
      "p", "br", "hr",
      "ul", "ol", "li",
      "strong", "em", "u", "s", "blockquote", "pre", "code",
      "a", "img",
      "div", "span", "section", "article", "header", "footer", "main",
      "table", "thead", "tbody", "tr", "th", "td",
      "form", "label", "input", "textarea", "button", "select", "option",
    ],
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt", "width", "height"],
      input: ["type", "name", "placeholder", "value", "required"],
      textarea: ["name", "placeholder", "rows", "cols", "required"],
      button: ["type"],
      select: ["name", "required"],
      option: ["value"],
      "*": ["class", "id", "style"],
    },
    allowedSchemes: ["https", "http", "mailto"],
    allowedSchemesByTag: {
      img: ["https", "http", "data"],
    },
  });
}
