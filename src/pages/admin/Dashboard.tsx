import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Briefcase, FolderOpen, FileText, Users, MessageSquare, Mail } from 'lucide-react';

export default function AdminDashboard() {
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [services, projects, posts, team, testimonials, leads] = await Promise.all([
        supabase.from('services').select('id', { count: 'exact', head: true }),
        supabase.from('projects').select('id', { count: 'exact', head: true }),
        supabase.from('blog_posts').select('id', { count: 'exact', head: true }),
        supabase.from('team_members').select('id', { count: 'exact', head: true }),
        supabase.from('testimonials').select('id', { count: 'exact', head: true }),
        supabase.from('contact_leads').select('id', { count: 'exact', head: true }),
      ]);
      return {
        services: services.count ?? 0,
        projects: projects.count ?? 0,
        posts: posts.count ?? 0,
        team: team.count ?? 0,
        testimonials: testimonials.count ?? 0,
        leads: leads.count ?? 0,
      };
    },
  });

  const cards = [
    { label: 'Services', value: stats?.services, icon: Briefcase, href: '/admin/services' },
    { label: 'Projects', value: stats?.projects, icon: FolderOpen, href: '/admin/projects' },
    { label: 'Blog Posts', value: stats?.posts, icon: FileText, href: '/admin/blog' },
    { label: 'Team Members', value: stats?.team, icon: Users, href: '/admin/team' },
    { label: 'Testimonials', value: stats?.testimonials, icon: MessageSquare, href: '/admin/testimonials' },
    { label: 'Contact Leads', value: stats?.leads, icon: Mail, href: '/admin/leads' },
  ];

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{value ?? '-'}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </AdminLayout>
  );
}
