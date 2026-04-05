import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Roles from './pages/Roles';
import Permissions from './pages/Permissions';
import Init from './pages/Init';
import Notes from './pages/Notes';
import SensitiveConfigs from './pages/SensitiveConfigs';
import AILearning from './pages/AILearning';
import ScheduledTasks from './pages/ScheduledTasks';
import Layout from './components/Layout';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('access_token');
  if (!token) {
    return <Navigate to='/login' replace />;
  }
  return <>{children}</>;
}

function App() {
  return (
    <Routes>
      <Route path='/login' element={<Login />} />
      <Route
        path='/'
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path='users' element={<Users />} />
        <Route path='roles' element={<Roles />} />
        <Route path='permissions' element={<Permissions />} />
        <Route path='init' element={<Init />} />
        <Route path='notes' element={<Notes />} />
        <Route path='sensitive-configs' element={<SensitiveConfigs />} />
        <Route path='ai-learning' element={<AILearning />} />
        <Route path='scheduled-tasks' element={<ScheduledTasks />} />
      </Route>
    </Routes>
  );
}

export default App;