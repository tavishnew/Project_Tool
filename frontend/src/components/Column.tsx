import { useState } from 'react';
import type { Member, Task, TaskStatus } from '../types';
import { STATUS_LABELS } from '../types';
import { STATUS_COLOR } from '../status';
import TaskCard from './TaskCard';

interface ColumnProps {
  status: TaskStatus;
  tasks: Task[];
  members: Member[];
  onDropTask: (taskId: string, status: TaskStatus) => void;
  onOpenTask: (task: Task) => void;
}

export default function Column({ status, tasks, members, onDropTask, onOpenTask }: ColumnProps) {
  const [over, setOver] = useState(false);
  const color = STATUS_COLOR[status];
  const memberOf = (id: string | null) => members.find((m) => m.id === id) ?? null;

  return (
    <div
      className={`column ${over ? 'drag-over' : ''}`}
      style={{ ['--col' as string]: color }}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (!over) setOver(true);
      }}
      onDragLeave={(e) => {
        if (e.currentTarget.contains(e.relatedTarget as Node)) return;
        setOver(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        const id = e.dataTransfer.getData('text/plain');
        if (id) onDropTask(id, status);
      }}
    >
      <div className="column-head">
        <span className="column-title">{STATUS_LABELS[status]}</span>
        <span className="column-count">{tasks.length}</span>
      </div>
      <div className="column-body">
        {tasks.map((t) => (
          <TaskCard key={t.id} task={t} assignee={memberOf(t.assignee_id)} onClick={() => onOpenTask(t)} />
        ))}
        {tasks.length === 0 && <div className="empty-state" style={{ padding: 18 }}>Drop tasks here</div>}
      </div>
    </div>
  );
}
