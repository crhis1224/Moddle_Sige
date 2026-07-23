import { type RootState } from "@/redux/store";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { PrivateRoutes } from "./routes";
import { type RolesType, Roles } from "./roles";

/* interface Props {
  rols: RolesType; // El rol requerido para entrar
} */

/* const RoleGuard = ({ rols }: Props) => {
  // Obtenemos el estado de autenticación desde Redux
  const userState = useSelector((state: RootState) => state.auth);
  
  // Extraemos el rol del usuario (Asegúrate de que en tu authSlice el campo se llame 'role')
  const { role } = userState;

  // LÓGICA DE VALIDACIÓN:
  // 1. Si el rol del usuario coincide con el requerido, renderizamos las rutas hijas (<Outlet />)
  // 2. Si no coincide, redirigimos a la raíz privada.
  // 3. (Opcional) Podrías verificar si el usuario es ADMIN, ya que un ADMIN suele tener acceso a todo.
  
  const hasAccess = role === rols || role === Roles.ADMIN;

  return hasAccess ? (
    <Outlet />
  ) : ( 
    <Navigate replace to={PrivateRoutes.PRIVATE} />
  );
}; */

interface Props {
  allowedRoles: RolesType[];
}

const RoleGuard = ({ allowedRoles }: Props) => {
  const { role } = useSelector((state: RootState) => state.auth);

  const hasAccess = 
    role && (allowedRoles.includes(role as RolesType) || role === Roles.ADMIN);

  return hasAccess ? (
    <Outlet />
  ) : ( 
    /* Construimos la ruta absoluta forzando el "/" al inicio.
       Esto te llevará a "/private" (que según tu Private.tsx redirige a Dashboard)
    */
    <Navigate replace to={`/${PrivateRoutes.PRIVATE}`} />
  );
};

export default RoleGuard;
