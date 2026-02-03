import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '@/api/axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Calendar, Plus, Users, ListTodo } from 'lucide-react';

export function Dashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/events?my=true').then(({ data }) => {
      setEvents(data.events || []);
    }).finally(() => setLoading(false));
  }, []);

  const upcoming = events.filter((e) => new Date(e.date) >= new Date()).slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your events and tasks</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events.length}</div>
            <p className="text-xs text-muted-foreground">Total events you&apos;re part of</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <ListTodo className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcoming.length}</div>
            <p className="text-xs text-muted-foreground">Next 5 upcoming</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Upcoming events</CardTitle>
            <CardDescription>Events you created or collaborate on</CardDescription>
          </div>
          <Button asChild>
            <Link to="/events/new">
              <Plus className="mr-2 h-4 w-4" />
              New event
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : upcoming.length === 0 ? (
            <p className="text-muted-foreground">No upcoming events. Create one or accept an invitation.</p>
          ) : (
            <ul className="space-y-4">
              {upcoming.map((e) => (
                <li key={e._id} className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <Link to={`/events/${e._id}`} className="font-medium hover:underline">
                      {e.title}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {new Date(e.date).toLocaleString()} · {e.status}
                    </p>
                  </div>
                  <Badge variant={e.status === 'published' ? 'default' : 'secondary'}>{e.status}</Badge>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/events/${e._id}`}>View</Link>
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
