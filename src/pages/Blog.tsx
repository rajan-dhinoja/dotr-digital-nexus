import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User } from "lucide-react";

const Blog = () => {
  const posts = [
    {
      title: "10 Design Trends Shaping 2024",
      excerpt: "Explore the latest design trends that are transforming digital experiences and brand identities.",
      category: "Design",
      author: "Sarah Chen",
      date: "March 15, 2024",
      image: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800&q=80",
    },
    {
      title: "Building Scalable Web Applications",
      excerpt: "Best practices and architectural patterns for creating web apps that grow with your business.",
      category: "Development",
      author: "Marcus Johnson",
      date: "March 10, 2024",
      image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80",
    },
    {
      title: "The Future of Digital Marketing",
      excerpt: "How AI and automation are revolutionizing marketing strategies and customer engagement.",
      category: "Marketing",
      author: "Emma Thompson",
      date: "March 5, 2024",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
    },
    {
      title: "Video Content Strategy for Brands",
      excerpt: "Creating compelling video content that resonates with your audience and drives results.",
      category: "Creative",
      author: "Alex Rodriguez",
      date: "February 28, 2024",
      image: "https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?w=800&q=80",
    },
    {
      title: "Mobile-First Design Principles",
      excerpt: "Essential principles for designing exceptional mobile experiences in a mobile-first world.",
      category: "Design",
      author: "Sarah Chen",
      date: "February 20, 2024",
      image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80",
    },
    {
      title: "SEO in 2024: What's Changed",
      excerpt: "Understanding the latest SEO trends and algorithm updates to boost your search rankings.",
      category: "Marketing",
      author: "Emma Thompson",
      date: "February 15, 2024",
      image: "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=800&q=80",
    },
  ];

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
            {posts.map((post, index) => (
              <Card
                key={index}
                className="border-border overflow-hidden hover:shadow-xl transition-all group cursor-pointer"
              >
                <div className="aspect-video overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <CardContent className="pt-6">
                  <Badge className="mb-3">{post.category}</Badge>
                  <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-muted-foreground mb-4">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      <span>{post.author}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{post.date}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Blog;
