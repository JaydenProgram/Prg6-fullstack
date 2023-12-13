import express from "express";
import "dotenv/config";
import mongoose from "mongoose";
import Item from '../seeder.js'
import faker from "faker";
import bodyParser from "body-parser";
import { check, validationResult } from "express-validator";
import createPagination from "../pagination.js";

const sizes = ['XS', 'S', 'M', 'L', 'XL']; // Available sizes

const app = express();
const router = express.Router();

app.use(bodyParser.urlencoded({ extended: false }));

router.options('/Clothing', (req, res) => {
    res.setHeader('Allow', 'POST, GET, OPTIONS'); // The methods the page can use
    res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type')
    res.status(200).send('Options you are using: POST, GET, OPTIONS');

});
router.options('/Clothing/:id', (req, res) => {
    res.setHeader('Allow', 'GET, PUT, DELETE, OPTIONS'); // The methods the page can use
    res.header('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type')
    res.status(200).send('Options you are using: GET, PUT, DELETE, OPTIONS');
});



router.get('/', (req, res) => {
    res.send('Hello world!')
})

router.post('/Clothing', [
    check('name').notEmpty().withMessage('Name is required'),
    check('type').notEmpty().withMessage('Type is required'),
    check('brand').notEmpty().withMessage('Brand is required'),
    check('color').notEmpty().withMessage('Color is required'),
    check('size').notEmpty().withMessage('Size is required'),
    check('material').notEmpty().withMessage('Material is required'),
    check('price').notEmpty().withMessage('Price is required'),
    check('description').notEmpty().withMessage('Description is required'),
], async (req, res) => {
    const acceptHeader = req.get('Accept');
    const typeHeader = req.get('Content-Type');

    if (acceptHeader && acceptHeader.includes('application/json') && (typeHeader.includes('application/json') || typeHeader.includes('application/x-www-form-urlencoded'))) {
        try {
            // check the headers for the right json types etc.
            const newItem = req.body;

            // My validation
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const createdItem = await Item.create(newItem);
            res.status(201).json(createdItem);
        } catch (error) {
            console.error('Error creating item:', error);
            res.status(500).send('Internal Server Error');
        }
    } else {
        res.status(406).json({ message: 'Not Acceptable: This endpoint only supports application/json or application/x-www-form-urlencoded' });
    }
});

router.get('/seeder', async (req, res) => {
    const acceptHeader = req.get('Accept');


    if (acceptHeader && acceptHeader.includes('application/json')) {
        try {
            // the seeder creates the items, and uses the seeder.js
            const savedItem = await Item.create({
                name: faker.commerce.productName(),
                type: 'Clothing',
                brand: faker.company.companyName(),
                color: faker.commerce.color(),
                size: sizes[Math.floor(Math.random() * sizes.length)],
                material: faker.commerce.productMaterial(),
                price: faker.commerce.price(),
                description: faker.lorem.sentences(),
            });

            res.status(200).json(savedItem);
        } catch (error) {
            console.error('Error seeding the database:', error);
            res.status(500).send("Database seeding problem");
        }

    } else {
        // 406 error when the type is not json
        res.status(406).json({message: 'Not Acceptable: This endpoint only supports application/json'});
    }
});

router.get('/Clothing', async (req, res) => {
    //my pagination uses the query's, otherwise it uses normal info
    const acceptHeader = req.get('Accept');
    const start =  isNaN(parseInt(req.query.start)) ? undefined : parseInt(req.query.start);
    let limit = isNaN(parseInt(req.query.limit)) ? undefined : parseInt(req.query.limit);

    if (acceptHeader && acceptHeader.includes('application/json')) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type');
        try {
            // same goes here when creating the total items etc.
            const total = await Item.countDocuments({});
            const pagination = createPagination(total, start, limit);

            // This is my limit function
            const items = await Item.find({}, '_id name type brand')
                .skip((start - 1) * limit)
                .limit(limit);


            // Creating the list
            const itemList = items.map(item => ({
                id: item._id,
                name: item.name,
                type: item.type,
                brand: item.brand,
                _links: {
                    self: {
                        href: `${req.protocol}://${req.get('host')}/Clothing/${item._id}`,
                    },
                    collection: {
                        href: `${req.protocol}://${req.get('host')}/Clothing`,
                    }
                }
            }));

            const linkInfo = {
                self: {
                    href: `${req.protocol}://${req.get('host')}/Clothing`
                }
            }


            // All pagination info gets shown here
            const paginationInfo = {
                currentPage: pagination.currentPage,
                currentItems: pagination.currentItems,
                totalPages: pagination.numberOfPages,
                totalItems: total,
                _links: {
                    first: {
                        page: total - total + 1,
                        href: `${req.protocol}://${req.get('host')}/Clothing${pagination.firstString}`,
                    },
                    last: {
                        page: pagination.numberOfPages,
                        href: `${req.protocol}://${req.get('host')}/Clothing${pagination.lastString}`,
                    },
                    previous: {
                        page: pagination.currentPage <= pagination.numberOfPages ? pagination.currentPage : pagination.currentPage - 1,
                        href: `${req.protocol}://${req.get('host')}/Clothing${pagination.previousString}`,
                    },
                    next: {
                        page: pagination.currentPage <= pagination.numberOfPages ? pagination.currentPage : pagination.currentPage + 1,
                        href: `${req.protocol}://${req.get('host')}/Clothing${pagination.nextString}`,
                    }
                }

                // nextPage: page < totalPages ? `${req.protocol}://${req.get('host')}/Clothing?page=${page + 1}` : null,
                // prevPage: page > 1 ? `${req.protocol}://${req.get('host')}/Clothing?page=${page - 1}` : null
            };

            res.json({ items: itemList, _links: linkInfo, pagination: paginationInfo });
        } catch (error) {
            // im also using internal server errors
            console.error('Error fetching clothing:', error);
            res.status(500).send('Internal Server Error');
        }
    } else {
        // again a 406 error for if there is no json
        res.status(406).json({ message: 'Not Acceptable: This endpoint only supports application/json' });
    }
});


