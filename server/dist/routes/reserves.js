"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Reserve_1 = require("../models/Reserve");
const auth_1 = require("../middlewares/auth");
const uuid_1 = require("uuid");
const router = (0, express_1.Router)();
// All routes require Firebase auth
router.use(auth_1.verifyFirebaseToken);
// POST /reserves → crea una reserva
router.post('/', async (req, res) => {
    try {
        const uid = req.user.uid;
        const { clientName, email, data, hora, notes, serviceId, status, id } = req.body;
        const payload = {
            uid,
            id: id || (0, uuid_1.v4)(),
            clientName,
            email,
            data,
            hora,
            notes,
            serviceId,
            status: status ?? 'confirmed'
        };
        const created = await Reserve_1.Reserve.create(payload);
        return res.status(201).json(created);
    }
    catch (err) {
        if (err?.code === 11000)
            return res.status(409).json({ message: 'Duplicate reservation id' });
        return res.status(400).json({ message: err.message || 'Cannot create reserve' });
    }
});
// GET /reserves → retorna totes les reserves d’un usuari
router.get('/', async (req, res) => {
    try {
        const uid = req.user.uid;
        const items = await Reserve_1.Reserve.find({ uid }).sort({ createdAt: -1 });
        return res.json(items);
    }
    catch (err) {
        return res.status(500).json({ message: 'Cannot fetch reserves' });
    }
});
// PUT /reserves/:id → edita una reserva
router.put('/:id', async (req, res) => {
    try {
        const uid = req.user.uid;
        const { id } = req.params;
        const update = req.body || {};
        const updated = await Reserve_1.Reserve.findOneAndUpdate({ id, uid }, update, { new: true });
        if (!updated)
            return res.status(404).json({ message: 'Reserve not found' });
        return res.json(updated);
    }
    catch (err) {
        return res.status(400).json({ message: err.message || 'Cannot update reserve' });
    }
});
// DELETE /reserves/:id → elimina una reserva
router.delete('/:id', async (req, res) => {
    try {
        const uid = req.user.uid;
        const { id } = req.params;
        const deleted = await Reserve_1.Reserve.findOneAndDelete({ id, uid });
        if (!deleted)
            return res.status(404).json({ message: 'Reserve not found' });
        return res.json({ ok: true });
    }
    catch (err) {
        return res.status(400).json({ message: err.message || 'Cannot delete reserve' });
    }
});
exports.default = router;
