import { Header } from '@/components/header';

export default function Layout({ children, ...props }: { children: React.ReactNode }) {
  return (
    <div className="pb-16">
      <Header />
      <div className="mx-auto px-8 md:px-12 lg:max-w-[1280px] lg:px-24 2xl:max-w-[1664px]">{children}</div>
    </div>
  );
}
