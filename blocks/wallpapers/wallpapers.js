export default function decorate(block) {
  const existingPicture = block.querySelector('picture');
  const existingImg = block.querySelector('img');
  const authoredHeading = block.querySelector('h1, h2, h3, h4, h5, h6');
  // AEM EDS wraps images inside <p> tags, so skip any <p> that contains a picture or img
  const allParas = [...block.querySelectorAll('p')];
  const authoredDesc = allParas.find((p) => !p.querySelector('picture, img') && p.textContent.trim() !== '');
  const authoredCta = block.querySelector('a');

  block.innerHTML = '';

  // Hero Image
  const hero = document.createElement('div');
  hero.className = 'cnz-hero';

  if (existingPicture) {
    hero.appendChild(existingPicture);
  } else if (existingImg) {
    hero.appendChild(existingImg);
  }

  // Content Card
  const card = document.createElement('div');
  card.className = 'cnz-card';

  const heading = document.createElement('h2');
  heading.className = 'cnz-heading';
  heading.textContent = authoredHeading ? authoredHeading.textContent : 'Climbing New Zealand';

  const desc = document.createElement('p');
  desc.className = 'cnz-desc';
  desc.textContent = authoredDesc
    ? authoredDesc.textContent
    : 'Let us help you make your New Zealand climbing vacation a memory you will cherish forever! Come join us for a guided rock climbing adventure in the mountains that trained Sir Edmund Hillary.';

  const cta = document.createElement('a');
  cta.className = 'cnz-cta';
  cta.href = authoredCta ? authoredCta.href : '#';
  cta.textContent = authoredCta ? authoredCta.textContent : 'SEE TRIP';

  card.appendChild(heading);
  card.appendChild(desc);
  card.appendChild(cta);

  block.appendChild(hero);
  block.appendChild(card);
}