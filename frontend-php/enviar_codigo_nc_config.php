<?php
/**
 * Config do relay NC - mesmo SMTP do recuperar senha.
 * Este ficheiro é carregado por enviar_codigo_nc.php.
 *
 * Se o email NÃO chegar: descomente as linhas abaixo e coloque a MESMA senha
 * do email nc@claudeservices.com que usa no recuperar senha (OUTLOOK_PASSWORD).
 * O script tenta carregar email_config_outlook.php automaticamente; se não
 * encontrar ou a senha estiver errada, use as constantes aqui.
 */

// Segredo: tem de ser igual a NC_EMAIL_RELAY_SECRET no Railway
define('RELAY_SECRET', 'g0ClauFSyxOhOrEQefnhEuHc44rbYNQJ');

// Se o código não chegar ao email, descomente e preencha (mesmos valores do recuperar senha):
// define('OUTLOOK_HOST', 'smtp.hostinger.com');
// define('OUTLOOK_PORT', 587);
// define('OUTLOOK_USERNAME', 'nc@claudeservices.com');
define('OUTLOOK_PASSWORD', 'Claude180@%');  // senha nc@claudeservices.com
// define('OUTLOOK_FROM', 'Claude Services <nc@claudeservices.com>');
