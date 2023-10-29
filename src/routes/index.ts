import express, { NextFunction, Request, Response } from 'express';
import { Request as JwtRequest, expressjwt } from 'express-jwt';
import { QueryFailedError } from 'typeorm';
import { ZodError } from 'zod';
import { JWT_SECRET } from '../config';
import { HttpException } from '../libs/HttpException';
import { privateRoute } from '../middlewares/private-route';
import authRoutes from './auth';
import tagsRoutes from './tags';
import usersRoutes from './users';

const router = express.Router();

router.use(
  expressjwt({
    secret: JWT_SECRET,
    algorithms: ['HS256'],
    credentialsRequired: false,
  }),
  async function (req: JwtRequest, res, next) {
    // FIX doublons auth/token in request
    const token = req.auth;
    if (!token) return next();
    const userId = token.sub;
    req.token = token as any;
    if (!userId) {
      return next();
    }
    return next();
  },
);

router.use('/auth', authRoutes);
router.use('/users', privateRoute, usersRoutes);
router.use('/tags', privateRoute, tagsRoutes);

router.use(function (err: unknown, req: Request, res: Response, next: NextFunction) {
  if (err instanceof HttpException) {
    return res
      .status(err.code)
      .json({
        error: err,
      })
      .end();
  }
  if (err instanceof ZodError) {
    return res
      .status(400)
      .json({
        error: {
          code: 400,
          message: 'Bad Request',
          details: err.issues,
        },
      })
      .end();
  }
  if (err instanceof QueryFailedError) {
    return res
      .status(500)
      .json({
        error: {
          code: 500,
          message: 'Internal error',
          details: err,
        },
      })
      .end();
  }
  return res
    .status(500)
    .json({
      error: {
        code: 500,
        message: 'Internal Error',
        details: err,
      },
    })
    .end();
});

export default router;
