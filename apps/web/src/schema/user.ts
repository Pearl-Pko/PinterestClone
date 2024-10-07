import { CreateUserDto, ResetPasswordDto } from "@schema/user";
import {
  IsNotEmpty,
  Validate,
  ValidateIf,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from "class-validator";

@ValidatorConstraint({ async: false })
export class MatchConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments): Promise<boolean> | boolean {
    const [relatedPropertyName] = args.constraints;
    const relatedValue = (args.object as any)[relatedPropertyName];
    return value === relatedValue;
  }

  defaultMessage(args: ValidationArguments): string {
    const [relatedPropertyName] = args.constraints;

    return `${relatedPropertyName} must match`;
  }
}

export class CreateUserDtoWithConfirmation extends CreateUserDto {
  @Validate(MatchConstraint, ["password"])
  confirmPassword: string;
}

export class ResetPasswordDtoWithConfirmation extends ResetPasswordDto {
  @Validate(MatchConstraint, ["newPassword"])
  confirmNewPassword: string;
}