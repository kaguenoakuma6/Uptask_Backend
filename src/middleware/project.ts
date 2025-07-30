import type {Request, Response, NextFunction} from 'express';
import Project, { IProject } from '../models/Project';

/** Se sobre escribe la variable global Request y se le agrega la propiedad project  
 * Se utiliza una interface ya que permite agregar propiedades a un objeto sin perder lo que ya contiene
*/
declare global {
    namespace Express {
        interface Request {
            project: IProject;
        }
    }
}

export async function projectExists(req:Request, res: Response, next: NextFunction) {
    try 
    {
        const { projectId } = req.params;

        const project = await Project.findById(projectId);

        if(!project)
        {
            const error = new Error('Proyecto no encontrado!!!');
            return res.json({ error: error.message });
        }

        req.project = project;

        next();
    } 
    catch (error) 
    {
        res.status(500).json({error: 'Ocurrio Un Error al validar el Proyecto'});
    }
}