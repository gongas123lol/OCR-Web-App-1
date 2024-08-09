    /**
     * This module is used to start the webserver and configure it to receive requests.
     * It starts the webserver on port 3000. (http://localhost:3000)
     */

    import express from 'express';
    import api from './api.mjs';
    import * as path from "path";


    const __filename = new URL(import.meta.url).pathname;
    const __dirname = path.dirname(__filename);

    const application = express();

    const PORT = 3000;

    application.use(express.json());

    application.use('/', api());


    application.use(express.static('public'));
    // Set storage engine


    application.use((req, res) => {
        res.status(404).json({error: 'Not Found'});
    });

    application.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });

    export { application };
