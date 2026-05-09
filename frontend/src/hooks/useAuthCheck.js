import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const useAuthCheck = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const response = await fetch('http://localhost:3000/auth/status', {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();

          if (!data.isAuthenticated) {
            navigate('/');
            return;
          }

          const isAdminRoute = location.pathname.startsWith('/admin');
          const isUserRoute = ['/home', '/game', '/cart', '/orders'].some((route) =>
            location.pathname.startsWith(route)
          );

          if (data.user.role === 'admin' && isUserRoute) {
            navigate('/admin');
            return;
          }

          if (data.user.role !== 'admin' && isAdminRoute) {
            navigate('/home');
            return;
          }

          localStorage.setItem('user', JSON.stringify(data.user));
        } else {
          localStorage.removeItem('user');
          navigate('/');
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (!storedUser || !storedUser.id) {
          navigate('/');
        }
      }
    };

    checkAuthentication();
  }, [navigate, location.pathname]);
};

export default useAuthCheck;
