export function ShaderDetails({ name }: { name: string }) {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-4xl font-medium">{name}</h1>
      <div className="flex flex-col gap-4 [&>section]:flex [&>section]:flex-col [&>section]:gap-4">
        <section>
          <h2 className="text-2xl font-medium">Install</h2>
          <pre className="w-full max-w-96 overflow-x-auto rounded-lg bg-[#f7f6f0] px-4 py-4 text-base">{`// React
npm i @paper-design/shaders-react

// Vanilla
npm i @paper-design/shaders`}</pre>
        </section>
      </div>
    </div>
  );
}
