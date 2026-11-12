import { Outlet } from 'react-router-dom';
import Header from '../common/Header';
import Sidebar from '../common/Sidebar';

function AdminLayout() {
  return (
    <>
      <Header />
      <div className="dashboard-layout">
        <Sidebar type="admin" />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </>
  );
}

export default AdminLayout;