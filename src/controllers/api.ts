import { Application, Request, Response } from "express";
import multer from "multer";
import Datastore from "nedb-promises";
import fs from "fs";

const FILE_PATH = './files/';
const upload = multer({dest: FILE_PATH });
interface Consignment {
  _id?: string;
  filename: string;
  blindedutxo: string;
}

let ds = Datastore.create();

export const loadApiEndpoints = (app: Application): void => {
  app.get("/consignment", async (req: Request, res: Response) => {
    try {
      if (!!req.query.blindedutxo) {
        const c: Consignment | null = await ds.findOne({ blindedutxo: req.query.blindedutxo });
        if (!c) {
          return res.status(500).send({ success: false });
        }
        const file_buffer  = fs.readFileSync(FILE_PATH + c.filename);

        return res.status(200).send({
          success: true,
          consignment: file_buffer.toString('base64'),
        });
      }

      res.status(500).send({ success: false });
    } catch (error) {
      res.status(500).send({ success: false });
    }
  });

  app.post("/consignment", upload.single('consignment'), async (req: Request, res: Response) => {
    try {
      const consignment: Consignment = {
        filename: req.file?.filename || '',
        blindedutxo: req.body.blindedutxo,
      };
      await ds.insert(consignment);
      return res.status(200).send({ success: true });
    } catch (error) {
      res.status(500).send({ success: false });
    }
  });
};