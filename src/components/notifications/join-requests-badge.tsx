import { Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getPendingCount } from '@/lib/join-requests-api';
import { useEffect, useState } from 'react';
import { useLink } from '@refinedev/core';

export function JoinRequestsBadge() {
  const Link = useLink();
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCount = async () => {
      try {
        const c = await getPendingCount();
        setCount(c);
      } catch (e) {
        console.error('Failed to load pending count:', e);
      } finally {
        setLoading(false);
      }
    };
    loadCount();
    const interval = setInterval(loadCount, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading || count === 0) {
    return null;
  }

  return (
    <Link to="/join-requests">
      <Button variant="outline" size="sm" className="relative">
        <Bell className="h-4 w-4" />
        {count > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {count > 9 ? '9+' : count}
          </Badge>
        )}
        <span className="ml-2 hidden sm:inline">Join Requests</span>
      </Button>
    </Link>
  );
}
