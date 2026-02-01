/**
 * NC - Criptografia ponta a ponta (E2E)
 * As mensagens são criptografadas no dispositivo do remetente e
 * descriptografadas apenas no dispositivo do destinatário.
 *
 * Esta implementação usa AES-GCM com chave derivada. Em produção,
 * use a chave pública do destinatário (obtida do servidor) para
 * criptografar; apenas o destinatário com a chave privada pode descriptografar.
 */

const NC_E2E = (function () {
  const ALGO = 'AES-GCM';
  const KEY_LEN = 256;
  const IV_LEN = 12;
  const SALT_LEN = 16;

  async function getKeyMaterial(password) {
    const enc = new TextEncoder();
    return crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits', 'deriveKey']);
  }

  async function deriveKey(keyMaterial, salt) {
    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: ALGO, length: KEY_LEN },
      false,
      ['encrypt', 'decrypt']
    );
  }

  async function encrypt(plaintext, sharedSecret) {
    const keyMaterial = await getKeyMaterial(sharedSecret);
    const salt = crypto.getRandomValues(new Uint8Array(SALT_LEN));
    const key = await deriveKey(keyMaterial, salt);
    const iv = crypto.getRandomValues(new Uint8Array(IV_LEN));
    const enc = new TextEncoder();
    const ct = await crypto.subtle.encrypt(
      { name: ALGO, iv, tagLength: 128 },
      key,
      enc.encode(plaintext)
    );
    const combined = new Uint8Array(salt.length + iv.length + ct.byteLength);
    combined.set(salt, 0);
    combined.set(iv, salt.length);
    combined.set(new Uint8Array(ct), salt.length + iv.length);
    return btoa(String.fromCharCode.apply(null, combined));
  }

  async function decrypt(ciphertextBase64, sharedSecret) {
    const combined = Uint8Array.from(atob(ciphertextBase64), (c) => c.charCodeAt(0));
    const salt = combined.slice(0, SALT_LEN);
    const iv = combined.slice(SALT_LEN, SALT_LEN + IV_LEN);
    const ct = combined.slice(SALT_LEN + IV_LEN);
    const keyMaterial = await getKeyMaterial(sharedSecret);
    const key = await deriveKey(keyMaterial, salt);
    const dec = await crypto.subtle.decrypt(
      { name: ALGO, iv, tagLength: 128 },
      key,
      ct
    );
    return new TextDecoder().decode(dec);
  }

  /**
   * Gera um segredo compartilhado para a conversa (em produção, use acordo de chave com o destinatário).
   */
  function getSharedSecret(myUserId, otherUserId) {
    const ordered = [myUserId, otherUserId].sort();
    return 'nc-e2e-' + ordered[0] + '-' + ordered[1];
  }

  return {
    encrypt,
    decrypt,
    getSharedSecret,
  };
})();
