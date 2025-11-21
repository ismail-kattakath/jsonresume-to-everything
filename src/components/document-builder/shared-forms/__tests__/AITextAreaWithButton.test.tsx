import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import AITextAreaWithButton from "../AITextAreaWithButton";

describe("AITextAreaWithButton Component", () => {
  const defaultProps = {
    value: "",
    onChange: jest.fn(),
    onGenerateClick: jest.fn(),
    placeholder: "Test placeholder",
    name: "testField",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render textarea with provided props", () => {
      render(<AITextAreaWithButton {...defaultProps} />);
      const textarea = screen.getByPlaceholderText("Test placeholder");
      expect(textarea).toBeInTheDocument();
      expect(textarea).toHaveAttribute("name", "testField");
    });

    it("should render Generate with AI button", () => {
      render(<AITextAreaWithButton {...defaultProps} />);
      const button = screen.getByRole("button", { name: /Generate with AI/i });
      expect(button).toBeInTheDocument();
    });

    it("should display character counter by default", () => {
      render(<AITextAreaWithButton {...defaultProps} value="Hello" />);
      expect(screen.getByText("5")).toBeInTheDocument();
    });

    it("should hide character counter when showCharacterCount is false", () => {
      render(
        <AITextAreaWithButton
          {...defaultProps}
          value="Hello"
          showCharacterCount={false}
        />
      );
      expect(screen.queryByText("5")).not.toBeInTheDocument();
    });

    it("should display maxLength in character counter when provided", () => {
      render(
        <AITextAreaWithButton {...defaultProps} value="Hello" maxLength={100} />
      );
      expect(screen.getByText("5/100")).toBeInTheDocument();
    });

    it("should render with custom rows prop", () => {
      render(<AITextAreaWithButton {...defaultProps} rows={10} />);
      const textarea = screen.getByPlaceholderText("Test placeholder");
      expect(textarea).toHaveAttribute("rows", "10");
    });

    it("should use default rows value of 18", () => {
      render(<AITextAreaWithButton {...defaultProps} />);
      const textarea = screen.getByPlaceholderText("Test placeholder");
      expect(textarea).toHaveAttribute("rows", "18");
    });
  });

  describe("User Interactions", () => {
    it("should call onChange when user types", () => {
      const mockOnChange = jest.fn();
      render(<AITextAreaWithButton {...defaultProps} onChange={mockOnChange} />);

      const textarea = screen.getByPlaceholderText("Test placeholder");
      fireEvent.change(textarea, { target: { value: "New content" } });

      expect(mockOnChange).toHaveBeenCalledTimes(1);
    });

    it("should call onGenerateClick when button is clicked", () => {
      const mockOnGenerateClick = jest.fn();
      render(
        <AITextAreaWithButton
          {...defaultProps}
          onGenerateClick={mockOnGenerateClick}
        />
      );

      const button = screen.getByRole("button", { name: /Generate with AI/i });
      fireEvent.click(button);

      expect(mockOnGenerateClick).toHaveBeenCalledTimes(1);
    });

    it("should update displayed value when value prop changes", () => {
      const { rerender } = render(
        <AITextAreaWithButton {...defaultProps} value="Initial" />
      );

      const textarea = screen.getByPlaceholderText("Test placeholder");
      expect(textarea).toHaveValue("Initial");

      rerender(<AITextAreaWithButton {...defaultProps} value="Updated" />);
      expect(textarea).toHaveValue("Updated");
    });
  });

  describe("Styling", () => {
    it("should have orange/amber gradient on button", () => {
      const { container } = render(<AITextAreaWithButton {...defaultProps} />);
      const button = container.querySelector(".from-amber-500.to-orange-500");
      expect(button).toBeInTheDocument();
    });

    it("should have orange focus styles on textarea", () => {
      const { container } = render(<AITextAreaWithButton {...defaultProps} />);
      const textarea = container.querySelector(".focus\\:border-amber-400");
      expect(textarea).toBeInTheDocument();
    });

    it("should have rounded top on textarea and flat bottom", () => {
      const { container } = render(<AITextAreaWithButton {...defaultProps} />);
      const textarea = container.querySelector(".rounded-t-lg.rounded-b-none");
      expect(textarea).toBeInTheDocument();
    });

    it("should have flat top on button and rounded bottom", () => {
      const { container } = render(<AITextAreaWithButton {...defaultProps} />);
      const button = container.querySelector(".rounded-t-none.rounded-b-lg");
      expect(button).toBeInTheDocument();
    });

    it("should have no bottom border on textarea", () => {
      const { container } = render(<AITextAreaWithButton {...defaultProps} />);
      const textarea = container.querySelector(".border-b-0");
      expect(textarea).toBeInTheDocument();
    });

    it("should have no top border on button", () => {
      const { container } = render(<AITextAreaWithButton {...defaultProps} />);
      const button = container.querySelector(".border-t-0");
      expect(button).toBeInTheDocument();
    });

    it("should position character counter at top-right", () => {
      const { container } = render(<AITextAreaWithButton {...defaultProps} />);
      const counter = container.querySelector(".absolute.top-3.right-3");
      expect(counter).toBeInTheDocument();
    });

    it("should apply custom className to wrapper", () => {
      const { container } = render(
        <AITextAreaWithButton {...defaultProps} className="custom-class" />
      );
      const wrapper = container.querySelector(".custom-class");
      expect(wrapper).toBeInTheDocument();
    });
  });

  describe("Character Counter", () => {
    it("should show 0 for empty value", () => {
      render(<AITextAreaWithButton {...defaultProps} value="" />);
      expect(screen.getByText("0")).toBeInTheDocument();
    });

    it("should count all characters including spaces", () => {
      render(<AITextAreaWithButton {...defaultProps} value="Hello World" />);
      expect(screen.getByText("11")).toBeInTheDocument();
    });

    it("should count newlines", () => {
      const valueWithNewline = "Line 1\nLine 2";
      render(<AITextAreaWithButton {...defaultProps} value={valueWithNewline} />);
      expect(screen.getByText(`${valueWithNewline.length}`)).toBeInTheDocument();
    });

    it("should count special characters", () => {
      render(<AITextAreaWithButton {...defaultProps} value="Test@123!" />);
      expect(screen.getByText("9")).toBeInTheDocument();
    });

    it("should be non-interactive", () => {
      const { container } = render(<AITextAreaWithButton {...defaultProps} />);
      const counter = container.querySelector(".pointer-events-none");
      expect(counter).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have accessible button with icon and text", () => {
      render(<AITextAreaWithButton {...defaultProps} />);
      const button = screen.getByRole("button", { name: /Generate with AI/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent("Generate with AI");
    });

    it("should have button type set to button", () => {
      render(<AITextAreaWithButton {...defaultProps} />);
      const button = screen.getByRole("button", { name: /Generate with AI/i });
      expect(button).toHaveAttribute("type", "button");
    });

    it("should have name attribute on textarea", () => {
      render(<AITextAreaWithButton {...defaultProps} name="customName" />);
      const textarea = screen.getByPlaceholderText("Test placeholder");
      expect(textarea).toHaveAttribute("name", "customName");
    });

    it("should have maxLength attribute when provided", () => {
      render(<AITextAreaWithButton {...defaultProps} maxLength={500} />);
      const textarea = screen.getByPlaceholderText("Test placeholder");
      expect(textarea).toHaveAttribute("maxLength", "500");
    });
  });

  describe("Edge Cases", () => {
    it("should handle undefined value", () => {
      render(
        <AITextAreaWithButton {...defaultProps} value={undefined as any} />
      );
      const textarea = screen.getByPlaceholderText("Test placeholder");
      expect(textarea).toHaveValue("");
      expect(screen.getByText("0")).toBeInTheDocument();
    });

    it("should handle null value", () => {
      render(<AITextAreaWithButton {...defaultProps} value={null as any} />);
      const textarea = screen.getByPlaceholderText("Test placeholder");
      expect(textarea).toHaveValue("");
      expect(screen.getByText("0")).toBeInTheDocument();
    });

    it("should handle very long content", () => {
      const longContent = "A".repeat(5000);
      render(<AITextAreaWithButton {...defaultProps} value={longContent} />);
      expect(screen.getByText("5000")).toBeInTheDocument();
    });

    it("should handle emoji and unicode characters", () => {
      const content = "Hello 🎉 你好";
      render(<AITextAreaWithButton {...defaultProps} value={content} />);
      expect(screen.getByText(`${content.length}`)).toBeInTheDocument();
    });
  });
});
