const PASSWORD_LENGTH = 12
const PASSWORD_CHARS = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()-_.'

export const passwordRegExp = new RegExp(`[${PASSWORD_CHARS}]+`, 'g')

export function generatePassword(): string {
  let password = ''
  
  const array = new Uint32Array(PASSWORD_CHARS.length)
  window.crypto.getRandomValues(array)

  for (let i = 0; i < PASSWORD_LENGTH; i++) {
    password += PASSWORD_CHARS[array[i] % PASSWORD_CHARS.length]
  }

  return password
}
