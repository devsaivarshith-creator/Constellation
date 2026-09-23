import { useWorkspace } from '../contexts/WorkspaceContext';
import DesktopChrome from './desktop/DesktopChrome';
import DashboardPage from '../pages/DashboardPage';
import InvestigationWorkspace from '../pages/InvestigationWorkspace';
import LiveIntelligencePage from '../pages/LiveIntelligencePage';
import SweepDashboardPage from '../pages/SweepDashboardPage';
import AuditLedgerPage from '../pages/AuditLedgerPage';

export default function Layout() {
  const { activeNavSection } = useWorkspace();

  return (
    <DesktopChrome>
      {activeNavSection === 'home' && <DashboardPage />}
      {activeNavSection === 'workspace' && <InvestigationWorkspace />}
      {activeNavSection === 'intel' && <LiveIntelligencePage />}
      {activeNavSection === 'sweeps' && <SweepDashboardPage />}
      {activeNavSection === 'audit' && <AuditLedgerPage />}
    </DesktopChrome>
  );
}
