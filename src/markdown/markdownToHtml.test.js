import { describe, it, expect } from "vitest";
import { markdownToHtml, markdownToFullDocument } from "./markdownToHtml.js";

describe("markdownToHtml", () => {
  it("returns empty string for non-string input", () => {
    expect(markdownToHtml(null)).toBe("");
    expect(markdownToHtml(undefined)).toBe("");
    expect(markdownToHtml(123)).toBe("");
  });

  it("returns wrapper div for empty string", () => {
    const html = markdownToHtml("");
    expect(html).toContain('<div class="md-body">');
    expect(html).toContain("</div>");
  });

  it("converts paragraphs", () => {
    const html = markdownToHtml("First para.\n\nSecond para.");
    expect(html).toContain("<p>");
    expect(html).toContain("First para.");
    expect(html).toContain("Second para.");
  });

  it("converts headings h1-h6", () => {
    const html = markdownToHtml("# H1\n## H2\n### H3");
    expect(html).toContain("<h1>");
    expect(html).toContain("<h2>");
    expect(html).toContain("<h3>");
    expect(html).toContain("H1");
    expect(html).toContain("H2");
    expect(html).toContain("H3");
  });

  it("converts bold and italic", () => {
    const html = markdownToHtml("**bold** and *italic*");
    expect(html).toContain("<strong>");
    expect(html).toContain("<em>");
    expect(html).toContain("bold");
    expect(html).toContain("italic");
  });

  it("converts inline code", () => {
    const html = markdownToHtml("Use `code()` here.");
    expect(html).toContain("<code>");
    expect(html).toContain("code()");
  });

  it("converts fenced code blocks", () => {
    const html = markdownToHtml("```js\nconst x = 1;\n```");
    expect(html).toContain("<pre>");
    expect(html).toMatch(/<code[\s>]/);
    expect(html).toContain("const x = 1;");
  });

  it("converts unordered list", () => {
    const html = markdownToHtml("- A\n- B");
    expect(html).toContain("<ul>");
    expect(html).toContain("<li>");
    expect(html).toContain("A");
    expect(html).toContain("B");
  });

  it("converts ordered list", () => {
    const html = markdownToHtml("1. First\n2. Second");
    expect(html).toContain("<ol>");
    expect(html).toContain("<li>");
    expect(html).toContain("First");
  });

  it("converts blockquote", () => {
    const html = markdownToHtml("> Quote line");
    expect(html).toContain("<blockquote>");
    expect(html).toContain("Quote line");
  });

  it("converts table", () => {
    const html = markdownToHtml("| A | B |\n|---|---|\n| 1 | 2 |");
    expect(html).toContain("<table>");
    expect(html).toContain("<thead>");
    expect(html).toContain("<th>");
    expect(html).toContain("<td>");
  });

  it("converts link", () => {
    const html = markdownToHtml("[text](https://example.com)");
    expect(html).toContain("<a ");
    expect(html).toContain("href");
    expect(html).toContain("https://example.com");
    expect(html).toContain("text");
  });

  it("converts horizontal rule", () => {
    const html = markdownToHtml("Above\n\n---\n\nBelow");
    expect(html).toContain("<hr");
  });

  it("does not throw on special characters", () => {
    const html = markdownToHtml('Ampersand & and < and >. "Quotes"');
    expect(html.length).toBeGreaterThan(0);
    expect(html).toContain("md-body");
  });

  it("full example produces expected tags", () => {
    const md = `# Title
**Bold** and *italic* and \`code\`.
- List item
> Blockquote
| A | B |
|---|---|
| 1 | 2 |
`;
    const html = markdownToHtml(md);
    expect(html).toContain("<h1>");
    expect(html).toContain("<strong>");
    expect(html).toContain("<em>");
    expect(html).toContain("<code>");
    expect(html).toContain("<ul>");
    expect(html).toContain("<blockquote>");
    expect(html).toContain("<table>");
    expect(html.length).toBeGreaterThan(100);
  });
});

describe("markdownToFullDocument", () => {
  it("returns full HTML document with style", () => {
    const html = markdownToFullDocument("# Hi");
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("<html>");
    expect(html).toContain("<head>");
    expect(html).toContain("<style>");
    expect(html).toContain("<body>");
    expect(html).toContain("md-body");
    expect(html).toContain("<h1>");
  });
});
