import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import AddLead from "./pages/AddLead";
import LeadDetails from "./pages/LeadDetails";
import FollowUps from "./pages/FollowUps";
import AddFollowUp from "./pages/AddFollowUp";
import FollowUpDetails from "./pages/FollowUpDetails";
import Reports from "./pages/Reports";
function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />

                <Route path="/login" element={<Login />} />
                
                <Route element={<ProtectedRoute />}></Route>
                
                <Route
                    path="/dashboard"
                    element={<Dashboard />}
                />

                <Route
                    path="/leads"
                    element={<Leads />}
                />

                <Route
                    path="/leads/add"
                    element={<AddLead />}
                />
                <Route
                      path="/leads/:id"
                      element={<LeadDetails />}
                  />
                <Route
                    path="/followups"
                    element={<FollowUps />}
                />

                <Route
                      path="/followups/add"
                      element={<AddFollowUp />}
                  />
                  <Route
                      path="/followups/:id"
                      element={<FollowUpDetails />}
                  />
                  <Route
                      path="/reports"
                      element={<Reports />}
                  />
            </Routes>
        </BrowserRouter>
    );
}

export default App;