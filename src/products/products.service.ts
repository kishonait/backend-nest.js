import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Product, ProductDocument } from './products.schema';
import { MESSAGES } from '../common/constants/messages';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name)
    private productModel: Model<ProductDocument>,
  ) {}

  // CREATE
  async create(body: CreateProductDto, files: Express.Multer.File[]) {
    try {
      const images = files?.map((file) => file.filename);

      const product = await this.productModel.create({
        ...body,
        images,
      });

      return {
        message: MESSAGES.PRODUCT_CREATED,
        data: product,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';

      return {
        message: 'Error creating product',
        error: message,
      };
    }
  }

  // GET ALL + FILTER
  async findAll(name?: string, stock?: string, date?: string) {
    try {
      const filter: Record<string, any> = {};

      if (name) {
        filter.name = { $regex: name, $options: 'i' };
      }

      if (stock) {
        filter.stock = { $gte: Number(stock) };
      }

      if (date) {
        filter.createdAt = { $gte: new Date(date) };
      }

      const products = await this.productModel.find(filter);

      return {
        message: MESSAGES.PRODUCT_FETCHED,
        data: products,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';

      return {
        message: 'Error fetching products',
        error: message,
      };
    }
  }

  // GET ONE
  async findOne(id: string) {
    try {
      const product = await this.productModel.findById(id);

      return {
        message: 'Product fetched successfully',
        data: product,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';

      return {
        message: 'Error fetching product',
        error: message,
      };
    }
  }

  // UPDATE
  async update(
    id: string,
    body: UpdateProductDto,
    files: Express.Multer.File[],
  ) {
    try {
      const images = files?.map((file) => file.filename);

      const updateData: Partial<UpdateProductDto> & {
        images?: string[];
      } = {
        ...body,
      };

      if (images && images.length > 0) {
        updateData.images = images;
      }

      const updatedProduct = await this.productModel.findByIdAndUpdate(
        id,
        updateData,
        {
          new: true,
        },
      );

      return {
        message: MESSAGES.PRODUCT_UPDATED,
        data: updatedProduct,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';

      return {
        message: 'Error updating product',
        error: message,
      };
    }
  }

  // DELETE
  async remove(id: string) {
    try {
      await this.productModel.findByIdAndDelete(id);

      return {
        message: MESSAGES.PRODUCT_DELETED,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';

      return {
        message: 'Error deleting product',
        error: message,
      };
    }
  }
}
