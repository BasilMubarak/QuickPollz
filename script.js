const API_URL = 'http://localhost:5000/api/polls';

// --- CREATE POLL ---
const pollForm = document.getElementById('poll-form');
if (pollForm) {
  pollForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const question = document.getElementById('question').value;
    const options = Array.from(document.getElementsByClassName('option-input'))
      .map(input => input.value)
      .filter(text => text.trim() !== '');

    if (!question || options.length < 2) {
      alert('Please enter a question and at least two options.');
      return;
    }

    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, options })
    });

    if (res.ok) {
      alert('Poll created!');
      pollForm.reset();
      window.location.href = 'index.html';
    } else {
      alert('Error creating poll.');
    }
  });

  // Add new option field
  document.getElementById('add-option').addEventListener('click', () => {
    const container = document.getElementById('options-container');
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Option';
    input.className = 'option-input';
    container.appendChild(input);
  });
}

// --- LOAD POLLS ---
async function loadPolls() {
  const res = await fetch(API_URL);
  const polls = await res.json();

  const pollList = document.getElementById('poll-list');
  if (!pollList) return;

  pollList.innerHTML = '';

  polls.forEach(poll => {
    const hasVoted = localStorage.getItem(`voted_${poll._id}`) === 'true';

    const pollItem = document.createElement('div');
    pollItem.className = 'poll-item';
    pollItem.innerHTML = `
      <h3>${poll.question}</h3>
      <ul>
        ${poll.options.map((opt, idx) => `
          <li>
            ${opt.text} - ${opt.votes} votes 
            ${!hasVoted ? `<button onclick="vote('${poll._id}', ${idx})">Vote</button>` : '<span>You already voted</span>'}
          </li>
        `).join('')}
      </ul>
    `;
    pollList.appendChild(pollItem);
  });
}

// --- VOTE FUNCTION ---
async function vote(pollId, optionIndex) {
  if (localStorage.getItem(`voted_${pollId}`) === 'true') {
    alert('You have already voted in this poll.');
    return;
  }

  const res = await fetch(`${API_URL}/${pollId}/vote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ optionIndex })
  });

  if (res.ok) {
    localStorage.setItem(`voted_${pollId}`, 'true');
    alert('Thanks for voting!');
    loadPolls();
  } else {
    alert('Error voting. Please try again.');
  }
}

// --- LOAD RESULTS ---
async function loadResults() {
  const res = await fetch(API_URL);
  const polls = await res.json();

  const resultsContainer = document.getElementById('results-list');
  if (!resultsContainer) return;

  resultsContainer.innerHTML = '';

  polls.forEach(poll => {
    const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0) || 1;

    const pollDiv = document.createElement('div');
    pollDiv.className = 'result-item';
    pollDiv.innerHTML = `<h3>${poll.question}</h3>`;

    poll.options.forEach(opt => {
      const percent = ((opt.votes / totalVotes) * 100).toFixed(1);
      const optionDiv = document.createElement('div');
      optionDiv.innerHTML = `
        <p>${opt.text} - ${opt.votes} votes (${percent}%)</p>
        <div style="background: #fff3; border-radius: 8px; overflow: hidden; height: 16px; margin-bottom: 10px;">
          <div style="width: ${percent}%; background: #ff6a00; height: 100%;"></div>
        </div>
      `;
      pollDiv.appendChild(optionDiv);
    });

    resultsContainer.appendChild(pollDiv);
  });
}

// --- PAGE INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('poll-list')) {
    loadPolls();
  }

  if (document.getElementById('results-list')) {
    loadResults();
  }
});
