import React from "react";
import { Draggable } from "@hello-pangea/dnd";
import { Clock } from "lucide-react";
import { Task } from "./types";

interface TaskCardProps {
  task: Task;
  index: number;
}

const statusStyles: Record<string, { bg: string, borderLeft: string, text: string, iconColor: string }> = {
  "todo": { bg: 'bg-[#F2F4FD]', borderLeft: 'border-l-[#5C55D9]', text: 'text-[#3E438B]', iconColor: 'text-[#5C55D9]' },
  "in-progress": { bg: 'bg-[#FDF4E7]', borderLeft: 'border-l-[#F9A826]', text: 'text-[#B07C1F]', iconColor: 'text-[#F9A826]' },
  "done": { bg: 'bg-[#E3F8F5]', borderLeft: 'border-l-[#02B895]', text: 'text-[#01886D]', iconColor: 'text-[#02B895]' },
};

export default function TaskCard({ task, index }: TaskCardProps) {
  const style = statusStyles[task.status] || statusStyles["todo"];

  return (
    <Draggable draggableId={task.id.toString()} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`
            mb-4 p-4 rounded-xl shadow-sm border border-transparent border-l-4
            ${style.bg} ${style.borderLeft}
            transition-all duration-200
            ${snapshot.isDragging ? 'shadow-xl scale-[1.02] rotate-2 ring-2 ring-indigo-500/20' : 'hover:shadow-md'}
          `}
        >
          {/* Title */}
          <h4 className={`font-bold mb-3 leading-snug text-sm ${style.text}`}>
            {task.title}
          </h4>

          {/* Footer (Date) */}
          <div className={`flex items-center gap-1.5 text-[11px] font-bold ${style.iconColor} bg-white/50 px-2 py-1 rounded-md w-fit`}>
            <Clock size={12} strokeWidth={2.5} />
            <span>{task.due_date || "No Deadline"}</span>
          </div>
        </div>
      )}
    </Draggable>
  );
}
