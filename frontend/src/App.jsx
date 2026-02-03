import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';
import { Dashboard } from '@/pages/Dashboard';
import { Events } from '@/pages/Events';
import { EventDetail } from '@/pages/EventDetail';
import { EventForm } from '@/pages/EventForm';
import { TaskBoard } from '@/pages/TaskBoard';
import { CalendarPage } from '@/pages/CalendarPage';
import { Attendees } from '@/pages/Attendees';
import { FeedbackPage } from '@/pages/FeedbackPage';
import { NotificationsPage } from '@/pages/NotificationsPage';
import { InvitationAccept } from '@/pages/InvitationAccept';
import { PublicEvent } from '@/pages/PublicEvent';
import { SubmitFeedback } from '@/pages/SubmitFeedback';
import { InviteCollaborator } from '@/pages/InviteCollaborator';

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/invitations/:token" element={<InvitationAccept />} />
          <Route path="/e/:id" element={<PublicEvent />} />
          <Route path="/e/:eventId/feedback/:attendeeId" element={<SubmitFeedback />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="events" element={<Events />} />
            <Route path="events/new" element={<EventForm />} />
            <Route path="events/:id" element={<EventDetail />} />
            <Route path="events/:id/edit" element={<EventForm />} />
            <Route path="events/:eventId/tasks" element={<TaskBoard />} />
            <Route path="events/:eventId/attendees" element={<Attendees />} />
            <Route path="events/:eventId/feedback" element={<FeedbackPage />} />
            <Route path="events/:eventId/invite" element={<InviteCollaborator />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="tasks" element={<Navigate to="/dashboard" replace />} />
            <Route path="notifications" element={<NotificationsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
