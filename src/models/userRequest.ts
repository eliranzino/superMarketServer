import express from "express";

export interface userRequest extends express.Request {
  user?: any;
}