"use client";

import { Board } from "@/types/kanban";
import { createContext, useEffect, useMemo, useState } from "react";

type MultipleBoardsContextType = {
  boards: Board[];
  setBoards: React.Dispatch<React.SetStateAction<Board[]>>;
  addBoard: (board: Board) => void;
  updateBoard: (board: Board) => void;
  deleteBoard: (boardId: string) => void;
};

export const MultipleBoardsContext = createContext<MultipleBoardsContextType>({
  boards: [],
  setBoards: () => {},
  addBoard: () => {},
  updateBoard: () => {},
  deleteBoard: () => {},
});

export const MultipleBoardsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [boards, setBoards] = useState<Board[]>(() => {
    if (typeof window !== "undefined") {
      const savedBoards = localStorage.getItem("boards");
      if (savedBoards) {
        return JSON.parse(savedBoards);
      }
    }
    return [];
  });

  const addBoard = (board: Board) => {
    setBoards([...boards, board]);
  };

  const updateBoard = (board: Board) => {
    const newBoards = boards.map((b) => {
      if (b.id === board.id) {
        return board;
      }
      return b;
    });
    setBoards(newBoards);
  };

  const deleteBoard = (boardId: string) => {
    const newBoards = boards.filter((board) => board.id !== boardId);
    setBoards(newBoards);
  };

  useEffect(() => {
    localStorage.setItem("boards", JSON.stringify(boards));
  }, [boards]);

  return (
    <MultipleBoardsContext.Provider
      value={{
        boards,
        setBoards,
        addBoard,
        updateBoard,
        deleteBoard,
      }}
    >
      {children}
    </MultipleBoardsContext.Provider>
  );
};
