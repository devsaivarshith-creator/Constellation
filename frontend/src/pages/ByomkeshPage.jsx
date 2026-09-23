import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Send, Sparkles, Clock, Hash, ChevronDown, ChevronUp,
  Link2, FileText, ExternalLink, Loader
} from 'lucide-react';
import GlassCard from '../components/GlassCard';
import Panel3D from '../components/Panel3D';
import ConfidenceBar from '../components/ConfidenceBar';
import api from '../services/api';
import './ByomkeshPage.css';

export default function ByomkeshPage() {
  const [question, setQuestion] = useState('');
  const [caseId, setCaseId] = useState('');
  const [cases, setCases] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    api.listCases().then(setCases).catch(() => {});
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversations]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim() || loading) return;

    const q = question.trim();
    setQuestion('');
    setConversations(prev => [...prev, { type: 'question', text: q }]);
    setLoading(true);

    try {
      const res = await api.queryByomkesh(q, caseId || null);
      setConversations(prev => [...prev, { type: 'answer', data: res }]);
    } catch (err) {
      setConversations(prev => [...prev, { type: 'error', text: err.message }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container byomkesh-page">
      <div className="page-header">
        <h1><Brain size={24} style={{ verticalAlign: -4, marginRight: 8, color: 'var(--accent-cyan)' }} />Byomkesh AI</h1>
        <p>Query the investigative AI agent — all answers include mandatory citations from the evidence graph</p>
      </div>

      {/* Case Selector */}
      <div className="byomkesh-controls">
        <select
          className="input-field"
          value={caseId}
          onChange={e => setCaseId(e.target.value)}
          style={{ maxWidth: 300 }}
        >
          <option value="">All Cases (Global Query)</option>
          {cases.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
      </div>

      {/* Chat Area */}
      <div className="byomkesh-chat" ref={scrollRef}>
        {conversations.length === 0 && (
          <Panel3D maxAngle={4} glow="white" className="byomkesh-welcome-panel3d">
            <div className="byomkesh-welcome">
              <div className="byomkesh-avatar-lg">
                <Brain size={40} />
              </div>
              <h2>Byomkesh Intelligence Engine</h2>
              <p>Ask questions about your investigations. All responses include strict evidence citations.</p>
              <div className="byomkesh-suggestions">
                {[
                  'Who are the key persons of interest?',
                  'What financial transactions exceed $100,000?',
                  'Are there any contradictions in the evidence?',
                  'Summarize cross-case connections'
                ].map(s => (
                  <button
                    key={s}
                    className="suggestion-chip"
                    onClick={() => setQuestion(s)}
                  >
                    <Sparkles size={12} /> {s}
                  </button>
                ))}
              </div>
            </div>
          </Panel3D>
        )}

        <AnimatePresence>
          {conversations.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`chat-message chat-${msg.type}`}
            >
              {msg.type === 'question' && (
                <div className="chat-bubble chat-user">
                  <p>{msg.text}</p>
                </div>
              )}

              {msg.type === 'answer' && (
                <Panel3D maxAngle={3} glow="white" className="byomkesh-ai-panel3d">
                  <div className="chat-bubble chat-ai">
                    <div className="ai-header">
                      <Brain size={16} className="ai-icon" />
                      <span>Byomkesh</span>
                      <ConfidenceBar value={msg.data.confidence} size="sm" />
                    </div>
                    <div className="ai-answer">{msg.data.answer}</div>

                    {/* Citations */}
                    {msg.data.citations?.length > 0 && (
                      <CitationList citations={msg.data.citations} />
                    )}

                    {/* Cypher Queries */}
                    {msg.data.cypher_queries_used?.length > 0 && (
                      <CypherQueries queries={msg.data.cypher_queries_used} />
                    )}

                    <div className="ai-footer">
                      <span className="text-caption"><Clock size={10} /> {msg.data.execution_time_ms ? `${Math.round(msg.data.execution_time_ms)}ms` : '—'}</span>
                      <span className="text-caption"><Hash size={10} /> {msg.data.query_id}</span>
                    </div>
                  </div>
                </Panel3D>
              )}

              {msg.type === 'error' && (
                <div className="chat-bubble chat-error">
                  <p>⚠ {msg.text}</p>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <div className="chat-message chat-loading">
            <div className="chat-bubble chat-ai">
              <div className="ai-thinking">
                <Loader size={16} className="animate-spin" />
                <span>Byomkesh is analyzing the evidence graph…</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <Panel3D maxAngle={2} glow="white" className="byomkesh-input-panel3d">
        <form className="byomkesh-input-bar" onSubmit={handleSubmit}>
          <input
            className="input-field byomkesh-input"
            placeholder="Ask Byomkesh a question..."
            value={question}
            onChange={e => setQuestion(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            className="btn btn-primary byomkesh-send"
            disabled={!question.trim() || loading}
          >
            <Send size={18} />
          </button>
        </form>
      </Panel3D>
    </div>
  );
}

function CitationList({ citations }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="citations-section">
      <button className="citations-toggle" onClick={() => setExpanded(!expanded)}>
        <Link2 size={12} />
        <span>{citations.length} Citation{citations.length > 1 ? 's' : ''}</span>
        {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="citations-list"
          >
            {citations.map((cit, i) => (
              <div key={cit.citation_id} className="citation-item">
                <span className="citation-marker">[{i + 1}]</span>
                <div className="citation-body">
                  <span className="badge badge-cyan" style={{ marginRight: 6, fontSize: '0.6rem' }}>{cit.target_type}</span>
                  <span className="citation-label">{cit.label_or_type}</span>
                  <p className="citation-summary">{cit.summary}</p>
                  {cit.confidence != null && (
                    <ConfidenceBar value={cit.confidence} size="sm" showLabel />
                  )}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CypherQueries({ queries }) {
  const [show, setShow] = useState(false);
  return (
    <div className="cypher-section">
      <button className="citations-toggle" onClick={() => setShow(!show)}>
        <FileText size={12} />
        <span>Cypher Queries ({queries.length})</span>
        {show ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>
      {show && (
        <div className="cypher-list">
          {queries.map((q, i) => (
            <pre key={i} className="cypher-block">{q}</pre>
          ))}
        </div>
      )}
    </div>
  );
}
