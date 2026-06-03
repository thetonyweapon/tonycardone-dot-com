import Layout from '../components/Layout';
import SEO from '../components/SEO';
import { Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import { unified } from 'unified';

const BlogPost = () => {
  const { slug } = useParams();
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [tag, setTag] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPost = async () => {
      try {
        // Using Vite's import.meta.glob with ?raw to import markdown content as raw strings
        const modules = import.meta.glob('/src/blogposts/*.md', {
          query: '?raw',
          import: 'default',
          eager: true
        });
        const modulePath = `/src/blogposts/${slug}.md`;
        
        if (modules[modulePath]) {
          const markdownContent = modules[modulePath];

          // Extract title from first heading
          const titleMatch = markdownContent.match(/^#\s+(.+)$/m);
          setTitle(titleMatch ? titleMatch[1] : 'Blog Post');

          // Extract date from "date:" line (month-day-year format)
          const dateMatch = markdownContent.match(/^date:\s*(\d{2})-(\d{2})-(\d{4})$/m);
          if (dateMatch) {
            const [, month, day, year] = dateMatch;
            const d = new Date(+year, +month - 1, +day);
            setDate(d.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }));
          }

          // Extract tag from "tag:" line
          const tagMatch = markdownContent.match(/^tag:\s*(.+)$/m);
          if (tagMatch) setTag(tagMatch[1].trim());

          // Strip meta lines (date: etc.) and the first heading so it doesn't duplicate in the rendered content
          const contentWithoutMeta = markdownContent.replace(/^(date|tag):.*\n*/gm, '');
          const contentWithoutTitle = contentWithoutMeta.replace(/^#\s+.*\n*/m, '');

          // Process markdown to HTML using unified
          const processed = await unified()
            .use(remarkParse)
            .use(remarkRehype)
            .use(rehypeStringify)
            .process(contentWithoutTitle);
          
          setContent(String(processed));
          setLoading(false);
        } else {
          setError('Post not found');
          setLoading(false);
        }
      } catch (err) {
        console.error('Error loading blog post:', err);
        setError('Error loading post');
        setLoading(false);
      }
    };

    if (slug) {
      loadPost();
    }
  }, [slug]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4 animate-fade-in">
              Loading...
            </h2>
            <div className="w-8 h-8 border-2 border-primary/50 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 py-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4 animate-fade-in">
              {error}
            </h2>
            <p className="text-muted-foreground/60 max-w-xl">
              The blog post you're looking for doesn't exist.
            </p>
             <Link 
               to="/blog" 
                className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50 transition-colors"
             >
               Return to Blog
               <svg width="16" height="16" className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                       d="M9 5l6 6m0 0l-6 6m6-6H9"/>
               </svg>
             </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO
        title={title}
        description={`Blog post: ${title}`}
        path={`/blog/${slug}`}
        type="article"
      />
      <div className="min-h-[calc(100vh-4rem)] flex flex-col">
        <div className="w-[80%] mx-auto p-4 lg:p-8 flex-1">
          <div className="flex flex-col items-center py-6">
            <nav className="w-full mb-4 text-sm text-muted-foreground/60 animate-fade-in">
              <Link to="/blog" className="hover:text-foreground transition-colors">Blog</Link>
              <span className="mx-2">&rsaquo;</span>
              <span className="text-muted-foreground/80">{title}</span>
            </nav>
            {(date || tag) && (
              <p className="text-sm text-muted-foreground/60 mb-2 animate-fade-in delay-100">
                {date}{date && tag && <span> | </span>}{tag}
              </p>
            )}
            <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground mb-2 animate-fade-in tracking-tight leading-tight">
              {title}
            </h1>
            <div className="w-16 h-1 bg-primary rounded-full mb-6 animate-fade-in delay-150"></div>
            
            <div 
              className="prose lg:prose-xl dark:prose-invert max-w-none w-[95%]"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BlogPost;