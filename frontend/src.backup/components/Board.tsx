import type { Member, Task, TaskStatus } from '../types';
import { STATUS_ORDER } from '../types';
import Column from './Column';

interface BoardProps {
  tasks: Task[];
  members: Member[];
  onDropTask: (taskId: string, status: TaskStatus) => void;
  onOpenTask: (task: Task) => void;
}

export default function Board({ tasks, members, onDropTask, onOpenTask }: BoardProps) {
  return (
    <div className="board">
      {STATUS_ORDER.map((status) => (
        <Column
          key={status}
          status={status}
          tasks={tasks.filter((t) => t.status === status)}
          members={members}
          onDropTask={onDropTask}
          onOpenTask={onOpenTask}
        />
      ))}
    </div>
  );
}
