"use client";

import { KanbanBoardContext } from "@/contexts/KanbanBoardContext";
import { Task } from "@/types/kanban";
import { PencilIcon } from "lucide-react";
import { useContext, useState } from "react";
import { DatePicker } from "../DatePicker";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function EditTaskDialog({
  editableTask,
  columnId,
}: {
  editableTask: Task;
  columnId: string;
}) {
  const [task, setTask] = useState<Task>(editableTask);
  const [open, setOpen] = useState(false);
  const { updateTask } = useContext(KanbanBoardContext);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setTask({
      ...task,
      [e.target.name]: e.target.value,
    });
  };

  const handleDueDateChange = (date: string | undefined) => {
    setTask({
      ...task,
      dueDate: date,
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateTask(columnId, task);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={() => setOpen((prev) => !prev)}>
      <DialogTrigger asChild>
        <Button className="p-0 pl-2 shadow-none stroke-gray-500 bg-transparent hover:bg-transparent h-auto">
          <PencilIcon className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-end">
                Title
              </Label>
              <Input
                id="title"
                name="title"
                value={task.title}
                onChange={handleChange}
                required
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-end">
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                value={task.description}
                className="col-span-3 "
                required
                onChange={handleChange}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dueDate" className="text-end">
                Due Date
              </Label>
              <DatePicker
                className="col-span-3"
                date={task.dueDate}
                setDate={handleDueDateChange}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
