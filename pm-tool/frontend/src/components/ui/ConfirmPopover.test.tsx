import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ConfirmPopover from "./ConfirmPopover";

describe("ConfirmPopover", () => {
  it("confirms on Enter and cancels on Escape", () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(<ConfirmPopover message="Delete this?" onConfirm={onConfirm} onCancel={onCancel} />);
    expect(screen.getByText("Delete this?")).toBeInTheDocument();
    fireEvent.keyDown(document, { key: "Enter" });
    expect(onConfirm).toHaveBeenCalledTimes(1);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
