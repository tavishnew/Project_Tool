export function SkeletonCard() {
  return (
    <div className="sk-card">
      <div className="skeleton sk-line" style={{ width: '60%' }} />
      <div className="skeleton sk-line" style={{ width: '90%' }} />
      <div className="skeleton sk-line" style={{ width: '40%' }} />
    </div>
  );
}

export function SkeletonTask() {
  return (
    <div className="task-card" style={{ cursor: 'default' }}>
      <div className="skeleton sk-line" style={{ width: '80%' }} />
      <div className="skeleton sk-line" style={{ width: '50%', height: 10 }} />
    </div>
  );
}
