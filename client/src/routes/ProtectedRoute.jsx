import { useAuth } from "../contexts/AuthContext";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const isLogout = localStorage.getItem("logout");
  console.log(isLogout);
  // if (loading) {
  //   return (
  //     <div
  //       data-theme="luxury"
  //       className="h-screen flex items-center justify-center"
  //     >
  //       <span className="loading loading-spinner loading-lg"></span>
  //     </div>
  //   );
  // }

  if (!user && !loading) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
