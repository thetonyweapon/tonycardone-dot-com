import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import q2Stadium from '../assets/q2_stadium.jpg';

const SECTION_META = {
  stadium: { icon: '\u{1F3DF}', label: 'Stadium', color: '#7B2D8E' },
  city: { icon: '\u{1F306}', label: 'City', color: '#E87A00' },
  transit: { icon: '\u{1F688}', label: 'Transit', color: '#0077B6' },
  running: { icon: '\u{1F45F}', label: 'Running', color: '#D62828' },
};

const SCORE_DESCRIPTIONS = {
  stadium: [
    { range: '0-6', label: 'There are glaring issues with this stadium that might affect the ability to enjoy the game.' },
    { range: '7', label: 'Solid stadium with some noticable problems.' },
    { range: '8', label: 'A very good stadium with a few minor issues that need to be addressed. Some people may not even notice these things.' },
    { range: '9', label: 'This is a great stadium but has a minor thing holding it back.' },
    { range: '10', label: 'World-class stadium in every aspect' },
  ],
  city: [
    { range: '0-6', label: 'It just wasn\'t for me.' },
    { range: '7', label: 'Enjoyable city with some highlights, but probably wouldn\'t prioritize it going forward.' },
    { range: '8', label: 'A very good city that offers a lot to do.' },
    { range: '9', label: 'A destination city with lots to explore.' },
    { range: '10', label: 'World-class city with unparalleled gameday options and I would never hesitate to recommend it to others.' },
  ],
  transit: [
    { range: '0-6', label: 'Limited or no transit options, requires a car or rideshare nearly everywhere.' },
    { range: '7', label: 'Options exist but are slightly inconvenient, and may need to plan ahead at specific times. May also require an effort to pay for service.' },
    { range: '8', label: 'Decent transit options available during normal hours.' },
    { range: '9', label: 'You can get around easily without a car, and only occasionally need to use an app to plan your trip times.' },
    { range: '10', label: 'Seamless, efficient access from anywhere. If you rent a car, you\'re missing out.' },
  ],
  running: [
    { range: '0-6', label: 'No real outdoor space available.' },
    { range: '7', label: 'A route exists but is limited.' },
    { range: '8', label: 'A very good trail exists, or multiple acceptable ones.' },
    { range: '9', label: 'Great trail system easily accessible.' },
    { range: '10', label: 'World-class trails for running and walking.' },
  ],
};

const OVERALL_GUIDE = [
  { range: '0-6', label: 'Fair' },
  { range: '7', label: 'Good' },
  { range: '8', label: 'Great' },
  { range: '9', label: 'Excellent' },
  { range: '10', label: 'Elite' },
];

const fmt = (s) => s ? s.toFixed(1) : 'N/A';

const processor = unified()
  .use(remarkParse)
  .use(remarkRehype)
  .use(rehypeStringify);

