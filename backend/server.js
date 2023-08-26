import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import dataModel from './models/data.js';

import jsonData from './jsondata.json' assert { type: "json" };


const app = express();
app.use(cors());
app.use(bodyParser.json());


const PORT = process.env.PORT || 5000;
const MONGODB_URI = "mongodb+srv://rakeshdontula66:4423@cluster0.zpf0mcv.mongodb.net/blackcoffer?retryWrites=true&w=majority";

mongoose.connect(MONGODB_URI, {
    useNewUrlParser : true,
    useUnifiedTopology : true,
});

mongoose.connection.on('error', (err) => {
    console.error("Mongoose connection error:", err);
});

mongoose.connection.on('connected', () =>{
    console.log("mongoose is connected!!!");

})

const router = express.Router();

app.get('/storedata', async (req, res) => {
    try{
        const existingData = await dataModel.find({});

        if(existingData.length > 0){
            res.send(existingData);
            return;
        }


        await dataModel.create(jsonData);
        res.send("Data inserted successfully");

    }
    catch(err){
        console.log("Error in inserting data", err);
    }
}
);

app.get('/getdata', async (req, res) => {
    try{
        const data = await dataModel.find({});
        res.send(data);
    }
    catch(err){
        console.log("Error in getting data", err);
    }

});

app.get('/getdata/:country', async (req, res) => {
    try{
        const data = await dataModel.find({country: req.params.country},
            {_id:0,country:1,sector:1,topic:1,intensity:1,title:1,pestle:1,source:1,likelihood:1,region:1,likelihood:1}
            ); 
        res.send(data);
    }
    catch(err){
        console.log("Error in getting data", err);
    }

});

app.get('/filteredData', async (req, res) => {
    try {
        const { country, sector, topic } = req.query;
        let filters = {};

        if (country) filters.country = country;
        if (sector) filters.sector = sector;
        if (topic) filters.topic = topic;

        const filteredData = await dataModel.find(filters);

        res.send(filteredData);
    } catch (err) {
        console.log("Error in retrieving filtered data", err);
        res.status(500).send("Error in retrieving filtered data");
    }
});



app.get('/aggregatedata', async (req, res) => {
    try{
        const data = await dataModel.aggregate([
            {
                $group: {
                    _id: "$pestle",
                    total: {$sum: "$intensity"},
                    min_intensity : {$min: "$intensity"},
                    max_intensity : {$max: "$intensity"},
                    avg_intensity : {$avg: "$intensity"},
                    count : {$sum: 1}

                }
            },
            {
            $project:{
                _id: 0,
                pestle: "$_id",
                total: 1,
                min_intensity : 1,
                max_intensity : 1,
                avg_intensity : {$round: ["$avg_intensity", 2]},
                count : 1
            }
        }
        ]);
        res.send(data);
    }
    catch(err){
        console.log("Error in getting data", err);
    }

});

app.get('/topics', async (req, res) => {
    try{
        const data = await dataModel.aggregate([
            {
                $group: {
                    _id: "$topic",
                    total: {$sum: "$intensity"},
                    min_intensity : {$min: "$intensity"},
                    max_intensity : {$max: "$intensity"},
                    avg_intensity : {$avg: "$intensity"},
                    count : {$sum: 1}

                }
            },
            {
            $project:{
                _id: 0,
                topic: "$_id",
                total: 1,
                min_intensity : 1,
                max_intensity : 1,
                avg_intensity : {$round: ["$avg_intensity", 2]},
                count : 1
            }
        }
        ]);
    }
    catch(err){
        console.log("Error in getting data", err);
    }
});

 // Function to get data based on sector or topic name based on user clicks the sector name should change so only specific sector details should come

 







app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
}
);