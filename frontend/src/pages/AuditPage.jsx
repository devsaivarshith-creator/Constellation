import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck, ShieldAlert, RefreshCw, Hash, Clock, User,
  Target, Loader, CheckCircle2, XOctagon, Link2
} from 'lucide-react';
import GlassCard from '../components/GlassCard';
import api from '../services/api';
import './AuditPage.css';

export default function AuditPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifyResult, setVerifyResult] = useState(null);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => { loadAudit(); }, []);

  const loadAudit = async () => {
    setLoading(true);
    try {
      const data = await api.getRecentAudit(100);
      setEvents(data);
    } catch { /* empty */ }
    finally { setLoading(false); }
  };

  const handleVerify = async () => {
    setVerifying(true);
    try {
      const res = await api.verifyAuditLedger();
      setVerifyResult(res);
    } catch (err) {
      setVerifyResult({ verified: false, error: err.message });
    } finally {
      setVerifying(false);
    }
  };

  const EVENT_ICONS = {
    node_created: <Target size={14} />,
    edge_created: <Link2 size={14} />,
    entity_merged: <CheckCircle2 size={14} />,
    match_rejected: <XOctagon size={14} />,
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1><ShieldCheck size={24} style={{ verticalAlign: -4, marginRight: 8, color: 'var(--accent-emerald)' }} />Cryptographic Audit Ledger</h1>
            <p>Tamper-evident HMAC-SHA256 hash chain — verifiable write audit log</p>
          </div>
          <button className="btn btn-primary" onClick={handleVerify} disabled={verifying}>
            {verifying ? <Loader size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
            Verify Chain Integrity
          </button>
        </div>
      </div>

      {/* Verification Result */}
      {verifyResult && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="verify-banner-wrapper"
        >
          <GlassCard
            className={`verify-banner ${verifyResult.verified ? 'verify-success' : 'verify-fail'}`}
            hover={false}
          >
            {verifyResult.verified ? (
              <>
                <CheckCircle2 size={28} />
                <div>
                  <h3>Chain Integrity Verified ✓</h3>
                  <p>All {verifyResult.total_records || events.length} records are cryptographically consistent. No tampering detected.</p>
                </div>
              </>
            ) : (
              <>
                <ShieldAlert size={28} />
                <div>
                  <h3>INTEGRITY VIOLATION DETECTED</h3>
                  <p>{verifyResult.error || 'Hash chain discontinuity found — potential tampering or data corruption.'}</p>
                </div>
              </>
            )}
          </GlassCard>
        </motion.div>
      )}

      {/* Events Table */}
      {loading ? (
        <div className="skeleton" style={{ height: 400 }} />
      ) : events.length === 0 ? (
        <div className="empty-state">
          <ShieldCheck size={64} />
          <h3>No audit events</h3>
          <p>Actions will be recorded here as entities, relationships, and evidence are created.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="data-table audit-table">
            <thead>
              <tr>
                <th>Seq #</th>
                <th>Event Type</th>
                <th>Actor</th>
                <th>Target</th>
                <th>Payload Hash</th>
                <th>HMAC</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {events.map((ev, idx) => (
                <motion.tr
                  key={ev.sequence_number}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.02 }}
                >
                  <td>
                    <span className="audit-seq">{ev.sequence_number}</span>
                  </td>
                  <td>
                    <span className="audit-event-type">
                      {EVENT_ICONS[ev.event_type] || <Hash size={14} />}
                      <span>{(ev.event_type || '').replace(/_/g, ' ')}</span>
                    </span>
                  </td>
                  <td>
                    <span className="audit-actor">
                      <User size={12} />
                      {ev.actor_id || '—'}
                    </span>
                  </td>
                  <td>
                    <code className="audit-hash-short">{ev.target_id?.slice(0, 24) || '—'}</code>
                  </td>
                  <td>
                    <code className="audit-hash">{ev.payload_hash?.slice(0, 16)}…</code>
                  </td>
                  <td>
                    <code className="audit-hmac">{ev.hmac?.slice(0, 16)}…</code>
                  </td>
                  <td>
                    <span className="audit-time">
                      <Clock size={12} />
                      {ev.timestamp ? new Date(ev.timestamp).toLocaleString() : '—'}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
