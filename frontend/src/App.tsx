import { useAuth } from "./context/AuthContext";
import { AuthScreen } from "./pages/AuthScreen";
import { Dashboard } from "./pages/Dashboard";

export function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="center-screen">loading…</div>;
  }
  return user ? <Dashboard /> : <AuthScreen />;
}
