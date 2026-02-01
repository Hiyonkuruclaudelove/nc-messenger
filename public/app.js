/**
 * NC - Cliente web (mensagens instantâneas)
 */

const API_BASE = window.location.origin + '/api';
const WS_URL = (window.location.protocol === 'https:' ? 'wss://' : 'ws://') + window.location.host + '/ws';

let token = localStorage.getItem('nc_token');
let user = JSON.parse(localStorage.getItem('nc_user') || 'null');
let ws = null;
let currentRecipientId = null;
let sharedSecret = null;

const $ = (id) => document.getElementById(id);
const show = (id) => $(id)?.classList.remove('hidden');
const hide = (id) => $(id)?.classList.add('hidden');
const showScreen = (screenId) => {
  ['screen-email', 'screen-code', 'screen-name', 'screen-home', 'screen-chat'].forEach((s) => hide(s));
  show(screenId);
};

// Modal personalizado NC
function showModal(title, message, placeholder = '', onOk, onCancel) {
  const modal = $('nc-modal');
  const modalTitle = $('modal-title');
  const modalMessage = $('modal-message');
  const modalInput = $('modal-input');
  const btnOk = $('modal-ok');
  const btnCancel = $('modal-cancel');

  modalTitle.textContent = title;
  modalMessage.textContent = message;
  modalInput.value = '';
  modalInput.placeholder = placeholder;
  
  show('nc-modal');
  modalInput.focus();

  const handleOk = () => {
    const value = modalInput.value.trim();
    hide('nc-modal');
    if (onOk) onOk(value);
    cleanup();
  };

  const handleCancel = () => {
    hide('nc-modal');
    if (onCancel) onCancel();
    cleanup();
  };

  const handleEnter = (e) => {
    if (e.key === 'Enter') handleOk();
    if (e.key === 'Escape') handleCancel();
  };

  const cleanup = () => {
    btnOk.removeEventListener('click', handleOk);
    btnCancel.removeEventListener('click', handleCancel);
    modalInput.removeEventListener('keydown', handleEnter);
  };

  btnOk.addEventListener('click', handleOk);
  btnCancel.addEventListener('click', handleCancel);
  modalInput.addEventListener('keydown', handleEnter);
}

function showAlert(title, message, onOk) {
  const modal = $('nc-modal');
  const modalTitle = $('modal-title');
  const modalMessage = $('modal-message');
  const modalInput = $('modal-input');
  const btnOk = $('modal-ok');
  const btnCancel = $('modal-cancel');

  modalTitle.textContent = title;
  modalMessage.textContent = message;
  hide('modal-cancel');
  modalInput.style.display = 'none';
  
  show('nc-modal');

  const handleOk = () => {
    hide('nc-modal');
    show('modal-cancel');
    modalInput.style.display = 'block';
    if (onOk) onOk();
    cleanup();
  };

  const handleEnter = (e) => {
    if (e.key === 'Enter' || e.key === 'Escape') handleOk();
  };

  const cleanup = () => {
    btnOk.removeEventListener('click', handleOk);
    document.removeEventListener('keydown', handleEnter);
  };

  btnOk.addEventListener('click', handleOk);
  document.addEventListener('keydown', handleEnter);
}

function setError(el, msg) {
  const err = el?.querySelector('.error-msg');
  if (err) {
    err.textContent = msg || '';
    if (msg) {
      err.classList.remove('hidden');
    } else {
      err.classList.add('hidden');
    }
  } else {
    console.error('Erro:', msg);
  }
}

async function api(path, options = {}) {
  const url = API_BASE + path;
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = 'Bearer ' + token;
  const res = await fetch(url, { ...options, headers });
  const data = res.ok ? await res.json().catch(() => ({})) : await res.json().catch(() => ({ error: res.statusText }));
  if (!res.ok) throw new Error(data.error || res.statusText);
  return data;
}

function wsSend(obj) {
  if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(obj));
}

function connectWs() {
  if (ws && ws.readyState === WebSocket.OPEN) return;
  ws = new WebSocket(WS_URL);
  ws.onopen = () => {
    wsSend({ type: 'auth', payload: { token } });
  };
  ws.onmessage = (ev) => {
    try {
      const frame = JSON.parse(ev.data);
      if (frame.type === 'auth' && frame.payload?.userId) {
        console.log('XMPP autenticado');
      }
      if (frame.type === 'message' && frame.payload) {
        const p = frame.payload;
        if (p.recipientId === user?.id && p.senderId) {
          onMessageReceived(p);
        } else if (p.senderId === user?.id && p.status === 'sent') {
          appendMessage(p, true);
        }
      }
      if (frame.type === 'presence' && frame.payload?.userIds) {
        console.log('Online:', frame.payload.userIds);
      }
    } catch (e) {
      console.error(e);
    }
  };
  ws.onclose = () => {
    setTimeout(connectWs, 3000);
  };
}

