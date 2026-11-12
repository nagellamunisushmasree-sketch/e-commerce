import { Outlet } from 'react-router-dom';
import ClientHeader from './ClientHeader';

function ClientLayout() {
  return (
    <>
      <div className="market-shell">
        <ClientHeader />
        <main className="market-main">
          <Outlet />
        </main>
      </div>
    </>
  );
}

export default ClientLayout;