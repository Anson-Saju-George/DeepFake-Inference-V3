import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, CheckCircle2, Code2, FileText, Layers3, Table2 } from "lucide-react";
import { FLAT_RESEARCH_DOCUMENTS, RESEARCH_DOCUMENTS } from "../research/researchDocuments";

const appBase = import.meta.env.BASE_URL || "/";

const sectionIcons = [BookOpen, Layers3, CheckCircle2, FileText];

const parseResearchContent = (content) => {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const blocks = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    const trimmed = line.trim();

    if (!trimmed) {
      index += 1;
      continue;
    }

    if (/^#{1,3}\s+/.test(trimmed)) {
      const level = trimmed.match(/^#+/)[0].length;
      blocks.push({ type: "heading", level, text: trimmed.replace(/^#{1,3}\s+/, "") });
      index += 1;
      continue;
    }

    if (trimmed.startsWith("```")) {
      const language = trimmed.replace("```", "").trim();
      const code = [];
      index += 1;
      while (index < lines.length && !lines[index].trim().startsWith("```")) {
        code.push(lines[index]);
        index += 1;
      }
      blocks.push({ type: "code", language, text: code.join("\n") });
      index += 1;
      continue;
    }

    if (trimmed.startsWith("|")) {
      const rows = [];
      while (index < lines.length && lines[index].trim().startsWith("|")) {
        const row = lines[index].trim();
        if (!/^\|\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(row)) {
          rows.push(row.split("|").slice(1, -1).map((cell) => cell.trim()));
        }
        index += 1;
      }
      blocks.push({ type: "table", rows });
      continue;
    }

    if (/^\s*-\s+/.test(line)) {
      const items = [];
      while (index < lines.length && /^\s*-\s+/.test(lines[index])) {
        const depth = Math.floor((lines[index].match(/^\s*/)[0].length || 0) / 2);
        items.push({ depth, text: lines[index].replace(/^\s*-\s+/, "") });
        index += 1;
      }
      blocks.push({ type: "list", items });
      continue;
    }

    const paragraph = [trimmed];
    index += 1;
    while (
      index < lines.length &&
      lines[index].trim() &&
      !/^#{1,3}\s+/.test(lines[index].trim()) &&
      !/^\s*-\s+/.test(lines[index]) &&
      !lines[index].trim().startsWith("|") &&
      !lines[index].trim().startsWith("```")
    ) {
      paragraph.push(lines[index].trim());
      index += 1;
    }
    blocks.push({ type: "paragraph", text: paragraph.join(" ") });
  }

  return blocks;
};

const inlineContent = (text) => {
  const parts = text.split(/(`[^`]+`)/g);
  return parts.map((part, index) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={index} className="rounded-md bg-cyan-50 px-1.5 py-0.5 font-mono text-[0.9em] font-bold text-cyan-700">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
};

const ResearchTable = ({ rows }) => {
  const [head, ...body] = rows;

  return (
    <div className="my-6 overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50 px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
        <Table2 size={14} /> Evidence Table
      </div>
      <table className="w-full min-w-[680px] border-collapse text-left text-sm">
        {head && (
          <thead>
            <tr className="bg-white text-[10px] uppercase tracking-widest text-gray-500">
              {head.map((cell, cellIndex) => (
                <th key={cellIndex} className="border-b border-gray-100 px-4 py-3 font-black">{inlineContent(cell)}</th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {body.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b border-gray-50 last:border-b-0">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-4 py-3 align-top leading-6 text-gray-600">{inlineContent(cell)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const DocumentContent = ({ content }) => {
  const blocks = useMemo(() => parseResearchContent(content), [content]);
  let sectionIndex = 0;

  return (
    <div className="space-y-6">
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          if (block.level === 1) {
            return (
              <div key={index} className="rounded-2xl border border-cyan-100 bg-cyan-50/70 p-6">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-600 shadow-sm">
                  <BookOpen size={14} /> Document Focus
                </div>
                <h1 className="font-Sora text-3xl font-bold tracking-tight text-[#0A0A0A] md:text-4xl">{block.text}</h1>
              </div>
            );
          }

          const Icon = sectionIcons[sectionIndex % sectionIcons.length];
          sectionIndex += 1;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="mt-10 flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0A0A0A] text-cyan-400">
                <Icon size={19} />
              </div>
              <div>
                <div className="mb-1 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Research Section</div>
                <h2 className="font-Sora text-2xl font-bold tracking-tight text-[#0A0A0A]">{block.text}</h2>
              </div>
            </motion.div>
          );
        }

        if (block.type === "paragraph") {
          return (
            <p key={index} className="rounded-2xl border border-white bg-white/70 px-5 py-4 text-sm font-medium leading-7 text-gray-600 shadow-sm">
              {inlineContent(block.text)}
            </p>
          );
        }

        if (block.type === "list") {
          return (
            <div key={index} className="grid gap-3 md:grid-cols-2">
              {block.items.map((item, itemIndex) => (
                <div
                  key={itemIndex}
                  className={`flex gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm ${item.depth ? "md:ml-6" : ""}`}
                >
                  <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-cyan-500" />
                  <div className="text-sm font-semibold leading-6 text-gray-700">{inlineContent(item.text)}</div>
                </div>
              ))}
            </div>
          );
        }

        if (block.type === "code") {
          return (
            <div key={index} className="overflow-hidden rounded-2xl border border-gray-900 bg-[#0A0A0A] shadow-xl">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">
                  <Code2 size={14} /> Command Note
                </div>
                {block.language && <div className="font-mono text-[10px] font-bold text-gray-500">{block.language}</div>}
              </div>
              <pre className="overflow-x-auto p-5 text-xs leading-6 text-gray-100"><code>{block.text}</code></pre>
            </div>
          );
        }

        if (block.type === "table") {
          return <ResearchTable key={index} rows={block.rows} />;
        }

        return null;
      })}
    </div>
  );
};

export const Research = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeDocument = FLAT_RESEARCH_DOCUMENTS[activeIndex];
  const totalWords = useMemo(
    () => FLAT_RESEARCH_DOCUMENTS.reduce((sum, doc) => sum + doc.content.split(/\s+/).filter(Boolean).length, 0),
    []
  );

  return (
    <main className="min-h-screen bg-[#F7F9FC] pt-28">
      <section className="border-b border-gray-200 bg-[#0A0A0A] px-6 py-16 text-white">
        <div className="mx-auto max-w-7xl">
          <a href={appBase} className="mb-8 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 transition-colors hover:text-cyan-400">
            <ArrowLeft size={14} /> Back to Engine
          </a>
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400">
                <BookOpen size={16} /> Research Archive
              </div>
              <h1 className="font-Sora text-4xl font-bold tracking-tight md:text-6xl">DF-ENGINE Research</h1>
              <p className="mt-5 max-w-2xl text-sm font-medium leading-7 text-gray-400">
                Full repository documentation for model evidence, inference assumptions, datasets, training methodology, deployment constraints, and reproducible command notes.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-right">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="text-3xl font-bold text-white">{FLAT_RESEARCH_DOCUMENTS.length}</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Documents</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="text-3xl font-bold text-white">{totalWords.toLocaleString()}</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Words</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[90rem] gap-8 px-6 py-10 lg:grid-cols-[26rem_minmax(0,1fr)]">
        <aside className="min-w-0">
          <div className="sticky top-24 rounded-2xl border border-white bg-white/80 p-5 shadow-xl backdrop-blur-xl">
            {RESEARCH_DOCUMENTS.map((group) => (
              <div key={group.group} className="mb-6 last:mb-0">
                <div className="mb-3 px-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{group.group}</div>
                <div className="space-y-1">
                  {group.docs.map((doc) => {
                    const docIndex = FLAT_RESEARCH_DOCUMENTS.indexOf(doc);
                    const isActive = docIndex === activeIndex;
                    return (
                      <button
                        key={doc.filename}
                        onClick={() => setActiveIndex(docIndex)}
                        className={`w-full rounded-xl px-3 py-3 text-left transition-all ${
                          isActive ? "bg-cyan-50 text-cyan-700 shadow-sm" : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        <span className="flex items-start gap-2">
                          <FileText size={14} className={isActive ? "mt-0.5 text-cyan-500" : "mt-0.5 text-gray-300"} />
                          <span className="min-w-0">
                            <span className="block text-xs font-bold">{doc.title}</span>
                            <span className="mt-1 block truncate text-[9px] font-mono text-gray-400">{doc.filename}</span>
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>

        <article className="min-w-0">
          <div className="rounded-2xl border border-white bg-white/90 p-6 shadow-xl backdrop-blur-xl md:p-10">
            <div className="mb-8 border-b border-gray-100 pb-5">
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-600">{activeDocument.filename}</div>
              <div className="mt-2 font-Sora text-2xl font-bold tracking-tight text-[#0A0A0A]">{activeDocument.title}</div>
            </div>
            <DocumentContent content={activeDocument.content} />
          </div>
        </article>
      </section>
    </main>
  );
};
