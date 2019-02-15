import { Router } from 'express';

const router = new Router();

// Get projects list
router.get('/', (req, res) => {
    res.json({ isWorking: false });
});

export default router;
