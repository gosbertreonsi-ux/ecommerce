const DANGER_STATUSES = new Set(["CANCELLED", "FAILED", "REJECTED"]);

interface StatusTagProps {
  status: string;
}

function Statustag({ status }: StatusTagProps) {
  const danger = DANGER_STATUSES.has(status);

  return (
    <span
      className={`inline-block rounded-full border px-3 py-1 text-xs capitalize ${
        danger ? "text-[color:var(--danger)]" : ""
      }`}
    >
      {status.toLowerCase().replace(/_/g, " ")}
    </span>
  );
}

export default Statustag;