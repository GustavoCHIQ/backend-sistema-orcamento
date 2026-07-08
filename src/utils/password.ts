import bcrypt from 'bcryptjs';

const DEFAULT_SALT_ROUNDS = 12;

function getSaltRounds(): number {
  const configured = Number(process.env.BCRYPT_SALT);
  return Number.isInteger(configured) && configured > 0 ? configured : DEFAULT_SALT_ROUNDS;
}

export async function hashPassword(plainPassword: string): Promise<string> {
  return bcrypt.hash(plainPassword, getSaltRounds());
}

export async function comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}
