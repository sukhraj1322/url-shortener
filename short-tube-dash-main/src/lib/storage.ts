// LocalStorage utilities for ShortTube

export interface User {
  id: string;
  email: string;
  password: string;
  twoFA: boolean;
  createdAt: string;
}

export interface URLData {
  originalUrl: string;
  createdAt: string;
  clicks: number;
  ownerId: string;
  history: ClickEvent[];
  qrCount: number;
}

export interface ClickEvent {
  timestamp: string;
  device: string;
  browser: string;
  location: string;
}

export interface URLs {
  [shortId: string]: URLData;
}

// User management
export const getUsers = (): User[] => {
  const users = localStorage.getItem('users');
  return users ? JSON.parse(users) : [];
};

export const saveUsers = (users: User[]): void => {
  localStorage.setItem('users', JSON.stringify(users));
};

export const getCurrentUser = (): User | null => {
  const user = localStorage.getItem('currentUser');
  return user ? JSON.parse(user) : null;
};

export const setCurrentUser = (user: User | null): void => {
  if (user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
  } else {
    localStorage.removeItem('currentUser');
  }
};

export const registerUser = (email: string, password: string): User => {
  const users = getUsers();
  const newUser: User = {
    id: `user_${Date.now()}`,
    email,
    password,
    twoFA: true,
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  saveUsers(users);
  return newUser;
};

export const loginUser = (email: string, password: string): User | null => {
  const users = getUsers();
  return users.find(u => u.email === email && u.password === password) || null;
};

export const logoutUser = (): void => {
  setCurrentUser(null);
};

// URL management
export const getURLs = (): URLs => {
  const urls = localStorage.getItem('urls');
  return urls ? JSON.parse(urls) : {};
};

export const saveURLs = (urls: URLs): void => {
  localStorage.setItem('urls', JSON.stringify(urls));
};

export const addURL = (shortId: string, originalUrl: string, ownerId: string): void => {
  const urls = getURLs();
  urls[shortId] = {
    originalUrl,
    createdAt: new Date().toISOString(),
    clicks: 0,
    ownerId,
    history: [],
    qrCount: 0,
  };
  saveURLs(urls);
};

export const getURL = (shortId: string): URLData | null => {
  const urls = getURLs();
  return urls[shortId] || null;
};

export const deleteURL = (shortId: string): void => {
  const urls = getURLs();
  delete urls[shortId];
  saveURLs(urls);
};

export const getUserURLs = (userId: string): { [shortId: string]: URLData } => {
  const urls = getURLs();
  const userUrls: { [shortId: string]: URLData } = {};

  Object.entries(urls).forEach(([shortId, data]) => {
    if (data.ownerId === userId) {
      userUrls[shortId] = data;
    }
  });

  return userUrls;
};

export const incrementQRCount = (shortId: string): void => {
  const urls = getURLs();
  if (urls[shortId]) {
    urls[shortId].qrCount += 1;
    saveURLs(urls);
  }
};
