import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { Aggregator } from './aggregator.model';
import { aggregatorCreateValidation, aggregatorUpdateValidation } from './aggregator.validation';

export const createAggregator = async (req: Request, res: Response): Promise<void> => {
  try {
    const payload = aggregatorCreateValidation.parse(req.body);
    const exists = await Aggregator.findOne({ name: payload.name });
    if (exists) {
      res.status(400).json({ message: 'Aggregator already exists' });
      return;
    }
    const created = await Aggregator.create(payload);
    res.status(201).json({ message: 'Aggregator created', data: created });
  } catch (err: any) {
    if (err instanceof ZodError) {
      res.status(400).json({ message: err.issues?.[0]?.message || 'Validation error' });
      return;
    }
    res.status(500).json({ message: err?.message || 'Failed to create aggregator' });
  }
};

export const getAggregators = async (_req: Request, res: Response): Promise<void> => {
  try {
    const items = await Aggregator.find().sort({ createdAt: -1 });
    res.json({ data: items });
  } catch (err: any) {
    res.status(500).json({ message: err?.message || 'Failed to fetch aggregators' });
  }
};

export const getAggregatorById = async (req: Request, res: Response): Promise<void> => {
  try {
    const item = await Aggregator.findById(req.params.id);
    if (!item) {
      res.status(404).json({ message: 'Aggregator not found' });
      return;
    }
    res.json({ data: item });
  } catch (err: any) {
    res.status(500).json({ message: err?.message || 'Failed to fetch aggregator' });
  }
};

export const updateAggregator = async (req: Request, res: Response): Promise<void> => {
  try {
    const payload = aggregatorUpdateValidation.parse(req.body);
    if (payload.name) {
      const exists = await Aggregator.findOne({ name: payload.name, _id: { $ne: req.params.id } });
      if (exists) {
        res.status(400).json({ message: 'Aggregator already exists' });
        return;
      }
    }
    const updated = await Aggregator.findByIdAndUpdate(req.params.id, payload, { new: true });
    if (!updated) {
      res.status(404).json({ message: 'Aggregator not found' });
      return;
    }
    res.json({ message: 'Aggregator updated', data: updated });
  } catch (err: any) {
    if (err instanceof ZodError) {
      res.status(400).json({ message: err.issues?.[0]?.message || 'Validation error' });
      return;
    }
    res.status(500).json({ message: err?.message || 'Failed to update aggregator' });
  }
};

export const deleteAggregator = async (req: Request, res: Response): Promise<void> => {
  try {
    const deleted = await Aggregator.findByIdAndDelete(req.params.id);
    if (!deleted) {
      res.status(404).json({ message: 'Aggregator not found' });
      return;
    }
    res.json({ message: 'Aggregator deleted' });
  } catch (err: any) {
    res.status(500).json({ message: err?.message || 'Failed to delete aggregator' });
  }
};
