import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useLanguage } from "./context/LanguageContext";
import { useAuth } from "./context/AuthContext";
import { useAppData } from "./context/AppDataContext";
import { useReminderAlerts } from "./hooks/useReminderAlerts";

// Layout & Core
import LoginScreen from "./components/auth/LoginScreen";
import Sidebar from "./components/layout/Sidebar";
import Header from "./components/layout/Header";
import Toast from "./components/layout/Toast";

// Pages
import DashboardPage from "./components/dashboard/DashboardPage";
import PropertiesPage from "./components/properties/PropertiesPage";
import ClientsPage from "./components/clients/ClientsPage";
import OwnersPage from "./components/owners/OwnersPage";
import BrokersPage from "./components/brokers/BrokersPage";
import RemindersPage from "./components/reminders/RemindersPage";
import WhatsAppPage from "./components/whatsapp/WhatsAppPage";
import UsersPage from "./components/users/UsersPage";
import AuditPage from "./components/audit/AuditPage";

// Global Modals
import DueReminderPopup from "./components/reminders/DueReminderPopup";

// ----------------------------------------------------
// LAYOUT COMPONENT
// ----------------------------------------------------
const AppLayout = () => {
  const { language, darkMode, setDarkMode } = useLanguage();
  const { toastMessage, setToastMessage } = useAppData();

  // Reminder Alerts Hook
  const { dueReminderAlert, setDueReminderAlert, handleToggleReminderStatus } = useReminderAlerts(setToastMessage);

  return (
    <div className={`min-h-screen ${darkMode ? "dark bg-slate-950 text-slate-50" : "bg-slate-50 text-slate-900"} font-sans transition-colors duration-200`} dir={language === "ar" ? "rtl" : "ltr"}>
      <Toast toastMessage={toastMessage} />
      
      {dueReminderAlert && (
        <DueReminderPopup
          dueReminderAlert={dueReminderAlert}
          setDueReminderAlert={setDueReminderAlert}
          setDismissedReminderIds={() => {}}
          handleToggleReminderStatus={handleToggleReminderStatus}
        />
      )}

      {/* SIDEBAR WITH REACT ROUTER NAVLINKS */}
      <Sidebar />

      {/* MAIN CONTENT AREA */}
      <div className={`transition-all duration-300 ${language === "ar" ? "pr-20 md:pr-64" : "pl-20 md:pl-64"} flex flex-col min-h-screen`}>
        <Header 
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />
        
        <main className="flex-1 p-4 md:p-8 pt-4 md:pt-8 pb-8">
          <div className="max-w-7xl mx-auto animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};


// ----------------------------------------------------
// MAIN APP COMPONENT WITH FULL REACT ROUTER SETUP
// ----------------------------------------------------
export default function App() {
  const { token, currentUser } = useAuth();
  
  if (!token || !currentUser) {
    return (
      <Routes>
        <Route path="/login" element={<LoginScreen />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="properties" element={<PropertiesPage />} />
        <Route path="clients" element={<ClientsPage />} />
        <Route path="owners" element={<OwnersPage />} />
        <Route path="brokers" element={<BrokersPage />} />
        <Route path="reminders" element={<RemindersPage />} />
        <Route path="whatsapp" element={<WhatsAppPage />} />
        <Route
          path="users"
          element={
            currentUser.role === "ADMIN" ? (
              <UsersPage />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />
        <Route
          path="audit"
          element={
            currentUser.role !== "AGENT" ? (
              <AuditPage />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
      <Route path="/login" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
