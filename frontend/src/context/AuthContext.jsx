// import React, { createContext, useContext, useState, useEffect } from 'react';

// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
  
//   const [user, setUser] = useState(null);
//   const [token, setToken] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const savedUser = localStorage.getItem('dms_user');
//     const savedToken = localStorage.getItem('dms_token');
//     if (savedUser && savedToken) {
//       setUser(JSON.parse(savedUser));
//       setToken(savedToken);
//     }
//     setLoading(false);
//   }, []);

//   const login = (userData, tokenValue) => {
//     setUser(userData);
//     setToken(tokenValue);
//     localStorage.setItem('dms_user', JSON.stringify(userData));
//     localStorage.setItem('dms_token', tokenValue);
//   };

//   const logout = () => {
//     setUser(null);
//     setToken(null);
//     localStorage.removeItem('dms_user');
//     localStorage.removeItem('dms_token');
//   };

//   // Route based on role
//   const getDashboardPath = (role) => {
//     const map = {
//       SUPER_ADMIN: '/superadmin/dashboard',
//       ADMIN: '/admin/dashboard',
//       MANAGER: '/manager/dashboard',
//       INTERN: '/intern/dashboard',
//       VIEWER: '/viewer/dashboard',
//     };
//     return map[role] || '/';
//   };

//   return (
//     <AuthContext.Provider value={{ user, token, login, logout, loading, getDashboardPath }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => useContext(AuthContext);


import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('dms_user');
    const savedToken = localStorage.getItem('dms_token');
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
    }
    setLoading(false);
  }, []);

  const refreshUser = async () => {
    try {
      const t = localStorage.getItem('dms_token');
      if (!t) return;
      const res = await fetch('http://localhost:5000/api/profile', {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (!res.ok) return;
      const fresh = await res.json();
      setUser(fresh);
      localStorage.setItem('dms_user', JSON.stringify(fresh));
    } catch {}
  };

  const login = (userData, tokenValue) => {
    setUser(userData);
    setToken(tokenValue);
    localStorage.setItem('dms_user', JSON.stringify(userData));
    localStorage.setItem('dms_token', tokenValue);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('dms_user');
    localStorage.removeItem('dms_token');
  };

  const getDashboardPath = (role) => {
    const map = {
      SUPER_ADMIN: '/superadmin/dashboard',
      ADMIN: '/admin/dashboard',
      MANAGER: '/manager/dashboard',
      INTERN: '/intern/dashboard',
      VIEWER: '/viewer/dashboard',
    };
    return map[role] || '/';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        loading,
        getDashboardPath,
        refreshUser,          // ← ADD THIS
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);