function onMessageReceived(p) {
  if (currentRecipientId === p.senderId) {
        (async () => {
          try {
            const secret = NC_E2E.getSharedSecret(user.id, p.senderId);
            const plain = await NC_E2E.decrypt(p.bodyEncrypted, secret);
            appendMessage({ ...p, bodyPlain: plain }, false);
          } catch (e) {
            appendMessage({ ...p, bodyPlain: '[mensagem criptografada]' }, false);
          }
        })();
      } else {
        // notificação de nova mensagem (poderia mostrar badge)
      }
}

function appendMessage(m, isSent) {
  const list = $('messages-list');
  if (!list) return;
  const li = document.createElement('li');
  li.className = 'msg ' + (isSent ? 'sent' : 'received');
  const body = m.bodyPlain ?? m.body_encrypted ?? '[?]';
  const time = m.created_at ? new Date(m.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '';
  li.innerHTML = `<div>${escapeHtml(body)}</div><span class="time">${time}</span>`;
  list.appendChild(li);
  const container = list.parentElement;
  if (container) {
    container.scrollTop = container.scrollHeight;
  }
}

function escapeHtml(s) {
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

function getInitials(name) {
  return name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function getAvatarColor(name) {
  const colors = [
    '#667eea', '#764ba2', '#f093fb', '#4facfe',
    '#43e97b', '#fa709a', '#fee140', '#30cfd0'
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
}

function renderHome() {
  showScreen('screen-home');
  $('user-name').textContent = user?.name || user?.email || '';
  show('user-bar');
  const list = $('conversation-list');
  list.innerHTML = `
    <p class="muted">
      Seu ID para outros te adicionarem:
      <code>${user?.id || ''}</code>
      <br><br>
      Use o botão <strong>+</strong> no canto superior para iniciar uma nova conversa.
    </p>
  `;
  
  // TODO: Carregar conversas reais do backend
  // Por enquanto, mostra apenas mensagem de ajuda
}

async function openChat(recipientId, recipientName) {
  currentRecipientId = recipientId;
  sharedSecret = NC_E2E.getSharedSecret(user.id, recipientId);
  $('chat-recipient-id').value = recipientId;
  $('chat-with-name').textContent = recipientName || recipientId;
  
  // Avatar
  const avatar = $('chat-avatar');
  if (avatar) {
    avatar.style.background = `linear-gradient(135deg, ${getAvatarColor(recipientName || recipientId)}, var(--accent-hover))`;
    avatar.textContent = getInitials(recipientName || recipientId);
  }
  
  $('messages-list').innerHTML = '';
  showScreen('screen-chat');
  
  try {
    const data = await api('/messages/conversation/' + encodeURIComponent(recipientId) + '?limit=50');
    (data.messages || []).reverse().forEach((m) => {
      const isSent = m.sender_id === user.id;
      (async () => {
        let bodyPlain = m.body_encrypted;
        if (!isSent || true) {
          try {
            bodyPlain = await NC_E2E.decrypt(m.body_encrypted, sharedSecret);
          } catch (_) {
            bodyPlain = '[criptografada]';
          }
        }
        appendMessage({ ...m, bodyPlain }, isSent);
      })();
    });
  } catch (e) {
    console.error(e);
  }
}

// --- Email (registro ou login)
$('form-email')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = $('input-email').value.trim().toLowerCase();
  setError($('form-email'), '');
  try {
    await api('/auth/register/email', { method: 'POST', body: JSON.stringify({ email }) });
    $('code-email').textContent = email;
    $('input-code').value = '';
    $('input-name').value = '';
    showScreen('screen-code');
    document.body.dataset.flow = 'register';
  } catch (err) {
    if (err.message.includes('já cadastrado')) {
      await api('/auth/login/send-code', { method: 'POST', body: JSON.stringify({ email }) });
      $('code-email').textContent = email;
      $('input-code').value = '';
      showScreen('screen-code');
      document.body.dataset.flow = 'login';
    } else {
      setError($('form-email'), err.message);
    }
  }
});

// --- Código
$('form-code')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = $('code-email').textContent;
  const code = $('input-code').value.trim();
  setError($('form-code'), '');
  const flow = document.body.dataset.flow || 'register';
  try {
    if (flow === 'register') {
      document.body.dataset.pendingEmail = email;
      document.body.dataset.pendingCode = code;
      $('input-name-reg').value = '';
      showScreen('screen-name');
    } else {
      const data = await api('/auth/login/email', {
        method: 'POST',
        body: JSON.stringify({ email, code }),
      });
      token = data.token;
      user = data.user;
      localStorage.setItem('nc_token', token);
      localStorage.setItem('nc_user', JSON.stringify(user));
      connectWs();
      renderHome();
    }
  } catch (err) {
    setError($('form-code'), err.message);
  }
});

