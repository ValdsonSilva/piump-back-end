import { Router, type Request, type Response, type NextFunction } from 'express';
import { groupScheduledByZip } from '../repositories/bookinRepo.js';
import z, { date } from 'zod';
import { changePassword, createUser, findByUserEmail, listUsers, updateUser } from '../repositories/userRepo.js';
import { requireAuth, requireUserType, signToken } from '../middleware/auth.js';
import bcrypt from 'bcryptjs';

export const usersRouter = Router();

export enum UserType {
  ADMIN = "ADMIN",
  CLIENT = "CLIENT",
}

const UserTypeSchema = z.nativeEnum(UserType);

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string(),
  password: z.string().min(6),
  phone: z.string(),
  address: z.string(),
  zip: z.string(),
})

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });
const meUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  zip: z.string().optional(),
  userType: z.string().transform(s => s.toUpperCase()).pipe(UserTypeSchema),
});

// Registro de usuário (USER)
usersRouter.post('/register', async (req: Request, res: Response) => {
  try {
    const data = registerSchema.parse(req.body);

    const exists = await findByUserEmail(data.email);

    if (exists) return res.status(409).json({ error: 'Email already in use' });

    const user = await createUser(data);

    const token = signToken({ sub: user.id, type: user.userType });

    res.status(201).json({ user: { id: user.id, name: user.name, email: user.email, type: user.userType }, token });

  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// Login
usersRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await findByUserEmail(email);

    console.log('Usuário logado:', user)

    if (!user || !user.password) return res.status(401).json({ error: 'Invalid credentials 1' });

    const ok = await bcrypt.compare(password, user.password);

    if (!ok) return res.status(401).json({ error: 'Invalid credentials 2' });

    const token = signToken({ sub: user.id, type: user.userType });

    res.json({ token, user: { id: user.id, name: user.name, email: user.email, userType: user.userType } });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// the logged user's avatar
usersRouter.get('/me', requireAuth, async (req: Request, res: Response) => {
  const auth = (req as any).auth;
  res.json({ userId: auth.sub, email: auth.email, userType: auth.type });
});

// update the logged user's avatar
usersRouter.put('/me', requireAuth, async (req: Request, res: Response) => {
  try {
    const body = meUpdateSchema.parse(req.body);
    const auth = (req as any).auth;
    const user = await updateUser(auth.sub, body);
    res.json({ id: user.id, name: user.name, email: user.email, userType: user.userType, phone: user.phone, address: user.address, zip: user.zip });
  } catch (e: any) { res.status(400).json({ error: e.message }); }
});

// update users logged password
usersRouter.put('/me/password', requireAuth, async (req: Request, res: Response) => {

  const schema = z.object({ oldPassword: z.string(), newPassword: z.string().min(6) });

  try {
    const { oldPassword, newPassword } = schema.parse(req.body);

    const auth = (req as any).auth;

    const user = await findByUserEmail(auth.email);

    if (!user || !user.password) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(oldPassword, user.password);

    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    await changePassword(auth.sub, newPassword);

    res.json({ ok: true });

  } catch (e: any) { res.status(400).json({ error: e.message }); }
});

// Admin: user's list
usersRouter.get('/', async (req: Request, res: Response) => {
  const page = Number(req.query.page ?? 1);
  const size = Number(req.query.size ?? 20);
  const skip = (page - 1) * size;
  const data = await listUsers(skip, size);
  res.json({ page, size, data });
});

usersRouter.get('/route', requireAuth, requireUserType('ADMIN'), async (req: Request, res: Response) => {
  const date = String(req.query.date ?? '').trim();
  if (!date) return res.status(400).json({ error: 'date=YYYY-MM-DD required' });
  const groups = await groupScheduledByZip(date);
  res.json({ date, groups });
});



