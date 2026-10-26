function StatusBadge({ status, label }) {
  return <span className={`status status--${status}`}>{label}</span>;
}

export default StatusBadge;
