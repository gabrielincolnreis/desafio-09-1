import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,

    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,

    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({
    customer_id,
    products,
  }: IRequest): Promise<Order | undefined> {
    const customer = await this.customersRepository.findById(customer_id);

    if (!customer) {
      throw new AppError('Customer does not exists');
    }

    const allProducts = await this.productsRepository.findAllById(products);

    if (!allProducts) {
      throw new AppError('Product does not Exists');
    }

    const productsArray = products.map(product => {
      const nameProduct = allProducts.find(
        productOne => productOne.id === product.id,
      );

      if (!nameProduct) {
        throw new AppError('Product does not Exists');
      }

      if (nameProduct.quantity < product.quantity) {
        throw new AppError('Quantity does not match');
      }

      return {
        product_id: product.id,
        price: nameProduct.price,
        quantity: product.quantity,
      };
    });

    const newValues = products.map(product => {
      const nameProduct = allProducts.find(
        productOne => productOne.id === product.id,
      );

      if (!nameProduct) {
        throw new AppError('Product does not Exists');
      }

      const newQuantity = nameProduct.quantity - product.quantity;

      return {
        id: nameProduct.id,
        quantity: newQuantity,
      };
    });

    const order = await this.ordersRepository.create({
      customer,
      products: productsArray,
    });

    await this.productsRepository.updateQuantity(newValues);

    return order;
  }
}

export default CreateOrderService;
