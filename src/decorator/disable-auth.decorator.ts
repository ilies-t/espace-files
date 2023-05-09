import { SetMetadata } from '@nestjs/common';
import { GeneralEnum } from '../config/general.enum';

export const DisableAuth = () => SetMetadata(GeneralEnum.DISABLE_AUTH, true);