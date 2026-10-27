interface SpinnerProps {
  label?: string;
}

function Spinner({ label = "Loading…" }: SpinnerProps) {
  return (
    <div
      role="status"
      className="flex flex-col items-center gap-4 py-20 text-center"
    >
      <div
        aria-hidden="true"
        className="h-8 w-8 animate-spin rounded-full border-2 border-[color:var(--line)] border-t-[color:var(--ink)]"
      />

      <p className="text-neutral-600">{label}</p>
    </div>
  );
}

export default Spinner;