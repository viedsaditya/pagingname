import Cookies from "js-cookie";

// Session timeout in milliseconds (6 hours = 6 * 60 * 60 * 1000)
const SESSION_TIMEOUT = 6 * 60 * 60 * 1000; // 6 hours

export const checkSessionTimeout = (): boolean => {
  // Only run on client side to avoid hydration mismatch
  if (typeof window === 'undefined') {
    return false;
  }
  
  const loginTime = Cookies.get("login_time");
  const isLoggedIn = Cookies.get("logged_in");
  
  if (!loginTime || !isLoggedIn) {
    return false; // Not logged in
  }
  
  const currentTime = new Date().getTime();
  const loginTimestamp = parseInt(loginTime);
  
  // Check if 6 hours have passed
  if (currentTime - loginTimestamp > SESSION_TIMEOUT) {
    // Session expired, remove cookies
    Cookies.remove("logged_in");
    Cookies.remove("login_time");
    return false;
  }
  
  return true; // Session still valid
};

export const logout = () => {
  // Only run on client side
  if (typeof window !== 'undefined') {
    Cookies.remove("logged_in");
    Cookies.remove("login_time");
  }
};

export const isAuthenticated = (): boolean => {
  return checkSessionTimeout();
};

// Function to setup periodic session check
export const setupSessionCheck = (router: { replace: (path: string) => void }) => {
  // Only run on client side
  if (typeof window === 'undefined') {
    return null;
  }
  
  // Check every 5 minutes
  const interval = setInterval(() => {
    if (!checkSessionTimeout()) {
      clearInterval(interval);
      // Session expired, redirect to login
      router.replace('/login');
    }
  }, 5 * 60 * 1000); // 5 minutes
  
  return interval;
};
