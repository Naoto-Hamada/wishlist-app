import Image from "next/image";

export default function Home() {
  return (
    <div>
      <header className="bg-gradient-to-r from-primary-start to-primary-end text-text-inverted p-4">
        <h1 className="text-2xl font-bold">ダッシュボード</h1>
      </header>
      <main className="p-4">
        <section className="bg-white rounded-lg shadow-md p-4 mb-4">
          <h2 className="text-xl font-semibold text-text-primary mb-2">直近のやりたいタスク</h2>
          {/* タスクリストコンポーネント */}
        </section>
        <section className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-xl font-semibold text-text-primary mb-2">達成状況</h2>
          {/* チャートコンポーネント */}
        </section>
      </main>
      <nav className="bg-background-secondary fixed bottom-0 w-full p-4">
        {/* ナビゲーションアイテム */}
      </nav>
    </div>
  );
}
