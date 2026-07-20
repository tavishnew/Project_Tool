import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import StatusBadge from "./StatusBadge";

describe("StatusBadge", () => {
  it("renders the correct label per status", () => {
    render(
      <div>
        <StatusBadge status="todo" />
        <StatusBadge status="in_progress" />
        <StatusBadge status="done" />
      </div>
    );
    expect(screen.getByText("TODO")).toBeInTheDocument();
    expect(screen.getByText("IN PROG")).toBeInTheDocument();
    expect(screen.getByText("DONE")).toBeInTheDocument();
  });
});
