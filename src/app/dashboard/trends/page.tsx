export default function TrendsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary animate-pulse">
        <span className="text-2xl">🔥</span>
      </div>
      <h1 className="text-3xl font-bold">Trending Content Pulse</h1>
      <p className="text-muted-foreground max-w-md">Our engine is currently scanning TikTok and Reels for the best hooks for your brand. Check back in a few minutes.</p>
    </div>
  );
}
