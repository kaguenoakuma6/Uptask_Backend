import type { Request, Response} from 'express';
import User from '../models/User';
import Project from '../models/Project';

export class TeamMemberController
{
    static findMemberByEmail = async (req: Request, res: Response) => {
        const { email } = req.body;

        const userBD = await User.findOne({email}).select('id email name');

        if(!userBD)
        {
            const error = new Error('Usuario no Encontrado!!');
            return res.status(404).json({error: error.message});
        }

        res.json(userBD);
    }

    static getProjectTeam = async (req: Request, res: Response) => {
        const project = await Project.findById(req.project.id).populate({ path: 'team', select: 'id email name'});

        res.json(project.team);
    }

    static addMemberById = async (req: Request, res: Response) => {
        const { id } = req.body;

        const userBD = await User.findById(id).select('id');

        if(!userBD)
        {
            const error = new Error('Usuario no Encontrado!!');
            return res.status(404).json({error: error.message});
        }

        if(req.project.team.some(member => member.toString() === userBD.id.toString()))
        {
            const error = new Error('El Usuario Ya Existe en el Proyecto!!');
            return res.status(409).json({error: error.message});
        }

        req.project.team.push(userBD.id);

        await req.project.save();

        res.send('Usuario Agregado Correctamente');
    }

    static removeMemberById = async (req: Request, res: Response) => {
        const { memberId } = req.params;

        if(!req.project.team.some(member => member.toString() === memberId))
        {
            const error = new Error('El Usuario No Existe en el Proyecto!!');
            return res.status(404).json({error: error.message});
        }

        req.project.team = req.project.team.filter( member => member.toString() !== memberId);

        await req.project.save();

        res.send('Usuario Eliminado Correctamente');
    }
}