import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '@/api/axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Calendar, MapPin, Users, ListTodo, Mail, UserPlus } from 'lucide-react';

export function EventDetail() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [attendees, setAttendees] = useState([]);
  const [collaborators, setCollaborators] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      api.get(`/events/${id}`),
      api.get(`/tasks/${id}`).catch(() => ({ data: { tasks: [] } })),
      api.get(`/attendees/${id}`).catch(() => ({ data: { attendees: [] } })),
    ]).then(([ev, t, a]) => {
      setEvent(ev.data.event);
      setTasks(t.data.tasks || []);
      setAttendees(a.data.attendees || []);
      setCollaborators(ev.data.event?.collaborators || []);
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading || !event) {
    return <div className="flex items-center justify-center py-12"><p className="text-muted-foreground">Loading...</p></div>;
  }

  const isOrganizer = event.createdBy?._id || event.createdBy === event.createdBy;
  const canManage = true; // assume user has access from route guard

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">{event.title}</h1>
            <Badge variant={event.status === 'published' ? 'default' : 'secondary'}>{event.status}</Badge>
          </div>
          <p className="mt-1 text-muted-foreground">{event.description || 'No description'}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild><Link to={`/events/${id}/edit`}>Edit</Link></Button>
          <Button asChild><Link to={`/events/${id}/tasks`}>Tasks</Link></Button>
          <Button asChild><Link to={`/events/${id}/attendees`}>Attendees</Link></Button>
          <Button asChild><Link to={`/events/${id}/feedback`}>Feedback</Link></Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-4 w-4" /> Date & time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>{new Date(event.date).toLocaleString()}</p>
            {event.endDate && <p className="text-sm text-muted-foreground">End: {new Date(event.endDate).toLocaleString()}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="h-4 w-4" /> Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>{event.locationType === 'online' ? 'Online' : event.location || 'TBD'}</p>
            {event.locationType === 'online' && event.onlineLink && (
              <a href={event.onlineLink} target="_blank" rel="noreferrer" className="text-primary hover:underline text-sm">{event.onlineLink}</a>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tasks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tasks">Tasks ({tasks.length})</TabsTrigger>
          <TabsTrigger value="attendees">Attendees ({attendees.length})</TabsTrigger>
          <TabsTrigger value="collaborators">Collaborators ({collaborators.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="tasks" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Tasks</h3>
            <Button size="sm" asChild><Link to={`/events/${id}/tasks`}><ListTodo className="mr-2 h-4 w-4" />Manage tasks</Link></Button>
          </div>
          {tasks.length === 0 ? (
            <p className="text-muted-foreground">No tasks yet</p>
          ) : (
            <ul className="space-y-2">
              {tasks.slice(0, 5).map((t) => (
                <li key={t._id} className="flex items-center justify-between rounded-md border p-3">
                  <span>{t.title}</span>
                  <Badge variant="secondary">{t.status}</Badge>
                </li>
              ))}
              {tasks.length > 5 && <p className="text-sm text-muted-foreground">+{tasks.length - 5} more</p>}
            </ul>
          )}
        </TabsContent>
        <TabsContent value="attendees" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Attendees</h3>
            <Button size="sm" asChild><Link to={`/events/${id}/attendees`}><Users className="mr-2 h-4 w-4" />Manage</Link></Button>
          </div>
          {attendees.length === 0 ? (
            <p className="text-muted-foreground">No attendees yet</p>
          ) : (
            <ul className="space-y-2">
              {attendees.slice(0, 5).map((a) => (
                <li key={a._id} className="flex items-center justify-between rounded-md border p-3">
                  <span>{a.name} ({a.email})</span>
                  {a.checkedIn ? <Badge>Checked in</Badge> : <Badge variant="secondary">Pending</Badge>}
                </li>
              ))}
              {attendees.length > 5 && <p className="text-sm text-muted-foreground">+{attendees.length - 5} more</p>}
            </ul>
          )}
        </TabsContent>
        <TabsContent value="collaborators" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Collaborators</h3>
            <Button size="sm" asChild><Link to={`/events/${id}/invite`}><UserPlus className="mr-2 h-4 w-4" />Invite</Link></Button>
          </div>
          <ul className="space-y-2">
            {event.createdBy && (
              <li className="flex items-center justify-between rounded-md border p-3">
                <span>{event.createdBy.name} ({event.createdBy.email})</span>
                <Badge>Organizer</Badge>
              </li>
            )}
            {collaborators.map((c) => (
              <li key={c.user?._id || c.user} className="flex items-center justify-between rounded-md border p-3">
                <span>{c.user?.name} ({c.user?.email})</span>
                <Badge variant="secondary">{c.role}</Badge>
              </li>
            ))}
          </ul>
        </TabsContent>
      </Tabs>
    </div>
  );
}
