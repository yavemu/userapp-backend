import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateUserDto, UpdateUserDto, UserDto } from './dtos';
import * as bcrypt from 'bcrypt';
import { User } from './users.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}
  private toUserDto(user: User): UserDto {
    const { password, ...userDto } = user;
    return userDto;
  }

  async findAll(): Promise<UserDto[]> {
    const users = await this.usersRepository.find();

    return users.map(this.toUserDto);
  }

  async findOne(id: number): Promise<UserDto | null> {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      return null;
    }
    return this.toUserDto(user);
  }

  async create(userData: CreateUserDto): Promise<UserDto> {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const newUser = this.usersRepository.create({
      ...userData,
      password: hashedPassword,
    });
    const user = await this.usersRepository.save(newUser);
    return this.toUserDto(user);
  }

  async update(id: number, userData: UpdateUserDto): Promise<UserDto | null> {
    const updateData: Partial<User> = { ...userData };

    if (userData.password) {
      updateData.password = await bcrypt.hash(userData.password, 10);
    }

    await this.usersRepository.update(id, updateData);
    const user = await this.usersRepository.findOneBy({ id });

    if (!user) {
      return null;
    }

    return this.toUserDto(user);
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
