import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '@/api/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { ArrowLeft, QrCode, CheckCircle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export function Attendees() {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qrPayload, setQrPayload] = useState('');
  const [checkInResult, setCheckInResult] = useState(null);

  const load = () => {
    if (!eventId) return;
    api.get(`/events/${eventId}`).then(({ data }) => setEvent(data.event));
    api.get(`/attendees/${eventId}`).then(({ data }) => setAttendees(data.attendees || [])).finally(() => setLoading(false));
  };

  useEffect(() => load(), [eventId]);

  const handleCheckIn = async (e) => {
    e.preventDefault();
    setCheckInResult(null);
    try {
      const { data } = await api.post(`/attendees/${eventId}/check-in`, { qrPayload });
      setCheckInResult({ success: true, attendee: data.attendee });
      setQrPayload('');
      load();
    } catch (err) {
      setCheckInResult({ success: false, message: err.response?.data?.message || 'Check-in failed' });
    }
  };

  if (loading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to={`/events/${eventId}`}><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Attendees</h1>
          <p className="text-muted-foreground">{event?.title} · {attendees.length} registered</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" /> QR Check-in
          </CardTitle>
          <p className="text-sm text-muted-foreground">Paste attendee QR payload or scan to mark check-in</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleCheckIn} className="flex gap-2">
            <Input
              placeholder="Paste QR payload here"
              value={qrPayload}
              onChange={(e) => setQrPayload(e.target.value)}
              className="flex-1"
            />
            <Button type="submit">Check in</Button>
          </form>
          {checkInResult && (
            <div className={`rounded-lg border p-4 ${checkInResult.success ? 'border-green-500 bg-green-50 dark:bg-green-950/20' : 'border-destructive bg-destructive/10'}`}>
              {checkInResult.success ? (
                <p className="text-sm font-medium text-green-700 dark:text-green-400">Checked in: {checkInResult.attendee?.name}</p>
              ) : (
                <p className="text-sm text-destructive">{checkInResult.message}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Attendee list</CardTitle>
          <p className="text-sm text-muted-foreground">{attendees.length} registered</p>
        </CardHeader>
        <CardContent>
          {attendees.length === 0 ? (
            <p className="text-muted-foreground">No attendees yet</p>
          ) : (
            <div className="space-y-2">
              {attendees.map((a) => (
                <div key={a._id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium">{a.name}</p>
                    <p className="text-sm text-muted-foreground">{a.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {a.qrPayload && (
                      <QRCodeSVG value={a.qrPayload} size={48} level="M" />
                    )}
                    <Badge variant={a.checkedIn ? 'default' : 'secondary'}>
                      {a.checkedIn ? 'Checked in' : 'Pending'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
