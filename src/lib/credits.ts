import fs from "fs";
import path from "path";

export interface Transaction {
  id: string;
  type: "charge" | "use" | "refund";
  amount: number;
  description: string;
  service: string;
  createdAt: string;
  balanceAfter: number;
}

export interface UserCredits {
  userId: string;
  balance: number;
  transactions: Transaction[];
}

interface CreditsStore {
  users: UserCredits[];
}

const DATA_DIR = path.join(process.cwd(), "data");
const CREDITS_FILE = path.join(DATA_DIR, "credits.json");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readStore(): CreditsStore {
  ensureDataDir();
  if (!fs.existsSync(CREDITS_FILE)) {
    const initial: CreditsStore = { users: [] };
    fs.writeFileSync(CREDITS_FILE, JSON.stringify(initial, null, 2), "utf-8");
    return initial;
  }
  const raw = fs.readFileSync(CREDITS_FILE, "utf-8");
  return JSON.parse(raw) as CreditsStore;
}

function writeStore(store: CreditsStore) {
  ensureDataDir();
  fs.writeFileSync(CREDITS_FILE, JSON.stringify(store, null, 2), "utf-8");
}

function getOrCreateUser(store: CreditsStore, userId: string): UserCredits {
  let user = store.users.find((u) => u.userId === userId);
  if (!user) {
    user = { userId, balance: 0, transactions: [] };
    store.users.push(user);
  }
  return user;
}

export function getBalance(userId: string): number {
  const store = readStore();
  const user = store.users.find((u) => u.userId === userId);
  return user?.balance ?? 0;
}

export function canAfford(userId: string, amount: number): boolean {
  return getBalance(userId) >= amount;
}

export function chargeCredits(
  userId: string,
  amount: number,
  description: string
): void {
  const store = readStore();
  const user = getOrCreateUser(store, userId);
  user.balance += amount;

  const tx: Transaction = {
    id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    type: "charge",
    amount,
    description,
    service: "charge",
    createdAt: new Date().toISOString(),
    balanceAfter: user.balance,
  };
  user.transactions.unshift(tx);
  writeStore(store);
}

export function useCredits(
  userId: string,
  amount: number,
  service: string,
  description: string
): boolean {
  const store = readStore();
  const user = getOrCreateUser(store, userId);

  if (user.balance < amount) {
    return false;
  }

  user.balance -= amount;

  const tx: Transaction = {
    id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    type: "use",
    amount,
    description,
    service,
    createdAt: new Date().toISOString(),
    balanceAfter: user.balance,
  };
  user.transactions.unshift(tx);
  writeStore(store);
  return true;
}

export function refundCredits(
  userId: string,
  amount: number,
  service: string,
  description: string
): void {
  const store = readStore();
  const user = getOrCreateUser(store, userId);
  user.balance += amount;

  const tx: Transaction = {
    id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    type: "refund",
    amount,
    description,
    service,
    createdAt: new Date().toISOString(),
    balanceAfter: user.balance,
  };
  user.transactions.unshift(tx);
  writeStore(store);
}

export function getTransactions(userId: string): Transaction[] {
  const store = readStore();
  const user = store.users.find((u) => u.userId === userId);
  return user?.transactions ?? [];
}
