import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '@/api/axios';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { QRCodeSVG } from 'qrcode.react';
import { Calendar, MapPin, CheckCircle } from 'lucide-react';

export function PublicEvent() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [registered, setRegistered] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { errors } } = useForm();

  useEffect(() => {
    if (!id) return;
    api.get(`/events/public/${id}`).then(({ data }) => setEvent(data.event)).catch(() => setEvent(null)).finally(() => setLoading(false));
  }, [id]);

  const onSubmit = async (data) => {
    setError('');
    setSubmitLoading(true);
    try {
      const { data: res } = await api.post(`/attendees/${id}/register`, data);
      setRegistered(res.attendee);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>;
  if (!event) return <div className="flex min-h-screen items-center justify-center"><p className="text-muted-foreground">Event not found</p></div>;
  if (event.status !== 'published') return <div className="flex min-h-screen items-center justify-center"><p className="text-muted-foreground">This event is not open for registration</p></div>;

  if (registered) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <CheckCircle className="h-6 w-6" /> Registration confirmed
            </CardTitle>
            <CardDescription>Save your QR code for check-in at the event</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="font-medium">{registered.name}</p>
            <p className="text-sm text-muted-foreground">{registered.email}</p>
            {registered.qrPayload && (
              <div className="flex justify-center rounded-lg border bg-white p-4">
                <QRCodeSVG value={registered.qrPayload} size={200} level="M" />
              </div>
            )}
            <p className="text-center text-sm text-muted-foreground">Show this QR code at the event for check-in</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-lg space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{event.title}</CardTitle>
            <CardDescription>{event.description || 'No description'}</CardDescription>
            <div className="flex flex-col gap-2 pt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {new Date(event.date).toLocaleString()}
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {event.locationType === 'online' ? 'Online' : event.location || 'TBD'}
              </div>
            </div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Register for this event</CardTitle>
            <CardDescription>Fill in your details to register</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" {...register('name', { required: 'Name is required' })} />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register('email', { required: 'Email is required' })} />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone (optional)</Label>
                <Input id="phone" {...register('phone')} />
              </div>
              <Button type="submit" className="w-full" disabled={submitLoading}>
                {submitLoading ? 'Registering...' : 'Register'}
              </Button>
            </CardContent>
          </form>
        </Card>
      </div>
    </div>
  );
}
