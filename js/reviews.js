// Star Rating
const starBtns = document.querySelectorAll('.star-btn');
const ratingInput = document.getElementById('review-rating');

function updateStars(value) {
  starBtns.forEach(btn => {
    const v = parseInt(btn.dataset.value);
    btn.classList.toggle('active', v <= value);
  });
  if (ratingInput) ratingInput.value = value;
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

const starRatingEl = document.getElementById('star-rating');
if (starRatingEl) {
  starRatingEl.addEventListener('mouseleave', () => {
    starBtns.forEach(b => b.classList.remove('hover'));
  });
}

// Render Reviews
function renderStars(rating) {
  const r = Math.min(5, Math.max(1, parseInt(rating) || 5));
  return Array.from({ length: 5 }, (_, i) =>
    `<span class="r-star ${i < r ? 'filled' : 'empty'}">★</span>`
  ).join('');
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('vi-VN', { month: 'long', day: 'numeric', year: 'numeric' });
}

function renderReviews(reviews) {
  const loading = document.getElementById('reviews-loading');
  const empty = document.getElementById('reviews-empty');
  const list = document.getElementById('reviews-list');
  const countBadge = document.getElementById('review-count');

  if (loading) loading.style.display = 'none';

  if (countBadge) countBadge.textContent = reviews.length;

  if (!reviews || reviews.length === 0) {
    if (empty) empty.style.display = 'flex';
    if (list) list.style.display = 'none';
    return;
  }

  if (empty) empty.style.display = 'none';
  if (list) {
    list.style.display = 'flex';
    list.innerHTML = reviews.map((r, i) => `
      <div class="review-dynamic-card" style="animation-delay: ${i * 0.06}s">
        <div class="rdc-header" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
          <div class="rdc-meta">
            <div class="rdc-name" style="font-size: 1.1rem; color: #111827; font-weight: 700;">${escapeHtml(r.name)}</div>
            <div class="rdc-date" style="margin-top: 0.25rem; font-size: 0.85rem; color: #6b7280;">${formatDate(r.created_at)}</div>
          </div>
          <div class="rdc-stars" style="margin-bottom: 0;">${renderStars(r.rating)}</div>
        </div>
        <p class="rdc-comment" style="color: #4b5563; line-height: 1.6; margin: 0;">${escapeHtml(r.comment)}</p>
      </div>
    `).join('');
  }
}

function escapeHtml(str) {
  return String(str || '')
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

  if (loading) loading.style.display = 'grid';
  if (empty) empty.style.display = 'none';
  if (list) list.style.display = 'none';

  try {
    const reviews = await api.getReviews();
    renderReviews(reviews);
  } catch (err) {
    console.error('Failed to load reviews:', err);
    if (loading) loading.style.display = 'none';
    if (empty) {
      empty.style.display = 'flex';
      const p = empty.querySelector('p');
      if (p) p.textContent = 'Không thể tải đánh giá. Vui lòng thử lại sau.';
    }
  }
}

window.initReview = loadReviews;

// ── Submit Review ─────────────────────────────────────────────
const submitReviewBtn = document.getElementById('submit-review');
if (submitReviewBtn) {
  submitReviewBtn.addEventListener('click', async () => {
    const nameEl = document.getElementById('review-name');
    const commentEl = document.getElementById('review-comment');
    const ratingEl = document.getElementById('review-rating');
    const btn = document.getElementById('submit-review');
    const btnText = document.getElementById('btn-text');
    const successMsg = document.getElementById('success-msg');

    const name = nameEl ? nameEl.value.trim() : '';
    const comment = commentEl ? commentEl.value.trim() : '';
    const rating = ratingEl ? (parseInt(ratingEl.value) || 5) : 5;

    // Validation
    if (!name || name.length < 2) {
      if (nameEl) {
        nameEl.focus();
        nameEl.classList.add('input-error');
        setTimeout(() => nameEl.classList.remove('input-error'), 2000);
      }
      alert('Vui lòng nhập tên (tối thiểu 2 ký tự)');
      return;
    }

    if (!comment || comment.length < 10) {
      if (commentEl) {
        commentEl.focus();
        commentEl.classList.add('input-error');
        setTimeout(() => commentEl.classList.remove('input-error'), 2000);
      }
      alert('Vui lòng nhập nội dung đánh giá (tối thiểu 10 ký tự)');
      return;
    }

    // Disable button
    btn.disabled = true;
    btn.classList.add('btn-loading');
    if (btnText) btnText.textContent = 'Đang gửi...';
    if (successMsg) successMsg.style.display = 'none';

    try {
      await api.createReview({ name, comment, rating });

      // Reset form
      if (nameEl) nameEl.value = '';
      if (commentEl) commentEl.value = '';
      updateStars(5);

      // Show success
      if (successMsg) {
        successMsg.style.display = 'flex';
        setTimeout(() => { successMsg.style.display = 'none'; }, 4000);
      }

      // Reload reviews and scroll
      await loadReviews();
      const listEl = document.getElementById('reviews-list');
      if (listEl) {
        listEl.scrollTop = 0;
        listEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }

    } catch (err) {
      console.error('Submit error:', err);
      alert('Có lỗi xảy ra: ' + err.message);
    } finally {
      btn.disabled = false;
      btn.classList.remove('btn-loading');
      if (btnText) btnText.textContent = 'Gửi Đánh Giá';
    }
  });
}

// ── Init ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', loadReviews);
