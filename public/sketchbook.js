const gallery = document.querySelector('.sketchbook-gallery');

if (gallery) {
  const track = gallery.querySelector('.sketchbook-track');
  const controls = gallery.querySelector('.sketchbook-controls');
  const buttons = [...controls.querySelectorAll('button')];
  const slides = [...track.querySelectorAll('figure')];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const status = document.createElement('p');
  status.className = 'sr-only';
  status.setAttribute('aria-live', 'polite');
  status.setAttribute('aria-atomic', 'true');
  gallery.append(status);

  let animationFrame = null;
  let targetIndex = null;
  let swipeTimeout;

  function slidePosition(slide) {
    return slide.offsetLeft - parseFloat(getComputedStyle(track).paddingLeft);
  }

  function currentIndex() {
    return slides.reduce((closest, slide, index) =>
      Math.abs(slidePosition(slide) - track.scrollLeft) <
      Math.abs(slidePosition(slides[closest]) - track.scrollLeft) ? index : closest, 0);
  }

  function updateControls() {
    const index = targetIndex ?? currentIndex();
    buttons[0].disabled = index === 0;
    buttons[1].disabled = index === slides.length - 1;
  }

  function announceSlide() {
    const index = currentIndex();
    status.textContent = `Spread ${index + 1} of ${slides.length}: ${slides[index].querySelector('figcaption').textContent}`;
  }

  function cancelAnimation() {
    if (animationFrame !== null) cancelAnimationFrame(animationFrame);
    animationFrame = null;
    targetIndex = null;
    track.classList.remove('is-animating');
    updateControls();
  }

  function goToSlide(index) {
    clearTimeout(swipeTimeout);
    cancelAnimation();
    targetIndex = Math.max(0, Math.min(slides.length - 1, index));
    const start = track.scrollLeft;
    const destination = slidePosition(slides[targetIndex]);
    updateControls();

    if (reducedMotion.matches || Math.abs(destination - start) < 1) {
      track.classList.remove('is-swiping');
      track.scrollTo({ left: destination, behavior: 'instant' });
      targetIndex = null;
      updateControls();
      announceSlide();
      return;
    }

    // Temporarily release scroll snapping so it does not fight the easing curve.
    track.classList.add('is-animating');
    track.classList.remove('is-swiping');
    let startTime;
    function animate(time) {
      startTime ??= time;
      const progress = Math.min((time - startTime) / 480, 1);
      const eased = progress * progress * (3 - 2 * progress);
      track.scrollTo({ left: start + (destination - start) * eased, behavior: 'instant' });
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        cancelAnimation();
        announceSlide();
      }
    }
    animationFrame = requestAnimationFrame(animate);
  }

  for (const button of buttons) {
    button.addEventListener('click', () => {
      goToSlide((targetIndex ?? currentIndex()) + Number(button.dataset.direction));
    });
  }

  gallery.addEventListener('keydown', (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const index = targetIndex ?? currentIndex();
    const destinations = {
      ArrowLeft: index - 1,
      ArrowRight: index + 1,
      Home: 0,
      End: slides.length - 1,
    };
    if (!(event.key in destinations)) return;
    event.preventDefault();
    goToSlide(destinations[event.key]);
  });

  // Direct touch, trackpad, or mouse interaction takes over immediately.
  track.addEventListener('pointerdown', cancelAnimation, { passive: true });
  track.addEventListener('wheel', (event) => {
    // Keep vertical gestures available for page scrolling.
    const horizontal = Math.abs(event.deltaX) > Math.abs(event.deltaY);
    if (event.ctrlKey || (!horizontal && !event.shiftKey)) return;
    if (!event.cancelable) return;
    event.preventDefault();
    track.classList.add('is-swiping');
    cancelAnimation();
    clearTimeout(swipeTimeout);
    const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? track.clientWidth : 1;
    const delta = horizontal ? event.deltaX : event.deltaY;
    track.scrollBy({ left: delta * unit, behavior: 'instant' });
    swipeTimeout = setTimeout(() => goToSlide(currentIndex()), 160);
  }, { passive: false });
  track.addEventListener('scroll', updateControls, { passive: true });
  track.addEventListener('scrollend', () => {
    if (targetIndex === null && !track.classList.contains('is-swiping')) announceSlide();
  });
  reducedMotion.addEventListener('change', () => {
    if (targetIndex !== null) goToSlide(targetIndex);
  });
  new ResizeObserver(() => {
    const index = targetIndex ?? currentIndex();
    cancelAnimation();
    track.scrollTo({ left: slidePosition(slides[index]), behavior: 'instant' });
    updateControls();
  }).observe(track);

  controls.hidden = false;
  updateControls();
}
