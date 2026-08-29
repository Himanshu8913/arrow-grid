export function App() {
  return (
    <div className="app">
      <main className="app__main">
        <h1 className="app__title">
          {import.meta.env.VITE_APP_NAME ?? "Arrow Grid"}
        </h1>
        <p className="app__subtitle">Strategy puzzle game — coming soon</p>
      </main>
    </div>
  );
}
