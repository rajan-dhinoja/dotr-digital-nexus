import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, User } from "lucide-react";
import { useBlogPosts } from "@/hooks/useBlogPosts";
import { format } from "date-fns";

const Blog = () => {
  const { data: posts, isLoading } = useBlogPosts();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
              Blog & Insights
            </h1>
            <p className="text-xl text-muted-foreground">
              Industry insights, tips, and trends from our team of experts in design, development,
              marketing, and creative.
            </p>
          </div>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="pb-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading ? (
              [...Array(6)].map((_, i) => (
                <Card key={i} className="border-border overflow-hidden">
                  <Skeleton className="aspect-video" />
                  <CardContent className="pt-6">
                    <Skeleton className="h-6 w-20 mb-3" />
                    <Skeleton className="h-7 w-full mb-2" />
                    <Skeleton className="h-16 w-full mb-4" />
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              posts?.map((post) => {
                const category = post.blog_post_categories?.[0]?.blog_categories?.name || "Article";
                const authorName = post.team_members?.name || "DOTR Team";
                const publishedDate = post.published_at 
                  ? format(new Date(post.published_at), "MMMM d, yyyy")
                  : "";

                return (
                  <Link key={post.id} to={`/blog/${post.slug}`}>
                    <Card className="border-border overflow-hidden hover:shadow-xl transition-all group cursor-pointer h-full">
                      <div className="aspect-video overflow-hidden">
                        <img
                          src={post.cover_image || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80"}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <CardContent className="pt-6">
                        <Badge className="mb-3">{category}</Badge>
                        <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                          {post.title}
                        </h3>
                        <p className="text-muted-foreground mb-4">{post.excerpt}</p>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            <span>{authorName}</span>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>{publishedDate}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Blog;
