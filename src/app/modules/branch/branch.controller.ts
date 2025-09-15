import { RequestHandler } from 'express';
import { Branch } from './branch.model';
import { branchCreateValidation, branchUpdateValidation } from './branch.validation';

export const createBranch: RequestHandler = async (req, res) => {
  try {
    const payload = branchCreateValidation.parse(req.body);

    const exists = await Branch.findOne({ name: payload.name });
    if (exists) {
      res.status(400).json({ success: false, statusCode: 400, message: 'Branch name already exists' });
      return;
    }

    const branch = await Branch.create(payload);
    res.status(201).json({ success: true, statusCode: 201, message: 'Branch created', data: branch });
    return;
  } catch (error: any) {
    res.status(400).json({ success: false, statusCode: 400, message: error.message });
  }
};

export const getBranches: RequestHandler = async (req, res) => {
  try {
    const branches = await Branch.find().sort({ createdAt: -1 });
    res.json({ success: true, statusCode: 200, message: 'Branches fetched', data: branches });
    return;
  } catch (error: any) {
    res.status(500).json({ success: false, statusCode: 500, message: error.message });
  }
};

export const getBranchById: RequestHandler = async (req, res) => {
  try {
    const branch = await Branch.findById(req.params.id);
    if (!branch) {
      res.status(404).json({ success: false, statusCode: 404, message: 'Branch not found' });
      return;
    }
    res.json({ success: true, statusCode: 200, message: 'Branch fetched', data: branch });
    return;
  } catch (error: any) {
    res.status(400).json({ success: false, statusCode: 400, message: error.message });
  }
};

export const updateBranch: RequestHandler = async (req, res) => {
  try {
    const payload = branchUpdateValidation.parse(req.body);
    if (payload.name) {
      const conflict = await Branch.findOne({ name: payload.name, _id: { $ne: req.params.id } });
      if (conflict) {
        res.status(400).json({ success: false, statusCode: 400, message: 'Branch name already exists' });
        return;
      }
    }
    const branch = await Branch.findByIdAndUpdate(req.params.id, payload, { new: true });
    if (!branch) {
      res.status(404).json({ success: false, statusCode: 404, message: 'Branch not found' });
      return;
    }
    res.json({ success: true, statusCode: 200, message: 'Branch updated', data: branch });
    return;
  } catch (error: any) {
    res.status(400).json({ success: false, statusCode: 400, message: error.message });
  }
};

export const deleteBranch: RequestHandler = async (req, res) => {
  try {
    const branch = await Branch.findByIdAndDelete(req.params.id);
    if (!branch) {
      res.status(404).json({ success: false, statusCode: 404, message: 'Branch not found' });
      return;
    }
    res.json({ success: true, statusCode: 200, message: 'Branch deleted' });
    return;
  } catch (error: any) {
    res.status(400).json({ success: false, statusCode: 400, message: error.message });
  }
};
