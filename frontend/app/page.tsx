export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-4">SuperCore</h1>
        <p className="text-lg mb-8">
          Plataforma Universal de Gestão de Objetos
        </p>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Zero Autenticação</h2>
            <p className="text-gray-600">
              100% genérico. Sem conceitos de usuário/permissões.
            </p>
          </div>
          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Zero Lógica Hardcoded</h2>
            <p className="text-gray-600">
              Tudo baseado em object_definitions, instances e relationships.
            </p>
          </div>
          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Dynamic UI</h2>
            <p className="text-gray-600">
              Interface gerada automaticamente a partir dos schemas.
            </p>
          </div>
          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">RAG Trimodal</h2>
            <p className="text-gray-600">
              SQL + Graph + Vector para inteligência sobre os objetos.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
