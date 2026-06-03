import Layout from '../components/Layout';
import SEO from '../components/SEO';

const Resume = () => {
  return (
    <Layout>
      <SEO
        title="Resume"
        description="Engineering manager and architect with experience leading international teams, designing microservice platforms, and mentoring engineers."
        path="/resume"
      />
      <div className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-6 animate-fade-in">
            <h1 className="text-4xl font-bold text-foreground mb-1">Tony Cardone</h1>
            <p className="text-xl text-muted-foreground/80 mb-2">Software Architect / Engineering Manager</p>
            <p className="text-sm text-muted-foreground/60">
              tcardone@outlook.com &bull; <a href="https://linkedin.com/in/tonycardone" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">linkedin.com/in/tonycardone</a>
            </p>
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
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center space-x-2 animate-fade-in delay-100">
                <svg width="16" height="16" className="text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
                <span>Professional Summary</span>
              </h2>
              <p className="text-muted-foreground/90 animate-fade-in delay-200">
                Engineering manager and architect with an extensive architecture background in microservice, monolith, and hybrid platforms. Significant experience leading international teams&rsquo; implementation from requirements to delivery, mentoring team members of all levels, and cross-organization engagement with a consistent, transparent approach that draws on the experience of team members to implement a viable solution.
              </p>
            </section>

            {/* Experience */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center space-x-2 animate-fade-in delay-100">
                <svg width="16" height="16" className="text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 8v4l3 3"/>
                </svg>
                <span>Experience</span>
              </h2>

              <div className="space-y-6">
                {/* Zilliant */}
                <div className="border-l-2 border-primary/20 pl-4 animate-fade-in delay-200">
                  <div className="mb-4 last:mb-0">
                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between mb-1">
                      <h3 className="font-semibold text-foreground">Zilliant Incorporated</h3>
                      <p className="text-sm text-muted-foreground/60 whitespace-nowrap">Austin, TX &bull; June 2015 &ndash; November 2025</p>
                    </div>

                    <div className="mb-3">
                      <p className="font-medium text-foreground/90 text-sm">Senior Architect / Engineering Manager (2021 &ndash; 2025)</p>
                      <ul className="list-disc list-inside mt-1 text-muted-foreground/90 space-y-1 text-sm">
                        <li>Manager and technical lead of the seven-member architect team, which designed product solutions across Zilliant&rsquo;s platform, including highly available APIs and a legacy monolith application.</li>
                        <li>Led system design of new product offering and subsequent integration of this design into existing platform from requirements to deployment.</li>
                        <li>Technology portfolio focused on scaling and management of Java microservices with Dropwizard, Python, and PostgreSQL on Amazon Aurora, deployed to Elastic Container Service. API stack handled hundreds of requests per second across a multitenant system.</li>
                        <li>Engaged with customer solutions teams to identify design issues within their proposed solution on monolith application, including mitigation of recurring performance issues.</li>
                        <li>Transitioned to full-time Engineering Manager for two Eastern European-based teams, leading delivery process and oversight of day-to-day operations alongside architecture responsibilities.</li>
                      </ul>
                    </div>

                    <div>
                      <p className="font-medium text-foreground/90 text-sm">Senior Technical Lead (2015 &ndash; 2021)</p>
                      <ul className="list-disc list-inside mt-1 text-muted-foreground/90 space-y-1 text-sm">
                        <li>Technical lead for ten-person hybrid US-Ukraine team focused primarily on critical backend features for the platform using Amazon Web Services and Salesforce offerings.</li>
                        <li>Tasked with end-to-end delivery of software for the team, including requirements gathering, technical design, Scrum Master responsibilities, coding, test process, and release management. Releases accelerated from quarterly to daily as needed.</li>
                        <li>Technology in focus included Java, AWS Redshift, Simple Workflow (SWF), Elastic MapReduce (EMR), EC2, and Microsoft SQL Server.</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* BNSF */}
                <div className="border-l-2 border-primary/20 pl-4 animate-fade-in delay-200">
                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between mb-1">
                    <h3 className="font-semibold text-foreground">BNSF Railway Company</h3>
                    <p className="text-sm text-muted-foreground/60 whitespace-nowrap">Fort Worth, TX &bull; June 2013 &ndash; June 2015</p>
                  </div>
                  <p className="font-medium text-foreground/90 text-sm">Systems Developer</p>
                  <ul className="list-disc list-inside mt-1 text-muted-foreground/90 space-y-1 text-sm">
                    <li>Software developer on a large distributed agile development team working closely with BNSF&rsquo;s team of mechanical experts to deliver a predictive analytics solution to reduce derailments and increase reliability of rolling stock.</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Technical Skills */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center space-x-2 animate-fade-in delay-100">
                <svg width="16" height="16" className="text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.504-.203-2.928-.582-4.238z"/>
                </svg>
                <span>Technical Skills</span>
              </h2>
              <div className="space-y-3 animate-fade-in delay-200">
                <div>
                  <p className="text-sm font-medium text-foreground/80 mb-1">Cloud (AWS):</p>
                  <div className="flex flex-wrap gap-2">
                    {["Aurora PostgreSQL", "Redshift", "Elastic Container Service", "EC2", "Simple Workflow", "Lambda", "Batch"].map(skill => (
                      <span key={skill} className="bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-200 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground/80 mb-1">Languages:</p>
                  <div className="flex flex-wrap gap-2">
                    {["Java", "Python", "R", "SQL", "Salesforce Apex"].map(skill => (
                      <span key={skill} className="bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-200 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground/80 mb-1">Technologies &amp; Tools:</p>
                  <div className="flex flex-wrap gap-2">
                    {["SQL Server", "ELK Stack", "Jira", "Dropwizard", "PostgreSQL", "APIs", "Multitenancy", "Docker", "AI"].map(skill => (
                      <span key={skill} className="bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-200 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Education */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center space-x-2 animate-fade-in delay-100">
                <svg width="16" height="16" className="text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2z"/>
                </svg>
                <span>Education</span>
              </h2>
              <div className="space-y-4 animate-fade-in delay-200">
                <div>
                  <h3 className="font-semibold text-foreground">Master of Science &ndash; Data Science</h3>
                  <p className="text-sm text-muted-foreground/70">Rawls College of Business, Texas Tech University, Lubbock, TX</p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Bachelor of Science &ndash; Computer Science</h3>
                  <p className="text-sm text-muted-foreground/70">Whitacre College of Engineering, Texas Tech University, Lubbock, TX &bull; Minor: Mathematics</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Resume;
