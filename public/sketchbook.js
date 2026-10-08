const gallery = document.querySelector('.sketchbook-gallery');

if (gallery) {
  const track = gallery.querySelector('.sketchbook-track');
  const controls = gallery.querySelector('.sketchbook-controls');
  const buttons = [...controls.querySelectorAll('button')];
  const slides = [...track.querySelectorAll('figure')];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function slidePosition(slide) {
    return slide.offsetLeft - parseFloat(getComputedStyle(track).paddingLeft);
  }

  function currentIndex() {
    return slides.reduce((closest, slide, index) =>
      Math.abs(slidePosition(slide) - track.scrollLeft) <
      Math.abs(slidePosition(slides[closest]) - track.scrollLeft) ? index : closest, 0);
  }

  function updateButtons() {
    buttons[0].disabled = track.scrollLeft <= 1;
    buttons[1].disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 1;
  }

  for (const button of buttons) {
    button.addEventListener('click', () => {
      const index = Math.max(0, Math.min(slides.length - 1,
        currentIndex() + Number(button.dataset.direction)));
      track.scrollTo({
        left: slidePosition(slides[index]),
        behavior: reducedMotion.matches ? 'instant' : 'smooth',
      });
    });
  }

  track.addEventListener('scroll', updateButtons, { passive: true });
  new ResizeObserver(updateButtons).observe(track);
  controls.hidden = false;
  updateButtons();
}
