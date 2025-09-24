import { useRoutes } from 'react-router-dom';
import './App.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import routes from './Routes';
import { AuthProvider } from './Contexts/AuthContext';

function App() {

  const routing = useRoutes(routes)

  return (
    <>
      <AuthProvider>
        {routing}
        <ToastContainer position="top-center" />
      </AuthProvider>
    </>
  );

}

export default App;
