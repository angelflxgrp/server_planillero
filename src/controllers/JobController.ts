// src/controllers/JobController.ts
import { RequestHandler } from "express";
import { JobService } from "../services/JobService";
import { ApiResponse } from "../dtos/ApiResponse";
import type { Job, Prisma } from "@prisma/client";
import { createJobSchema, updateJobSchema } from "../validators/job.validator";
import { z } from "zod";

export const listJobs: RequestHandler<
  {}, // params
  ApiResponse<Job[]>, // res body
  {}, // req body
  {
    empresaId?: string;
    mostrarEmpresaId?: string;
    activo?: string;
  }
> = async (req, res, next) => {
  try {
    const empresaId = req.query.empresaId
      ? Number(req.query.empresaId)
      : undefined;
    const mostrarEmpresaId = req.query.mostrarEmpresaId
      ? Number(req.query.mostrarEmpresaId)
      : undefined;

    let activo: boolean | undefined;
    if (req.query.activo === "true") activo = true;
    if (req.query.activo === "false") activo = false;
    // si no viene activo, queda undefined → devuelve todos

    const jobs = await JobService.listJobs({
      empresaId,
      mostrarEmpresaId,
      activo,
    });

    return res.json({
      success: true,
      message: "Listado de jobs",
      data: jobs,
    });
  } catch (err) {
    next(err);
  }
};

/** GET /api/jobs/:id */
export const getJob: RequestHandler<
  { id: string }, // params
  ApiResponse<Job>, // res body
  {}, // req body
  {} // query
> = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const job = await JobService.getJobById(id);
    return res.json({
      success: true,
      message: `Detalles del job ${id}`,
      data: job,
    });
  } catch (err) {
    next(err);
  }
};

/** POST /api/jobs */
export const createJob: RequestHandler<{}, ApiResponse<Job>> = async (
  req,
  res,
  next
) => {
  try {
    const payload = createJobSchema.parse(req.body);
    const newJob = await JobService.createJob(payload);
    return res.status(201).json({
      success: true,
      message: "Job creado correctamente",
      data: newJob,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res
        .status(400)
        .json({ success: false, message: "Error de validación", data: null });
    }
    next(err);
  }
};

/** PUT /api/jobs/:id */
export const updateJob: RequestHandler<
  { id: string },
  ApiResponse<Job>
> = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const payload = updateJobSchema.parse(req.body);
    const updated = await JobService.updateJob(id, payload);
    return res.json({
      success: true,
      message: `Job ${id} actualizado`,
      data: updated,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res
        .status(400)
        .json({ success: false, message: "Error de validación", data: null });
    }
    next(err);
  }
};

/** DELETE /api/jobs/:id */
export const deleteJob: RequestHandler<
  { id: string }, // params
  ApiResponse<null>, // res body
  {}, // req body
  {} // query
> = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await JobService.deleteJob(id);
    return res.json({
      success: true,
      message: `Job ${id} eliminado`,
      data: null,
    });
  } catch (err) {
    next(err);
  }
};
