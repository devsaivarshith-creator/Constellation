const STATUS_CONFIG = {
  active:       { label: 'Active',       variant: 'cyan' },
  archived:     { label: 'Archived',     variant: 'muted' },
  closed:       { label: 'Closed',       variant: 'muted' },
  pending_approval: { label: 'Pending',  variant: 'amber' },
  verified:     { label: 'Verified',     variant: 'emerald' },
  confirmed:    { label: 'Confirmed',    variant: 'emerald' },
  unverified:   { label: 'Unverified',   variant: 'amber' },
  under_review: { label: 'Under Review', variant: 'violet' },
  rejected:     { label: 'Rejected',     variant: 'rose' },
  discarded:    { label: 'Discarded',    variant: 'rose' },
  pending:      { label: 'Pending',      variant: 'amber' },
  healthy:      { label: 'Healthy',      variant: 'emerald' },
  error:        { label: 'Error',        variant: 'rose' },
  completed:    { label: 'Completed',    variant: 'emerald' },
  running:      { label: 'Running',      variant: 'cyan' },
};

export default function StatusBadge({ status, label, size = 'md' }) {
  const config = STATUS_CONFIG[status] || { label: status, variant: 'muted' };
  const displayLabel = label || config.label;

  return (
    <span className={`badge badge-${config.variant} ${size === 'sm' ? 'badge-sm' : ''}`}>
      <span style={{
        width: 6,
        height: 6,
        borderRadius: '50%',
        backgroundColor: 'currentColor',
        display: 'inline-block',
        opacity: 0.8,
      }} />
      {displayLabel}
    </span>
  );
}
