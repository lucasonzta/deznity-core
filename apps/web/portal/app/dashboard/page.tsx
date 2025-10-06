// Dashboard generado por UX Agent
export default function Dashboard() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Proyectos Activos</h3>
          <p className="text-3xl font-bold text-indigo-600">3</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Sitios Publicados</h3>
          <p className="text-3xl font-bold text-green-600">2</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">NPS Score</h3>
          <p className="text-3xl font-bold text-yellow-600">8.5</p>
        </div>
      </div>
    </div>
  );
}