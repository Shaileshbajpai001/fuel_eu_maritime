import express from 'express';
import  { RouteController } from '../../adapters/inbound/http/RouteController.js';

// Import all our implementations
import  { PrismaRouteRepository } from '../../adapters/outbound/postgres/PrismaRouteRepository.js';
import { 
  GetRoutesUseCase, 
  SetBaselineUseCase, 
  GetComparisonUseCase 
} from '../../core/application/RouteUseCases.js';

// ... (keep existing imports)
import { ComplianceController } from '../../adapters/inbound/http/ComplianceController.js';
import { PrismaComplianceRepository } from '../../adapters/outbound/postgres/PrismaComplianceRepository.js';
import {
  ComputeCBUseCase,
  GetAdjustedCBUseCase,
  GetBankedRecordsUseCase,
  BankSurplusUseCase,
  ApplyBankedUseCase
} from '../../core/application/ComplianceUseCases.js';

// ... (keep existing imports)
import { PoolController } from '../../adapters/inbound/http/PoolController.js';
import { PrismaPoolRepository } from '../../adapters/outbound/postgres/PrismaPoolRepository.js';
import { CreatePoolUseCase } from '../../core/application/PoolUseCases.js';






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



// 1. Create the new repository
const complianceRepository = new PrismaComplianceRepository();

// 2. Create the new use cases (note: ComputeCBUseCase needs *both* repos)
const computeCBUseCase = new ComputeCBUseCase(routeRepository, complianceRepository);
const getAdjustedCBUseCase = new GetAdjustedCBUseCase(complianceRepository);
const getBankedRecordsUseCase = new GetBankedRecordsUseCase(complianceRepository);
const bankSurplusUseCase = new BankSurplusUseCase(complianceRepository);
const applyBankedUseCase = new ApplyBankedUseCase(complianceRepository);

// 3. Create the new controller
const complianceController = new ComplianceController(
  computeCBUseCase,
  getAdjustedCBUseCase,
  getBankedRecordsUseCase,
  bankSurplusUseCase,
  applyBankedUseCase
);


// 1. Create the new repository
const poolRepository = new PrismaPoolRepository();

// 2. Create the new use case
const createPoolUseCase = new CreatePoolUseCase(poolRepository);

// 3. Create the new controller
const poolController = new PoolController(
  createPoolUseCase
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

// ... (after router.get('/routes/comparison', ...))

// Compliance Routes
router.get('/compliance/cb', complianceController.getComplianceBalance.bind(complianceController));
router.get('/compliance/adjusted-cb', complianceController.getAdjustedCB.bind(complianceController));

// Banking Routes
router.get('/banking/records', complianceController.getBankedRecords.bind(complianceController));
router.post('/banking/bank', complianceController.bankSurplus.bind(complianceController));
router.post('/banking/apply', complianceController.applyBanked.bind(complianceController));

// pooling routes
router.post('/pools', poolController.createPool.bind(poolController));

app.use('/api', router); // Prefix all our routes with /api

export default app; // Export the app for testing