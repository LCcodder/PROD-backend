// import express, { Request, Response, NextFunction } from "express";
// import { z, AnyZodObject } from "zod";

const validate = (schema) =>
  async (req, res, next) => {
    try {
        console.log(req.body)
        await schema.parseAsync({
            body: req.body,
            query: req.query,
            params: req.params,
        })
        return next();
    } catch (_error) {
        console.log(_error)
        return res.status(400).json({
            reason: "Given dataset is not valid"
        })
    }
}

module.exports = {validate}