<?php
/**
 * NC Messenger - Relay de envio de código de verificação
 * Usa o mesmo SMTP do recuperar senha (Hostinger). Só precisa de atualizar/upload dos ficheiros.
 * Ver LEIA-ME-RELAY.txt
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(204);
  exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  header('Content-Type: application/json; charset=utf-8');
  echo json_encode(['ok' => true, 'message' => 'Relay NC ativo. O envio de código é feito por POST (servidor Railway).']);
  exit;
}
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['ok' => false, 'error' => 'Método não permitido']);
  exit;
}

// Segredo e config: carregar de enviar_codigo_nc_config.php (na mesma pasta)
if (is_file(__DIR__ . '/enviar_codigo_nc_config.php')) {
  require_once __DIR__ . '/enviar_codigo_nc_config.php';
}
if (!defined('RELAY_SECRET')) {
  define('RELAY_SECRET', '');
}

// Carregar config do recuperar senha (mesmo SMTP) - vários caminhos comuns no Hostinger
$config_paths = [
  __DIR__ . '/../backend/email_config_outlook.php',
  __DIR__ . '/../../claude/backend/email_config_outlook.php',
  __DIR__ . '/../../backend/email_config_outlook.php',
  __DIR__ . '/email_config_outlook.php',
  __DIR__ . '/../email_config_outlook.php',
];
$config_loaded = false;
foreach ($config_paths as $p) {
  if (is_file($p)) {
    require_once $p;
    $config_loaded = true;
    break;
  }
}

if (!$config_loaded) {
  // Defina manualmente (mesmos valores do recuperar senha)
  if (!defined('OUTLOOK_HOST'))     define('OUTLOOK_HOST', 'smtp.hostinger.com');
  if (!defined('OUTLOOK_PORT'))     define('OUTLOOK_PORT', 587);
  if (!defined('OUTLOOK_USERNAME')) define('OUTLOOK_USERNAME', 'nc@claudeservices.com');
  if (!defined('OUTLOOK_PASSWORD')) define('OUTLOOK_PASSWORD', 'SUA_SENHA_DO_EMAIL_NC');
  if (!defined('OUTLOOK_FROM'))     define('OUTLOOK_FROM', 'Claude Services <nc@claudeservices.com>');
}

$input = json_decode(file_get_contents('php://input'), true) ?: [];
$email = isset($input['email']) ? trim($input['email']) : '';
$code  = isset($input['code'])  ? trim($input['code'])  : '';
$secret = isset($input['secret']) ? $input['secret'] : '';

if (RELAY_SECRET === '' || $secret !== RELAY_SECRET) {
  http_response_code(403);
  echo json_encode(['ok' => false, 'error' => 'Acesso negado']);
  exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($code) < 4) {
  http_response_code(400);
  echo json_encode(['ok' => false, 'error' => 'Email ou código inválido']);
  exit;
}

$from = defined('OUTLOOK_FROM') ? OUTLOOK_FROM : 'NC <nc@claudeservices.com>';
$subject = '[NC] Código de verificação';
$body = "Seu código de verificação NC é: {$code}\n\nVálido por 15 minutos.";
$bodyHtml = "<p>Seu código de verificação NC é: <strong>" . htmlspecialchars($code) . "</strong></p><p>Válido por 15 minutos.</p>";

$result = enviar_smtp(
  OUTLOOK_HOST,
  (int) OUTLOOK_PORT,
  OUTLOOK_USERNAME,
  OUTLOOK_PASSWORD,
  $from,
  $email,
  $subject,
  $body,
  $bodyHtml
);

if ($result === true) {
  echo json_encode(['ok' => true]);
} else {
  http_response_code(503);
  echo json_encode([
    'ok' => false,
    'error' => 'Falha ao enviar email',
    'error_detail' => $result,
  ]);
}

/**
 * Envio SMTP mínimo (sem PHPMailer) - mesma lógica que recuperar senha no Hostinger
 * Retorna true em sucesso, ou string (error_detail) em falha: smtp_connect, smtp_tls, smtp_auth, smtp_send
 */
