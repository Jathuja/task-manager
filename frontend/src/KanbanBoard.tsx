import React from 'react';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import TaskCard from './TaskCard';
import axios from 'axios';
import { Task } from './types';

const API_URL = "http://127.0.0.1:8000";

const columns = {
  "todo": "To-Do",
  "in-progress": "In Progress",
  "done": "Done"
};

// Simulate time slots for the background grid
const timeSlots = ["08.00", "09.00", "10.00", "11.00", "12.00", "14.00", "15.00", "16.00", "17.00"];

interface KanbanBoardProps {
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  fetchTasks: () => void;
  onEditTask?: (task: Task) => void;
}

export default function KanbanBoard({ tasks, setTasks, fetchTasks, onEditTask }: KanbanBoardProps) {

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    // Optimistic UI update
    const taskId = parseInt(draggableId);
    const movedTask = tasks.find(t => t.id === taskId);
    const newStatus = destination.droppableId;

    const newTasks = tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t);
    setTasks(newTasks);

    // Save to backend
    try {
      if (movedTask) {
        await axios.put(`${API_URL}/api/v1/tasks/${taskId}`, {
          ...movedTask,
          status: newStatus
        }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      }
    } catch (err) {
      console.error("Failed to move task", err);
      fetchTasks(); // Revert on failure
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 min-h-[600px] h-full flex flex-col relative overflow-hidden">
      
      {/* Background Grid Lines (Horizontal) */}
      <div className="absolute inset-0 pt-[100px] pointer-events-none flex flex-col justify-between px-8 z-0">
        {timeSlots.map((time, idx) => (
          <div key={idx} className="flex items-center w-full">
            <span className="text-[10px] font-bold text-gray-400 w-12 shrink-0">{time}</span>
            <div className="flex-1 border-t border-gray-100"></div>
          </div>
        ))}
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-6 h-full relative z-10 pl-14 overflow-x-auto">
          {Object.entries(columns).map(([columnId, title]) => {
            const columnTasks = tasks.filter(t => t.status === columnId);
            
            return (
              <div 
                key={columnId}
                className="flex-1 min-w-[280px] flex flex-col max-h-full border-r border-gray-50 last:border-0"
              >
                {/* Column Header */}
                <div className="pb-8 text-center bg-white">
                  <h3 className="text-xl font-bold text-gray-900 tracking-tight">
                    {title}
                  </h3>
                </div>

                {/* Droppable Area */}
                <Droppable droppableId={columnId}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 p-2 overflow-y-auto transition-colors duration-200 ${
                        snapshot.isDraggingOver ? 'bg-indigo-50/50 rounded-xl' : 'bg-transparent'
                      }`}
                    >
                      {columnTasks.map((task, index) => (
                        <TaskCard key={task.id} task={task} index={index} onEdit={onEditTask} />
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}
