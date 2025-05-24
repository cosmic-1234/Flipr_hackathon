import Cookies from 'js-cookie';

export const setAuthCookie = (token: string) => {
  // Set cookie with token that expires in 7 days
  Cookies.set('token', token, { expires: 7 });
};

export const removeAuthCookie = () => {
  Cookies.remove('token');
};