function enviar_smtp($host, $port, $user, $pass, $from, $to, $subject, $bodyText, $bodyHtml) {
  $errno = 0;
  $errstr = '';
  $smtp = @stream_socket_client(
    "tcp://{$host}:{$port}",
    $errno,
    $errstr,
    15,
    STREAM_CLIENT_CONNECT
  );
  if (!$smtp) {
    error_log("NC relay SMTP connect: {$errstr} ({$errno})");
    return 'smtp_connect';
  }

  $line = function () use ($smtp) {
    $s = fgets($smtp, 512);
    return $s === false ? '' : $s;
  };
  $send = function ($cmd) use ($smtp) {
    fwrite($smtp, $cmd . "\r\n");
  };

  $line(); // banner 220
  $send('EHLO ' . ($_SERVER['SERVER_NAME'] ?? 'localhost'));
  while ($s = $line()) { if (preg_match('/^\d{3}\s/', $s) && substr(trim($s), 3, 1) === ' ') break; }

  $send('STARTTLS');
  $r = $line();
  if (strpos($r, '220') === false) {
    fclose($smtp);
    return 'smtp_tls';
  }
  $crypto = @stream_socket_enable_crypto($smtp, true, STREAM_CRYPTO_METHOD_TLS_CLIENT);
  if (!$crypto) {
    fclose($smtp);
    return 'smtp_tls';
  }
  $send('EHLO ' . ($_SERVER['SERVER_NAME'] ?? 'localhost'));
  while ($s = $line()) { if (preg_match('/^\d{3}\s/', $s) && substr(trim($s), 3, 1) === ' ') break; }

  $send('AUTH LOGIN');
  $line();
  $send(base64_encode($user));
  $line();
  $send(base64_encode($pass));
  $r = $line();
  if (strpos($r, '235') === false) {
    error_log('NC relay SMTP auth failed: ' . trim($r));
    fclose($smtp);
    return 'smtp_auth';
  }

  preg_match('/<([^>]+)>/', $from, $m);
  $fromAddr = $m ? $m[1] : $user;
  $send('MAIL FROM:<' . $fromAddr . '>');
  $r = $line();
  if (strpos($r, '250') === false) { fclose($smtp); return 'smtp_send'; }
  $send('RCPT TO:<' . $to . '>');
  $r = $line();
  if (strpos($r, '250') === false) { fclose($smtp); return 'smtp_send'; }
  $send('DATA');
  $line();
  $boundary = 'nc_' . bin2hex(random_bytes(8));
  $msgId = '<nc-' . bin2hex(random_bytes(8)) . '@claudeservices.com>';
  $headers = "From: {$from}\r\n";
  $headers .= "To: {$to}\r\n";
  $headers .= "Reply-To: nc@claudeservices.com\r\n";
  $headers .= "Subject: {$subject}\r\n";
  $headers .= "Date: " . date('r') . "\r\n";
  $headers .= "Message-ID: {$msgId}\r\n";
  $headers .= "X-Priority: 3\r\n";
  $headers .= "Precedence: auto\r\n";
  $headers .= "MIME-Version: 1.0\r\n";
  $headers .= "Content-Type: multipart/alternative; boundary=\"{$boundary}\"\r\n";
  $payload = $headers . "\r\n\r\n--{$boundary}\r\nContent-Type: text/plain; charset=UTF-8\r\n\r\n{$bodyText}\r\n--{$boundary}\r\nContent-Type: text/html; charset=UTF-8\r\n\r\n{$bodyHtml}\r\n--{$boundary}--\r\n";
  $payload = str_replace("\r\n.", "\r\n..", $payload);
  fwrite($smtp, $payload . "\r\n.\r\n");
  $r = $line();
  $send('QUIT');
  fclose($smtp);
  if (strpos($r, '250') === false) {
    return 'smtp_send';
  }
  return true;
}
