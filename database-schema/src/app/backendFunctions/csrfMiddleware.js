import csurf from 'csurf';
import cookieParser from 'cookie-parser';

// Konfiguracja tokenu CSRF w ciasteczkach
export const csrfMiddleware = (req, res, next) => {
  cookieParser()(req, res, () => {
    csurf({ cookie: true })(req, res, next);
  });
};