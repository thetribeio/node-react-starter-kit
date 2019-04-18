import { Router } from 'express';
import route from 'utils/route';
import { Book } from 'models';

const router = new Router();

router.get('/', (req, res) => {
    res.json({ isWorking: false });
});

router.get('/books', route(async (req, res) => {
    const books = await Book.findAll();

    return res.json(books.map((book) => book.toJSON()));
}));

export default router;
