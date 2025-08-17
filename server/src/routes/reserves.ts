import { Router } from 'express';
import { Reserve } from '../models/Reserve';
import { verifyFirebaseToken, AuthenticatedRequest } from '../middlewares/auth';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// All routes require Firebase auth
router.use(verifyFirebaseToken);

// POST /reserves → crea una reserva
router.post('/', async (req: AuthenticatedRequest, res) => {
  try {
    const uid = req.user!.uid;
    const { clientName, email, data, hora, notes, serviceId, status, id } = req.body;

    const payload = {
      uid,
      id: id || uuidv4(),
      clientName,
      email,
      data,
      hora,
      notes,
      serviceId,
      status: status ?? 'confirmed'
    };

    const created = await Reserve.create(payload);

    return res.status(201).json(created);
  } catch (err: any) {
    if (err?.code === 11000) return res.status(409).json({ message: 'Duplicate reservation id' });
    return res.status(400).json({ message: err.message || 'Cannot create reserve' });
  }
});

// GET /reserves → retorna totes les reserves d’un usuari
router.get('/', async (req: AuthenticatedRequest, res) => {
  try {
    const uid = req.user!.uid;
    const items = await Reserve.find({ uid }).sort({ createdAt: -1 });
    return res.json(items);
  } catch (err: any) {
    return res.status(500).json({ message: 'Cannot fetch reserves' });
  }
});

// PUT /reserves/:id → edita una reserva
router.put('/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const uid = req.user!.uid;
    const { id } = req.params;
    const update = req.body || {};

    const updated = await Reserve.findOneAndUpdate({ id, uid }, update, { new: true });
    if (!updated) return res.status(404).json({ message: 'Reserve not found' });
    return res.json(updated);
  } catch (err: any) {
    return res.status(400).json({ message: err.message || 'Cannot update reserve' });
  }
});

// DELETE /reserves/:id → elimina una reserva
router.delete('/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const uid = req.user!.uid;
    const { id } = req.params;
    const deleted = await Reserve.findOneAndDelete({ id, uid });
    if (!deleted) return res.status(404).json({ message: 'Reserve not found' });
    return res.json({ ok: true });
  } catch (err: any) {
    return res.status(400).json({ message: err.message || 'Cannot delete reserve' });
  }
});

export default router;


