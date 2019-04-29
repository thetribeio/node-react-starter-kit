import { Router } from 'express';
import route from '@api/utils/route';
import { Book } from '@api/models';

const router = new Router();

router.get('/', (req, res) => {
    res.json({ isWorking: false });
});

router.get('/books', route(async (req, res) => {
    const books = await Book.findAll();

    return res.json(books.map((book) => book.toJSON()));
}));

export default router;
