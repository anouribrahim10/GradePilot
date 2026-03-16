import { render, screen } from "@testing-library/react";
import Home from "../src/app/page";

describe("GradePilot frontend", () => {

  test("renders the GradePilot title", () => {
    render(<Home />);
    const elements = screen.getAllByText(/gradepilot/i);
    expect(elements.length).toBeGreaterThan(0);
    expect(elements[0]).toBeInTheDocument();
  });

  test("renders the upload hub section", () => {
    render(<Home />);
    expect(screen.getByText(/upload hub/i)).toBeInTheDocument();
  });

  test("renders the live agent activity section", () => {
    render(<Home />);
    expect(screen.getByText(/live agent activity/i)).toBeInTheDocument();
  });

  test("renders the study session button", () => {
    render(<Home />);
    // Since there are multiple "Start Study Session" buttons, we select all and verify array length > 0
    const buttons = screen.getAllByRole("button", { name: /start study session/i });
    expect(buttons.length).toBeGreaterThan(0);
    expect(buttons[0]).toBeInTheDocument();
  });

});
