date: 06-02-2026
tag: personal

# A New Site

This is a brand new site that I am building as part of a learning experience in two areas: AI and React. The content, which is to say, the photos, these thoughts, and of course the resume, are all made by me, the human.

## Why Now?

It's not that the old one was bad, persay. But it was running a full-scale Ghost implementation over at AWS running Lightsail. Much to my annoyance, the way AWS uses Lightsail, it didn't keep itself up to date, meaning it might as well have been self-managed. Sure, it was a bit cheaper than running an EC2 instance, but I wasn't getting much out of it.

Then, one day, I discovered that the site was just down. Not responding. I logged in, and couldn't find anything obviously wrong. Rebooting did nothing, and I didn't feel like it was worth deep dives into logs. It was supposed to be a self-contained project that was always up, but that's not what happened.

All of this is coming on the heels of a layoff that is full of doom about AI taking our jobs. There's some ethics around AI that I hope to lay some thoughts down at some point, but there's no denying that the future of software development will involve AI in some form.

## The Adventure Begins

I would natively consider myself a backend developer ([please someone hire me](/resume)), though for my entire computing life of [redacted] I have always dabbled in the frontend. The primary way I have done this, as someone without a great eye for design, is to take prebuilt templates and tinker with it, either in WordPress, Ghost, or what have you. Never before have I built a full site from scratch.

AI felt like a great use case to play around with the skills gap there, and instead of spending time learning the intracacies of yet another language, I could focus on building with a new tool.

## Tool and Tech Selection

My primary concern in this case was cost. This site gets dozens of views a month (on a good month), so there wasn't any need to go down a route that scaled to the moon. Not only in ongoing maintenance cost, but also in the cost to build, which I wanted to keep super low on the financial side. The actual time to implement was open-ended, so if something were to take longer to develop and deploy while being cheaper, that would be the route I chose.

Secondarily, I wanted to be able to maintain a simple blog. Nothing fancy, no need for a full-scale CMS, just something I could occasionally pop into and drop thoughts on something, be it tech, soccer, or some earthly issue that needed a brain dump.

Finally, I wanted something I could run locally. It may be old-school, but I like deploying things to my local machine and fiddling about until it's in a good state.

Overarching all this, however, was the number one reason I was doing a revamp: to learn something.

## Tech Selections

I decided to go with React, powered by [Vite](vite.dev) and [Tailwind CSS](https://tailwindcss.com/). Create React App was probably enough (kind of counteracting my second point of keep it simple), but Vite has some super cool features, like the instant updates that we backend devs get sad about not having. Tailwind spoke to me by not forcing you to do CSS everywhere, which really is like playing whack-a-mole sometimes.

~~his is deployed to Vercel's free tier, through a GitHub repository. The integration with Vercel is pain-free in a way that the Lightsail configuration wasn't.~~ *Updated 8/2026:* This is now running on GitHub Pages. It's closer to the code and doesn't have to deal with Vercel's business whims (not for this site, but others).

## Tool Selections

Being a big fan of open source, I started with [OpenCode](opencode.ai), an open-source agent that sits atop your LLM of choice. It seems to have a passive-aggressive approach with Windows, but generally works fine. It just needs a model to run against

Anthropic's models have all the markings of being the valedictorians right now. Unfortunately, Claude also has all the markings of being stupendously expensive for real-world development for those of us who don't have an enterprise account backing us. Research was undertaken to figure out the most cost-effective LLM for pretty simple stuff and ended up trying to run a local LLM.

This choice ended up being very rough in terms of actually pumping out code, but it did generate some useful learnings. I ended up playing around with a Gemma4 E4B model running on Ollama, which had 4.5B parameters and was able to squeeze in the available memory space. It is super interesting to see a LLM running locally on a laptop (in this case, a moderately high end, but aging XPS 15), but inevitably I couldn't get it to play with OpenCode nicely. It kept asking for tools it didn't have access too, which I suspect was user error that I could have solved.

More interested in using the tool to build now, I instead went with a built-in model, Nvidia's Nemotron 3 Super, a free model with 67B parameters. This was a hot mess. It set up the structure fine but was frankly horrendous at the coding part. I struggled to get it to apply any styling at all, with the model insisting everything looked fine.

Frustrated at seeing a site that looked like it was built as an HTML document in Microsoft Word, I swapped over to OpenCode's Big Pickle model. Now, the internet suggests this is actually [GLM-4.6](https://z.ai/blog/glm-4.6) or 4.7 behind the scenes, a model from z.ai.

This one works much, much better. It's actually the first time I can see why people are vibecoding so much. With a little bit of knowledge, a pretty basic site in a brand new technology can be stood up.

## Finally
It's not like this is the first time I've used AI. Grad school had a Generative AI course and we also got experience with GitHub Copilot, in addition to using it sparingly for occasional tasks at work. But it's the first time I feel like I understand the potential of it working in concert with a developer. Connecting it to agents for specialized tasks and more complex builds is what the future holds for me, but that was not the goal of this project.

There's a lot of tinkering to be done still, but that's always the most exciting part. Knowing that there's something tomorrow that can be added, and this time, it won't involve fighting the tools. It's time to build.