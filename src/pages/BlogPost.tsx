import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Calendar, User } from "lucide-react";
import { format } from "date-fns";
import { useBlogPostBySlug } from "@/hooks/useBlogPosts";

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading } = useBlogPostBySlug(slug || "");

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <Link to="/blog" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="h-4 w-4" /> Back to Blog
          </Link>

          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : post ? (
            <article>
              {post.cover_image && (
                <img src={post.cover_image} alt={post.title} className="w-full h-64 md:h-96 object-cover rounded-lg mb-8" />
              )}
              <div className="flex flex-wrap gap-2 mb-4">
                {post.blog_post_categories?.map((pc) => (
                  <Badge key={pc.category_id} variant="secondary">{pc.blog_categories?.name}</Badge>
                ))}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{post.title}</h1>
              <div className="flex items-center gap-4 text-muted-foreground mb-8">
                {post.team_members && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{post.team_members.name}</span>
                  </div>
                )}
                {post.published_at && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(post.published_at), "MMMM d, yyyy")}</span>
                  </div>
                )}
              </div>
              <div className="prose prose-lg max-w-none text-foreground">
                {post.content?.split("\n").map((p, i) => <p key={i}>{p}</p>)}
              </div>
            </article>
          ) : (
            <div className="text-center py-16">
              <h2 className="text-2xl font-bold text-foreground mb-2">Post Not Found</h2>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
