import { Request, Response } from "express";
import { validationResult } from "express-validator";
import _DB from "../../db/PostgreSqlConnection";
import ServerResponse from "../../helpers/ServerResponse";
import ArrayToObject from "../../helpers/ArrayToObject";

class MovementService {
  /**
   *  Obtiene todos los movimientos de carga y descarga de inventario
   */
  public async getMovements(req: Request, res: Response) {
    try {
      const company = await _DB.query(
        "SELECT id FROM companies WHERE id_user = $1",
        [req.token!.id]
      );
      console.log(company);
      const movements = await _DB.query(
        "SELECT * FROM movements WHERE id_company = $1 ORDER BY id DESC",
        [company.rows[0].id]
      );
      return ServerResponse.success(
        "Listado de movimientos",
        200,
        movements.rows,
        res
      );
    } catch (error) {
      return ServerResponse.error(
        "Error al obtener los movimientos",
        500,
        error,
        res
      );
    }
  }

  /**
   * Obtiene todos los movimientos de carga de inventario
   */
  public async getInMovements(req: Request, res: Response) {
    try {
      const movements = await _DB.query(
        "SELECT * FROM movements WHERE movement_type = 'IN' AND id_company = $1 ORDER BY id DESC",
        [req.token!.company.id]
      );
      return ServerResponse.success(
        "Listado de movimientos de carga",
        200,
        movements.rows,
        res
      );
    } catch (error) {
      return ServerResponse.error(
        "Error al obtener los movimientos de carga",
        500,
        error,
        res
      );
    }
  }

  /**
   * Obtiene todos los movimientos de descarga de inventario
   */
  public async getOutMovements(req: Request, res: Response) {
    try {
      const movements = await _DB.query(
        "SELECT * FROM movements WHERE movement_type = 'OUT' AND id_company = $1 ORDER BY id DESC",
        [req.token!.company.id]
      );
      return ServerResponse.success(
        "Listado de movimientos de descarga",
        200,
        movements.rows,
        res
      );
    } catch (error) {
      return ServerResponse.error(
        "Error al obtener los movimientos de descarga",
        500,
        error,
        res
      );
    }
  }

  /**
   * Crear un movimiento de inventario
   */
  public async createMovement(req: Request, res: Response) {
    try {
      // Verify if there are errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ServerResponse.error(
          "Error de validación",
          422,
          errors.array(),
          res
        );
      }
      // Get the params from the body
      const { movement_type, barcode_product, quantity, description, id_tag } =
        req.body;
      const id_company = req.token!.company.id;
      // Make a query to the database and create the movement
      const response = await _DB.query(
        "INSERT INTO movements (movement_type, barcode_product, id_company, quantity, description, id_tag) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
        [
          movement_type,
          barcode_product,
          id_company,
          quantity,
          description || "",
          id_tag,
        ]
      );
      // Call the helper function to return the response
      return ServerResponse.success(
        "Movimiento creado",
        201,
        response.rows,
        res
      );
    } catch (error) {
      return ServerResponse.error(
        "Error al crear el movimiento",
        500,
        error,
        res
      );
    }
  }

  /**
   * Eliminar un movimiento de inventario
   */
  public async deleteMovement(req: Request, res: Response) {
    try {
      // Get the params from the url
      const { id } = req.params;
      // Make a query to the database and delete the movement
      const movement = await _DB.query(
        "DELETE FROM movements WHERE id = $1 AND id_company = $2 RETURNING *",
        [id, req.token!.company.id]
      );
      // If the movement was not deleted
      if (movement.rowCount === 0) {
        return ServerResponse.error(
          "No se encontró el movimiento",
          404,
          null,
          res
        );
      }
      return ServerResponse.success(
        "Movimiento eliminado correctamente",
        200,
        movement.rows,
        res
      );
    } catch (error) {
      return ServerResponse.error(
        "Error al eliminar el movimiento",
        500,
        error,
        res
      );
    }
  }
}

export default new MovementService();
