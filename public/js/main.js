document.addEventListener('DOMContentLoaded', function() {
  // Swiper carousel
  if (document.querySelector('.hero-swiper')) {
    new Swiper('.hero-swiper', {
      loop: true,
      autoplay: { delay: 5000, disableOnInteraction: false },
      pagination: { el: '.swiper-pagination', clickable: true },
      navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
      effect: 'fade',
      fadeEffect: { crossFade: true }
    });
  }

  // News ticker - duplicate content for seamless loop
  var ticker = document.querySelector('.ticker-content');
  if (ticker && ticker.children.length > 0) {
    ticker.innerHTML += ticker.innerHTML;
  }

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(function(a) {
    a.addEventListener('click', function(e) {
      var target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Back to top on scroll
  var header = document.querySelector('.site-header');
  if (header) {
    var lastScroll = 0;
    window.addEventListener('scroll', function() {
      var current = window.pageYOffset;
      if (current > 200) {
        header.style.boxShadow = '0 2px 12px rgba(0,0,0,0.3)';
      } else {
        header.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
      }
      lastScroll = current;
    });
  }
});

// Copy link function for article share
function copyLink() {
  navigator.clipboard.writeText(window.location.href).then(function() {
    var btn = document.querySelector('.share-btn.copy');
    if (btn) {
      var original = btn.textContent;
      btn.textContent = '已复制';
      btn.style.background = '#dbeafe';
      btn.style.color = '#1a56db';
      setTimeout(function() {
        btn.textContent = original;
        btn.style.background = '';
        btn.style.color = '';
      }, 2000);
    }
  });
}
