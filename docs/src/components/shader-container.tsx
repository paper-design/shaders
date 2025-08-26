export function ShaderContainer({ children }: { children: React.ReactNode }) {
  return <div className="mb-12 h-[20rem] overflow-hidden sm:h-[36rem] xl:h-[40rem] [&>div]:size-full">{children}</div>;
}
