import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const role = localStorage.getItem('user_role');
    if (token) {
      if (role === 'student') {
        // Students don't have a standard django backend user profile model, but we can store their info in localstorage or parse token
        const savedStudent = localStorage.getItem('student_profile');
        if (savedStudent) {
          setUser(JSON.parse(savedStudent));
          setLoading(false);
        } else {
          // If profile lost but token exists, logout to be safe
          logout();
        }
      } else {
        fetchUser();
      }
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await api.get('/auth/profile/');
      setUser(response.data);
      localStorage.setItem('user_role', response.data.role);
    } catch (error) {
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (emailOrMatric, passwordOrPin, role) => {
    if (role === 'student') {
      const response = await api.post('/auth/student/login/', {
        matric_no: emailOrMatric,
        pin: passwordOrPin,
      });
      const { access, refresh, student } = response.data;
      
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user_role', 'student');
      
      const studentUser = {
        ...student,
        role: 'student',
        name: student.full_name,
      };
      
      localStorage.setItem('student_profile', JSON.stringify(studentUser));
      setUser(studentUser);
      setLoading(false);
      return studentUser;
    } else {
      const response = await api.post('/auth/login/', {
        email: emailOrMatric,
        password: passwordOrPin,
        role,
      });
      const { access, refresh, user: userData } = response.data;
      
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user_role', userData.role);
      
      setUser(userData);
      setLoading(false);
      return userData;
    }
  };

  const logout = async () => {
    const role = localStorage.getItem('user_role');
    try {
      if (role !== 'student') {
        const refresh = localStorage.getItem('refresh_token');
        if (refresh) {
          await api.post('/auth/logout/', { refresh });
        }
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_role');
      localStorage.removeItem('student_profile');
      setUser(null);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
