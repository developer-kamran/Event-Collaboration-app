import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '@/api/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { ArrowLeft, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';

const TASK_STATUS = ['pending', 'in_progress', 'completed'];

export function TaskBoard() {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', assignedTo: '', dueDate: '', status: 'pending' });

  const load = async () => {
    if (!eventId) {
      setLoading(false);
      setError('Event not found');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const eventRes = await api.get(`/events/${eventId}`);
      setEvent(eventRes.data.event);
    } catch (e) {
      console.error(e);
      setError(e.response?.data?.message || 'Failed to load event');
    }
    try {
      const tasksRes = await api.get(`/tasks/${eventId}`);
      const taskList = Array.isArray(tasksRes.data?.tasks) ? tasksRes.data.tasks : [];
      setTasks(taskList);
      const assignees = taskList.map((t) => t.assignedTo).filter(Boolean);
      const uniqueIds = [...new Set(assignees.map((a) => (a && typeof a === 'object' && a._id ? a._id : a)))];
      setUsers(uniqueIds.map((id) => {
        const assignee = assignees.find((a) => (a?._id ?? a)?.toString() === id?.toString());
        return { _id: id, name: assignee?.name || 'User' };
      }));
    } catch (e) {
      console.error(e);
      setTasks([]);
      setError(e.response?.data?.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [eventId]);

  const createTask = async (e) => {
    e?.preventDefault?.();
    if (!form.title?.trim()) return;
    try {
      await api.post(`/tasks/${eventId}`, {
        title: form.title.trim(),
        description: form.description?.trim() || undefined,
        assignedTo: form.assignedTo || undefined,
        dueDate: form.dueDate || undefined,
        status: form.status || 'pending',
      });
      setForm({ title: '', description: '', assignedTo: '', dueDate: '', status: 'pending' });
      setOpen(false);
      await load();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to create task');
    }
  };

  const updateStatus = async (taskId, status) => {
    try {
      // Optimistic update so UI updates immediately
      setTasks((prev) => prev.map((t) => (t._id === taskId ? { ...t, status } : t)));
      await api.put(`/tasks/${eventId}/${taskId}`, { status });
      await load();
    } catch (err) {
      console.error(err);
      await load(); // Revert on error
    }
  };

  const byStatus = (s) => (tasks || []).filter((t) => (t.status || 'pending') === s);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to={eventId ? `/events/${eventId}` : '/events'}><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Tasks</h1>
          <p className="text-muted-foreground">{event?.title || (eventId ? 'Loading...' : 'Event not found')}</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Add task</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New task</DialogTitle>
              <DialogDescription>Add a task to this event</DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createTask(e);
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="task-title">Title</Label>
                <Input
                  id="task-title"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Task title"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <textarea className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Due date</Label>
                <Input type="datetime-local" value={form.dueDate} onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))} />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="button" onClick={() => createTask({ preventDefault: () => {} })}>Create</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground">Loading tasks...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {TASK_STATUS.map((status) => (
            <Card key={status}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base capitalize">{status.replace('_', ' ')} ({byStatus(status).length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {byStatus(status).map((t) => (
                  <div key={t._id || t.title} className="rounded-lg border bg-card p-3">
                    <p className="font-medium">{t.title}</p>
                    {t.description && <p className="text-sm text-muted-foreground line-clamp-2">{t.description}</p>}
                    {t.assignedTo?.name && <p className="text-xs text-muted-foreground">Assigned to {t.assignedTo.name}</p>}
                    <Select value={t.status || 'pending'} onValueChange={(v) => updateStatus(t._id, v)}>
                      <SelectTrigger className="mt-2 h-8"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {TASK_STATUS.map((s) => <SelectItem key={s} value={s}>{s.replace('_', ' ')}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
