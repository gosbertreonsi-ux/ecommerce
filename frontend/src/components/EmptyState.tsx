import type { ReactNode } from "react";

import Container from "./Container";

interface EmptyStateProps {
  title: ReactNode;
  message?: string;
  children?: ReactNode;
}

/** Full-width message for empty, error and "sign in first" screens. */
function EmptyState({ title, message, children }: EmptyStateProps) {
  return (
    <section className="py-20 sm:py-28">
      <Container>
        <div className="mx-auto max-w-lg text-center">
          <h1 className="vero-title">{title}</h1>

          {message && <p className="mt-4 text-neutral-600">{message}</p>}

          {children && (
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              {children}
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}

export default EmptyState;