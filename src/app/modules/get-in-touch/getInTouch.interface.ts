import { Document } from 'mongoose';

export interface IGetInTouch extends Document {
  title: string;
  officeAddress: string;
  contactNumbers: string[];
  emailAddresses: string[];
  careerInfo: string;
  createdAt: Date;
  updatedAt: Date;
}

