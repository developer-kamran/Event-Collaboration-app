import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '@/api/axios';
import { useDispatch, useSelector } from 'react-redux';
import { setNotifications, markRead, markAllRead } from '@/store/slices/notificationsSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Bell, CheckCheck } from 'lucide-react';

export function NotificationsPage() {
  const dispatch = useDispatch();
  const notifications = useSelector((s) => s.notifications.list);

  useEffect(() => {
    api.get('/notifications').then(({ data }) => dispatch(setNotifications(data.notifications || [])));
  }, [dispatch]);

  const handleMarkRead = (id) => {
    api.patch(`/notifications/${id}/read`).then(() => dispatch(markRead(id)));
  };

  const handleMarkAllRead = () => {
    api.patch('/notifications/read-all').then(() => dispatch(markAllRead()));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">Your in-app notifications</p>
        </div>
        {notifications.some((n) => !n.read) && (
          <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
            <CheckCheck className="mr-2 h-4 w-4" /> Mark all read
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" /> All notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <p className="text-muted-foreground">No notifications</p>
          ) : (
            <ul className="space-y-2">
              {notifications.map((n) => (
                <li
                  key={n._id}
                  className={`flex items-center justify-between rounded-lg border p-4 ${!n.read ? 'bg-muted/50' : ''}`}
                >
                  <div className="flex-1">
                    <p className="font-medium">{n.title}</p>
                    {n.message && <p className="text-sm text-muted-foreground">{n.message}</p>}
                    <p className="text-xs text-muted-foreground mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {n.link && (
                      <Button variant="outline" size="sm" asChild>
                        <Link to={n.link}>View</Link>
                      </Button>
                    )}
                    {!n.read && (
                      <Button variant="ghost" size="sm" onClick={() => handleMarkRead(n._id)}>
                        Mark read
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
