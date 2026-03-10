"use client";

import { useEffect, useRef, useState } from "react";

const QUICK_PROMPTS = [
  "Draft a launch email for a new AI feature.",
  "Summarize the last 3 customer calls into action items.",
  "Write a concise product update for the team.",
];

const INITIAL_MESSAGES = [
  {
    role: "assistant",
    content:
      "Welcome to VantaGPT. Ask anything, or try a prompt to see the tone and speed.",
  },
];

export default function Home() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const listRef = useRef(null);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, isSending]);

  const handleSend = async (promptOverride) => {
    const prompt = (promptOverride ?? input).trim();
    if (!prompt || isSending) return;

    const nextMessages = [...messages, { role: "user", content: prompt }];
    setMessages(nextMessages);
    setInput("");
    setIsSending(true);
    setError("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Unable to reach the model.");
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.text || "(No response)" },
      ]);
    } catch (err) {
      setError(err.message);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I ran into a hiccup reaching the model. Check the server logs and try again.",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <div className="glow one" />
      <div className="glow two" />
      <div className="glow three" />

      <header className="nav">
        <div className="container nav-inner">
          <div className="brand">
            <span />
            VantaGPT
          </div>
          <nav className="nav-links">
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="#security">Security</a>
          </nav>
          <div className="nav-cta">
            <button className="btn ghost" type="button">
              Log in
            </button>
            <button className="btn primary" type="button">
              Start free
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="container hero">
          <div>
            <h1 className="hero-title">
              The <span>GPT-grade</span> workspace for teams that move fast.
            </h1>
            <p className="hero-copy">
              Launch a premium AI assistant experience on open-source Hugging Face
              models. Secure by default, fast at scale, and beautiful on every
              screen.
            </p>
            <div className="hero-stats">
              <div className="stat">
                <strong>99.9%</strong>
                <span>Uptime SLA target</span>
              </div>
              <div className="stat">
                <strong>38%</strong>
                <span>Faster support resolution</span>
              </div>
              <div className="stat">
                <strong>3x</strong>
                <span>Knowledge retrieval lift</span>
              </div>
            </div>
          </div>

          <aside className="chat-panel">
            <div className="chat-header">
              <h3>Live model preview</h3>
              <span className="badge">Open-source</span>
            </div>

            <div className="chat-body" ref={listRef}>
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`message ${message.role}`}
                >
                  <div className="avatar">
                    {message.role === "assistant" ? "AI" : "ME"}
                  </div>
                  <div className="bubble">{message.content}</div>
                </div>
              ))}
              {isSending && (
                <div className="message assistant">
                  <div className="avatar">AI</div>
                  <div className="bubble">Thinking…</div>
                </div>
              )}
            </div>

            <div className="chat-input">
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask VantaGPT to draft, summarize, or ideate…"
                rows={2}
              />
              <button
                type="button"
                onClick={() => handleSend()}
                disabled={isSending}
              >
                {isSending ? "Sending" : "Send"}
              </button>
            </div>

            <div className="chat-suggestions">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  className="btn ghost"
                  onClick={() => handleSend(prompt)}
                >
                  {prompt}
                </button>
              ))}
              {error && <p className="error">{error}</p>}
            </div>
          </aside>
        </section>

        <section id="features" className="container features">
          <h2 className="section-title">Built for AI-first SaaS teams</h2>
          <div className="feature-grid">
            <div className="feature-card">
              <h4>Conversation memory</h4>
              <p>
                Keep context across tickets, briefs, and workflows with
                configurable memory windows.
              </p>
            </div>
            <div className="feature-card">
              <h4>Admin controls</h4>
              <p>
                Manage workspaces, enforce prompt policies, and audit usage from
                a single console.
              </p>
            </div>
            <div className="feature-card">
              <h4>Lightning fast</h4>
              <p>
                Hugging Face serverless inference keeps latency low while you
                scale globally.
              </p>
            </div>
            <div className="feature-card">
              <h4>Insightful analytics</h4>
              <p>
                Track time saved, most-used prompts, and conversion lift in one
                place.
              </p>
            </div>
          </div>
        </section>

        <section id="pricing" className="container pricing">
          <h2 className="section-title">Pricing for every stage</h2>
          <div className="pricing-grid">
            <div className="price-card">
              <h4>Launch</h4>
              <strong>$0</strong>
              <p>Ideal for pilots and MVPs with the free Hugging Face tier.</p>
              <button className="btn ghost" type="button">
                Start for free
              </button>
            </div>
            <div className="price-card">
              <h4>Growth</h4>
              <strong>$99</strong>
              <p>Priority inference, team routing, and usage analytics.</p>
              <button className="btn primary" type="button">
                Scale up
              </button>
            </div>
            <div className="price-card">
              <h4>Enterprise</h4>
              <strong>Custom</strong>
              <p>Private deployments, SSO, and dedicated success support.</p>
              <button className="btn ghost" type="button">
                Talk to sales
              </button>
            </div>
          </div>
        </section>

        <section id="security" className="container features">
          <h2 className="section-title">Trusted security posture</h2>
          <div className="feature-grid">
            <div className="feature-card">
              <h4>Scoped API keys</h4>
              <p>Keep your Hugging Face token server-side with audited access.</p>
            </div>
            <div className="feature-card">
              <h4>Compliance ready</h4>
              <p>Designs for SOC 2 workflows, DPA templates, and data retention.</p>
            </div>
            <div className="feature-card">
              <h4>Observability</h4>
              <p>Centralized logs and rate monitoring for every request.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="container">
        <p>
          Built with Next.js, Hugging Face Inference API, and open-source LLMs.
          Ready for Vercel deployment.
        </p>
      </footer>
    </>
  );
}
