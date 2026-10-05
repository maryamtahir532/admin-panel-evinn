
export type ObjectId = string;
export type ISODate = string;

export interface ApiErrorResponse {
  message: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface Admin {
  _id: ObjectId;
  fullName: string;
  email: string;
  createdAt: ISODate;
  updatedAt: ISODate;
}

export interface Brand {
  _id: ObjectId;
  displayName: string;
  logoUrl: string;
  logoPublicId: string;
  origin: string;
  established: string;
  headquarters: string;
  about: string;
  websiteUrl: string;
  instagramUrl: string;
  twitterUrl: string;
  facebookUrl: string;
  createdAt: ISODate;
  updatedAt: ISODate;
}

export type BrandSummary = Pick<
  Brand,
  "_id" | "displayName" | "logoUrl"
>;

export type BikeType = "bike" | "scooter";

export interface BikeSpecs {
  range: string;
  topSpeed: string;
  battery: string;
  chargingTime: string;
  motorPower: string;
  weight: string;
  warranty: string;
}

export interface Bike {
  _id: ObjectId;
  name: string;
  slug: string;
  brand: BrandSummary;
  type: BikeType;
  price: number;
  rating: number;
  imageUrl: string;
  imagePublicId: string;
  specs: BikeSpecs;
  createdAt: ISODate;
  updatedAt: ISODate;
}

export interface Accessory {
  _id: ObjectId;
  name: string;
  slug: string;
  price: number;
  priceText: string;
  imageUrl: string;
  imagePublicId: string;
  description: string;
  features: string[];
  inStock: boolean;
  createdAt: ISODate;
  updatedAt: ISODate;
}

export interface SparePart {
  _id: ObjectId;
  name: string;
  slug: string;
  price: number;
  priceText: string;
  imageUrl: string;
  imagePublicId: string;
  description: string;
  features: string[];
  inStock: boolean;
  createdAt: ISODate;
  updatedAt: ISODate;
}

export interface LoginResponse {
  accessToken: string;
  admin: Admin;
}

export interface MeResponse {
  admin: Admin;
}

export interface MessageResponse {
  message: string;
}

export interface BrandListResponse {
  brands: Brand[];
}

export interface BrandResponse {
  brand: Brand;
}

export interface BikeListResponse {
  bikes: Bike[];
  pagination: Pagination;
}

export interface BikeResponse {
  bike: Bike;
}

export interface AccessoryListResponse {
  accessories: Accessory[];
  pagination: Pagination;
}

export interface AccessoryResponse {
  accessory: Accessory;
}

export interface SparePartListResponse {
  spareParts: SparePart[];
  pagination: Pagination;
}

export interface SparePartResponse {
  sparePart: SparePart;
}

export interface PageQuery {
  page?: number;
  limit?: number;
}

export interface BikeListQuery extends PageQuery {
  brand?: ObjectId;
  type?: BikeType;
}

export interface AccessoryListQuery extends PageQuery {
  inStock?: boolean;
}

export interface SparePartListQuery extends PageQuery {
  inStock?: boolean;
}

export type BrandInput = Partial<
  Pick<
    Brand,
    | "displayName"
    | "origin"
    | "established"
    | "headquarters"
    | "about"
    | "websiteUrl"
    | "instagramUrl"
    | "twitterUrl"
    | "facebookUrl"
  >
>;

export interface BikeInput {
  name?: string;
  slug?: string;
  brand?: ObjectId;
  type?: BikeType;
  price?: number;
  rating?: number;
  specs?: Partial<BikeSpecs>;
}

export interface AccessoryInput {
  name?: string;
  slug?: string;
  price?: number;
  description?: string;
  features?: string[];
  inStock?: boolean;
}

export interface SparePartInput {
  name?: string;
  slug?: string;
  price?: number;
  description?: string;
  features?: string[];
  inStock?: boolean;
}

