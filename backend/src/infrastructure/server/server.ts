import express from 'express';
import { RouteController } from '../../adapters/inbound/http/RouteController.js';

// Import all our implementations
import { PrismaRouteRepository } from '../../adapters/outbound/postgres/PrismaRouteRepository.js';
import { 
  GetRoutesUseCase, 
  SetBaselineUseCase, 
  GetComparisonUseCase 
} from '../../core/application/RouteUseCases.js';

// --- This is the "Dependency Injection" part ---
// We create the *real* implementations here

// 1. Create the repository (the database connection)
const routeRepository = new PrismaRouteRepository();

// 2. Create the use cases and give them the real repository
const getRoutesUseCase = new GetRoutesUseCase(routeRepository);
const setBaselineUseCase = new SetBaselineUseCase(routeRepository);
const getComparisonUseCase = new GetComparisonUseCase(routeRepository);

// 3. Create the controller and give it the real use cases
const routeController = new RouteController(
  getRoutesUseCase,
  setBaselineUseCase,
  getComparisonUseCase
);
// --- End of Dependency Injection ---

// Create the Express app
const app = express();
app.use(express.json()); // Middleware to parse JSON bodies

// --- Define API Routes ---
// We bind the controller methods to the express router
const router = express.Router();
router.get('/routes', routeController.getAllRoutes.bind(routeController));
router.post('/routes/:id/baseline', routeController.setBaseline.bind(routeController));
router.get('/routes/comparison', routeController.getComparison.bind(routeController));

app.use('/api', router); // Prefix all our routes with /api

export default app; // Export the app for testing