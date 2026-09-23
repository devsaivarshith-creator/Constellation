import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, FileText, FileSpreadsheet, Image, CheckCircle2,
  XCircle, Loader, Folder
} from 'lucide-react';
import GlassCard from '../components/GlassCard';
import Panel3D from '../components/Panel3D';
import api from '../services/api';
import './IngestionPage.css';

export default function IngestionPage() {
  const [cases, setCases] = useState([]);
  const [caseId, setCaseId] = useState('');
  const [uploads, setUploads] = useState([]);
  const pdfRef = useRef(null);
  const csvRef = useRef(null);
  const mediaRef = useRef(null);

  useEffect(() => {
    api.listCases().then(setCases).catch(() => {});
  }, []);

  const handleUpload = async (file, type) => {
    if (!caseId) return;
    const id = Date.now().toString();
    setUploads(prev => [...prev, { id, name: file.name, type, status: 'uploading', result: null }]);

    try {
      let result;
      if (type === 'pdf') result = await api.uploadPdf(caseId, file);
      else if (type === 'csv') result = await api.uploadCsv(caseId, file);
      else result = await api.uploadMedia(caseId, file);

      setUploads(prev => prev.map(u => u.id === id ? { ...u, status: 'success', result } : u));
    } catch (err) {
      setUploads(prev => prev.map(u => u.id === id ? { ...u, status: 'error', result: err.message } : u));
    }
  };

  const onDrop = (e, type) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drop-active');
    const files = Array.from(e.dataTransfer.files);
    files.forEach(f => handleUpload(f, type));
  };

  const onDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('drop-active');
  };

  const onDragLeave = (e) => {
    e.currentTarget.classList.remove('drop-active');
  };

  const TYPE_ICONS = { pdf: FileText, csv: FileSpreadsheet, media: Image };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1><Upload size={24} style={{ verticalAlign: -4, marginRight: 8, color: 'var(--accent-emerald)' }} />Evidence Ingestion</h1>
        <p>Upload documents, call records, and media files to extract entities and evidence</p>
      </div>

      {/* Case Selector */}
      <div className="ingestion-case-select" style={{ marginBottom: 'var(--space-xl)' }}>
        <label className="input-label"><Folder size={12} style={{ marginRight: 4 }} /> Target Case *</label>
        <select
          className="input-field"
          value={caseId}
          onChange={e => setCaseId(e.target.value)}
          style={{ maxWidth: 400 }}
        >
          <option value="">Select a case...</option>
          {cases.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
      </div>

      {/* Upload Zones */}
      <div className="upload-zones">
        {[
          { type: 'pdf', title: 'PDF Documents', desc: 'Upload PDFs for NER extraction. Entities and evidence are auto-committed.', accept: '.pdf', icon: FileText, color: 'cyan' },
          { type: 'csv', title: 'CSV Call Records', desc: 'Upload tabular call/communication logs for relationship mapping.', accept: '.csv', icon: FileSpreadsheet, color: 'amber' },
          { type: 'media', title: 'Media Files', desc: 'Upload photos, videos, or audio files as evidence items.', accept: 'image/*,video/*,audio/*', icon: Image, color: 'violet' },
        ].map(zone => (
          <Panel3D key={zone.type} glow="white" maxAngle={5} className="upload-zone-panel3d">
            <div
              className={`upload-zone upload-zone-${zone.color}`}
              onDrop={e => onDrop(e, zone.type)}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onClick={() => {
                if (!caseId) return;
                const refs = { pdf: pdfRef, csv: csvRef, media: mediaRef };
                refs[zone.type].current?.click();
              }}
            >
              <zone.icon size={36} className="upload-zone-icon" />
              <h3>{zone.title}</h3>
              <p>{zone.desc}</p>
              <span className="text-small text-mono" style={{ opacity: 0.6 }}>Accepts {zone.accept}</span>
              <input
                ref={zone.type === 'pdf' ? pdfRef : zone.type === 'csv' ? csvRef : mediaRef}
                type="file"
                accept={zone.accept}
                style={{ display: 'none' }}
                onChange={e => {
                  if (e.target.files[0]) handleUpload(e.target.files[0], zone.type);
                  e.target.value = '';
                }}
              />
            </div>
          </Panel3D>
        ))}
      </div>

      {/* Upload Results */}
      {uploads.length > 0 && (
        <div className="upload-results">
          <h2 style={{ marginBottom: 'var(--space-md)', fontSize: '1.125rem', fontWeight: 600 }}>Upload History</h2>
          <AnimatePresence>
            {uploads.slice().reverse().map(u => {
              const Icon = TYPE_ICONS[u.type] || FileText;
              return (
                <motion.div
                  key={u.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="upload-result-item"
                >
                  <Icon size={18} className="upload-result-icon" />
                  <div className="upload-result-info">
                    <span className="upload-result-name">{u.name}</span>
                    {u.status === 'success' && u.result && (
                      <span className="text-small" style={{ color: 'var(--accent-emerald)' }}>
                        {u.result.entities_created != null ? `${u.result.entities_created} entities extracted` : 'Uploaded successfully'}
                      </span>
                    )}
                    {u.status === 'error' && (
                      <span className="text-small" style={{ color: 'var(--accent-rose)' }}>{u.result}</span>
                    )}
                  </div>
                  <div className="upload-result-status">
                    {u.status === 'uploading' && <Loader size={16} className="animate-spin" style={{ color: 'var(--accent-cyan)' }} />}
                    {u.status === 'success' && <CheckCircle2 size={16} style={{ color: 'var(--accent-emerald)' }} />}
                    {u.status === 'error' && <XCircle size={16} style={{ color: 'var(--accent-rose)' }} />}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
