export default function ThumbnailsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 256px)',
        gridTemplateRows: 'repeat(3, 192px)',
        minHeight: '100dvh',
        alignContent: 'center',
        justifyContent: 'center',
        gap: '16px',
      }}
    >
      {children}

      <div
        style={{
          gridColumn: '1 / -1',
          fontSize: 20,
          textAlign: 'center',
          display: 'flex',
          gap: '32px',
          justifyContent: 'center',
          paddingTop: '12px',
        }}
      >
        <a href="/test/thumbnails/1">Page 1</a>
        <a href="/test/thumbnails/2">Page 2</a>
        <a href="/test/thumbnails/3">Page 3</a>
      </div>
    </div>
  );
}
