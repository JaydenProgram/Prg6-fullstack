import express from 'express';
import mongoose from 'mongoose';
// import cors from 'cors';
import routes from './routes/routes.js';
import bodyParser from "body-parser"; // Importeer de router

try {
    await mongoose.connect('mongodb://localhost:27017/Clothing', {
        // useNewUrlParser: true,
        // useUnifiedTopology: true,
        // serverSelectionTimeoutMS: 5000,
        // maxPoolSize: 10,
    });
} catch (error) {
    console.error(error);
}

const app = express();

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

// app.use(cors());

app.use('/', routes);

app.listen(8000, () => {
    console.log('Server started on port 8000');
});