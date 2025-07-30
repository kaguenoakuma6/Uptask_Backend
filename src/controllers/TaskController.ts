import type {Request, Response} from 'express';

import Task from '../models/Task';

export class TaskController {
    static createTask = async (req: Request, res: Response) => {
        try 
        {
            const task = new Task(req.body);
            task.project = req.project.id;
            req.project.tasks.push(task.id);
            await Promise.allSettled([ task.save(), req.project.save() ]);
            
            res.json('Tarea Creada!!');
        } 
        catch (error) 
        {
            res.status(500).json({error: 'Ocurrio Un Error al Validar la Tarea'});
        }
    }

    static getTasks = async (req: Request, res: Response) => {
        try 
        {
            const tasks = await Task.find({ project: req.project.id }).populate('project');
                       
            res.json(tasks);
        } 
        catch (error) 
        {
            res.status(500).json({error: 'Ocurrio Un Error al Validar la Tarea'});
        }
    }

    static getTaskById = async (req: Request, res: Response) => {
        try 
        {
            if(req.task.project.toString() !== req.project.id)
            {
                const error = new Error('La Tarea no Pertenece al Proyecto!!!');
                return res.status(400).json({ error: error.message });
            }

            res.json(req.task);
        } 
        catch (error) 
        {
            res.status(500).json({error: 'Ocurrio Un Error al Validar la Tarea'});
        }
    }

    static updateTask = async (req: Request, res: Response) => {
        try 
        {
            req.task.name = req.body.name;
            req.task.description = req.body.description;

            req.task.save();

            res.send('Tarea Actualizada Correctamente!!!');
        } 
        catch (error) 
        {
            res.status(500).json({error: 'Ocurrio Un Error al Validar la Tarea'});
        }
    }

    static deleteTask = async (req: Request, res: Response) => {
        try 
        {
            req.project.tasks = req.project.tasks.filter(task => task._id.toString() !== req.task.id.toString());

            await Promise.allSettled([ req.task.deleteOne(), req.project.save() ]);

            res.send('Tarea Eliminada Correctamente!!!');
        } 
        catch (error) 
        {
            res.status(500).json({error: 'Ocurrio Un Error al Validar la Tarea'});
        }
    }

    static updateStatus = async (req: Request, res: Response) => {
        try 
        {
            const { status } = req.body;

            req.task.status = status;

            await req.task.save();

            res.send('Estatus Actualizado Correctamente!!!');
        } 
        catch (error) 
        {
            res.status(500).json({error: 'Ocurrio Un Error al Validar la Tarea'});
        }
    }
}