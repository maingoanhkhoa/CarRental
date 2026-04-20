/**
 * navbar.js — Hamburger mobile nav toggle
 * Hoạt động trên tất cả các trang có header.
 */
document.addEventListener('DOMContentLoaded', function () {
  var hamburger = document.getElementById('hamburger-btn');
  var mobileNav = document.getElementById('mobile-nav');
  var backdrop  = document.getElementById('nav-backdrop');

  if (!hamburger || !mobileNav || !backdrop) return;

  var isOpen = false;

  function openNav() {
    isOpen = true;
    hamburger.classList.add('is-active');
    hamburger.setAttribute('aria-expanded', 'true');
    mobileNav.classList.add('nav-open');
    mobileNav.setAttribute('aria-hidden', 'false');
    backdrop.classList.add('backdrop-visible');
    document.body.style.overflow = 'hidden';
  }

  function closeNav() {
    isOpen = false;
    hamburger.classList.remove('is-active');
    hamburger.setAttribute('aria-expanded', 'false');
    mobileNav.classList.remove('nav-open');
    mobileNav.setAttribute('aria-hidden', 'true');
    backdrop.classList.remove('backdrop-visible');
    document.body.style.overflow = '';
  }

  function toggleNav() {
    isOpen ? closeNav() : openNav();
  }

  // Toggle khi click hamburger
  hamburger.addEventListener('click', function (e) {
    e.stopPropagation();
    toggleNav();
  });

  // Đóng khi click backdrop
  backdrop.addEventListener('click', closeNav);

  // Đóng khi click link trong mobile nav
  var navLinks = mobileNav.querySelectorAll('a');
  for (var i = 0; i < navLinks.length; i++) {
    navLinks[i].addEventListener('click', closeNav);
  }

  // Đóng khi resize lên desktop
  window.addEventListener('resize', function () {
    if (window.innerWidth > 768 && isOpen) {
      closeNav();
    }
  });

  // Đóng khi nhấn Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isOpen) {
      closeNav();
      hamburger.focus();
    }
  });
});
