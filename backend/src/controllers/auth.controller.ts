import { type Request, type Response } from 'express';
import { AuthService } from '../services/auth.services.js';
import { type AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { ValidationError } from '../middlewares/error-handler.middleware.js';
import { OAuth2Client } from 'google-auth-library';

// Cliente de Google configurado con tu Client ID real
const client = new OAuth2Client('459323739559-mr6p05eue5kpo6prkl2fjjgftnc2sl5k.apps.googleusercontent.com');

function getCookieMaxAge(): number {
  const expiresIn = process.env.JWT_EXPIRES_IN || '8h';
  const match = expiresIn.match(/^(\d+)([smhd])$/);

  //por si acaso el jwt de expire no esta configurado
  if (!match) return 1000 * 60 * 60 * 8;

  const value = parseInt(match[1]!);
  const unit = match[2]!;
  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60000,
    h: 3600000,
    d: 86400000,
  };

  return value * multipliers[unit]!;
}

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: getCookieMaxAge(),
};

/**
 * Valida los campos del registro aplicando reglas estrictas de formato:
 * - name: Solo letras y espacios (sin números ni símbolos).
 * - email: Sintaxis válida de correo electrónico.
 * - password: Exclusivamente dígitos, mínimo 4 caracteres.
 */
function validateRegisterBody(body: any): { name: string; email: string; password: string } {
  const { name, email, password } = body;
  const errors: string[] = [];

  // Validar nombre
  if (!name || typeof name !== 'string') {
    errors.push('El nombre es obligatorio.');
  } else {
    // Regex: Solo permite letras (incluyendo acentos y ñ) y espacios
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    if (!nameRegex.test(name.trim())) {
      errors.push('El nombre completo no debe contener números ni caracteres especiales.');
    }
  }

  // Validar email
  if (!email || typeof email !== 'string') {
    errors.push('El correo electrónico es obligatorio.');
  } else {
    // Regex estándar y segura para correos electrónicos
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      errors.push('El formato del correo electrónico no es válido.');
    }
  }

  // Validar password (mínimo 4 dígitos, solo números)
  if (!password || typeof password !== 'string') {
    errors.push('La contraseña es obligatoria.');
  } else {
    const passwordRegex = /^\d{4,}$/;
    if (!passwordRegex.test(password)) {
      errors.push('La contraseña debe contener únicamente dígitos y tener un mínimo de 4 caracteres.');
    }
  }

  if (errors.length > 0) {
    throw new ValidationError(errors.join(' | '));
  }

  return { name: name.trim(), email: name.trim() ? email.trim() : '', password };
}

function validateLoginBody(body: any): { email: string; password: string } {
  const { email, password } = body;
  const missing: string[] = [];

  if (!email || typeof email !== 'string') missing.push('email');
  if (!password || typeof password !== 'string') missing.push('password');

  if (missing.length > 0) {
    throw new ValidationError(`Campos obligatorios faltantes: ${missing.join(', ')}`);
  }

  return { email, password };
}

export class AuthController {
  static async register(req: Request, res: Response) {
    const { name, email, password } = validateRegisterBody(req.body);

    const newUser = await AuthService.registerUser({ name, email, password });

    return res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: { user: newUser },
    });
  }

  static async login(req: Request, res: Response) {
    const { email, password } = validateLoginBody(req.body);
    const { user, token } = await AuthService.loginUser(email, password);

    res.cookie('token', token, COOKIE_OPTIONS);

    return res.status(200).json({
      success: true,
      message: 'Inicio de sesion exitoso',
      data: { user },
    });
  }

  static async googleLogin(req: Request, res: Response) {
    try {
      const { idToken } = req.body;

      if (!idToken) {
        return res.status(400).json({ success: false, message: 'Token de Google requerido' });
      }

      // Verificar el token con los servidores de Google usando tu Client ID
      const ticket = await client.verifyIdToken({
        idToken: idToken,
        audience: '459323739559-mr6p05eue5kpo6prkl2fjjgftnc2sl5k.apps.googleusercontent.com',
      });

      const payload = ticket.getPayload();
      const email = payload?.email;
      const name = payload?.name;

      if (!email || !name) {
        return res.status(400).json({ success: false, message: 'No se pudo obtener información del usuario de Google' });
      }

      // Procesar el login o registro automático a través del servicio
      const { user, token } = await AuthService.googleLoginUser({ email, name });

      res.cookie('token', token, COOKIE_OPTIONS);

      return res.status(200).json({
        success: true,
        message: 'Inicio de sesión con Google exitoso',
        data: { user },
      });
    } catch (error) {
      console.error('Error en Google Auth:', error);
      return res.status(401).json({ success: false, message: 'Token de Google inválido o expirado' });
    }
  }

  static logout(req: Request, res: Response) {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
    });

    return res.status(200).json({
      success: true,
      message: 'Sesion cerrada',
    });
  }

  static me(req: AuthenticatedRequest, res: Response) {
    return res.status(200).json({
      success: true,
      data: { user: req.user },
    });
  }
}