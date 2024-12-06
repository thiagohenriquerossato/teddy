import { Request, Response, NextFunction } from 'express';

type ValidationRule = {
  field: string;
  validate: (value: any) => boolean;
  message: string;
};

export const validate = (rules: ValidationRule[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: { field: string; message: string }[] = [];

    rules.forEach((rule) => {
      const value = req.body[rule.field] || req.query[rule.field] || req.params[rule.field];
      if (!rule.validate(value)) {
        errors.push({ field: rule.field, message: rule.message });
      }
    });

    if (errors.length > 0) {
      return res.status(400).json({
        error: 'Erro de validação',
        details: errors,
      });
    }

    next();
  };
};

export const validations = {
  isEmail: (value: any): boolean => {
    if (typeof value !== 'string') return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  },

  minLength:
    (length: number) =>
    (value: any): boolean => {
      if (typeof value !== 'string') return false;
      return value.length >= length;
    },

  isUrl: (value: any): boolean => {
    if (typeof value !== 'string') return false;
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  },

  isNumeric: (value: any): boolean => {
    if (typeof value !== 'string') return false;
    return /^\d+$/.test(value);
  },

  exactLength:
    (length: number) =>
    (value: any): boolean => {
      if (typeof value !== 'string') return false;
      return value.length === length;
    },
};
