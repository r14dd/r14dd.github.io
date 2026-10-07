// Time-aware accent, set by the sun over Baku. The head script in BaseLayout
// runs src/lib/sun.ts and stamps data-period on <html> before first paint;
// every color and map filter lives in base.css under :root[data-period] /
// html.light[data-period]. Writing the values here as inline styles was a
// shipped bug: inline custom properties out-specify the html.light
// redirection, so light mode ran on dark-tuned accents and failed AA
// wholesale. This module only swaps the hero greeting to match the stamp.

export function apply(data: any) {
  const period = document.documentElement.dataset.period;
  const greetings = data?.labels?.timeGreetings;
  const greeting = document.getElementById('hero-greeting');
  if (greeting && period && greetings?.[period]) {
    greeting.textContent = greetings[period];
  }
}
