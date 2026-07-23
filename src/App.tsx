import { BrowserRouter, Navigate, Route } from "react-router-dom";
import "./App.css";
import RoutesWithNotFound from "./scennes/partials/RoutesWithNotFound";
import Login from "./pages/public/login/Login";
import AuthGuard from "./utilities/Auth.guard";
import { PrivateRoutes } from "./utilities/routes";
import Private from "./pages/private/Private ";
import RoleGuard from "./utilities/Role.guard";
import { Roles } from "./utilities/roles";
import Student from "./pages/private/Student";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { setCredentials,setFinishedLoading } from "./redux/authSlice";
import { getAuthCredentials } from "./api/api";
import { ThemeProvider } from "./components/ui/theme-provider";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Al cargar la app, intentamos obtener el perfil usando la cookie
        const response = await getAuthCredentials()
        const { sub, email, role } = response;
        
        dispatch(setCredentials({ id: sub, email, role }));
      } catch (error) {
        // Si el servidor da 401 (no hay cookie o expiró), marcamos como inicializado
        dispatch(setFinishedLoading());
      }
    };

    fetchProfile();
  }, [dispatch]);
  return (
    <>
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <BrowserRouter>
        <RoutesWithNotFound>
          <Route path="/" element={<Navigate to="/Login" />} />
          <Route path="/Login" element={<Login />} />

          {/* GUARD DE AUTENTICACIÓN */}
          <Route element={<AuthGuard privateValidation={true} />}>
            {/* IMPORTANTE: El "/*" al final de la ruta de Private es vital. 
               Le dice a React Router: "Si la URL empieza con /private, 
               deja que el componente <Private /> se encargue del resto".
            */}
            {/* <Route
              path={`${PrivateRoutes.PRIVATE}/*`} 
              element={<Private />} 
            /> */}

            <Route element={<RoleGuard allowedRoles={[Roles.ADMIN, Roles.USER]} />}>
              <Route
                path={`${PrivateRoutes.PRIVATE}/*`} 
                element={<Private />} 
              />
            </Route>

            <Route element={<RoleGuard allowedRoles={[Roles.STUDENT]} />}>
              <Route
                path="/student/*" 
                element={<Student />}
              />
            </Route>


          </Route>

          {/* OTROS GUARDS DE ROLES (Si los sigues usando) */}
          <Route element={<RoleGuard allowedRoles={[Roles.ADMIN]} />}>
             {/* ... tus rutas de admin ... */}
          </Route>

        </RoutesWithNotFound>
      </BrowserRouter>
      </ThemeProvider>
    </>
  );
}
export default App;




