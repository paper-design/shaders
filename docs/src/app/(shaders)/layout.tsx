import { SiteHeader } from '@/components/site-header';

export default function Layout({ children }: React.PropsWithChildren) {
  return (
    <div className="mx-auto box-content max-w-1104 px-16 pb-96 xs:px-24 sm:px-32 md:px-48 2xl:max-w-1472 3xl:max-w-1104">
      <SiteHeader />
      <main className="lg:max-w-[calc(100%-332px)] 3xl:max-w-1104">{children}</main>
    </div>
  );
}
