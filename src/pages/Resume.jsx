import Layout from '../components/Layout';
import SEO from '../components/SEO';
import resume from '../data/resume.json';

const ICONS = {
  summary:
    'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
  experience: 'M12 8v4l3 3',
  skills:
    'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.504-.203-2.928-.582-4.238z',
  education:
    'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2z',
  default:
    'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
};

const SectionHeading = ({ icon, children }) => (
  <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center space-x-2 animate-fade-in delay-100">
    <svg width="16" height="16" className="text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
    </svg>
    <span>{children}</span>
  </h2>
);

const Resume = () => {
  const { name, headline, contact, summary, experience, skills, education, other } = resume;

  const contactItems = [];
  if (contact.email) contactItems.push({ text: contact.email, href: `mailto:${contact.email}` });
  if (contact.linkedin) {
    const href = contact.linkedin.startsWith('http') ? contact.linkedin : `https://${contact.linkedin}`;
    contactItems.push({ text: contact.linkedin, href });
  }

  const seoDescription = summary.length > 160 ? `${summary.slice(0, 157).trimEnd()}...` : summary;

  return (
    <Layout>
      <SEO title="Resume" description={seoDescription} path="/resume" />
      <div className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-6 animate-fade-in">
            <h1 className="text-4xl font-bold text-foreground mb-1">{name}</h1>
            {headline && <p className="text-xl text-muted-foreground/80 mb-2">{headline}</p>}
            {contactItems.length > 0 && (
              <p className="text-sm text-muted-foreground/60">
                {contactItems.map((item, i) => (
                  <span key={i}>
                    {i > 0 && <span className="mx-1">•</span>}
                    <a
                      href={item.href}
                      target={item.href.startsWith('mailto') ? undefined : '_blank'}
                      rel="noopener noreferrer"
                      className="hover:text-foreground transition-colors"
                    >
                      {item.text}
                    </a>
                  </span>
                ))}
              </p>
            )}
          </div>

          {/* Download links */}
          <div className="flex justify-center gap-4 mb-10 animate-fade-in delay-100">
            <a href="/Resume.pdf"
               download="Tony_Cardone_Resume.pdf"
               className="inline-flex items-center gap-2 bg-primary/90 hover:bg-primary/80 text-primary-foreground font-medium py-2 px-4 rounded-lg transition-colors text-sm">
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              Download PDF
            </a>
            <a href="/Resume.docx"
               download="Tony_Cardone_Resume.docx"
               className="inline-flex items-center gap-2 bg-accent/90 hover:bg-accent/80 text-accent-foreground font-medium py-2 px-4 rounded-lg transition-colors text-sm">
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              Download DOCX
            </a>
          </div>

          <div className="space-y-8">
            {/* Professional Summary */}
            {summary && (
              <section>
                <SectionHeading icon={ICONS.summary}>Professional Summary</SectionHeading>
                <p className="text-muted-foreground/90 animate-fade-in delay-200">{summary}</p>
              </section>
            )}

            {/* Experience */}
            {experience.length > 0 && (
              <section>
                <SectionHeading icon={ICONS.experience}>Experience</SectionHeading>
                <div className="space-y-6">
                  {experience.map((entry, i) => (
                    <div key={i} className="border-l-2 border-primary/20 pl-4 animate-fade-in delay-200">
                      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between mb-1">
                        <h3 className="font-semibold text-foreground">{entry.company}</h3>
                        {(entry.location || entry.dates) && (
                          <p className="text-sm text-muted-foreground/60 whitespace-nowrap">
                            {[entry.location, entry.dates].filter(Boolean).join(' • ')}
                          </p>
                        )}
                      </div>

                      {entry.roles.map((role, j) => (
                        <div key={j} className={j > 0 ? 'mt-4' : ''}>
                          <p className="font-medium text-foreground/90 text-sm">
                            {role.title}
                            {role.dates && <span className="text-muted-foreground/60"> ({role.dates})</span>}
                          </p>
                          {role.bullets.length > 0 && (
                            <ul className="list-disc list-inside mt-1 text-muted-foreground/90 space-y-1 text-sm">
                              {role.bullets.map((bullet, k) => (
                                <li key={k}>{bullet}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}

                      {entry.bullets.length > 0 && (
                        <ul className="list-disc list-inside mt-1 text-muted-foreground/90 space-y-1 text-sm">
                          {entry.bullets.map((bullet, k) => (
                            <li key={k}>{bullet}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Technical Skills */}
            {skills.length > 0 && (
              <section>
                <SectionHeading icon={ICONS.skills}>Technical Skills</SectionHeading>
                <div className="space-y-3 animate-fade-in delay-200">
                  {skills.map((group, i) => (
                    <div key={i}>
                      {group.label && <p className="text-sm font-medium text-foreground/80 mb-1">{group.label}:</p>}
                      <div className="flex flex-wrap gap-2">
                        {group.items.map((skill, j) => (
                          <span key={j} className="bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-200 text-xs font-medium px-2.5 py-0.5 rounded-full">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Education */}
            {education.length > 0 && (
              <section>
                <SectionHeading icon={ICONS.education}>Education</SectionHeading>
                <div className="space-y-4 animate-fade-in delay-200">
                  {education.map((edu, i) => (
                    <div key={i}>
                      <h3 className="font-semibold text-foreground">
                        {edu.title}
                        {edu.year && <span className="text-sm font-normal text-muted-foreground/60"> ({edu.year})</span>}
                      </h3>
                      {edu.detail && <p className="text-sm text-muted-foreground/70">{edu.detail}</p>}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Additional sections */}
            {other.map((section, i) => (
              <section key={i}>
                <SectionHeading icon={ICONS.default}>{section.heading || 'Additional'}</SectionHeading>
                <ul className="space-y-2 text-muted-foreground/90 animate-fade-in delay-200">
                  {section.items.map((item, j) => (
                    <li key={j}>{item}</li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Resume;