// --- Nome (só registro)
$('form-name')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  console.log('Form nome submitted');
  const email = document.body.dataset.pendingEmail || '';
  const code = document.body.dataset.pendingCode || '';
  const name = $('input-name-reg').value.trim();
  console.log('Email:', email, 'Code:', code, 'Name:', name);
  
  if (!email || !code) {
    setError($('form-name'), 'Erro: email ou código ausente. Recomece o processo.');
    return;
  }
  
  if (name.length < 2) {
    setError($('form-name'), 'Nome deve ter pelo menos 2 caracteres');
    return;
  }
  
  setError($('form-name'), '');
  const btn = $('form-name').querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.textContent = 'Criando...';
  
  try {
    console.log('Chamando API register/verify...');
    console.log('URL:', API_BASE + '/auth/register/verify');
    const data = await api('/auth/register/verify', {
      method: 'POST',
      body: JSON.stringify({ email, code, name }),
    });
    console.log('Resposta:', data);
    token = data.token;
    user = data.user;
    localStorage.setItem('nc_token', token);
    localStorage.setItem('nc_user', JSON.stringify(user));
    delete document.body.dataset.pendingEmail;
    delete document.body.dataset.pendingCode;
    connectWs();
    renderHome();
  } catch (err) {
    console.error('Erro completo ao criar conta:', err);
    let errorMsg = 'Erro ao conectar ao servidor. Verifique se o servidor está rodando.';
    if (err.message && !err.message.includes('fetch')) {
      errorMsg = err.message;
    }
    setError($('form-name'), errorMsg);
    btn.disabled = false;
    btn.textContent = 'Criar conta';
  }
});

// --- Nova conversa
$('btn-new-chat')?.addEventListener('click', () => {
  showModal(
    'Nova Conversa',
    'Digite o ID do usuário para iniciar uma conversa:',
    'ID do usuário (UUID)',
    (userId) => {
      if (userId) {
        showModal(
          'Nome do Contato',
          'Digite um nome para este contato (opcional):',
          'Nome (deixe vazio para usar o ID)',
          (name) => {
            openChat(userId, name || userId);
          }
        );
      }
    }
  );
});

$('search-user')?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const id = $('search-user').value.trim();
    if (id) {
      showModal(
        'Nova Conversa',
        `Iniciar conversa com: ${id}`,
        'Nome do contato (opcional)',
        (name) => {
          openChat(id, name || id);
        }
      );
    }
  }
});

// --- Voltar do chat
$('btn-back-chat')?.addEventListener('click', () => {
  currentRecipientId = null;
  renderHome();
});

// --- Enviar mensagem
$('form-send')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const recipientId = $('chat-recipient-id').value;
  const text = $('input-message').value.trim();
  if (!recipientId || !text) return;
  const secret = NC_E2E.getSharedSecret(user.id, recipientId);
  let bodyEncrypted;
  try {
    bodyEncrypted = await NC_E2E.encrypt(text, secret);
  } catch (err) {
    alert('Erro ao criptografar: ' + err.message);
    return;
  }
  wsSend({
    type: 'message',
    payload: { recipientId, bodyEncrypted, type: 'text' },
  });
  $('input-message').value = '';
});

// --- Logout
$('btn-logout')?.addEventListener('click', () => {
  token = null;
  user = null;
  localStorage.removeItem('nc_token');
  localStorage.removeItem('nc_user');
  if (ws) {
    ws.close();
    ws = null;
  }
  hide('user-bar');
  showScreen('screen-email');
  $('input-email').value = '';
});

// --- Recomeçar
$('btn-restart')?.addEventListener('click', () => {
  delete document.body.dataset.pendingEmail;
  delete document.body.dataset.pendingCode;
  delete document.body.dataset.flow;
  $('input-email').value = '';
  $('input-code').value = '';
  $('input-name-reg').value = '';
  showScreen('screen-email');
});

// --- Init
if (token && user) {
  connectWs();
  renderHome();
} else {
  showScreen('screen-email');
}
