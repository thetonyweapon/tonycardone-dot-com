import { useEffect } from 'react';

const BASE_URL = 'https://tonycardone.com';

const SEO = ({ title, description, image, path, type }) => {
  const pageTitle = title ? `${title} — Tony Cardone` : 'Tony Cardone';
  const pageDesc = description || 'Soccer person, traveler, and a software engineer / architect / manager based in Austin, TX.';
  const pageImage = image || '/headshot.jpg';
  const pageUrl = path ? `${BASE_URL}${path}` : BASE_URL;

  useEffect(() => {
    document.title = pageTitle;

    const setMeta = (nameOrProp, value, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name';
      const key = isProperty ? nameOrProp : nameOrProp;
      let el = document.querySelector(`meta[${attr}="${key}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute('content', value);
    };

    setMeta('description', pageDesc);
    setMeta('og:title', title || 'Tony Cardone', true);
    setMeta('og:description', pageDesc, true);
    setMeta('og:image', `${BASE_URL}${pageImage}`, true);
    setMeta('og:url', pageUrl, true);
    setMeta('og:type', type || 'website', true);
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', title || 'Tony Cardone');
    setMeta('twitter:description', pageDesc);
    setMeta('twitter:image', `${BASE_URL}${pageImage}`);
  }, [pageTitle, pageDesc, pageImage, pageUrl, type]);

  return null;
};

export default SEO;
