export default function Layout({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto -mt-32 flex max-w-screen-xl flex-col gap-8 px-5">{children}</div>;
}
