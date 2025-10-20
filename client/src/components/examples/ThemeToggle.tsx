import ThemeToggle from "../ThemeToggle";

export default function ThemeToggleExample() {
  return (
    <div className="p-8 bg-background flex items-center justify-center gap-4">
      <p className="text-foreground">Click to toggle theme:</p>
      <ThemeToggle />
    </div>
  );
}
