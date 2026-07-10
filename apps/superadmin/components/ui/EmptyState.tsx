export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center rounded-lg border border-dashed border-slate-200 py-10 text-sm text-slate-400">
      {message}
    </div>
  );
}
