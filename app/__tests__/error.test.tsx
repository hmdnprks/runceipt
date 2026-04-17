import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import GlobalError from "@/app/error";
import DashboardError from "@/app/dashboard/error";
import ReceiptError from "@/app/receipt/[id]/error";

const mockError = new Error("Test error message");
const mockReset = jest.fn();

beforeEach(() => mockReset.mockReset());

describe("GlobalError", () => {
  it("renders error message and try again calls reset", () => {
    render(<GlobalError error={mockError} reset={mockReset} />);
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText("Test error message")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Try again"));
    expect(mockReset).toHaveBeenCalled();
  });

  it("shows fallback message when error.message is empty", () => {
    render(<GlobalError error={new Error()} reset={mockReset} />);
    expect(screen.getByText("An unexpected error occurred")).toBeInTheDocument();
  });
});

describe("DashboardError", () => {
  it("renders error message and navigation buttons", () => {
    render(<DashboardError error={mockError} reset={mockReset} />);
    expect(screen.getByText("Failed to load your runs")).toBeInTheDocument();
    expect(screen.getByText("Test error message")).toBeInTheDocument();
    expect(screen.getByText("Back to home")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Try again"));
    expect(mockReset).toHaveBeenCalled();
  });
});

describe("ReceiptError", () => {
  it("renders error message and navigation buttons", () => {
    render(<ReceiptError error={mockError} reset={mockReset} />);
    expect(screen.getByText("Failed to load receipt")).toBeInTheDocument();
    expect(screen.getByText("Test error message")).toBeInTheDocument();
    expect(screen.getByText("Back to dashboard")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Try again"));
    expect(mockReset).toHaveBeenCalled();
  });
});
