<?php
/**
 * NC Messenger - Painel Admin (Servidor)
 * Mostra status do servidor NC (Railway) e estatísticas.
 *
 * CONFIGURAÇÃO: edite as constantes abaixo.
 */
// URL do servidor NC (Railway) - sem barra no final. Ex: https://nc-messenger-production.up.railway.app
if (!defined('NC_API_URL')) {
  define('NC_API_URL', 'https://SEU-PROJETO.up.railway.app');
}
// Segredo para /api/admin/stats (opcional). Se definir no Railway NC_ADMIN_SECRET, use o mesmo aqui.
if (!defined('NC_ADMIN_SECRET')) {
  define('NC_ADMIN_SECRET', '');
}

function nc_fetch($path, $secret = '') {
  $url = rtrim(NC_API_URL, '/') . $path;
  if ($secret !== '') {
    $url .= (strpos($path, '?') !== false ? '&' : '?') . 'secret=' . urlencode($secret);
  }
  $ctx = stream_context_create([
    'http' => [
      'timeout' => 8,
      'ignore_errors' => true,
    ],
  ]);
  if (function_exists('file_get_contents')) {
    $r = @file_get_contents($url, false, $ctx);
    if ($r !== false) return ['body' => $r, 'code' => 200];
  }
  if (function_exists('curl_init')) {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 8);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    $body = curl_exec($ch);
    $code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    if ($body !== false) return ['body' => $body, 'code' => $code];
  }
  return ['body' => null, 'code' => 0];
}

$health = nc_fetch('/api/health');
$online = ($health['code'] === 200 && $health['body'] && strpos($health['body'], '"ok":true') !== false);

$users = 0;
$messages = 0;
$sessions = 0;
if ($online) {
  $statsPath = '/api/admin/stats';
  $stats = nc_fetch($statsPath, NC_ADMIN_SECRET);
  if ($stats['code'] === 200 && $stats['body']) {
    $data = @json_decode($stats['body'], true);
    if (is_array($data)) {
      $users    = isset($data['users'])    ? (int) $data['users']    : 0;
      $messages = isset($data['messages']) ? (int) $data['messages'] : 0;
      $sessions = isset($data['sessions']) ? (int) $data['sessions'] : 0;
    }
  }
}
?>
<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NC Messenger - Servidor</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; margin: 0; padding: 24px; background: #1a1a2e; color: #eee; min-height: 100vh; }
    a { color: #6c9eff; text-decoration: none; }
    a:hover { text-decoration: underline; }
    h1 { margin: 0 0 24px; font-size: 1.5rem; }
    .back { display: inline-block; margin-bottom: 24px; }
    .cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; }
    .card { background: #16213e; border-radius: 12px; padding: 20px; text-align: center; }
    .card .value { font-size: 2rem; font-weight: 700; margin: 8px 0; }
    .card .label { font-size: 0.9rem; color: #aaa; }
    .card.status .value { font-size: 1.25rem; }
    .card.status.online .value { color: #4ade80; }
    .card.status.offline .value { color: #f87171; }
    .card svg { width: 32px; height: 32px; opacity: 0.8; }
  </style>
</head>
<body>
  <a class="back" href="javascript:history.back()">← Voltar ao Dashboard</a>
  <h1>NC Messenger - Servidor</h1>
  <div class="cards">
    <div class="card">
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
      <div class="label">Usuários Registrados</div>
      <div class="value"><?= (int) $users ?></div>
    </div>
    <div class="card">
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
      <div class="label">Mensagens Enviadas</div>
      <div class="value"><?= (int) $messages ?></div>
    </div>
    <div class="card">
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z"/></svg>
      <div class="label">Sessões Ativas</div>
      <div class="value"><?= (int) $sessions ?></div>
    </div>
    <div class="card status <?= $online ? 'online' : 'offline' ?>">
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"/></svg>
      <div class="label">Status do Servidor</div>
      <div class="value"><?= $online ? 'ONLINE' : 'OFFLINE' ?></div>
    </div>
  </div>
  <p style="margin-top: 24px; color: #666; font-size: 0.85rem;">
    API: <code><?= htmlspecialchars(NC_API_URL) ?></code>
    <?php if (NC_API_URL === 'https://SEU-PROJETO.up.railway.app'): ?>
      <br><strong>Configure NC_API_URL no topo deste ficheiro com a URL do Railway.</strong>
    <?php endif; ?>
  </p>
</body>
</html>
