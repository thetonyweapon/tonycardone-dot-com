import Layout from '../components/Layout';
import SEO from '../components/SEO';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        // Using Vite's import.meta.glob with ?raw to import markdown content as raw strings
        const modules = import.meta.glob('/src/blogposts/*.md', {
          query: '?raw',
          import: 'default',
          eager: true
        });
        
        const postsArray = [];
        
        for (const path in modules) {
          const slug = path.split('/').pop().replace('.md', '');
          const markdownContent = modules[path];
          
          // Extract title from first heading
          const titleMatch = markdownContent.match(/^#\s+(.+)$/m);
          const title = titleMatch ? titleMatch[1] : 'Untitled Post';
          
          // Generate excerpt from first paragraph (skip meta lines and headers)
          const contentWithoutMeta = markdownContent.replace(/^(date|tag):.*$/gm, '').trim();
          const fullWordCount = contentWithoutMeta.split(/\s+/).filter(Boolean).length;
          const contentWithoutHeaders = contentWithoutMeta.replace(/^#+.*$/gm, '').trim();
          const firstParagraphMatch = contentWithoutHeaders.match(/^([^\n]+(?:\n[^\n]+)*)/);
          let excerpt = firstParagraphMatch ? firstParagraphMatch[1].trim() : '';
          // Limit excerpt to reasonable length
          if (excerpt.length > 200) {
            excerpt = excerpt.substring(0, 200) + '...';
          }
          
           // Extract date from "date:" line in markdown (month-day-year format)
           const dateMatch = markdownContent.match(/^date:\s*(\d{2})-(\d{2})-(\d{4})$/m);
           let date = '';
           if (dateMatch) {
              const [, month, day, year] = dateMatch;
              const d = new Date(+year, +month - 1, +day);
             date = d.toLocaleDateString('en-US', {
               year: 'numeric',
               month: 'long',
               day: 'numeric'
             });
           }
          
            const tagMatch = markdownContent.match(/^tag:\s*(.+)$/m);
            const tags = tagMatch ? [tagMatch[1].trim()] : [];

            postsArray.push({
              slug,
              title,
              date,
              excerpt,
              tags,
              fullWordCount
            });
        }
        
        // Sort posts by date (newest first) - for now just reverse the array
        setPosts(postsArray.reverse());
        setLoading(false);
      } catch (err) {
        console.error('Error loading blog posts:', err);
        setError('Failed to load blog posts');
        setLoading(false);
      }
    };
    
    loadPosts();
  }, []);

  return (
    <Layout>
      <SEO
        title="Thoughts"
        description="A collection of thoughts, experiences, and reflections on software engineering, leadership, and life."
        path="/blog"
      />
      <div className="min-h-[calc(100vh-4rem)] flex flex-col">
        <div className="w-[80%] mx-auto p-4 lg:p-8 flex-1">
          <div className="flex flex-col items-center py-12">
          <h1 className="text-3xl font-bold text-foreground mb-8 animate-fade-in">
            Blog
          </h1>
          <p className="text-muted-foreground/60 mb-8 max-w-xl animate-fade-in delay-100 text-center">
            A collection of thoughts on software development, technology, and continuous learning.
          </p>
           <div className="space-y-8">
             {loading ? (
               <div className="text-center py-8">
                 <div className="w-8 h-8 border-2 border-primary/50 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-muted-foreground/60">Loading posts...</p>
               </div>
             ) : error ? (
               <div className="text-center py-8">
                 <h2 className="text-2xl font-bold text-foreground mb-4">Error loading posts</h2>
                  <p className="text-muted-foreground/60">{error}</p>
               </div>
             ) : posts.length === 0 ? (
               <div className="text-center py-8">
                 <h2 className="text-2xl font-bold text-foreground mb-4">No posts found</h2>
                  <p className="text-muted-foreground/60">Check back later for new blog posts.</p>
               </div>
             ) : (
               posts.map((post) => (
                 <div 
                   key={post.slug} 
                   className="border-b border-border/50 pb-8 last:border-b-0 last:pb-0 hover:bg-accent/5 transition-colors rounded-lg animate-fade-in"
                 >
                   <Link to={`/blog/${post.slug}`} className="block">
                     <div className="flex flex-col md:flex-row md:items-start md:space-x-6">
                       <div className="flex-shrink-0">
                         <time className="text-xs text-muted-foreground/50 uppercase tracking-wider">
                           {post.date.split(' ')[0]}
                         </time>
                         <time className="block text-sm font-medium text-muted-foreground/40">
                           {post.date.split(' ').slice(1).join(' ')}
                         </time>
                       </div>
                       <div className="flex-1">
                          <h2 className="text-2xl font-semibold text-foreground mb-2 hover:text-primary transition-colors">
                           {post.title}
                         </h2>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {post.tags.map((tag) => (
                              <span
                                key={tag}
                                className="bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-200 text-xs font-medium px-2.5 py-0.5 rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                          <p className="text-muted-foreground/80 max-w-md leading-relaxed line-clamp-3">
                            {post.excerpt}
                          </p>
                       </div>
                     </div>
                     <div className="mt-4 flex items-center">
                       <span className="text-xs text-muted-foreground/40">
                          {Math.max(1, Math.round(post.fullWordCount / 200))} min read
                       </span>
                     </div>
                   </Link>
                 </div>
               ))
             )}
           </div>
          
          {/* Call to action for more content */}
          <div className="mt-12 pt-8 border-t border-border/50 text-center">
            <p className="text-muted-foreground/60 mb-4">
              Want to see more? Check back regularly for new posts!
            </p>
            <Link 
              to="/blog" 
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50"
            >
              View All Posts
            </Link>
          </div>
        </div>
      </div>
      </div>
    </Layout>
  );
};

export default Blog;