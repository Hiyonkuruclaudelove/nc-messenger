<?php
/**
 * NC Messenger - Página de download (pronta para Hostinger).
 * APK na MESMA pasta que este PHP. Aceita nc-messenger.apk ou nc-messenger.apk.apk
 */
$dir = __DIR__ . DIRECTORY_SEPARATOR;
if (is_file($dir . 'nc-messenger.apk')) {
  $apk_url = 'nc-messenger.apk';
} elseif (is_file($dir . 'nc-messenger.apk.apk')) {
  $apk_url = 'nc-messenger.apk.apk';
} else {
  $apk_url = 'nc-messenger.apk';
}
$web_url = 'https://claudeservices.com/nc/';
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>NC Messenger - Download</title>
  <style>
    :root {
      --bg: #0a0e27;
      --surface: #1e2442;
      --border: #2d3558;
      --text: #fff;
      --text-muted: #a0aec0;
      --accent: #667eea;
      --accent-hover: #5a67d8;
      --radius: 12px;
      --font: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: var(--font); background: linear-gradient(135deg, #0a0e27 0%, #1e2442 50%, #151932 100%); min-height: 100vh; color: var(--text); }
    .wrap { max-width: 560px; margin: 0 auto; padding: 2rem 1.5rem; }
    header { text-align: center; padding-bottom: 1.5rem; }
    header h1 { margin: 0; font-size: 1.75rem; background: linear-gradient(135deg, #667eea, #764ba2); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    header p { margin: 0.25rem 0 0; color: var(--text-muted); font-size: 0.9rem; }
    .alert { background: rgba(72,187,120,0.15); border: 1px solid #48bb78; color: #9ae6b4; padding: 1rem 1.25rem; border-radius: var(--radius); margin-bottom: 1.5rem; }
    .block { background: linear-gradient(135deg, #1e2442 0%, #151932 100%); border: 1px solid var(--border); border-radius: 16px; padding: 1.75rem; margin-bottom: 1.5rem; }
    .block h2 { margin: 0 0 1.25rem; font-size: 1.25rem; }
    .info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
    .info-item { background: rgba(102,126,234,0.08); border: 1px solid var(--border); border-radius: var(--radius); padding: 1rem; text-align: center; }
    .info-item strong { display: block; }
    .info-item span { font-size: 0.8rem; color: var(--text-muted); }
    .btns { display: flex; flex-wrap: wrap; gap: 1rem; }
    .btn { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.875rem 1.5rem; border-radius: var(--radius); font-weight: 600; text-decoration: none; transition: background 0.2s; }
    .btn-web { background: #fff; color: #1e2442; border: 1px solid var(--border); }
    .btn-web:hover { background: #e2e8f0; }
    .btn-apk { background: var(--accent); color: #fff; border: 1px solid var(--accent); }
    .btn-apk:hover { background: var(--accent-hover); }
    .features { margin-top: 2rem; }
    .features h3 { margin-bottom: 1rem; font-size: 1.1rem; }
    .feature { display: flex; align-items: flex-start; gap: 0.75rem; margin-bottom: 1rem; }
    .feature strong { display: block; margin-bottom: 0.25rem; }
    .feature span { font-size: 0.9rem; color: var(--text-muted); }
    footer { text-align: center; padding: 2rem 1rem; color: var(--text-muted); font-size: 0.85rem; }
  </style>
</head>
<body>
  <div class="wrap">
    <header>
      <h1>NC Messenger</h1>
      <p>Download</p>
    </header>
    <div class="alert">
      <strong>APK disponível</strong><br />
      Baixe o aplicativo e instale no seu Android. Compatível com Android 5.0 ou superior.
    </div>
    <div class="block">
      <h2>Baixar Aplicativo</h2>
      <div class="info-grid">
        <div class="info-item"><strong>Android</strong><span>Compatível com Android 5.0+</span></div>
        <div class="info-item"><strong>~15 MB</strong><span>Tamanho do arquivo</span></div>
        <div class="info-item"><strong>v1.0.0</strong><span>Versão atual</span></div>
      </div>
      <div class="btns">
        <a href="<?php echo htmlspecialchars($web_url); ?>" class="btn btn-web">Usar na Web (Agora)</a>
        <a href="<?php echo htmlspecialchars($apk_url); ?>" class="btn btn-apk" download>Baixar APK</a>
      </div>
    </div>
    <section class="features">
      <h3>Recursos do Aplicativo</h3>
      <div class="feature">
        <strong>Criptografia E2E</strong>
        <span>Suas mensagens são criptografadas de ponta a ponta. Nem nós podemos lê-las.</span>
      </div>
      <div class="feature">
        <strong>Multimídia</strong>
        <span>Envie fotos, vídeos e arquivos com segurança total.</span>
      </div>
      <div class="feature">
        <strong>Tempo Real</strong>
        <span>Mensagens instantâneas usando WebSocket para comunicação rápida.</span>
      </div>
      <div class="feature">
        <strong>Notificações Push</strong>
        <span>Receba notificações instantâneas de novas mensagens.</span>
      </div>
    </section>
    <footer>
      <p>NC — XMPP · MMS · Push · Criptografia ponta a ponta</p>
    </footer>
  </div>
</body>
</html>
