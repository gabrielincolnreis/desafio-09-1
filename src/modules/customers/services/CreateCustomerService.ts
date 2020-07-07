import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import Customer from '../infra/typeorm/entities/Customer';
import ICustomersRepository from '../repositories/ICustomersRepository';

interface IRequest {
  name: string;
  email: string;
}

@injectable()
class CreateCustomerService {
  constructor(
    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ name, email }: IRequest): Promise<Customer> {
    const findCustomerExists = this.customersRepository.findByEmail(email);

    if (findCustomerExists) {
      throw new AppError('Email address already used');
    }

    const createCustomer = this.customersRepository.create({
      name,
      email,
    });

    return createCustomer;
  }
}

export default CreateCustomerService;
