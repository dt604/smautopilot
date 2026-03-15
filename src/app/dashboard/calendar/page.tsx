export default function CalendarPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
        <span className="text-2xl">📅</span>
      </div>
      <h1 className="text-3xl font-bold">Content Calendar</h1>
      <p className="text-muted-foreground max-w-md">Your scheduled UGC videos will appear here. Connect your social accounts to start posting.</p>
    </div>
  );
}
