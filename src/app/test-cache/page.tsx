export default async function TestCachePage() {
  "use cache";
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Cache Components Test</h1>
      <p className="mt-4">If you see this, &quot;use cache&quot; directive is working!</p>
      <p className="text-sm text-muted-foreground mt-2">Timestamp: {new Date().toISOString()}</p>
    </div>
  );
}
