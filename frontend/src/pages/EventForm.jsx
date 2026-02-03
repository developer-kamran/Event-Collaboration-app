import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '@/api/axios';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';

const STATUS_OPTIONS = ['draft', 'published', 'completed'];
const LOCATION_OPTIONS = ['online', 'offline'];

export function EventForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(!!id);
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: { title: '', description: '', date: '', endDate: '', locationType: 'offline', location: '', onlineLink: '', maxAttendees: 0, status: 'draft' },
  });

  const locationType = watch('locationType');

  useEffect(() => {
    if (!id) return;
    api.get(`/events/${id}`).then(({ data }) => {
      const e = data.event;
      setValue('title', e.title);
      setValue('description', e.description || '');
      setValue('date', e.date ? new Date(e.date).toISOString().slice(0, 16) : '');
      setValue('endDate', e.endDate ? new Date(e.endDate).toISOString().slice(0, 16) : '');
      setValue('locationType', e.locationType || 'offline');
      setValue('location', e.location || '');
      setValue('onlineLink', e.onlineLink || '');
      setValue('maxAttendees', e.maxAttendees || 0);
      setValue('status', e.status || 'draft');
    }).finally(() => setLoading(false));
  }, [id, setValue]);

  const onSubmit = async (data) => {
    setError('');
    const payload = {
      ...data,
      date: new Date(data.date).toISOString(),
      endDate: data.endDate ? new Date(data.endDate).toISOString() : undefined,
      maxAttendees: Number(data.maxAttendees) || 0,
    };
    try {
      if (id) {
        await api.put(`/events/${id}`, payload);
        navigate(`/events/${id}`);
      } else {
        const { data: res } = await api.post('/events', payload);
        navigate(`/events/${res.event._id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save');
    }
  };

  if (loading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{id ? 'Edit event' : 'New event'}</h1>
        <p className="text-muted-foreground">Fill in the event details</p>
      </div>
      <Card>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Details</CardTitle>
            <CardDescription>Title, description, date and location</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" {...register('title', { required: 'Title is required' })} />
              {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea id="description" className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" {...register('description')} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Start date & time</Label>
                <Input id="date" type="datetime-local" {...register('date', { required: 'Date is required' })} />
                {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End date & time (optional)</Label>
                <Input id="endDate" type="datetime-local" {...register('endDate')} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Location type</Label>
              <Select value={locationType} onValueChange={(v) => setValue('locationType', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {LOCATION_OPTIONS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {locationType === 'offline' ? (
              <div className="space-y-2">
                <Label htmlFor="location">Address / venue</Label>
                <Input id="location" {...register('location')} placeholder="Venue or address" />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="onlineLink">Online link</Label>
                <Input id="onlineLink" type="url" {...register('onlineLink')} placeholder="https://..." />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="maxAttendees">Max attendees (0 = unlimited)</Label>
              <Input id="maxAttendees" type="number" min={0} {...register('maxAttendees')} />
            </div>
            {id && (
              <div className="space-y-2">
                <Label>Status</Label>
                <Select name="status" value={watch('status')} onValueChange={(v) => setValue('status', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit">{id ? 'Save' : 'Create'}</Button>
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
