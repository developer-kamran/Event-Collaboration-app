import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '@/api/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ArrowLeft, Star } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

export function FeedbackPage() {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [stats, setStats] = useState({ avgRating: 0, count: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!eventId) return;
    api.get(`/events/${eventId}`).then(({ data }) => setEvent(data.event));
    api.get(`/feedback/${eventId}`).then(({ data }) => {
      setFeedbacks(data.feedbacks || []);
      setStats(data.stats || { avgRating: 0, count: 0 });
    }).finally(() => setLoading(false));
  }, [eventId]);

  if (loading) return <p className="text-muted-foreground">Loading...</p>;

  const ratingCounts = [1, 2, 3, 4, 5].map((r) => ({
    rating: r,
    count: feedbacks.filter((f) => f.rating === r).length,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to={`/events/${eventId}`}><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Feedback & ratings</h1>
          <p className="text-muted-foreground">{event?.title}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" /> Average rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold">{stats.avgRating?.toFixed(1) || '0'}</span>
              <span className="text-muted-foreground">/ 5</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{stats.count} feedback(s)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Rating distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={ratingCounts}>
                <XAxis dataKey="rating" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All feedback</CardTitle>
        </CardHeader>
        <CardContent>
          {feedbacks.length === 0 ? (
            <p className="text-muted-foreground">No feedback yet</p>
          ) : (
            <ul className="space-y-4">
              {feedbacks.map((f) => (
                <li key={f._id} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{f.rating} stars</Badge>
                      <span className="text-sm text-muted-foreground">{f.attendee?.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{new Date(f.createdAt).toLocaleDateString()}</span>
                  </div>
                  {f.comment && <p className="mt-2 text-sm">{f.comment}</p>}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
