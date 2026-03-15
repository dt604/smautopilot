export default function RemixPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
      <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center text-accent">
        <span className="text-2xl">🪄</span>
      </div>
      <h1 className="text-3xl font-bold">Video Remix Studio</h1>
      <p className="text-muted-foreground max-w-md">Upload a competitor&apos;s video or provide a link to remix it with your own brand voice.</p>
    </div>
  );
}
