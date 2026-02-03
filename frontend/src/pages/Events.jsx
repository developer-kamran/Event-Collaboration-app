import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '@/api/axios';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Plus, Calendar, MapPin } from 'lucide-react';

export function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('my');

  useEffect(() => {
    const q = filter === 'my' ? '?my=true' : '';
    api.get(`/events${q}`).then(({ data }) => setEvents(data.events || [])).finally(() => setLoading(false));
  }, [filter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Events</h1>
          <p className="text-muted-foreground">Create and manage events</p>
        </div>
        <Button asChild>
          <Link to="/events/new"><Plus className="mr-2 h-4 w-4" />New event</Link>
        </Button>
      </div>

      <div className="flex gap-2">
        <Button variant={filter === 'my' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('my')}>
          My events
        </Button>
        <Button variant={filter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('all')}>
          All events
        </Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : events.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">No events yet</p>
            <Button asChild className="mt-4">
              <Link to="/events/new">Create event</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {events.map((e) => (
            <Card key={e._id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="line-clamp-1 text-lg">
                    <Link to={`/events/${e._id}`} className="hover:underline">{e.title}</Link>
                  </CardTitle>
                  <Badge variant={e.status === 'published' ? 'default' : 'secondary'}>{e.status}</Badge>
                </div>
                <CardDescription className="line-clamp-2">{e.description || 'No description'}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 shrink-0" />
                  {new Date(e.date).toLocaleString()}
                </div>
                {e.locationType && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 shrink-0" />
                    {e.locationType === 'online' ? 'Online' : e.location || 'TBD'}
                  </div>
                )}
                <Button variant="outline" size="sm" className="w-full mt-2" asChild>
                  <Link to={`/events/${e._id}`}>View details</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
