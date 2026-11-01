/** Label that rolls up to a second copy on hover (CSS in index.css). Read once by screen readers. */
export function RollText({ children }: { children: string }) {
  return (
    <span className="roll">
      <span>{children}</span>
      <span aria-hidden>{children}</span>
    </span>
  );
}
