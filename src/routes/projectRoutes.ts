import { Router } from 'express';
import { body, param } from 'express-validator';
import { ProjectController } from '../controllers/ProjectController';
import { handleInputErrors } from '../middleware/validation';
import { TaskController } from '../controllers/TaskController';
import { projectExists } from '../middleware/project';
import { hasAutorization, taskExists, taskToProject } from '../middleware/task';
import { authenticate } from '../middleware/auth';
import { TeamMemberController } from '../controllers/TeamController';

const router = Router();

router.use(authenticate);

router.post('/',
    body('projectName').notEmpty().withMessage('El Nombre del Proyecto es Obligatorio'),
    body('clientName').notEmpty().withMessage('El Nombre del Cliente es Obligatorio'),
    body('description').notEmpty().withMessage('La Descripcion del Proyecto es Obligatoria'),
    handleInputErrors, ProjectController.createProject
);


router.get('/', ProjectController.getAllProjects);

router.get('/:id', 
    param('id').isMongoId().withMessage('Id No Válido'),
    handleInputErrors, ProjectController.getProjectById
);

router.put('/:id', 
    param('id').isMongoId().withMessage('Id No Válido'),
    body('projectName').notEmpty().withMessage('El Nombre del Proyecto es Obligatorio'),
    body('clientName').notEmpty().withMessage('El Nombre del Cliente es Obligatorio'),
    body('description').notEmpty().withMessage('La Descripcion del Proyecto es Obligatoria'),
    handleInputErrors, ProjectController.updateProject
);

router.delete('/:id', 
    param('id').isMongoId().withMessage('Id No Válido'),
    handleInputErrors, ProjectController.deleteProject
);


/** Rutas para las tareas */
// Se valida que el proyecto exista y se agrega al request golbal
router.param('projectId', projectExists);

router.post('/:projectId/tasks', hasAutorization,
    body('name').notEmpty().withMessage('El Nombre de la Tarea es Obligatorio'),
    body('description').notEmpty().withMessage('La Descripcion de la Tarea es Obligatoria'),
    handleInputErrors, TaskController.createTask
);

router.get('/:projectId/tasks',TaskController.getTasks );

// Se valida que la tarea exista y se agrega al request golbal
//
router.param('taskId', taskExists);
router.param('taskId', taskToProject);

router.get('/:projectId/tasks/:taskId', 
    param('taskId').isMongoId().withMessage('Id No Válido'),
    handleInputErrors,TaskController.getTaskById
);

router.put('/:projectId/tasks/:taskId', hasAutorization,
    param('taskId').isMongoId().withMessage('Id No Válido'),
    body('name').notEmpty().withMessage('El Nombre de la Tarea es Obligatorio'),
    body('description').notEmpty().withMessage('La Descripcion de la Tarea es Obligatoria'),
    handleInputErrors,TaskController.updateTask
);

router.delete('/:projectId/tasks/:taskId', hasAutorization,
    param('taskId').isMongoId().withMessage('Id No Válido'),
    handleInputErrors,TaskController.deleteTask
);

router.post('/:projectId/tasks/:taskId/status', 
    param('taskId').isMongoId().withMessage('Id No Válido'),
    body('status').notEmpty().withMessage('El Estatus de la Tarea es Obligatorio'),
    handleInputErrors, TaskController.updateStatus
);

/** Ruta para los Equipos */
router.post('/:projectId/team/find',
    body('email').isEmail().toLowerCase().withMessage('Correo no valido'),
    handleInputErrors,
    TeamMemberController.findMemberByEmail
);

router.get('/:projectId/team', TeamMemberController.getProjectTeam);

router.post('/:projectId/team',
    body('id').isMongoId().withMessage('ID no Válido'),
    handleInputErrors,
    TeamMemberController.addMemberById
);

router.delete('/:projectId/team/:memberId',
    param('memberId').isMongoId().withMessage('ID no Válido'),
    handleInputErrors,
    TeamMemberController.removeMemberById
);

export default router;