router.get('/Clothing/:id', async (req, res) => {
    const acceptHeader = req.get('Accept');

    if (acceptHeader && acceptHeader.includes('application/json')) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type');
        const itemId = req.params.id;
        // Creating the links to show in the detail for self and collection
        const links = {
            self: {
                href: `${req.protocol}://${req.get('host')}/Clothing/${itemId}`,
            },
            collection: {
                href: `${req.protocol}://${req.get('host')}/Clothing`,
            }
        };

        try {
            const item = await Item.findById(itemId);

            if (!item) {
                res.status(404).json({message: 'ITEM not found'});
                return;
            }

            const combinedData = {
                ...item.toObject(),
                _links: links
            };

            // Adding both
            res.json(combinedData);
        } catch (error) {
            console.error('Error fetching Clothing details:', error);
            res.status(500).json({message: 'Internal Server Error'});
        }
    } else {
        // Again checking if JSON is right
        res.status(406).json({message: 'Not Acceptable: This endpoint only supports application/json'});
    }
});


router.put('/Clothing/:id', [
    check('name').notEmpty().withMessage('Name is required'),
    check('type').notEmpty().withMessage('Type is required'),
    check('brand').notEmpty().withMessage('Brand is required'),
    check('color').notEmpty().withMessage('Color is required'),
    check('size').notEmpty().withMessage('Size is required'),
    check('material').notEmpty().withMessage('Material is required'),
    check('price').notEmpty().withMessage('Price is required'),
    check('description').notEmpty().withMessage('Description is required'),
], async (req, res) => {
    const acceptHeader = req.get('Accept');
    const typeHeader = req.get('Content-Type');

    if (acceptHeader && acceptHeader.includes('application/json') && (typeHeader.includes('application/json') || typeHeader.includes('application/x-www-form-urlencoded'))) {
        try {

            // checking for the errors regarding empty
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const id = req.params.id;

            const item = await Item.findById(id)


            item.name = req.body.name;
            item.type = req.body.type;
            item.brand = req.body.brand;
            item.color = req.body.color;
            item.size = req.body.size;
            item.material = req.body.material;
            item.price = req.body.price;
            item.description = req.body.description;


            // saving the new items
            await item.save();

            const links = {
                self: {
                    href: `${req.protocol}://${req.get('host')}/Clothing/${id}`,
                },
                collection: {
                    href: `${req.protocol}://${req.get('host')}/Clothing`,
                }
            };

            // again creating the new type
            const combinedData = {
                ...item.toObject(),
                _links: links
            };

            res.json(combinedData);
        } catch (error) {
            console.error('Error updating item:', error);
            res.status(500).send('Internal Server Error');
        }
    }
});



router.delete('/Clothing/:id', async (req, res) => {
    const acceptHeader = req.get('Accept');

    if (acceptHeader && acceptHeader.includes('application/json')) {
        const itemId = req.params.id;

        try {
            const deletedItem = await Item.findByIdAndDelete(itemId);
            if (!deletedItem) {
                res.status(404).json({ message: 'Item not found' });
                return;
            }
            res.status(204).json({ message: 'Item deleted successfully' });
        } catch (error) {
            console.error('Error deleting item:', error);
            res.status(500).send('Internal Server Error');
        }
    } else {
        res.status(406).json({ message: 'Not Acceptable: This endpoint only supports application/json' });
    }
});


export default router;

