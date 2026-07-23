
import { type RootState } from "@/redux/store";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { PrivateRoutes, PublicRoutes } from "./routes";
interface Props {
  privateValidation: boolean;
}

/* const PrivateValidationFrame = <Outlet />;
const PublicValidationFrame = <Navigate replace to={PrivateRoutes.HOME} />; */
/* const AuthGuard = ({ privateValidation }: Props) => {
  /*     const userState = useSelector((store:AppStore)=>store.user.user);
    return userState.name ? <Outlet/> : <Navigate replace to={PublicRoutes.LOGIN}/> */

/*   const userState = useSelector((state: RootState) => state.auth);
  const { email,id } = userState;
  return id ? (
    privateValidation ? (
      PrivateValidationFrame
    ) : (
      PublicValidationFrame
    )
  ) : (
    <Navigate replace to={PublicRoutes.LOGIN} />
  );

}; */ 

const AuthGuard = ({ privateValidation }: Props) => {
  const userState = useSelector((state: RootState) => state.auth);
  const { isAuthenticated,isInitialized } = userState;

  // MIENTRAS NO SE HAYA INICIALIZADO (Petición al perfil en curso)
  if (!isInitialized) {
    return <div>Cargando sesión...</div>; // O un Spinner de carga
  }

  // Si el usuario NO está autenticado
  if (!isAuthenticated) {
    // Si la ruta es privada, al login. Si es pública (login), lo dejamos pasar.
    return privateValidation ? <Navigate replace to={PublicRoutes.LOGIN} /> : <Outlet />;
  }

  // Si el usuario SÍ está autenticado
  // Si intenta ir a ruta privada, adelante. Si intenta ir a login, al Home.
  return privateValidation ? <Outlet /> : <Navigate replace to={PrivateRoutes.PRIVATE} />;
};
export default AuthGuard;
