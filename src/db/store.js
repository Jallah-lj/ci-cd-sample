/**
 * In-memory Database Store for Users and Refresh Tokens.
 * Designed for fast, isolated testing and demo deployments.
 */
class MemoryStore {
  constructor() {
    this.users = new Map(); // id -> user object
    this.usersByEmail = new Map(); // email -> user object
    this.refreshTokens = new Set(); // set of active refresh token strings
    this.idCounter = 1;
  }

  createUser(userData) {
    const user = {
      id: String(this.idCounter++),
      name: userData.name,
      email: userData.email.toLowerCase(),
      passwordHash: userData.passwordHash,
      role: userData.role || 'user',
      createdAt: new Date().toISOString(),
    };

    this.users.set(user.id, user);
    this.usersByEmail.set(user.email, user);
    return user;
  }

  findUserByEmail(email) {
    return this.usersByEmail.get(email.toLowerCase()) || null;
  }

  findUserById(id) {
    return this.users.get(id) || null;
  }

  saveRefreshToken(token) {
    this.refreshTokens.add(token);
  }

  hasRefreshToken(token) {
    return this.refreshTokens.has(token);
  }

  removeRefreshToken(token) {
    return this.refreshTokens.delete(token);
  }

  clear() {
    this.users.clear();
    this.usersByEmail.clear();
    this.refreshTokens.clear();
    this.idCounter = 1;
  }
}

const store = new MemoryStore();

module.exports = store;
