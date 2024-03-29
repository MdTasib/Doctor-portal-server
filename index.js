const express = require('express');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1aqm3.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.static('doctors'));
app.use(fileUpload());

const port = 5000;

app.get('/', (req, res) => {
    res.send('Hello from db. it is working working');
});

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const appointmentCollection = client.db("doctorsPortal").collection("appointment");
    const doctorCollection = client.db("doctorsPortal").collection("doctors");

    // read appointments
    app.get('/appointments', (req, res) => {
        appointmentCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    // add appointments
    app.post('/addAppointment', (req, res) => {
        const appointment = req.body;
        appointmentCollection.insertOne(appointment)
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })

    // appointments date
    app.post('/appointmentsByDate', (req, res) => {
        const date = req.body;
        const email = req.body.email;
        doctorCollection.find({ email: email })
            .toArray((error, doctors) => {
                const filter = { date: date.date }
                if (doctors.length === 0) {
                    filter.email = email;
                }

                appointmentCollection.find()
                    .toArray((error, documents) => {
                        res.send(documents);
                    })
            })


    })

    // upload image file
    app.post('/addDoctor', (req, res) => {
        const file = req.files.file;

        const name = req.body.name;
        const email = req.body.email;
        console.log(name, email, file);
        file.mv(`${__dirname}/doctors/${file.name}`, error => {
            if (error) {
                console.log(error);
                return res.status(500).send({ msg: 'Failed to upload Image' })
            }
            return res.send({ name: file.name, path: `/${file.name}` })
        })
    })
});

app.listen(process.env.PORT || port);