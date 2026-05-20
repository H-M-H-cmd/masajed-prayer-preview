import { MultipleBoardsContext } from "@/contexts/MultipleBoardsContext";
import { Board } from "@/types/kanban";
import { TrashIcon } from "lucide-react";
import { useContext } from "react";
import EditBoardDialog from "./EditBoardDialog";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function BoardCard({ board }: { board: Board }) {
  const { deleteBoard } = useContext(MultipleBoardsContext);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between">
          <Link href={`/dashboard/tasks/board/${board.id}`}>{board.title} </Link>
          <div className="flex gap-1">
            <EditBoardDialog editableBoard={board} />
            <div
              className="stroke-rose-500 cursor-pointer"
              onClick={() => deleteBoard(board.id.toString())}
            >
              <TrashIcon className="h-5 w-5" />
            </div>
          </div>
        </CardTitle>
        <CardDescription>{board.description}</CardDescription>
      </CardHeader>
    </Card>
  );
}
