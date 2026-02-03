import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '@/api/axios';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useSelector } from 'react-redux';
import { Calendar, Mail } from 'lucide-react';

export function InvitationAccept() {
  const { token } = useParams();
  const navigate = useNavigate();
  const isAuth = useSelector((s) => s.auth.isAuthenticated);
  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    api.get(`/invitations/token/${token}`).then(({ data }) => setInvitation(data.invitation)).catch(() => setError('Invitation not found. (already accepted or expired)')).finally(() => setLoading(false));
  }, [token]);

  const accept = async () => {
    if (!isAuth) {
      navigate(`/login?redirect=/invitations/${token}`);
      return;
    }
    setActionLoading(true);
    setError('');
    try {
      await api.post(`/invitations/token/${token}/accept`);
      navigate('/dashboard');
    } catch (err) {
      const data = err.response?.data;
      let msg = data?.message || 'Failed to accept';
      if (data?.invitedEmail && data?.currentEmail) {
        msg = `This invitation was sent to ${data.invitedEmail}. You're logged in as ${data.currentEmail}. Log out and sign in with the invited email to accept.`;
      }
      setError(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const reject = async () => {
    if (!isAuth) {
      navigate(`/login?redirect=/invitations/${token}`);
      return;
    }
    setActionLoading(true);
    setError('');
    try {
      await api.post(`/invitations/token/${token}/reject`);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>;
  if (error && !invitation) return <div className="flex min-h-screen items-center justify-center"><Card className="w-full max-w-md"><CardContent className="pt-6"><p className="text-destructive">{error}</p><Button asChild className="mt-4"><Link to="/">Go home</Link></Button></CardContent></Card></div>;

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" /> Event invitation
          </CardTitle>
          <CardDescription>You&apos;ve been invited to collaborate</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <p className="text-sm text-destructive">{error}</p>}
          {invitation?.event && (
            <>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">{invitation.event.title}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {new Date(invitation.event.date).toLocaleString()} · Role: {invitation.role}
              </p>
              <p className="text-sm text-muted-foreground">
                Invited by {invitation.invitedBy?.name} ({invitation.invitedBy?.email})
              </p>
            </>
          )}
        </CardContent>
        <CardFooter className="flex gap-2">
          {!isAuth ? (
            <>
              <Button asChild><Link to={`/login?redirect=/invitations/${token}`}>Log in to respond</Link></Button>
              <Button variant="outline" asChild><Link to="/register">Register</Link></Button>
            </>
          ) : (
            <>
              <Button onClick={accept} disabled={actionLoading}>Accept</Button>
              <Button variant="outline" onClick={reject} disabled={actionLoading}>Reject</Button>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
