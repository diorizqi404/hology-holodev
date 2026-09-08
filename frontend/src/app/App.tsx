import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";
import { LandingPage } from "../pages/LandingPage";
import { FarmerDashboard } from "../pages/farmer/FarmerDashboard";
import { LandListPage } from "../pages/farmer/LandListPage";
import { AddLandPage } from "../pages/farmer/AddLandPage";
import { LocationMapPage } from "../pages/farmer/LocationMapPage";
import { CropContextPage } from "../pages/farmer/CropContextPage";
import { LandDetailPage } from "../pages/farmer/LandDetailPage";
import { LandReviewPage } from "../pages/farmer/LandReviewPage";
import { IrrigationPulsePage } from "../pages/farmer/IrrigationPulsePage";
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";
import { HomePage } from "../pages/HomePage";
import { ForgotPasswordPage } from "../pages/ForgotPasswordPage";
import { ResetPasswordPage } from "../pages/ResetPasswordPage";
import { VerifyPhonePage } from "../pages/VerifyPhonePage";
import { ProtectedRoute } from "../components/auth/ProtectedRoute";
import { ProfilePage } from "../pages/farmer/ProfilePage";
import HistoryPage from "../pages/farmer/HistoryPage";
import { HistoryDetailPage } from "../pages/farmer/HistoryDetailPage";
import { ConditionWaterPage } from "../pages/farmer/ConditionWaterPage";
import { ConditionSummaryPage } from "../pages/farmer/ConditionSummaryPage";
import { ActionAlternativesPage } from "../pages/farmer/ActionAlternativesPage";
import { OptionalReviewPage } from "../pages/farmer/OptionalReviewPage";
import { SelectReviewerPage } from "../pages/farmer/SelectReviewerPage";
import { FinalDecisionPage } from "../pages/farmer/FinalDecisionPage";
import { DashboardReviewerPage } from "../pages/reviewer/DashboardReviewerPage";
import { ReviewListPage } from "../pages/reviewer/ReviewListPage";
import { ReviewDetailPage } from "../pages/reviewer/ReviewDetailPage";
import { HistoryReviewPage } from "../pages/reviewer/HistoryReviewPage";
import { ReviewerProfilePage } from "../pages/reviewer/ReviewerProfilePage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        
        {/* === RUTE PUBLIK (AUTENTIKASI) === */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify-phone" element={<VerifyPhonePage />} />

        {/* === RUTE KHUSUS PETANI (FARMER) === */}
        <Route path="/farmer/dashboard" element={<ProtectedRoute allowedRole="farmer"><FarmerDashboard /></ProtectedRoute>} />
        
        <Route path="/farmer/lands" element={<ProtectedRoute allowedRole="farmer"><LandListPage /></ProtectedRoute>} />
        <Route path="/farmer/lands/new" element={<ProtectedRoute allowedRole="farmer"><AddLandPage /></ProtectedRoute>} />
        <Route path="/farmer/lands/new/location" element={<ProtectedRoute allowedRole="farmer"><LocationMapPage /></ProtectedRoute>} />
        <Route path="/farmer/lands/new/details" element={<ProtectedRoute allowedRole="farmer"><CropContextPage /></ProtectedRoute>} />
        <Route path="/farmer/lands/:landId" element={<ProtectedRoute allowedRole="farmer"><LandDetailPage /></ProtectedRoute>} />
        <Route path="/farmer/lands/:landId/review" element={<ProtectedRoute allowedRole="farmer"><LandReviewPage /></ProtectedRoute>} />
        <Route path="/farmer/lands/:landId/irrigation" element={<ProtectedRoute allowedRole="farmer"><IrrigationPulsePage /></ProtectedRoute>} />
        <Route path="/farmer/lands/:landId/condition" element={<ProtectedRoute allowedRole="farmer"><ConditionWaterPage /></ProtectedRoute>} />
        <Route path="/farmer/lands/:landId/summary" element={<ProtectedRoute allowedRole="farmer"><ConditionSummaryPage /></ProtectedRoute>} />
        <Route path="/farmer/lands/:landId/action-alternatives" element={<ProtectedRoute allowedRole="farmer"><ActionAlternativesPage /></ProtectedRoute>} />
        <Route path="/farmer/lands/:landId/optional-review" element={<ProtectedRoute allowedRole="farmer"><OptionalReviewPage /></ProtectedRoute>} />
        <Route path="/farmer/lands/:landId/select-reviewer" element={<ProtectedRoute allowedRole="farmer"><SelectReviewerPage /></ProtectedRoute>} />
        <Route path="/farmer/lands/:landId/final-decision" element={<ProtectedRoute allowedRole="farmer"><FinalDecisionPage /></ProtectedRoute>} />
        
        <Route path="/farmer/profile" element={<ProtectedRoute allowedRole="farmer"><ProfilePage /></ProtectedRoute>} />
        
        <Route path="/farmer/history" element={<ProtectedRoute allowedRole="farmer"><HistoryPage /></ProtectedRoute>} />
        <Route path="/farmer/history/:historyId" element={<ProtectedRoute allowedRole="farmer"><HistoryDetailPage /></ProtectedRoute>} />

        {/* === RUTE KHUSUS REVIEWER === */}
        <Route path="/reviewer/dashboard" element={<ProtectedRoute allowedRole="reviewer"><DashboardReviewerPage /></ProtectedRoute>} />
        <Route path="/reviewer/review" element={<ProtectedRoute allowedRole="reviewer"><ReviewListPage /></ProtectedRoute>} />
        <Route path="/reviewer/review/:reviewId" element={<ProtectedRoute allowedRole="reviewer"><ReviewDetailPage /></ProtectedRoute>} />
        <Route path="/reviewer/history" element={<ProtectedRoute allowedRole="reviewer"><HistoryReviewPage /></ProtectedRoute>} />
        <Route path="/reviewer/profile" element={<ProtectedRoute allowedRole="reviewer"><ReviewerProfilePage /></ProtectedRoute>} />
        
        {/* Rute Default / Fallback */}
        <Route path="/home" element={<ProtectedRoute allowedRole="farmer"><HomePage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
