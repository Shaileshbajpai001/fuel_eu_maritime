import { Routes, Route, NavLink } from 'react-router-dom';

// We will create these pages soon
const RoutesTab = () => <div>Routes Page Content</div>;
const CompareTab = () => <div>Compare Page Content</div>;
const BankingTab = () => <div>Banking Page Content</div>;
const PoolingTab = () => <div>Pooling Page Content</div>;

// A helper for styling the active tab
const getNavLinkClass = ({ isActive }: { isActive: boolean }) =>
  `px-4 py-2 font-medium rounded-t-lg ${
    isActive
      ? 'text-blue-600 bg-gray-100'
      : 'text-gray-500 hover:text-gray-700'
  }`;

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          FuelEU Maritime Compliance
        </h1>

        {/* Tab Navigation */}
        <nav className="border-b border-gray-200">
          <ul className="flex -mb-px">
            <li>
              <NavLink to="/" className={getNavLinkClass} end>
                Routes
              </NavLink>
            </li>
            <li>
              <NavLink to="/compare" className={getNavLinkClass}>
                Compare
              </NavLink>
            </li>
            <li>
              <NavLink to="/banking" className={getNavLinkClass}>
                Banking
              </NavLink>
            </li>
            <li>
              <NavLink to="/pooling" className={getNavLinkClass}>
                Pooling
              </NavLink>
            </li>
          </ul>
        </nav>

        {/* Page Content Area */}
        <main className="mt-6 p-6 bg-white shadow rounded-lg">
          <Routes>
            <Route path="/" element={<RoutesTab />} />
            <Route path="/compare" element={<CompareTab />} />
            <Route path="/banking" element={<BankingTab />} />
            <Route path="/pooling" element={<PoolingTab />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
