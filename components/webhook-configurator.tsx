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
        <span className="wc-toggle-caret" aria-hidden>{open ? '▾' : '▸'}</span>
        <span>Configure interactively</span>
        <span className="wc-toggle-hint">fill in your values to preview the request, or send it live</span>
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
            <button type="button" className="wc-btn wc-btn-primary" disabled>
              Send live request
            </button>
            <span className="wc-actions-hint">live submit hooked up in next commit</span>
          </div>

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
          margin: 1.5rem 0;
          border: 1px solid var(--shiki-color-border, rgba(125, 125, 125, 0.3));
          border-radius: 8px;
          background: var(--wc-bg, transparent);
        }
        .wc-toggle {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          width: 100%;
          padding: 0.75rem 1rem;
          background: transparent;
          border: 0;
          font: inherit;
          color: inherit;
          cursor: pointer;
          text-align: left;
        }
        .wc-toggle-caret {
          font-size: 0.8rem;
          opacity: 0.7;
        }
        .wc-toggle-hint {
          margin-left: auto;
          font-size: 0.85rem;
          opacity: 0.6;
        }
        .wc-panel {
          padding: 0.5rem 1rem 1rem;
          border-top: 1px solid rgba(125, 125, 125, 0.2);
        }
        .wc-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.75rem 1rem;
          margin-bottom: 1rem;
        }
        @media (max-width: 640px) {
          .wc-grid { grid-template-columns: 1fr; }
        }
        .wc-field { display: flex; flex-direction: column; gap: 0.3rem; }
        .wc-label {
          font-size: 0.8rem;
          font-weight: 600;
          letter-spacing: 0.02em;
          opacity: 0.85;
        }
        .wc-optional { font-weight: 400; opacity: 0.6; }
        .wc-input {
          padding: 0.45rem 0.6rem;
          border: 1px solid rgba(125, 125, 125, 0.3);
          border-radius: 6px;
          background: transparent;
          color: inherit;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;
          font-size: 0.85rem;
        }
        .wc-input:focus {
          outline: 2px solid rgba(99, 102, 241, 0.4);
          outline-offset: -1px;
        }
        .wc-events {
          border: 1px solid rgba(125, 125, 125, 0.2);
          border-radius: 6px;
          padding: 0.6rem 0.8rem 0.4rem;
          margin: 0 0 1rem;
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.3rem 1rem;
        }
        @media (max-width: 640px) {
          .wc-events { grid-template-columns: 1fr; }
        }
        .wc-events legend {
          padding: 0 0.3rem;
        }
        .wc-event {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.85rem;
          cursor: pointer;
        }
        .wc-actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .wc-btn {
          padding: 0.45rem 0.9rem;
          border-radius: 6px;
          font: inherit;
          font-size: 0.85rem;
          cursor: pointer;
          border: 1px solid transparent;
        }
        .wc-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .wc-btn-secondary {
          background: transparent;
          border-color: rgba(125, 125, 125, 0.4);
          color: inherit;
        }
        .wc-btn-primary {
          background: rgb(99, 102, 241);
          color: white;
        }
        .wc-actions-hint { font-size: 0.8rem; opacity: 0.55; }
        .wc-btn-small { padding: 0.25rem 0.55rem; font-size: 0.75rem; }
        .wc-output {
          margin-top: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        .wc-output-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .wc-pre {
          margin: 0 0 0.5rem;
          padding: 0.7rem 0.9rem;
          background: rgba(125, 125, 125, 0.1);
          border: 1px solid rgba(125, 125, 125, 0.2);
          border-radius: 6px;
          overflow-x: auto;
          font-size: 0.8rem;
          line-height: 1.5;
        }
      `}</style>
    </div>
  )
}

export default WebhookConfigurator
