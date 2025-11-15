export const getToken = () => localStorage.getItem('token');
export const getUsername = () => localStorage.getItem('username');

export const setAuth = (token, username) => {
  localStorage.setItem('token', token);
  localStorage.setItem('username', username);
};

export const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
};

export const isAuthenticated = () => {
  return !!getToken() && !!getUsername();
};