export default function Home() {
  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui" }}>
      <h1>GymTrack API</h1>
      <p>Backend en ejecución. Endpoints disponibles:</p>
      <ul>
        <li><code>POST /api/auth/login</code> — Iniciar sesión</li>
        <li><code>POST /api/auth/register</code> — Registrar usuario</li>
        <li><code>GET /api/users</code> — Listar usuarios (query: email)</li>
        <li><code>GET /api/users/:id</code> — Obtener usuario por id</li>
      </ul>
    </main>
  );
}
