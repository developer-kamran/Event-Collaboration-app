import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '@/api/axios';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { Input } from '@/components/ui/Input';
import { CheckCircle, Star } from 'lucide-react';

export function SubmitFeedback() {
  const { eventId, attendeeId } = useParams();
  const [event, setEvent] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { errors } } = useForm();

  useEffect(() => {
    if (!eventId) return;
    api.get(`/events/public/${eventId}`).then(({ data }) => setEvent(data.event)).catch(() => setEvent(null)).finally(() => setLoading(false));
  }, [eventId]);

  const onSubmit = async (data) => {
    setError('');
    try {
      await api.post(`/feedback/${eventId}/${attendeeId}`, { rating: Number(data.rating), comment: data.comment });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit feedback');
    }
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>;
  if (!event) return <div className="flex min-h-screen items-center justify-center"><p className="text-muted-foreground">Event not found</p></div>;
  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <CheckCircle className="h-6 w-6" />
              <span className="font-medium">Thank you! Your feedback has been submitted.</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" /> Submit feedback
          </CardTitle>
          <CardDescription>{event.title} · Rate your experience</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="space-y-2">
              <Label htmlFor="rating">Rating (1–5)</Label>
              <Input
                id="rating"
                type="number"
                min={1}
                max={5}
                {...register('rating', { required: 'Rating is required', min: 1, max: 5 })}
              />
              {errors.rating && <p className="text-sm text-destructive">{errors.rating.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="comment">Comment (optional)</Label>
              <textarea
                id="comment"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                {...register('comment')}
              />
            </div>
            <Button type="submit" className="w-full">Submit feedback</Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
