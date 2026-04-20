/**
 * reviews.js — Frontend logic for the reviews page
 * Handles: loading reviews, submitting reviews, star rating, UX states
 */

const API_BASE = 'http://localhost:5000/api/reviews';

// ── Star Rating ──────────────────────────────────────────────
const starBtns = document.querySelectorAll('.star-btn');
const ratingInput = document.getElementById('review-rating');

function updateStars(value) {
  starBtns.forEach(btn => {
    const v = parseInt(btn.dataset.value);
    btn.classList.toggle('active', v <= value);
  });
  ratingInput.value = value;
}

starBtns.forEach(btn => {
  btn.addEventListener('click', () => updateStars(parseInt(btn.dataset.value)));
  btn.addEventListener('mouseenter', () => {
    starBtns.forEach(b => b.classList.remove('hover'));
    const v = parseInt(btn.dataset.value);
    starBtns.forEach(b => {
      if (parseInt(b.dataset.value) <= v) b.classList.add('hover');
    });
  });
});

document.getElementById('star-rating').addEventListener('mouseleave', () => {
  starBtns.forEach(b => b.classList.remove('hover'));
});

// ── Render Reviews ───────────────────────────────────────────
function renderStars(rating) {
  const r = Math.min(5, Math.max(1, parseInt(rating) || 5));
  return Array.from({ length: 5 }, (_, i) =>
    `<span class="r-star ${i < r ? 'filled' : 'empty'}">★</span>`
  ).join('');
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function renderReviews(reviews) {
  const loading = document.getElementById('reviews-loading');
  const empty = document.getElementById('reviews-empty');
  const list = document.getElementById('reviews-list');
  const countBadge = document.getElementById('review-count');

  loading.style.display = 'none';

  if (countBadge) countBadge.textContent = reviews.length;

  if (reviews.length === 0) {
    empty.style.display = 'flex';
    list.style.display = 'none';
    return;
  }

  empty.style.display = 'none';
  list.style.display = 'flex';

  list.innerHTML = reviews.map((r, i) => `
    <div class="review-dynamic-card" style="animation-delay: ${i * 0.06}s">
      <div class="rdc-header" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
        <div class="rdc-meta">
          <div class="rdc-name" style="font-size: 1.1rem; color: #111827;">${escapeHtml(r.name)}</div>
          <div class="rdc-date" style="margin-top: 0.25rem;">${formatDate(r.created_at)}</div>
        </div>
        <div class="rdc-stars" style="margin-bottom: 0;">${renderStars(r.rating)}</div>
      </div>
      <p class="rdc-comment">${escapeHtml(r.comment)}</p>
    </div>
  `).join('');
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ── Load Reviews ─────────────────────────────────────────────
async function loadReviews() {
  const loading = document.getElementById('reviews-loading');
  const empty = document.getElementById('reviews-empty');
  const list = document.getElementById('reviews-list');

  loading.style.display = 'grid';
  empty.style.display = 'none';
  list.style.display = 'none';

  try {
    const res = await fetch(API_BASE);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    renderReviews(data);
  } catch (err) {
    console.error('Failed to load reviews:', err);
    loading.style.display = 'none';
    empty.style.display = 'flex';
    document.getElementById('reviews-empty').querySelector('p').textContent =
      'Không thể tải đánh giá. Vui lòng thử lại sau.';
  }
}

// ── Submit Review ─────────────────────────────────────────────
document.getElementById('submit-review').addEventListener('click', async () => {
  const nameEl = document.getElementById('review-name');
  const commentEl = document.getElementById('review-comment');
  const ratingEl = document.getElementById('review-rating');
  const btn = document.getElementById('submit-review');
  const btnText = document.getElementById('btn-text');
  const successMsg = document.getElementById('success-msg');

  const name = nameEl.value.trim();
  const comment = commentEl.value.trim();
  const rating = parseInt(ratingEl.value) || 5;

  // Validation
  if (!name || name.length < 2) {
    nameEl.focus();
    nameEl.classList.add('input-error');
    setTimeout(() => nameEl.classList.remove('input-error'), 2000);
    alert('Vui lòng nhập tên (tối thiểu 2 ký tự)');
    return;
  }

  if (!comment || comment.length < 10) {
    commentEl.focus();
    commentEl.classList.add('input-error');
    setTimeout(() => commentEl.classList.remove('input-error'), 2000);
    alert('Vui lòng nhập nội dung đánh giá (tối thiểu 10 ký tự)');
    return;
  }

  // Disable button
  btn.disabled = true;
  btn.classList.add('btn-loading');
  if (btnText) btnText.textContent = 'Submitting...';
  successMsg.style.display = 'none';

  try {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, comment, rating })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Lỗi máy chủ');
    }

    // Reset form
    nameEl.value = '';
    commentEl.value = '';
    updateStars(5);

    // Show success
    successMsg.style.display = 'flex';
    setTimeout(() => { successMsg.style.display = 'none'; }, 4000);

    // Reload reviews and scroll
    await loadReviews();
    document.getElementById('reviews-list').scrollIntoView({ behavior: 'smooth', block: 'start' });

  } catch (err) {
    console.error('Submit error:', err);
    alert('Có lỗi xảy ra: ' + err.message);
  } finally {
    btn.disabled = false;
    btn.classList.remove('btn-loading');
    if (btnText) btnText.textContent = 'Submit Review';
  }
});

// ── Init ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', loadReviews);
