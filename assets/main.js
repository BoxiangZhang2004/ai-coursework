'use strict';

const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#main-nav');
const setMenu = (open) => {
  menuButton.setAttribute('aria-expanded', String(open));
  navigation.classList.toggle('is-open', open);
};
menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
navigation.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
    setMenu(false);
    menuButton.focus();
  }
});
window.matchMedia('(min-width: 761px)').addEventListener('change', (event) => {
  if (event.matches) setMenu(false);
});

const navLinks = [...navigation.querySelectorAll('a')];
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    navLinks.forEach((link) => {
      if (link.hash === `#${entry.target.id}`) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  });
}, { rootMargin: '-15% 0px -60% 0px', threshold: 0 });
['home', 'work', 'experience', 'about', 'contact'].forEach((id) => sectionObserver.observe(document.getElementById(id)));

const projectDetails = {
  research: {
    kicker: '01 / FINAL YEAR RESEARCH · SEPT 2026–PRESENT',
    title: 'Blood pressure prediction',
    content: `<p class="dialog-lead">Investigating how physiological signals can support blood pressure estimation through data processing and machine learning.</p>
      <h3>Research approach</h3><p>The project uses VitalDB and MCD-rPPG data. Work includes signal alignment and quality filtering, feature extraction, model training, comparison experiments and ablation studies. ECG and PPG waveforms support the extraction of physiological timing information such as pulse arrival time.</p>
      <h3>My contribution</h3><ul><li>Preprocessing physiological time series and preparing features for modelling.</li><li>Developing and evaluating prediction models, including a research ensemble using learned signal representations.</li><li>Comparing model variants and investigating the contribution of different inputs.</li></ul>
      <h3>Current status</h3><p>The current baseline is a research model developed without SpO₂ input. Existing performance results come from historical development data that have been reused across experiments. Independent participant and real-device validation have not yet been completed.</p>
      <p class="dialog-note">The signal drawing on this page is a conceptual illustration, not a patient recording or a live prediction.</p>
      <div class="dialog-tools">Python / PyTorch / Physiological signals / Model evaluation</div>`
  },
  car: {
    kicker: '02 / ENGINEERING PROJECT · SEPT 2024–SEPT 2025',
    title: 'Intelligent car',
    content: `<p class="dialog-lead">An independently completed project covering circuit design, hardware assembly, firmware development and full-vehicle testing.</p>
      <h3>Build and integrate</h3><p>Built and tested an H-bridge motor driver for bidirectional motion. Programmed an Arduino board to communicate with peripheral modules over I²C and UART, and used wheel encoders for fixed-distance motion, square paths and in-place rotation.</p>
      <h3>Sense and control</h3><p>Tested optical sensor response to different colours and distances. Implemented two-sensor and eight-channel line tracking, then iteratively tuned PID parameters to address oscillation, cornering overshoot and track deviation. Encoders and an LCD supported parameter adjustment.</p>
      <h3>Extend and test</h3><p>Developed timer-interrupt waveform generation, battery voltage monitoring and rotary-encoder interaction. Used an MPU6050 for motion sensing, and later extended the platform with a camera-based image-recognition task. Verification included module debugging and full-vehicle experiments.</p>
      <p class="dialog-note">The track graphic is a conceptual illustration of the project, not a photograph or recorded test trajectory.</p>
      <div class="dialog-tools">Arduino / C++ / PID / Encoders / I²C &amp; UART</div>`
  }
};

const dialog = document.querySelector('#project-dialog');
let dialogTrigger;
document.querySelectorAll('[data-project]').forEach((button) => {
  button.addEventListener('click', () => {
    const detail = projectDetails[button.dataset.project];
    if (!detail) return;
    document.querySelector('#dialog-kicker').textContent = detail.kicker;
    document.querySelector('#dialog-title').textContent = detail.title;
    document.querySelector('#dialog-content').innerHTML = detail.content;
    dialogTrigger = button;
    dialog.showModal();
    document.body.classList.add('dialog-open');
    dialog.scrollTop = 0;
    document.querySelector('.dialog-close').focus();
  });
});
document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => {
  const bounds = dialog.getBoundingClientRect();
  if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
});
dialog.addEventListener('close', () => {
  document.body.classList.remove('dialog-open');
  dialogTrigger?.focus();
});

const copyButton = document.querySelector('#copy-email');
const copyStatus = document.querySelector('#copy-status');
let copyTimeout;
copyButton.addEventListener('click', async () => {
  clearTimeout(copyTimeout);
  try {
    await navigator.clipboard.writeText('ssybz5@nottingham.edu.cn');
    copyStatus.textContent = 'Email copied.';
  } catch {
    copyStatus.textContent = 'Select and copy the email address above.';
  }
  copyTimeout = setTimeout(() => { copyStatus.textContent = ''; }, 6000);
});
