import { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import api from '@/api/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const start = new Date();
    start.setMonth(start.getMonth() - 1);
    const end = new Date();
    end.setMonth(end.getMonth() + 3);
    api.get(`/events/calendar?start=${start.toISOString()}&end=${end.toISOString()}`).then(({ data }) => {
      setEvents(data.events || []);
    }).finally(() => setLoading(false));
  }, []);

  const handleDatesSet = (arg) => {
    api.get(`/events/calendar?start=${arg.startStr}&end=${arg.endStr}`).then(({ data }) => {
      setEvents(data.events || []);
    });
  };

  if (loading) return <p className="text-muted-foreground">Loading calendar...</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
        <p className="text-muted-foreground">Your events and task deadlines</p>
      </div>
      <Card>
        <CardContent className="p-4">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,listWeek' }}
            events={events}
            datesSet={handleDatesSet}
            height="auto"
            eventClick={(info) => {
              const id = info.event.extendedProps?.eventId || info.event.id;
              if (id && !String(id).startsWith('task-')) window.location.href = `/events/${id}`;
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
