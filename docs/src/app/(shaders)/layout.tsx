import { Header } from '@/components/header';

export default function Layout({ children }: React.PropsWithChildren) {
  return (
    <div className="page-container">
      <Header />
      <main className="page-contents">{children}</main>
    </div>
  );
}
