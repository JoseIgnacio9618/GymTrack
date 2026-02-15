/**
 * Formato de usuario que devuelve la API (sin hash de contraseña).
 * La app Angular espera { id, name, email, password } — enviamos password vacío por seguridad.
 */
export interface ApiUser {
  id: string;
  name: string;
  email: string;
  password: string;
}

export function toApiUser(record: { id: string; name: string; email: string }): ApiUser {
  return {
    id: record.id,
    name: record.name,
    email: record.email,
    password: "",
  };
}
