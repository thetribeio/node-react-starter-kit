import { Book } from '@api/models';
import Router from '@api/utils/Router';

const router = new Router();

router.get('/', (req, res) => {
    res.json({ isWorking: false });
});

router.get('/books', async (req, res) => {
    const books = await Book.findAll();

    return res.json(books.map((book) => book.toJSON()));
});

router.post('/click', (req, res) => {
    res.sendStatus(200);
});

export default router;