const OverlappingRun = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('team');
  const [filterText, setFilterText] = useState('');
  const [expandedSlug, setExpandedSlug] = useState(null);
  const [keyOpen, setKeyOpen] = useState(false);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const modules = import.meta.glob('/src/reviews/*.md', {
          query: '?raw',
          import: 'default',
          eager: true,
        });

        const parsed = [];

        for (const path in modules) {
          const slug = path.split('/').pop().replace('.md', '');
          const content = modules[path];

          const dateMatch = content.match(/^date:\s*(\d{2})-(\d{2})-(\d{4})$/m);
          let date = '';
          if (dateMatch) {
            const [, month, day, year] = dateMatch;
            const d = new Date(+year, +month - 1, +day);
            date = d.toLocaleDateString('en-US', {
              year: 'numeric', month: 'long', day: 'numeric',
            });
          }

          const city = content.match(/^city:\s*(.+)$/m)?.[1]?.trim() || '';
          const state = content.match(/^state:\s*(.+)$/m)?.[1]?.trim() || '';
          const metro = content.match(/^metro:\s*(.+)$/m)?.[1]?.trim() || '';
          const event = content.match(/^event:\s*(.+)$/m)?.[1]?.trim() || '';
          const team = content.match(/^team:\s*(.+)$/m)?.[1]?.trim() || '';
          const overall = parseFloat(content.match(/^overall:\s*([\d.]+)$/m)?.[1]) || 0;
          const stadiumScore = parseFloat(content.match(/^stadium-score:\s*([\d.]+)$/m)?.[1]) || 0;
          const cityScore = parseFloat(content.match(/^city-score:\s*([\d.]+)$/m)?.[1]) || 0;
          const transitScore = parseFloat(content.match(/^transit-score:\s*([\d.]+)$/m)?.[1]) || 0;
          const runningScore = parseFloat(content.match(/^running-score:\s*([\d.]+)$/m)?.[1]) || 0;
          const scoreMap = { stadium: stadiumScore, city: cityScore, transit: transitScore, running: runningScore };

          const visited = content.match(/^visited:\s*(true|false)$/m)?.[1] === 'true';

          const titleMatch = content.match(/^#\s+(.+)$/m);
          const name = titleMatch ? titleMatch[1].trim() : slug;

          const body = content
            .replace(/^(date|city|state|metro|event|team|overall|stadium-score|city-score|transit-score|running-score|visited):.*\n*/gm, '')
            .replace(/^#\s+.*\n*/m, '')
            .trim();

          const sections = {};
          for (const [key, meta] of Object.entries(SECTION_META)) {
            const sectionRegex = new RegExp(`##\\s*${meta.label}[\\s\\S]*?(?=\\n##|$)`, 'i');
            const sectionMatch = body.match(sectionRegex);
            let sectionHtml = '';
            if (sectionMatch) {
              const sectionText = sectionMatch[0].replace(/^##.*$/m, '').trim();
              if (sectionText) {
                const result = await processor.process(sectionText);
                sectionHtml = String(result);
              }
            }
            sections[key] = { score: scoreMap[key], html: sectionHtml };
          }

          const overallRegex = /##\s*Overall[\s\S]*?(?=\n##|$)/i;
          const overallMatch = body.match(overallRegex);
          let overallHtml = '';
          if (overallMatch) {
            const overallText = overallMatch[0].replace(/^##.*$/m, '').trim();
            if (overallText) {
              const result = await processor.process(overallText);
              overallHtml = String(result);
            }
          }
          sections.overall = { score: overall, html: overallHtml };

          parsed.push({ slug, name, city, state, metro, event, team, date, overall, sections, visited });
        }

        setReviews(parsed);
        setLoading(false);
      } catch (err) {
        console.error('Error loading reviews:', err);
        setLoading(false);
      }
    };

    loadReviews();
  }, []);

  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      setExpandedSlug(hash);
    }
  }, []);

  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      setExpandedSlug(hash || null);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    if (expandedSlug) {
      window.location.hash = expandedSlug;
    } else {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }

    if (expandedSlug && reviews.length > 0) {
      const el = document.getElementById(`review-${expandedSlug}`);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 350);
      }
    }
  }, [expandedSlug, reviews]);

  const toggleExpand = (slug) => {
    setExpandedSlug(expandedSlug === slug ? null : slug);
  };

  const filtered = reviews.filter((r) => {
    if (!filterText) return true;
    const q = filterText.toLowerCase();
    return (
      r.name.toLowerCase().includes(q) ||
      r.team.toLowerCase().includes(q) ||
      r.city.toLowerCase().includes(q)
    );
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'score') return b.overall - a.overall;
    return a.team.localeCompare(b.team);
  });

  const visitedReviews = sorted.filter(r => r.visited);
  const notVisitedReviews = sorted.filter(r => !r.visited);

  return (
    <Layout>
      <SEO
        title="The Overlapping Run"
        description="Traveling for soccer is one of the most rewarding experiences, but it needs to be sustainable for both the planet and the person. The Overlapping Run is a collection of soccer stadium reviews, with a focus on the stadium experience, the public transit experience, and access to outdoor activities (generally running) to make you maximize your time in each city."
        path="/overlapping-run"
      />
      <div className="min-h-[calc(100vh-4rem)]">
        <div className="fixed top-0 left-0 w-full h-[50vh] max-h-[500px] min-h-[300px] overflow-hidden">
          <img
            src={q2Stadium}
            alt="Q2 Stadium in Austin, TX"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/20" />
        </div>
        <div className="relative z-10 w-full max-w-3xl mx-auto mt-8 mb-0 p-6 sm:p-8 border border-border/50 rounded-xl bg-card/80 backdrop-blur-md shadow-sm">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground mb-3">
              The Overlapping Run
            </h1>
            <div className="mx-auto w-16 h-1 rounded-full mb-4" style={{ backgroundColor: '#00b140' }} />
            <p className="text-base sm:text-lg text-muted-foreground/80 max-w-2xl mx-auto leading-relaxed">
Traveling for soccer is one of the most rewarding experiences, but it needs to be sustainable for both the planet and the person. The Overlapping Run is a collection of soccer stadium reviews, with a focus on the stadium experience, the public transit experience, and access to outdoor activities (generally running) to make you maximize your time in each city.            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-border/50">
            <button
              onClick={() => setKeyOpen(!keyOpen)}
              className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
              style={{ color: '#00b140' }}
              aria-expanded={keyOpen}
            >
              <svg
                className={`h-4 w-4 transition-transform duration-300 ${keyOpen ? 'rotate-180' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
              </svg>
              {keyOpen ? 'Hide ratings key' : 'What do these ratings mean?'}
            </button>
            <div className={`expandable-grid ${keyOpen ? 'open' : ''}`}>
              <div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                  {Object.entries(SECTION_META).map(([key, meta]) => (
                    <div
                      key={key}
                      className="rounded-lg p-3"
                      style={{ borderLeft: `3px solid ${meta.color}`, backgroundColor: `${meta.color}08` }}
                    >
                      <span className="text-sm font-semibold" style={{ color: meta.color }}>
                        {meta.icon} {meta.label}
                      </span>
                      <div className="mt-2 space-y-1">
                        {SCORE_DESCRIPTIONS[key].map(({ range, label }) => (
                          <div key={range} className="flex items-baseline gap-1.5 text-xs leading-tight">
                            <span className="font-medium tabular-nums shrink-0" style={{ color: meta.color }}>{range}</span>
                            <span className="text-muted-foreground/60">{label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div
                  className="mt-3 p-3 rounded-lg"
                  style={{ borderLeft: '3px solid #00b140', backgroundColor: '#00b14008' }}
                >
                  <span className="text-sm font-semibold" style={{ color: '#00b140' }}>⚽ Overall</span>
                  <div className="mt-2 space-y-1">
                    {OVERALL_GUIDE.map(({ range, label }) => (
                      <div key={range} className="flex items-baseline gap-1.5 text-xs leading-tight">
                        <span className="font-medium tabular-nums shrink-0" style={{ color: '#00b140' }}>{range}</span>
                        <span className="text-muted-foreground/60">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="relative z-10 w-[90%] sm:w-[85%] md:w-[80%] mx-auto p-4 lg:p-8 flex-1">
          <div className="flex flex-col items-center py-8">

            <div className="w-full max-w-3xl flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-8 animate-fade-in delay-100">
              <div className="relative flex-1">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                <input
                  type="text"
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  placeholder="Search by stadium, team, or city..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border/60 bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors"
                  aria-label="Filter reviews"
                />
              </div>
              <div className="flex rounded-lg border border-border/50 bg-card/80 backdrop-blur-md shadow-sm overflow-hidden">
                <button
                  onClick={() => setSortBy('team')}
                  className={`px-4 py-2.5 text-sm font-medium transition-colors ${sortBy === 'team' ? 'text-white' : 'text-muted-foreground/60 hover:text-foreground'}`}
                  style={{ backgroundColor: sortBy === 'team' ? '#00b140' : 'transparent' }}
                  aria-label="Sort by team name"
                >
                  Team
                </button>
                <button
                  onClick={() => setSortBy('score')}
                  className={`px-4 py-2.5 text-sm font-medium transition-colors ${sortBy === 'score' ? 'text-white' : 'text-muted-foreground/60 hover:text-foreground'}`}
                  style={{ backgroundColor: sortBy === 'score' ? '#00b140' : 'transparent' }}
                  aria-label="Sort by overall score"
                >
                  Score
                </button>
              </div>
            </div>

            <style>{`
              .expandable-grid {
                display: grid;
                grid-template-rows: 0fr;
                opacity: 0;
                transition: grid-template-rows 0.4s ease, opacity 0.3s ease, padding 0.3s ease;
              }
              .expandable-grid.open {
                grid-template-rows: 1fr;
                opacity: 1;
              }
              .expandable-grid > div {
                overflow: hidden;
              }
            `}</style>

            {loading ? (
              <div className="flex flex-col items-center py-16 animate-fade-in">
                <div className="w-10 h-10 border-2 border-primary/50 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-muted-foreground/60">Loading reviews...</p>
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-16 animate-fade-in">
                <p className="text-5xl mb-4">⚽</p>
                <h2 className="text-2xl font-bold text-foreground mb-2">No reviews yet</h2>
                <p className="text-muted-foreground/60">Reviews will appear here once they're written.</p>
              </div>
            ) : (
              <div className="w-full max-w-3xl space-y-6">
                {sorted.length === 0 ? (
                  <div className="text-center py-12 animate-fade-in">
                    <p className="text-muted-foreground/60">No reviews match your filter.</p>
                  </div>
                ) : (
                  <>
                    {visitedReviews.map((review, index) => {
                    const isOpen = expandedSlug === review.slug;
                    return (
                      <article
                        key={review.slug}
                        id={`review-${review.slug}`}
                        className="border border-border/50 rounded-xl bg-card/80 backdrop-blur-md shadow-sm hover:shadow-md transition-shadow animate-fade-in"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="p-5 sm:p-6">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1">
                            <h2 className="text-xl font-bold text-foreground">{review.name}</h2>
                            <div className="sm:text-right">
                              {review.metro && <p className="text-sm font-bold text-foreground">{review.metro}</p>}
                              <span className="text-sm text-muted-foreground/60 whitespace-nowrap">
                                {review.city}, {review.state}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground/80 mb-1">{review.team}</p>
                          <p className="text-xs text-muted-foreground/50 mb-4">
                            {review.date ? `Updated: ${review.date}` : ''}{review.event ? ` \u00B7 ${review.event}` : ''}
                          </p>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-4">
                            {Object.entries(SECTION_META).map(([key, meta]) => (
                              <span key={key} className="text-sm font-medium" style={{ color: meta.color }}>
                                {meta.icon} {fmt(review.sections[key]?.score)}
                              </span>
                            ))}
                            <span className="ml-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold text-white" style={{ backgroundColor: '#00b140' }}>
                              ⚽ {fmt(review.overall)}
                            </span>
                          </div>

                          <button
                            onClick={() => toggleExpand(review.slug)}
                            className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
                            style={{ color: '#00b140' }}
                            aria-label={isOpen ? `Collapse ${review.name} review` : `Expand ${review.name} review`}
                            aria-expanded={isOpen}
                          >
                            <svg
                              className={`h-4 w-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                              fill="none" stroke="currentColor" viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                            </svg>
                            {isOpen ? 'Collapse' : 'Expand'}
                          </button>
                        </div>

                        <div className={`expandable-grid ${isOpen ? 'open' : ''}`}>
                          <div>
                            <div className="border-t border-border/50">
                              <div className="p-5 sm:p-6 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {Object.entries(SECTION_META).map(([key, meta]) => {
                                  const section = review.sections[key];
                                  return (
                                    <div
                                      key={key}
                                      className="rounded-lg p-4"
                                      style={{ borderLeft: `3px solid ${meta.color}`, backgroundColor: `${meta.color}08` }}
                                    >
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-semibold" style={{ color: meta.color }}>
                                          {meta.icon} {meta.label}
                                        </span>
                                        <span className="text-lg font-bold" style={{ color: meta.color }}>
                                          {section?.score ? `${section.score.toFixed(1)}/10` : 'N/A'}
                                        </span>
                                      </div>
                                      {section?.html ? (
                                        <div
                                          className="prose prose-sm max-w-none text-muted-foreground/80"
                                          dangerouslySetInnerHTML={{ __html: section.html }}
                                        />
                                      ) : (
                                        <p className="text-sm text-muted-foreground/40 italic">No review yet.</p>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                              {(review.sections.overall?.html || review.sections.overall?.score) && (
                                <div className="mt-4 rounded-lg p-4" style={{ borderLeft: '3px solid #00b140', backgroundColor: '#00b14008' }}>
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-semibold" style={{ color: '#00b140' }}>
                                      {'\u26BD'} Overall
                                    </span>
                                    <span className="text-lg font-bold" style={{ color: '#00b140' }}>
                                      {review.sections.overall.score ? `${review.sections.overall.score.toFixed(1)}/10` : 'N/A'}
                                    </span>
                                  </div>
                                  {review.sections.overall?.html ? (
                                    <div
                                      className="prose prose-sm max-w-none text-muted-foreground/80"
                                      dangerouslySetInnerHTML={{ __html: review.sections.overall.html }}
                                    />
                                  ) : (
                                    <p className="text-sm text-muted-foreground/40 italic">No review yet.</p>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                    {notVisitedReviews.length > 0 && (
                      <div className="border border-border/50 rounded-xl bg-card/80 backdrop-blur-md shadow-sm p-5 sm:p-6 animate-fade-in">
                        <h3 className="text-lg font-bold text-foreground mb-4">Not Reviewed (Yet)</h3>
                        <div className="space-y-2">
                          {notVisitedReviews.map((review) => (
                            <div key={review.slug} className="flex items-baseline gap-1.5 text-sm leading-relaxed">
                              <span className="text-muted-foreground/60 shrink-0">{'\u{1F3DF}'}</span>
                              <span className="font-medium text-foreground">{review.name}</span>
                              <span className="text-muted-foreground/40">{'\u00B7'}</span>
                              <span className="text-muted-foreground/80">{review.team}</span>
                              <span className="text-muted-foreground/40">{'\u00B7'}</span>
                              <span className="text-muted-foreground/60">{review.city}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default OverlappingRun;
