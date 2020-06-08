import { Response, Request} from 'express';
import knex from '../database/connection';

class PointController{

  async index(request: Request, response: Response){
    const { city, uf, items } = request.query; // QUERY porque eh filtro

    const parsedItems = String(items)
    .split(',')
    .map(item => Number(item.trim()));

    const point = await knex('points')
    .join('point_items', 'points.id', '=', 'point_items.point_id')
    .whereIn('point_items.item_id', parsedItems)
    .where('city', String(city))
    .where('uf', String(uf))
    .distinct()
    .select('points.*');

    return response.json(point);

  }

  async create (request: Request, response: Response)  {
        const {
          name,
          email,
          whatsapp,
          latitude,
          longitude,
          city,
          uf,
          items
        } = request.body;
      
        const trx = await knex.transaction();
        const point = {
            image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=474&q=80',
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf 
          }
        const insertedIds = await trx('points').insert(point);
      
        const point_id = insertedIds[0];
      
        const pointItems = items.map((item_id:number) => {
          return {
            item_id,
            point_id,
          };
        })
      
        await trx('point_items').insert(pointItems);

        await trx.commit(); // PARA FINALIZAR A TRANSACAO SE TUDO TIVER CERTO
        return response.json({
            id: point_id,
            ...point, 
        });
      }

  async show(request: Request, response: Response) {
    const { id } = request.params;

    const point = await knex('points').where('id', id).first();
    if (!point){
      return response.status(400).json({message: 'Point not found!'});
    }
    const item = await knex('items').join('point_items', 'items.id', '=', 'point_items.item_id')
    .where('point_items.point_id', id)
    .select('items.title');

    return response.json({point, item});
  }

  
}

export default PointController;