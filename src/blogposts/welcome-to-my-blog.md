date: 06-02-2026
tag: personal

# A New Site

This is a brand new site that I am building as part of a learning experience in two areas: AI and React. The content, which is to say, the photos, these thoughts, and of course the resume, are all made by me, the human. The code portion will be my first real attempt at vibe-coding. More on that later.

## The Pathway to a New Site

It's not that the old one was bad, persay. But it was running a full-scale Ghost implementation over at AWS running Lightsail. Much to my annoyance, the way AWS uses Lightsail, it didn't keep itself up to date, meaning it might as well have been self-managed. Sure, it was a bit cheaper than running an EC2 instance, but I wasn't getting much out of it.

Then, one day, I discovered that the site was just down. Not responding. That's when I logged in, and couldn't find anything obviously wrong. Rebooting did nothing, and I didn't feel like it was worth deep dives into logs. It was supposed to be a self-contained project that was always up, but that's not what happened.

All of this is coming on the heels of a layoff that is full of doom about AI taking our jobs. There's some ethics around AI that I hope to lay some thoughts down at some point, but there's no denying that the future of software development will involve AI in some form. Stodgy old man opinion on the subject isn't really relevant.

## The Adventure Begins

I would natively consider myself a backend developer ([please someone hire me](/resume)), though for my entire computing life of [redacted] I have always dabbled in the frontend. The primary way I have done this, as someone without a great eye for design, is to take prebuilt templates and tinker with it, either in WordPress, Ghost, or what have you. Never before have I built a full site from scratch.

AI felt like a great use case to play around with the skills gap there, and instead of spending time learning the intracacies of yet another language, I could focus on building with a new tool.

I always felt more useful as an architect than a manager, primarily because I have been an architect much longer, so I'll explain a little bit about the way I went around building the site.

## Tool and Tech Selection

My primary concern in this case was cost. This site gets dozens of views a month (on a good month), so there wasn't any need to go down a route that scaled to the moon. Not only in ongoing maintenance cost, but also in the cost to build, which I wanted to keep super low on the financial side. The actual time to implement was open-ended, so if something were to take longer to develop and deploy while being cheaper, that would be the route I chose.

Secondarily, I wanted to be able to maintain a simple blog. Nothing fancy, no need for a full-scale CMS, just something I could occasionally pop into and drop thoughts on something, be it tech, soccer, or some earthly issue that needed a brain dump.

Finally, I wanted something I could run locally. It may be old-school, but I like deploying things to my local machine and fiddling about until it's in a good state.

Overarching all this, however, was the number one reason I was doing a revamp: to learn something.

## Tech Selections

I decided to go with React, powered by [Vite](vite.dev) and [Tailwind CSS](https://tailwindcss.com/). Create React App was probably enough (kind of counteracting my second point of keep it simple), but Vite has some super cool features, like the instant updates that we backend devs get sad about not having. Tailwind spoke to me by not forcing you to do CSS everywhere, which really is like playing whack-a-mole sometimes.

This is deployed to Vercel.

## Tool Selections

As my coding agent, 