"use strict";

import { NextFunction } from "express-serve-static-core";
import { Province, IProvince } from "./province.schema";
import { IUserSession, IUserSessionRequest } from "../security/security.service";

import * as mongoose from "mongoose";
import * as errorHandler from "../utils/error.handler";
import * as express from "express";
import * as escape from "escape-html";

/**
 * Busca una provincia
 */
export interface IReadRequest extends express.Request {
  province: IProvince;
}
export function read(req: IReadRequest, res: express.Response) {
  res.json(req.province);
}

/**
 * Lista todas las Provincias
 */
export function list(req: express.Request, res: express.Response) {
  Province.find({ enabled: true }).exec(function (err, provincia: IProvince) {
    if (err) return errorHandler.handleError(res, err);

    return res.json(provincia);
  });
}


/**
 * Filtro para buscar y popular una provincia por id.
 * El resultado de la busqueda se popula en req.
 */
export interface IFindByIdRequest extends express.Request {
  province: IProvince;
}
export function findByID(req: IFindByIdRequest, res: express.Response, next: NextFunction, id: string) {
  Province.findOne({
    _id: escape(id),
    enabled: true
  },
    function (err, province: IProvince) {
      if (err) return errorHandler.handleError(res, err);

      if (!province) {
        return errorHandler.sendError(res, errorHandler.ERROR_NOT_FOUND, "No se pudo encontrar la provincia " + id);
      }

      req.province = province;
      next();
    });
}

/**
 * Crea o actualiza una provincia
 */
export interface IUpdateRequest extends IUserSessionRequest {
  province: IProvince;
}
export function validateUpdate(req: IUpdateRequest, res: express.Response, next: NextFunction) {
  if (req.body.name) {
    req.check("name", "Hasta 256 caracteres solamente.").isLength({ max: 256 });
    req.sanitize("name").escape();
  }

  req.getValidationResult().then(function (result) {
    if (!result.isEmpty()) {
      return errorHandler.handleExpressValidationError(res, result);
    }
    next();
  });
}
export function update(req: IUpdateRequest, res: express.Response) {
  let province = <IProvince>req.province;
  if (!province) {
    province = new Province();
  }

  if (req.body.name) {
    province.name = req.body.name;
  }

  province.save(function (err: any) {
    if (err) return errorHandler.handleError(res, err);

    res.json(province);
  });
}


/**
 * Elimina una mascota
 */
export interface IRemoveRequest extends IUserSessionRequest {
  province: IProvince;
}
export function remove(req: IRemoveRequest, res: express.Response) {
  const province = <IProvince>req.province;

  province.enabled = false;
  province.save(function (err: any) {
    if (err) return errorHandler.handleError(res, err);

    res.json(province);
  });
}