import React, { useState } from 'react'

const ALL_EVENTS = [
  'message.queued',
  'message.sent',
  'message.delivered',
  'message.read',
  'message.failed',
  'message.inbound',
  'message.reaction',
  'typing.indicator',
] as const

type EventName = (typeof ALL_EVENTS)[number]

type SnippetPreview = {
  body: Record<string, unknown>
  curl: string
  json: string
}

function buildSnippet(args: {
  apiKey: string
  url: string
  name: string
  secret: string
  events: string[]
}): SnippetPreview {
  const body: Record<string, unknown> = {
    url: args.url || 'https://your-server.com/webhooks/textbubbles',
    events: args.events.length > 0 ? args.events : ['*'],
  }
  if (args.name) body.name = args.name
  if (args.secret) body.secret = args.secret

  const json = JSON.stringify(body, null, 2)
  const authValue = args.apiKey || 'YOUR_API_KEY'
  const curl = [
    `curl -X POST https://api.textbubbles.com/v1/webhooks \\`,
    `  -H "Authorization: Bearer ${authValue}" \\`,
    `  -H "Content-Type: application/json" \\`,
    `  -d '${json}'`,
  ].join('\n')

  return { body, curl, json }
}

export function WebhookConfigurator() {
  const [open, setOpen] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [url, setUrl] = useState('')
  const [name, setName] = useState('')
  const [secret, setSecret] = useState('')
  const [events, setEvents] = useState<Set<EventName | '*'>>(new Set(['*']))
  const [preview, setPreview] = useState<SnippetPreview | null>(null)
  const [copied, setCopied] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [response, setResponse] = useState<
    | { kind: 'success'; status: number; body: string }
    | { kind: 'error'; status: number | null; body: string; message: string }
    | null
  >(null)

  function validateForLive(): string | null {
    if (!apiKey.trim()) return 'API key is required to send a live request.'
    if (!url.trim()) return 'Webhook URL is required.'
    try {
      const u = new URL(url)
      if (u.protocol !== 'https:') return 'Webhook URL must use https://.'
    } catch {
      return 'Webhook URL is not a valid URL.'
    }
    if (events.size === 0) return 'Select at least one event (or use the * wildcard).'
    return null
  }

  async function sendLive() {
    const validationError = validateForLive()
    if (validationError) {
      setResponse({ kind: 'error', status: null, body: '', message: validationError })
      return
    }
    const snippet = buildSnippet({
      apiKey,
      url,
      name,
      secret,
      events: Array.from(events),
    })
    setPreview(snippet)
    setSubmitting(true)
    setResponse(null)
    try {
      const res = await fetch('https://api.textbubbles.com/v1/webhooks', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(snippet.body),
      })
      const text = await res.text()
      let pretty = text
      try {
        pretty = JSON.stringify(JSON.parse(text), null, 2)
      } catch { /* leave as-is */ }
      if (res.ok) {
        setResponse({ kind: 'success', status: res.status, body: pretty })
      } else {
        setResponse({
          kind: 'error',
          status: res.status,
          body: pretty,
          message: `Request failed with HTTP ${res.status}.`,
        })
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setResponse({
        kind: 'error',
        status: null,
        body: '',
        message: `Network error: ${message}. (If this is a CORS error, run the curl snippet from your terminal instead.)`,
      })
    } finally {
      setSubmitting(false)
    }
  }

  function toggleEvent(ev: EventName | '*') {
    setEvents(prev => {
      const next = new Set(prev)
      if (ev === '*') {
        return next.has('*') ? new Set<EventName | '*'>() : new Set<EventName | '*'>(['*'])
      }
      next.delete('*')
      if (next.has(ev)) next.delete(ev)
      else next.add(ev)
      return next
    })
  }

  return (
    <div className="wc-root">
      <button
        type="button"
        className="wc-toggle"
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
      >
        <span
          className="wc-toggle-caret"
          aria-hidden
          style={{ transform: open ? 'rotate(90deg)' : 'rotate(0deg)' }}
        >▸</span>
        <span>Configure interactively</span>
        <span className="wc-toggle-hint">preview the request, or send it live</span>
      </button>

      {open && (
        <div className="wc-panel">
          <div className="wc-grid">
            <label className="wc-field">
              <span className="wc-label">API key</span>
              <input
                type="password"
                autoComplete="off"
                spellCheck={false}
                placeholder="sk_live_..."
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                className="wc-input"
              />
            </label>

            <label className="wc-field">
              <span className="wc-label">Webhook URL</span>
              <input
                type="url"
                autoComplete="off"
                spellCheck={false}
                placeholder="https://your-server.com/webhooks/textbubbles"
                value={url}
                onChange={e => setUrl(e.target.value)}
                className="wc-input"
              />
            </label>

            <label className="wc-field">
              <span className="wc-label">Name <span className="wc-optional">(optional)</span></span>
              <input
                type="text"
                autoComplete="off"
                placeholder="Billing Events"
                value={name}
                onChange={e => setName(e.target.value)}
                className="wc-input"
              />
            </label>

            <label className="wc-field">
              <span className="wc-label">Secret <span className="wc-optional">(optional)</span></span>
              <input
                type="password"
                autoComplete="off"
                spellCheck={false}
                placeholder="whsec_... (leave blank to generate)"
                value={secret}
                onChange={e => setSecret(e.target.value)}
                className="wc-input"
              />
            </label>
          </div>

          <fieldset className="wc-events">
            <legend className="wc-label">Events</legend>
            <label className="wc-event">
              <input
                type="checkbox"
                checked={events.has('*')}
                onChange={() => toggleEvent('*')}
              />
              <code>*</code> <span className="wc-optional">subscribe to every current and future event</span>
            </label>
            {ALL_EVENTS.map(ev => (
              <label key={ev} className="wc-event">
                <input
                  type="checkbox"
                  checked={events.has(ev)}
                  onChange={() => toggleEvent(ev)}
                  disabled={events.has('*')}
                />
                <code>{ev}</code>
              </label>
            ))}
          </fieldset>

          <div className="wc-actions">
            <button
              type="button"
              className="wc-btn wc-btn-secondary"
              onClick={() => {
                setPreview(buildSnippet({
                  apiKey,
                  url,
                  name,
                  secret,
                  events: Array.from(events),
                }))
                setCopied(false)
              }}
            >
              Preview snippet
            </button>
            <button
              type="button"
              className="wc-btn wc-btn-primary"
              onClick={sendLive}
              disabled={submitting}
            >
              {submitting ? 'Sending…' : 'Send live request'}
            </button>
            <span className="wc-actions-hint">
              live submit POSTs to <code>api.textbubbles.com</code> from your browser
            </span>
          </div>

          {response && (
            <div
              className={
                response.kind === 'success' ? 'wc-resp wc-resp-ok' : 'wc-resp wc-resp-err'
              }
              role={response.kind === 'error' ? 'alert' : undefined}
            >
              <div className="wc-resp-head">
                {response.kind === 'success'
                  ? `HTTP ${response.status} — webhook registered`
                  : response.status
                    ? `HTTP ${response.status} — ${response.message}`
                    : response.message}
              </div>
              {response.body && (
                <pre className="wc-pre"><code>{response.body}</code></pre>
              )}
              {response.kind === 'success' && (
                <p className="wc-resp-hint">
                  If a <code>secret</code> field is present above, copy it now — it cannot be
                  retrieved later.
                </p>
              )}
            </div>
          )}

          {preview && (
            <div className="wc-output">
              <div className="wc-output-head">
                <span className="wc-label">curl</span>
                <button
                  type="button"
                  className="wc-btn wc-btn-secondary wc-btn-small"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(preview.curl)
                      setCopied(true)
                      setTimeout(() => setCopied(false), 1500)
                    } catch {
                      /* clipboard not available — user can still select-copy */
                    }
                  }}
                >
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="wc-pre"><code>{preview.curl}</code></pre>
              <span className="wc-label">Request body</span>
              <pre className="wc-pre"><code>{preview.json}</code></pre>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .wc-root {
          --wc-primary: hsl(var(--nextra-primary-hue, 211) var(--nextra-primary-saturation, 100%) 50%);
          --wc-primary-fg: white;
          --wc-border: rgba(125, 125, 125, 0.25);
          --wc-border-strong: rgba(125, 125, 125, 0.4);
          --wc-surface: rgba(125, 125, 125, 0.06);
          --wc-surface-strong: rgba(125, 125, 125, 0.1);
          margin: 1.75rem 0;
          border: 1px solid var(--wc-border);
          border-radius: 10px;
          background: var(--wc-surface);
          overflow: hidden;
        }
        .wc-toggle {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          width: 100%;
          padding: 0.85rem 1.1rem;
          background: transparent;
          border: 0;
          font: inherit;
          font-weight: 600;
          color: inherit;
          cursor: pointer;
          text-align: left;
          transition: background 120ms ease;
        }
        .wc-toggle:hover { background: var(--wc-surface-strong); }
        .wc-toggle:focus-visible {
          outline: 2px solid var(--wc-primary);
          outline-offset: -2px;
        }
        .wc-toggle-caret {
          font-size: 0.75rem;
          opacity: 0.7;
          transition: transform 120ms ease;
          display: inline-block;
          width: 0.9rem;
        }
        .wc-toggle-hint {
          margin-left: auto;
          font-size: 0.8rem;
          font-weight: 400;
          opacity: 0.6;
        }
        @media (max-width: 540px) {
          .wc-toggle-hint { display: none; }
        }
        .wc-panel {
          padding: 1rem 1.1rem 1.1rem;
          border-top: 1px solid var(--wc-border);
          background: transparent;
        }
        .wc-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.85rem 1rem;
          margin-bottom: 1rem;
        }
        @media (max-width: 640px) {
          .wc-grid { grid-template-columns: 1fr; }
        }
        .wc-field { display: flex; flex-direction: column; gap: 0.35rem; }
        .wc-label {
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          opacity: 0.75;
        }
        .wc-optional { font-weight: 400; text-transform: none; letter-spacing: 0; opacity: 0.7; }
        .wc-input {
          padding: 0.5rem 0.65rem;
          border: 1px solid var(--wc-border-strong);
          border-radius: 6px;
          background: var(--wc-surface);
          color: inherit;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;
          font-size: 0.85rem;
          transition: border-color 120ms ease, box-shadow 120ms ease;
        }
        .wc-input::placeholder { opacity: 0.45; }
        .wc-input:focus {
          outline: none;
          border-color: var(--wc-primary);
          box-shadow: 0 0 0 3px hsl(var(--nextra-primary-hue, 211) var(--nextra-primary-saturation, 100%) 50% / 0.18);
        }
        .wc-events {
          border: 1px solid var(--wc-border);
          border-radius: 6px;
          padding: 0.7rem 0.9rem 0.55rem;
          margin: 0 0 1.1rem;
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.4rem 1rem;
          background: var(--wc-surface);
        }
        @media (max-width: 640px) {
          .wc-events { grid-template-columns: 1fr; }
        }
        .wc-events legend {
          padding: 0 0.4rem;
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          opacity: 0.75;
        }
        .wc-event {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          font-size: 0.85rem;
          cursor: pointer;
        }
        .wc-event input[type="checkbox"] { accent-color: var(--wc-primary); }
        .wc-event input:disabled + code { opacity: 0.45; }
        .wc-actions {
          display: flex;
          align-items: center;
          gap: 0.55rem;
          flex-wrap: wrap;
        }
        .wc-btn {
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font: inherit;
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          border: 1px solid transparent;
          transition: background 120ms ease, border-color 120ms ease, transform 80ms ease;
        }
        .wc-btn:active { transform: translateY(1px); }
        .wc-btn:focus-visible {
          outline: 2px solid var(--wc-primary);
          outline-offset: 2px;
        }
        .wc-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
        .wc-btn-secondary {
          background: transparent;
          border-color: var(--wc-border-strong);
          color: inherit;
        }
        .wc-btn-secondary:hover:not(:disabled) {
          background: var(--wc-surface-strong);
          border-color: var(--wc-primary);
        }
        .wc-btn-primary {
          background: var(--wc-primary);
          color: var(--wc-primary-fg);
        }
        .wc-btn-primary:hover:not(:disabled) {
          filter: brightness(1.08);
        }
        .wc-actions-hint { font-size: 0.78rem; opacity: 0.6; }
        .wc-actions-hint code {
          font-size: 0.78rem;
          padding: 0.05rem 0.3rem;
          background: var(--wc-surface-strong);
          border-radius: 3px;
        }
        .wc-btn-small { padding: 0.3rem 0.6rem; font-size: 0.75rem; }
        .wc-output {
          margin-top: 1.1rem;
          padding-top: 0.9rem;
          border-top: 1px dashed var(--wc-border);
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
        }
        .wc-output-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .wc-pre {
          margin: 0 0 0.6rem;
          padding: 0.8rem 1rem;
          background: var(--wc-surface-strong);
          border: 1px solid var(--wc-border);
          border-radius: 6px;
          overflow-x: auto;
          font-size: 0.8rem;
          line-height: 1.55;
        }
        .wc-resp {
          margin-top: 1.1rem;
          padding: 0.85rem 1rem;
          border: 1px solid;
          border-radius: 6px;
        }
        .wc-resp-ok {
          border-color: rgba(34, 197, 94, 0.45);
          background: rgba(34, 197, 94, 0.08);
        }
        .wc-resp-err {
          border-color: rgba(239, 68, 68, 0.45);
          background: rgba(239, 68, 68, 0.08);
        }
        .wc-resp-head {
          font-weight: 600;
          font-size: 0.85rem;
          margin-bottom: 0.55rem;
        }
        .wc-resp-hint { font-size: 0.8rem; opacity: 0.75; margin: 0.35rem 0 0; }
      `}</style>
    </div>
  )
}

export default WebhookConfigurator
