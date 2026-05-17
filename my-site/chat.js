// ── LAUNCHERS ─────────────────────────────────────────────
const launchers = document.getElementById('widgetLaunchers');

function showLaunchers() { launchers.classList.remove('hidden'); }
function hideLaunchers() { launchers.classList.add('hidden'); }

// ── Q&A CHAT WIDGET ───────────────────────────────────────
const chatBubble   = document.getElementById('chatBubble');
const chatPanel    = document.getElementById('chatPanel');
const chatClose    = document.getElementById('chatClose');
const chatInput    = document.getElementById('chatInput');
const chatSend     = document.getElementById('chatSend');
const chatMessages = document.getElementById('chatMessages');

chatBubble.addEventListener('click', () => {
  hideLaunchers();
  chatPanel.classList.add('open');
  chatInput.focus();
});
chatClose.addEventListener('click', () => {
  chatPanel.classList.remove('open');
  showLaunchers();
});
chatInput.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChatMessage(); }
});
chatSend.addEventListener('click', sendChatMessage);

function addChatMsg(text, role) {
  const div = document.createElement('div');
  div.className = `chat-msg ${role}`;
  div.textContent = text;
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return div;
}

function addChatTyping() {
  const div = document.createElement('div');
  div.className = 'chat-msg bot typing';
  div.innerHTML = '<span class="typing-dots"><span></span><span></span><span></span></span>';
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return div;
}

async function sendChatMessage() {
  const text = chatInput.value.trim();
  if (!text) return;
  chatInput.value = '';
  chatInput.disabled = true;
  chatSend.disabled = true;
  addChatMsg(text, 'user');
  const typing = addChatTyping();
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text }),
    });
    const data = await res.json();
    typing.remove();
    addChatMsg(data.reply || 'Sorry, something went wrong. Reach out to smitha@beroe-inc.com', 'bot');
  } catch {
    typing.remove();
    addChatMsg('Connection issue. Please reach out to smitha@beroe-inc.com directly.', 'bot');
  }
  chatInput.disabled = false;
  chatSend.disabled = false;
  chatInput.focus();
}

// ── PROPOSAL INTAKE WIDGET ────────────────────────────────
const proposalBubble   = document.getElementById('proposalBubble');
const proposalPanel    = document.getElementById('proposalPanel');
const proposalClose    = document.getElementById('proposalClose');
const proposalInput    = document.getElementById('proposalInput');
const proposalSend     = document.getElementById('proposalSend');
const proposalMessages = document.getElementById('proposalMessages');
const progressFill     = document.getElementById('progressFill');
const progressLabel    = document.getElementById('progressLabel');

let intakeStarted  = false;
let intakeMessages = [];
let intakeComplete = false;

proposalBubble.addEventListener('click', () => {
  hideLaunchers();
  proposalPanel.classList.add('open');
  if (!intakeStarted) {
    intakeStarted = true;
    startIntake();
  } else if (!intakeComplete) {
    proposalInput.focus();
  }
});
proposalClose.addEventListener('click', () => {
  proposalPanel.classList.remove('open');
  showLaunchers();
});
proposalInput.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendProposalMessage(); }
});
proposalSend.addEventListener('click', sendProposalMessage);

function addProposalMsg(text, role) {
  const div = document.createElement('div');
  div.className = `chat-msg ${role}`;
  div.textContent = text;
  proposalMessages.appendChild(div);
  proposalMessages.scrollTop = proposalMessages.scrollHeight;
  return div;
}

function addProposalTyping() {
  const div = document.createElement('div');
  div.className = 'chat-msg bot typing';
  div.innerHTML = '<span class="typing-dots"><span></span><span></span><span></span></span>';
  proposalMessages.appendChild(div);
  proposalMessages.scrollTop = proposalMessages.scrollHeight;
  return div;
}

function setProgress(step, done) {
  if (done) {
    progressFill.style.width = '100%';
    progressLabel.textContent = 'Complete';
  } else {
    progressFill.style.width = ((step / 6) * 100) + '%';
    progressLabel.textContent = 'Step ' + step + ' of 6';
  }
}

async function callIntakeAPI() {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: intakeMessages }),
  });
  return res.json();
}

function handleIntakeResponse(data) {
  const reply = data.reply || 'Something went wrong. Please try again.';
  intakeMessages.push({ role: 'assistant', content: reply });
  addProposalMsg(reply, 'bot');

  if (data.intake_step) setProgress(data.intake_step);

  if (data.complete) {
    intakeComplete = true;
    setProgress(null, true);
    document.getElementById('proposalInputRow').style.display = 'none';
    document.getElementById('proposalCompleteBanner').style.display = 'flex';
    fetch('/api/generate-proposal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ intake_data: data.intake_data, conversation: intakeMessages }),
    }).catch(() => {});
  } else {
    proposalInput.disabled = false;
    proposalSend.disabled = false;
    proposalInput.focus();
  }
}

async function startIntake() {
  intakeMessages = [{ role: 'user', content: "I'd like to get a proposal." }];
  const typing = addProposalTyping();
  try {
    const data = await callIntakeAPI();
    typing.remove();
    handleIntakeResponse(data);
  } catch {
    typing.remove();
    addProposalMsg('Something went wrong. Please email smitha@beroe-inc.com directly.', 'bot');
  }
}

async function sendProposalMessage() {
  if (intakeComplete) return;
  const text = proposalInput.value.trim();
  if (!text) return;
  proposalInput.value = '';
  proposalInput.disabled = true;
  proposalSend.disabled = true;
  intakeMessages.push({ role: 'user', content: text });
  addProposalMsg(text, 'user');
  const typing = addProposalTyping();
  try {
    const data = await callIntakeAPI();
    typing.remove();
    handleIntakeResponse(data);
  } catch {
    typing.remove();
    intakeMessages.pop();
    addProposalMsg('Something went wrong. Please try again.', 'bot');
    proposalInput.disabled = false;
    proposalSend.disabled = false;
  }
}
