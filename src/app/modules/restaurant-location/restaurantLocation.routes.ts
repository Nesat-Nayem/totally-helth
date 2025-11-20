import express from 'express';
import {
  createRestaurantLocation,
  getRestaurantLocations,
  getRestaurantLocationById,
  updateRestaurantLocation,
  deleteRestaurantLocation,
} from './restaurantLocation.controller';

const router = express.Router();

router.get('/', getRestaurantLocations);
router.get('/:id', getRestaurantLocationById);
router.post('/', createRestaurantLocation);
router.patch('/:id', updateRestaurantLocation);
router.delete('/:id', deleteRestaurantLocation);

export const restaurantLocationRouter = router;

