import { Document } from 'mongoose';

export interface IWhyChooseCard {
  icon: string; // URL
  title: string;
  items: string[]; // Array of bullet point items
}

export interface IWhyChoose extends Document {
  // Basic Details
  title: string;
  subTitle: string;

  // Cards
  card1: IWhyChooseCard;
  card2: IWhyChooseCard;
  card3: IWhyChooseCard;

  status: 'active' | 'inactive';
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

