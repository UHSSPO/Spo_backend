import { PickType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export default class LoginDto extends PickType(CreateUserDto, [
  'email',
  'pwd',
]) {}
