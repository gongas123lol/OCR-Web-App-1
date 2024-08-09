import * as db from './dbcon.mjs';
import * as express from 'express';
import {CustomError} from "./Class Extensions/errors.mjs";
import multer from "multer";
import path from "path";
import { spawn } from 'child_process';



/**
 * This module is used to configure the SECA API Routes, and handle the requests and respective errors.
 * It interacts directly with the service module.
 */


//--------------------Helper functions--------------------//


/**
 * This function is used to get the token from the request's Authorization header.
 * @param req
 * @returns Bearer Token
 */
async function getToken(req) {
    const token = await req.get("Authorization")
    const split = token.split(" ")[1];
    return split
}

// This is the express router that will be exported
const expressRouter = express.Router();

/**
 * This function is used to catch the errors and send the respective responses.
 * @param error
 * @param res
 */
function errorCatching(error, res) {
    if (error instanceof CustomError) {
        res.status(error.statusCode).json({error: error.message});

    } else if (error instanceof Error) {
        res.status(500).json({error: 'Internal error'});

    }
}
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Initialize upload
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
}).single('image'); // Field name in form

// Check file type
function checkFileType(file, cb) {
    // Allowed extensions
    const filetypes = /jpeg|jpg|png|gif/;
    // Check extension
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime type
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Images Only!');
    }
}



// Run a Python script and return output
async function runPythonScript(scriptPath, args) {
    return new Promise((resolve, reject) => {
        const pyProg = spawn('python', [scriptPath].concat(args));

        let data = '';
        let errorOutput = '';

        // Collect data from stdout
        pyProg.stdout.on('data', (stdout) => {
            data += stdout.toString();
        });

        // Collect error output from stderr
        pyProg.stderr.on('data', (stderr) => {
            errorOutput += stderr.toString();
        });

        // Handle script completion
        pyProg.on('close', (code) => {
            if (code !== 0) {
                // If the script exited with a non-zero code, reject the promise
                reject(`Python script exited with code ${code}: ${errorOutput}`);
            } else {
                // Resolve the promise with the collected data
                resolve(data);
            }
        });

        // Handle script errors
        pyProg.on('error', (error) => {
            reject(`Error executing Python script: ${error.message}`);
        });
    });
}

// Run the Python file


//--------------------MAIN FUNCTIONS--------------------//

export default () => {
    // Upload endpoint
    expressRouter.post('/upload', (req, res) => {
        upload(req, res, async (err) => {
            if (err) {
                res.status(400).send(err);
            } else {
                if (req.file == undefined) {
                    res.status(400).send('Error: No File Selected!');
                } else {
                    try {
                        const result = await runPythonScript('py/imagehandle.py', [req.file.filename]);
                        await console.log(result)
                        res.status(200).json({ message:  result });
                    } catch (error) {
                        // Handle errors from the Python script
                        console.error('Error running Python script:', error);
                        res.status(500).json({ error: 'Failed to process image' });
                    }
                }
            }
        });
    });
    expressRouter.post('/hello/world', async (req, res) => {
        try {
            console.log("hello world")
            res.status(200).json({message: 'car added successfully'});
        } catch (error) {
            errorCatching(error, res);
        }
    });
    expressRouter.post('/cars/add', async (req, res) => {
        try {
            const {marca, modelo,motorcc, peso,potenciacv,binarionm, matricula,vin} = req.body;
            //car.marca, car.modelo, car.motorcc, car.peso, car.potenciacv, car.binarionm, car.matricula, car.vin, 1
            const car = {
                marca: marca,
                modelo: modelo,
                motorcc: motorcc,
                peso: peso,
                potenciacv: potenciacv,
                binarionm: binarionm,
                matricula: matricula,
                vin:vin
            }
            await db.addCar(car)
            res.status(200).json({message: 'car added successfully'});
        } catch (error) {
            errorCatching(error, res);
        }
    });

    expressRouter.delete('/cars/deletebyvin',  async (req, res) => {
        try {
            const {vin} = req.body;

            await db.removeCar(vin)
            res.status(200).json({message: 'car removed successfully'});
        } catch (error) {
            errorCatching(error, res);
        }
    });
    expressRouter.post('/groups/create', async (req, res) => {


        try {
            const {name, description} = req.body;
            const UUID = await getToken(req);
            await services.createGroup(UUID, name, description);
            res.status(200).json({message: 'Group created successfully'});
        } catch (error) {
            errorCatching(error, res);
        }

    });


    expressRouter.post('/groups/delete', async (req, res) => {
        try {
            const {id} = req.body;
            const UUID = await getToken(req);
            await services.deleteGroup(UUID, id);
            res.status(200).json({message: 'Group deleted successfully'});
        } catch (error) {
            errorCatching(error, res);
        }

    });

    expressRouter.post('/groups/edit', async (req, res) => {
        try {
            const {id, newName, newDescription} = req.body;
            const UUID = await getToken(req);
            await services.editGroup(UUID, id, newName, newDescription, res);
            res.status(200).json({message: 'Group edited successfully'});
        } catch (error) {
            errorCatching(error, res);
        }
    });

    expressRouter.get('/groups/list', async (req, res) => {

        try {
            const UUID = await getToken(req);
            const groups = await services.listAllGroups(UUID);
            res.status(200).json(groups);
        } catch (error) {
            errorCatching(error, res);
        }
    });

    expressRouter.post('/groups/get/details', async (req, res) => {
        try {
            const {id} = req.body;
            const UUID = await getToken(req);
            const groupDetails = await services.getGroupDetails(UUID, id);
            res.status(200).json(groupDetails);
        } catch (error) {
            errorCatching(error, res);
        }
    });

    expressRouter.post('/groups/add/event', async (req, res) => {

        try {
            const {id, eventID} = req.body;
            const UUID = await getToken(req);
            const event = await services.getEvent(eventID);
            await services.addEvent(event, UUID, id);
            res.status(200).json({message: 'Event added successfully'});
        } catch (error) {
            errorCatching(error, res);
        }
    });

    expressRouter.post('/groups/remove/event', async (req, res) => {
        try {
            const {id, eventID} = req.body;
            const UUID = await getToken(req);
            const event = await services.findGroupEvent(eventID, UUID, id);
            await services.removeEventFromGroup(UUID, id, event, res);
            res.status(200).json({message: 'Event removed successfully'});
        } catch (error) {
            errorCatching(error, res);
        }
    });


    expressRouter.post('/events/popular', async (req, res) => {
        try {
            const UUID = await getToken(req);
            const {size, page} = req.body;
            const events = await services.getPopularEvents(UUID, size, page, res);
            res.status(200).json(events);
        } catch (error) {
            errorCatching(error, res);
        }
    });


    expressRouter.post('/events/search', async (req, res) => {
        try {
            const UUID = await getToken(req);
            const {size, page, keyword} = req.body;
            const events = await services.searchByName(UUID, keyword, size, page);
            res.status(200).json(events);
        } catch (error) {
            errorCatching(error, res);
        }
    });


    return expressRouter;

}