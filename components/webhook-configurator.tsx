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

export function WebhookConfigurator() {
  const [open, setOpen] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [url, setUrl] = useState('')
  const [name, setName] = useState('')
  const [secret, setSecret] = useState('')
  const [events, setEvents] = useState<Set<EventName | '*'>>(new Set(['*']))

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
            <button type="button" className="wc-btn wc-btn-secondary" disabled>
              Preview snippet
            </button>
            <button type="button" className="wc-btn wc-btn-primary" disabled>
              Send live request
            </button>
            <span className="wc-actions-hint">(actions hooked up in following commits)</span>
          </div>
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
      `}</style>
    </div>
  )
}

export default WebhookConfigurator
