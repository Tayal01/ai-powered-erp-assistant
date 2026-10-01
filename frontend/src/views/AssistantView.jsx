import { motion } from "framer-motion";
import {
  Bot,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Circle,
  Database,
  LoaderCircle,
  Rows3,
  SendHorizontal,
  Sparkles,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { streamAssistant } from "../api.js";
import { EmptyState, ErrorBanner, SectionTitle, SurfaceCard } from "../components/ui.jsx";

const AGENT_STEPS = [
  "Understanding your question",
  "Generating SQL",
  "Running query",
  "Summarizing results",
];
const STATUS_STEP = { generating_sql: 1, running_query: 2, summarizing: 3 };
const RESULT_PREVIEW_LIMIT = 8;
const SUGGESTED_PROMPTS = [
  "Which buyer generated the highest revenue?",
  "Show pending invoices above ₹1,000",
  "Top 5 suppliers by number of orders",
  "Which buyers purchased garments above 220 GSM?",
];

function ResultsTable({ rows }) {
  if (!rows?.length) {
    return <EmptyState className="py-6" message="The query ran successfully but returned no rows." />;
  }

  const columns = Object.keys(rows[0]);

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
      <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
        <thead className="bg-[#f8faf9]">
          <tr>
            {columns.map((column) => (
              <th className="px-4 py-3 font-semibold text-slate-600" key={column}>
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {rows.slice(0, RESULT_PREVIEW_LIMIT).map((row, index) => (
            <tr key={index}>
              {columns.map((column) => (
                <td className="px-4 py-3 text-slate-700" key={column}>
                  {String(row[column] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CollapsibleRunSection({ children, defaultOpen = false, icon: Icon, title, value }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white">
      <button
        className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <span className="inline-flex min-w-0 items-center gap-2 text-xs font-semibold uppercase tracking-wide text-ink">
          <Icon aria-hidden="true" className="shrink-0" size={14} />
          <span className="truncate">{title}</span>
        </span>
        <span className="inline-flex shrink-0 items-center gap-2 text-xs font-medium text-slate-500">
          {value}
          {open ? <ChevronUp aria-hidden="true" size={15} /> : <ChevronDown aria-hidden="true" size={15} />}
        </span>
      </button>
      {open ? <div className="border-t border-slate-200 p-4 pt-3">{children}</div> : null}
    </div>
  );
}

function UserBubble({ content }) {
  return (
    <motion.div animate={{ opacity: 1, y: 0 }} className="flex justify-end" initial={{ opacity: 0, y: 8 }}>
      <div className="max-w-3xl rounded-[24px] bg-[#102227] px-5 py-4 text-sm leading-7 text-white shadow-sm">
        {content}
      </div>
    </motion.div>
  );
}

function AgentRunSteps({ activeStep = null, className = "" }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {AGENT_STEPS.map((label, index) => {
        const allDone = activeStep === null;
        const isDone = allDone || index < activeStep;
        const isActive = !allDone && index === activeStep;
        return (
          <div className="flex items-center gap-2 text-xs text-slate-500" key={label}>
            {isDone ? (
              <CheckCircle2 aria-hidden="true" className="text-[#4b8b69]" size={14} />
            ) : isActive ? (
              <LoaderCircle aria-hidden="true" className="animate-spin text-[#4b8b69]" size={14} />
            ) : (
              <Circle aria-hidden="true" className="text-slate-300" size={14} />
            )}
            <span className={isActive ? "font-semibold text-ink" : ""}>{label}</span>
          </div>
        );
      })}
    </div>
  );
}

function AssistantResultBubble({ message, activeStep = null, streaming = false }) {
  const hasSql = Boolean(message.sql);
  const rowsShown = Math.min(message.rows?.length || 0, RESULT_PREVIEW_LIMIT);
  const summarizing = streaming && activeStep === 3;

  return (
    <motion.div animate={{ opacity: 1, y: 0 }} className="flex justify-start" initial={{ opacity: 0, y: 8 }}>
      <div className="max-w-3xl rounded-[24px] border border-slate-200 bg-white px-5 py-4 text-sm leading-7 text-slate-700 shadow-sm">
        <div className="rounded-2xl border border-slate-200 bg-[#f8faf9] p-4">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-ink">
            <Sparkles aria-hidden="true" size={13} />
            Agent run
          </p>
          <AgentRunSteps activeStep={activeStep} className="mt-3" />
        </div>

        <div className="mt-4 space-y-3">
          <CollapsibleRunSection
            defaultOpen={streaming}
            icon={Database}
            title="Generated SQL"
            value={hasSql ? "View query" : "Generating…"}
          >
            {hasSql ? (
              <pre className="overflow-x-auto rounded-2xl bg-[#102227] p-4 text-xs leading-6 text-[#d7ece2]">
                {message.sql}
              </pre>
            ) : (
              <p className="text-xs text-slate-500">Writing the query…</p>
            )}
          </CollapsibleRunSection>

          <CollapsibleRunSection
            defaultOpen={streaming}
            icon={Rows3}
            title="Result preview"
            value={message.rows?.length ? `${rowsShown} of ${message.row_count} rows` : "…"}
          >
            {message.rows?.length ? (
              <ResultsTable rows={message.rows} />
            ) : (
              <p className="text-xs text-slate-500">Running the query…</p>
            )}
          </CollapsibleRunSection>
        </div>

        <div className="mt-4 rounded-2xl bg-[#f4efe8] px-4 py-4">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#102227]">
            <Sparkles aria-hidden="true" size={12} />
            ERP insight
          </div>
          {message.summary ? (
            <p>
              {message.summary}
              {summarizing ? <span className="ml-0.5 inline-block animate-pulse text-[#4b8b69]">▍</span> : null}
            </p>
          ) : (
            <p className="text-slate-500">{streaming ? "Summarizing results…" : ""}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function SuggestedPrompts({ disabled, onSelect }) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-[#f8faf9] px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Suggested prompts</p>
      <div className="mt-3 grid gap-2 md:grid-cols-2">
        {SUGGESTED_PROMPTS.map((prompt) => (
          <button
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:border-[#4b8b69] hover:text-ink disabled:cursor-not-allowed disabled:opacity-60"
            disabled={disabled}
            key={prompt}
            onClick={() => onSelect(prompt)}
            type="button"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function AssistantView({ getApiErrorMessage, notifyError }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState([]);
  const [streaming, setStreaming] = useState(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming, loading]);

  async function submitQuestion(questionText) {
    const question = questionText.trim();
    if (!question || loading) {
      return;
    }

    setLoading(true);
    setError("");
    setInput("");
    setMessages((current) => [...current, { type: "user", content: question }]);

    const acc = { step: 0, sql: "", rows: [], row_count: 0, summary: "" };
    setStreaming({ ...acc });
    let hadError = false;

    try {
      await streamAssistant(question, {
        onEvent: (event, data) => {
          if (event === "status") {
            acc.step = STATUS_STEP[data.step] ?? acc.step;
          } else if (event === "sql") {
            acc.sql = data.sql || "";
            acc.step = 1;
          } else if (event === "rows") {
            acc.rows = data.rows || [];
            acc.row_count = data.row_count || 0;
            acc.step = 2;
          } else if (event === "summary") {
            acc.summary += data.delta || "";
            acc.step = 3;
          } else if (event === "done") {
            acc.row_count = data.row_count ?? acc.row_count;
          } else if (event === "error") {
            hadError = true;
            const message = data.detail || "Unable to answer that ERP question.";
            setError(message);
            notifyError("assistant-chat", message);
          }
          setStreaming({ ...acc });
        },
      });

      if (!hadError) {
        setMessages((current) => [
          ...current,
          {
            type: "assistant",
            sql: acc.sql,
            rows: acc.rows,
            row_count: acc.row_count,
            summary: acc.summary,
          },
        ]);
      }
    } catch (requestError) {
      const message = getApiErrorMessage(requestError, "Unable to answer that ERP question.");
      setError(message);
      notifyError("assistant-chat", message);
    } finally {
      setLoading(false);
      setStreaming(null);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    await submitQuestion(input);
  }

  const isEmptyChat = messages.length === 0 && !loading;

  return (
    <div className="flex h-full flex-col gap-5">
      <SurfaceCard className="shrink-0 p-5">
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#102227] text-white">
            <Bot aria-hidden="true" size={19} />
          </div>
          <SectionTitle
            subtitle="Ask about buyers, suppliers, products, orders, and invoices."
            title="Natural-language ERP assistant"
          />
        </div>
      </SurfaceCard>

      <SurfaceCard className="flex min-h-0 flex-1 flex-col p-5 md:p-6">
        <div
          className={`min-h-0 flex-1 overflow-y-auto pr-1 ${
            isEmptyChat ? "flex items-center justify-center" : "space-y-4"
          }`}
        >
          {isEmptyChat ? <SuggestedPrompts disabled={loading} onSelect={submitQuestion} /> : null}

          {messages.map((message, index) => {
            if (message.type === "user") {
              return <UserBubble content={message.content} key={`user-${index}`} />;
            }
            if (message.type === "assistant") {
              return <AssistantResultBubble key={`assistant-${index}`} message={message} />;
            }
            return null;
          })}

          {loading && streaming ? (
            <AssistantResultBubble activeStep={streaming.step} message={streaming} streaming />
          ) : null}
          <div ref={chatEndRef} />
        </div>

        <ErrorBanner message={error} />

        <form className="mt-5 flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row" onSubmit={handleSubmit}>
          <label className="sr-only" htmlFor="assistant-question">
            Ask an ERP question
          </label>
          <input
            className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-[#4b8b69]"
            id="assistant-question"
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask about products, buyers, suppliers, orders, or invoices..."
            value={input}
          />
          <button
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#102227] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#12323a] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading || !input.trim()}
            type="submit"
          >
            <SendHorizontal aria-hidden="true" size={16} />
            Ask
          </button>
        </form>
      </SurfaceCard>
    </div>
  );
}
