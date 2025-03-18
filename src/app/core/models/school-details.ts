import {School} from "./school";
import {SchoolImage} from "./school-image";
import {Review} from "./review";

export interface SchoolDetails extends School {
  images: SchoolImage[];
  reviews: Review[];
}
