import { Header } from '@/components/header';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="pb-16">
      <Header />
      <div className="mx-auto -mt-32 flex max-w-screen-xl flex-col gap-8 px-5">{children}</div>
    </div>
  );
}
