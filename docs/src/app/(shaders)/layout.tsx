import { Header } from '@/components/header';

export default function Layout({ children }: React.PropsWithChildren) {
  return (
    <div className="page-container">
      <Header />
      <div className="page-contents">{children}</div>
    </div>
  );
}
