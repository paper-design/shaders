export function ShaderContainer({ children }: { children: React.ReactNode }) {
  return <div className="h-[20rem] overflow-hidden rounded-3xl sm:h-[30rem] [&>div]:size-full">{children}</div>;
}
