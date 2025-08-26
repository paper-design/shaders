export function ShaderContainer({ children }: { children: React.ReactNode }) {
  return <div className="mb-12 aspect-16/9 overflow-hidden [&>div]:size-full">{children}</div>;
}
