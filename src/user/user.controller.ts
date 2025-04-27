import {
    Controller, Get, Post, Body, Param, Put, Delete, ParseIntPipe,
  } from '@nestjs/common';
  import { UserService } from './user.service';
  
  @Controller('api/v1/users')
  export class UserController {
    constructor(private readonly userService: UserService) {}
  
    @Post()
    create(@Body() body: any) {
      return this.userService.create(body);
    }
  
    @Get()
    findAll() {
      return this.userService.findAll();
    }
  
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
      return this.userService.findOne(id);
    }
  
    @Put(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
      return this.userService.update(id, body);
    }
  
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
      return this.userService.remove(id);
    }
  }
  