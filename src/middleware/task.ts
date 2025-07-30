import type {Request, Response, NextFunction} from 'express';
import Task, { ITask } from '../models/Task';

/** Se sobre escribe la variable global Request y se le agrega la propiedad project  
 * Se utiliza una interface ya que permite agregar propiedades a un objeto sin perder lo que ya contiene
*/
declare global {
    namespace Express {
        interface Request {
            task: ITask;
        }
    }
}

export async function taskExists(req:Request, res: Response, next: NextFunction) {
    try 
    {
        const { taskId } = req.params;

        const task = await Task.findById(taskId);

        if(!task)
        {
            const error = new Error('Tarea no encontrada!!!');
            return res.json({ error: error.message });
        }

        req.task = task;

        next();
    } 
    catch (error) 
    {
        res.status(500).json({error: 'Ocurrio Un Error al validar la Tarea!!!'});
    }
}

export function taskToProject(req:Request, res: Response, next: NextFunction) {
    
    if(req.task.project.toString() !== req.project.id.toString())
    {
        const error = new Error('La Tarea no Pertenece al Proyecto!!!');
        return res.status(400).json({ error: error.message });
    }
    next()
}