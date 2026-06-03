import Layout from '../components/Layout';
import SEO from '../components/SEO';
import { Link } from 'react-router-dom';
import downtownAustin from '../assets/downtown_austin.JPG';
import headshot from '../assets/headshot.jpg';

const Home = () => {
  return (
    <Layout>
      <SEO
        title="Home"
        description="Soccer person, traveler, and a software engineer / architect / manager based in Austin, TX."
        path="/"
      />
      <div className="min-h-screen flex flex-col">
        {/* Hero */}
        <div className="relative h-screen max-h-[70vh] min-h-[500px] overflow-hidden">
          <img
            src={downtownAustin}
            alt="Downtown Austin skyline"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />

          <div className="relative z-10 flex flex-col items-center justify-end h-full pb-16 px-4 text-center">
            <img
              src={headshot}
              alt="Tony Cardone"
              className="w-28 h-28 rounded-full object-cover border-4 border-white/30 shadow-lg mb-6 animate-fade-in"
            />
            <h1 className="text-4xl font-bold text-white mb-3 animate-fade-in delay-100" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.7), 0 1px 4px rgba(0,0,0,0.5)' }}>
              Howdy. I'm Tony.
            </h1>
            <p className="text-lg text-white mb-6 animate-fade-in delay-200" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.7), 0 1px 3px rgba(0,0,0,0.5)' }}>
              Soccer person, traveler, and a software engineer / architect / manager depending on who you ask.
            </p>
            <div className="flex justify-center space-x-4 flex-wrap animate-fade-in delay-300">
              <Link to="/resume"
                    className="bg-primary/90 hover:bg-primary/80 text-primary-foreground font-bold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2">
                View My Resume
                <svg width="16" height="16" className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </Link>
              <Link to="/blog"
                    className="bg-accent/90 hover:bg-accent/80 text-accent-foreground font-bold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2">
                Thoughts
                <svg width="16" height="16" className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Blended background section */}
        <div className="flex-1 bg-gradient-to-b from-background to-primary/5 pb-8">
          <div className="flex-1 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-10 left-1/2 -z-10 w-40 h-40 bg-primary/5 rounded-full animate-float" />
              <div className="absolute -bottom-10 right-1/2 -z-10 w-32 h-32 bg-accent/5 rounded-full animate-float delay-200" />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;