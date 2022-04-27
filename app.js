//Imports
const express = require('express');
const app = express();
const fs = require("fs");
const multer = require('multer');
const { createWorker } = require("tesseract.js");
const worker = createWorker();

//Storage
const storage = multer.diskStorage({
    destination: (req,file,cb) => {
        cb(null, "./uploads");
    },
    filename: (req,file,cb) => {
        cb(null, file.originalname);
    }
});
const upload = multer({storage: storage}).single("avatar");

app.set('view engine', 'ejs');

//route
app.get('/',(req,res)=>{
    res.render('index');
});

app.post('/upload',(req,res) => {
    upload(req,res, err => {
        fs.readFile(`./uploads/${req.file.originalname}`,(err,data) => {
            if(err) return console.log('This is your error',err);

            (async () => {
                await worker.load();
                await worker.loadLanguage('eng');
                await worker.initialize('eng');
                const { data: { text } } = await worker.recognize(data);
                 console.log(text);
                await worker.terminate();
                res.send(text);
            })();
        });
    });
});

//Start Up our server
const PORT = 5000 || process.env.PORT;
app.listen(PORT, () => console.log(`Hey I am running on port ${PORT}`));
