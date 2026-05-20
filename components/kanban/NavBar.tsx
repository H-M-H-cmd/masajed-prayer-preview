import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NavBar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-secondary">
      <div className="py-4 px-6 flex gap-4 justify-between">
        <Button asChild variant={"link"} className="text-lg font-bold">
          <Link href={"/dashboard"}>Dashboard</Link>
        </Button>
        <Button asChild variant={"link"} className="text-lg font-bold">
          <Link href={"/dashboard/tasks"}>Tasks</Link>
        </Button>
      </div>
    </header>
  );
}
