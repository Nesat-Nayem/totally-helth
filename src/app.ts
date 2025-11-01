import express, {Application, Request,Response} from 'express';
import router from './app/routes';
import notFound from './app/middlewares/notFound';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import { setupSwagger } from './app/config/swagger';
import { globalAccessControl } from './app/middlewares/globalAccessControl';
const app:Application = express();
import cors from 'cors';

// parsers
app.use(express.json());
app.use(cors())

// swagger configuration
setupSwagger(app);

// Global access control - applies to all route
app.use(globalAccessControl());

// application route
app.use('/v1/api', router)

const entryRoute = (req:Request, res:Response)=>{
    const message = 'Surver is running...';
    res.send(message)
}

app.get('/', entryRoute)

//Not Found
app.use(notFound);

app.use(globalErrorHandler);

export default app;